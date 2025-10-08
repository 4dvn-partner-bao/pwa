// src/pages/Session.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { seedDemoData } from "../lib/mock.js";
import { getActiveSession } from "../lib/session.js";
import { motion } from "framer-motion";

// IMPORT COMPONENT MỚI ĐỂ HIỂN THỊ THỜI GIAN
import AnimatedTime from "../components/AnimatedTime.jsx";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export default function SessionPage() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    seedDemoData();
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const session = getActiveSession();

  if (!session) {
    return (
      <main className="p-5">
        <h1 className="text-xl font-extrabold">Chưa có phiên hoạt động</h1>
        <p className="text-sm mt-2">Nhấn “Check-in nhanh” ở trang chủ để bắt đầu.</p>
      </main>
    );
  }

  const now = Date.now();
  const elapsedMs = now - session.startTime;
  const remainMs = Math.max(0, FOUR_HOURS_MS - elapsedMs);
  const overtimeMs = Math.max(0, elapsedMs - FOUR_HOURS_MS);

  const endAt = new Date(session.startTime + FOUR_HOURS_MS);
  const endAtLabel = formatClock(endAt);

  // ====== Circle progress ======
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const progress = Math.max(0, 1 - elapsedMs / FOUR_HOURS_MS);
  const dashOffset = circ * (1 - progress);

  const remainLabel = formatHMS(remainMs);
  const elapsedLabel = formatHMS(elapsedMs);
  const overtimeLabel = "+" + formatHMS(overtimeMs); // Thêm dấu + để xử lý trong AnimatedTime

  const isOver = elapsedMs >= FOUR_HOURS_MS;

  const ringColor = isOver ? "stroke-rose-500" : "stroke-sky-500";
const glow = isOver
  ? "drop-shadow-[0_0_18px_rgba(244,63,94,0.55)]" // Màu đỏ khi quá giờ
  : "drop-shadow-[0_0_18px_rgba(14,165,233,0.55)]"; // Màu xanh khi chưa quá giờ

  return (
    <main className="p-5">
      <h1 className="text-xl font-extrabold">Phiên hiện tại</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-3 rounded-3xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-gray-800/80 backdrop-blur p-5 shadow"
      >
        {/* Header info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Bàn</div>
            <div className="text-2xl font-black text-sky-600">{session.tableId}</div>
          </div>
        </div>

        {/* Circular countdown */}
        <div className="grid place-items-center my-2">
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-gray-200 dark:stroke-gray-700"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
              />
              {/* Progress */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className={`${ringColor} `}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
              />
            </svg>

            {/* Center labels */}
            <div className="absolute inset-0 grid place-items-center text-center">
              {!isOver ? (
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Còn lại</div>
                  <AnimatedTime
                    timeString={remainLabel}
                    className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 tabular-nums"
                  />
                  <div className="text-[11px] text-gray-500 mt-1">
                    Kết thúc dự kiến <b>{endAtLabel}</b>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs uppercase tracking-wide text-rose-500">Quá 4 giờ</div>
                  <AnimatedTime
                    timeString={overtimeLabel}
                    className="text-3xl font-extrabold text-rose-600 tabular-nums"
                  />
                  <div className="text-[11px] text-gray-500 mt-1">
                    Vui lòng <b>Check-out</b> để tính tiền
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/checkout")}
            className={`w-full rounded-2xl px-5 py-3 text-base font-bold text-white shadow-sm ${
              isOver ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            Check-out & Thanh toán
          </motion.button>
        </div>

        {/* Meta */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Meta label="Bắt đầu" value={formatClock(new Date(session.startTime))} />
          <Meta label="Kết thúc (dự kiến)" value={formatClock(endAt)} />
        </div>
      </motion.div>
    </main>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}

// 00:00:00 format
function formatHMS(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatClock(d) {
  const dd = typeof d === "number" ? new Date(d) : d;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(dd.getHours())}:${pad(dd.getMinutes())}`;
}