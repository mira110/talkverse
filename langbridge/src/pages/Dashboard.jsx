import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Trophy,
  Lock,
  CheckCircle,
  ArrowRight,
  Bot,
  MessageCircle,
  Puzzle,
  Sparkles,
  MessageSquare,
  Mic
} from "lucide-react";
import logo from "../assets/logo.png";
import Button from "../components/ui/Button";
import ProgressRing from "../components/charts/ProgressRing";
import DialogueModal from "../components/exercise/DialogueModal";
import useSoundEffects from "../hooks/useSoundEffects";
import useStore from "../store/useStore";

const langMap = {
  ta: { name: "Tamil", script: "தமிழ்", code: "ta-IN" },
  ml: { name: "Malayalam", script: "മലയാളം", code: "ml-IN" },
  kn: { name: "Kannada", script: "ಕನ್ನಡ", code: "kn-IN" },
  te: { name: "Telugu", script: "తెలుగు", code: "te-IN" },
  hi: { name: "Hindi", script: "हिन्दी", code: "hi-IN" },
};

const pathUiLabels = {
  hi: {
    pathTitle: "अध्ययन मार्ग (१३ पाठ)",
    pathSubtitle: "फ्लैशकार्ड ➔ जोड़ी मिलान ➔ मौखिक अभ्यास ➔ श्रवण प्रश्न ➔ समयबद्ध क्विज",
    unitPrefix: "पाठ",
    wordsSuffix: "मुख्य शब्द",
    cleared: "पूर्ण",
    locked: "बंद",
    start: "शुरू करें",
  },
  ta: {
    pathTitle: "கற்றல் பாதை (13 அலகுகள்)",
    pathSubtitle: "சொல் அட்டைகள் ➔ இணை பொருத்தம் ➔ குரல் பயிற்சி ➔ கேட்டு அறிதல் ➔ விரைவு வினாடி வினா",
    unitPrefix: "அலகு",
    wordsSuffix: "அத்தியாவசியச் சொற்கள்",
    cleared: "முடிந்தது",
    locked: "பூட்டப்பட்டது",
    start: "தொடங்கு",
  },
  kn: {
    pathTitle: "ಕಲಿಕಾ ಹಾದಿ (೧೩ ಘಟಕಗಳು)",
    pathSubtitle: "ಫ್ಲ್ಯಾಶ್ ಕಾರ್ಡ್‌ಗಳು ➔ ಜೋಡಿ ಹೊಂದಿಸಿ ➔ ಧ್ವನಿ ಅಭ್ಯಾಸ ➔ ಆಲಿಸಿ ಗುರುತಿಸಿ ➔ ರಸಪ್ರಶ್ನೆ",
    unitPrefix: "ಘಟಕ",
    wordsSuffix: "ಪ್ರಮುಖ ಪದಗಳು",
    cleared: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    locked: "ಲಾಕ್ ಆಗಿದೆ",
    start: "ಪ್ರಾರಂಭಿಸಿ",
  },
  te: {
    pathTitle: "అభ్యాస మార్గం (13 పాఠాలు)",
    pathSubtitle: "ఫ్లాష్‌కార్డులు ➔ జతపరచడం ➔ వాయిస్ ప్రాక్టీస్ ➔ విని గుర్తించడం ➔ క్విజ్",
    unitPrefix: "పాఠం",
    wordsSuffix: "ముఖ్యమైన పదాలు",
    cleared: "పూర్తయింది",
    locked: "లాక్ చేయబడింది",
    start: "ప్రారంభించండి",
  },
  ml: {
    pathTitle: "പഠന വഴി (13 പാഠങ്ങൾ)",
    pathSubtitle: "ഫ്ലാഷ് കാർഡുകൾ ➔ ജോഡി ചേർക്കൽ ➔ വോയ്‌സ് അരീന ➔ കേട്ട് കണ്ടെത്തൽ ➔ ക്വിസ്",
    unitPrefix: "പാഠം",
    wordsSuffix: "പ്രധാന വാക്കുകൾ",
    cleared: "പൂർത്തിയായി",
    locked: "ലോക്ക് ചെയ്‌തു",
    start: "തുടങ്ങുക",
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    nativeLang = "ta",
    targetLang = "kn",
    xp = 0,
    streak = 1,
    level = 1,
    wordsLearned = 0,
    todayXP = 0,
    dailyGoal = 100,
    completedLessons = [],
    hasSelectedLanguages,
    loadCloudProgress
  } = useStore();

  const { playClick } = useSoundEffects();
  const [lessons, setLessons] = useState([]);
  const [dialogues, setDialogues] = useState([]);
  const [selectedDialogue, setSelectedDialogue] = useState(null);

  const targetCode = langMap[targetLang]?.code || "kn-IN";

  useEffect(() => {
    loadCloudProgress();
  }, [loadCloudProgress]);

  useEffect(() => {
    if (!nativeLang || !targetLang || !hasSelectedLanguages) {
      navigate("/select");
    }
  }, [nativeLang, targetLang, hasSelectedLanguages, navigate]);

  useEffect(() => {
    if (!nativeLang || !targetLang) return;

    async function fetchDashboardData() {
      try {
        // Fetch Lessons
        const resLessons = await fetch(`/api/lessons?native=${nativeLang}&target=${targetLang}`);
        if (resLessons.ok) {
          const data = await resLessons.json();
          const transformed = data.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isLocked = index > 0 && !completedLessons.includes(data[index - 1]?.id) && !isCompleted;
            return {
              id: index + 1,
              title: lesson.title,
              englishTitle: lesson.englishTitle,
              description: lesson.description,
              words: lesson.words ? lesson.words.length : 5,
              completed: isCompleted,
              locked: isLocked,
              routeId: lesson.id,
              xpEarned: lesson.xp_reward || 50,
            };
          });
          setLessons(transformed);
        }

        // Fetch Dialogues
        const resDialogues = await fetch(`/api/dialogues?native=${nativeLang}&target=${targetLang}`);
        if (resDialogues.ok) {
          const dataDialogues = await resDialogues.json();
          setDialogues(dataDialogues);
        }
      } catch (err) {
        console.warn("Failed fetching dashboard data:", err);
      }
    }
    fetchDashboardData();
  }, [nativeLang, targetLang, completedLessons]);

  const native = langMap[nativeLang] || langMap.ta;
  const target = langMap[targetLang] || langMap.kn;
  const pathLabels = pathUiLabels[targetLang] || pathUiLabels.hi;

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Learner";
  const dailyProgress = Math.min(100, Math.round(((todayXP || 0) / (dailyGoal || 100)) * 100));

  return (
    <div className="min-h-screen bg-light-bg text-text-main pb-20 selection:bg-primary/20">
      {/* Dialogue Simulator Modal */}
      <DialogueModal
        scenario={selectedDialogue}
        isOpen={Boolean(selectedDialogue)}
        onClose={() => setSelectedDialogue(null)}
        targetCode={targetCode}
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-light-card/80 backdrop-blur-md border-b border-light-border px-6 md:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="TalkVerse Logo" className="w-9 h-9 object-contain" />
          <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TalkVerse
          </span>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 text-secondary font-bold text-sm bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 shadow-xs">
            <Flame size={18} className="fill-secondary animate-pulse" />
            <span>{streak}d Streak</span>
          </div>

          <div className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-xs">
            <Trophy size={16} className="text-primary" />
            <span>{xp} XP</span>
          </div>

          <button
            onClick={() => navigate("/profile")}
            title="View Profile"
            className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-extrabold text-primary hover:bg-primary hover:text-white transition-all text-sm shadow-xs"
          >
            {displayName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-8">
        {/* Welcome Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-light-card border border-light-border rounded-3xl p-8 shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
              <Sparkles size={14} /> Welcome back, {displayName}
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-extrabold"
            >
              Learn {target.name} ({target.script})
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-muted mt-2 text-base"
            >
              Comprehensive 13-Unit Indic Curriculum & Spoken Roleplays via your mother tongue,{" "}
              <span className="font-semibold text-text-main">{native.name} ({native.script})</span>.
            </motion.p>
            <div className="flex gap-8 mt-6">
              <div>
                <div className="text-2xl font-black text-primary">{wordsLearned}</div>
                <div className="text-xs text-text-muted">Words Learned</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary">Level {level}</div>
                <div className="text-xs text-text-muted">Current Rank</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-600">
                  {completedLessons.length}/{lessons.length || 13}
                </div>
                <div className="text-xs text-text-muted">Units Cleared</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProgressRing radius={55} stroke={7} progress={dailyProgress} color="#E8A317" />
            <span className="text-xs text-text-muted font-semibold">
              Daily Goal: {Math.min(todayXP || 0, dailyGoal || 100)}/{dailyGoal || 100} XP
            </span>
          </div>
        </div>

        {/* Action Modules: AI Tutor + Sentence Practice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {/* AI Tutor Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              playClick();
              navigate("/chat");
            }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 flex items-center justify-between cursor-pointer shadow-md shadow-primary/20 hover:shadow-lg hover:scale-[1.01] transition-all group"
          >
            <div className="text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                Live Speech & Voice
              </span>
              <h3 className="text-2xl font-extrabold flex items-center gap-2">
                <Bot size={26} /> AI Indic Tutor
              </h3>
              <p className="text-white/80 mt-1 text-xs max-w-xs">
                Speak or chat in {native.name} & {target.name}. Instant pronunciation feedback!
              </p>
            </div>
            <div className="text-white bg-white/20 p-4 rounded-2xl group-hover:bg-white/30 transition-colors">
              <MessageCircle size={28} />
            </div>
          </motion.div>

          {/* Sentence Practice Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => {
              playClick();
              navigate("/practice");
            }}
            className="bg-gradient-to-br from-secondary to-[#A84A12] rounded-3xl p-6 flex items-center justify-between cursor-pointer shadow-md shadow-secondary/20 hover:shadow-lg hover:scale-[1.01] transition-all group"
          >
            <div className="text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-2">
                Interactive Drag & Drop
              </span>
              <h3 className="text-2xl font-extrabold flex items-center gap-2">
                <Puzzle size={26} /> Sentence Practice
              </h3>
              <p className="text-white/80 mt-1 text-xs max-w-xs">
                Build full sentences with correct regional grammar and audio guides.
              </p>
            </div>
            <div className="text-white bg-white/20 p-4 rounded-2xl group-hover:bg-white/30 transition-colors">
              <Sparkles size={28} />
            </div>
          </motion.div>
        </div>

        {/* Conversational Scenarios & Roleplays */}
        {dialogues.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  <MessageSquare className="text-primary w-6 h-6" /> Spoken Dialogue Simulator
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Multi-turn interactive roleplays with real-time pronunciation evaluation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dialogues.map((scen) => (
                <motion.div
                  key={scen.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playClick();
                    setSelectedDialogue(scen);
                  }}
                  className="bg-light-card border border-light-border rounded-3xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {scen.category}
                      </span>
                      <span className="text-xs font-bold text-amber-500">+{scen.xp} XP</span>
                    </div>
                    <h3 className="text-base font-bold text-text-main">{scen.title}</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{scen.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-light-border flex items-center justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" /> Start Spoken Roleplay
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson Path (13 Units) */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                {pathLabels.pathTitle}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {pathLabels.pathSubtitle}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/select")}>
              Change Language Pair
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lessons.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative bg-light-card border rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between ${
                  lesson.locked
                    ? "border-light-border opacity-50 cursor-not-allowed"
                    : lesson.completed
                    ? "border-emerald-400 bg-emerald-50/20 hover:shadow-md cursor-pointer"
                    : "border-primary/40 shadow-xs hover:shadow-md hover:border-primary cursor-pointer"
                }`}
                onClick={() => {
                  if (!lesson.locked && lesson.routeId) {
                    playClick();
                    navigate(`/lesson/${lesson.routeId}`);
                  }
                }}
              >
                {lesson.completed && (
                  <div className="absolute top-4 right-4 text-emerald-500">
                    <CheckCircle size={20} />
                  </div>
                )}
                {lesson.locked && (
                  <div className="absolute top-4 right-4 text-text-muted">
                    <Lock size={16} />
                  </div>
                )}

                <div>
                  <div className="text-[11px] font-bold text-primary mb-1">
                    {pathLabels.unitPrefix} {lesson.id}
                  </div>
                  <h3 className="text-base font-extrabold leading-snug">{lesson.title}</h3>
                  {lesson.englishTitle && lesson.englishTitle !== lesson.title && (
                    <p className="text-[10px] text-text-muted/80 font-medium mt-0.5">{lesson.englishTitle}</p>
                  )}
                  <p className="text-text-muted text-[11px] mt-1.5">
                    {lesson.words} {pathLabels.wordsSuffix}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-light-border/60">
                  {lesson.completed ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      {pathLabels.cleared} (+{lesson.xpEarned} XP)
                    </span>
                  ) : lesson.locked ? (
                    <span className="text-[11px] text-text-muted">{pathLabels.locked}</span>
                  ) : (
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      {pathLabels.start} <ArrowRight size={13} />
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
