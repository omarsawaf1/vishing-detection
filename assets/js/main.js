// Global shared JS for "تحقّقٌ"
console.log(`  
     █████╗ ████████╗██╗
    ██╔══██║╚══██╔══╝██║░░░░░
    ██║░░██║░░░██║░░░██║░░░░░
    ██║░░██║░░░██║░░░██║░░░░░
    ██╚══██║░░░██║░░░███████╗
    ╚█████╝ ░░░╚═╝░░░╚══════╝
`);

(function () {
  const THEME_KEY = "tahaqquq.theme";
  const AUTH_KEY = "tahaqquq.auth"; // '1' when logged in

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function saveTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {}
  }

  function applyTheme(value) {
    const theme = value || "dark";
    document.documentElement.setAttribute(
      "data-theme",
      theme === "light" ? "light" : "dark"
    );
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    saveTheme(next);
    updateMenuIconForTheme();
  }

  function initThemeToggle() {
    const btn = document.querySelector('[data-action="toggle-theme"]');
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  }

  function highlightActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("a[data-nav]").forEach((a) => {
      const target = a.getAttribute("href");
      if (target && target.endsWith(path)) {
        a.classList.add("active");
      }
    });
  }

  // Simple auth helpers
  const Auth = {
    isLoggedIn() {
      try {
        return localStorage.getItem(AUTH_KEY) === "1";
      } catch {
        return false;
      }
    },
    login() {
      try {
        localStorage.setItem(AUTH_KEY, "1");
      } catch {}
    },
    logout() {
      try {
        localStorage.removeItem(AUTH_KEY);
      } catch {}
    },
  };
  window.TahaqquqAuth = Auth;

  function attachLogout() {
    document.querySelectorAll('[data-action="logout"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.logout();
        location.href = "login.html";
      });
    });
  }

  function guardRoutes() {
    const PUBLIC = new Set([
      "index.html",
      "about.html",
      "pricing.html",
      "login.html",
    ]);
    const current = (
      location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();
    const logged = Auth.isLoggedIn();
    if (!logged) {
      if (!PUBLIC.has(current)) {
        location.replace("login.html");
        return;
      }
    } else {
      if (PUBLIC.has(current)) {
        location.replace("dashboard.html");
        return;
      }
    }
  }

  function filterNavByAuth() {
    const logged = Auth.isLoggedIn();
    document.querySelectorAll("nav a[href]").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      const isPublic =
        href.endsWith("index.html") ||
        href.endsWith("about.html") ||
        href.endsWith("pricing.html") ||
        href.endsWith("login.html");
      if (!logged && !isPublic) {
        a.style.display = "none";
      }
      if (logged && isPublic) {
        a.style.display = "none";
      }
    });
    // Also toggle auth action buttons if present
    const loginBtn = document.querySelector('a[href="login.html"]');
    if (loginBtn) loginBtn.style.display = logged ? "none" : "";
  }

  function initSettingsThemeControl() {
    const select = document.getElementById("theme-select");
    if (!select) return;
    const saved = getSavedTheme() || "dark";
    select.value = saved;
    select.addEventListener("change", () => {
      const val = select.value === "light" ? "light" : "dark";
      applyTheme(val);
      saveTheme(val);
    });
  }

  // Unified nav and mobile sidebar
  const NAV_PUBLIC = [
    { href: "index.html", label: "الرئيسية" },
    { href: "pricing.html", label: "الأسعار" },
    { href: "about.html", label: "حولنا" },
  ];
  const NAV_PRIVATE = [
    { href: "dashboard.html", label: "لوحة التحكم" },
    { href: "alerts.html", label: "التنبيهات" },
    { href: "reports.html", label: "التقارير" },
    { href: "settings.html", label: "الإعدادات" },
    { href: "users.html", label: "المستخدمون" },
  ];

  function updateMenuIconForTheme() {
    const icon = document.getElementById("mobile-menu-icon");
    if (!icon) return;
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    icon.src = isLight ? "assets/img/menu_light.svg" : "assets/img/menu.svg";
  }

  function initMobileSidebar(items) {
    // Only attach for mobile viewports
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    let sidebar = document.getElementById("mobile-sidebar");
    let overlay = document.getElementById("mobile-overlay");
    if (!isMobile) {
      if (sidebar) sidebar.classList.remove("open");
      if (overlay) overlay.classList.remove("show");
      return;
    }
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.id = "mobile-sidebar";
      sidebar.innerHTML = `
        <div class="sidebar-header">
          <span class="brand"><span class="logo" aria-hidden="true"
            ><span class="logo-text">تحقّقٌ</span></span
          ></span>
          <button class="icon-btn" id="mobile-close-btn" aria-label="إغلاق"><img src="assets/img/close.svg" alt="close"></button>
        </div>
        <nav class="sidebar-links"></nav>
      `;
      document.body.appendChild(sidebar);
    }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "mobile-overlay";
      document.body.appendChild(overlay);
    }
    const links = sidebar.querySelector(".sidebar-links");
    links.innerHTML =
      "<ul>" +
      items.map((i) => `<li><a href="${i.href}">${i.label}</a></li>`).join("") +
      "</ul>";
    // Close when a link is clicked
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
      })
    );
    const btn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("mobile-close-btn");
    const icon = document.getElementById("mobile-menu-icon");
    function open() {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      if (icon) icon.src = "assets/img/close.svg";
    }
    function close() {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      updateMenuIconForTheme();
    }
    if (btn)
      btn.onclick = function () {
        if (sidebar.classList.contains("open")) {
          close();
        } else {
          open();
        }
      };
    if (closeBtn) closeBtn.onclick = close;
    overlay.onclick = close;
  }

  function buildNav() {
    const nav = document.querySelector(".nav-links");
    const actions = document.querySelector(".nav-actions");
    if (!nav || !actions) return;
    const logged = Auth.isLoggedIn();
    const items = logged ? NAV_PRIVATE : NAV_PUBLIC;
    nav.innerHTML = items
      .map((i) => `<a href="${i.href}" data-nav>${i.label}</a>`)
      .join("");
    const themeBtn =
      '<button class="theme-toggle" type="button" data-action="toggle-theme">الوضع</button>';
    const authBtn = logged
      ? '<a class="btn secondary" href="#" data-action="logout">خروج</a>'
      : '<a class="btn secondary" href="login.html">تسجيل الدخول</a>';
    const mobileBtn =
      '<button class="icon-btn" type="button" id="mobile-menu-btn" aria-label="القائمة"><img id="mobile-menu-icon" src="assets/img/menu.svg" alt="menu"/></button>';
    actions.innerHTML = themeBtn + authBtn + mobileBtn;
    attachLogout();
    initThemeToggle();
    initMobileSidebar(items);
    updateMenuIconForTheme();
    highlightActiveNav();
  }

  // Mock API helpers (replace with real backend calls)
  window.TahaqquqAPI = {
    async fetchKPIs() {
      return {
        totalAlerts: 1245,
        criticalAlerts: 32,
        last24h: 87,
      };
    },
    async fetchAlerts({
      query = "",
      severity = "all",
      type = "all",
      from,
      to,
    } = {}) {
      const sample = [
        {
          id: "ALR-1001",
          attacker: "+20 100 555 1234",
          user: "شريف سليمان",
          startedAt: "2025-09-14 10:12",
          duration: "00:03:21",
          type: "انتحال موظف بنك",
          severity: "critical",
          confidence: 0.94,
        },
        {
          id: "ALR-1002",
          attacker: "+20 122 777 4521",
          user: "منى عبد الرحمن",
          startedAt: "2025-09-14 11:47",
          duration: "00:02:09",
          type: "هندسة اجتماعية",
          severity: "high",
          confidence: 0.88,
        },
        {
          id: "ALR-1003",
          attacker: "+20 101 333 8822",
          user: "كريم علي",
          startedAt: "2025-09-14 15:05",
          duration: "00:05:40",
          type: "طلب بيانات حساسة",
          severity: "medium",
          confidence: 0.72,
        },
      ];
      return sample.filter(
        (r) =>
          (!query || JSON.stringify(r).includes(query)) &&
          (severity === "all" || r.severity === severity) &&
          (type === "all" || r.type === type)
      );
    },
  };

  // Bootstrap
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getSavedTheme());
    guardRoutes();
    buildNav();
    initSettingsThemeControl();
    // Re-evaluate sidebar on resize (mobile only)
    window.addEventListener("resize", () => {
      const logged = Auth.isLoggedIn();
      const items = logged ? NAV_PRIVATE : NAV_PUBLIC;
      initMobileSidebar(items);
    });
    // Dashboard charts
    const page = (
      location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();
    if (page === "dashboard.html") {
      try {
        const pieEl = document.getElementById("pieChart");
        if (pieEl) {
          const pieData = [
            { label: "انتحال شخصية", value: 52, color: "#0ea5a5" },
            { label: "هندسة اجتماعية", value: 28, color: "#2563eb" },
            { label: "محاولة اختراق", value: 14, color: "#f59e0b" },
            { label: "أخرى", value: 6, color: "#8b5cf6" },
          ];
          window.TahaqquqCharts?.pie(pieEl, pieData, { legend: true });
        }
        const timelineEl = document.getElementById("timelineChart");
        if (timelineEl) {
          const now = Date.now();
          const dayMs = 24 * 60 * 60 * 1000;
          const base = [
            18, 22, 26, 24, 30, 38, 45, 52, 61, 58, 54, 49, 44, 40, 36, 33, 35,
            37, 40, 46, 53, 60, 62, 58, 52, 45, 38, 32, 28, 24,
          ];
          const points = base.map((v, i) => ({ t: now - (29 - i) * dayMs, v }));
          let range = { start: now - 30 * dayMs, end: now };
          function render() {
            window.TahaqquqCharts?.timeline(timelineEl, points, range);
          }
          render();
          timelineEl.addEventListener(
            "wheel",
            (e) => {
              e.preventDefault();
              const span = range.end - range.start;
              const delta = e.deltaY > 0 ? 1.2 : 0.8;
              const newSpan = Math.max(
                60 * 60 * 1000,
                Math.min(60 * dayMs, span * delta)
              );
              const mid = (range.end + range.start) / 2;
              range = { start: mid - newSpan / 2, end: mid + newSpan / 2 };
              render();
            },
            { passive: false }
          );
        }
      } catch {}
    }
  });

  // Simple charts drawing
  window.TahaqquqCharts = window.TahaqquqCharts || {};
  window.TahaqquqCharts.pie = function (canvas, dataset, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width,
      cssH = canvas.height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hasLegend = !!opts.legend;
    const legendW = hasLegend ? 140 : 0;
    const cx = (cssW - legendW) / 2 + 8;
    const cy = cssH / 2;
    const r = Math.min(cssW - legendW - 16, cssH) / 2 - 8;
    const total = dataset.reduce((s, d) => s + d.value, 0) || 1;
    let start = -Math.PI / 2;
    dataset.forEach((d) => {
      const angle = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      start += angle;
    });
    if (opts.legend) {
      const textColor =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--color-text"
        ) || "#fff";
      ctx.font = "12px Cairo, sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "right";
      const legendRight = cssW - 8; // padding from right edge
      dataset.forEach((d, i) => {
        const y = 16 + i * 20;
        // draw color box on the right
        const boxSize = 12;
        const boxX = legendRight - boxSize; // align box to the far right
        ctx.fillStyle = d.color;
        ctx.fillRect(boxX, y - boxSize / 2, boxSize, boxSize);
        // draw label to the left of the box
        ctx.fillStyle = textColor.trim();
        ctx.fillText(`${d.label} (${d.value})`, boxX - 8, y);
      });
    }
  };

  window.TahaqquqCharts.timeline = function (canvas, points, range) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width,
      cssH = canvas.height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = cssW,
      H = cssH;
    ctx.clearRect(0, 0, W, H);
    const minT = range.start,
      maxT = range.end;
    const inRange = points.filter((p) => p.t >= minT && p.t <= maxT);
    const maxY = Math.max(1, ...inRange.map((p) => p.v));
    // layout constants
    const LEFT = 56; // increased to avoid cutting y labels
    const RIGHT = W - 10;
    const TOP = 10;
    const BOTTOM = H - 30;
    // grid
    ctx.strokeStyle = "rgba(128,128,160,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = TOP + (i / 4) * (H - 40);
      ctx.moveTo(LEFT, y);
      ctx.lineTo(RIGHT, y);
    }
    ctx.stroke();
    // axes
    ctx.strokeStyle = "rgba(128,128,160,0.4)";
    ctx.beginPath();
    ctx.moveTo(LEFT, BOTTOM);
    ctx.lineTo(RIGHT, BOTTOM);
    ctx.moveTo(LEFT, TOP);
    ctx.lineTo(LEFT, BOTTOM);
    ctx.stroke();
    // y-axis ticks and label
    const axisText =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--color-text"
      ) || "#fff";
    ctx.fillStyle = axisText.trim();
    ctx.font = "11px Cairo, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = TOP + (i / 4) * (H - 40);
      const val = Math.round(maxY * (1 - i / 4));
      ctx.fillText(String(val), LEFT - 6, y + 3);
    }
    // y-axis title at top of axis
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "12px Cairo, sans-serif";
    ctx.fillText("عدد الهجمات", LEFT + 4, TOP);
    // bars like SIEM
    const barW = Math.max(
      6,
      ((RIGHT - LEFT) / Math.max(6, inRange.length)) * 0.7
    );
    ctx.fillStyle = "#11b5b5";
    inRange.forEach((p) => {
      const x = LEFT + ((p.t - minT) / (maxT - minT)) * (RIGHT - LEFT);
      const y = BOTTOM - (p.v / maxY) * (H - 50);
      ctx.fillRect(x - barW / 2, y, barW, BOTTOM - y);
    });
    // x labels (date)
    const textColor =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--color-text"
      ) || "#fff";
    ctx.fillStyle = textColor.trim();
    ctx.font = "11px Cairo, sans-serif";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const t = minT + (i / steps) * (maxT - minT);
      const d = new Date(t);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const x = LEFT + (i / steps) * (RIGHT - LEFT);
      ctx.textAlign = "center";
      ctx.fillText(label, x, H - 12);
    }
  };
})();
