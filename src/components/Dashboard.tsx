import { useState } from "react";
import { Flame, Award, BookOpen, Clock, Activity, Target, Zap, RotateCcw, Terminal, FileText, Eye, EyeOff } from "lucide-react";
import { UserProgress } from "../types";
import PomodoroTimer from "./PomodoroTimer";

interface DashboardProps {
  progress: UserProgress;
  onFocusComplete: (minutes: number) => void;
  onResetProgress: () => void;
  fileName?: string;
  fileContent?: string;
  timerMode: "focus" | "break";
  timeLeft: number;
  timerIsRunning: boolean;
  setTimerMode: (mode: "focus" | "break") => void;
  setTimeLeft: (time: number) => void;
  setTimerIsRunning: (running: boolean) => void;
  notificationIntervalType: "demo" | "standard";
  setNotificationIntervalType: (type: "demo" | "standard") => void;
  triggerDemoNotification: (type: "reminder" | "achievement") => void;
}

export default function Dashboard({
  progress,
  onFocusComplete,
  onResetProgress,
  fileName,
  fileContent,
  timerMode,
  timeLeft,
  timerIsRunning,
  setTimerMode,
  setTimeLeft,
  setTimerIsRunning,
  notificationIntervalType,
  setNotificationIntervalType,
  triggerDemoNotification
}: DashboardProps) {
  const [showDebug, setShowDebug] = useState<boolean>(false);
  // Calculate average score safely
  const averageScore = progress.quizHistory.length > 0
    ? Math.round(
        (progress.quizHistory.reduce((acc, q) => acc + (q.score / q.total), 0) /
          progress.quizHistory.length) *
          100
      )
    : 0;

  const totalFocusMin = Math.round(progress.totalFocusSeconds / 60);

  return (
    <div id="dashboard-viewport" className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto py-2 px-2">
      
      {/* Column 1 & 2: Level progress & Analytics */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Level Card */}
        <div className="bg-brand-indigo text-white rounded-3xl p-6 shadow-[0_4px_22px_rgba(90,75,255,0.25)] relative overflow-hidden">
          {/* Ambient background decoration */}
          <span className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <span className="absolute -top-10 -left-10 w-32 h-32 bg-white/15 rounded-full blur-xl" />

          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-xxs font-black uppercase bg-white/20 text-white/90 px-3 py-1 rounded-full tracking-wider">
                Student Profile Status
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-2 flex items-center gap-1.5 text-white">
                Level {progress.level} Scholar <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
              </h2>
            </div>
            
            <span className="text-3xl font-black font-mono tracking-tight text-white/90">
              {progress.xp} <span className="text-xs uppercase text-white/70 font-bold font-sans">XP</span>
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-xs font-semibold text-white/90">
              <span>{progress.xp} XP Earned</span>
              <span>Need {progress.xpToNextLevel} XP to Level UP</span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${Math.min((progress.xp / progress.xpToNextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bento Grid Analytics Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Stats 1: Streak */}
          <div className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-500/10 dark:bg-red-950/40 rounded-xl shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500" />
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black font-mono block text-black dark:text-white leading-tight">
                {progress.dailyStreak} {progress.dailyStreak === 1 ? "Day" : "Days"}
              </span>
              <span className="text-[10px] sm:text-xs text-ios-secondary-text block mt-0.5 sm:mt-0 font-bold sm:font-medium leading-tight">Daily Study Streak</span>
            </div>
          </div>

          {/* Stats 2: Focus Hours */}
          <div className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-brand-indigo/10 rounded-xl shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo" />
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black font-mono block text-black dark:text-white leading-tight">
                {totalFocusMin} Min
              </span>
              <span className="text-[10px] sm:text-xs text-ios-secondary-text block mt-0.5 sm:mt-0 font-bold sm:font-medium leading-tight font-sans">Focus Study Time</span>
            </div>
          </div>

          {/* Stats 3: Academic Mastery % */}
          <div className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-brand-indigo/10 rounded-xl shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo" />
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black font-mono block text-black dark:text-white leading-tight">
                {averageScore}%
              </span>
              <span className="text-[10px] sm:text-xs text-ios-secondary-text block mt-0.5 sm:mt-0 font-bold sm:font-medium leading-tight">Average Quiz Score</span>
            </div>
          </div>

          {/* Stats 4: Mastered Terms */}
          <div className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-brand-indigo/10 rounded-xl shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo" />
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black font-mono block text-black dark:text-white leading-tight">
                {progress.masteredTermsCount} Words
              </span>
              <span className="text-[10px] sm:text-xs text-ios-secondary-text block mt-0.5 sm:mt-0 font-bold sm:font-medium leading-tight">Flashcards Mastered</span>
            </div>
          </div>

        </div>

        {/* Quiz Grade History Logs */}
        <div className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4.5 h-4.5 text-brand-indigo" />
            <h3 className="font-extrabold text-base text-black dark:text-white">Academic Assessment History</h3>
          </div>

          {progress.quizHistory.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {progress.quizHistory.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3.5 bg-ios-light-bg dark:bg-ios-dark-bg rounded-xl border border-zinc-200/50 dark:border-zinc-900/50"
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-black dark:text-white line-clamp-1">
                      {log.fileName.replace(/\.[^/.]+$/, "")}
                    </h4>
                    <span className="text-xxs text-ios-secondary-text mt-0.5 inline-block capitalize font-medium">
                      Difficulty: <strong className="text-brand-indigo">{log.difficulty}</strong> • {log.date}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-black text-brand-indigo font-mono">
                      {log.score} / {log.total}
                    </span>
                    <span className="text-xxs block text-ios-secondary-text mt-0.5">
                      {((log.score / log.total) * 100).toFixed(0)}% Correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ios-secondary-text text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
              No quiz records available. Run an assessment to save statistics.
            </div>
          )}
        </div>

        {/* Document Parsing Debug Inspector panel */}
        <div id="document-parsing-debug-panel" className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-brand-indigo" />
              <h3 className="font-extrabold text-base text-black dark:text-white">Document Text Extraction Inspector</h3>
            </div>
            
            <button
              id="btn-toggle-debug-view"
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-brand-indigo/10 text-brand-indigo hover:opacity-85 self-start sm:self-auto shadow-sm"
            >
              {showDebug ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Hide Debug Panel
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Show Debug Info
                </>
              )}
            </button>
          </div>

          <p className="text-xxs text-ios-secondary-text leading-normal">
            Verify that the stand-alone file processors parsed genuine content from your document, displaying the metrics of characters and words below.
          </p>

          {showDebug && (
            <div className="space-y-4 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* File Metadata Stat 1 */}
                <div className="p-3 bg-ios-light-bg dark:bg-ios-dark-bg rounded-xl border border-zinc-200/50 dark:border-zinc-900/30">
                  <span className="text-xxs text-ios-secondary-text uppercase tracking-wider block font-bold">Active Loaded File</span>
                  <span className="text-xs font-extrabold text-black dark:text-white font-mono truncate block mt-0.5" title={fileName || "No document loaded"}>
                    {fileName || "No active document parsed"}
                  </span>
                </div>

                {/* File Metadata Stat 2 */}
                <div className="p-3 bg-ios-light-bg dark:bg-ios-dark-bg rounded-xl border border-zinc-200/50 dark:border-zinc-900/30">
                  <span className="text-xxs text-ios-secondary-text uppercase tracking-wider block font-bold">Extraction Metrics</span>
                  <span className="text-xs font-black text-brand-indigo mt-0.5 block font-mono">
                    {fileContent ? fileContent.length.toLocaleString() : 0} chars • {fileContent ? fileContent.trim().split(/\s+/).filter(Boolean).length.toLocaleString() : 0} words
                  </span>
                </div>
              </div>

              {/* Text Area scrollbox with content */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xxs font-bold text-ios-secondary-text uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3 h-3 text-ios-secondary-text" /> Extracted Ground-Truth Decoded Preview (First 2,000 Chars)
                  </label>
                  {fileContent && (
                    <span className="text-xxs font-mono text-brand-indigo font-bold bg-brand-indigo/10 px-1.5 py-0.5 rounded">
                      ✓ Ready for LLM Context
                    </span>
                  )}
                </div>
                
                {fileContent ? (
                  <div className="bg-black text-brand-indigo/85 p-4 rounded-2xl font-mono text-xxs whitespace-pre-wrap overflow-y-auto max-h-56 leading-relaxed border border-zinc-900/70 select-text">
                    {fileContent.slice(0, 2000)}
                    {fileContent.length > 2000 && (
                      <span className="text-ios-secondary-text block italic mt-2 border-t border-zinc-900/70 pt-2 font-sans font-medium">
                        ... [+ {fileContent.length - 2000} additional characters extracted from this subject outline]
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xxs text-ios-secondary-text border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl font-mono">
                    No text extracted yet. Please upload a PDF, DOCX, PPTX, or TXT document first.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear Stats Data option */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-reset-dashboard-data"
            onClick={() => {
              if (confirm("Are you sure you want to restore factory defaults? This clears your XP levels and log histories.")) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1 text-xxs font-bold text-ios-secondary-text hover:text-red-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Factory Reset Stats
          </button>
        </div>

      </div>

      {/* Column 3: Beautiful Built-in Pomodoro Space */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-black text-ios-secondary-text uppercase tracking-widest mb-4 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 animate-pulse text-brand-indigo" /> Built-in Pomodoro Space
          </h3>
          <PomodoroTimer
            mode={timerMode}
            timeLeft={timeLeft}
            isRunning={timerIsRunning}
            setMode={setTimerMode}
            setTimeLeft={setTimeLeft}
            setIsRunning={setTimerIsRunning}
          />
        </div>

        {/* Notification & Testing Desk */}
        <div className="bg-ios-light-secondary dark:bg-ios-dark-secondary border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800 pb-3">
            <h4 className="text-xs font-black text-black dark:text-white flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-indigo opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-indigo"></span>
              </span>
              Notification Hub
            </h4>
            <span className="text-[10px] bg-brand-indigo/10 text-brand-indigo font-bold px-2 py-0.5 rounded-full">
              Interactive
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xxs text-ios-secondary-text leading-normal">
              For testing in AI Studio & Render, toggle between the realistic <strong>5-minute tracker</strong> or a fast-paced <strong>30-second simulation</strong>.
            </p>

            <div className="flex items-center justify-between gap-2 p-1 bg-ios-light-bg dark:bg-ios-dark-bg rounded-xl">
              <button
                onClick={() => setNotificationIntervalType("standard")}
                className={`flex-1 text-center py-1.5 text-xxs font-extrabold rounded-lg transition-colors ${
                  notificationIntervalType === "standard"
                    ? "bg-ios-light-secondary dark:bg-brand-indigo text-black dark:text-white shadow-sm"
                    : "text-ios-secondary-text dark:text-ios-secondary-text hover:text-black"
                }`}
              >
                ⏱️ Standard (5m)
              </button>
              <button
                onClick={() => setNotificationIntervalType("demo")}
                className={`flex-1 text-center py-1.5 text-xxs font-extrabold rounded-lg transition-colors ${
                  notificationIntervalType === "demo"
                    ? "bg-ios-light-secondary dark:bg-brand-indigo text-brand-indigo dark:text-white shadow-sm"
                    : "text-ios-secondary-text dark:text-ios-secondary-text hover:text-black"
                }`}
              >
                ⚡ Demo Mode (30s)
              </button>
            </div>

            {/* Simulated actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => triggerDemoNotification("reminder")}
                className="text-center py-2 bg-ios-light-bg hover:bg-zinc-100 dark:bg-ios-dark-bg dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-ios-secondary-text text-xxs font-bold rounded-xl transition-colors active:scale-95"
              >
                🔔 Test Reminder
              </button>
              <button
                onClick={() => triggerDemoNotification("achievement")}
                className="text-center py-2 bg-brand-indigo/10 hover:bg-brand-indigo/15 border border-brand-indigo/20 text-brand-indigo text-xxs font-black rounded-xl transition-all active:scale-95"
              >
                🏆 Test Achievement
              </button>
            </div>
          </div>
        </div>

        {/* Quick motivational cards */}
        <div className="bg-brand-indigo/10 border border-brand-indigo/20 rounded-2xl p-4.5 flex gap-3 text-brand-indigo">
          <Target className="w-5 h-5 shrink-0 text-brand-indigo mt-0.5" />
          <div>
            <h4 className="text-xs font-black">Ready to ace a Hard quiz?</h4>
            <p className="text-xxs text-brand-indigo/80 mt-1 leading-normal font-sans">
              Studying with Pomodoro focus rounds unlocks deeper recall. Earn +150 XP on every successful focus round and trigger levels!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
