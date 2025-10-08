import React from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import { getLastReceipt } from "../lib/session.js";

export default function Receipt() {
  const [sp] = useSearchParams();
  const id = sp.get("id");
  const receipt = getLastReceipt(id);

  if (!receipt) {
    return (
      <main className="p-5">
        <h1 className="text-xl font-extrabold">Chưa có biên lai</h1>
        <p className="text-sm mt-2">Hãy hoàn tất thanh toán để nhận biên lai.</p>
      </main>
    );
  }

  return (
    <main className="p-5">
      <h1 className="text-xl font-extrabold">Biên lai</h1>
      <div className="mt-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="text-sm text-gray-500">Mã biên lai</div>
        <div className="text-xl font-bold">{receipt.id}</div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-base">
          <div>
            <div className="text-sm text-gray-500">Bàn</div>
            <div className="text-lg font-semibold text-sky-600">{receipt.tableId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tổng tiền</div>
            <div className="text-lg font-semibold">{receipt.total.toLocaleString()}đ</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <NavLink
            to="/checkin"
            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-3 text-base font-bold text-center"
          >
            Check-in lần sau
          </NavLink>
          <NavLink
            to="/"
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-base bg-white dark:bg-gray-900 text-center"
          >
            Về trang chủ
          </NavLink>
        </div>
      </div>
    </main>
  );
}
