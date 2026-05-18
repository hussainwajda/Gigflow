"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(20,184,166,0.16),transparent_26%),linear-gradient(135deg,#07070a,#12121a_54%,#07070a)]" />
      <motion.div
        animate={{ opacity: [0.18, 0.3, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.08, 0.2, 0.08], scale: [1.02, 0.96, 1.02] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
    </div>
  );
}
