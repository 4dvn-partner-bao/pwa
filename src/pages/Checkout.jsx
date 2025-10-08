import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { seedDemoData } from "../lib/mock.js";
import { getActiveSession, finishSession } from "../lib/session.js";
import { priceSummary } from "../lib/pricing.js";
import { humanizeDuration } from "../lib/time.js";
import { motion } from "framer-motion";

export default function Checkout() {
  const navigate = useNavigate();

  useEffect(() => { seedDemoData(); }, []);
  const session = getActiveSession();

  if (!session) {
    return (
      <main className="p-5">
        <h1 className="text-xl font-extrabold">Không có phiên để thanh toán</h1>
        <p className="text-sm mt-2">Hãy check-in trước.</p>
      </main>
    );
  }

  const now = Date.now();
  const sum = priceSummary({ start: session.startTime, end: now, drinks: session.drinks || 0 });

  const onPaid = () => {
    const rid = finishSession({ endTime: now, total: sum.total });
    navigate(`/history?highlight=${rid}`);
  };

  return (
    <main className="p-5">
      <h1 className="text-xl font-extrabold">Thanh toán</h1>
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .25 }}
        className="mt-3 rounded-2xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-gray-800/80 backdrop-blur p-4 shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Bàn</div>
            <div className="text-2xl font-black text-sky-600">{session.tableId}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tổng thời gian</div>
            <div className="text-xl font-bold">{humanizeDuration(sum.durationMs)}</div>
          </div>
        </div>

        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden:{opacity:1}, show:{opacity:1, transition:{staggerChildren:.06}} }}
          className="mt-4 space-y-2 text-base"
        >
          <Row label="Gói 4h (mặc định)">{sum.base.toLocaleString()}đ</Row>
          {sum.blocks > 0 && (
            <Row label={`Giờ lẻ (+${sum.blocks} × 30')`}>{sum.blockCost.toLocaleString()}đ</Row>
          )}
          {sum.capped && <Row label="Chuyển sang gói ngày (cap)">{sum.dayCap.toLocaleString()}đ</Row>}
          {sum.drinkCost > 0 && (
            <Row label={`Đồ uống (${sum.drinks} sp)`}>{sum.drinkCost.toLocaleString()}đ</Row>
          )}
          <div className="h-px bg-gray-200/70 dark:bg-white/10 my-2" />
          <Row label={<b>Tổng cộng</b>}>
            <b className="text-sky-600">{sum.total.toLocaleString()}đ</b>
          </Row>
        </motion.div>

        <div className="mt-4 grid gap-2">
          <motion.button whileTap={{ scale: .98 }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-base font-bold">
            QR Pay (mock)
          </motion.button>
          <motion.button
            whileTap={{ scale: .98 }}
            onClick={onPaid}
            className="rounded-xl border border-white/60 dark:border-white/10 px-4 py-3 text-base bg-white/80 dark:bg-gray-900/60"
          >
            Tôi đã thanh toán
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}

function Row({ label, children }) {
  return (
    <motion.div
      variants={{ hidden:{y:8, opacity:0}, show:{y:0, opacity:1, transition:{type:"spring", stiffness:260, damping:20}} }}
      className="flex items-center justify-between"
    >
      <div className="text-gray-600 dark:text-gray-300">{label}</div>
      <div>{children}</div>
    </motion.div>
  );
}
