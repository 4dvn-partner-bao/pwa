// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { getUser, updateUser } from "../lib/mock.js";

export default function Profile() {
  const [user, setUser] = useState(getUser());
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [push, setPush] = useState(user?.notifications?.push ?? true);
  const [zalo, setZalo] = useState(user?.notifications?.zalo ?? true);
  const [sms, setSms] = useState(user?.notifications?.sms ?? false);

  useEffect(() => {
    // Sync nếu user thay đổi ở nơi khác
    setUser(getUser());
  }, []);

  const onSave = () => {
    const next = updateUser({
      name,
      phone,
      notifications: { push, zalo, sms },
    });
    setUser(next);
    alert("Đã lưu thông tin!");
  };

  const remainingDays =
    user?.memberExpireAt ? Math.max(0, Math.ceil((user.memberExpireAt - Date.now()) / (24 * 3600 * 1000))) : 0;

  return (
    <main className="p-5">
      <h1 className="text-xl font-extrabold">Hồ sơ của bạn</h1>

      <section className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="grid gap-3">
          <div>
            <label className="text-sm text-gray-500">Họ và tên</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Số điện thoại</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-base"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500">Gói thành viên</div>
          <div className="mt-1 flex items-center gap-2">
            <Badge>{labelPlan(user?.memberPlan)}</Badge>
            {user?.memberExpireAt && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Còn lại <b>{remainingDays}</b> ngày
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">Kênh thông báo</div>
          <Toggle checked={push} onChange={setPush} label="Web Push (PWA)" />
          <Toggle checked={zalo} onChange={setZalo} label="Zalo OA" />
          <Toggle checked={sms} onChange={setSms} label="SMS" />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onSave}
            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-base font-bold"
          >
            Lưu thay đổi
          </button>
          <button
            onClick={() => alert("Mock: Mở trang gia hạn gói (chưa tích hợp).")}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-base bg-white dark:bg-gray-900"
          >
            Gia hạn gói
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="text-base font-bold mb-3">Quyền lợi thành viên</h2>
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Ra vào nhiều lần trong ngày</li>
          <li>Ưu tiên đặt bàn giờ cao điểm</li>
          <li>Ưu đãi đồ uống định kỳ</li>
        </ul>
      </section>
    </main>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 px-3 py-1 text-sm font-semibold">
      {children}
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className="text-base">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "w-12 h-7 rounded-full p-1 transition",
          checked ? "bg-sky-600" : "bg-gray-300 dark:bg-gray-700",
        ].join(" ")}
      >
        <span
          className={[
            "block w-5 h-5 rounded-full bg-white transition",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </label>
  );
}

function labelPlan(p) {
  switch (p) {
    case "week":
      return "Gói Tuần";
    case "month":
      return "Gói Tháng";
    case "student":
      return "Gói Tháng SV";
    default:
      return "Chưa có gói";
  }
}
