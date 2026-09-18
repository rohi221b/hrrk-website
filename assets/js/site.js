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
  const error = document.getElementById('modalError');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  if (success) success.classList.add('hidden');
  if (error) error.classList.add('hidden');
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

function normalizeHomeMobile(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  // Accept international numbers (7–15 digits)
  if (digits.length >= 7 && digits.length <= 15) return digits;
  return null;
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const success = document.getElementById('formSuccessMessage');
  const errorBox = document.getElementById('formErrorMessage');
  const submitBtn = form.querySelector('button[type="submit"]');

  function showError(message) {
    if (success) success.classList.add('hidden');
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.remove('hidden');
    }
  }

  function showSuccess() {
    if (errorBox) errorBox.classList.add('hidden');
    if (success) success.classList.remove('hidden');
  }

  const payload = {
    interest:  (document.getElementById('formInterest')  || {}).value || '',
    fullName:  (document.getElementById('formFullName')  || {}).value || '',
    phone:     (document.getElementById('formPhone')     || {}).value || '',
    location:  (document.getElementById('formLocation')  || {}).value || '',
    company:   (document.getElementById('formCompany')   || {}).value || '',
    email:     (document.getElementById('formEmail')     || {}).value || '',
    product:   (document.getElementById('formProduct')   || {}).value || '',
    quantity:  (document.getElementById('formQuantity')  || {}).value || '',
    message:   (document.getElementById('formMessage')   || {}).value || '',
  };

  if (!normalizeHomeMobile(payload.phone)) {
    showError('Enter a valid phone or WhatsApp number.');
    return;
  }


  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
  }
  if (errorBox) errorBox.classList.add('hidden');
  if (success) success.classList.add('hidden');

  fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Inquiry could not be sent. Please try again later.');
      }
      showSuccess();
      setTimeout(() => {
        form.reset();
      }, 1500);
    })
    .catch((err) => {
      showError(err.message || 'Inquiry could not be sent. Please try again later.');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
      }
    });
}

function handleModalSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const success = document.getElementById('modalSuccess');
  let errorBox = document.getElementById('modalError');

  if (!errorBox) {
    errorBox = document.createElement('div');
    errorBox.id = 'modalError';
    errorBox.className = 'hidden p-3 rounded-lg bg-red-50 text-red-800 text-xs font-medium';
    form.appendChild(errorBox);
  }

  function showError(msg) {
    if (success) success.classList.add('hidden');
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }

  const interestInput = document.getElementById('modalInterestInput');
  const nameInput = form.querySelector('input[placeholder*="name" i], input[placeholder*="Patel" i]') || form.querySelectorAll('input[type="text"]')[1];
  const phoneInput = form.querySelector('input[type="tel"]') || form.querySelector('input[placeholder*="WhatsApp" i]');
  const reqTextarea = form.querySelector('textarea');

  const fullName = (nameInput && nameInput.value ? nameInput.value.trim() : '');
  const phone = (phoneInput && phoneInput.value ? phoneInput.value.trim() : '');
  const interest = (interestInput && interestInput.value ? interestInput.value.trim() : 'Corporate Enquiry');
  const message = (reqTextarea && reqTextarea.value ? reqTextarea.value.trim() : '');

  if (!fullName) {
    showError('Please enter your name.');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!phone) {
    showError('Please enter your phone or WhatsApp number.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  const payload = {
    interest,
    fullName,
    phone,
    location: 'India',
    message,
    source: 'Corporate Modal Enquiry',
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
  }
  errorBox.classList.add('hidden');
  if (success) success.classList.add('hidden');

  fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Enquiry could not be sent. Please try again later.');
      }
      if (success) success.classList.remove('hidden');
      setTimeout(() => {
        closeRFQModal();
        form.reset();
      }, 1800);
    })
    .catch((err) => {
      showError(err.message || 'Enquiry could not be sent. Please try again later.');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
      }
    });
}

