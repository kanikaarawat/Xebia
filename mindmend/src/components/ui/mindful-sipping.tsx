"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PenTool, Heart, Sparkles, BookOpen, Volume2, VolumeX, Settings } from "lucide-react"

interface MindfulStep {
    id: number
    emoji: string
    title: string
    instruction: string
    focus: string
    reflectionPrompt: string
    voiceText: string
    reflectionVoiceText: string
}

interface JournalEntry {
    stepId: number
    reflection: string
    timestamp: string
}

interface SessionJournal {
    date: string
    entries: JournalEntry[]
    overallFeeling: string
}

interface VoiceSettings {
    enabled: boolean
    rate: number
    pitch: number
    volume: number
    voice: string
}

const MINDFUL_STEPS: MindfulStep[] = [
    {
        id: 1,
        emoji: "🫖",
        title: "Hold & Feel",
        instruction: "Gently hold your cup or mug in both hands.",
        focus: "Notice the warmth against your palms, the weight of the vessel, the texture of its surface.",
        reflectionPrompt: "How does holding this cup make you feel? What sensations do you notice?",
        voiceText:
            "Welcome to your mindful sipping practice. Begin by gently holding your cup or mug in both hands. Feel the warmth against your palms. Notice the weight of the vessel and the texture of its surface. Take your time to really connect with these sensations.",
        reflectionVoiceText:
            "Now, take a moment to reflect. How does holding this cup make you feel? What sensations do you notice? You can write down your thoughts or simply hold them in your awareness.",
    },
    {
        id: 2,
        emoji: "🌊",
        title: "Observe & See",
        instruction: "Look at the liquid in your cup.",
        focus: "Notice its color, the way light plays on the surface, any gentle movement or steam rising.",
        reflectionPrompt: "What do you see that you hadn't noticed before? How does the liquid appear to you?",
        voiceText:
            "Now, bring your attention to the liquid in your cup. Look closely at its color. Notice how the light plays on the surface. Do you see any gentle movement? Perhaps steam rising? Allow your eyes to really take in all the visual details.",
        reflectionVoiceText:
            "Reflect on what you're seeing. What do you notice that you hadn't seen before? How does the liquid appear to you in this moment of focused attention?",
    },
    {
        id: 3,
        emoji: "🌸",
        title: "Breathe & Smell",
        instruction: "Bring the cup close to your face and breathe in slowly.",
        focus: "What aromas do you notice? Let the scent fill your awareness completely.",
        reflectionPrompt: "What memories or feelings does this aroma bring up? How does it affect your mood?",
        voiceText:
            "Gently bring the cup close to your face. Take a slow, deep breath in through your nose. What aromas do you notice? Let the scent fill your awareness completely. There's no need to analyze, just experience.",
        reflectionVoiceText:
            "What memories or feelings does this aroma bring up for you? How does it affect your mood? Notice any shifts in your emotional state as you breathe in these scents.",
    },
    {
        id: 4,
        emoji: "💧",
        title: "Taste & Savor",
        instruction: "Take your first small, mindful sip.",
        focus: "Feel the temperature, notice the taste, the texture. Let it rest on your tongue for a moment.",
        reflectionPrompt: "How would you describe this taste? What emotions or thoughts arise as you savor?",
        voiceText:
            "Now, take your first small, mindful sip. Feel the temperature as it touches your lips. Notice the taste, the texture. Let it rest on your tongue for a moment before swallowing. Really savor this experience.",
        reflectionVoiceText:
            "How would you describe this taste? What emotions or thoughts arise as you savor this moment? Notice any responses in your body or mind.",
    },
    {
        id: 5,
        emoji: "💆‍♀️",
        title: "Feel & Follow",
        instruction: "As you swallow, follow the sensation through your body.",
        focus: "Notice the warmth or coolness traveling down, how your body receives this nourishment.",
        reflectionPrompt: "How does your body respond to this nourishment? What do you feel grateful for?",
        voiceText:
            "As you swallow, follow the sensation through your body. Notice the warmth or coolness traveling down your throat. Feel how your body receives this nourishment. Your body knows how to take care of you.",
        reflectionVoiceText:
            "How does your body respond to this nourishment? What do you feel grateful for in this moment? Notice any sense of appreciation that arises.",
    },
    {
        id: 6,
        emoji: "✨",
        title: "Rest & Be",
        instruction: "Take a moment to simply be present.",
        focus: "Notice how you feel right now. Your breath, your body, this moment of quiet presence.",
        reflectionPrompt: "What has shifted in you during this practice? How do you feel right now?",
        voiceText:
            "Take a moment to simply be present. Notice how you feel right now. Feel your breath, your body, this moment of quiet presence. You don't need to do anything except be here, now.",
        reflectionVoiceText:
            "What has shifted in you during this practice? How do you feel right now? Take a moment to appreciate this time you've given yourself.",
    },
]

