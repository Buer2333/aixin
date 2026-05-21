// attribution.js — capture UTM / click-id parameters at first-touch,
// persist for the whole browser session, and append them as hidden inputs
// to any <form> on submit.
//
// Why first-touch wins: users may land on /menu.html with ?utm_source=fb,
// then click around (no params) before reaching /index.html#book-now. We
// want the original ad attribution to ride through to Formspree.
//
// ⚠️ iOS 17+ Safari Link Tracking Protection strips `fbclid` (and a few
// other tracking params) on outbound clicks from Safari address bar.
// UTM parameters (utm_source / medium / campaign / content / term) are
// NOT affected. For Safari traffic, expect UTMs but not fbclid → that's
// why we keep both: utm_* is for human reading, fbclid is what FB's CAPI
// needs for highest match quality.

(function(){
  const TRACK_KEYS = [
    'utm_source','utm_medium','utm_campaign','utm_content','utm_term',
    'fbclid','gclid','ttclid','msclkid'
  ];
  const STORE_KEY = 'fhc_attribution';

  // 1. Capture params from current URL
  const params = new URLSearchParams(location.search);
  const captured = {};
  TRACK_KEYS.forEach(k => {
    const v = params.get(k);
    if (v) captured[k] = v;
  });

  // 2. Merge into sessionStorage (first-touch wins for each key)
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); } catch {}
  if (Object.keys(captured).length > 0) {
    const merged = {...captured, ...stored};  // stored overrides captured = first-touch wins
    if (!stored._captured_at) {
      merged._captured_at = new Date().toISOString();
      merged._landing_url = location.href;
      merged._referrer = document.referrer || '';
    }
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(merged)); } catch {}
  }

  // 3. Append attribution to any form on submit (delegation, runs before form-level handlers)
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    let data = {};
    try { data = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); } catch { return; }
    Object.entries(data).forEach(([k, v]) => {
      if (!v) return;
      if (form.querySelector(`input[name="${k}"]`)) return; // idempotent
      const inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = k;
      inp.value = v;
      form.appendChild(inp);
    });
  }, true); // capture phase → runs before form's own submit handler
})();
