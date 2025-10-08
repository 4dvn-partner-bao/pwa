// src/lib/pricing.js
export function priceSummary({ start, end, drinks = 0 }) {
  const BASE_4H = 35000;   // gói 4h
  const BLOCK_MIN = 30;    // phút
  const BLOCK_PRICE = 5000;
  const DAY_CAP = 60000;   // gói ngày nếu > 6h
  const DAY_THRESHOLD_H = 6;
  const GRACE_MIN = 10;    // 10' miễn phí

  const durationMs = Math.max(0, end - start);
  const durationMin = Math.floor(durationMs / 60000);

  let base = BASE_4H;
  let blocks = 0;
  let blockCost = 0;
  let capped = false;
  let dayCap = DAY_CAP;

  if (durationMin > DAY_THRESHOLD_H * 60) {
    capped = true; base = 0;
  } else if (durationMin > 4 * 60 + GRACE_MIN) {
    const extraMin = durationMin - 4 * 60;
    blocks = Math.ceil(Math.max(0, extraMin) / BLOCK_MIN);
    blockCost = blocks * BLOCK_PRICE;
  }

  const drinkCost = drinks * 10000;
  const subtotal = capped ? dayCap : base + blockCost;
  const total = subtotal + drinkCost;

  return { durationMs, base, blocks, blockCost, capped, dayCap, drinks, drinkCost, total };
}