export default function MindfulSipping() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)
    const [showReflection, setShowReflection] = useState(false)
    const [currentReflection, setCurrentReflection] = useState("")
    const [sessionJournal, setSessionJournal] = useState<SessionJournal>({
        date: new Date().toISOString(),
        entries: [],
        overallFeeling: "",
    })
    const [showJournal, setShowJournal] = useState(false)
    const [savedSessions, setSavedSessions] = useState<SessionJournal[]>([])
    const [showVoiceSettings, setShowVoiceSettings] = useState(false)

    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
        enabled: true,
        rate: 0.8,
        pitch: 1,
        volume: 0.8,
        voice: "",
    })

    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
    const [isSpeaking, setIsSpeaking] = useState(false)
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

    // Load voices and saved settings
    useEffect(() => {
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices()
            setAvailableVoices(voices)

            // Prefer female voices for calming effect
            const preferredVoice =
                voices.find(
                    (voice) =>
                        voice.name.toLowerCase().includes("female") ||
                        voice.name.toLowerCase().includes("samantha") ||
                        voice.name.toLowerCase().includes("karen") ||
                        voice.name.toLowerCase().includes("moira"),
                ) ||
                voices.find((voice) => voice.lang.startsWith("en")) ||
                voices[0]

            if (preferredVoice && !voiceSettings.voice) {
                setVoiceSettings((prev) => ({ ...prev, voice: preferredVoice.name }))
            }
        }

        loadVoices()
        speechSynthesis.onvoiceschanged = loadVoices

        // Load saved settings
        if (typeof window !== "undefined") {
            const savedVoiceSettings = localStorage.getItem("mindfulSippingVoice")
            if (savedVoiceSettings) {
                setVoiceSettings(JSON.parse(savedVoiceSettings))
            }

            const saved = localStorage.getItem("mindfulSippingSessions")
            if (saved) {
                setSavedSessions(JSON.parse(saved))
            }
        }

        return () => {
            if (speechRef.current) {
                speechSynthesis.cancel()
            }
        }
    }, [])

    // Save voice settings
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("mindfulSippingVoice", JSON.stringify(voiceSettings))
        }
    }, [voiceSettings])

    const speak = (text: string, onEnd?: () => void) => {
        if (!voiceSettings.enabled || !text) return

        // Cancel any ongoing speech
        speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const selectedVoice = availableVoices.find((voice) => voice.name === voiceSettings.voice)

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        utterance.rate = voiceSettings.rate
        utterance.pitch = voiceSettings.pitch
        utterance.volume = voiceSettings.volume

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => {
            setIsSpeaking(false)
            if (onEnd) onEnd()
        }
        utterance.onerror = () => setIsSpeaking(false)

        speechRef.current = utterance
        speechSynthesis.speak(utterance)
    }

    const stopSpeaking = () => {
        speechSynthesis.cancel()
        setIsSpeaking(false)
    }

    const toggleVoice = () => {
        if (isSpeaking) {
            stopSpeaking()
        } else {
            setVoiceSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
        }
    }

    // Auto-speak when step changes
    useEffect(() => {
        if (voiceSettings.enabled && !showReflection && !isCompleted && !showJournal) {
            const currentStepData = MINDFUL_STEPS[currentStep]
            setTimeout(() => {
                speak(currentStepData.voiceText)
            }, 1000) // Delay to allow animations to settle
        }
    }, [currentStep, showReflection, voiceSettings.enabled])

    // Auto-speak reflection prompt
    useEffect(() => {
        if (voiceSettings.enabled && showReflection && !isCompleted) {
            const currentStepData = MINDFUL_STEPS[currentStep]
            setTimeout(() => {
                speak(currentStepData.reflectionVoiceText)
            }, 500)
        }
    }, [showReflection, voiceSettings.enabled])

    // Save session
    const saveSession = () => {
        const newSessions = [sessionJournal, ...savedSessions.slice(0, 19)]
        setSavedSessions(newSessions)
        if (typeof window !== "undefined") {
            localStorage.setItem("mindfulSippingSessions", JSON.stringify(newSessions))
        }
    }

    const handleNext = () => {
        stopSpeaking()

        if (showReflection) {
            // Save current reflection
            const newEntry: JournalEntry = {
                stepId: currentStep + 1,
                reflection: currentReflection,
                timestamp: new Date().toISOString(),
            }
            setSessionJournal((prev) => ({
                ...prev,
                entries: [...prev.entries, newEntry],
            }))
            setCurrentReflection("")
            setShowReflection(false)

            // Move to next step or complete
            if (currentStep < MINDFUL_STEPS.length - 1) {
                setCurrentStep(currentStep + 1)
            } else {
                setIsCompleted(true)
                if (voiceSettings.enabled) {
                    setTimeout(() => {
                        speak(
                            "Congratulations on completing your mindful sipping practice. Take a moment to notice how you feel and perhaps write down your overall experience.",
                        )
                    }, 1000)
                }
            }
        } else {
            setShowReflection(true)
        }
    }

    const handleSkipReflection = () => {
        stopSpeaking()
        setCurrentReflection("")
        setShowReflection(false)
        if (currentStep < MINDFUL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            setIsCompleted(true)
            if (voiceSettings.enabled) {
                setTimeout(() => {
                    speak("Congratulations on completing your mindful sipping practice.")
                }, 1000)
            }
        }
    }

    const handleComplete = () => {
        if (sessionJournal.overallFeeling.trim()) {
            saveSession()
        }
        setIsCompleted(true)
        if (voiceSettings.enabled) {
            speak(
                "Thank you for taking this time for yourself. May you carry this sense of presence with you throughout your day.",
            )
        }
    }

    const handleReplay = () => {
        stopSpeaking()
        setCurrentStep(0)
        setIsCompleted(false)
        setShowReflection(false)
        setCurrentReflection("")
        setSessionJournal({
            date: new Date().toISOString(),
            entries: [],
            overallFeeling: "",
        })
        setShowJournal(false)
    }

    const currentStepData = MINDFUL_STEPS[currentStep]
    const progress = ((currentStep + 1) / MINDFUL_STEPS.length) * 100

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 via-emerald-50 to-sky-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Enhanced background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-60 h-60 bg-gradient-to-br from-rose-200/20 via-pink-200/20 to-orange-200/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-emerald-200/20 via-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.2, 0.4],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-violet-200/15 via-purple-200/15 to-indigo-200/15 rounded-full blur-2xl"
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 4,
                    }}
                />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-amber-300 to-rose-300 rounded-full opacity-30"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + i * 10}%`,
                        }}
                        animate={{
                            y: [-10, -30, -10],
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-lg mx-auto relative z-10">
                {/* Enhanced Header with Voice Controls */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-8"
                >
                    <div className="mb-4">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            className="inline-block text-4xl mb-2"
                        >
                            🍃
                        </motion.div>
                    </div>
                    <h1 className="text-4xl font-light bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                        Mindful Sipping
                    </h1>
                    <p className="text-slate-600 text-lg">A gentle journey of presence and reflection</p>

                    {/* Voice Controls */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                            onClick={toggleVoice}
                            variant="ghost"
                            size="sm"
                            className={`${
                                voiceSettings.enabled
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            } rounded-full p-2 transition-all duration-300`}
                        >
                            {voiceSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>

                        {isSpeaking && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                                    className="w-2 h-2 bg-emerald-500 rounded-full"
                                />
                                Speaking...
                                <Button
                                    onClick={stopSpeaking}
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-auto text-emerald-600 hover:text-emerald-800"
                                >
                                    Stop
                                </Button>
                            </motion.div>
                        )}

                        <Button
                            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                            variant="ghost"
                            size="sm"
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full p-2"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </motion.div>

                {/* Voice Settings Panel */}
                {showVoiceSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60"
                    >
                        <h3 className="text-lg font-light text-slate-800 mb-4 flex items-center gap-2">
                            <Volume2 className="w-5 h-5" />
                            Voice Settings
                        </h3>

                        <div className="space-y-4">
                            {/* Voice Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Voice</label>
                                <select
                                    value={voiceSettings.voice}
                                    onChange={(e) => setVoiceSettings((prev) => ({ ...prev, voice: e.target.value }))}
                                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                                >
                                    {availableVoices.map((voice) => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Speed Control */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Speed: {voiceSettings.rate.toFixed(1)}x
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="1.5"
                                    step="0.1"
                                    value={voiceSettings.rate}
                                    onChange={(e) => setVoiceSettings((prev) => ({ ...prev, rate: Number.parseFloat(e.target.value) }))}
                                    className="w-full"
                                />
                            </div>

                            {/* Volume Control */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Volume: {Math.round(voiceSettings.volume * 100)}%
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    value={voiceSettings.volume}
                                    onChange={(e) => setVoiceSettings((prev) => ({ ...prev, volume: Number.parseFloat(e.target.value) }))}
                                    className="w-full"
                                />
                            </div>

                            {/* Test Voice */}
                            <Button
                                onClick={() =>
                                    speak("Hello, this is how your voice guidance will sound during the mindful sipping practice.")
                                }
                                variant="outline"
                                size="sm"
                                className="w-full bg-white/60 border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Test Voice
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Enhanced Progress bar */}
                {!isCompleted && !showJournal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600 font-medium">
                Step {currentStep + 1} of {MINDFUL_STEPS.length}
              </span>
                            <span className="text-sm text-slate-600 font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-3 overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full shadow-sm"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Journal Toggle Button */}
                {savedSessions.length > 0 && !showJournal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6 text-center"
                    >
                        <Button
                            onClick={() => setShowJournal(true)}
                            variant="ghost"
                            className="bg-white/40 backdrop-blur-sm border border-white/60 text-slate-700 hover:bg-white/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Past Reflections
                        </Button>
                    </motion.div>
                )}

                {/* Journal View */}
                {showJournal && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/60 mb-6 max-h-96 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-light text-slate-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Your Reflections
                            </h3>
                            <Button
                                onClick={() => setShowJournal(false)}
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-700"
                            >
                                Close
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {savedSessions.slice(0, 5).map((session, index) => (
                                <div key={index} className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-4">
                                    <div className="text-sm text-slate-600 mb-2">{formatDate(session.date)}</div>
                                    {session.overallFeeling && (
                                        <div className="text-slate-700 italic mb-2">"{session.overallFeeling}"</div>
                                    )}
                                    <div className="text-xs text-slate-500">{session.entries.length} reflections recorded</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Main content */}
                <AnimatePresence mode="wait">
                    {!isCompleted && !showJournal ? (
                        <motion.div
                            key={showReflection ? `reflection-${currentStep}` : `step-${currentStep}`}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/60 text-center relative overflow-hidden"
                        >
                            {/* Card background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-rose-50/30 rounded-3xl" />

                            {!showReflection ? (
                                <>
                                    {/* Step emoji with enhanced animation */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.6 }}
                                        className="text-7xl mb-6 relative z-10"
                                    >
                                        {currentStepData.emoji}
                                    </motion.div>

                                    {/* Step title with gradient */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                        className="text-3xl font-light bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4 relative z-10"
                                    >
                                        {currentStepData.title}
                                    </motion.h2>

                                    {/* Main instruction */}
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className="text-slate-700 text-xl mb-6 leading-relaxed relative z-10"
                                    >
                                        {currentStepData.instruction}
                                    </motion.p>

                                    {/* Enhanced focus area */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.6, duration: 0.6 }}
                                        className="bg-gradient-to-r from-amber-50/80 via-rose-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/40 shadow-inner relative z-10"
                                    >
                                        <div className="flex items-center justify-center mb-3">
                                            <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                                            <span className="text-sm font-medium text-slate-600">Notice</span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed italic">{currentStepData.focus}</p>
                                    </motion.div>

                                    {/* Voice indicator */}
                                    {voiceSettings.enabled && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8 }}
                                            className="mb-6 relative z-10"
                                        >
                                            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                                                <Volume2 className="w-4 h-4" />
                                                <span>Listen to the gentle guidance</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Enhanced next button */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.6 }}
                                        className="relative z-10"
                                    >
                                        <Button
                                            onClick={handleNext}
                                            className="bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 hover:from-rose-500 hover:via-amber-500 hover:to-emerald-500 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-light border-0 relative overflow-hidden group"
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                                                initial={{ x: "-100%" }}
                                                whileHover={{ x: "100%" }}
                                                transition={{ duration: 0.6 }}
                                            />
                                            <span className="relative z-10 flex items-center gap-2">
                        <PenTool className="w-5 h-5" />
                        Reflect on This
                      </span>
                                        </Button>
                                    </motion.div>
                                </>
                            ) : (
                                /* Reflection screen */
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                                        className="text-6xl mb-6 relative z-10"
                                    >
                                        💭
                                    </motion.div>

                                    <motion.h3
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.6 }}
                                        className="text-2xl font-light text-slate-800 mb-4 relative z-10"
                                    >
                                        Take a Moment to Reflect
                                    </motion.h3>

                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                        className="text-slate-600 mb-6 relative z-10"
                                    >
                                        {currentStepData.reflectionPrompt}
                                    </motion.p>

                                    {/* Voice indicator for reflection */}
                                    {voiceSettings.enabled && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="mb-4 relative z-10"
                                        >
                                            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                                                <Volume2 className="w-4 h-4" />
                                                <span>Listen to the reflection prompt</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className="mb-6 relative z-10"
                                    >
                    <textarea
                        value={currentReflection}
                        onChange={(e) => setCurrentReflection(e.target.value)}
                        placeholder="Share what you're experiencing... your thoughts, feelings, or sensations."
                        className="w-full h-32 p-4 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-slate-700 placeholder-slate-400 shadow-inner"
                    />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.6 }}
                                        className="flex gap-3 justify-center relative z-10"
                                    >
                                        <Button
                                            onClick={handleNext}
                                            className="bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-light border-0"
                                        >
                                            <Heart className="w-4 h-4 mr-2" />
                                            {currentReflection.trim() ? "Save & Continue" : "Continue"}
                                        </Button>
                                        <Button
                                            onClick={handleSkipReflection}
                                            variant="ghost"
                                            className="bg-white/60 border border-white/60 text-slate-600 hover:bg-white/80 px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 font-light"
                                        >
                                            Skip
                                        </Button>
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    ) : !showJournal ? (
                        /* Enhanced completion screen */
                        <motion.div
                            key="completion"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/60 text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-rose-50/30 rounded-3xl" />

                            {/* Completion emoji with celebration animation */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, duration: 1, type: "spring", bounce: 0.6 }}
                                className="text-8xl mb-6 relative z-10"
                            >
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                                >
                                    🙏
                                </motion.span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-3xl font-light bg-gradient-to-r from-emerald-600 to-rose-600 bg-clip-text text-transparent mb-4 relative z-10"
                            >
                                Beautiful Journey
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-slate-700 text-xl mb-6 leading-relaxed relative z-10"
                            >
                                You've completed your mindful sipping practice.
                            </motion.p>

                            {/* Final reflection */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="mb-8 relative z-10"
                            >
                                <h4 className="text-lg font-light text-slate-700 mb-3">How do you feel overall?</h4>
                                <textarea
                                    value={sessionJournal.overallFeeling}
                                    onChange={(e) =>
                                        setSessionJournal((prev) => ({
                                            ...prev,
                                            overallFeeling: e.target.value,
                                        }))
                                    }
                                    placeholder="Capture this moment... How has this practice affected you?"
                                    className="w-full h-24 p-4 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-slate-700 placeholder-slate-400 shadow-inner"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="bg-gradient-to-r from-emerald-50/80 to-rose-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/40 shadow-inner relative z-10"
                            >
                                <p className="text-emerald-700 leading-relaxed">
                                    Carry this sense of awareness with you. You've created a beautiful moment of presence that ripples
                                    into the rest of your day.
                                </p>
                            </motion.div>

                            {/* Action buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
                            >
                                <Button
                                    onClick={handleComplete}
                                    className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-light border-0"
                                >
                                    <Heart className="w-5 h-5 mr-2" />
                                    Complete Practice
                                </Button>
                                <Button
                                    onClick={handleReplay}
                                    variant="outline"
                                    className="bg-white/60 border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-light"
                                >
                                    Practice Again
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Enhanced Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="text-center mt-8"
                >
                    <p className="text-slate-500 text-sm">Take your time. There's no rush in this moment. 🌸</p>
                </motion.div>
            </div>
        </div>
    )
}