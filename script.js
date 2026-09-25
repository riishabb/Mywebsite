const path = window.location.pathname;
const links = [['Home', '/', 'home'], ['About', '/about/', 'about'], ['Experience', '/experience/', 'experience'], ['Expertise', '/expertise/', 'expertise'], ['Insights', '/insights/', 'insights'], ['Tools', '/tools/', 'tools'], ['Contact', '/contact/', 'contact']];
const current = path === '/' || path.endsWith('/index.html') ? 'home' : links.find(([, , key]) => path.includes(`/${key}`))?.[2];
const header = document.querySelector('[data-site-header]');
const navigation = links.map(([label, href, key]) => key === 'tools'
  ? `<div class="nav-dropdown"><button class="nav-tools-toggle ${key === current ? 'active' : ''}" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="tools-menu">${label}<span class="nav-caret" aria-hidden="true">⌄</span></button><div class="tools-menu" id="tools-menu" role="menu"><a href="/tools/" role="menuitem">All tools<span>↗</span></a><a href="/tools/decision-tools/lease-identification/" role="menuitem">Decision tools<span>↗</span></a><a href="/tools/emi-calculator/" role="menuitem">Calculator tools<span>↗</span></a></div></div>`
  : `<a class="${key === current ? 'active' : ''}" href="${href}" ${key === current ? 'aria-current="page"' : ''}>${label}</a>`).join('');
if (header) header.innerHTML = `<header class="site-header"><a class="brand" href="/"><span class="brand-mark">RD</span><span>CA. Rishab Dahal</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">Menu</button><nav class="nav" id="primary-navigation" aria-label="Primary navigation">${navigation}</nav></header>`;
const footer = document.querySelector('[data-site-footer]');
if (footer) footer.innerHTML = `<footer class="site-footer"><p>© <span id="year">${new Date().getFullYear()}</span> Rishab Dahal · Chartered Accountant, Nepal</p><p class="disclaimer">Factual professional profile and educational information. Nothing on this website constitutes solicitation, an assurance engagement, or a guarantee of professional outcome.</p></footer>`;
const siteHeader = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const toolsDropdown = document.querySelector('.nav-dropdown');
const toolsToggle = document.querySelector('.nav-tools-toggle');
const toolsMenu = document.querySelector('.tools-menu');
const closeTools = () => { toolsDropdown?.classList.remove('menu-open'); toolsToggle?.setAttribute('aria-expanded', 'false'); };
const openTools = () => { toolsDropdown?.classList.add('menu-open'); toolsToggle?.setAttribute('aria-expanded', 'true'); };
toggle?.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
toolsToggle?.addEventListener('click', event => { event.stopPropagation(); toolsDropdown?.classList.contains('menu-open') ? closeTools() : openTools(); });
toolsDropdown?.addEventListener('pointerenter', openTools);
toolsDropdown?.addEventListener('pointerleave', closeTools);
toolsToggle?.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openTools(); toolsMenu?.querySelector('a')?.focus(); }
  if (event.key === 'Escape') closeTools();
});
toolsMenu?.addEventListener('keydown', event => { if (event.key === 'Escape') { closeTools(); toolsToggle?.focus(); } });
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); closeTools(); }));
document.addEventListener('pointerdown', event => { if (toolsDropdown && !toolsDropdown.contains(event.target)) closeTools(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeTools(); nav?.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); } });
window.addEventListener('scroll', () => siteHeader?.classList.toggle('scrolled', window.scrollY > 8), {passive:true});
document.querySelectorAll('a[href]').forEach(link => {
  if (link.origin === window.location.origin && !link.hash && !link.target) link.addEventListener('click', event => { event.preventDefault(); document.body.classList.add('is-leaving'); setTimeout(() => { window.location.href = link.href; }, 180); });
});
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); } }), {threshold:.12}) : null;
document.querySelectorAll('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('show'));
