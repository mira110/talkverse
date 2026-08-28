import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import { ArrowRight, Globe, Headphones, BookOpen, Sparkles } from "lucide-react";
import Button from "../components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" } }),
};

const features = [
  { icon: Globe, title: "Learn via Mother Tongue", desc: "Tamil speaker learns Hindi through Tamil, not English" },
  { icon: Headphones, title: "Accurate Pronunciation", desc: "Native speaker audio with phonetic breakdown" },
  { icon: BookOpen, title: "Script & Transliteration", desc: "Toggle between native script and Roman letters" },
  { icon: Sparkles, title: "Gamified Learning", desc: "XP points, streaks, and level-up celebrations" },
];

const languages = ["தமிழ்", "മലയാളം", "ಕನ್ನಡ", "తెలుగు", "हिन्दी"];

const southIndianLetters = [
  "அ","ஆ","இ","க","ச","த","ந","ப","ம","ய","ர","ல","வ","ழ","ள","ற","ன",
  "അ","ആ","ഇ","ക","ച","ത","ന","പ","മ","യ","ര","ല","ള","ഴ",
  "ಅ","ಆ","ಇ","ಕ","ಚ","ತ","ನ","ಪ","ಮ","ಯ","ರ","ಲ","ಳ",
  "అ","ఆ","ఇ","క","చ","త","న","ప","మ","య","ర","ల","ళ","ఱ",
  "अ","आ","इ","क","च","त","न","प","म","य","र","ल","ळ"
];

function FloatingLetters() {
  const letters = southIndianLetters.map((letter, i) => ({
    letter,
    left: `${(i * 2.3) % 100}%`,
    fontSize: `${2 + (i % 4)}rem`,
    duration: `${18 + (i * 3) % 20}s`,
    delay: `${(i * 1.7) % 15}s`,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {letters.map((item, i) => (
        <span
          key={i}
          className="floating-letter"
          style={{
            left: item.left,
            fontSize: item.fontSize,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        >
          {item.letter}
        </span>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-light text-text-main overflow-hidden relative">
      <FloatingLetters />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          {/* YOUR CUSTOM LOGO IS HERE NOW */}
          <img src={logo} alt="TalkVerse Logo" className="h-20 w-auto object-contain" />
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/login"}>Sign In</Button>
      </nav>

      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {languages.map((lang, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="px-5 py-2 rounded-full bg-white border border-light-border text-text-main text-sm font-semibold shadow-sm"
            >
              {lang}
            </motion.span>
          ))}
        </motion.div>

        <motion.h1 custom={0} variants={fadeUp} initial="hidden" animate="visible" className="text-4xl md:text-6xl font-extrabold leading-tight text-text-main">
          Learn a New Language in
          <span className="text-primary block mt-2">Your Own Mother Tongue</span>
        </motion.h1>

        <motion.p custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl">
          No English required. A Tamil speaker learns Hindi through Tamil. Accurate pronunciation, real scripts, and gamified lessons.
        </motion.p>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mt-10 flex gap-4 flex-wrap justify-center">
          <Button variant="primary" size="lg" onClick={() => window.location.href = "/login"}>
            Start Learning Free <ArrowRight size={20} />
          </Button>
        </motion.div>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mt-16 flex gap-10 md:gap-16 text-center">
          {[
            { num: "5", label: "Languages" },
            { num: "20+", label: "Lessons" },
            { num: "500+", label: "Words" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-secondary">{s.num}</div>
              <div className="text-sm text-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center mb-14 text-text-main"
        >
          Why <span className="text-primary">TalkVerse</span>?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-light-card border border-light-border rounded-2xl p-7 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-text-main">{f.title}</h3>
              <p className="text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-light-border py-8 text-center text-text-muted text-sm">
        © 2026 TalkVerse — Learn Regionally, Speak Globally
      </footer>
    </div>
  );
}