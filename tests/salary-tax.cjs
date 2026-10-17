const assert=require('node:assert/strict');const {calculate}=require('../salary-tax');
const annual=(amount,extra={})=>calculate({salary:0,extra:amount,months:12,...extra});
// IRD's published 60-lakh worked example and every threshold.
for(const [income,tax] of [[0,0],[1000000,10000],[1500000,60000],[2500000,260000],[4000000,665000],[6000000,1245000]]){
 const r=annual(income);assert.equal(r.annualTax,tax);assert.equal(r.slabs.reduce((s,b)=>s+b.amount,0),income);assert.equal(r.net+r.annualTax,income);
}
assert.equal(annual(1000001).annualTax,10000.1);assert.equal(annual(4000001).annualTax,665000.29);
assert.equal(annual(1320000).annualTax,42000);
assert.equal(annual(1320000,{sstExempt:true}).annualTax,32000);
assert.equal(annual(1000000,{sstExempt:true}).annualTax,0);
assert.equal(annual(1320000,{female:true}).annualTax,37800);
assert.equal(annual(1320000,{medical:100000}).annualTax,41250);
assert.equal(annual(100,{female:true,medical:100000}).annualTax,0);
const retirement=annual(1000000,{employee:200000,employer:200000});assert.equal(retirement.assessable,1200000);assert.equal(retirement.retirement,400000);assert.equal(retirement.taxable,800000);assert.equal(retirement.net,792000);
assert.equal(annual(900000,{employee:400000}).retirement,300000);
assert.equal(annual(6000000,{employee:800000}).retirement,500000);
const relief=annual(2000000,{life:60000,health:30000,building:20000,tuition:120000,remote:50000,disability:true});assert.equal(relief.allowed,645000);assert.equal(relief.taxable,1355000);
assert.equal(annual(1000000,{tuition:40000}).deductions.find(d=>d.label==='Child tuition allowance').amount,10000);
assert.equal(annual(500000,{life:40000,disability:true}).annualTax,0);
assert.equal(calculate({salary:110000,months:10}).cash,1100000);
assert.equal(calculate({salary:110000,months:10}).monthlyTax,2000);
for(const values of [{salary:-1},{salary:Infinity},{months:0},{months:13},{months:1.5},{remote:90000},{employee:1,salary:0},{year:'2084/85'}])assert.throws(()=>calculate(values));
// Deterministic range checks around every band, with and without the exemption.
for(const exempt of [false,true])for(let income=0;income<=7000000;income+=10000){const r=annual(income,{sstExempt:exempt});assert.ok(r.annualTax>=0);assert.equal(r.annualTax,Math.round(r.slabs.reduce((s,b)=>s+b.tax,0)*100)/100);assert.equal(r.net,income-r.annualTax)}
console.log('PASS: official worked example, band thresholds, SSF switch, caps, relief, part-year averages and invalid inputs.');
