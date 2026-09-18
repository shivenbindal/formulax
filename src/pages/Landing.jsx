import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, Search, ImagePlus, X, Loader2 } from "lucide-react";
import { searchTopicFormulas, findFormula } from "@/services/groq"; // adjust path if different

// ---------- shared scroll-linked helper ----------
function useParallax(scrollYProgress, distance) {
  return useTransform(scrollYProgress, [0, 1], [-distance, distance]);
}

function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5 relative z-20"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center">
          <span className="text-[13px] font-semibold" style={{ fontFamily: "serif" }}>S</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-black">FormulaLabs</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-[14px] text-black/75">
        <a href="#finder" className="hover:text-black transition-colors">Approach</a>
        <a href="#topics" className="hover:text-black transition-colors">Topics</a>
        <a href="#explore" className="hover:text-black transition-colors">Explore</a>
        <a href="#community" className="hover:text-black transition-colors">Community</a>
        <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
      </div>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Link to="/login" className="px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium block">
          Get Started
        </Link>
      </motion.div>
    </motion.nav>
  );
}

// ---------- Hero, with scroll-linked circle motif ----------
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const leftX = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const rightX = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const centerRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative w-full bg-white overflow-hidden">
      <Nav />
      <motion.div
        style={{ y: headlineY, opacity: headlineOpacity }}
        className="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center md:text-left relative z-10"
      >
        <h1 className="text-[32px] md:text-[46px] font-semibold leading-[1.15] tracking-tight text-black max-w-2xl mx-auto md:mx-0">
          Sharpen your approach until it's instinct.
        </h1>
        <p className="mt-4 text-[15px] text-black/60 max-w-lg mx-auto md:mx-0">
          Built for CBSE, NEET and JEE students who want to actually understand
          the method — not just memorize the formula.
        </p>
      </motion.div>

      <div className="flex items-center justify-center gap-0 py-4 relative z-10">
        <motion.div style={{ x: leftX }} className="relative w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-[#FF4B3E]" />
        </motion.div>
        <div className="w-16 h-[2px] bg-black/80" />
        <span className="w-2.5 h-2.5 rounded-full -mx-1 bg-[#FF4B3E]" />
        <div className="w-16 h-[2px] bg-black/80" />

        <motion.div
          style={{ rotate: centerRotate }}
          className="relative w-28 h-28 rounded-full border-2 border-black bg-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-black" style={{ clipPath: "inset(0 50% 0 0)" }} />
        </motion.div>

        <div className="w-16 h-[2px] bg-black/80" />
        <motion.div style={{ x: rightX }} className="relative w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-[#3E5CFF]" />
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 flex items-center justify-center gap-24 relative z-10">
        {["#B9A6FF", "#FF4B3E", "#3E5CFF"].map((c) => (
          <div key={c} className="w-3 h-3 rounded-full opacity-70" style={{ background: c }} />
        ))}
      </div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="hidden md:flex absolute bottom-8 right-8 w-20 h-20 rounded-full bg-black items-center justify-center z-10"
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

