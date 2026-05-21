// ─── Single source of truth for pricing ───
// Change values here → all pages with [data-price] / [data-price-text] spans update automatically.
// ⚠️ <meta> description tags cannot be JS-injected — when changing prices, also manually update:
//   - menu.html <meta name="description">
//   - menu.html <meta property="og:description">
//   (Currently the only meta-level price mentions in the site.)

const PRICING = {
  minTotal: 550,
  adultRate: 55,
  kidRate: 30,
  filetPremium: 8,
  lobsterPremium: 15,
  weekdayPromo: 'WEEK55OFF',
  weekdayDiscount: 55,
  venmoSurcharge: 0.04
};

// Inject PRICING into DOM:
//   - data-price="adultRate" → textContent becomes "$" + PRICING.adultRate
//   - data-price-text="weekdayPromo" → textContent becomes PRICING.weekdayPromo (no $)
//   - .copy-code[data-code-key="weekdayPromo"] → button data-code synced
(function injectPricing(){
  document.querySelectorAll('[data-price]').forEach(el => {
    const v = PRICING[el.dataset.price];
    if (typeof v === 'number') el.textContent = '$' + v;
  });
  document.querySelectorAll('[data-price-text]').forEach(el => {
    const v = PRICING[el.dataset.priceText];
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll('.copy-code[data-code-key="weekdayPromo"]').forEach(b => {
    b.dataset.code = PRICING.weekdayPromo;
  });
})();
