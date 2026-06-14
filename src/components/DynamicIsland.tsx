import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Coffee, Target, Award, Sparkles, Flame, CheckCircle, Bell, X, Settings, ArrowLeft } from "lucide-react";
import { NotificationInfo } from "../App";
import { AppMode, UserProgress } from "../types";

interface DynamicIslandProps {
  timerIsRunning: boolean;
  timeLeft: number;
  timerMode: "focus" | "break";
  setTimerIsRunning: (running: boolean) => void;
  setTimeLeft: (time: number) => void;
  setTimerMode: (mode: "focus" | "break") => void;
  notifications: NotificationInfo[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationInfo[]>>;
  activeMode: AppMode;
  progress: UserProgress;
  setActiveMode: (mode: AppMode) => void;
}

export default function DynamicIsland({
  timerIsRunning,
  timeLeft,
  timerMode,
  setTimerIsRunning,
  setTimeLeft,
  setTimerMode,
  notifications,
  setNotifications,
  activeMode,
  progress,
  setActiveMode
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [internalHover, setInternalHover] = useState<boolean>(false);
  const [isConfiguringPosition, setIsConfiguringPosition] = useState<boolean>(false);
  
  // Load preferred docking position from cache or default to classic top-center
  const [preferredPosition, setPreferredPosition] = useState<
    "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right"
  >(() => {
    return (localStorage.getItem("ai_study_companion_island_position") as any) || "top-center";
  });

  const activeNotification = notifications.length > 0 ? notifications[0] : null;

  // Track the countdown formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Close the expanded controller when timer stops or notifications come
  useEffect(() => {
    if (activeNotification) {
      setIsExpanded(false);
      setIsConfiguringPosition(false);
    }
  }, [activeNotification]);

  const changePosition = (pos: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right") => {
    setPreferredPosition(pos);
    localStorage.setItem("ai_study_companion_island_position", pos);
  };

  const handleDismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimerIsRunning(!timerIsRunning);
  };

  const handleResetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimerIsRunning(false);
    setTimeLeft(timerMode === "focus" ? 25 * 60 : 5 * 60);
  };

  const handleModeNavigate = () => {
    setActiveMode("dashboard");
    setIsExpanded(false);
  };

