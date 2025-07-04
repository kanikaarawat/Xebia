"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, BookOpen, History } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GuidedBreathingProps {
    duration?: number
}

type BreathingPhase = "inhale" | "hold" | "exhale"
type DifficultyLevel = "beginner" | "intermediate" | "advanced"

interface PhaseConfig {
    name: string
    duration: number
    color: string
    bgColor: string
    scale: number
    instruction: string
}

interface BreathingPattern {
    id: string
    name: string
    description: string
    inhale: number
    hold: number
    exhale: number
    difficulty: DifficultyLevel
    benefits: string[]
    instructions: string[]
}

interface SessionHistory {
    date: string
    pattern: string
    duration: number
    cyclesCompleted: number
}

const BREATHING_PATTERNS: BreathingPattern[] = [
    {
        id: "relaxing",
        name: "Relaxing Breath",
        description: "Perfect for stress relief and daily calm",
        inhale: 4,
        hold: 4,
        exhale: 6,
        difficulty: "beginner",
        benefits: ["Reduces stress", "Promotes relaxation", "Improves focus"],
        instructions: [
            "Sit comfortably with your back straight",
            "Place one hand on chest, one on belly",
            "Breathe slowly and deeply through your nose",
            "Feel your belly rise more than your chest",
        ],
    },
    {
        id: "box",
        name: "Box Breathing",
        description: "Navy SEAL technique for focus and control",
        inhale: 4,
        hold: 4,
        exhale: 4,
        difficulty: "beginner",
        benefits: ["Enhances focus", "Reduces anxiety", "Improves performance"],
        instructions: [
            "Visualize drawing a box as you breathe",
            "Each side of the box represents one phase",
            "Keep the rhythm steady and controlled",
            "Used by military and first responders",
        ],
    },
    {
        id: "sleep",
        name: "4-7-8 Sleep Breath",
        description: "Dr. Weil's technique for better sleep",
        inhale: 4,
        hold: 7,
        exhale: 8,
        difficulty: "intermediate",
        benefits: ["Promotes sleep", "Calms nervous system", "Reduces anxiety"],
        instructions: [
            "Place tongue tip behind upper front teeth",
            "Exhale completely through mouth making whoosh sound",
            "Close mouth, inhale through nose for 4 counts",
            "Practice before bedtime for best results",
        ],
    },
    {
        id: "wim-hof",
        name: "Wim Hof Method",
        description: "Powerful breathing for energy and immunity",
        inhale: 3,
        hold: 0,
        exhale: 2,
        difficulty: "advanced",
        benefits: ["Boosts energy", "Strengthens immunity", "Increases focus"],
        instructions: [
            "Take 30-40 deep breaths rapidly",
            "Breathe in fully, breathe out naturally",
            "After last exhale, hold breath as long as comfortable",
            "Take recovery breath and hold for 15 seconds",
        ],
    },
    {
        id: "coherent",
        name: "Coherent Breathing",
        description: "Heart Rate Variability optimization",
        inhale: 5,
        hold: 0,
        exhale: 5,
        difficulty: "beginner",
        benefits: ["Balances nervous system", "Improves HRV", "Enhances well-being"],
        instructions: [
            "Breathe at exactly 6 breaths per minute",
            "Equal inhale and exhale timing",
            "Focus on smooth, continuous breathing",
            "Practice for 10-20 minutes daily",
        ],
    },
    {
        id: "energizing",
        name: "Energizing Breath",
        description: "Quick energy boost technique",
        inhale: 2,
        hold: 2,
        exhale: 2,
        difficulty: "intermediate",
        benefits: ["Increases alertness", "Boosts energy", "Improves circulation"],
        instructions: [
            "Sit up straight with good posture",
            "Breathe rapidly but controlled",
            "Keep the rhythm consistent",
            "Practice for 1-2 minutes maximum",
        ],
    },
]

const DIFFICULTY_COLORS = {
    beginner: "bg-green-100 text-green-800 border-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    advanced: "bg-red-100 text-red-800 border-red-200",
}

