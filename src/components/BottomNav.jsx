import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HomeIcon, TimerIcon, PayIcon, ReceiptIcon, UserIcon } from "./Icons.jsx";
import { motion } from "framer-motion";

const items = [
  { key: "home", label: "Trang chủ", to: "/", icon: HomeIcon },
  { key: "session", label: "Phiên", to: "/session", icon: TimerIcon },
  { key: "checkout", label: "Thanh toán", to: "/checkout", icon: PayIcon },
  { key: "history", label: "Lịch sử", to: "/history", icon: ReceiptIcon },
  { key: "account", label: "Tài khoản", to: "/profile", icon: UserIcon },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const idx = Math.max(0, items.findIndex(i => i.to === pathname));
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-white/60 dark:border-white/10 bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg supports-[padding:max(0px,env(safe-area-inset-bottom))]:pb-[env(safe-area-inset-bottom)]">
      <div className="relative">
        <motion.div
          className="absolute top-0 h-[2px] bg-gradient-to-r from-sky-400 to-cyan-400"
          initial={false}
          animate={{ left: `calc(${idx} * 20%)`, width: "20%" }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        />
        <ul className="grid grid-cols-5 h-[86px]">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.key} className="contents">
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    `relative flex flex-col items-center justify-center gap-1.5 text-[13px] font-semibold ${
                      isActive ? "text-sky-600" : "text-gray-700 dark:text-gray-200 hover:text-sky-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <motion.div whileTap={{ scale: .9 }}>
                        <Icon className="h-6 w-6" />
                      </motion.div>
                      <span>{it.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="dot"
                          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-sky-500"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
