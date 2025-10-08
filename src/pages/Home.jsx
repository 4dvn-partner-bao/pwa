import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { QrIcon, WifiIcon, PlugIcon, AcIcon, QuietIcon, SelfIcon } from "../components/Icons.jsx";
import { seedDemoData, getUser } from "../lib/mock.js";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";

const SERVICES = [
  { key: "wifi", label: "Wi-Fi mạnh", icon: WifiIcon },
  { key: "power", label: "Ổ cắm mỗi bàn", icon: PlugIcon },
  { key: "ac", label: "Máy lạnh", icon: AcIcon },
  { key: "quiet", label: "Khu yên tĩnh", icon: QuietIcon },
  { key: "self", label: "Tự phục vụ", icon: SelfIcon },
];

const PACKAGES = [
  { key: "2h", name: "Gói 2 tiếng", price: "25K", desc: "Vãng lai, ghé nhanh", badge: "Mồi thử" },
  { key: "4h", name: "Gói 4 tiếng", price: "35K", desc: "Gói phổ biến", highlight: true, badge: "Bán chạy" },
  { key: "day", name: "Gói ngày", price: "60K", desc: "> 6h auto áp dụng" },
  { key: "week", name: "Gói tuần", price: "300K", desc: "Linh hoạt 7 ngày" },
  { key: "month", name: "Gói tháng", price: "1.2M", desc: "Ra vào nhiều lần/ngày", badge: "Tiết kiệm" },
  { key: "student", name: "Tháng SV", price: "800K", desc: "Ưu đãi sinh viên" },
];

// Container xuất hiện nhẹ
const sectionFade = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, // cubic-bezier “easeOutExpo-ish”
  },
};

// Item “bật” lên theo index (cascade)
const itemUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.25, 0.1, 0.25, 1],
      delay: i * 0.06, // delay theo index
    },
  }),
};

// Package card vào mượt, hover nhẹ
const cardIn = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
  }),
};

export default function Home() {
  const [user, setUser] = useState(getUser());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    seedDemoData();
    setUser(getUser());
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <main>
        {/* Hero */}
        <section className="px-5 pt-4 pb-5">
          <motion.div
            variants={sectionFade}
            initial="hidden"
            animate="show"
            className="rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-500 text-white p-5 shadow-xl relative overflow-hidden transform-gpu will-change-transform"
          >
            {/* Bong bóng nhẹ — tắt nếu user giảm chuyển động */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20 blur-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: "transform" }}
              />
            )}
            <h1 className="text-2xl font-extrabold">Space Hub</h1>
            <p className="text-base/6 opacity-95 mt-1">
              Xin chào <b>{user?.name || "bạn"}</b> 👋 — Không gian học & làm việc theo giờ. QR check-in, tự phục vụ đồ uống.
            </p>
            <div className="mt-4 flex gap-3">
              <NavLink
                to="/checkin"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/95 text-sky-700 px-4 py-2.5 text-base font-semibold shadow hover:shadow-md active:scale-[.98] transition"
              >
                <QrIcon className="h-5 w-5" /> Check-in nhanh
              </NavLink>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-2.5 text-base font-medium backdrop-blur hover:bg-black/25 transition"
              >
                Bảng giá
              </a>
            </div>
          </motion.div>
        </section>

        {/* Services – cascade theo index (không lên cùng lúc) */}
        <section className="px-5">
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-3">Dịch vụ đi kèm</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICES.map((s, i) => (
              <div
                key={s.key}
                className="flex items-center gap-2.5 rounded-full bg-white/80 dark:bg-gray-800/70 border border-white/60 dark:border-white/10 px-4 py-2.5 shadow-sm hover:shadow transition transform-gpu will-change-transform"
                
              >
                <s.icon className="h-5 w-5" />
                <span className="text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Packages – vào mượt theo index */}
        <section id="pricing" className="px-5 mt-5">
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-3">Gói dành cho bạn</h2>
          <div className="grid gap-4">
            {PACKAGES.map((p, i) => (
              <PackageCard key={p.key} pkg={p} index={i} />
            ))}
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}

function PackageCard({ pkg, index }) {
  const Badge = pkg.badge ? (
    <span className="absolute -top-2 right-4 rounded-full bg-amber-400 text-amber-950 text-[11px] font-extrabold px-2.5 py-0.5 shadow">
      {pkg.badge}
    </span>
  ) : null;

  return (
    <motion.article
      variants={cardIn}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      custom={index}
      className={[
        "relative rounded-3xl border p-5 shadow-sm bg-white/90 dark:bg-gray-800/80 backdrop-blur",
        pkg.highlight
          ? "border-sky-300/80 dark:border-sky-600 ring-2 ring-sky-200/80"
          : "border-white/60 dark:border-white/10",
      ].join(" ")}
      whileHover={{ y: -2 }}
      style={{ willChange: "transform" }}
    >
      {Badge}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold">{pkg.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pkg.desc}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-sky-600">{pkg.price}</div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500">VND</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <NavLink
          to={`/checkout?plan=${pkg.key}`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 text-base font-bold active:scale-[.98] transition"
        >
          Chọn gói
        </NavLink>
        <NavLink
          to={`/checkin?plan=${pkg.key}`}
          className="px-4 py-2.5 text-base rounded-2xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 hover:shadow-sm transition"
        >
          Dùng ngay
        </NavLink>
      </div>
    </motion.article>
  );
}
