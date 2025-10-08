// src/lib/session.js
const STORAGE_KEY = "spacehub_session";
const RECEIPTS_KEY = "spacehub_receipts";

export function createOrResumeSession({ tableId, plan = "4h" }) {
  const existing = getActiveSession();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  const startTime = Date.now();
  const session = { id, tableId, plan, startTime, drinks: 0 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return id;
}

export function getActiveSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function updateSession(patch) {
  const s = getActiveSession();
  if (!s) return;
  const next = { ...s, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function finishSession({ endTime, total }) {
  const s = getActiveSession();
  if (!s) return null;
  const receipt = {
    id: `R-${Date.now().toString(36)}`,
    tableId: s.tableId,
    startTime: s.startTime,
    endTime,
    drinks: s.drinks || 0,
    total,
  };
  const receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
  receipts.unshift(receipt);
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  localStorage.removeItem(STORAGE_KEY);
  return receipt.id;
}

export function getLastReceipt(id) {
  const receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
  if (!id) return receipts[0] || null;
  return receipts.find((r) => r.id === id) || null;
}

// 👇 Thêm hàm này để trang Lịch sử (History/Receipts) lấy danh sách biên lai
export function listReceipts() {
  return JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
}
