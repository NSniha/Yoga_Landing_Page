/* =========================
   Scroll reveal 
========================= */
const revealItems = document.querySelectorAll(".reveal");

revealItems.forEach((el, i) => {
  const mod = i % 3;
  el.classList.add(mod === 0 ? "delay-1" : mod === 1 ? "delay-2" : "delay-3");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((el) => observer.observe(el));



/* =========================
  Header height 
========================= */
const headerEl = document.querySelector(".header");

function setHeaderHeightVar() {
  if (!headerEl) return;
  const h = headerEl.getBoundingClientRect().height || 0;
  document.documentElement.style.setProperty("--header-h", `${Math.round(h)}px`);
}

setHeaderHeightVar();
requestAnimationFrame(setHeaderHeightVar);
window.addEventListener("resize", setHeaderHeightVar);



/* =========================
   Drawer (fixed) + Overlay
========================= */
const body = document.body;
const burger = document.querySelector(".burger");
const drawer = document.querySelector(".drawer");
const overlay = document.querySelector(".overlay");
const closeTriggers = document.querySelectorAll("[data-close-drawer]");

let lastFocusedEl = null;

function setBurgerIcon(isOpen) {
  const icon = burger?.querySelector("ion-icon");
  if (!icon) return;
  icon.setAttribute("name", isOpen ? "close-outline" : "menu-outline");
}

function syncClosedState() {
  body.classList.remove("is-drawer-open");
  burger?.setAttribute("aria-expanded", "false");
  drawer?.setAttribute("aria-hidden", "true");
  setBurgerIcon(false);
}

function openDrawer() {
  if (!burger || !drawer) return;

  setHeaderHeightVar();

  lastFocusedEl = document.activeElement;

  body.classList.add("is-drawer-open");
  burger.setAttribute("aria-expanded", "true");
  drawer.setAttribute("aria-hidden", "false");
  setBurgerIcon(true);

  setTimeout(() => {
    drawer.querySelector("a,button")?.focus();
  }, 120);
}

function closeDrawer() {
  if (!burger || !drawer) return;
  syncClosedState();
  lastFocusedEl?.focus?.();
}

syncClosedState();

burger?.addEventListener("click", () => {
  const isOpen = body.classList.contains("is-drawer-open");
  isOpen ? closeDrawer() : openDrawer();
});

overlay?.addEventListener("click", closeDrawer);

closeTriggers.forEach((btn) => btn.addEventListener("click", closeDrawer));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

window.addEventListener("resize", () => {
  setHeaderHeightVar();

  if (window.innerWidth > 920 && body.classList.contains("is-drawer-open")) {
    closeDrawer();
  }
});

document.querySelectorAll(".nav--mobile a").forEach((a) => {
  a.addEventListener("click", closeDrawer);
});



/* =========================
   Trial Form Validation
========================= */
(function trialFormValidation(){
  const form = document.getElementById("trialForm");
  if (!form) return;

  const nameEl = form.querySelector("#trialName");
  const emailEl = form.querySelector("#trialEmail");
  const phoneEl = form.querySelector("#trialPhone");
  const consentEl = form.querySelector("#trialConsent");
  const msgEl = document.getElementById("trialMsg");
  const btn = form.querySelector(".trialBtn8");

  const errFor = (key) => form.querySelector(`[data-err-for="${key}"]`);

  const setMsg = (text, type) => {
    msgEl.textContent = text || "";
    msgEl.classList.remove("is-success", "is-error");
    if (type) msgEl.classList.add(type);
  };

  const setErr = (key, text) => {
    const el = errFor(key);
    if (el) el.textContent = text || "";
  };

  const cleanPhone = (v) => (v || "").replace(/[^\d+]/g, "").trim();

  const isValidPhone = (raw) => {
    const v = cleanPhone(raw).replace(/^\+/, "");
    return /^\d{8,15}$/.test(v);
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());

  const validate = () => {
    let ok = true;

    const name = (nameEl.value || "").trim();
    const email = (emailEl.value || "").trim();
    const phone = (phoneEl.value || "").trim();
    const consent = consentEl.checked;

    setErr("name", "");
    setErr("email", "");
    setErr("phone", "");
    setErr("consent", "");
    setMsg("", "");

    if (name.length < 2) {
      setErr("name", "Please enter your name.");
      ok = false;
    }

    if (!email) {
      setErr("email", "Please enter your email address.");
      ok = false;
    } else if (!isValidEmail(email)) {
      setErr("email", "Please enter a valid email address.");
      ok = false;
    }

    if (!phone) {
      setErr("phone", "Please enter your phone number.");
      ok = false;
    } else if (!isValidPhone(phone)) {
      setErr("phone", "Please enter a valid phone number (8–15 digits).");
      ok = false;
    }

    if (!consent) {
      setErr("consent", "Consent is required to continue.");
      ok = false;
    }

    return ok;
  };

  const shake = () => {
    form.classList.remove("is-shake");
    void form.offsetWidth;
    form.classList.add("is-shake");
    setTimeout(() => form.classList.remove("is-shake"), 380);
  };

  const setLoading = (state) => {
    btn.disabled = state;
    btn.classList.toggle("is-loading", state);
  };

  ["input", "blur"].forEach((ev) => {
    nameEl.addEventListener(ev, () => {
      if ((nameEl.value || "").trim().length >= 2) setErr("name", "");
    });

    emailEl.addEventListener(ev, () => {
      if (isValidEmail(emailEl.value)) setErr("email", "");
    });

    phoneEl.addEventListener(ev, () => {
      if (isValidPhone(phoneEl.value)) setErr("phone", "");
    });
  });

  consentEl.addEventListener("change", () => {
    if (consentEl.checked) setErr("consent", "");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ok = validate();
    if (!ok) {
      shake();
      setMsg("Please fix the highlighted fields.", "is-error");
      return;
    }

    const payload = {
      name: (nameEl.value || "").trim(),
      email: (emailEl.value || "").trim(),
      phone: cleanPhone(phoneEl.value || ""),
      consent: consentEl.checked,
      source: "Free Trial Form",
      submittedAt: new Date().toISOString(),
    };

    setLoading(true);
    setMsg("Sending…", "");

    try {
      await new Promise((r) => setTimeout(r, 900));

      setMsg("Thanks! We’ll contact you shortly to confirm your free trial.", "is-success");
      form.reset();
    } catch (err) {
      setMsg("Something went wrong. Please try again.", "is-error");
    } finally {
      setLoading(false);
    }
  });
})();



/* =========================
  Footer Copyright Year
========================= */
(function () {
    const y = document.getElementById("footerYear");
    if (y) y.textContent = new Date().getFullYear();
})();



/* =========================
   Footer Newsletter Validation
========================= */
(function footerNewsletterValidation(){
  const form = document.getElementById("footerNewsletter");
  if (!form) return;

  const emailEl = form.querySelector("#newsEmail");
  const msgEl = document.getElementById("newsMsg");
  const btn = form.querySelector('button[type="submit"]');

  const errFor = (key) => form.querySelector(`[data-err-for="${key}"]`);

  const setMsg = (text, type) => {
    if (!msgEl) return;
    msgEl.textContent = text || "";
    msgEl.classList.remove("is-success", "is-error");
    if (type) msgEl.classList.add(type);
  };

  const setErr = (key, text) => {
    const el = errFor(key);
    if (el) el.textContent = text || "";
  };

  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());

  const validate = () => {
    let ok = true;

    const email = (emailEl.value || "").trim();

    setErr("email", "");
    setMsg("", "");

    if (!email) {
      setErr("email", "Please enter your email address.");
      ok = false;
    } else if (!isValidEmail(email)) {
      setErr("email", "Please enter a valid email address.");
      ok = false;
    }

    return ok;
  };

  const shake = () => {
    form.classList.remove("is-shake");
    void form.offsetWidth;
    form.classList.add("is-shake");
    setTimeout(() => form.classList.remove("is-shake"), 380);
  };

  const setLoading = (state) => {
    if (!btn) return;
    btn.disabled = state;
    btn.classList.toggle("is-loading", state);
  };

  ["input", "blur"].forEach((ev) => {
    emailEl.addEventListener(ev, () => {
      if (isValidEmail(emailEl.value)) setErr("email", "");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ok = validate();
    if (!ok) {
      shake();
      setMsg("Please fix the highlighted field.", "is-error");
      return;
    }

    const payload = {
      email: (emailEl.value || "").trim(),
      source: "Footer Newsletter",
      submittedAt: new Date().toISOString(),
    };

    setLoading(true);
    setMsg("Subscribing…", "");

    try {
      await new Promise((r) => setTimeout(r, 700));

      setMsg("You’re subscribed! We’ll send updates occasionally.", "is-success");
      form.reset();
    } catch (err) {
      setMsg("Something went wrong. Please try again.", "is-error");
    } finally {
      setLoading(false);
    }
  });
})();