  // Define width configurations for different states to let framer-motion morph fluidly
  // We use inline Framer Motion widths for premium hardware-like smooth physics animations
  const renderIslandContent = () => {
    // ------------------ Notification State ------------------
    if (activeNotification) {
      const isAchievement = activeNotification.type === "achievement";
      const isLevelUp = activeNotification.type === "levelUp";

      return (
        <motion.div
          key="notification"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full h-full flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3 text-left">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg select-none shrink-0 ${
              isAchievement
                ? "bg-amber-500/10 text-amber-400"
                : isLevelUp
                ? "bg-brand-indigo/20 text-brand-indigo"
                : "bg-zinc-800 text-zinc-300"
            }`}>
              {isAchievement ? "🏆" : isLevelUp ? "👑" : "⏱️"}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 justify-between">
                {activeNotification.badge && (
                  <span className={`text-[9px] font-black uppercase tracking-widest block font-sans ${
                    isAchievement ? "text-amber-500" : isLevelUp ? "text-brand-indigo" : "text-zinc-405"
                  }`}>
                    {activeNotification.badge}
                  </span>
                )}
                {notifications.length > 1 && (
                  <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-extrabold select-none">
                    +{notifications.length - 1} more
                  </span>
                )}
              </div>
              <h4 className="text-xs font-extrabold text-zinc-50 leading-tight truncate mt-0.5">
                {activeNotification.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-normal mt-1 block">
                {activeNotification.description}
              </p>
            </div>

            <button
              onClick={(e) => handleDismissNotification(activeNotification.id, e)}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-all select-none shrink-0"
              title="Dismiss Alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {isAchievement && (
            <div className="mt-2 text-[10px] text-zinc-400 font-extrabold flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
              <span className="flex items-center gap-1 text-amber-500">
                <Sparkles className="w-3 h-3 fill-amber-500" />
                Durable Achievement Unlocked!
              </span>
              <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[9px]">
                +{activeNotification.xpReward || 100} XP
              </span>
            </div>
          )}
        </motion.div>
      );
    }

    // ------------------ Expanded Controller State ------------------
    if (isExpanded) {
      if (isConfiguringPosition) {
        return (
          <motion.div
            key="timer-expanded-settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col justify-between h-full text-left font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfiguringPosition(false);
                }}
                className="text-[10px] uppercase font-bold tracking-wider text-brand-indigo flex items-center gap-1 hover:text-brand-indigo/80 transition-colors cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Dock Placement
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 mb-2 leading-relaxed">
              Select your preferred screen dock to float this companion widget:
            </p>

            {/* Grid preset locations */}
            <div className="grid grid-cols-3 gap-1 px-1 py-1 bg-zinc-900/60 rounded-xl border border-zinc-800">
              {[
                { id: "top-left", icon: "↖", label: "Top Left" },
                { id: "top-center", icon: "⬆", label: "Top Center" },
                { id: "top-right", icon: "↗", label: "Top Right" },
                { id: "bottom-left", icon: "↙", label: "Bot Left" },
                { id: "bottom-center", icon: "⬇", label: "Bot Center" },
                { id: "bottom-right", icon: "↘", label: "Bot Right" },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    changePosition(pos.id as any);
                  }}
                  className={`py-1 rounded-md text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    preferredPosition === pos.id
                      ? "bg-brand-indigo text-white shadow-md ring-1 ring-white/10"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-[13px] leading-none mb-0.5">{pos.icon}</span>
                  <span className="text-[8px] tracking-tight">{pos.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-1.5 text-[8px] text-zinc-500 font-medium text-center">
              State saves automatically in your local dashboard cache.
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div
          key="timer-expanded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex flex-col justify-between h-full text-left"
        >
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              {timerMode === "focus" ? (
                <>
                  <Target className="w-3 h-3 text-red-400" /> Focus Round Control
                </>
              ) : (
                <>
                  <Coffee className="w-3 h-3 text-emerald-400" /> Break Interval
                </>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfiguringPosition(true);
                }}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Customize Position"
              >
                <Settings className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-0.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Time digits & Mini visualizer */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div>
              <span className="text-2xl font-black font-mono tracking-tight text-white block leading-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 block uppercase font-bold tracking-tight">
                {timerIsRunning ? "Active Study Run Logged" : "Dormant / Interrupted"}
              </span>
            </div>

            {/* Quick interactive shortcuts */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetTimer}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all text-xs cursor-pointer"
                title="Reset Countdown"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleToggleTimer}
                className={`p-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1 text-white shadow-md transition-all cursor-pointer ${
                  timerIsRunning ? "bg-zinc-750 hover:bg-zinc-700" : "bg-brand-indigo hover:opacity-90"
                }`}
              >
                {timerIsRunning ? (
                  <>
                    <Pause className="w-3 h-3 fill-white" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-white" /> Resume
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic mode navigation line */}
          <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[10px]">
            <span className="text-zinc-500 font-medium">Session Focus Interval (25 Mins)</span>
            <button
              onClick={handleModeNavigate}
              className="font-bold text-brand-indigo hover:underline select-none cursor-pointer bg-transparent border-none"
            >
              Control Desk →
            </button>
          </div>
        </motion.div>
      );
    }

    // ------------------ Compact Active Timer State ------------------
    if (timerIsRunning) {
      return (
        <motion.div
          key="timer-compact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-1.5">
            {timerMode === "focus" ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            ) : (
              <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest hidden sm:inline select-none">
              {timerMode === "focus" ? "Focus" : "Break"}
            </span>
          </div>

          <span className="font-mono text-xs font-black text-white shrink-0">
            {formatTime(timeLeft)}
          </span>
        </motion.div>
      );
    }

    // ------------------ Idle State (✨ AI Companion branding or Study Mode) ------------------
    return (
      <motion.div
        key="idle-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-between px-1 text-zinc-400 text-[10px] font-black uppercase tracking-wider select-none"
      >
        <span className="flex items-center gap-1 text-brand-indigo">
          <Sparkles className="w-3.5 h-3.5 fill-brand-indigo animate-pulse" />
          {progress.dailyStreak > 0 ? `${progress.dailyStreak}D Streak` : "Companion Desk"}
        </span>
        <span className="text-zinc-500 font-mono text-[9px] tracking-widest">
          LVL {progress.level}
        </span>
      </motion.div>
    );
  };

  // Compute size dynamically for the Dynamic Island container
  // This delivers the hardware morphing feel of iPhones' Dynamic Island
  let widthClasses = "w-[124px] h-[28px]"; // Idle default
  if (activeNotification) {
    widthClasses = "w-[340px] sm:w-[380px] h-auto min-h-[96px] p-3.5 sm:p-4";
  } else if (isExpanded) {
    const height = isConfiguringPosition ? "h-[194px]" : "h-[134px]";
    widthClasses = `w-[310px] sm:w-[335px] ${height} p-3.5`;
  } else if (timerIsRunning) {
    widthClasses = "w-[145px] h-[32px] px-3";
  } else if (internalHover) {
    widthClasses = "w-[155px] h-[30px] px-2.5 cursor-pointer";
  }

  const POSITION_CLASSES = {
    "top-center": "top-3 left-1/2 -translate-x-1/2",
    "top-left": "top-3 left-3 sm:left-6",
    "top-right": "top-3 right-3 sm:right-6",
    "bottom-center": "bottom-3 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-3 left-3 sm:left-6",
    "bottom-right": "bottom-3 right-3 sm:right-6"
  };

  const currentPosClass = POSITION_CLASSES[preferredPosition] || POSITION_CLASSES["top-center"];

  return (
    <div
      id="dynamic-island-anchor"
      className={`fixed ${currentPosClass} z-[100] flex flex-col items-center pointer-events-none select-none transition-all duration-300`}
    >
      <motion.div
        layoutId="dynamic-island-capsule"
        onMouseEnter={() => setInternalHover(true)}
        onMouseLeave={() => setInternalHover(false)}
        onClick={() => {
          if (!activeNotification) {
            setIsExpanded(!isExpanded);
          }
        }}
        className={`bg-zinc-950/95 dark:bg-black text-white rounded-3xl shadow-xl shadow-black/35 ring-1 ring-white/10 flex items-center justify-center transition-all duration-300 pointer-events-auto overflow-hidden relative ${widthClasses}`}
        layout // Framer Motion layout morph physics
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 28,
          mass: 0.8
        }}
      >
        <AnimatePresence mode="wait">
          {renderIslandContent()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
