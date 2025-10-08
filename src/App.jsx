import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import BottomNav from "./components/BottomNav.jsx";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-black text-gray-900 dark:text-gray-100 selection:bg-sky-200/70 dark:selection:bg-sky-700/40">
      <div className="pb-[calc(86px+env(safe-area-inset-bottom))]">
        <Header />
        <div className="px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
