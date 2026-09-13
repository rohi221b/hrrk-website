window.addEventListener('scroll', () => {
  const header = document.getElementById('main-header');
  if (!header) return;
  if (window.scrollY > 30) {
    header.classList.add('shadow-md', 'bg-white');
    header.classList.remove('bg-white/95');
  } else {
    header.classList.remove('shadow-md');
    header.classList.add('bg-white/95');
  }
});

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const icon = document.getElementById('mobileMenuIcon');
  if (!menu || !icon) return;
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-xmark');
  } else {
    menu.classList.add('hidden');
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  }
}

function openRFQModal(interestTopic) {
  const modal = document.getElementById('rfqModal');
  const input = document.getElementById('modalInterestInput');
  if (!modal || !input) return;
  input.value = interestTopic || 'General Corporate Consultation';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeRFQModal() {
  const modal = document.getElementById('rfqModal');
  const success = document.getElementById('modalSuccess');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (success) success.classList.add('hidden');
}

function selectGoal(roleName, verticalTarget) {
  const form = document.getElementById('contact');
  const select = document.getElementById('formInterest');
  const textarea = document.getElementById('formMessage');

  if (!form || !select || !textarea) {
    window.location.href = 'index.html#contact';
    return;
  }

  form.scrollIntoView({ behavior: 'smooth' });

  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].text.toLowerCase().includes(verticalTarget.toLowerCase())) {
      select.selectedIndex = i;
      break;
    }
  }
  textarea.value = `Inquiry regarding: ${roleName} [Target: ${verticalTarget}]. Looking to discuss operational requirements and terms.`;
  textarea.focus();
}

function handleFormSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('formSuccessMessage');
  if (msg) msg.classList.remove('hidden');
  setTimeout(() => {
    e.target.reset();
  }, 1500);
}

function handleModalSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('modalSuccess');
  if (msg) msg.classList.remove('hidden');
  setTimeout(() => {
    closeRFQModal();
    e.target.reset();
  }, 2000);
}

const searchDatabase = [
  { title: 'Injection Moulding Products', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-injection', desc: 'Caps, closures, components, thin wall mouldings' },
  { title: 'Blow Moulding Bottles & Cans', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-blow', desc: '30ml to 5000ml HDPE, PP liquid containers' },
  { title: 'Plastic Extrusion Lines', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-extrusion', desc: 'Tubes, conduits, profiles, pen barrels' },
  { title: 'OEM & Private Label', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-oem', desc: 'Turnkey contract manufacturing with tooling support' },
  { title: 'RV Vyapar Setu', category: 'Rekhraaj Ventures', link: 'ventures.html', desc: 'Trading platform for distributors and entrepreneurs' },
  { title: 'RV Reverse Trade', category: 'Rekhraaj Ventures', link: 'ventures.html#reverse-trade', desc: 'Manufacturing capacity monetization & buyback' },
  { title: 'NIVASHAA Cleaning Solutions', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-nivashaa', desc: 'Comfort for every home: Floor cleaners, detergents, sanitizers' },
  { title: 'SCRIBEXA Stationery', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-scribexaa', desc: 'Tools for inspired minds: Pens, highlighters, registers' },
  { title: 'DEVYANA Devotional', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-devyana', desc: 'Divine essence, pure devotion: Camphor, agarbatti, pooja oils' },
  { title: 'GLOY LED Lighting', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-gloyex', desc: 'Power, light, innovation: Inverter bulbs, battens, downlights' },
  { title: 'Exports Division', category: 'Global Business', link: 'exports.html', desc: 'Ocean freight, container supply, US-FDA & CE standards' },
  { title: 'Hrishikesh Kadam', category: 'Founder', link: 'founder.html', desc: 'Founder & Visionary — HRRK Group of Companies' }
];

function toggleGlobalSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearchInput');
  if (!overlay || !input) return;
  if (overlay.classList.contains('hidden')) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    input.value = '';
    performLiveSearch('');
    setTimeout(() => input.focus(), 50);
  } else {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function performLiveSearch(query) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  const q = query.trim().toLowerCase();

  if (!q) {
    container.innerHTML = `
      <div class="text-xs text-gray-400 py-2">Quick Shortcuts:</div>
      <div class="grid grid-cols-2 gap-2">
        <a href="namrushii.html" onclick="toggleGlobalSearch()" class="p-2 rounded bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-brand-navy block">Plastic Manufacturing</a>
        <a href="ventures.html" onclick="toggleGlobalSearch()" class="p-2 rounded bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-brand-navy block">RV Vyapar Setu</a>
        <a href="vyom.html" onclick="toggleGlobalSearch()" class="p-2 rounded bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-brand-navy block">Consumer Brands</a>
        <a href="exports.html" onclick="toggleGlobalSearch()" class="p-2 rounded bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-brand-navy block">Global Exports</a>
        <a href="founder.html" onclick="toggleGlobalSearch()" class="p-2 rounded bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-brand-navy block">Founder</a>
      </div>
    `;
    return;
  }

  const matches = searchDatabase.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.desc.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 py-4 text-center">No exact matching division found. <a href="index.html#contact" onclick="toggleGlobalSearch()" class="text-brand-royal underline font-semibold">Inquire directly with our team</a>.</p>`;
    return;
  }

  let html = '';
  matches.forEach(item => {
    html += `
      <a href="${item.link}" onclick="toggleGlobalSearch()" class="block p-3 rounded-xl hover:bg-brand-offwhite border border-transparent hover:border-gray-200 transition-colors">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-brand-navy">${item.title}</span>
          <span class="text-[10px] font-semibold text-brand-royal uppercase px-2 py-0.5 bg-blue-50 rounded">${item.category}</span>
        </div>
        <p class="text-[11px] text-gray-500 mt-1">${item.desc}</p>
      </a>
    `;
  });
  container.innerHTML = html;
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeRFQModal();
    const search = document.getElementById('searchOverlay');
    if (search && !search.classList.contains('hidden')) {
      toggleGlobalSearch();
    }
  }
});
