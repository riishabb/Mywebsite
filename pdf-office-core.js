/* Coordinate reconstruction and genuine Office Open XML export. No uploads. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PdfOffice=api})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const xml=s=>String(s??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const median=a=>a.length?[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)]:11;
  function linesFromWords(words,gap=12){
    const lines=[];
    for(const word of words.filter(w=>w.text?.trim()).sort((a,b)=>a.y-b.y||a.x-b.x)){
      let line=lines.find(l=>Math.abs((l.y+l.h/2)-(word.y+word.h/2))<=Math.max(2,Math.max(l.h,word.h)*.45));
      if(!line){line={y:word.y,h:word.h,words:[]};lines.push(line)}
      line.words.push(word);
    }
    return lines.sort((a,b)=>a.y-b.y).map(l=>{
      const segments=[];let last;
      for(const w of l.words.sort((a,b)=>a.x-b.x)){
        if(last&&w.x-last.right<gap){last.text+=(w.x-last.right>1?' ':'')+w.text;last.right=Math.max(last.right,w.x+w.w)}
        else{last={text:w.text,x:w.x,right:w.x+w.w};segments.push(last)}
      }
      return {...l,segments,text:segments.map(s=>s.text).join('    '),size:median(l.words.map(w=>w.h)),bold:l.words.filter(w=>w.bold).length>l.words.length/2};
    });
  }
  function tableFromLines(lines,width,manual=[]){
    let boundaries=manual.map(p=>p*width/100);
    if(!boundaries.length){
      const rows=lines.filter(l=>l.segments.length>1),candidates=[];
      if(rows.length>=2){
        let start=null;
        for(let x=0;x<=Math.ceil(width);x++){
          const votes=rows.filter(l=>l.segments.some((s,i)=>i>0&&x>l.segments[i-1].right+2&&x<s.x-2)).length;
          const qualifies=votes>=Math.max(2,Math.ceil(rows.length*.6));
          if(qualifies&&start===null)start=x;
          if(!qualifies&&start!==null){if(x-start>=5)candidates.push((start+x)/2);start=null}
        }
      }
      boundaries=candidates.slice(0,49);
    }
    const rows=lines.map(l=>{
      const row=Array(boundaries.length+1).fill('');
      for(const segment of l.segments){
        const col=boundaries.filter(b=>segment.x>=b).length;
        row[col]+=(row[col]?' ':'')+segment.text;
      }
      return row;
    });
    return {rows,boundaries};
  }
  // Convert only unambiguous numbers. IDs, leading zeros, dates, percentages and
  // strings beginning with '=' stay strings; document text never becomes a formula.
  function numberValue(text){
    let s=String(text).trim(),negative=/^\(.*\)$/.test(s);if(negative)s=s.slice(1,-1);
    if(!/^-?(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d+)?$/.test(s))return null;
    if(s.replace(/[^0-9]/g,'').length>15)return null;
    const n=Number(s.replace(/,/g,''));return Number.isFinite(n)?(negative?-Math.abs(n):n):null;
  }
  const declaration='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const office='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const packageNs='http://schemas.openxmlformats.org/package/2006/relationships';
  const contentNs='http://schemas.openxmlformats.org/package/2006/content-types';
  function baseZip(Zip,type,part){
    const zip=new Zip();
    zip.file('_rels/.rels',declaration+`<Relationships xmlns="${packageNs}"><Relationship Id="rId1" Type="${office}/officeDocument" Target="${part}"/></Relationships>`);
    zip.file('[Content_Types].xml',declaration+`<Types xmlns="${contentNs}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/${part}" ContentType="application/vnd.openxmlformats-officedocument.${type}.main+xml"/></Types>`);
    return zip;
  }
  function colName(n){let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s}
  async function xlsx(Zip,pages,numeric=true,output='blob'){
    const zip=baseZip(Zip,'spreadsheetml.sheet','xl/workbook.xml');
    let types=await zip.file('[Content_Types].xml').async('string');
    const sheets=[],rels=[];
    pages.forEach((page,i)=>{
      const name=`Page ${page.number}`,id=i+1;
      sheets.push(`<sheet name="${name}" sheetId="${id}" r:id="rId${id}"/>`);
      rels.push(`<Relationship Id="rId${id}" Type="${office}/worksheet" Target="worksheets/sheet${id}.xml"/>`);
      types=types.replace('</Types>',`<Override PartName="/xl/worksheets/sheet${id}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`);
      const count=Math.max(1,...page.rows.map(r=>r.length));
      const cols=Array.from({length:count},(_,c)=>{const longest=Math.max(8,...page.rows.map(r=>String(r[c]||'').length));return `<col min="${c+1}" max="${c+1}" width="${Math.min(60,longest+2)}" customWidth="1"/>`}).join('');
      const rows=page.rows.map((row,r)=>`<row r="${r+1}">${row.map((text,c)=>{const value=numeric?numberValue(text):null,ref=colName(c)+(r+1);return value===null?`<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(text)}</t></is></c>`:`<c r="${ref}"><v>${value}</v></c>`}).join('')}</row>`).join('');
      zip.file(`xl/worksheets/sheet${id}.xml`,declaration+`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><cols>${cols}</cols><sheetData>${rows}</sheetData></worksheet>`);
    });
    zip.file('[Content_Types].xml',types);
    zip.file('xl/workbook.xml',declaration+`<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${office}"><sheets>${sheets.join('')}</sheets></workbook>`);
    zip.file('xl/_rels/workbook.xml.rels',declaration+`<Relationships xmlns="${packageNs}">${rels.join('')}</Relationships>`);
    return zip.generateAsync({type:output,mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE'});
  }
  function paragraph(text,size=11,bold=false){return `<w:p><w:pPr><w:spacing w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Nirmala UI"/><w:sz w:val="${Math.round(Math.max(8,Math.min(36,size))*2)}"/>${bold?'<w:b/>':''}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`}
  async function docx(Zip,pages,output='blob'){
    const zip=baseZip(Zip,'wordprocessingml.document','word/document.xml');
    const sections=pages.map((p,i)=>{
      const table=p.rows.some(r=>r.length>1);
      let body;
      if(table){
        const count=Math.max(...p.rows.map(r=>r.length)),width=Math.round(Math.max(100,p.width-60)*20/count);
        body=`<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${['top','left','bottom','right','insideH','insideV'].map(x=>`<w:${x} w:val="single" w:sz="4" w:color="CCCCCC"/>`).join('')}</w:tblBorders></w:tblPr><w:tblGrid>${Array(count).fill(`<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid>${p.rows.map(row=>`<w:tr>${Array.from({length:count},(_,c)=>`<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>${paragraph(row[c]||'')}</w:tc>`).join('')}</w:tr>`).join('')}</w:tbl><w:p/>`;
      }else body=p.rows.map((r,j)=>paragraph(r.join(' '),p.lines[j]?.size||11,p.lines[j]?.bold)).join('');
      const section=`<w:sectPr>${i<pages.length-1?'<w:type w:val="nextPage"/>':''}<w:pgSz w:w="${Math.round(p.width*20)}" w:h="${Math.round(p.height*20)}"${p.width>p.height?' w:orient="landscape"':''}/><w:pgMar w:top="600" w:right="600" w:bottom="600" w:left="600" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`;
      return body+(i<pages.length-1?`<w:p><w:pPr>${section}</w:pPr></w:p>`:section);
    }).join('');
    zip.file('word/document.xml',declaration+`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${sections}</w:body></w:document>`);
    return zip.generateAsync({type:output,mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'});
  }
  return {xml,linesFromWords,tableFromLines,numberValue,colName,xlsx,docx};
});