// ---------- restored: LandingFormulaFinder (question + optional image) ----------
function LandingFormulaFinder() {
  const [question, setQuestion] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result.split(",")[1]);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await findFormula(question, imageBase64);
      setResult(res);
    } catch (err) {
      setError("Couldn't fetch that right now — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="finder" className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <span className="w-2.5 h-2.5 rounded-full inline-block mb-3" style={{ background: "#FF6B5B" }} />
        <h2 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-black">
          Ask a question, get the approach.
        </h2>
        <p className="text-[14px] text-black/55 mt-2">Type any problem — attach an image if you have one.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border-2 p-5 md:p-6"
        style={{ borderColor: "rgba(10,10,10,0.1)" }}
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. A block slides down a frictionless incline..."
          rows={3}
          className="w-full bg-transparent outline-none text-[15px] resize-none placeholder:text-black/35"
          style={{ color: "#0A0A0A" }}
        />

        {imagePreview && (
          <div className="relative inline-block mt-3">
            <img src={imagePreview} alt="attached" className="h-20 rounded-xl border" style={{ borderColor: "rgba(10,10,10,0.1)" }} />
            <button
              type="button"
              onClick={() => { setImageBase64(null); setImagePreview(null); }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "rgba(10,10,10,0.08)" }}>
          <label className="flex items-center gap-2 text-[13px] text-black/50 cursor-pointer hover:text-black/80 transition-colors">
            <ImagePlus size={16} />
            Attach image
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          <motion.button
            type="submit"
            disabled={loading || !question.trim()}
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium flex items-center gap-2 disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "Thinking..." : "Find approach"}
          </motion.button>
        </div>
      </form>

      {error && <p className="text-[13px] text-[#FF4B3E] mt-4 text-center">{error}</p>}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl border-2 p-5 md:p-6"
          style={{ borderColor: "rgba(10,10,10,0.1)", background: "#FAFAFA" }}
        >
          {result.approach?.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[12px] uppercase tracking-wider text-black/40 mb-2">Approach</h4>
              <ol className="space-y-2">
                {result.approach.map((step, i) => (
                  <li key={i} className="text-[14px] text-black/80 flex gap-2">
                    <span className="text-black/40">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {result.formulas?.length > 0 && (
            <div>
              <h4 className="text-[12px] uppercase tracking-wider text-black/40 mb-2">Formulas</h4>
              <div className="flex flex-wrap gap-2">
                {result.formulas.map((f, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full border text-[13px]" style={{ borderColor: "rgba(10,10,10,0.15)" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}

// ---------- restored: TopicSearch (type a topic, get every formula) ----------
function TopicSearch() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [formulas, setFormulas] = useState(null);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchTopicFormulas(topic);
      setFormulas(res);
    } catch (err) {
      setError("Couldn't find that topic — try rephrasing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="topics" className="max-w-2xl mx-auto px-6 py-20 text-center">
      <span className="w-2.5 h-2.5 rounded-full inline-block mb-3" style={{ background: "#3E7BFA" }} />
      <h2 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-black mb-2">
        Type a topic, get every formula.
      </h2>
      <p className="text-[14px] text-black/55 mb-6">e.g. "rotational motion" or "chemical bonding"</p>

      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md mx-auto">
        <div
          className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full border-2"
          style={{ borderColor: "rgba(10,10,10,0.12)" }}
        >
          <Search size={16} className="text-black/40 shrink-0" />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Search a topic..."
            className="w-full bg-transparent outline-none text-[14px] placeholder:text-black/35"
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="px-5 py-3 rounded-full bg-black text-white text-[13px] font-medium shrink-0 disabled:opacity-40"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Search"}
        </motion.button>
      </form>

      {error && <p className="text-[13px] text-[#FF4B3E] mt-4">{error}</p>}

      {formulas && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {formulas.map((f, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full border text-[13.5px]"
              style={{ borderColor: "rgba(10,10,10,0.15)" }}
            >
              {f}
            </span>
          ))}
        </motion.div>
      )}
    </section>
  );
}

// ---------- feature rows, now with real scroll-linked parallax ----------
function FeatureRow({ title, desc, dotColor, reverse, id }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useParallax(scrollYProgress, 40);
  const textY = useParallax(scrollYProgress, -15);

  return (
    <div
      ref={ref}
      id={id}
      className={`max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row ${reverse ? "md:flex-row-reverse" : ""} items-center gap-10 border-t overflow-hidden`}
      style={{ borderColor: "rgba(10,10,10,0.08)" }}
    >
      <motion.div style={{ y: textY }} className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
          <span className="text-[12px] uppercase tracking-wider text-black/40">{id}</span>
        </div>
        <h3 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-black mb-3">{title}</h3>
        <p className="text-[15px] text-black/60 leading-relaxed max-w-md">{desc}</p>
      </motion.div>
      <motion.div style={{ y: imageY }} className="flex-1 w-full">
        <div
          className="aspect-[4/3] rounded-3xl border-2 border-black/10 flex items-center justify-center"
          style={{ background: "#FAFAFA" }}
        >
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-6 h-6 rounded-full" style={{ background: dotColor }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(10,10,10,0.08)" }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between py-5 text-left">
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
      <motion.div className="inline-block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Link to="/login" className="px-8 py-3.5 rounded-full bg-black text-white text-[14px] font-medium inline-block">
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
      <LandingFormulaFinder />
      <TopicSearch />

      <FeatureRow
        id="explore"
        title="Explore every chapter, mapped to your syllabus."
        desc="Browse Physics, Chemistry, Biology and Math by class and chapter — structured exactly the way NCERT lays it out, nothing extra to dig through."
        dotColor="#3E7BFA"
      />
      <FeatureRow
        id="community"
        title="Learn alongside people solving the same problems."
        desc="Ask doubts, follow people further along, and see how others approached the question you're stuck on."
        dotColor="#8B5CF6"
        reverse
      />

      <section id="faq" className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-[24px] font-semibold tracking-tight text-black mb-8 text-center">Frequently asked</h2>
        <FAQItem q="Is this only for NEET and JEE?" a="No — it covers CBSE Class 9 through 12 as well, so it's useful whether or not you're taking a competitive exam." />
        <FAQItem q="Is it free to use?" a="Yes, the core features are free. Nothing here requires payment to get started." />
        <FAQItem q="Do I need to install anything?" a="No — it runs entirely in the browser. Sign in with Google and you're in." />
      </section>

      <CTAFooter />
    </div>
  );
}
