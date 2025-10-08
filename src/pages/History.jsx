import React, { useEffect, useState } from "react";
import { seedDemoData } from "../lib/mock.js";
import { listReceipts } from "../lib/session.js";
import { humanizeDuration, formatDateTime } from "../lib/time.js";
import { motion } from "framer-motion";

export default function History() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    seedDemoData();
    setItems(listReceipts());
  }, []);

  if (!items.length) {
    return (
      <main className="p-5">
        <h1 className="text-xl font-extrabold">Lịch sử</h1>
        <p className="text-sm mt-2">Chưa có biên lai nào.</p>
      </main>
    );
  }

  return (
    <main className="p-5">
      <h1 className="text-xl font-extrabold">Lịch sử biên lai</h1>
      <div className="mt-3 grid gap-3">
        {items.map((r, i) => (
          <ReceiptCard key={r.id} r={r} fresh={i === 0} />
        ))}
      </div>
    </main>
  );
}

function ReceiptCard({ r, fresh }) {
  const duration = r.endTime && r.startTime ? humanizeDuration(r.endTime - r.startTime) : "-";
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .2, delay: fresh ? .05 : 0 }}
      whileHover={{ y: -2, boxShadow: "0 10px 28px rgba(0,0,0,.08)" }}
      className="relative rounded-2xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-gray-800/80 backdrop-blur p-4"
    >
      {fresh && (
        <motion.span
          initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-900 shadow"
        >
          MỚI
        </motion.span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">Mã biên lai</div>
          <div className="text-base font-bold">{r.id}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Tổng tiền</div>
          <div className="text-base font-bold text-sky-600">{r.total.toLocaleString()}đ</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <Info label="Bàn" value={r.tableId} />
        <Info label="Thời lượng" value={duration} />
        <Info label="Bắt đầu" value={formatDateTime(r.startTime)} />
        <Info label="Kết thúc" value={formatDateTime(r.endTime)} />
        <Info label="Đồ uống" value={`${r.drinks} sp`} />
      </div>
    </motion.article>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
