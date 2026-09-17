import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center">
          <span className="text-[13px] font-semibold" style={{ fontFamily: "serif" }}>S</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-black">FormulaLabs</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-[14px] text-black/75">
        <a href="#explore" className="hover:text-black transition-colors">Explore</a>
        <a href="#approach" className="hover:text-black transition-colors">Approach</a>
        <a href="#community" className="hover:text-black transition-colors">Community</a>
        <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
      </div>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium block"
        >
          Get Started
        </Link>
      </motion.div>
    </motion.nav>
  );
}

function CircleMotif() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="flex items-center justify-center gap-0 py-4"
    >
      <motion.div
        custom={0}
        variants={fadeUp}
        className="relative w-16 h-16 rounded-full border-2 border-black flex items-center justify-center"
      >
        <div className="w-7 h-7 rounded-full bg-[#FF4B3E]" />
      </motion.div>
      <motion.div custom={1} variants={fadeUp} className="w-16 h-[2px] bg-black/80" />
      <motion.span custom={1.2} variants={fadeUp} className="w-2.5 h-2.5 rounded-full -mx-1 bg-[#FF4B3E]" />
      <motion.div custom={1.4} variants={fadeUp} className="w-16 h-[2px] bg-black/80" />

      <motion.div
        custom={2}
        variants={fadeUp}
        animate={{ rotate: 360 }}
        transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" } }}
        className="relative w-28 h-28 rounded-full border-2 border-black bg-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-black" style={{ clipPath: "inset(0 50% 0 0)" }} />
      </motion.div>

      <motion.div custom={3} variants={fadeUp} className="w-16 h-[2px] bg-black/80" />
      <motion.div
        custom={4}
        variants={fadeUp}
        className="relative w-16 h-16 rounded-full border-2 border-black flex items-center justify-center"
      >
        <div className="w-7 h-7 rounded-full bg-[#3E5CFF]" />
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      <Nav />
      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center md:text-left"
      >
        <h1 className="text-[32px] md:text-[46px] font-semibold leading-[1.15] tracking-tight text-black max-w-2xl mx-auto md:mx-0">
          Sharpen your approach until it's instinct.
        </h1>
        <p className="mt-4 text-[15px] text-black/60 max-w-lg mx-auto md:mx-0">
          Built for CBSE, NEET and JEE students who want to actually understand
          the method — not just memorize the formula.
        </p>
      </motion.div>

      <CircleMotif />

      <motion.div
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-6 pb-16 flex items-center justify-center gap-24"
      >
        {["#B9A6FF", "#FF4B3E", "#3E5CFF"].map((c, i) => (
          <motion.div
            key={c}
            custom={i}
            variants={fadeUp}
            className="w-3 h-3 rounded-full opacity-70"
            style={{ background: c }}
          />
        ))}
      </motion.div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="hidden md:flex absolute bottom-8 right-8 w-20 h-20 rounded-full bg-black items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <path id="circlePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text fill="white" fontSize="8" letterSpacing="2">
            <textPath xlinkHref="#circlePath">CBSE · NEET · JEE · CBSE · NEET · JEE ·</textPath>
          </text>
        </svg>
        <span className="text-white text-[16px] font-semibold" style={{ fontFamily: "serif" }}>S</span>
      </motion.div>
    </section>
  );
}

function FeatureRow({ title, desc, dotColor, reverse, id }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={`max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row ${reverse ? "md:flex-row-reverse" : ""} items-center gap-10 border-t`}
      style={{ borderColor: "rgba(10,10,10,0.08)" }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
          <span className="text-[12px] uppercase tracking-wider text-black/40">{id}</span>
        </div>
        <h3 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-black mb-3">
          {title}
        </h3>
        <p className="text-[15px] text-black/60 leading-relaxed max-w-md">{desc}</p>
      </div>
      <div className="flex-1 w-full">
        <div
          className="aspect-[4/3] rounded-3xl border-2 border-black/10 flex items-center justify-center"
          style={{ background: "#FAFAFA" }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-6 h-6 rounded-full" style={{ background: dotColor }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(10,10,10,0.08)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-[15px] font-medium text-black">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-black/50" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[14px] text-black/60 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

function CTAFooter() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-6 py-24 text-center"
    >
      <h2 className="text-[28px] md:text-[36px] font-semibold tracking-tight text-black mb-6">
        Start building your approach today.
      </h2>
      <motion.div
        className="inline-block"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <Link
          to="/login"
          className="px-8 py-3.5 rounded-full bg-black text-white text-[14px] font-medium inline-block"
        >
          Get Started — it's free
        </Link>
      </motion.div>
    </motion.section>
  );
}

export default function Landing() {
  return (
    <div className="bg-white min-h-screen">
      <Hero />

      <FeatureRow
        id="explore"
        title="Explore every chapter, mapped to your syllabus."
        desc="Browse Physics, Chemistry, Biology and Math by class and chapter — structured exactly the way NCERT lays it out, nothing extra to dig through."
        dotColor="#3E7BFA"
      />
      <FeatureRow
        id="approach"
        title="Ask a question, get the approach — not just the answer."
        desc="Type any problem and see the reasoning path laid out step by step, with the exact formulas referenced inline."
        dotColor="#FF6B5B"
        reverse
      />
      <FeatureRow
        id="community"
        title="Learn alongside people solving the same problems."
        desc="Ask doubts, follow people further along, and see how others approached the question you're stuck on."
        dotColor="#8B5CF6"
      />

      <section id="faq" className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-[24px] font-semibold tracking-tight text-black mb-8 text-center">
          Frequently asked
        </h2>
        <FAQItem
          q="Is this only for NEET and JEE?"
          a="No — it covers CBSE Class 9 through 12 as well, so it's useful whether or not you're taking a competitive exam."
        />
        <FAQItem
          q="Is it free to use?"
          a="Yes, the core features are free. Nothing here requires payment to get started."
        />
        <FAQItem
          q="Do I need to install anything?"
          a="No — it runs entirely in the browser. Sign in with Google and you're in."
        />
      </section>

      <CTAFooter />
    </div>
  );
}
