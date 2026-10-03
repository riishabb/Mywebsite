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
    key: 'decision', label: 'NFRS Decision-Making Tools', href: '/decision-tools/',
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
  <button class="tools-group-toggle" type="button" aria-expanded="false" aria-controls="tools-group-${group.key}">${group.label}<span aria-hidden="true">+</span></button>
  <a class="tools-menu-heading ${group.key === currentResource ? 'active' : ''}" href="${group.href}" ${group.key === currentResource ? 'aria-current="page"' : ''}>${group.label}<span aria-hidden="true">→</span></a>
  <div class="tools-menu-links" id="tools-group-${group.key}"><a class="tools-group-all" href="${group.href}">View all ${group.label}</a>${group.links.map(([name, href]) => `<a href="${href}">${name}</a>`).join('')}</div>
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
            <button class="tools-toggle ${currentResource ? 'active' : ''}" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="tools-menu">Tools <span class="tools-chevron" aria-hidden="true"></span></button>
            <div class="tools-menu" id="tools-menu" aria-label="Tools navigation"><div class="tools-menu-grid">${toolMenuMarkup}</div></div>
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
const toolsMenu = document.querySelector('.tools-menu');
const desktopMenu = () => window.matchMedia('(min-width: 901px)').matches;
let suppressToolsFocus = false;
let toolsCloseTimer;
const cancelToolsClose = () => {
  window.clearTimeout(toolsCloseTimer);
  toolsCloseTimer = undefined;
};
const openTools = () => {
  cancelToolsClose();
  navTools?.classList.add('menu-open');
  toolsToggle?.setAttribute('aria-expanded', 'true');
};

const closeTools = (returnFocus = false) => {
  cancelToolsClose();
  navTools?.classList.remove('menu-open');
  navTools?.classList.remove('clicked-open');
  toolsToggle?.setAttribute('aria-expanded', 'false');
  if (returnFocus) {
    suppressToolsFocus = true;
    toolsToggle?.focus();
    requestAnimationFrame(() => { suppressToolsFocus = false; });
  }
};

// A brief intent window protects the short trip from the trigger to the wide
// desktop panel. It is long enough for natural diagonal movement, but short
// enough that leaving the navigation still feels immediate.
const scheduleToolsClose = () => {
  cancelToolsClose();
  toolsCloseTimer = window.setTimeout(() => closeTools(), 180);
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

let toolsOpenBeforePointer = false;
toolsToggle?.addEventListener('pointerdown', () => {
  toolsOpenBeforePointer = navTools.classList.contains('menu-open');
});
toolsToggle?.addEventListener('click', event => {
  event.stopPropagation();
  const wasOpen = event.detail ? toolsOpenBeforePointer : navTools.classList.contains('menu-open');
  if (wasOpen) closeTools();
  else openTools();
});
navTools?.addEventListener('pointerenter', event => {
  if (desktopMenu() && event.pointerType !== 'touch') openTools();
});
navTools?.addEventListener('pointerleave', event => {
  if (desktopMenu() && !navTools.contains(event.relatedTarget)) scheduleToolsClose();
});
toolsMenu?.addEventListener('pointerenter', cancelToolsClose);
toolsMenu?.addEventListener('pointerleave', event => {
  if (desktopMenu() && !navTools?.contains(event.relatedTarget)) scheduleToolsClose();
});
navTools?.addEventListener('focusin', () => { if (desktopMenu() && !suppressToolsFocus) openTools(); });
navTools?.addEventListener('focusout', event => {
  if (!navTools.contains(event.relatedTarget)) closeTools();
});
toolsToggle?.addEventListener('keydown', event => {
  if (!desktopMenu() || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  openTools();
  const links = [...(toolsMenu?.querySelectorAll('a') || [])].filter(link => link.getClientRects().length > 0);
  const target = event.key === 'ArrowUp' ? links?.[links.length - 1] : links?.[0];
  target?.focus();
});
document.querySelectorAll('.tools-group-toggle').forEach(button => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.tools-group-toggle').forEach(other => {
    other.setAttribute('aria-expanded', 'false');
    other.closest('.tools-menu-group').classList.remove('group-open');
  });
  if (!expanded) {
    button.setAttribute('aria-expanded', 'true');
    button.closest('.tools-menu-group').classList.add('group-open');
  }
}));

