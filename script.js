const path = window.location.pathname;

const primaryLinks = [
  ['Home', '/', 'home'],
  ['About', '/about/', 'about'],
  ['Experience', '/experience-expertise/', 'experience-expertise'],
  ['Insights', '/insights/', 'insights'],
  ['Contact', '/contact/', 'contact']
];

const resourceGroups = [
  {
    key: 'nfrs', label: 'NFRS Tools', href: '/nfrs-tools/',
    links: [['Lease Calculator','/tools/lease-calculator/'],['Effective Interest Rate','/tools/eir-calculator/'],['EPS Calculator','/tools/eps-calculator/'],['Borrowing Cost','/tools/borrowing-cost-calculator/'],['Defined Benefit Estimate','/tools/defined-benefit-calculator/']]
  },
  {
    key: 'calculation', label: 'Calculation Tools', href: '/calculation-tools/',
    links: [['EMI Calculator','/tools/emi-calculator/'],['Simple Interest','/tools/simple-interest-calculator/'],['Compound Interest','/tools/compound-interest-calculator/'],['Present Value','/tools/present-value-calculator/'],['Future Value','/tools/future-value-calculator/'],['NPV & IRR','/tools/npv-irr-calculator/'],['Loan Comparison','/tools/loan-comparison-calculator/'],['Flat vs Reducing Rate','/tools/flat-vs-reducing-calculator/'],['Break-even Point','/tools/break-even-calculator/'],['Depreciation','/tools/depreciation-calculator/'],['Financial Ratios','/tools/financial-ratio-calculator/']]
  },
  {
    key: 'decision', label: 'NFRS Decision-Making', href: '/decision-tools/',
    links: [['Lease Identification','/tools/decision-tools/lease-identification/'],['Financial Asset Classification','/tools/decision-tools/financial-asset-classification/'],['Impairment Indicators','/tools/decision-tools/impairment-indicators/'],['Provision Assessment','/tools/decision-tools/provision-assessment/'],['Subsequent Events','/tools/decision-tools/subsequent-events/'],['Related Party','/tools/decision-tools/related-party/'],['Control Assessment','/tools/decision-tools/control-assessment/'],['Principal versus Agent','/tools/decision-tools/principal-agent/']]
  },
  {
    key: 'pdf', label: 'PDF & Document Tools', href: '/pdf-tools/',
    links: [['Merge & organize PDFs','/pdf-tools/?tool=merge'],['Convert files to PDF','/pdf-tools/?tool=image-to-pdf'],['PDF to JPG or PNG','/pdf-tools/?tool=pdf-to-jpg'],['Compress PDF or images','/pdf-tools/?tool=pdf-compress']]
  }
];

const currentPrimary = path === '/' || path === '/index.html'
  ? 'home'
  : primaryLinks.find(([, href]) => href !== '/' && path.startsWith(href))?.[2];

const currentResource = path.startsWith('/pdf-tools/') ? 'pdf'
  : path.startsWith('/decision-tools/') || path.includes('/decision-tools/') ? 'decision'
  : path.startsWith('/calculation-tools/') || /\/tools\/(emi|simple-interest|compound-interest|present-value|future-value|npv-irr|loan-comparison|flat-vs-reducing|break-even|depreciation|financial-ratio)-/.test(path) ? 'calculation'
  : path.startsWith('/nfrs-tools/') || /\/tools\/(lease|eir|eps|borrowing-cost|defined-benefit)-/.test(path) ? 'nfrs'
  : null;

const linkMarkup = ([label, href, key], current) =>
  `<a class="${key === current ? 'active' : ''}" href="${href}" ${key === current ? 'aria-current="page"' : ''}>${label}</a>`;

const toolMenuMarkup = resourceGroups.map(group => `<section class="tools-menu-group">
  <a class="tools-menu-heading ${group.key === currentResource ? 'active' : ''}" href="${group.href}" ${group.key === currentResource ? 'aria-current="page"' : ''}>${group.label}<span aria-hidden="true">→</span></a>
  <div class="tools-menu-links">${group.links.map(([name, href]) => `<a href="${href}">${name}</a>`).join('')}</div>
</section>`).join('');

const header = document.querySelector('[data-site-header]');
if (header) {
  header.innerHTML = `<header class="site-header">
    <div class="header-primary">
      <a class="brand" href="/" aria-label="CA. Rishab Dahal home"><span class="brand-mark" aria-hidden="true">RD</span><span>CA. Rishab Dahal</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">Menu</button>
      <nav class="navigation-wrap" id="site-navigation" aria-label="Primary navigation">
        <div class="nav">${primaryLinks.slice(0,4).map(link => linkMarkup(link, currentPrimary)).join('')}
          <div class="nav-tools">
            <button class="tools-toggle ${currentResource ? 'active' : ''}" type="button" aria-expanded="false" aria-controls="tools-menu">Tools <span class="tools-chevron" aria-hidden="true"></span></button>
            <div class="tools-menu" id="tools-menu"><div class="tools-menu-grid">${toolMenuMarkup}</div></div>
          </div>
          ${linkMarkup(primaryLinks[4], currentPrimary)}
        </div>
      </nav>
    </div>
  </header>`;
}

const footer = document.querySelector('[data-site-footer]');
if (footer) footer.innerHTML = `<footer class="site-footer"><p>© ${new Date().getFullYear()} Rishab Dahal · Chartered Accountant, Nepal</p><p class="disclaimer">Individual professional profile and educational information. Tool outputs are indicative and do not replace the applicable standards, laws or engagement-specific advice.</p></footer>`;

const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation-wrap');
const navTools = document.querySelector('.nav-tools');
const toolsToggle = document.querySelector('.tools-toggle');

const closeTools = (returnFocus = false) => {
  navTools?.classList.remove('menu-open');
  toolsToggle?.setAttribute('aria-expanded', 'false');
  if (returnFocus) toolsToggle?.focus();
};

const closeMenu = () => {
  navigation?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  closeTools();
};

menuToggle?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

toolsToggle?.addEventListener('click', () => {
  const open = navTools.classList.toggle('menu-open');
  toolsToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', event => {
  if (!siteHeader?.contains(event.target)) closeMenu();
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (navTools?.classList.contains('menu-open')) closeTools(true);
  else if (navigation?.classList.contains('open')) {
    closeMenu();
    menuToggle?.focus();
  }
});

navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 900) navigation?.classList.remove('open'); });
window.addEventListener('scroll', () => siteHeader?.classList.toggle('scrolled', window.scrollY > 8), {passive:true});

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
const activeToolGroup = resourceGroups.find(group => group.key === currentResource)?.links;
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
  if ([...select.options].some(option => option.value === path)) {
    select.addEventListener('change', () => { window.location.href = select.value; });
    switcher.append(label, select);
    toolHeading.after(switcher);
  }
}
