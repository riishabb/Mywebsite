/* Nepal resident employment income: IRD FY 2083/84 published rate table. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.NepalSalaryTax=api;api.mount()}})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const YEAR='2083/84';
  const BANDS=[[1000000,.01],[1500000,.10],[2500000,.20],[4000000,.27],[Infinity,.29]];
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  const money=n=>'NPR '+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  function calculate(input){
    const n=(key,fallback=0)=>{const raw=input[key]??fallback,value=Number(raw);if(!Number.isFinite(value)||value<0||value>1e12)throw Error('Enter valid, non-negative amounts (up to NPR 1 trillion).');return value};
    if(input.year&&input.year!==YEAR)throw Error('Only FY 2083/84 is supported.');
    const months=n('months',12);if(!Number.isInteger(months)||months<1||months>12)throw Error('Salary months must be a whole number from 1 to 12.');
    const cash=round(n('salary')*months+n('extra')),employee=n('employee'),employer=n('employer'),assessable=round(cash+employer);
    if(employee>cash)throw Error('Employee retirement contributions cannot exceed annual cash salary in this calculator.');
    const retirement=round(Math.min(employee+employer,500000,assessable/3));
    const life=Math.min(n('life'),40000),health=Math.min(n('health'),20000),building=Math.min(n('building'),10000),tuition=Math.min(n('tuition')*.25,25000);
    const remote=n('remote');if(![0,10000,20000,30000,40000,50000].includes(remote))throw Error('Choose a valid remote-area category.');
    const disability=input.disability===true?500000:0;
    const deductions=[['Approved retirement contributions',retirement],['Life / investment insurance',life],['Health insurance',health],['Private-building insurance',building],['Child tuition allowance',tuition],['Remote-area allowance',remote],['Disability allowance',disability]].map(([label,amount])=>({label,amount:round(amount)}));
    const allowed=round(deductions.reduce((sum,d)=>sum+d.amount,0)),taxable=round(Math.max(0,assessable-allowed));
    let lower=0;const slabs=BANDS.map(([upper,rate],i)=>{const amount=round(Math.max(0,Math.min(taxable,upper)-lower)),applied=i===0&&input.sstExempt===true?0:rate,row={from:lower,to:Number.isFinite(upper)?upper:null,rate:applied,amount,tax:round(amount*applied)};lower=upper;return row});
    const beforeRebate=round(slabs.reduce((s,r)=>s+r.tax,0)),female=round(input.female===true?beforeRebate*.1:0),afterRebate=round(beforeRebate-female);
    const medical=round(Math.min(n('medical')*.15,750,afterRebate)),annualTax=round(Math.max(0,afterRebate-medical)),net=round(cash-employee-annualTax);
    return {year:YEAR,months,cash,employee,employer,assessable,retirement,deductions,allowed,taxable,slabs,beforeRebate,female,medical,annualTax,monthlyTax:round(annualTax/months),net,monthlyNet:round(net/months),effective:cash?annualTax/cash*100:0,unusedRetirement:round(employee+employer-retirement)};
  }
  function mount(){
    if(typeof document==='undefined')return;
    const host=document.querySelector('[data-salary-tax]');if(!host)return;
    const field=(label,name,value='0',help='',extra='')=>`<div class="field"><label for="salary-${name}">${label}</label><input type="number" id="salary-${name}" name="${name}" value="${value}" min="0" max="1000000000000" step="0.01" required ${extra}>${help?`<small>${help}</small>`:''}</div>`;
    const checkbox=(label,name,help)=>`<div class="field salary-check"><label><input type="checkbox" name="${name}"> ${label}</label><small>${help}</small></div>`;
    host.innerHTML=`<div class="tool-layout"><section class="tool-panel"><h2>Your salary</h2><p class="tool-note">Nepal resident employees · FY ${YEAR} (2026/27) · amounts in NPR. Single and couple rates are the same for this year.</p><form id="salary-form" class="tool-form">
      ${field('Monthly gross cash salary','salary','100000','Include basic pay and regular cash allowances, before deductions.')}
      <div class="field"><label for="salary-months">Salary months in this fiscal year</label><input type="number" id="salary-months" name="months" min="1" max="12" step="1" value="12" required><small>Enter the complete year’s actual or expected earnings. Tax bands are annual and are not prorated.</small></div>
      ${field('Bonus, overtime and other extra cash pay — annual','extra','0','Add festival allowance and leave encashment here if not already in monthly salary.')}
      ${field('Employee approved retirement contributions — annual','employee','0','Actual employee payments to approved SSF, PF, CIT and other approved retirement funds combined.')}
      ${field('Employer approved retirement contributions — annual','employer','0','Added to assessable employment income and included in the retirement deduction. Do not include it twice in cash salary.')}
      ${checkbox('Apply eligible first-band SST exemption','sstExempt','Select only if the employment income qualifies through SSF / a qualifying pension-fund scheme. PF or CIT deposits alone do not automatically establish eligibility. For partial-year enrolment, confirm the treatment with payroll; this calculator does not prorate the exemption.')}
      <details><summary>Insurance, allowances and tax relief</summary><div class="tool-form">
      ${field('Life / investment insurance premium — annual','life','0','Deduction capped at NPR 40,000.')}
      ${field('Eligible health insurance premium — annual','health','0','Resident insurer; deduction capped at NPR 20,000.')}
      ${field('Own private-building insurance premium — annual','building','0','Resident insurer; deduction capped at NPR 10,000.')}
      ${field('Eligible child tuition fees — annual','tuition','0','Fees paid to a resident education provider: 25% deduction, capped at NPR 25,000.')}
      <div class="field"><label for="salary-remote">Eligible remote-area category</label><select id="salary-remote" name="remote"><option value="0">Not applicable</option><option value="50000">Ka / A — NPR 50,000</option><option value="40000">Kha / B — NPR 40,000</option><option value="30000">Ga / C — NPR 30,000</option><option value="20000">Gha / D — NPR 20,000</option><option value="10000">Nga / E — NPR 10,000</option></select><small>Select only the government-designated category applicable to your employment.</small></div>
      ${checkbox('Eligible woman earning employment income only','female','Applies the 10% tax rebate. Leave unchecked if you earn other assessable sources of income.')}
      ${checkbox('Eligible disability allowance','disability','Additional deduction of 50% of the first-band limit (NPR 500,000). Eligibility must be established.')}
      ${field('Eligible approved medical treatment expenses — annual','medical','0','Tax credit of 15%, capped at NPR 750 and the tax remaining. Unused prior-year credits are not included.')}
      </div></details>
      <div class="tool-actions"><button type="submit">Calculate salary tax</button><button type="reset" class="secondary">Reset</button><button type="button" class="secondary" id="salary-print">Print</button><button type="button" class="secondary" id="salary-csv" disabled>Download working</button></div></form><p class="tool-error" id="salary-error" role="alert"></p></section>
      <section class="tool-panel"><h2>Your estimate</h2><div class="result-box" id="salary-results" aria-live="polite"><h3>Enter your salary details</h3><p>Calculate to see annual tax and average take-home pay.</p></div></section></div>
      <section class="working"><h2>How the tax is calculated</h2><div id="salary-working"><p class="tool-note">Your income, deductions and tax bands will appear here.</p></div></section>`;
    const form=host.querySelector('form'),results=host.querySelector('#salary-results'),working=host.querySelector('#salary-working'),error=host.querySelector('#salary-error'),csv=host.querySelector('#salary-csv');let current=null;
    const table=(head,rows)=>`<div class="table-scroll"><table class="tool-table"><thead><tr>${head.map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(s=>`<td>${s}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const bandLabel=r=>r.to===null?`Above ${money(r.from)}`:`${money(r.from)} – ${money(r.to)}`;
    form.addEventListener('submit',event=>{event.preventDefault();try{
      const values=Object.fromEntries(new FormData(form));['sstExempt','female','disability'].forEach(k=>values[k]=values[k]==='on');const r=calculate(values);current=r;error.textContent='';csv.disabled=false;
      const metrics=[['Annual income tax',money(r.annualTax)],['Average monthly tax',money(r.monthlyTax)],['Average monthly cash after tax & retirement',money(r.monthlyNet)],['Annual taxable income',money(r.taxable)],['Annual cash after tax & retirement',money(r.net)],['Tax / gross cash earnings',r.effective.toFixed(2)+'%']];
      results.innerHTML=`<h3>FY ${YEAR} estimate</h3><div class="result-grid">${metrics.map(([label,value])=>`<div class="result-item"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><p class="tool-note">Monthly figures are averages across ${r.months} salary months, including any annual extra pay. They are not a month-specific payroll TDS schedule. Cash after tax excludes employer contributions and does not subtract personal insurance, tuition or medical spending.</p>${r.unusedRetirement>0?`<p class="tool-note">${money(r.unusedRetirement)} of retirement contributions exceeds the deduction limit.</p>`:''}${r.net<0?'<p class="tool-note">The estimate is negative: tax and employee retirement payments exceed cash earnings. Review employer benefits and contributions.</p>':''}`;
      working.innerHTML='<h3>Income and deductions</h3>'+table(['Item','Annual amount'],[['Gross cash salary and extra pay',money(r.cash)],['Employer retirement contribution',money(r.employer)],['Assessable employment income',money(r.assessable)],...r.deductions.filter(d=>d.amount>0).map(d=>[d.label+' — deduction',money(d.amount)]),['Taxable income (minimum zero)',money(r.taxable)]])+'<h3>Tax by band</h3>'+table(['Annual taxable-income band','Rate','Income in band','Tax'],r.slabs.map(s=>[bandLabel(s),(s.rate*100).toFixed(0)+'%',money(s.amount),money(s.tax)]))+'<h3>Final tax</h3>'+table(['Item','Annual amount'],[['Tax before relief',money(r.beforeRebate)],['Eligible women’s rebate',money(-r.female)],['Medical tax credit used',money(-r.medical)],['Annual income tax',money(r.annualTax)]]);
    }catch(e){error.textContent=e.message;current=null;csv.disabled=true;results.innerHTML='<p>Correct the inputs and calculate again.</p>';working.replaceChildren()}});
    form.addEventListener('input',()=>{if(current){current=null;csv.disabled=true;results.innerHTML='<p>Inputs changed. Calculate again to refresh your estimate.</p>';working.replaceChildren()}});
    form.addEventListener('reset',()=>{current=null;csv.disabled=true;error.textContent='';results.innerHTML='<h3>Enter your salary details</h3><p>Calculate to see your estimate.</p>';working.innerHTML='<p>Calculate to generate the working.</p>'});
    host.querySelector('#salary-print').addEventListener('click',()=>window.print());
    csv.addEventListener('click',()=>{if(!current)return;const r=current,rows=[['Fiscal year',r.year],['Gross cash earnings',r.cash],['Employer retirement contributions',r.employer],['Assessable income',r.assessable],...r.deductions.map(d=>[d.label,d.amount]),['Taxable income',r.taxable],...r.slabs.map(s=>[bandLabel(s)+' at '+(s.rate*100)+'%',s.tax]),['Tax before relief',r.beforeRebate],['Women rebate',r.female],['Medical credit',r.medical],['Annual income tax',r.annualTax],['Average monthly tax',r.monthlyTax],['Annual cash after tax and employee retirement',r.net],['Average monthly cash after tax and employee retirement',r.monthlyNet]],text='Item,Amount\n'+rows.map(row=>row.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='nepal-salary-tax-2083-84.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
  }
  return {calculate,mount,YEAR};
});
