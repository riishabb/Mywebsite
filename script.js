const path = window.location.pathname;
const root = ['/about', '/experience', '/expertise', '/insights', '/contact'].some(page => path.startsWith(page)) ? '../' : '';
const links = [['Home', root || './', 'home'], ['About', `${root}about/`, 'about'], ['Experience', `${root}experience/`, 'experience'], ['Expertise', `${root}expertise/`, 'expertise'], ['Insights', `${root}insights/`, 'insights'], ['Contact', `${root}contact/`, 'contact']];
const current = path === '/' || path.endsWith('/index.html') ? 'home' : links.find(([, , key]) => path.includes(`/${key}`))?.[2];
const header = document.querySelector('[data-site-header]');
if (header) header.innerHTML = `<header class="site-header"><a class="brand" href="${root}"><span class="brand-mark">RD</span><span>CA. Rishab Dahal</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="primary-navigation">Menu</button><nav class="nav" id="primary-navigation" aria-label="Primary navigation">${links.map(([label, href, key]) => `<a class="${key === current ? 'active' : ''}" href="${href}" ${key === current ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav></header>`;
const footer = document.querySelector('[data-site-footer]');
if (footer) footer.innerHTML = `<footer class="site-footer"><p>© <span id="year">${new Date().getFullYear()}</span> Rishab Dahal · Chartered Accountant, Nepal</p><p class="disclaimer">Factual professional profile and educational information. Nothing on this website constitutes solicitation, an assurance engagement, or a guarantee of professional outcome.</p></footer>`;
const siteHeader = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
window.addEventListener('scroll', () => siteHeader?.classList.toggle('scrolled', window.scrollY > 8), {passive:true});
document.querySelectorAll('a[href]').forEach(link => {
  if (link.origin === window.location.origin && !link.hash && !link.target) link.addEventListener('click', event => { event.preventDefault(); document.body.classList.add('is-leaving'); setTimeout(() => { window.location.href = link.href; }, 180); });
});
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('show'); observer.unobserve(entry.target); } }), {threshold:.12}) : null;
document.querySelectorAll('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('show'));
