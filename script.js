/* =========================================================
   TRINETRA — script.js
========================================================= */

/**
 * Image placeholder fallback.
 * Every real photo slot in the HTML is wrapped in a .tn-img-slot div
 * with data-label / data-icon attributes and contains an <img onerror="tnImgFallback(this)">.
 *
 * HOW IT WORKS:
 * - By default the <img> tries to load the real file from /assets/images/...
 * - If that file does not exist yet, onerror fires and this function marks
 *   the parent slot as "missing", which reveals a styled placeholder
 *   (icon + label) via CSS instead of a broken image icon.
 * - Once you add the real photo with the exact same filename into
 *   /assets/images/..., the <img> will simply load it — no code changes
 *   needed, the placeholder disappears automatically.
 */
function tnImgFallback(imgEl){
  imgEl.onerror = null; // prevent loop
  const slot = imgEl.closest('.tn-img-slot');
  if(!slot) return;
  slot.classList.add('tn-missing');

  // Build placeholder content once
  if(!slot.querySelector('.tn-placeholder-inner')){
    const label = slot.getAttribute('data-label') || 'Image';
    const icon  = slot.getAttribute('data-icon') || 'bi-image';
    const inner = document.createElement('div');
    inner.className = 'tn-placeholder-inner';
    inner.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${label}</span>
      <small>Place file at: ${imgEl.getAttribute('src')}</small>
    `;
    slot.appendChild(inner);
  }
}

document.addEventListener('DOMContentLoaded', function(){

  /* ---------- AOS init ---------- */
  if(window.AOS){
    AOS.init({
      duration: 700,
      once: true,
      offset: 60,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }

  /* ---------- Navbar scroll state ---------- */
  const nav = document.getElementById('tnNav');
  function handleNavScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  handleNavScroll();
  window.addEventListener('scroll', handleNavScroll, { passive:true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('tnBurger');
  const mobileMenu = document.getElementById('tnMobileMenu');
  burger.addEventListener('click', function(){
    const open = burger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = ['journey','products','timeline','achievements','team','vision']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navLinkMap = {};
  document.querySelectorAll('.tn-link').forEach(link=>{
    navLinkMap[link.getAttribute('href').replace('#','')] = link;
  });
  const navObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = navLinkMap[id];
      if(!link) return;
      if(entry.isIntersecting){
        Object.values(navLinkMap).forEach(l=>l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Generic reveal for [data-reveal] elements ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('tn-in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Animated counters (SSIP grant etc.) ---------- */
  const counters = document.querySelectorAll('.tn-tl-counter[data-target]');
  const counterObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      counterObserver.unobserve(el);
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const prefix = el.getAttribute('data-prefix') || '';
      const duration = 1600;
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = prefix + value.toLocaleString('en-IN');
        if(progress < 1){ requestAnimationFrame(tick); }
        else{ el.textContent = prefix + target.toLocaleString('en-IN'); }
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Static "counters" (stats strip: 3rd, 1st, ₹2.5L, etc.) ---------- */
  document.querySelectorAll('.tn-stat-num[data-static]').forEach(el=>{
    const val = el.getAttribute('data-static');
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          el.textContent = val;
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.6 });
    observer.observe(el);
  });
  document.querySelectorAll('.tn-stat-num[data-count]').forEach(el=>{
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        observer.unobserve(el);
        const duration = 900;
        const start = performance.now();
        function tick(now){
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if(progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    observer.observe(el);
  });

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById('tnToTop');
  window.addEventListener('scroll', ()=>{
    toTop.classList.toggle('visible', window.scrollY > 700);
  }, { passive:true });
  toTop.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  /* ---------- Lightbox for certificate gallery ---------- */
  const certImgs = document.querySelectorAll('.tn-cert img');
  if(certImgs.length){
    const overlay = document.createElement('div');
    overlay.className = 'tn-lightbox';
    overlay.innerHTML = '<img alt="">';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(5,5,8,0.92);display:none;align-items:center;justify-content:center;padding:2rem;cursor:zoom-out;';
    overlay.querySelector('img').style.cssText = 'max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,0.6);';
    document.body.appendChild(overlay);

    certImgs.forEach(img=>{
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', ()=>{
        if(img.closest('.tn-img-slot').classList.contains('tn-missing')) return;
        overlay.querySelector('img').src = img.src;
        overlay.querySelector('img').alt = img.alt;
        overlay.style.display = 'flex';
      });
    });
    overlay.addEventListener('click', ()=> overlay.style.display = 'none');
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') overlay.style.display = 'none';
    });
  }

});


/* =========================================================
   TRINETRA — script.js
========================================================= */

/**
 * Image placeholder fallback.
 * Every real photo slot in the HTML is wrapped in a .tn-img-slot div
 * with data-label / data-icon attributes and contains an <img onerror="tnImgFallback(this)">.
 *
 * HOW IT WORKS:
 * - By default the <img> tries to load the real file from /assets/images/...
 * - If that file does not exist yet, onerror fires and this function marks
 *   the parent slot as "missing", which reveals a styled placeholder
 *   (icon + label) via CSS instead of a broken image icon.
 * - Once you add the real photo with the exact same filename into
 *   /assets/images/..., the <img> will simply load it — no code changes
 *   needed, the placeholder disappears automatically.
 */
function tnImgFallback(imgEl){
  imgEl.onerror = null; // prevent loop
  const slot = imgEl.closest('.tn-img-slot');
  if(!slot) return;
  slot.classList.add('tn-missing');

  // Build placeholder content once
  if(!slot.querySelector('.tn-placeholder-inner')){
    const label = slot.getAttribute('data-label') || 'Image';
    const icon  = slot.getAttribute('data-icon') || 'bi-image';
    const inner = document.createElement('div');
    inner.className = 'tn-placeholder-inner';
    inner.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${label}</span>
      <small>Place file at: ${imgEl.getAttribute('src')}</small>
    `;
    slot.appendChild(inner);
  }
}

/**
 * Theme (dark / light) toggle.
 * The initial theme is already applied by an inline script in <head>
 * (before first paint, to avoid a flash of the wrong theme). This just
 * wires up the toggle button and keeps localStorage in sync.
 */
function tnApplyThemeIcon(){
  const icon = document.getElementById('tnThemeIcon');
  const btn = document.getElementById('tnThemeToggle');
  if(!icon || !btn) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  icon.className = isLight ? 'bi bi-sun' : 'bi bi-moon-stars';
  btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

document.addEventListener('DOMContentLoaded', function(){
  tnApplyThemeIcon();
  const themeToggle = document.getElementById('tnThemeToggle');
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if(isLight){
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('tn-theme', 'dark');
      }else{
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('tn-theme', 'light');
      }
      tnApplyThemeIcon();
    });
  }
});


  if(window.AOS){
    AOS.init({
      duration: 700,
      once: true,
      offset: 60,
      disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }