import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

export default function ComingSoon({ open, onClose, label }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90vw] max-w-sm bg-white rounded-3xl p-7 shadow-2xl text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors">
              <X size={18} strokeWidth={2} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-4">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <h3 className="text-[16px] font-semibold tracking-[-0.2px] text-black mb-1.5">{label} is on the way</h3>
            <p className="text-[13px] text-[#86868B] leading-relaxed">We're building this next. Check back soon.</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