export default function GuidedBreathing({ duration = 60 }: GuidedBreathingProps) {
    const [showSettings, setShowSettings] = useState(false)
    const [showPatterns, setShowPatterns] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0])
    const [customDuration, setCustomDuration] = useState(duration)
    const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([])

    const [isActive, setIsActive] = useState(false)
    const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("inhale")
    const [phaseTimeLeft, setPhaseTimeLeft] = useState(selectedPattern.inhale)
    const [totalTimeLeft, setTotalTimeLeft] = useState(duration)
    const [cycleCount, setCycleCount] = useState(0)

    const audioContextRef = useRef<AudioContext | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load saved preferences and history
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedPattern = localStorage.getItem("breathingPattern")
            const savedDuration = localStorage.getItem("breathingDuration")
            const savedHistory = localStorage.getItem("breathingHistory")

            if (savedPattern) {
                const pattern = BREATHING_PATTERNS.find((p) => p.id === savedPattern)
                if (pattern) {
                    setSelectedPattern(pattern)
                    setPhaseTimeLeft(pattern.inhale)
                }
            }

            if (savedDuration) {
                const duration = Number.parseInt(savedDuration)
                setCustomDuration(duration)
                setTotalTimeLeft(duration)
            }

            if (savedHistory) {
                setSessionHistory(JSON.parse(savedHistory))
            }
        }
    }, [])

    // Save preferences
    const savePreferences = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("breathingPattern", selectedPattern.id)
            localStorage.setItem("breathingDuration", customDuration.toString())
        }
    }

    // Save session to history
    const saveSession = (completed: boolean) => {
        if (!completed) return

        const session: SessionHistory = {
            date: new Date().toISOString(),
            pattern: selectedPattern.name,
            duration: customDuration,
            cyclesCompleted: cycleCount,
        }

        const newHistory = [session, ...sessionHistory.slice(0, 49)] // Keep last 50 sessions
        setSessionHistory(newHistory)

        if (typeof window !== "undefined") {
            localStorage.setItem("breathingHistory", JSON.stringify(newHistory))
        }
    }

    const PHASE_CONFIGS: Record<BreathingPhase, PhaseConfig> = {
        inhale: {
            name: "Inhale",
            duration: selectedPattern.inhale,
            color: "text-emerald-600",
            bgColor: "bg-gradient-to-br from-emerald-400 to-teal-500",
            scale: 1.5,
            instruction: "Breathe in slowly through your nose",
        },
        hold: {
            name: "Hold",
            duration: selectedPattern.hold,
            color: "text-violet-600",
            bgColor: "bg-gradient-to-br from-violet-400 to-purple-500",
            scale: 1.5,
            instruction: "Hold your breath gently",
        },
        exhale: {
            name: "Exhale",
            duration: selectedPattern.exhale,
            color: "text-pink-600",
            bgColor: "bg-gradient-to-br from-pink-400 to-rose-500",
            scale: 1,
            instruction: "Breathe out slowly through your mouth",
        },
    }

    // Initialize audio context
    useEffect(() => {
        if (typeof window !== "undefined") {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    // Play breathing cue sound
    const playBreathingCue = (frequency: number, duration: number) => {
        if (!audioContextRef.current) return

        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration)

        oscillator.start(audioContextRef.current.currentTime)
        oscillator.stop(audioContextRef.current.currentTime + duration)
    }

    // Get next phase in cycle
    const getNextPhase = (phase: BreathingPhase): BreathingPhase => {
        if (selectedPattern.hold === 0) {
            return phase === "inhale" ? "exhale" : "inhale"
        }
        switch (phase) {
            case "inhale":
                return "hold"
            case "hold":
                return "exhale"
            case "exhale":
                return "inhale"
        }
    }

    const selectPattern = (pattern: BreathingPattern) => {
        if (isActive) return
        setSelectedPattern(pattern)
        setCurrentPhase("inhale")
        setPhaseTimeLeft(pattern.inhale)
        savePreferences()
    }

    const updateSessionDuration = (newDuration: number) => {
        setCustomDuration(newDuration)
        if (!isActive) {
            setTotalTimeLeft(newDuration)
        }
        savePreferences()
    }

    // Main breathing timer
    useEffect(() => {
        if (!isActive) return

        intervalRef.current = setInterval(() => {
            setPhaseTimeLeft((prev) => {
                if (prev <= 1) {
                    setCurrentPhase((currentPhase) => {
                        const nextPhase = getNextPhase(currentPhase)

                        if (nextPhase === "inhale") {
                            playBreathingCue(220, 0.3)
                            setCycleCount((prev) => prev + 1)
                        } else if (nextPhase === "hold") {
                            playBreathingCue(330, 0.2)
                        } else if (nextPhase === "exhale") {
                            playBreathingCue(165, 0.4)
                        }

                        return nextPhase
                    })

                    return PHASE_CONFIGS[getNextPhase(currentPhase)].duration
                }
                return prev - 1
            })

            setTotalTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false)
                    playBreathingCue(440, 1)
                    saveSession(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isActive, currentPhase, selectedPattern])

    const startSession = () => {
        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume()
        }
        setIsActive(true)
        playBreathingCue(440, 0.5)
    }

    const pauseSession = () => {
        setIsActive(false)
    }

    const resetSession = () => {
        setIsActive(false)
        setCurrentPhase("inhale")
        setPhaseTimeLeft(selectedPattern.inhale)
        setTotalTimeLeft(customDuration)
        setCycleCount(0)
    }

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const currentConfig = PHASE_CONFIGS[currentPhase]
    const progress =
        currentConfig.duration > 0 ? ((currentConfig.duration - phaseTimeLeft) / currentConfig.duration) * 100 : 0

    const totalSessions = sessionHistory.length
    const totalMinutes = Math.round(sessionHistory.reduce((sum, session) => sum + session.duration, 0) / 60)
    const streak = sessionHistory.filter((session, index) => {
        const sessionDate = new Date(session.date).toDateString()
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        return sessionDate === today || (index === 0 && sessionDate === yesterday)
    }).length

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div
    className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-30 animate-bounce"
    style={{ animationDelay: "1s" }}
></div>
    <div
    className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-25 animate-pulse"
    style={{ animationDelay: "2s" }}
></div>
    <div
    className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 animate-bounce"
    style={{ animationDelay: "0.5s" }}
></div>
    </div>

    <div className="w-full max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
    <div className="mb-4">
    <span className="text-4xl">🌸</span>
    <span className="text-4xl ml-2">✨</span>
    <span className="text-4xl ml-2">🌸</span>
    </div>
    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
        Guided Breathing
    </h1>
    <p className="text-slate-700 text-lg">Find your calm with mindful breathing ✨</p>
    </div>

    {/* Navigation Buttons */}
    <div className="flex gap-2 mb-6">
    <Button
        onClick={() => {
        setShowPatterns(!showPatterns)
        setShowSettings(false)
        setShowHistory(false)
    }}
    variant="ghost"
    className="flex-1 bg-white/60 backdrop-blur-sm border border-white/50 text-purple-700 hover:bg-purple-50 shadow-md hover:shadow-xl transition-all duration-300"
    >
    <BookOpen className="w-4 h-4 mr-2" />
        Patterns
        </Button>
        <Button
    onClick={() => {
        setShowSettings(!showSettings)
        setShowPatterns(false)
        setShowHistory(false)
    }}
    variant="ghost"
    className="flex-1 bg-white/60 backdrop-blur-sm border border-white/50 text-purple-700 hover:bg-purple-50 shadow-md hover:shadow-xl transition-all duration-300"
    >
    <span className="mr-2">⚙️</span>
    Settings
    </Button>
    <Button
    onClick={() => {
        setShowHistory(!showHistory)
        setShowPatterns(false)
        setShowSettings(false)
    }}
    variant="ghost"
    className="flex-1 bg-white/60 backdrop-blur-sm border border-white/50 text-purple-700 hover:bg-purple-50 shadow-md hover:shadow-xl transition-all duration-300"
    >
    <History className="w-4 h-4 mr-2" />
        History
        </Button>
        </div>

    {/* Current Pattern Display */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-xl mb-6 border border-white/50">
    <div className="flex items-center justify-between">
    <div>
        <h3 className="font-semibold text-slate-800">{selectedPattern.name}</h3>
        <p className="text-sm text-slate-600">{selectedPattern.description}</p>
        </div>
        <span
    className={`px-2 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[selectedPattern.difficulty]}`}
>
    {selectedPattern.difficulty}
    </span>
    </div>
    </div>

    {/* Breathing Patterns Library */}
    {showPatterns && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 max-h-96 overflow-y-auto"
        >
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
            Breathing Pattern Library
    </h3>
    <div className="space-y-4">
        {BREATHING_PATTERNS.map((pattern) => (
                <div
                    key={pattern.id}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                selectedPattern.id === pattern.id
                    ? "border-purple-300 bg-purple-50"
                    : "border-slate-200 bg-white/50 hover:border-purple-200 hover:bg-purple-25"
            }`}
        onClick={() => selectPattern(pattern)}
    >
        <div className="flex items-start justify-between mb-2">
        <div>
            <h4 className="font-semibold text-slate-800">{pattern.name}</h4>
            <p className="text-sm text-slate-600">{pattern.description}</p>
        </div>
        <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[pattern.difficulty]}`}
    >
        {pattern.difficulty}
        </span>
        </div>
        <div className="flex items-center gap-4 mb-2">
    <span className="text-sm font-medium text-emerald-600">Inhale: {pattern.inhale}s</span>
        {pattern.hold > 0 && (
            <span className="text-sm font-medium text-violet-600">Hold: {pattern.hold}s</span>
        )}
        <span className="text-sm font-medium text-pink-600">Exhale: {pattern.exhale}s</span>
    </div>
    <div className="mb-2">
    <p className="text-xs text-slate-500 mb-1">Benefits:</p>
    <div className="flex flex-wrap gap-1">
        {pattern.benefits.map((benefit, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {benefit}
            </span>
    ))}
        </div>
        </div>
        <div>
        <p className="text-xs text-slate-500 mb-1">Instructions:</p>
    <ul className="text-xs text-slate-600 space-y-1">
        {pattern.instructions.slice(0, 2).map((instruction, index) => (
                <li key={index} className="flex items-start gap-1">
            <span className="text-purple-400 mt-1">•</span>
        {instruction}
        </li>
    ))}
        </ul>
        </div>
        </div>
    ))}
        </div>
        </motion.div>
    )}

    {/* Settings Panel */}
    {showSettings && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50"
        >
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span>⚙️</span> Session Settings
    </h3>

        {/* Session Duration */}
        <div className="mb-4">
        <h4 className="text-md font-medium text-slate-700 mb-3">Session Duration</h4>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[60, 180, 300, 600].map((seconds) => (
        <Button
            key={seconds}
        onClick={() => updateSessionDuration(seconds)}
        variant={customDuration === seconds ? "default" : "outline"}
        size="sm"
        className={`${
            customDuration === seconds
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/60 border-purple-200 text-purple-700 hover:bg-purple-50"
        }`}
    >
        {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
        </Button>
    ))}
        </div>
        <div className="flex items-center gap-2">
    <label className="text-sm font-medium text-slate-600">Custom:</label>
    <input
        type="number"
        min="30"
        max="1800"
        value={customDuration}
        onChange={(e) => updateSessionDuration(Number.parseInt(e.target.value) || 60)}
        className="w-20 px-2 py-1 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        disabled={isActive}
        />
        <span className="text-sm text-slate-600">seconds</span>
        </div>
        </div>

        {/* Pattern Instructions */}
        <div>
            <h4 className="text-md font-medium text-slate-700 mb-2">Current Pattern Guide</h4>
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
    <ul className="text-sm text-slate-700 space-y-2">
        {selectedPattern.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">{index + 1}.</span>
        {instruction}
        </li>
    ))}
        </ul>
        </div>
        </div>
        </motion.div>
    )}

    {/* History Panel */}
    {showHistory && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 max-h-96 overflow-y-auto"
        >
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <History className="w-5 h-5" />
            Session History
    </h3>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
        <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
            <div className="text-xs text-slate-600">Total Sessions</div>
    </div>
    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
    <div className="text-2xl font-bold text-green-600">{totalMinutes}</div>
        <div className="text-xs text-slate-600">Minutes Practiced</div>
    </div>
    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl">
    <div className="text-2xl font-bold text-orange-600">{streak}</div>
        <div className="text-xs text-slate-600">Day Streak</div>
    </div>
    </div>

        {/* Recent Sessions */}
        <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-600 mb-2">Recent Sessions</h4>
        {sessionHistory.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No sessions yet. Start your first session!</p>
        ) : (
            sessionHistory.slice(0, 10).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
        <div>
            <div className="text-sm font-medium text-slate-700">{session.pattern}</div>
            <div className="text-xs text-slate-500">{formatDate(session.date)}</div>
        </div>
        <div className="text-right">
        <div className="text-sm font-medium text-slate-700">{Math.round(session.duration / 60)}m</div>
        <div className="text-xs text-slate-500">{session.cyclesCompleted} cycles</div>
        </div>
        </div>
        ))
        )}
        </div>
        </motion.div>
    )}

    {/* Main breathing circle */}
    <div className="relative flex items-center justify-center mb-8">
    <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 opacity-50 blur-xl animate-pulse"></div>

    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-purple-300 to-pink-300 shadow-lg"></div>

    {/* Progress ring */}
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
    <circle
        cx="50"
    cy="50"
    r="48"
    fill="none"
    stroke="url(#progressGradient)"
    strokeWidth="3"
    strokeDasharray={`${progress * 3.02} 302`}
    className="transition-all duration-1000 drop-shadow-lg"
    strokeLinecap="round"
    />
    <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="#8B5CF6" />
    <stop offset="50%" stopColor="#EC4899" />
    <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        </defs>
        </svg>

    {/* Animated breathing circle */}
    <motion.div
        className={`relative rounded-full ${currentConfig.bgColor} shadow-2xl flex flex-col items-center justify-center text-white border-4 border-white/30`}
    animate={{
        scale: currentConfig.scale,
            opacity: isActive ? 1 : 0.8,
            boxShadow: isActive
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 50px rgba(139, 92, 246, 0.3)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    }}
    transition={{
        duration: currentConfig.duration,
            ease: currentPhase === "inhale" ? "easeIn" : currentPhase === "exhale" ? "easeOut" : "linear",
    }}
    style={{
        width: "200px",
            height: "200px",
    }}