function setupExportRfq() {
  const form = document.getElementById('exportRfqForm');
  if (!form) return;
  form.removeAttribute('onsubmit');

  const success = document.getElementById('exportRfqSuccess');
  const submit = form.querySelector('button[type="submit"]');
  const query = new URLSearchParams(window.location.search);
  const timeline = form.querySelector('[name="timeline"]');
  if (timeline) {
    const packaging = document.createElement('input');
    packaging.name = 'packaging';
    packaging.placeholder = 'Packaging requirement';
    packaging.className = timeline.className;
    timeline.parentElement.insertBefore(packaging, timeline);
  }

  const rfqSection = form.closest('section');
  if (rfqSection) {
    rfqSection.classList.remove('bg-brand-offwhite');
    rfqSection.classList.add('bg-brand-navy');
    const copy = rfqSection.firstElementChild && rfqSection.firstElementChild.firstElementChild;
    if (copy) {
      const eyebrow = copy.querySelector('p');
      const heading = copy.querySelector('h2');
      const description = copy.querySelectorAll('p')[1];
      if (eyebrow) eyebrow.classList.replace('text-brand-royal', 'text-brand-gold');
      if (heading) heading.classList.replace('text-brand-navy', 'text-white');
      if (description) description.classList.replace('text-gray-600', 'text-gray-300');
    }
  }
  const error = document.createElement('div');
  error.className = 'hidden p-3 rounded-lg bg-red-50 text-red-800 text-xs';
  error.setAttribute('role', 'alert');
  form.appendChild(error);

  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 639px) {
      #capabilities > div > .grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: .75rem; }
      #capabilities > div > .grid > a { min-width: 82%; scroll-snap-align: start; }
      .export-mobile-bar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 45; display: flex; gap: .5rem; padding: .65rem 1rem; background: rgba(255,255,255,.96); border-top: 1px solid #e5e7eb; box-shadow: 0 -8px 24px rgba(11,31,51,.12); }
      .export-mobile-bar a { flex: 1; padding: .8rem .5rem; border-radius: .6rem; text-align: center; font: 700 10px Poppins, sans-serif; letter-spacing: .06em; text-transform: uppercase; }
    }
    @media (min-width: 640px) { .export-mobile-bar { display: none; } }
  `;
  document.head.appendChild(style);

  const mobileBar = document.createElement('div');
  mobileBar.className = 'export-mobile-bar';
  mobileBar.innerHTML = '<a class="bg-emerald-600 text-white" href="https://wa.me/917875355135?text=Hello%20HRRK%2C%20I%20am%20interested%20in%20sourcing%20products%20from%20India.%20I%20would%20like%20to%20discuss%20an%20export%20requirement.">WhatsApp</a><a class="bg-brand-gold text-brand-navy" href="#international-rfq">Request export quote</a>';
  document.body.appendChild(mobileBar);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const file = values.get('specification');
    const payload = {
      company: values.get('company'),
      contact: values.get('contact'),
      country: values.get('country'),
      website: values.get('website'),
      email: values.get('email'),
      phone: values.get('phone'),
      interests: values.getAll('interest'),
      product: values.get('product'),
      quantity: values.get('quantity'),
      market: values.get('market'),
      packaging: values.get('packaging'),
      timeline: values.get('timeline'),
      notes: values.get('notes'),
      fileName: file && file.name ? file.name : '',
      pageUrl: window.location.href,
      utmSource: query.get('utm_source') || '',
      utmMedium: query.get('utm_medium') || '',
      utmCampaign: query.get('utm_campaign') || '',
    };

    if (submit) {
      submit.disabled = true;
      submit.classList.add('opacity-60', 'cursor-not-allowed');
    }
    error.classList.add('hidden');
    if (success) success.classList.add('hidden');

    try {
      const response = await fetch('/api/export-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your export requirement could not be sent. Please try again later.');
      if (success) success.classList.remove('hidden');
      form.reset();
    } catch (requestError) {
      error.textContent = requestError.message || 'Your export requirement could not be sent. Please try again later.';
      error.classList.remove('hidden');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.classList.remove('opacity-60', 'cursor-not-allowed');
      }
    }
  });
}

setupExportRfq();

const searchDatabase = [
  { title: 'Injection Moulding Products', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-injection', desc: 'Caps, closures, components, thin wall mouldings' },
  { title: 'Blow Moulding Bottles & Cans', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-blow', desc: '30ml to 5000ml HDPE, PP liquid containers' },
  { title: 'Plastic Extrusion Lines', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-extrusion', desc: 'Tubes, conduits, profiles, pen barrels' },
  { title: 'OEM & Private Label', category: 'Namrushii Industrixa', link: 'namrushii.html#mfg-oem', desc: 'Turnkey contract manufacturing with tooling support' },
  { title: 'RV Vyapar Setu', category: 'Rekhraaj Ventures', link: 'ventures.html#vyapar-setu', desc: 'Multi-brand regional trade network for traders and brands' },
  { title: 'RV Reverse Trade', category: 'Rekhraaj Ventures', link: 'ventures.html#reverse-trade', desc: 'Six manufacturing buyback verticals' },
  { title: 'RV CLEANFLOW', category: 'Reverse Trade', link: 'ventures.html#reverse-trade', desc: 'Liquid cleaning products manufacturing and buyback' },
  { title: 'RV PENCRAFT', category: 'Reverse Trade', link: 'ventures.html#reverse-trade', desc: 'Pen manufacturing and assembly buyback' },
  { title: 'RV POWERCLEAN', category: 'Reverse Trade', link: 'ventures.html#reverse-trade', desc: 'Powder detergent manufacturing and packaging buyback' },
  { title: 'RV GLOTECH', category: 'Reverse Trade', link: 'ventures.html#reverse-trade', desc: 'LED bulb manufacturing and assembly buyback' },
  { title: 'RV KAPOORCRAFT', category: 'Reverse Trade', link: 'ventures.html#reverse-trade', desc: 'Kapoor / camphor manufacturing buyback' },
  { title: 'RV DHOOPCRAFT', category: 'Reverse Trade', link: 'ventures.html#reverse-trade', desc: 'Dhoop stick manufacturing buyback' },
  { title: 'NIVASHAA Cleaning Solutions', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-nivashaa', desc: 'Comfort for every home: Floor cleaners, detergents, sanitizers' },
  { title: 'SCRIBEXA Stationery', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-scribexaa', desc: 'Tools for inspired minds: Pens, highlighters, registers' },
  { title: 'DEVYANA Devotional', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-devyana', desc: 'Divine essence, pure devotion: Camphor, agarbatti, pooja oils' },
  { title: 'GLOY LED Lighting', category: 'Rekhraaj Vyom', link: 'vyom.html#brand-gloyex', desc: 'Power, light, innovation: Inverter bulbs, battens, downlights' },
  { title: 'Exports Division', category: 'Global Business', link: 'exports.html', desc: 'Global sourcing, private label, OEM, bulk supply and group brands from India' },
  { title: 'Hrishikesh Kadam', category: 'Founder', link: 'founder.html', desc: 'Founder’s message — building businesses, creating opportunities, shaping the future' }
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
        <a href="ventures.html#vyapar-setu" onclick="toggleGlobalSearch()" class="p-2 rounded bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-brand-navy block">RV Vyapar Setu</a>
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
