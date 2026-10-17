/* PDF -> editable Office documents. OCR assets are downloaded, documents are not. */
const OfficeConverter=(()=>{
  let worker=null,ocrScript=null,rejectCancel=null;
  const get=id=>panel.querySelector('#'+id);
  function settings(id){return `<div class="settings-grid">
    <div class="field"><label for="office-pages">Pages to convert</label><input id="office-pages" placeholder="All pages, or 1-3, 5"><small>Leave empty for all pages. Up to 100 selected pages per conversion.</small></div>
    <div class="field"><label for="office-source">Text recognition</label><select id="office-source"><option value="auto">Automatic — OCR pages with little or unreadable text</option><option value="ocr">OCR every page (scanned / mixed content)</option><option value="text">Use embedded text only (fast)</option></select></div>
    <div class="field"><label for="office-language">Scan language</label><select id="office-language"><option value="eng">English</option><option value="eng+nep">Nepali + English</option><option value="eng+hin">Hindi + English</option></select><small>OCR engine and language data download on first use; your document stays on this device.</small></div>
    ${id==='pdf-to-word'?'<div class="field"><label for="office-layout">Word layout</label><select id="office-layout"><option value="flow">Editable text (paragraphs / lines)</option><option value="table">Editable tables (for tabular pages)</option></select></div>':''}
    <div class="field"><label for="office-gap">Space between columns (points)</label><input id="office-gap" type="number" min="4" max="72" value="12"><small>Lower this if adjacent columns are joining together.</small></div>
    <div class="field"><label for="office-columns">Column boundaries (optional)</label><input id="office-columns" placeholder="e.g. 40, 70, 85"><small>Positions as percentages of page width, from left to right. Override automatic detection; apply to every page.</small></div>
    ${id==='pdf-to-excel'?'<div class="field"><label><input id="office-numbers" type="checkbox" checked> Convert clear numeric amounts to Excel numbers</label><small>IDs with leading zeros, dates and ambiguous values remain text.</small></div>':''}
    </div><p class="tool-note">Preview and edit the extracted ${id==='pdf-to-excel'?'cells':'text'} before downloading a real ${id==='pdf-to-excel'?'XLSX workbook (one worksheet per page)':'DOCX document'}. Text, tables and basic emphasis are reconstructed. Images, signatures, exact spacing and complex layouts are not retained. OCR can misread figures; compare important values with the original.</p><p id="office-status" role="status"></p>`}
  function status(text){const el=get('office-status');if(el)el.textContent=text}
  function boundaries(){const raw=get('office-columns').value.trim();if(!raw)return [];
    const parts=raw.split(',').map(s=>s.trim());
    if(parts.some(s=>!/^\d+(?:\.\d+)?$/.test(s)))throw new Error('Column boundaries must be percentages such as 40, 70, 85.');
    const values=parts.map(Number);
    if(values.length>49||values.some((n,i)=>n<=0||n>=100||(i&&n<=values[i-1])))throw new Error('Column boundaries must increase from left to right and be between 0 and 100.');return values;
  }
  function loadOcr(){
    if(window.Tesseract)return Promise.resolve();
    if(!ocrScript)ocrScript=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='/vendor/tesseract-6.0.1.min.js';script.onload=resolve;script.onerror=()=>{script.remove();ocrScript=null;reject(new Error('The OCR engine could not load. Check your connection and retry.'))};document.head.append(script);
    });return ocrScript;
  }
  function nativeWords(content,viewport){
    const words=[];
    for(const item of content.items){
      if(!item.str?.trim())continue;
      const matrix=pdfjsLib.Util.transform(viewport.transform,item.transform),height=Math.hypot(matrix[2],matrix[3])||item.height||11;
      const style=content.styles[item.fontName],bold=/bold|black|heavy/i.test((style?.fontFamily||'')+' '+item.fontName);
      // PDF.js can place an entire table row in one string. Split wide whitespace
      // while retaining approximate positions; ordinary word spacing is preserved.
      const pieces=item.str.split(/(\s{2,}|\t)/),unit=Math.abs(item.width*viewport.scale)/Math.max(1,item.str.length);let offset=0;
      for(const text of pieces){if(text.trim())words.push({text:text.trim(),x:matrix[4]+offset*unit,y:matrix[5]-height,w:text.length*unit,h:height,bold});offset+=text.length}
    }return words;
  }
  function ocrWords(data,scale){
    const words=[];
    for(const block of data.blocks||[])for(const para of block.paragraphs||[])for(const line of para.lines||[])for(const w of line.words||[]){
      if(w.text?.trim()&&w.bbox)words.push({text:w.text,x:w.bbox.x0/scale,y:w.bbox.y0/scale,w:(w.bbox.x1-w.bbox.x0)/scale,h:(w.bbox.y1-w.bbox.y0)/scale,bold:false,confidence:w.confidence});
    }return words;
  }
  async function canvasFor(page,scale){
    const base=page.getViewport({scale:1});scale=Math.min(scale,Math.sqrt(14000000/(base.width*base.height)));
    const viewport=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    try{await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise;return {canvas,scale}}catch(error){canvas.width=canvas.height=1;throw error}
  }
  function rebuild(pages,id){
    const manual=boundaries(),gap=Number(get('office-gap').value);
    if(!Number.isFinite(gap)||gap<4||gap>72)throw new Error('Column spacing must be between 4 and 72 points.');
    const table=id==='pdf-to-excel'||get('office-layout')?.value==='table';
    for(const page of pages){page.lines=PdfOffice.linesFromWords(page.words,gap);const result=table?PdfOffice.tableFromLines(page.lines,page.width,manual):{rows:page.lines.map(l=>[l.text]),boundaries:[]};page.rows=result.rows.length?result.rows:[['']];page.boundaries=result.boundaries}
  }
  async function convert(id){
    clearUrls();boundaries();
    const file=state.files[0].file;if(file.size>50*1024*1024)throw new Error('Use a PDF smaller than 50 MB. Split larger documents first.');
    const mode=get('office-source').value,language=get('office-language').value,pages=[];
    let pdf,aborted=false;
    const cancelled=new Promise((_,reject)=>{rejectCancel=error=>{aborted=true;reject(error)}});
    // Attach a handler immediately, including when cancelling between OCR calls.
    cancelled.catch(()=>{});
    const cancellable=promise=>Promise.race([promise,cancelled]);
    try{
      pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
      const range=get('office-pages').value.trim(),selected=range?[...new Set(parsePages(range,pdf.numPages))]:Array.from({length:pdf.numPages},(_,i)=>i);
      if(selected.length>100)throw new Error('Select up to 100 pages at a time. Use the page selection above.');
      for(let index=0;index<selected.length;index++){
        checkCancelled();const number=selected[index]+1;status(`Reading page ${number} (${index+1} of ${selected.length})…`);
        const page=await pdf.getPage(number),viewport=page.getViewport({scale:1});
        try{
          const content=await page.getTextContent(),native=nativeWords(content,viewport),text=native.map(w=>w.text).join('');
          const suspicious=(text.match(/[\ufffd\u0000-\u0008]/g)||[]).length>Math.max(1,text.length*.03);
          const useOcr=mode==='ocr'||(mode==='auto'&&(text.trim().length<40||suspicious));
          let words=native,confidence=null;
          if(useOcr){
            status(`Loading OCR for page ${number}…`);await cancellable(loadOcr());checkCancelled();
            if(!worker){
              try{const pending=Tesseract.createWorker(language,1,{workerPath:'/vendor/tesseract-worker-6.0.1.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',logger:m=>{if(!state.cancelled)status(`OCR · ${m.status}${typeof m.progress==='number'?` ${Math.round(m.progress*100)}%`:''}`)}});pending.then(created=>{if(aborted)created.terminate().catch(()=>{})},()=>{});worker=await cancellable(pending)}
              catch(error){throw new Error('OCR could not start. Allow the OCR engine/language download and retry. '+String(error.message||error).slice(0,100))}
            }
            checkCancelled();const {canvas,scale}=await canvasFor(page,3);
            try{const {data}=await cancellable(worker.recognize(canvas,{}, {blocks:true,text:true}));words=ocrWords(data,scale);confidence=data.confidence;checkCancelled()}
            finally{canvas.width=canvas.height=1}
          }
          checkCancelled();
          const {canvas}=await canvasFor(page,Math.min(1,600/viewport.width));
          let thumbnail;
          try{const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.75));if(blob)thumbnail=blobUrl(blob)}finally{canvas.width=canvas.height=1}
          pages.push({number,width:viewport.width,height:viewport.height,words,source:useOcr?'OCR':'Embedded text',confidence,thumbnail});
          progress((index+1)/selected.length*95);await yieldFrame();
        }finally{page.cleanup()}
      }
      checkCancelled();rebuild(pages,id);showPreview(pages,id,file.name);progress(100);status('Preview ready. Check and edit the result, then download.');
    }finally{rejectCancel=null;if(worker){await worker.terminate().catch(()=>{});worker=null}if(pdf)await pdf.destroy()}
  }
  function showPreview(pages,id,name){
    const result=get('operation-result');result.innerHTML=`<div class="result-summary office-result"><h3>Review your conversion</h3><p>${pages.length} page${pages.length===1?'':'s'} extracted. Edits on each page are included in the download. Rebuilding columns replaces preview edits.</p><div class="tool-actions"><button type="button" class="secondary" id="office-rebuild">Rebuild columns from settings</button><button type="button" id="office-export">Create ${id==='pdf-to-excel'?'Excel':'Word'} download</button></div><div id="office-download" role="status"></div><div class="field"><label for="office-preview-page">Preview page</label><select id="office-preview-page">${pages.map((p,i)=>`<option value="${i}">Page ${p.number} · ${p.source}${p.confidence!==null?` · confidence ${Math.round(p.confidence)}%`:''}</option>`).join('')}</select></div><p id="office-page-note"></p><div class="office-preview"><figure><img id="office-original" alt="Original PDF page"><figcaption>Original page</figcaption></figure><div class="office-edit-wrap" id="office-editor"></div></div></div>`;
    let outputUrl=null,revision=0;
    const invalidate=()=>{revision++;get('office-download').replaceChildren();if(outputUrl){URL.revokeObjectURL(outputUrl);state.urls=state.urls.filter(u=>u!==outputUrl);outputUrl=null}};
    function render(){
      const p=pages[Number(get('office-preview-page').value)],editor=get('office-editor');editor.replaceChildren();get('office-original').src=p.thumbnail||'';
      const notes=[`${p.source}${p.confidence!==null?` · OCR confidence ${Math.round(p.confidence)}% (not a guarantee of accuracy)`:''}.`];
      if(!p.words.length)notes.push('No text found. This page is included as blank; try OCR or check the scan.');
      if(id==='pdf-to-excel'&&p.rows.every(r=>r.length===1))notes.push('No columns detected. Set column boundaries above and rebuild if this page contains a table.');
      if(p.confidence!==null&&p.confidence<80)notes.push('Low OCR confidence: review the text and figures carefully.');
      get('office-page-note').textContent=notes.join(' ');
      if(id==='pdf-to-word'&&p.rows.every(r=>r.length===1)){
        const label=document.createElement('label');label.htmlFor='office-edit-text';label.textContent='Editable text';const area=document.createElement('textarea');area.id='office-edit-text';area.rows=22;area.value=p.rows.map(r=>r[0]).join('\n');area.addEventListener('input',()=>{p.rows=area.value.split('\n').map(s=>[s]);invalidate()});editor.append(label,area);
      }else{
        const table=document.createElement('table');table.className='office-grid';const caption=document.createElement('caption');caption.textContent='Editable cells — click a value to correct it';table.append(caption);
        const body=document.createElement('tbody');p.rows.forEach((row,r)=>{const tr=document.createElement('tr');row.forEach((text,c)=>{const td=document.createElement('td'),input=document.createElement('textarea');input.rows=2;input.value=text;input.setAttribute('aria-label',`Page ${p.number}, row ${r+1}, column ${c+1}`);input.addEventListener('input',()=>{p.rows[r][c]=input.value;invalidate()});td.append(input);tr.append(td)});body.append(tr)});table.append(body);editor.append(table);
      }
    }
    get('office-preview-page').addEventListener('change',render);
    get('office-numbers')?.addEventListener('change',invalidate);
    get('office-rebuild').addEventListener('click',()=>{try{rebuild(pages,id);invalidate();render();showError('')}catch(e){showError(e.message)}});
    get('office-export').addEventListener('click',async()=>{
      const button=get('office-export');button.disabled=true;
      try{
        showError('');invalidate();const exportRevision=revision;const blob=id==='pdf-to-excel'?await PdfOffice.xlsx(JSZip,pages,get('office-numbers').checked):await PdfOffice.docx(JSZip,pages);
        if(!result.isConnected||revision!==exportRevision)return;
        const ext=id==='pdf-to-excel'?'xlsx':'docx',filename=safeName(name.replace(/\.pdf$/i,''))+'.'+ext;
        outputUrl=blobUrl(blob);const link=document.createElement('a');link.className='tool-button';link.href=outputUrl;link.download=filename;link.textContent=`Download ${filename}`;get('office-download').append(link);
      }catch(e){showError(friendlyError(e))}finally{button.disabled=false}
    });render();
  }
  async function cancel(){rejectCancel?.(new Error('Operation cancelled.'));if(worker){const active=worker;worker=null;await active.terminate().catch(()=>{})}}
  return {settings,convert,cancel,nativeWords,ocrWords};
})();
