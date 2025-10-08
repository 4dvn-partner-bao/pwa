import React from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Icons.jsx";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/60 dark:bg-gray-900/50 border-b border-white/60 dark:border-white/10">
      <div className="h-14 px-5 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .25 }}
        >
          <Logo className="h-7 w-7 text-sky-600 drop-shadow-[0_1px_8px_rgba(56,189,248,0.45)]" />
          <span className="font-extrabold text-lg tracking-tight">Space Hub</span>
        </motion.div>

        <motion.div whileTap={{ scale: .96 }}>
          <NavLink
            to="/pwa"
            className="text-sm px-3.5 py-2 rounded-xl bg-white/80 dark:bg-gray-800/70 border border-white/40 dark:border-white/10 shadow-sm hover:shadow transition-shadow"
          >
            Notification test
          </NavLink>
        </motion.div>
      </div>
    </header>
  );
}
