// ============================================================
// EVENT CONFIG — edit these values (visible text lives in index.html)
// ============================================================
const CONFIG = {
  // Start and end of the party, with the Belgrade UTC offset (+01:00 in winter, +02:00 in summer)
  start: "2026-12-12T20:00:00+01:00",
  end: "2026-12-13T03:00:00+01:00",

  // Phone number for RSVPs, international format without "+" or spaces (e.g. 381641234567)
  phone: "38166141133",

  // What gets searched in Google Maps
  mapQuery: "Hotel Vila Konak",

  // Google Form that collects "Dolazim" RSVPs. Entry IDs come from the form's ⋮ menu → "Get pre-filled link".
  // attendingValue must match the multiple-choice option text exactly, emoji included.
  // The form must not require sign-in, or Google rejects every submission.
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfWLk4R4nvYp5ryEY9n-BIbou55LYQ9gTzPKRMjHzdEvGI2Zw/formResponse",
  nameField: "entry.559352220",
  attendingField: "entry.877086558",
  attendingValue: "Dolazim naravno! 😁",

  // Prefilled WhatsApp/Viber messages
  rsvpYes: "Ćao Nina! 🎉 Dolazim na tvoj 18. rođendan, jedva čekam!",
  rsvpNo: "Ćao Nina! Nažalost, ne mogu da dođem na proslavu 😔 Srećan ti 18. rođendan!",
};

const startTime = new Date(CONFIG.start).getTime();
const endTime = new Date(CONFIG.end).getTime();

// ---------- Links ----------
function setupLinks() {
  const wa = (text) => `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;

  document.getElementById("map-link").href =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapQuery)}`;

  document.getElementById("rsvp-no").href = wa(CONFIG.rsvpNo);
  document.getElementById("viber-link").href =
    `viber://chat?number=%2B${CONFIG.phone}&draft=${encodeURIComponent(CONFIG.rsvpYes)}`;
  document.getElementById("whatsapp-link").href = wa(CONFIG.rsvpYes);

}

// ---------- RSVP ("Dolazim" → name → Google Form) ----------
const RSVP_KEY = "nina18-rsvp-name";

function setupRsvp() {
  const yes = document.getElementById("rsvp-yes");
  const buttons = document.getElementById("rsvp-buttons");
  const form = document.getElementById("rsvp-form");
  const input = document.getElementById("rsvp-name");
  const submit = document.getElementById("rsvp-submit");
  const error = document.getElementById("rsvp-error");
  const thanks = document.getElementById("rsvp-thanks");

  function showThanks(name) {
    buttons.hidden = true;
    form.hidden = true;
    thanks.hidden = false;
    thanks.textContent = `Hvala, ${name}! Upisan/a si na listu. Vidimo se! 🎉`;
  }

  // Don't offer the form again to someone who already confirmed on this phone
  try {
    const saved = localStorage.getItem(RSVP_KEY);
    if (saved) showThanks(saved);
  } catch (e) { /* storage unavailable; just show the form */ }

  yes.addEventListener("click", () => {
    form.hidden = false;
    yes.setAttribute("aria-expanded", "true");
    input.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) return;

    submit.disabled = true;
    submit.textContent = "Šaljem…";
    error.hidden = true;

    try {
      // Google Forms doesn't allow cross-origin reads, so the response is opaque:
      // a resolved fetch means the request went out, a rejection means a network error.
      await fetch(CONFIG.formUrl, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          [CONFIG.nameField]: name,
          [CONFIG.attendingField]: CONFIG.attendingValue,
        }),
      });
      try { localStorage.setItem(RSVP_KEY, name); } catch (e) { /* ignore */ }
      showThanks(name);
      burst(160);
    } catch (e) {
      error.hidden = false;
      submit.disabled = false;
      submit.textContent = "Pošalji";
    }
  });
}

// ---------- Countdown ----------
// Serbian plural forms: 1 dan, 2 dana, 5 dana, 21 dan...
const PLURALS = {
  days: ["dan", "dana", "dana"],
  hours: ["sat", "sata", "sati"],
  minutes: ["minut", "minuta", "minuta"],
  seconds: ["sekunda", "sekunde", "sekundi"],
};

function pluralSr(n, [one, few, many]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function setupCountdown() {
  const grid = document.getElementById("countdown");
  const title = document.getElementById("cd-title");
  const message = document.getElementById("cd-message");
  const nums = {};
  const labels = {};
  for (const unit of Object.keys(PLURALS)) {
    nums[unit] = grid.querySelector(`[data-unit="${unit}"]`);
    labels[unit] = grid.querySelector(`[data-label="${unit}"]`);
  }

  let timer;
  function tick() {
    const now = Date.now();
    if (now >= startTime) {
      clearInterval(timer);
      grid.hidden = true;
      title.hidden = true;
      message.hidden = false;
      message.textContent = now < endTime
        ? "Žurka je upravo počela — požuri! 🥂"
        : "Hvala svima što ste bili deo ove večeri. 🤍";
      return;
    }
    const total = Math.floor((startTime - now) / 1000);
    const values = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
    for (const unit of Object.keys(values)) {
      nums[unit].textContent = values[unit];
      labels[unit].textContent = pluralSr(values[unit], PLURALS[unit]);
    }
  }
  tick();
  timer = setInterval(tick, 1000);
}

// ---------- Reveal on scroll ----------
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
}

// ---------- Confetti ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const COLORS = ["#c98b8f", "#a8636a", "#b8935a", "#e7d3b0", "#f3c6c8", "#ffffff"];
let particles = [];
let animating = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burst(count) {
  if (reduceMotion) return;
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: -20 - Math.random() * window.innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 2,
      vy: 2 + Math.random() * 3,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      sway: Math.random() * Math.PI * 2,
    });
  }
  if (!animating) {
    animating = true;
    requestAnimationFrame(draw);
  }
}

function draw() {
  const h = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.sway += 0.05;
    p.x += p.vx + Math.sin(p.sway) * 0.8;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  particles = particles.filter((p) => p.y < h + 20);
  if (particles.length) {
    requestAnimationFrame(draw);
  } else {
    animating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ---------- Init ----------
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
setupLinks();
setupRsvp();
setupCountdown();
setupReveal();
setTimeout(() => burst(120), 400);
