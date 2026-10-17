const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../document-tools.js'),'utf8').replace(/setTool\(new URL\(location\.href\)[\s\S]*$/,'');
const controls={'#quality':{value:'100'},'#resolution':{},'#remove-metadata':{},'#operation-result':{innerHTML:''},'.operation-progress':null};
const panel={querySelector:s=>controls[s]};let savedBlob=null;
const c={window:{},document:{querySelector:s=>s==='#document-panel'?panel:{}},URL:{createObjectURL:blob=>{savedBlob=blob;return 'blob:test'},revokeObjectURL(){}},console};vm.createContext(c);
vm.runInContext(source+';globalThis.api={settingsMarkup,updateQualitySlider,compressPdf,syncImageQuality,state};',c);
for(const id of ['image-to-pdf','pdf-to-jpg','pdf-compress','image-compress']){
 const markup=c.api.settingsMarkup(id);assert.match(markup,/type="range"[^>]*max="100"/);assert.ok(!markup.includes('max="95"'));
}
const label={tagName:'SMALL',textContent:''};const slider={min:'30',max:'100',value:'100',nextElementSibling:label,style:{setProperty:(k,v)=>{slider[k]=v}},setAttribute:(k,v)=>{slider[k]=v},dataset:{}};
c.api.state.tool={id:'pdf-compress'};c.api.updateQualitySlider(slider);assert.equal(slider['--range-fill'],'100%');assert.equal(controls['#resolution'].disabled,true);assert.match(label.textContent,/preserve original/);
slider.value='30';c.api.updateQualitySlider(slider);assert.equal(slider['--range-fill'],'0%');assert.equal(controls['#resolution'].disabled,false);
slider.value='65';c.api.updateQualitySlider(slider);assert.equal(slider['--range-fill'],'50%');
c.api.state.tool={id:'image-compress'};controls['#quality']=slider;controls['#output-format']={value:'image/png'};slider.value='80';c.api.syncImageQuality();assert.equal(slider.value,'100');assert.equal(slider.disabled,true);assert.equal(slider['--range-fill'],'100%');
controls['#output-format'].value='image/jpeg';c.api.syncImageQuality();assert.equal(slider.value,'80');assert.equal(slider.disabled,false);
(async()=>{const file={name:'original.pdf',size:123};c.api.state.files=[{file}];c.api.state.cancelled=false;controls['#quality'].value='100';await c.api.compressPdf();assert.equal(savedBlob,file);assert.match(controls['#operation-result'].innerHTML,/Original PDF unchanged/);console.log('PASS: every quality slider reaches 100, full-track fill, PNG mode, and exact original-PDF preservation.');})().catch(e=>{console.error(e);process.exitCode=1});
