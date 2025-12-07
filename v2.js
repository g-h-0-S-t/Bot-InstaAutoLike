javascript:(function() {
  /*
    Instagram Auto Liker (profile-aware, fast-safe)
    - Two profiles with different caps and pacing:
      • Conservative / New account  → slower, ~20–40 likes/hour
      • Standard / Established      → faster, ~40–80 likes/hour but under typical caps
    - Profile can be changed while running; delays and caps adapt immediately
    - Start / Exit for lifecycle; Pause / Resume to manually pick the next post
  */

  'use strict';

  if (window.__insta_auto) {
    window.__insta_auto.exit();
    return;
  }

  window.__insta_auto = (() => {
    /* ---------------------------------------
       Safety profiles and runtime state
    ---------------------------------------- */
    const PROFILES = {
      CONSERVATIVE: {
        id: 'conservative',
        label: 'Conservative / New account',
        short: '~20–40 likes/hour, extended pauses',
        maxLikesPerHour: 40,
        maxLikesPerSession: 250,
        minLikeDelayMs: 42000,
        maxLikeDelayMs: 65000,
        betweenActionsBaseMs: 2600,
        betweenActionsJitterMs: 2200,
        longRestEveryCycles: 10,
        longRestMinMs: 240000,
        longRestMaxMs: 420000
      },
      STANDARD: {
        id: 'standard',
        label: 'Standard / Established account',
        short: '~40–80 likes/hour, moderate pauses',
        maxLikesPerHour: 90,
        maxLikesPerSession: 700,
        minLikeDelayMs: 26000,
        maxLikeDelayMs: 42000,
        betweenActionsBaseMs: 1900,
        betweenActionsJitterMs: 1600,
        longRestEveryCycles: 18,
        longRestMinMs: 180000,
        longRestMaxMs: 300000
      }
    };

    const stats = {
      sessionStart: Date.now(),
      hourWindowStart: Date.now(),
      likesThisHour: 0,
      likesThisSession: 0,
      totalActions: 0,
      liked: 0,
      skipped: 0,
      cycles: 0,
      scrolls: 0
    };

    let running = false;
    let paused = false;
    let isDarkMode = true;
    let isPanelHidden = false;
    let currentProfile = PROFILES.CONSERVATIVE;

    let progressTotal = 0;
    let progressDone = 0;

    /* ---------------------------------------
       Small utilities
    ---------------------------------------- */
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomDelay = (min, max) => rand(min, max);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const humanMouseEvents = el => {
      try {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + (Math.random() * 8 - 4);
        const y = rect.top + rect.height / 2 + (Math.random() * 8 - 4);
        el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
      } catch (e) {}
    };

    /* ---------------------------------------
       Overlay, panel and controls
    ---------------------------------------- */
    const createOverlay = () => {
      const overlay = document.createElement('div');
      overlay.id = 'insta-auto-overlay';
      overlay.innerHTML = `
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

          :root {
            --bg-primary:#1a1d29;
            --bg-secondary:#0f1419;
            --bg-card:rgba(255,255,255,0.03);
            --bg-card-hover:rgba(255,255,255,0.05);
            --border-color:rgba(255,255,255,0.08);
            --text-primary:#ffffff;
            --text-secondary:rgba(255,255,255,0.6);
            --text-tertiary:rgba(255,255,255,0.4);
            --accent-primary:#3b82f6;
            --accent-success:#10b981;
            --accent-error:#ef4444;
            --accent-warning:#f59e0b;
            --shadow-color:rgba(0,0,0,0.5);
            --log-success-bg:rgba(16,185,129,0.1);
            --log-error-bg:rgba(239,68,68,0.1);
            --log-warning-bg:rgba(245,158,11,0.1);
            --log-info-bg:rgba(59,130,246,0.1);
            --log-cycle-bg:rgba(168,85,247,0.1);
          }

          .light-mode {
            --bg-primary:#ffffff;
            --bg-secondary:#f9fafb;
            --bg-card:rgba(0,0,0,0.02);
            --bg-card-hover:rgba(0,0,0,0.04);
            --border-color:rgba(0,0,0,0.08);
            --text-primary:#111827;
            --text-secondary:rgba(0,0,0,0.6);
            --text-tertiary:rgba(0,0,0,0.4);
            --accent-primary:#2563eb;
            --accent-success:#059669;
            --accent-error:#dc2626;
            --accent-warning:#d97706;
            --shadow-color:rgba(0,0,0,0.1);
            --log-success-bg:rgba(16,185,129,0.15);
            --log-error-bg:rgba(239,68,68,0.15);
            --log-warning-bg:rgba(245,158,11,0.15);
            --log-info-bg:rgba(59,130,246,0.15);
            --log-cycle-bg:rgba(168,85,247,0.15);
          }

          #insta-auto-overlay {
            position:fixed;top:0;left:0;width:100%;height:100%;
            z-index:999999;pointer-events:none;
            font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
          }

          #insta-auto-panel {
            position:fixed;top:0;left:0;width:420px;height:100vh;
            background:linear-gradient(180deg,var(--bg-primary) 0%,var(--bg-secondary) 100%);
            box-shadow:4px 0 24px var(--shadow-color);
            display:flex;flex-direction:column;
            border-right:1px solid var(--border-color);
            overflow:hidden;pointer-events:auto;
            transition:transform .3s ease,background .3s ease;
          }

          #insta-auto-panel.hidden { transform:translateX(-100%); }

          #insta-auto-toggle {
            position:fixed;left:0;top:50%;transform:translateY(-50%);
            background:var(--bg-primary);
            border:1px solid var(--border-color);
            border-left:none;border-radius:0 16px 16px 0;
            padding:40px 12px;cursor:pointer;
            z-index:1000000;pointer-events:auto;
            transition:all .3s ease;
            writing-mode:vertical-rl;text-orientation:mixed;
            color:var(--text-secondary);
            font-weight:600;font-size:11px;
            letter-spacing:3px;text-transform:uppercase;
            box-shadow:4px 0 18px var(--shadow-color);
            display:none;
          }

          #insta-auto-toggle.visible { display:block; }

          #insta-auto-toggle:hover {
            background:var(--bg-card);
            transform:translateY(-50%) translateX(5px);
          }

          #insta-auto-header {
            background:linear-gradient(135deg,rgba(59,130,246,0.1) 0%,rgba(37,99,235,0.05) 100%);
            padding:18px 24px 16px;
            border-bottom:1px solid var(--border-color);
            display:flex;justify-content:space-between;align-items:flex-start;
            gap:12px;
          }

          .ia-header-content { flex:1;display:flex;flex-direction:column;gap:6px; }

          #ia-title {
            font-size:16px;font-weight:700;color:var(--text-primary);
            margin:0;letter-spacing:.5px;
            display:flex;align-items:center;gap:10px;
          }

          .ia-title-icon { font-size:18px; }

          #ia-subtitle {
            font-size:12px;color:var(--text-secondary);
            margin:0;font-weight:500;
          }

          #ia-profile-wrapper {
            margin-top:4px;
            display:flex;
            flex-direction:column;
            gap:4px;
          }

          #ia-profile-label {
            font-size:10px;
            color:var(--text-tertiary);
            text-transform:uppercase;
            letter-spacing:1px;
          }

          #ia-profile {
            padding:6px 8px;
            border-radius:6px;
            border:1px solid var(--border-color);
            background:var(--bg-card);
            color:var(--text-secondary);
            font-size:11px;
            width:100%;
          }

          #ia-profile-desc {
            font-size:11px;
            color:var(--text-secondary);
          }

          .ia-header-controls {
            display:flex;
            flex-direction:row;
            gap:8px;
            align-items:normal;
          }

          .ia-theme-toggle {
            background:var(--bg-card);border:1px solid var(--border-color);
            border-radius:6px;padding:8px 10px;cursor:pointer;
            color:var(--text-secondary);font-size:16px;
            transition:all .2s ease;display:flex;align-items:center;justify-content:center;
          }

          .ia-theme-toggle:hover { background:var(--bg-card-hover); }

          .ia-hide-button {
            background:var(--bg-card);border:1px solid var(--border-color);
            border-radius:6px;padding:6px 10px;cursor:pointer;
            color:var(--text-secondary);font-size:11px;font-weight:600;
            transition:all .2s ease;
          }

          .ia-hide-button:hover { background:var(--bg-card-hover); }

          #ia-stats {
            display:grid;grid-template-columns:repeat(2,1fr);gap:12px;
            padding:14px 24px 8px;
            background:rgba(0,0,0,0.02);
          }

          .ia-stat-item {
            text-align:center;padding:12px 10px;background:var(--bg-card);
            border-radius:8px;border:1px solid var(--border-color);
            transition:all .2s ease;
          }

          .ia-stat-item:hover {
            background:var(--bg-card-hover);
            transform:translateY(-2px);
          }

          .ia-stat-value {
            font-size:24px;font-weight:700;color:var(--accent-primary);
            display:block;font-variant-numeric:tabular-nums;
          }

          .ia-stat-label {
            font-size:11px;color:var(--text-tertiary);text-transform:uppercase;
            letter-spacing:1px;margin-top:4px;display:block;font-weight:600;
          }

          #ia-perf {
            display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
            padding:8px 24px 14px;
            background:rgba(0,0,0,0.02);
            border-bottom:1px solid var(--border-color);
          }

          .ia-perf-item {
            text-align:center;font-size:10px;color:var(--text-tertiary);
            padding:8px;background:var(--bg-card);border-radius:6px;
          }

          .ia-perf-value {
            font-size:14px;font-weight:700;color:var(--accent-success);display:block;
          }

          #ia-progress-wrap {
            padding:14px 24px;background:rgba(0,0,0,0.015);
            border-bottom:1px solid var(--border-color);
          }

          .ia-progress-label {
            font-size:11px;color:var(--text-secondary);margin-bottom:6px;
            display:flex;justify-content:space-between;font-weight:600;
          }

          .ia-progress-bar {
            height:6px;background:var(--bg-card);border-radius:3px;
            overflow:hidden;border:1px solid var(--border-color);
          }

          .ia-progress-fill {
            height:100%;background:linear-gradient(90deg,var(--accent-primary),#2563eb);
            border-radius:3px;transition:width .5s ease;
          }

          #ia-log {
            flex:1;overflow-y:auto;padding:14px 24px 14px;font-size:12px;
            line-height:1.6;color:var(--text-primary);background:rgba(0,0,0,0.01);
          }

          #ia-log::-webkit-scrollbar { width:6px; }
          #ia-log::-webkit-scrollbar-track { background:var(--bg-card); }
          #ia-log::-webkit-scrollbar-thumb { background:var(--border-color);border-radius:3px; }

          .ia-log-entry {
            padding:6px 10px;margin-bottom:4px;border-radius:6px;
            display:flex;align-items:center;gap:10px;
            animation:ia-slide-in .3s ease;
          }

          @keyframes ia-slide-in {
            from { opacity:0;transform:translateX(-10px); }
            to { opacity:1;transform:translateX(0); }
          }

          .ia-log-entry.success { background:var(--log-success-bg); }
          .ia-log-entry.error   { background:var(--log-error-bg); }
          .ia-log-entry.warning { background:var(--log-warning-bg); }
          .ia-log-entry.info    { background:var(--log-info-bg); }
          .ia-log-entry.cycle   { background:var(--log-cycle-bg);font-weight:600; }
          .ia-log-entry.loading { background:var(--log-info-bg); }

          .ia-log-ts {
            color:var(--text-tertiary);font-size:10px;font-weight:500;min-width:70px;
          }

          .ia-log-icon {
            font-size:12px;min-width:16px;text-align:center;
          }

          .ia-log-icon.spinner { animation:ia-spin 1s linear infinite; }

          @keyframes ia-spin {
            from { transform:rotate(0deg); }
            to { transform:rotate(360deg); }
          }

          .ia-log-msg { flex:1;font-size:12px; }

          .ia-log-msg-dots::after {
            content:"";animation:ia-dots 1.5s steps(4,end) infinite;
          }

          @keyframes ia-dots {
            0%,20% { content:""; }
            40% { content:"."; }
            60% { content:".."; }
            80%,100% { content:"..."; }
          }

          #ia-controls {
            padding:16px 24px 18px;background:rgba(0,0,0,0.02);
            border-top:1px solid var(--border-color);display:flex;gap:8px;
          }

          .ia-ctrl-btn {
            flex:1;padding:11px 14px;border-radius:8px;
            border:1px solid rgba(16,185,129,0.3);
            font-size:13px;font-weight:600;cursor:pointer;
            transition:all .2s ease;
            text-transform:uppercase;letter-spacing:1px;
            background:rgba(16,185,129,0.1);color:var(--accent-success);
          }

          .ia-ctrl-btn.stop {
            border-color:rgba(239,68,68,0.3);
            background:rgba(239,68,68,0.1);
            color:var(--accent-error);
          }

          .ia-ctrl-btn:hover { background:rgba(16,185,129,0.2); }
          .ia-ctrl-btn.stop:hover { background:rgba(239,68,68,0.2); }
        </style>

        <div id="insta-auto-panel">
          <div id="insta-auto-header">
            <div class="ia-header-content">
              <div id="ia-title">
                <span class="ia-title-icon">✨</span>
                Instagram Auto Liker
              </div>
              <div id="ia-subtitle">
                Profile-aware pacing with human-like timing
              </div>
              <div id="ia-profile-wrapper">
                <div id="ia-profile-label">Account safety profile</div>
                <select id="ia-profile">
                  <option value="conservative">Conservative / New account</option>
                  <option value="standard">Standard / Established account</option>
                </select>
                <div id="ia-profile-desc"></div>
              </div>
            </div>
            <div class="ia-header-controls">
              <button class="ia-theme-toggle" id="ia-theme-toggle" title="Toggle theme">
                <span id="ia-theme-icon">🌙</span>
              </button>
              <button class="ia-hide-button" id="ia-hide-btn">◀</button>
            </div>
          </div>

          <div id="ia-stats">
            <div class="ia-stat-item">
              <span class="ia-stat-value" id="ia-stat-liked">0</span>
              <span class="ia-stat-label">Liked</span>
            </div>
            <div class="ia-stat-item">
              <span class="ia-stat-value" id="ia-stat-skipped">0</span>
              <span class="ia-stat-label">Skipped</span>
            </div>
            <div class="ia-stat-item">
              <span class="ia-stat-value" id="ia-stat-cycles">0</span>
              <span class="ia-stat-label">Cycles</span>
            </div>
            <div class="ia-stat-item">
              <span class="ia-stat-value" id="ia-stat-status">IDLE</span>
              <span class="ia-stat-label">Status</span>
            </div>
          </div>

          <div id="ia-perf">
            <div class="ia-perf-item">
              <span class="ia-perf-value" id="ia-perf-cps">0.0</span><span>Actions/s</span>
            </div>
            <div class="ia-perf-item">
              <span class="ia-perf-value" id="ia-perf-uptime">0s</span><span>Uptime</span>
            </div>
            <div class="ia-perf-item">
              <span class="ia-perf-value" id="ia-perf-total">0</span><span>Total</span>
            </div>
            <div class="ia-perf-item">
              <span class="ia-perf-value" id="ia-perf-scrolls">0</span><span>Scrolls</span>
            </div>
          </div>

          <div id="ia-progress-wrap">
            <div class="ia-progress-label">
              <span>Current Session</span>
              <span id="ia-progress-label">0%</span>
            </div>
            <div class="ia-progress-bar">
              <div class="ia-progress-fill" id="ia-progress-fill" style="width:0%"></div>
            </div>
          </div>

          <div id="ia-log"></div>

          <div id="ia-controls">
            <button class="ia-ctrl-btn" id="ia-start-exit-btn">▶ Start</button>
            <button class="ia-ctrl-btn stop" id="ia-pause-resume-btn">⏸ Pause</button>
          </div>
        </div>

        <button id="insta-auto-toggle">SHOW PANEL</button>
      `;

      document.body.appendChild(overlay);

      document.getElementById('ia-hide-btn')?.addEventListener('click', togglePanel);
      document.getElementById('insta-auto-toggle')?.addEventListener('click', togglePanel);
      document.getElementById('ia-theme-toggle')?.addEventListener('click', toggleTheme);

      const profileSelect = document.getElementById('ia-profile');
      const profileDesc = document.getElementById('ia-profile-desc');

      const applyProfileToUI = () => {
        if (!profileDesc) return;
        profileDesc.textContent = `${currentProfile.short} · Max ~${currentProfile.maxLikesPerHour} likes/hour, ${currentProfile.maxLikesPerSession} per session (approximate).`;
      };

      if (profileSelect) {
        profileSelect.value = currentProfile.id;
        applyProfileToUI();
        profileSelect.addEventListener('change', () => {
          currentProfile =
            profileSelect.value === PROFILES.STANDARD.id
              ? PROFILES.STANDARD
              : PROFILES.CONSERVATIVE;
          applyProfileToUI();
          UILogger.info(`Profile set to: ${currentProfile.label}`);
        });
      }

      const startExitBtn = document.getElementById('ia-start-exit-btn');
      const pauseBtn = document.getElementById('ia-pause-resume-btn');

      startExitBtn?.addEventListener('click', () => {
        if (!running) {
          startExitBtn.textContent = '⏹ Exit';
          start();
        } else {
          exit();
        }
      });

      pauseBtn?.addEventListener('click', () => {
        if (!running) return;
        paused = !paused;
        pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
        UILogger.info(
          paused
            ? 'Paused – you can scroll and open any post manually'
            : 'Resumed – continuing from the currently open post'
        );
        if (!paused) {
          mainLoopTick();
        }
      });
    };

    /* ---------------------------------------
       Logging and stat updates
    ---------------------------------------- */
    const UILogger = {
      log: (message, type = 'info', isLoading = false) => {
        const logContainer = document.getElementById('ia-log');
        if (!logContainer) return null;

        const timestamp = new Date().toLocaleTimeString();
        const icons = {
          success: '✓',
          error:   '✗',
          warning: '⚠',
          info:    '→',
          cycle:   '⟳',
          loading: '◉'
        };

        const entry = document.createElement('div');
        entry.className = `ia-log-entry ${isLoading ? 'loading' : type}`;

        const iconClass = isLoading ? 'ia-log-icon spinner' : 'ia-log-icon';
        const msgClass  = isLoading ? 'ia-log-msg ia-log-msg-dots' : 'ia-log-msg';

        entry.innerHTML = `
          <span class="ia-log-ts">${timestamp}</span>
          <span class="${iconClass}">${icons[isLoading ? 'loading' : type] || '•'}</span>
          <span class="${msgClass}">${message}</span>
        `;

        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;

        const entries = logContainer.querySelectorAll('.ia-log-entry');
        if (entries.length > 120) entries[0].remove();

        return entry;
      },

      loading: msg => UILogger.log(msg, 'info', true),
      success: msg => UILogger.log(msg, 'success'),
      error:   msg => UILogger.log(msg, 'error'),
      warning: msg => UILogger.log(msg, 'warning'),
      info:    msg => UILogger.log(msg, 'info'),
      cycle:   msg => UILogger.log(msg, 'cycle'),

      updateStats: () => {
        const likedEl   = document.getElementById('ia-stat-liked');
        const skippedEl = document.getElementById('ia-stat-skipped');
        const cyclesEl  = document.getElementById('ia-stat-cycles');
        const statusEl  = document.getElementById('ia-stat-status');
        const cpsEl     = document.getElementById('ia-perf-cps');
        const uptimeEl  = document.getElementById('ia-perf-uptime');
        const totalEl   = document.getElementById('ia-perf-total');
        const scrollsEl = document.getElementById('ia-perf-scrolls');

        const uptime = Math.floor((Date.now() - stats.sessionStart) / 1000);
        const aps    = uptime > 0 ? (stats.totalActions / uptime).toFixed(3) : '0.000';

        if (likedEl)   likedEl.textContent   = stats.liked;
        if (skippedEl) skippedEl.textContent = stats.skipped;
        if (cyclesEl)  cyclesEl.textContent  = stats.cycles;
        if (statusEl)  statusEl.textContent  = running ? (paused ? 'PAUSED' : 'RUNNING') : 'IDLE';
        if (cpsEl)     cpsEl.textContent     = aps;
        if (uptimeEl)  uptimeEl.textContent  = `${uptime}s`;
        if (totalEl)   totalEl.textContent   = stats.totalActions;
        if (scrollsEl) scrollsEl.textContent = stats.scrolls;
      },

      updateProgress: percent => {
        const fill  = document.getElementById('ia-progress-fill');
        const label = document.getElementById('ia-progress-label');
        if (fill)  fill.style.width = `${percent}%`;
        if (label) label.textContent = `${Math.round(percent)}%`;
      }
    };

    /* ---------------------------------------
       Panel utilities (hide/theme)
    ---------------------------------------- */
    const togglePanel = () => {
      const panel    = document.getElementById('insta-auto-panel');
      const toggleBtn = document.getElementById('insta-auto-toggle');
      if (!panel || !toggleBtn) return;

      isPanelHidden = !isPanelHidden;

      if (isPanelHidden) {
        panel.classList.add('hidden');
        toggleBtn.classList.add('visible');
      } else {
        panel.classList.remove('hidden');
        toggleBtn.classList.remove('visible');
      }
    };

    const toggleTheme = () => {
      const panel = document.getElementById('insta-auto-panel');
      const icon  = document.getElementById('ia-theme-icon');
      if (!panel || !icon) return;

      isDarkMode = !isDarkMode;
      if (isDarkMode) {
        panel.classList.remove('light-mode');
        icon.textContent = '🌙';
      } else {
        panel.classList.add('light-mode');
        icon.textContent = '☀️';
      }
    };

    /* ---------------------------------------
       Rate limiting helpers
    ---------------------------------------- */
    const resetHourWindowIfNeeded = () => {
      const now = Date.now();
      if (now - stats.hourWindowStart >= 60 * 60 * 1000) {
        stats.hourWindowStart = now;
        stats.likesThisHour   = 0;
        UILogger.info('Hourly window reset');
      }
    };

    const checkRateLimits = async () => {
      resetHourWindowIfNeeded();

      if (stats.likesThisSession >= currentProfile.maxLikesPerSession) {
        UILogger.warning('Session like cap reached – stopping');
        running = false;
        return false;
      }

      if (stats.likesThisHour >= currentProfile.maxLikesPerHour) {
        UILogger.warning('Hourly like cap reached – applying rest period');
        const restMs = randomDelay(40 * 60 * 1000, 60 * 60 * 1000);
        await sleep(restMs);
        stats.hourWindowStart = Date.now();
        stats.likesThisHour   = 0;
      }

      return true;
    };

    /* ---------------------------------------
       Instagram interactions
    ---------------------------------------- */
    const clickLikeOnCurrentModal = async () => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return false;

      const section = [...modal.querySelectorAll('section')].find(el =>
        el.querySelector('svg[aria-label="Comment"]') ||
        el.querySelector('svg[aria-label="Share Post"]')
      );
      if (!section) return false;

      const btn =
        section.querySelector('span[role="button"]') ||
        section.querySelector('[role="button"]');
      if (!btn) return false;

      const likeSvg = btn.querySelector('svg[aria-label="Like"]');
      if (!likeSvg) return false;

      humanMouseEvents(btn);
      btn.click();
      return true;
    };

    const clickNextInModal = async () => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return false;
      const nxt =
        modal.querySelector('svg[aria-label="Next"]') ||
        document.querySelector('svg[aria-label="Next"]');
      if (!nxt) return false;
      const btn = nxt.closest('button');
      if (!btn) return false;
      humanMouseEvents(btn);
      btn.click();
      return true;
    };

    const runSafeLike = async () => {
      if (!running || paused) return;
      if (!(await checkRateLimits())) return;

      const min = currentProfile.minLikeDelayMs;
      const max = currentProfile.maxLikeDelayMs;
      const delay = randomDelay(min, max);
      await sleep(delay);
      if (!running || paused) return;

      const success = await clickLikeOnCurrentModal();
      if (success) {
        stats.liked           += 1;
        stats.likesThisHour   += 1;
        stats.likesThisSession += 1;
        UILogger.success('Liked post');
      } else {
        stats.skipped += 1;
        UILogger.info('Like skipped or already liked');
      }
      stats.totalActions += 1;
      progressDone       += 1;
    };

    const runSafeNext = async () => {
      if (!running || paused) return;
      const min   = 1500;
      const max   = 4000;
      const delay = randomDelay(min, max);
      await sleep(delay);
      if (!running || paused) return;

      const moved = await clickNextInModal();
      UILogger.info(moved ? 'Moved to next post' : 'Next button not found');
      stats.totalActions += 1;
    };

    const ensureFirstPostOpen = async () => {
      let modal = document.querySelector('div[role="dialog"]');
      if (modal) return true;

      const first = document.querySelector('a[href*="/p/"]');
      if (!first) {
        UILogger.warning('No clickable posts found on page');
        return false;
      }
      humanMouseEvents(first);
      first.click();
      UILogger.info('Opened first post');
      await sleep(randomDelay(900, 1800));

      modal = document.querySelector('div[role="dialog"]');
      let attempts = 0;
      while (!modal && attempts < 10) {
        await sleep(350 + rand(0, 250));
        modal = document.querySelector('div[role="dialog"]');
        attempts += 1;
      }
      if (!modal) {
        UILogger.error('Modal not found after opening');
        return false;
      }
      return true;
    };

    /* ---------------------------------------
       Main loop tick
    ---------------------------------------- */
    const mainLoopTick = async () => {
      if (!running || paused) return;

      const limitsOk = await checkRateLimits();
      if (!limitsOk || !running || paused) return;

      const ok = await ensureFirstPostOpen();
      if (!ok || !running || paused) return;

      await runSafeLike();
      if (!running || paused) return;

      const between = currentProfile.betweenActionsBaseMs +
        rand(-currentProfile.betweenActionsJitterMs, currentProfile.betweenActionsJitterMs);
      await sleep(Math.max(600, between));
      if (!running || paused) return;

      await runSafeNext();
      if (!running || paused) return;

      await sleep(randomDelay(2200, 5200));
      if (!running || paused) return;

      progressTotal = Math.max(progressTotal, stats.liked + stats.skipped + 1);
      progressDone  = stats.liked + stats.skipped;
      const percent =
        progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0;
      UILogger.updateProgress(percent);

      stats.cycles += 1;
      UILogger.cycle(`Cycle #${stats.cycles} complete`);
      UILogger.updateStats();

      if (stats.cycles % currentProfile.longRestEveryCycles === 0) {
        const restMs = randomDelay(currentProfile.longRestMinMs, currentProfile.longRestMaxMs);
        UILogger.info(`Resting for approximately ${(restMs / 60000).toFixed(1)} minutes`);
        await sleep(restMs);
      }

      const nextSvg = document.querySelector('svg[aria-label="Next"]');
      if (!nextSvg) {
        const closeSvg = document.querySelector('svg[aria-label="Close"]');
        if (closeSvg) {
          const btn = closeSvg.closest('[role="button"]');
          if (btn) {
            humanMouseEvents(btn);
            btn.click();
          }
          UILogger.info('Closed modal, reloading page');
          await sleep(randomDelay(2000, 4000));
          location.reload();
          running = false;
          return;
        } else {
          UILogger.info('End reached, stopping');
          running = false;
          UILogger.updateStats();
          return;
        }
      }

      if (running && !paused) {
        setTimeout(mainLoopTick, 300);
      }
    };

    /* ---------------------------------------
       Lifecycle entry points
    ---------------------------------------- */
    const start = () => {
      if (running) return;
      running = true;
      paused  = false;

      stats.sessionStart    = Date.now();
      stats.hourWindowStart = Date.now();
      stats.likesThisHour   = 0;
      stats.likesThisSession = stats.likesThisSession || 0;

      progressTotal = 0;
      progressDone  = 0;
      UILogger.updateProgress(0);

      UILogger.info(`Automation started (${currentProfile.label})`);
      UILogger.updateStats();
      mainLoopTick();
    };

    const exit = () => {
      running = false;
      paused  = false;
      UILogger.warning('Automation stopped, cleaning up');

      document.getElementById('insta-auto-panel')?.remove();
      document.getElementById('insta-auto-toggle')?.remove();
      document.getElementById('insta-auto-overlay')?.remove();
      try { delete window.__insta_auto; } catch (e) {}
    };

    const init = () => {
      createOverlay();
      UILogger.success('UI initialized');
      UILogger.info('Select a safety profile, then click ▶ Start. Use Pause to manually choose posts.');
      setInterval(() => {
        if (running && !paused) UILogger.updateStats();
      }, 3000);
    };

    init();

    return { start, exit };
  })();
})();
