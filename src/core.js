/* Eastwood International School, shared behaviour v6: smooth scroll, masked type, reveals,
   lazy video, nav theming, menu, page curtain, cursor. Pages add to the frame loop with EW.onFrame. */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const hasG = !!(window.gsap && window.ScrollTrigger); if (hasG) gsap.registerPlugin(ScrollTrigger);
  const mob = () => innerWidth <= 820;
  const frames = [], darkTests = [];
  const EW = window.EW = { reduced, $, $$, clamp, hasG, mob, lenis: null, onFrame: f => frames.push(f), darkTest: f => darkTests.push(f) };

  /* smooth scroll */
  if (!reduced && window.Lenis) { const lenis = EW.lenis = window.__lenis = new Lenis({ lerp: 0.1 });
    if (hasG) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const r = t => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); } }
  EW.scrollTo = (target, opts = {}) => { const el = typeof target === "string" ? $(target) : target;
    if (EW.lenis) EW.lenis.scrollTo(el, { duration: 1.5, offset: opts.offset || 0 });
    else { const y = (typeof el === "number" ? el : el.getBoundingClientRect().top + scrollY) + (opts.offset || 0); scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" }); } };

  /* page curtain: cover on the way out, the next page uncovers itself in CSS */
  const curtain = $(".curtain");
  const here = location.pathname.split("/").pop() || "index.html";
  document.addEventListener("click", e => { const a = e.target.closest("a"); if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href") || ""; if (!href || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const [file, hash] = href.split("#");
    if (!file || file === here) { if (hash) { const el = document.getElementById(hash); if (el) { e.preventDefault(); closeMenu(); EW.scrollTo(el); history.replaceState(null, "", "#" + hash); } } return; }
    if (/^(https?:|mailto:|tel:)/.test(href) || !/\.html$/.test(file) || reduced || !curtain) return;
    e.preventDefault(); try { sessionStorage.setItem("ew-pt", "1"); } catch (_) {}
    curtain.classList.add("go"); setTimeout(() => { location.href = href; }, 520); });
  addEventListener("pageshow", e => { if (e.persisted && curtain) curtain.classList.remove("go"); });

  /* masked word split that keeps <br> and inline spans */
  $$(".split").forEach(el => { if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) { ch.nodeValue.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { node.insertBefore(document.createTextNode(" "), ch); return; }
        const w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true"); const i = document.createElement("span"); i.className = "wi"; i.textContent = p; w.appendChild(i); node.insertBefore(w, ch); }); node.removeChild(ch); }
      else if (ch.nodeType === 1 && ch.tagName !== "BR" && !ch.hasAttribute("data-keep")) walk(ch); });
    walk(el); });

  /* videos load and play only while visible */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target;
    if (e.isIntersecting) { if (v.dataset.src && !v.getAttribute("src")) v.src = v.dataset.src; if (!reduced) v.play().catch(() => {}); } else if (!v.paused) v.pause(); }), { rootMargin: "25% 0px" });
  $$("video").forEach(v => vio.observe(v));

  /* reveals: headings rise word by word, marked blocks fade up, counts run once */
  if (hasG && !reduced) {
    const dir = (el, make, start = "top 85%") => ScrollTrigger.create({ trigger: el, start, onEnter: () => make(1), onEnterBack: () => make(-1) });
    $$(".split").forEach(el => { if (el.closest("[data-noreveal]")) return; const ws = el.querySelectorAll(".wi");
      dir(el, d => gsap.fromTo(ws, { yPercent: 115 * d }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.05, overwrite: "auto" })); });
    $$("[data-reveal]").forEach(el => dir(el, d => gsap.fromTo(el, { opacity: 0, y: 30 * d }, { opacity: 1, y: 0, duration: .9, ease: "power3.out", overwrite: "auto" }), "top 92%"));
    $$("[data-count]").forEach(el => { const to = +el.dataset.count, o = { v: to > 1000 ? to - 40 : 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: "power3.out", onUpdate: () => { el.firstChild.nodeValue = Math.round(o.v); } }) }); });
    const fb = $(".footer__big"); if (fb) gsap.from(fb, { yPercent: 50, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".footer", start: "top 65%" } });
  }

  /* menu */
  const menu = $("#menu"), mbtn = $(".nav__menu");
  function closeMenu() { if (!menu || !menu.classList.contains("open")) return; menu.classList.remove("open"); document.documentElement.classList.remove("menu-open"); mbtn.setAttribute("aria-expanded", "false"); menu.setAttribute("aria-hidden", "true"); EW.lenis && EW.lenis.start(); }
  if (menu && mbtn) {
    mbtn.addEventListener("click", () => { const open = !menu.classList.contains("open"); if (!open) return closeMenu();
      menu.classList.add("open"); document.documentElement.classList.add("menu-open"); mbtn.setAttribute("aria-expanded", "true"); menu.setAttribute("aria-hidden", "false"); EW.lenis && EW.lenis.stop(); setTimeout(() => { const f = $("a", menu); f && f.focus({ preventScroll: true }); }, 300); });
    addEventListener("keydown", e => { if (e.key === "Escape") { closeMenu(); mbtn.focus(); } });
    addEventListener("resize", () => { if (innerWidth > 900) closeMenu(); });
  }


  /* find your child's fit: five questions, then the enquiry form arrives prefilled */
  const fit = $("#fit");
  if (fit) {
    const TF = "https://form.typeform.com/to/Dk0kE90q";
    const steps = [
      { f: "role", t: "Let's find your child's fit.", s: "Five questions, about a minute. A real person from admissions replies.", o: [["local", "Lebanese family, based in Lebanon"], ["expat", "Expat family relocating to Lebanon"], ["return", "Lebanese family returning home"], ["abroad", "Evaluating from another country"]] },
      { f: "age", t: "How old is your child?", s: "With more than one child, start with the eldest. We'll talk about siblings.", o: [["3-6", "3 to 6, Early Years"], ["6-11", "6 to 11, Elementary"], ["11-16", "11 to 16, Middle School"], ["16-18", "16 to 18, the diploma years"]] },
      { f: "goal", t: "What matters most for their future?", s: "Pick the closest. We'll match the pathway.", o: [["global", "Universities around the world (IB Diploma)"], ["us", "Universities in the US or Canada (American Diploma)"], ["local", "Staying in Lebanon (Lebanese Programme)"], ["open", "Not sure yet, keep options open"]] },
      { f: "timing", t: "When would they start?", o: [["now", "As soon as possible, mid-year"], ["sep27", "September 2027"], ["later", "Later than that"], ["explore", "Just exploring for now"]] },
      { f: "contact", t: "Where should we reply?", s: "Admissions replies personally. No mailing list." },
      { f: "done", t: "Thank you." }
    ];
    let i = 0, d = {}, lastFocus = null;
    const T = $("#fitT"), S = $("#fitS"), Sub = $("#fitSub"), B = $("#fitB"), N = $("#fitN"), back = $("#fitBack"), next = $("#fitNext"), bar = $(".fit__bar");
    const esc = v => (v || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const render = () => { const st = steps[i];
      bar.style.setProperty("--p", ((i + 1) / steps.length * 100) + "%");
      S.textContent = st.f === "done" ? "" : `Question ${i + 1} of ${steps.length - 1}`; T.textContent = st.t;
      Sub.textContent = st.s || ""; Sub.hidden = !st.s; B.innerHTML = ""; N.hidden = st.f === "done"; back.hidden = i === 0;
      if (st.o) { const w = document.createElement("div"); w.className = "fit__opts";
        st.o.forEach(([v, l]) => { const b = document.createElement("button"); b.type = "button"; b.className = "fit__opt"; b.textContent = l; b.setAttribute("aria-pressed", String(d[st.f] === v));
          b.addEventListener("click", () => { d[st.f] = v; render(); setTimeout(() => { if (i < 4) { i++; render(); T.focus(); } }, 220); }); w.appendChild(b); });
        B.appendChild(w); next.disabled = !d[st.f]; next.textContent = "Continue"; }
      else if (st.f === "contact") { B.innerHTML = `<div class="fit__fields"><label>Parent name<input id="fN" autocomplete="name" value="${esc(d.name)}"></label><label>Email<input id="fE" type="email" autocomplete="email" value="${esc(d.email)}"></label><label>Phone, optional<input id="fP" type="tel" autocomplete="tel" value="${esc(d.phone)}"></label></div>`;
        const sync = () => { d.name = $("#fN").value.trim(); d.email = $("#fE").value.trim(); d.phone = $("#fP").value.trim(); next.disabled = !(d.name && /.+@.+\..+/.test(d.email)); };
        B.querySelectorAll("input").forEach(x => x.addEventListener("input", sync)); sync(); next.textContent = "Send to admissions"; }
      else { B.innerHTML = '<div class="fit__done"><b aria-hidden="true">✓</b><p>Your answers are on their way to admissions. One last step: the enquiry form opens with them filled in, so you only confirm the details.</p></div>'; } };
    const open = () => { lastFocus = document.activeElement; i = 0; d = {}; render(); fit.hidden = false; requestAnimationFrame(() => fit.classList.add("open")); document.documentElement.classList.add("fit-open"); closeMenu(); EW.lenis && EW.lenis.stop(); setTimeout(() => T.focus(), 60); };
    const close = () => { fit.classList.remove("open"); document.documentElement.classList.remove("fit-open"); EW.lenis && EW.lenis.start(); setTimeout(() => { fit.hidden = true; }, 350); lastFocus && lastFocus.focus && lastFocus.focus(); };
    next.addEventListener("click", () => { if (steps[i].f === "contact") { const q = ["role", "age", "goal", "timing", "name", "email", "phone"].map(k => k + "=" + encodeURIComponent(d[k] || "")).join("&"); i++; render(); setTimeout(() => { location.href = TF + "#" + q; }, 1600); return; } if (i < steps.length - 1) { i++; render(); T.focus(); } });
    back.addEventListener("click", () => { if (i > 0) { i--; render(); T.focus(); } });
    document.addEventListener("click", e => { if (e.target.closest("[data-fit]")) { e.preventDefault(); open(); } else if (e.target.closest("[data-fit-close]") || e.target === fit) close(); });
    addEventListener("keydown", e => { if (fit.hidden) return; if (e.key === "Escape") close();
      if (e.key === "Tab") { const f = [...fit.querySelectorAll("button:not([disabled]):not([hidden]),input")].filter(x => x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
    if (location.hash === "#fit") addEventListener("load", () => setTimeout(open, 400));
  }

  /* one loop: nav theme and hide, then every page system */
  const nav = $("#nav"), darks = $$("[data-dark]").filter(d => !d.classList.contains("menu")); let lastY = scrollY;
  const loop = () => { const vh = innerHeight, y = scrollY, dy = y - lastY;
    let dark = false; for (const d of darks) { const r = d.getBoundingClientRect(); if (r.top <= 40 && r.bottom >= 40) { dark = true; break; } }
    if (!dark) for (const t of darkTests) if (t()) { dark = true; break; }
    nav.classList.toggle("dark", dark);
    if (!document.documentElement.classList.contains("menu-open")) { if (dy > 2 && y > vh * .8) nav.classList.add("hide"); else if (dy < -2 || y < 10) nav.classList.remove("hide"); }
    for (const f of frames) f({ y, vh, dy });
    lastY = y; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  /* arriving with a hash: wait for layout, then glide */
  if (location.hash) addEventListener("load", () => { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => EW.scrollTo(el), 150); });

  /* cursor (desktop) */
  if (matchMedia("(hover:hover)").matches) { const c = $("#cur"); if (c) { let x = innerWidth / 2, yy = innerHeight / 2, cx = x, cy = yy;
    addEventListener("pointermove", e => { x = e.clientX; yy = e.clientY; });
    document.addEventListener("pointerover", e => c.classList.toggle("big", !!e.target.closest("a,button,label")));
    const m = () => { cx += (x - cx) * .2; cy += (yy - cy) * .2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(m); }; m(); } }
})();
