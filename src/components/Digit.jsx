// src/components/Digit.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Digit({ char }) {
  // Container để giới hạn chiều cao và ẩn đi phần animation bị tràn
  return (
    <div className="relative inline-block h-[1em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-block" // Dùng inline-block để giữ nó trong dòng chảy văn bản
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}