document.addEventListener('click', event => {
  if (!siteHeader?.contains(event.target)) closeMenu();
  else if (desktopMenu() && !navTools?.contains(event.target)) closeTools();
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
window.addEventListener('resize', closeMenu);
window.addEventListener('scroll', () => siteHeader?.classList.toggle('scrolled', window.scrollY > 8), {passive:true});

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


// Editorial entrances are opt-in in the HTML. Pending content stays fully visible:
// failed JS, browser search and keyboard access never depend on an observer.
(() => {
  const items = [...document.querySelectorAll('[data-motion]')];
  if (!items.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const completed = new WeakSet();
  const sequenceOrder = new Map();
  items.filter(item => item.dataset.motion === 'sequence').forEach(item => {
    const siblings = items.filter(other => other.parentElement === item.parentElement && other.dataset.motion === 'sequence');
    sequenceOrder.set(item, siblings.indexOf(item));
  });
  let observer;

  const finish = element => {
    completed.add(element);
    element.classList.remove('motion-enter');
    element.style.removeProperty('--motion-delay');
    observer?.unobserve(element);
  };
  const finishAll = () => {
    items.forEach(finish);
    observer?.disconnect();
    document.querySelectorAll('.motion-accent').forEach(accent => accent.classList.remove('motion-accent'));
  };
  const expose = target => {
    if (!(target instanceof Element)) return;
    items.filter(item => item === target || item.contains(target) || target.contains(item)).forEach(finish);
  };
  const exposeAnchor = () => {
    if (!location.hash) return;
    try { expose(document.getElementById(decodeURIComponent(location.hash.slice(1)))); }
    catch { /* Malformed fragments must not interrupt the controller. */ }
  };
  const enter = (element, order = 0) => {
    if (completed.has(element)) return;
    completed.add(element);
    if (reduced.matches || element.contains(document.activeElement)) return finish(element);
    observer?.unobserve(element);
    if (element.dataset.motion === 'heading') {
      const accent = element.closest('.chapter')?.querySelector('.chapter-index');
      if (accent) {
        accent.classList.add('motion-accent');
        accent.addEventListener('animationend', () => accent.classList.remove('motion-accent'), {once:true});
      }
    }
    if (element.dataset.motion === 'sequence') {
      element.style.setProperty('--motion-delay', `calc(min(${order} * var(--motion-stagger), var(--motion-stagger-cap)))`);
    }
    element.classList.add('motion-enter');
    element.addEventListener('animationend', () => finish(element), {once: true});
    element.addEventListener('animationcancel', () => finish(element), {once: true});
  };

  document.addEventListener('focusin', event => expose(event.target));
  document.addEventListener('beforematch', event => expose(event.target));
  document.addEventListener('keydown', event => {
    if (((event.ctrlKey || event.metaKey) && ['f', 'g'].includes(event.key.toLowerCase())) || event.key === 'F3') finishAll();
  });
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
      try { expose(document.getElementById(decodeURIComponent(url.hash.slice(1)))); } catch {}
    }
  });
  window.addEventListener('hashchange', exposeAnchor);
  // A restored reading position should never replay an entrance over the reader.
  window.addEventListener('popstate', finishAll);
  window.addEventListener('pageshow', event => {
    if (event.persisted || performance.getEntriesByType('navigation')[0]?.type === 'back_forward') finishAll();
    else exposeAnchor();
  });
  reduced.addEventListener('change', event => { if (event.matches) finishAll(); });
  exposeAnchor();
  if (reduced.matches || !('IntersectionObserver' in window)) return finishAll();

  observer = new IntersectionObserver(entries => {
    // Stable sibling positions keep a sequence deliberate during both slow and fast scroll.
    entries.filter(entry => entry.isIntersecting && !completed.has(entry.target))
      .sort((a, b) => items.indexOf(a.target) - items.indexOf(b.target))
      .forEach(({target}) => enter(target, sequenceOrder.get(target) || 0));
  }, {threshold: 0, rootMargin: '0px 0px -36px 0px'});

  // Initial compositions enter immediately, using the same capped sequence.
  items.forEach(item => {
    if (completed.has(item)) return;
    const bounds = item.getBoundingClientRect();
    if (bounds.top < innerHeight && bounds.bottom > 0) enter(item, sequenceOrder.get(item) || 0);
    else observer.observe(item);
  });
})();
