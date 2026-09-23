const path = window.location.pathname;
const TOOL_NAV_CONFIG = [
  {name:'EMI Calculator',category:'Calculation Tools',url:'/tools/emi-calculator/',standard:'General'},
  {name:'Lease Calculator',category:'Calculation Tools',url:'/tools/lease-calculator/',standard:'NFRS 16'},
  {name:'Effective Interest Rate Calculator',category:'Calculation Tools',url:'/tools/eir-calculator/',standard:'NFRS 9'},
  {name:'EPS Calculator',category:'Calculation Tools',url:'/tools/eps-calculator/',standard:'NAS 33'},
  {name:'Borrowing Cost Calculator',category:'Calculation Tools',url:'/tools/borrowing-cost-calculator/',standard:'NAS 23'},
  {name:'Defined Benefit Obligation Calculator',category:'Calculation Tools',url:'/tools/defined-benefit-calculator/',standard:'NAS 19'},
  {name:'Lease Identification',category:'Decision-Making Tools',url:'/tools/decision-tools/lease-identification/',standard:'NFRS 16'},
  {name:'Financial Asset Classification',category:'Decision-Making Tools',url:'/tools/decision-tools/financial-asset-classification/',standard:'NFRS 9'},
  {name:'Impairment Indicator Assessment',category:'Decision-Making Tools',url:'/tools/decision-tools/impairment-indicators/',standard:'NAS 36'},
  {name:'Provision Assessment',category:'Decision-Making Tools',url:'/tools/decision-tools/provision-assessment/',standard:'NAS 37'},
  {name:'Subsequent Events Assessment',category:'Decision-Making Tools',url:'/tools/decision-tools/subsequent-events/',standard:'NAS 10'},
  {name:'Related Party Assessment',category:'Decision-Making Tools',url:'/tools/decision-tools/related-party/',standard:'NAS 24'},
  {name:'Control Assessment',category:'Decision-Making Tools',url:'/tools/decision-tools/control-assessment/',standard:'NFRS 10'},
  {name:'Principal vs Agent Assessment',category:'Decision-Making Tools',url:'/tools/decision-tools/principal-agent/',standard:'NFRS 15'}
];
window.TOOL_NAV_CONFIG = TOOL_NAV_CONFIG;
const links = [['Home','/','home'],['About','/about/','about'],['Experience','/experience/','experience'],['Expertise','/expertise/','expertise'],['Insights','/insights/','insights'],['Tools','/tools/','tools'],['Contact','/contact/','contact']];
const current = path === '/' || path === '/index.html' ? 'home' : links.find(([, , key]) => path.includes(`/${key}`))?.[2];
const toolGroups = ['Calculation Tools','Decision-Making Tools'].map(category => `<div class="tools-menu-group"><span class="tools-menu-heading">${category}</span>${TOOL_NAV_CONFIG.filter(t=>t.category===category).map(t=>`<a href="${t.url}"><span>${t.name}</span><small>${t.standard}</small></a>`).join('')}</div>`).join('');
const header = document.querySelector('[data-site-header]');
if (header) header.innerHTML = `<header class="site-header"><a class="brand" href="/"><span class="brand-mark">RD</span><span>CA. Rishab Dahal</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">Menu</button><nav class="nav" id="primary-navigation" aria-label="Primary navigation">${links.map(([label,href,key]) => key==='tools' ? `<div class="nav-tools"><button class="tools-toggle ${key===current?'active':''}" type="button" aria-expanded="false" aria-controls="tools-menu" ${key===current?'aria-current="page"':''}>Tools <span class="tools-chevron" aria-hidden="true"></span></button><div class="tools-menu" id="tools-menu"><div class="tools-menu-grid">${toolGroups}</div></div></div>` : `<a class="${key===current?'active':''}" href="${href}" ${key===current?'aria-current="page"':''}>${label}</a>`).join('')}</nav></header>`;
const footer = document.querySelector('[data-site-footer]');
if (footer) footer.innerHTML = `<footer class="site-footer"><p>© <span id="year">${new Date().getFullYear()}</span> Rishab Dahal · Chartered Accountant, Nepal</p><p class="disclaimer">Factual professional profile and educational information. Nothing on this website constitutes solicitation, an assurance engagement, or a guarantee of professional outcome.</p></footer>`;
const siteHeader=document.querySelector('.site-header'), toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('.nav'), toolsToggle=document.querySelector('.tools-toggle'), navTools=document.querySelector('.nav-tools');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));if(!open)setToolsMenu(false);});
const desktopTools=()=>window.matchMedia('(min-width:801px)').matches;
const setToolsMenu=open=>{navTools?.classList.toggle('menu-open',open);toolsToggle?.setAttribute('aria-expanded',String(open));};
let toolsCloseTimer;
const cancelToolsClose=()=>clearTimeout(toolsCloseTimer);
const scheduleToolsClose=()=>{cancelToolsClose();toolsCloseTimer=setTimeout(()=>{if(desktopTools()&&!navTools?.contains(document.activeElement))setToolsMenu(false);},120);};
toolsToggle?.addEventListener('click',event=>{event.stopPropagation();setToolsMenu(!navTools.classList.contains('menu-open'));});
navTools?.addEventListener('pointerenter',event=>{if(desktopTools()&&event.pointerType!=='touch'){cancelToolsClose();setToolsMenu(true);}});
navTools?.addEventListener('pointerleave',()=>{if(desktopTools())scheduleToolsClose();});
navTools?.addEventListener('focusin',()=>{cancelToolsClose();setToolsMenu(true);});
navTools?.addEventListener('focusout',()=>{setTimeout(()=>{if(!navTools.contains(document.activeElement))setToolsMenu(false);},0);});
document.addEventListener('click',event=>{if(navTools&&!navTools.contains(event.target))setToolsMenu(false);if(nav?.classList.contains('open')&&!siteHeader?.contains(event.target)){nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(navTools?.classList.contains('menu-open')){setToolsMenu(false);toolsToggle?.focus();}else if(nav?.classList.contains('open')){nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.focus();}}});
window.addEventListener('resize',()=>{if(desktopTools()){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}setToolsMenu(false);});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');setToolsMenu(false);}));
window.addEventListener('scroll',()=>siteHeader?.classList.toggle('scrolled',window.scrollY>8),{passive:true});
document.querySelectorAll('a[href]').forEach(link=>{if(link.origin===window.location.origin&&!link.hash&&!link.target)link.addEventListener('click',event=>{event.preventDefault();document.body.classList.add('is-leaving');setTimeout(()=>{window.location.href=link.href;},180);});});
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('show');observer.unobserve(entry.target);}}),{threshold:.12}):null;
document.querySelectorAll('.reveal').forEach(element=>observer?observer.observe(element):element.classList.add('show'));