>
    {/* Inner sparkle effect */}
    <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>

        <div className="text-center relative z-10">
    <div className="text-2xl font-bold mb-2 drop-shadow-sm">{currentConfig.name}</div>
        <div className="text-6xl font-light mb-2 drop-shadow-sm">{phaseTimeLeft}</div>
        <div className="text-sm opacity-90 px-4 leading-tight drop-shadow-sm">{currentConfig.instruction}</div>
        </div>
        </motion.div>
        </div>
        </div>

    {/* Session info */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6 border border-white/50">
    <div className="grid grid-cols-2 gap-4 text-center">
    <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl opacity-50"></div>
        <div className="relative p-4">
    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {formatTime(totalTimeLeft)}
        </div>
        <div className="text-sm text-slate-600 font-medium">Time Remaining ⏰</div>
    </div>
    </div>
    <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-orange-100 rounded-2xl opacity-50"></div>
        <div className="relative p-4">
    <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
        {cycleCount}
        </div>
        <div className="text-sm text-slate-600 font-medium">Cycles Completed 🌟</div>
    </div>
    </div>
    </div>
    </div>

    {/* Controls */}
    <div className="flex justify-center gap-4 mb-6">
    <Button
        onClick={isActive ? pauseSession : startSession}
    size="lg"
    className="flex items-center gap-2 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
        >
        {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
    {isActive ? "Pause" : "Start"}
    </Button>

    <Button
    onClick={resetSession}
    variant="outline"
    size="lg"
    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300"
    >
    <RotateCcw className="w-5 h-5" />
        Reset
        </Button>
        </div>

    {/* Instructions */}
    <div className="text-center text-sm text-slate-700">
    <p className="mb-3 text-base font-medium">Follow the circle's rhythm: 🎵</p>
    <div className="flex justify-center gap-4 text-sm">
    <span className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm"></div>
        <span className="font-medium">Inhale {selectedPattern.inhale}s</span>
    </span>
    {selectedPattern.hold > 0 && (
        <span className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 shadow-sm"></div>
            <span className="font-medium">Hold {selectedPattern.hold}s</span>
    </span>
    )}
    <span className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm"></div>
        <span className="font-medium">Exhale {selectedPattern.exhale}s</span>
    </span>
    </div>
    </div>
    </div>
    </div>
)
}