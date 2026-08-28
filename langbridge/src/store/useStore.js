import { create } from "zustand";
import { persist } from "zustand/middleware";

async function syncToCloud(state) {
  try {
    const userEmail = state.user?.email || "guest@talkverse.com";
    await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        xp: state.xp,
        streak: state.streak,
        level: state.level,
        wordsLearned: state.wordsLearned,
        completedLessons: state.completedLessons,
        nativeLang: state.nativeLang,
        targetLang: state.targetLang,
        hasSelectedLanguages: state.hasSelectedLanguages,
      }),
    });
  } catch {
    // Offline resilience
  }
}

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      nativeLang: "ta",
      targetLang: "kn",
      xp: 0,
      streak: 1,
      level: 1,
      wordsLearned: 0,
      todayXP: 0,
      dailyGoal: 100,
      completedLessons: [],
      hasSelectedLanguages: false,
      isSynced: true,

      setUser: (user, initialProgress) => {
        set({ user });
        if (initialProgress) {
          get().hydrateProgress(initialProgress);
        } else if (user?.email) {
          get().loadCloudProgress(user.email);
        } else {
          syncToCloud(get());
        }
      },
      setToken: (token) => set({ token }),
      hydrateProgress: (progress) => {
        if (!progress) return;
        set((state) => ({
          xp: Number(progress.xp) || 0,
          streak: Number(progress.streak) || 1,
          level: Number(progress.level) || 1,
          wordsLearned: Number(progress.wordsLearned) || 0,
          todayXP: Number(progress.todayXP) || 0,
          completedLessons: Array.isArray(progress.completedLessons)
            ? progress.completedLessons
            : [],
          nativeLang: progress.nativeLang || state.nativeLang || "ta",
          targetLang: progress.targetLang || state.targetLang || "kn",
          hasSelectedLanguages: Boolean(
            progress.hasSelectedLanguages ||
              (Number(progress.xp) || 0) > 0 ||
              (progress.completedLessons && progress.completedLessons.length > 0)
          ),
          isSynced: true,
        }));
      },
      logout: () =>
        set({
          user: null,
          token: null,
          xp: 0,
          streak: 1,
          level: 1,
          wordsLearned: 0,
          todayXP: 0,
          completedLessons: [],
          hasSelectedLanguages: false,
        }),

      setNativeLang: (lang) => {
        set({ nativeLang: lang });
        syncToCloud(get());
      },
      setTargetLang: (lang) => {
        set({ targetLang: lang });
        syncToCloud(get());
      },
      setHasSelectedLanguages: (val = true) => {
        set({ hasSelectedLanguages: val });
        syncToCloud(get());
      },

      addXP: (points) =>
        set((state) => {
          const newXP = state.xp + points;
          const newTodayXP = state.todayXP + points;
          const newLevel = Math.floor(newXP / 100) + 1;
          const updated = { xp: newXP, todayXP: newTodayXP, level: newLevel, isSynced: true };
          syncToCloud({ ...state, ...updated });
          return updated;
        }),

      completeLesson: (lessonId, xpReward = 50) =>
        set((state) => {
          const completed = state.completedLessons.includes(lessonId)
            ? state.completedLessons
            : [...state.completedLessons, lessonId];
          const newXP = state.xp + xpReward;
          const newTodayXP = state.todayXP + xpReward;
          const newLevel = Math.floor(newXP / 100) + 1;
          const newWords = state.wordsLearned + 5;
          const updated = {
            completedLessons: completed,
            xp: newXP,
            todayXP: newTodayXP,
            level: newLevel,
            wordsLearned: newWords,
            hasSelectedLanguages: true,
            isSynced: true,
          };
          syncToCloud({ ...state, ...updated });
          return updated;
        }),

      loadCloudProgress: async (emailParam) => {
        const state = get();
        try {
          const email = emailParam || state.user?.email || "guest@talkverse.com";
          const res = await fetch(`/api/user/progress?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.progress) {
              get().hydrateProgress(data.progress);
            }
          }
        } catch {
          // offline
        }
      },
    }),
    { name: "TalkVerse-storage" }
  )
);

export default useStore;