// src/lib/mock.js
// Tạo dữ liệu giả để demo: user, vài biên lai, 1 phiên đang hoạt động ~15 phút

const USER_KEY = "spacehub_user";
const RECEIPTS_KEY = "spacehub_receipts";
const SESSION_KEY = "spacehub_session";

export function seedDemoData() {
  // 1) User
  if (!localStorage.getItem(USER_KEY)) {
    const user = {
      id: "U-0001",
      name: "Gia Bảo",
      phone: "09xx xxx 123",
      memberPlan: "month", // none | week | month | student
      memberExpireAt: Date.now() + 20 * 24 * 3600 * 1000, // còn 20 ngày
      notifications: { push: true, zalo: true, sms: false },
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // 2) Receipts (nếu chưa có)
  if (!localStorage.getItem(RECEIPTS_KEY)) {
    const now = Date.now();
    const receipts = [
      {
        id: "R-tn8g01",
        tableId: "A03",
        startTime: now - 2.5 * 3600 * 1000,
        endTime:   now - 2.0 * 3600 * 1000,
        drinks: 1,
        total: 45000,
      },
      {
        id: "R-tn8fzz",
        tableId: "B12",
        startTime: now - 26 * 3600 * 1000,
        endTime:   now - 25 * 3600 * 1000,
        drinks: 0,
        total: 35000,
      },
      {
        id: "R-tn8fx1",
        tableId: "C07",
        startTime: now - 4 * 24 * 3600 * 1000,
        endTime:   now - 4 * 24 * 3600 * 1000 + 8 * 3600 * 1000,
        drinks: 2,
        total: 60000, // gói ngày
      },
    ];
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  }

  // 3) Session đang chạy (nếu chưa có): A01, start 15 phút trước, 1 đồ uống
  if (!localStorage.getItem(SESSION_KEY)) {
    const session = {
      id: "S-demo",
      tableId: "A01",
      plan: "4h",
      startTime: Date.now() - 15 * 60 * 1000,
      drinks: 1,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function updateUser(patch) {
  const u = getUser() || {};
  const next = { ...u, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  return next;
}
