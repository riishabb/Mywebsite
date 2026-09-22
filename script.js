const tabButtons = [...document.querySelectorAll(".tab-btn")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const jumpButtons = [...document.querySelectorAll(".tab-jump, [data-tab-link]")];
const menuToggle = document.getElementById("menuToggle");
const tabs = document.getElementById("tabs");

function validTab(name) {
  return tabPanels.some(panel => panel.dataset.panel === name);
}

function activateTab(name, updateHash = true) {
  const target = validTab(name) ? name : "home";

  tabButtons.forEach(btn => {
    const active = btn.dataset.tab === target;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  tabPanels.forEach(panel => {
    const active = panel.dataset.panel === target;
    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", active ? "false" : "true");
    if (active) panel.scrollTop = 0;
  });

  if (updateHash) {
    history.replaceState(null, "", `#${target}`);
  }

  tabs.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

jumpButtons.forEach(control => {
  control.addEventListener("click", event => {
    const target = control.dataset.tab || control.dataset.tabLink;
    if (target) {
      event.preventDefault();
      activateTab(target);
    }
  });
});

menuToggle?.addEventListener("click", () => {
  const open = tabs.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

window.addEventListener("hashchange", () => {
  activateTab(location.hash.replace("#", ""), false);
});

document.getElementById("year").textContent = new Date().getFullYear();
activateTab(location.hash.replace("#", "") || "home", false);
