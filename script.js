const path = window.location.pathname;

const primaryLinks = [
  ['Home', '/', 'home'],
  ['About', '/about/', 'about'],
  ['Experience & Expertise', '/experience-expertise/', 'experience-expertise'],
  ['Insights', '/insights/', 'insights'],
  ['Contact', '/contact/', 'contact']
];

const resourceLinks = [
  ['NFRS Tools', '/nfrs-tools/', 'nfrs'],
  ['Calculation Tools', '/calculation-tools/', 'calculation'],
  ['NFRS Decision-Making Tools', '/decision-tools/', 'decision'],
  ['PDF & Document Tools', '/pdf-tools/', 'pdf']
];

const currentPrimary = path === '/' || path === '/index.html'
  ? 'home'
  : primaryLinks.find(([, href]) => href !== '/' && path.startsWith(href))?.[2];

const currentResource = path.startsWith('/pdf-tools/') ? 'pdf'
  : path.startsWith('/decision-tools/') || path.includes('/decision-tools/') ? 'decision'
  : path.startsWith('/calculation-tools/') || /\/tools\/(emi|simple-interest|compound-interest|present-value|future-value|npv-irr|loan-comparison|flat-vs-reducing|break-even|depreciation|financial-ratio)-/.test(path) ? 'calculation'
  : path.startsWith('/nfrs-tools/') || path.startsWith('/tools/') ? 'nfrs'
  : null;

const linkMarkup = ([label, href, key], current) =>
  `<a class="${key === current ? 'active' : ''}" href="${href}" ${key === current ? 'aria-current="page"' : ''}>${label}</a>`;

const header = document.querySelector('[data-site-header]');
if (header) {
  header.innerHTML = `<header class="site-header">
    <div class="header-primary">
      <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">RD</span><span>CA. Rishab Dahal</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">Menu</button>
      <div class="navigation-wrap" id="site-navigation">
        <nav class="nav" aria-label="Primary navigation">${primaryLinks.map(link => linkMarkup(link, currentPrimary)).join('')}</nav>
        <nav class="resource-nav" aria-label="Professional tools and resources">
          <span class="resource-nav-label">Resources</span>
          ${resourceLinks.map(link => linkMarkup(link, currentResource)).join('')}
        </nav>
      </div>
    </div>
  </header>`;
}

const footer = document.querySelector('[data-site-footer]');
if (footer) footer.innerHTML = `<footer class="site-footer"><p>© ${new Date().getFullYear()} Rishab Dahal · Chartered Accountant, Nepal</p><p class="disclaimer">Professional profile and educational information. Tools provide indicative results and do not replace engagement-specific professional advice.</p></footer>`;

const siteHeader = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation-wrap');

const closeMenu = () => {
  navigation?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
};

toggle?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', event => {
  if (navigation?.classList.contains('open') && !siteHeader?.contains(event.target)) closeMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('open')) {
    closeMenu();
    toggle?.focus();
  }
});

navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
window.addEventListener('scroll', () => siteHeader?.classList.toggle('scrolled', window.scrollY > 8), {passive:true});

document.querySelectorAll('a[href]').forEach(link => {
  if (link.origin === window.location.origin && !link.hash && !link.target) {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { window.location.href = link.href; }, 150);
    });
  }
});

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    }), {threshold:.12})
  : null;
document.querySelectorAll('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('show'));


// Give direct tool visitors a compact route to other tools in the same category.
const toolGroups = {"nfrs":[["Lease Calculator","/tools/lease-calculator/"],["Effective Interest Rate","/tools/eir-calculator/"],["EPS Calculator","/tools/eps-calculator/"],["Borrowing Cost","/tools/borrowing-cost-calculator/"],["Defined Benefit Estimate","/tools/defined-benefit-calculator/"]],"calculation":[["EMI Calculator","/tools/emi-calculator/"],["Simple Interest","/tools/simple-interest-calculator/"],["Compound Interest","/tools/compound-interest-calculator/"],["Present Value","/tools/present-value-calculator/"],["Future Value","/tools/future-value-calculator/"],["NPV & IRR","/tools/npv-irr-calculator/"],["Loan Comparison","/tools/loan-comparison-calculator/"],["Flat vs Reducing Rate","/tools/flat-vs-reducing-calculator/"],["Break-even Point","/tools/break-even-calculator/"],["Depreciation","/tools/depreciation-calculator/"],["Financial Ratios","/tools/financial-ratio-calculator/"]],"decision":[["Lease Identification","/tools/decision-tools/lease-identification/"],["Financial Asset Classification","/tools/decision-tools/financial-asset-classification/"],["Impairment Indicators","/tools/decision-tools/impairment-indicators/"],["Provision Assessment","/tools/decision-tools/provision-assessment/"],["Subsequent Events","/tools/decision-tools/subsequent-events/"],["Related Party","/tools/decision-tools/related-party/"],["Control Assessment","/tools/decision-tools/control-assessment/"],["Principal versus Agent","/tools/decision-tools/principal-agent/"]]};
const activeToolGroup = toolGroups[currentResource];
const toolHeading = document.querySelector('.tool-shell > .tool-hero');
if (toolHeading && activeToolGroup) {
  const switcher = document.createElement('nav');
  switcher.className = 'tool-switch';
  switcher.setAttribute('aria-label', 'Other tools in this category');
  const label = document.createElement('label');
  label.textContent = 'Switch tool';
  const select = document.createElement('select');
  select.id = 'category-tool-switch';
  label.htmlFor = select.id;
  for (const [name, href] of activeToolGroup) {
    const option = document.createElement('option');
    option.value = href;
    option.textContent = name;
    option.selected = href === path;
    select.append(option);
  }
  const currentToolListed = [...select.options].some(option => option.value === path);
  if (currentToolListed) {
    select.addEventListener('change', () => { window.location.href = select.value; });
    switcher.append(label, select);
    toolHeading.after(switcher);
  }
}
