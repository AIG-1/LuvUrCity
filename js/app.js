/* LuvUrCity site script — content comes from /data/*.json (edited in /admin) */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => {
    const s = String(u ?? "").trim();
    return /^(https?:|mailto:|tel:|#|\/)/i.test(s) ? s : "#";
  };
  /* Same-page anchors in admin data (#svc-health, #booking) work from every page */
  const PAGE = document.body.dataset.page || "home";
  const link = (u) => {
    const s = safeUrl(u);
    if (!s.startsWith("#") || s === "#") return s;
    if (document.getElementById(s.slice(1))) return s;
    if (PAGE !== "services" && /^#(svc-|services)/.test(s)) return "/services.html" + s;
    return PAGE === "home" ? s : "/" + s;
  };
  const tel = (p) => "tel:+1" + String(p || "").replace(/\D/g, "").replace(/^1/, "");
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  const getJSON = (name) => fetch(`/data/${name}.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = {
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M8 11h2l1-2 2 4 1-2h2"/>',
    smile: '<circle cx="12" cy="12" r="8"/><path d="M9 14a4 4 0 0 0 6 0M9.5 9.5h.01M14.5 9.5h.01"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/>',
    dove: '<path d="M4 15c4 0 6-2 7-6l2-4 2 3 4 1-3 2c0 5-4 8-9 8l-3-1Z"/><path d="M11 9c-2-1-4-1-6 0"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/><path d="M6 6l9-3 2 3"/>',
    plus: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
    home: '<path d="M4 11 12 4l8 7v9H4Z"/><path d="M10 20v-5h4v5"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'
  };
  const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ICONS.shield}</svg>`;

  const SOCIAL = {
    instagram: '<path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8c-.1-1.6-.4-3-1.6-4.2S16.8 2.1 15.2 2C13.6 2 10.4 2 8.8 2 7.2 2.1 5.8 2.4 4.6 3.6S2.9 6.4 2.8 8c-.1 1.6-.1 6.4 0 8 .1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.8.1 8.4 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.4 0-8Z"/>',
    facebook: '<path d="M14 8V6.2c0-.8.2-1.2 1.4-1.2H17V2h-2.6C11.5 2 10.6 3.4 10.6 6v2H8v3h2.6v11H14V11h2.7l.3-3Z"/>',
    x: '<path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z"/>',
    snapchat: '<path d="M12 2.5c3 0 5.3 2.4 5.3 5.3v2.3l1.6-.5c.6 0 1 .6.6 1.1-.4.4-1.5.8-2 1 .4 1.8 1.9 3.4 3.7 4 .6.2.5 1-.1 1.2-.8.3-1.6.4-2 .6-.2.4-.1 1.2-.7 1.3-.6.1-1.4-.3-2.6.2-1 .4-1.8 1.5-3.8 1.5s-2.8-1.1-3.8-1.5c-1.2-.5-2-.1-2.6-.2-.6-.1-.5-.9-.7-1.3-.4-.2-1.2-.3-2-.6-.6-.2-.7-1-.1-1.2 1.8-.6 3.3-2.2 3.7-4-.5-.2-1.6-.6-2-1-.4-.5 0-1.1.6-1.1l1.6.5V7.8c0-2.9 2.3-5.3 5.3-5.3Z"/>'
  };

  const setText = (id, v) => { const el = document.getElementById(id); if (el && v) el.textContent = v; };

  /* Motion controls (WCAG 2.2.2 pause, stop, hide) */
  function wireMotion() {
    document.querySelectorAll(".motion-btn").forEach((btn) => {
      const host = btn.closest(".ticker, .flyers");
      btn.addEventListener("click", () => {
        const on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(on));
        host.classList.toggle("paused", on);
        btn.textContent = on ? "▶" : "❚❚";
        btn.setAttribute("aria-label", (on ? "Play " : "Pause ") + (btn.dataset.target === "ticker" ? "scrolling links" : "flyer carousel"));
      });
    });
  }

  /* Duplicate a list for a seamless loop; the copy is hidden from assistive tech and keyboard */
  function loop(track, html) {
    track.innerHTML = html + html;
    const items = track.children, half = items.length / 2;
    for (let i = half; i < items.length; i++) {
      items[i].setAttribute("aria-hidden", "true");
      items[i].setAttribute("tabindex", "-1");
    }
  }

  function renderSite(s) {
    if (!s) return;
    if (s.conceptPreview) $("#conceptBar").hidden = false;
    if (s.logo && $("#brandLogoImg")) $("#brandLogoImg").src = s.logo;
    const h = s.hero || {};
    if ($("#heroHeadline")) {
      setText("heroEyebrow", h.eyebrow); setText("heroHeadline", h.headline); setText("heroSub", h.subhead);
      setText("heroCta1", h.ctaPrimary); setText("heroCta2", h.ctaSecondary); setText("heroTitle", s.agentTitle);
      $("#heroCta2").href = tel(s.phone);
      if (s.headshot) $("#heroPhoto").src = s.headshot;
      if (s.agentName) $("#heroPhoto").alt = `${s.agentName}, ${s.agentTitle || "licensed insurance agent"}`;
      $("#heroTrust").innerHTML = (h.trust || []).map((t) => `<li>${esc(t)}</li>`).join("");
    }

    const w = s.why || {};
    if ($("#whyList")) {
      setText("whyTitle", w.title); setText("whyIntro", w.intro);
      $("#whyList").innerHTML = (w.items || []).map((i) => `<li><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></li>`).join("");
    }

    const b = s.booking || {};
    if ($("#bkPhone")) {
      setText("bookingTitle", b.title); setText("bookingText", b.text);
      const bp = $("#bkPhone"); bp.textContent = s.phone; bp.href = tel(s.phone);
      const bi = $("#bkEmailIns"); bi.textContent = s.emailInsurance; bi.href = "mailto:" + s.emailInsurance;
      const bc = $("#bkEmailCity"); bc.textContent = s.emailCity; bc.href = "mailto:" + s.emailCity;
      $("#bkLink").href = safeUrl(s.bookingUrl);
      $("#calLoad").addEventListener("click", () => {
        const url = safeUrl(s.bookingUrl);
        $("#calendarCard").innerHTML = `<iframe title="Schedule a consultation with ${esc(s.agentName)}" src="${esc(url)}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1" loading="lazy"></iframe>`;
      });
    }
    document.querySelectorAll("[data-tel]").forEach((a) => { a.href = tel(s.phone); if (!a.dataset.keep) a.textContent = a.textContent.replace(/\d{3}-\d{3}-\d{4}/, s.phone); });
    document.querySelectorAll("[data-book]").forEach((a) => { a.href = safeUrl(s.bookingUrl); });

    setText("signupTitle", (s.signup || {}).title); setText("signupText", (s.signup || {}).text);

    $("#footAgent").textContent = `${s.agentName} · ${s.agentTitle}`;
    setText("footBrandLine", `${s.brandLine} · ${s.tagline}`);
    $("#social").innerHTML = ["instagram", "facebook", "x", "snapchat"].filter((k) => s[k])
      .map((k) => `<a href="${esc(safeUrl(s[k]))}" target="_blank" rel="noopener" aria-label="LuvUrCity on ${k === "x" ? "X" : k[0].toUpperCase() + k.slice(1)}"><svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL[k]}</svg></a>`).join("");
    $("#footContact").innerHTML = `
      <li><a href="${tel(s.phone)}">${esc(s.phone)}</a> (call or text)</li>
      <li>Insurance: <a href="mailto:${esc(s.emailInsurance)}">${esc(s.emailInsurance)}</a></li>
      <li>Consulting: <a href="mailto:${esc(s.emailCity)}">${esc(s.emailCity)}</a></li>
      <li>${esc(s.serviceArea)}</li>
      <li>By appointment</li>`;
    const d = s.disclaimers || {};
    $("#disclaimers").innerHTML = `
      <p><strong>Licensing:</strong> ${esc(s.agentName)}, licensed insurance agent in ${esc(s.licensedStates)}. NPN ${esc(s.npn)}.</p>
      ${d.tpmo ? `<p><strong>Medicare disclaimer:</strong> ${esc(d.tpmo)}</p>` : ""}
      ${d.government ? `<p>${esc(d.government)}</p>` : ""}
      ${d.general ? `<p>${esc(d.general)}</p>` : ""}
      ${d.consent ? `<p>${esc(d.consent)}</p>` : ""}`;
  }

  function renderTicker(t) {
    if (!t || !t.items) return;
    const track = $("#tickerTrack"); if (!track) return;
    track.style.setProperty("--dur", (t.speed || 40) + "s");
    loop(track, t.items.map((i) => `<a href="${esc(link(i.link))}">${esc(i.text)}</a>`).join(""));
  }

  function renderFlyers(f) {
    if (!$(".flyers")) return;
    if (!f || !f.flyers || !f.flyers.length) { $(".flyers").hidden = true; return; }
    const track = $("#flyerTrack");
    track.style.setProperty("--dur", (f.speed || 45) + "s");
    loop(track, f.flyers.map((x, i) =>
      `<button class="flyer" type="button" data-i="${i}" aria-label="Enlarge flyer: ${esc(x.title)}"><img src="${esc(x.image)}" alt="${esc(x.alt || x.title)}" loading="eager" decoding="async"></button>`).join(""));
    const lb = $("#lightbox");
    track.addEventListener("click", (e) => {
      const b = e.target.closest(".flyer"); if (!b) return;
      const x = f.flyers[b.dataset.i];
      $("#lbImg").src = x.image; $("#lbImg").alt = x.alt || x.title; $("#lbCaption").textContent = x.title;
      if (lb.showModal) lb.showModal();
    });
    $("#lbClose").addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  }

  function renderServices(s) {
    if (!s || !s.services || !$("#svcGrid")) return;
    setText("servicesTitle", s.title); setText("servicesIntro", s.intro);
    $("#svcGrid").innerHTML = s.services.map((x) => {
      const biz = x.contact === "city";
      return `<article class="svc${biz ? " featured" : ""}" id="${esc(x.id)}">
        <span class="svc-icon">${icon(x.icon)}</span>
        <h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>
        <a href="#booking">${biz ? "Talk business →" : "Get guidance →"}</a></article>`;
    }).join("");
    if (location.hash.startsWith("#svc-")) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  }

  function renderReviews(r) {
    if (!r || !$("#reviewGrid")) return;
    setText("reviewsTitle", r.title);
    const list = (r.reviews || []).filter((x) => x.published !== false);
    $("#reviewGrid").innerHTML = list.length
      ? list.map((x) => {
          const n = Math.max(1, Math.min(5, Number(x.rating) || 5));
          return `<figure class="review"><span class="stars" role="img" aria-label="${n} out of 5 stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>
          <blockquote>${esc(x.text)}</blockquote><figcaption>${esc(x.name)}${x.city ? ", " + esc(x.city) : ""}</figcaption></figure>`;
        }).join("")
      : `<div class="review-empty"><span class="stars" aria-hidden="true">★★★★★</span>${esc(r.emptyText)}</div>`;
  }

  function renderPosts(p) {
    if (!p || !p.posts || !$("#postGrid")) return;
    setText("postsTitle", p.title);
    const fmt = (d) => { const t = new Date(d + "T12:00:00"); return isNaN(t) ? "" : t.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
    $("#postGrid").innerHTML = p.posts.slice(0, 3).map((x) => `
      <a class="post" href="${esc(safeUrl(x.link))}">
        <div class="post-img">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : `<span class="ph" aria-hidden="true">LuvUrCity</span>`}</div>
        <div class="post-body"><span class="post-meta">${esc(x.category)}${x.date ? " · " + fmt(x.date) : ""}</span>
        <h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p></div></a>`).join("");
  }

  /* City bot — scripted, no AI API, no data stored */
  function initBot(cfg) {
    if (!cfg) return;
    const panel = $("#botPanel"), launch = $("#botLaunch"), log = $("#botLog"), chips = $("#botChips");
    if (cfg.avatar) document.querySelectorAll(".bot-face").forEach((f) => (f.innerHTML = `<img src="${esc(cfg.avatar)}" alt="">`));
    else document.querySelectorAll(".bot-face").forEach((f) => (f.textContent = (cfg.name || "C")[0]));
    document.querySelectorAll(".bot-name, #botTitle").forEach((n) => (n.textContent = cfg.name || "City"));
    let started = false;

    const say = (text, cls = "bot-msg", actions) => {
      const m = document.createElement("div");
      m.className = "msg " + cls;
      m.innerHTML = esc(text) + (actions && actions.length
        ? `<div class="msg-actions">${actions.map((a) => `<a href="${esc(link(a.link))}"${/^https?:/.test(a.link) ? ' target="_blank" rel="noopener"' : ""}>${esc(a.label)}</a>`).join("")}</div>` : "");
      log.appendChild(m); log.scrollTop = log.scrollHeight;
    };
    const answer = (opt) => say(opt.answer, "bot-msg", opt.actions);
    const start = () => {
      if (started) return; started = true;
      say(cfg.greeting); say(cfg.disclosure, "note-msg");
      chips.innerHTML = (cfg.options || []).map((o, i) => `<button type="button" data-i="${i}">${esc(o.label)}</button>`).join("");
    };
    const open = (focus = true) => {
      start(); panel.hidden = false; launch.setAttribute("aria-expanded", "true");
      if (focus) $("#botText").focus();
    };
    const close = () => { panel.hidden = true; launch.setAttribute("aria-expanded", "false"); launch.focus(); };

    launch.addEventListener("click", () => (panel.hidden ? open() : close()));
    $("#botClose").addEventListener("click", close);
    panel.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    log.addEventListener("click", (e) => { if (e.target.closest(".msg-actions a[href^='#']")) close(); });
    chips.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const o = cfg.options[b.dataset.i]; say(o.label, "user-msg"); answer(o);
    });
    $("#botForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#botText"), q = input.value.trim(); if (!q) return;
      say(q, "user-msg"); input.value = "";
      const ql = q.toLowerCase();
      let best = null, score = 0;
      (cfg.options || []).forEach((o) => {
        const s = String(o.keywords || "").split(",").map((k) => k.trim().toLowerCase()).filter(Boolean)
          .reduce((n, k) => n + (ql.includes(k) ? k.length : 0), 0);
        if (s > score) { score = s; best = o; }
      });
      if (best) answer(best);
      else say(cfg.fallback, "bot-msg", [{ label: "Call or text", link: "tel:+18727777991" }, { label: "Book a call", link: "#booking" }]);
    });

    const secs = Number(cfg.autoOpenSeconds) || 0;
    if (secs > 0 && !store.get("cityGreeted") && window.innerWidth > 900) {
      setTimeout(() => { if (panel.hidden) { open(false); store.set("cityGreeted", "1"); } }, secs * 1000);
    }
  }

  /* ---------- Inner pages ---------- */
  const list = (a) => (a || []).map((x) => `<li>${esc(x)}</li>`).join("");
  const mail = (to, subject) => `mailto:${to}?subject=${encodeURIComponent(subject)}`;

  function renderPageHead(d) {
    setText("pageKicker", d.kicker); setText("pageTitle", d.headline || d.title); setText("pageIntro", d.intro);
  }

  function renderAbout(a, site) {
    if (!a || !$("#aboutStory")) return;
    renderPageHead(a);
    if (a.photo || (site && site.headshot)) $("#aboutPhoto").src = a.photo || site.headshot;
    $("#aboutStory").innerHTML = (a.story || []).map((p) => `<p>${esc(p)}</p>`).join("");
    $("#aboutCreds").innerHTML = (a.credentials || []).map((c) => `<li><strong>${esc(c.label)}</strong><span>${esc(c.detail)}</span></li>`).join("");
    setText("aboutMissionTitle", a.missionTitle); setText("aboutMission", a.mission);
    $("#aboutValues").innerHTML = (a.values || []).map((v) => `<li><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join("");
  }

  function renderServicesPage(s, site) {
    if (!s || !$("#svcDetail")) return;
    renderPageHead({ kicker: s.pageKicker, headline: s.pageHeadline, intro: s.pageIntro });
    const ins = s.services.filter((x) => x.contact !== "city"), biz = s.services.filter((x) => x.contact === "city");
    $("#svcJump").innerHTML = s.services.map((x) => `<a href="#${esc(x.id)}">${esc(x.title)}</a>`).join("");
    const card = (x) => {
      const isBiz = x.contact === "city", to = isBiz ? site.emailCity : site.emailInsurance;
      return `<article class="svc-row${isBiz ? " biz" : ""}" id="${esc(x.id)}">
        <span class="svc-icon">${icon(x.icon)}</span>
        <div class="svc-row-body">
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.details || x.text)}</p>
          ${x.whoFor && x.whoFor.length ? `<p class="who">Good fit for:</p><ul class="ticks">${list(x.whoFor)}</ul>` : ""}
          <div class="row-ctas">
            <a class="btn btn-sm btn-magenta" href="/#booking">Book a free consult</a>
            <a class="btn btn-sm btn-outline" href="${esc(mail(to, x.title + " question"))}">Email about this</a>
            ${isBiz ? `<a class="btn btn-sm btn-outline" href="/shop.html">See packages</a>` : ""}
          </div>
        </div></article>`;
    };
    $("#svcDetail").innerHTML = `<h2 class="group-title">Insurance & benefits</h2>${ins.map(card).join("")}
      ${biz.length ? `<h2 class="group-title">Small business</h2>${biz.map(card).join("")}` : ""}`;
    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView(), 50); }
  }

  function renderShop(sh, site) {
    if (!sh || !$("#shopGrid")) return;
    renderPageHead(sh);
    $("#shopGrid").innerHTML = (sh.packages || []).filter((p) => p.active !== false).map((p) => {
      const href = p.stripeLink ? safeUrl(p.stripeLink) : mail(site.emailCity, "Package request: " + p.name);
      const ext = /^https?:/.test(p.stripeLink || "") ? ' target="_blank" rel="noopener"' : "";
      return `<article class="pkg${p.featured ? " featured" : ""}">
        ${p.featured ? `<span class="pkg-badge">Most popular</span>` : ""}
        <h3>${esc(p.name)}</h3>
        <p class="pkg-price"><span>${esc(p.price)}</span>${p.cadence ? `<small>${esc(p.cadence)}</small>` : ""}</p>
        <p class="pkg-sum">${esc(p.summary)}</p>
        <ul class="ticks">${list(p.features)}</ul>
        <a class="btn ${p.featured ? "btn-gold" : "btn-magenta"}" href="${esc(href)}"${ext}>${esc(p.stripeLink ? p.buttonText || "Buy now" : p.requestText || "Request this package")}</a>
      </article>`;
    }).join("");
    $("#shopNotes").innerHTML = (sh.notes || []).map((n) => `<p>${esc(n)}</p>`).join("");
  }

  function renderFaq(f) {
    if (!f || !$("#faqList")) return;
    renderPageHead(f);
    const groups = f.groups || [];
    $("#faqNav").innerHTML = groups.map((g, i) => `<a href="#faq-${i}">${esc(g.title)}</a>`).join("");
    $("#faqList").innerHTML = groups.map((g, i) => `
      <section class="faq-group" id="faq-${i}" aria-labelledby="faqh-${i}">
        <h2 id="faqh-${i}">${esc(g.title)}</h2>
        ${(g.items || []).map((q) => `<details class="faq"><summary>${esc(q.q)}</summary><div class="faq-a">${(q.a || "").split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}</div></details>`).join("")}
      </section>`).join("");
  }


  /* Tiny, safe Markdown: headings, lists, bold, italic, links, paragraphs */
  function md(src) {
    const inline = (t) => esc(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, url) => `<a href="${esc(safeUrl(url.replace(/&amp;/g, "&")))}">${txt}</a>`);
    const out = []; let list = null;
    const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
    String(src || "").split(/\r?\n/).forEach((line) => {
      const t = line.trim(); let m;
      if (!t) { close(); return; }
      if ((m = t.match(/^(#{2,4})\s+(.*)/))) { close(); const n = m[1].length; out.push(`<h${n}>${inline(m[2])}</h${n}>`); return; }
      if ((m = t.match(/^[-*]\s+(.*)/))) { if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(m[1])}</li>`); return; }
      if ((m = t.match(/^\d+\.\s+(.*)/))) { if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(m[1])}</li>`); return; }
      close(); out.push(`<p>${inline(t)}</p>`);
    });
    close(); return out.join("\n");
  }
  const fmtDate = (d) => { if (!d) return ""; const t = new Date(String(d).slice(0, 10) + "T12:00:00"); return isNaN(t) ? "" : t.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); };

  function renderEvents(ev) {
    if (!ev || !$("#eventList")) return;
    renderPageHead(ev);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const items = (ev.events || []).map((e) => ({ ...e, _d: e.date ? new Date(String(e.date).slice(0, 10) + "T12:00:00") : null }));
    const upcoming = items.filter((e) => !e._d || e._d >= today).sort((a, b) => (a._d || 9e15) - (b._d || 9e15));
    const past = items.filter((e) => e._d && e._d < today).sort((a, b) => b._d - a._d);
    const card = (e, isPast) => {
      const d = e._d;
      const chip = d ? `<span class="ev-date"><b>${d.toLocaleDateString("en-US", { month: "short" })}</b><i>${d.getDate()}</i></span>` : `<span class="ev-date tba"><b>Date</b><i>TBA</i></span>`;
      return `<article class="event${isPast ? " past" : ""}">
        <div class="ev-media">${e.image ? `<img src="${esc(e.image)}" alt="" loading="lazy">` : `<span class="ev-ph" aria-hidden="true">${esc((e.type || "Event"))}</span>`}${chip}</div>
        <div class="ev-body">
          <p class="ev-meta">${esc(e.type || "")}${e.format ? " · " + esc(e.format) : ""}</p>
          <h3>${esc(e.title)}</h3>
          <ul class="ev-facts">
            <li><span>When</span>${d ? esc(fmtDate(e.date)) : esc(e.status || "Date coming soon")}${e.time ? " · " + esc(e.time) : ""}</li>
            <li><span>Where</span>${esc(e.location || "TBA")}</li>
          </ul>
          <p>${esc(e.summary)}</p>
          ${!isPast && e.link ? `<a class="btn btn-sm btn-magenta" href="${esc(link(e.link))}">${esc(e.linkText || "Learn more")}</a>` : ""}
        </div></article>`;
    };
    $("#eventList").innerHTML = upcoming.length ? upcoming.map((e) => card(e, false)).join("") : `<div class="review-empty">${esc(ev.emptyText)}</div>`;
    const pw = $("#pastWrap");
    if (pw) { pw.hidden = !past.length; $("#pastList").innerHTML = past.map((e) => card(e, true)).join(""); }
  }

  function videoEmbed(url) {
    const u = String(url || "");
    let m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="Video" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    m = u.match(/vimeo\.com\/(\d+)/);
    if (m) return `<iframe src="https://player.vimeo.com/video/${m[1]}" title="Video" loading="lazy" allowfullscreen></iframe>`;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u) || u.startsWith("/images/")) return `<video src="${esc(u)}" controls preload="metadata" playsinline></video>`;
    return `<a class="btn btn-outline" href="${esc(safeUrl(u))}" target="_blank" rel="noopener">Watch video</a>`;
  }

  function renderGallery(g) {
    if (!g || !$("#galleryGrid")) return;
    renderPageHead(g);
    const items = g.items || [];
    $("#galleryGrid").innerHTML = items.map((x, i) => x.type === "video"
      ? `<figure class="g-item video"><div class="g-video">${videoEmbed(x.video || x.src)}</div>${x.caption ? `<figcaption>${esc(x.caption)}</figcaption>` : ""}</figure>`
      : `<figure class="g-item"><button type="button" class="g-open" data-i="${i}" aria-label="Enlarge: ${esc(x.caption || x.alt)}"><img src="${esc(x.src)}" alt="${esc(x.alt || x.caption)}" loading="lazy"></button>${x.caption ? `<figcaption>${esc(x.caption)}</figcaption>` : ""}</figure>`).join("");
    const lb = $("#lightbox");
    $("#galleryGrid").addEventListener("click", (e) => {
      const b = e.target.closest(".g-open"); if (!b) return;
      const x = items[b.dataset.i];
      $("#lbImg").src = x.src; $("#lbImg").alt = x.alt || x.caption || ""; $("#lbCaption").textContent = x.caption || "";
      if (lb.showModal) lb.showModal();
    });
    $("#lbClose").addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  }

  function renderBlog(p) {
    if (!p || !$("#blogList")) return;
    renderPageHead(p);
    const posts = [...(p.posts || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $("#blogList").innerHTML = posts.map((x) => `
      <a class="post" href="${esc(x.slug ? "/post.html?p=" + encodeURIComponent(x.slug) : safeUrl(x.link))}">
        <div class="post-img">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : `<span class="ph" aria-hidden="true">LuvUrCity</span>`}</div>
        <div class="post-body"><span class="post-meta">${esc(x.category)}${x.date ? " · " + esc(fmtDate(x.date)) : ""}</span>
        <h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p></div></a>`).join("");
  }

  function renderPost(p) {
    if (!p || !$("#postBody")) return;
    const slug = new URLSearchParams(location.search).get("p");
    const post = (p.posts || []).find((x) => x.slug === slug);
    if (!post) { setText("pageTitle", "Article not found"); $("#postBody").innerHTML = `<p>This article may have moved. <a href="/blog.html">See all articles</a>.</p>`; return; }
    document.title = post.title + " | LuvUrCity";
    setText("pageKicker", post.category); setText("pageTitle", post.title);
    setText("pageIntro", [post.author, fmtDate(post.date)].filter(Boolean).join(" · "));
    $("#postCrumb").textContent = post.title;
    $("#postBody").innerHTML = (post.image ? `<img class="post-hero" src="${esc(post.image)}" alt="">` : "") + md(post.body || post.excerpt);
    const others = (p.posts || []).filter((x) => x !== post).slice(0, 2);
    $("#postMore").innerHTML = others.map((x) => `<a class="more-link" href="/post.html?p=${encodeURIComponent(x.slug)}"><span>${esc(x.category)}</span>${esc(x.title)}</a>`).join("");
  }

  function renderReviewsPage(r) {
    if (!r || !$("#reviewLinks")) return;
    renderPageHead(r);
    $("#reviewLinks").innerHTML = [r.googleUrl && `<a class="btn btn-outline" href="${esc(safeUrl(r.googleUrl))}" target="_blank" rel="noopener">Review us on Google</a>`,
      r.facebookUrl && `<a class="btn btn-outline" href="${esc(safeUrl(r.facebookUrl))}" target="_blank" rel="noopener">See us on Facebook</a>`].filter(Boolean).join("");
  }

  function renderContact(c, site) {
    if (!c || !$("#contactForm")) return;
    renderPageHead(c);
    setText("ctHours", c.hours); setText("ctResponse", c.responseTime); setText("ctNote", c.formNote);
    const ph = $("#ctPhone"); ph.textContent = site.phone; ph.href = tel(site.phone);
    const ei = $("#ctEmailIns"); ei.textContent = site.emailInsurance; ei.href = "mailto:" + site.emailInsurance;
    const ec = $("#ctEmailCity"); ec.textContent = site.emailCity; ec.href = "mailto:" + site.emailCity;
    setText("ctArea", site.serviceArea);
  }

  function renderLegal(l) {
    const key = document.body.dataset.legal;
    if (!l || !key || !l[key] || !$("#legalBody")) return;
    const d = l[key];
    setText("pageTitle", d.title); setText("pageIntro", d.updated ? "Last updated " + fmtDate(d.updated) : "");
    $("#legalBody").innerHTML = md(d.body);
  }

  /* Contact form: route to the insurance or consulting inbox by topic */
  function initContactForm() {
    const f = $("#contactForm"); if (!f) return;
    const topic = $("#ctTopic"), nameInput = f.querySelector('input[name="form-name"]');
    const set = () => {
      const biz = /consulting|events|something else/i.test(topic.value);
      const n = biz ? "contact-consulting" : "contact-insurance";
      f.setAttribute("name", n); nameInput.value = n;
    };
    topic.addEventListener("change", set); set();
    const q = new URLSearchParams(location.search).get("topic");
    if (q) { const o = [...topic.options].find((x) => x.value.toLowerCase().includes(q.toLowerCase())); if (o) { topic.value = o.value; set(); } }
  }

  function initNav() {
    const btn = $(".nav-toggle"), nav = $("#siteNav");
    btn.addEventListener("click", () => {
      const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o));
    });
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();
    initNav(); wireMotion();
    if (reduceMotion) document.querySelectorAll(".motion-btn").forEach((b) => (b.hidden = true));
    const PAGE_DATA = { home: ["flyers", "services", "reviews", "posts"], about: ["about"], services: ["services"], shop: ["shop"], faq: ["faq"],
      events: ["events"], gallery: ["gallery"], blog: ["posts"], post: ["posts"], reviews: ["reviews"], contact: ["contact"], legal: ["legal"] };
    initContactForm();
    const extra = PAGE_DATA[PAGE] || [];
    Promise.all(["site", "ticker", "bot", ...extra].map(getJSON)).then(([site, ticker, bot, ...rest]) => {
      const d = Object.fromEntries(extra.map((k, i) => [k, rest[i]]));
      const run = (fn) => { try { fn(); } catch (e) { console.error(e); } };
      run(() => renderSite(site));
      run(() => renderFlyers(d.flyers)); run(() => renderServices(d.services)); run(() => renderReviews(d.reviews)); run(() => renderPosts(d.posts));
      run(() => renderAbout(d.about, site)); run(() => renderServicesPage(d.services, site || {}));
      run(() => renderShop(d.shop, site || {})); run(() => renderFaq(d.faq));
      run(() => renderEvents(d.events)); run(() => renderGallery(d.gallery)); run(() => renderBlog(d.posts)); run(() => renderPost(d.posts));
      run(() => renderReviewsPage(d.reviews)); run(() => renderContact(d.contact, site || {})); run(() => renderLegal(d.legal));
      run(() => renderTicker(ticker)); /* after page content so anchors resolve */
      run(() => initBot(bot));
    });
  });
})();

/* Send invited admins from the homepage to /admin after accepting a Netlify Identity invite */
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", (user) => {
    if (!user) window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; });
  });
}
