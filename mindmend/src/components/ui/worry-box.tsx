"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, Eye, Trash2, Package, Heart, Sparkles, RotateCcw } from "lucide-react"

interface Worry {
    id: string
    text: string
    timestamp: string
    isLocked: boolean
}

interface WorryBoxProps {
    maxWorries?: number
}

const ENCOURAGING_MESSAGES = [
    "Your worry is safely contained now 🌸",
    "Let this weight be lifted from your shoulders ✨",
    "You've given your worry a safe place to rest 💙",
    "Feel the relief of letting go 🕊️",
    "Your mind has more space for peace now 🌿",
    "This worry no longer needs to carry you 🦋",
]

const DESTRUCTION_MESSAGES = [
    "Released into the universe ✨",
    "Transformed into stardust 🌟",
    "Dissolved with love 💕",
    "Set free like a butterfly 🦋",
    "Melted away gently 🌸",
    "Returned to the earth 🌱",
]

export default function WorryBox({ maxWorries = 50 }: WorryBoxProps) {
    const [currentWorry, setCurrentWorry] = useState("")
    const [worries, setWorries] = useState<Worry[]>([])
    const [isBoxOpen, setIsBoxOpen] = useState(false)
    const [isLocking, setIsLocking] = useState(false)
    const [showWorries, setShowWorries] = useState(false)
    const [justLocked, setJustLocked] = useState(false)
    const [isDestroying, setIsDestroying] = useState<string | null>(null)
    const [soundEnabled, setSoundEnabled] = useState(true)

    const audioContextRef = useRef<AudioContext | null>(null)

    // Load saved worries
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedWorries = localStorage.getItem("worryBoxWorries")
            const savedSoundSetting = localStorage.getItem("worryBoxSound")

            if (savedWorries) {
                setWorries(JSON.parse(savedWorries))
            }
            if (savedSoundSetting) {
                setSoundEnabled(JSON.parse(savedSoundSetting))
            }
        }
    }, [])

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

    // Save worries to localStorage
    const saveWorries = (newWorries: Worry[]) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("worryBoxWorries", JSON.stringify(newWorries))
            localStorage.setItem("worryBoxSound", JSON.stringify(soundEnabled))
        }
    }

    // Play gentle lock sound
    const playLockSound = () => {
        if (!soundEnabled || !audioContextRef.current) return

        try {
            const oscillator = audioContextRef.current.createOscillator()
            const gainNode = audioContextRef.current.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)

            // Gentle, calming lock sound
            oscillator.frequency.setValueAtTime(523.25, audioContextRef.current.currentTime) // C5
            oscillator.frequency.exponentialRampToValueAtTime(392.0, audioContextRef.current.currentTime + 0.3) // G4
            oscillator.type = "sine"

            gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.1)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1.2)

            oscillator.start(audioContextRef.current.currentTime)
            oscillator.stop(audioContextRef.current.currentTime + 1.2)
        } catch (error) {
            console.log("Audio not supported")
        }
    }

    // Play gentle destruction sound
    const playDestructionSound = () => {
        if (!soundEnabled || !audioContextRef.current) return

        try {
            const oscillator = audioContextRef.current.createOscillator()
            const gainNode = audioContextRef.current.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)

            // Gentle, releasing sound
            oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime) // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContextRef.current.currentTime + 0.8) // A5
            oscillator.type = "triangle"

            gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.05, audioContextRef.current.currentTime + 0.1)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1.5)

            oscillator.start(audioContextRef.current.currentTime)
            oscillator.stop(audioContextRef.current.currentTime + 1.5)
        } catch (error) {
            console.log("Audio not supported")
        }
    }

    const handleWorrySubmit = () => {
        if (!currentWorry.trim()) return

        setIsBoxOpen(true)

        // After box opens, start locking process
        setTimeout(() => {
            setIsLocking(true)
            playLockSound()

            const newWorry: Worry = {
                id: Math.random().toString(36).substr(2, 9),
                text: currentWorry.trim(),
                timestamp: new Date().toISOString(),
                isLocked: true,
            }

            const updatedWorries = [newWorry, ...worries.slice(0, maxWorries - 1)]
            setWorries(updatedWorries)
            saveWorries(updatedWorries)

            setTimeout(() => {
                setIsBoxOpen(false)
                setIsLocking(false)
                setJustLocked(true)
                setCurrentWorry("")

                // Reset the "just locked" state after showing the message
                setTimeout(() => {
                    setJustLocked(false)
                }, 4000)
            }, 2000)
        }, 1000)
    }

    const handleDestroyWorry = (worryId: string) => {
        setIsDestroying(worryId)
        playDestructionSound()

        setTimeout(() => {
            const updatedWorries = worries.filter((worry) => worry.id !== worryId)
            setWorries(updatedWorries)
            saveWorries(updatedWorries)
            setIsDestroying(null)
        }, 1500)
    }

    const handleDestroyAll = () => {
        if (worries.length === 0) return

        playDestructionSound()
        setWorries([])
        saveWorries([])
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
    const randomDestructionMessage = DESTRUCTION_MESSAGES[Math.floor(Math.random() * DESTRUCTION_MESSAGES.length)]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full opacity-10"
                        style={{
                            width: `${60 + i * 20}px`,
                            height: `${60 + i * 20}px`,
                            left: `${(i * 15) % 100}%`,
                            top: `${(i * 20) % 100}%`,
                            background: `radial-gradient(circle, ${
                                ["#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899", "#F59E0B"][i % 6]
                            }40 0%, transparent 70%)`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 20, 0],
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                            duration: 12 + i * 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: i * 2,
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                        className="text-6xl mb-4"
                    >
                        📦
                    </motion.div>
                    <h1 className="text-4xl font-light bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Worry Box
                    </h1>
                    <p className="text-slate-600 text-lg font-light max-w-md mx-auto leading-relaxed">
                        Place your worries in a safe container. Let them rest while you find peace.
                    </p>
                </motion.div>

                {/* Navigation */}
                <div className="flex justify-center gap-4 mb-8">
                    <Button
                        onClick={() => setShowWorries(!showWorries)}
                        variant="ghost"
                        className="bg-white/60 backdrop-blur-sm border border-white/50 text-slate-700 hover:bg-white/80 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl px-6"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {showWorries ? "Hide" : "View"} Worries ({worries.length})
                    </Button>
                    <Button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        variant="ghost"
                        className={`${
                            soundEnabled ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                        } border border-white/50 hover:bg-blue-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl px-6`}
                    >
                        {soundEnabled ? "🔊" : "🔇"} Sound
                    </Button>
                </div>

                {/* Worry Input Section */}
                {!showWorries && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/60 mb-8"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-light text-slate-800 mb-2">What's weighing on your mind?</h2>
                            <p className="text-slate-600 font-light">Write it down and let the worry box hold it for you.</p>
                        </div>

                        <div className="relative mb-6">
              <textarea
                  value={currentWorry}
                  onChange={(e) => setCurrentWorry(e.target.value)}
                  placeholder="Share your worry here... it's safe to let it out."
                  className="w-full h-32 p-6 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 text-slate-800 placeholder-slate-500 transition-all duration-500 shadow-inner text-lg font-light leading-relaxed"
                  maxLength={500}
                  disabled={isBoxOpen || isLocking}
              />
                            <div className="absolute bottom-4 right-4 text-sm text-slate-400">{currentWorry.length}/500</div>
                        </div>

                        {/* Worry Box Animation */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                {/* Box Container */}
                                <motion.div
                                    className="relative w-48 h-32"
                                    animate={{
                                        scale: isBoxOpen ? 1.1 : 1,
                                    }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    {/* Box Base */}
                                    <motion.div
                                        className="absolute bottom-0 w-full h-24 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg shadow-xl border-2 border-amber-400"
                                        animate={{
                                            rotateX: isBoxOpen ? -15 : 0,
                                        }}
                                        style={{ transformOrigin: "bottom center", transformStyle: "preserve-3d" }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />

                                    {/* Box Lid */}
                                    <motion.div
                                        className="absolute top-0 w-full h-16 bg-gradient-to-br from-amber-300 to-amber-400 rounded-lg shadow-lg border-2 border-amber-500"
                                        animate={{
                                            rotateX: isBoxOpen ? -120 : 0,
                                            y: isBoxOpen ? -8 : 0,
                                        }}
                                        style={{ transformOrigin: "bottom center", transformStyle: "preserve-3d" }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />

                                    {/* Lock */}
                                    <motion.div
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                                        animate={{
                                            scale: isLocking ? [1, 1.3, 1] : 1,
                                            rotate: isLocking ? [0, 10, -10, 0] : 0,
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        {isLocking ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">
                                                <Lock className="w-8 h-8 text-amber-700" />
                                            </motion.div>
                                        ) : isBoxOpen ? (
                                            <Unlock className="w-8 h-8 text-amber-600" />
                                        ) : (
                                            <Lock className="w-8 h-8 text-amber-700" />
                                        )}
                                    </motion.div>

                                    {/* Sparkle Effects */}
                                    <AnimatePresence>
                                        {isLocking && (
                                            <>
                                                {[...Array(6)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute text-yellow-400 text-xl"
                                                        style={{
                                                            left: `${30 + i * 20}%`,
                                                            top: `${20 + (i % 3) * 20}%`,
                                                        }}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{
                                                            scale: [0, 1.5, 0],
                                                            opacity: [0, 1, 0],
                                                            rotate: [0, 180, 360],
                                                        }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{
                                                            duration: 2,
                                                            ease: "easeOut",
                                                            delay: i * 0.2,
                                                        }}
                                                    >
                                                        ✨
                                                    </motion.div>
                                                ))}
                                            </>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center">
                            <Button
                                onClick={handleWorrySubmit}
                                disabled={!currentWorry.trim() || isBoxOpen || isLocking}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border-0 font-medium text-lg"
                            >
                                <motion.span
                                    animate={isLocking ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.5, repeat: isLocking ? Number.POSITIVE_INFINITY : 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <Package className="w-5 h-5" />
                                    {isLocking ? "Securing your worry..." : isBoxOpen ? "Placing in box..." : "Place in Worry Box"}
                                </motion.span>
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Success Message */}
                <AnimatePresence>
                    {justLocked && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.9 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 shadow-xl mb-8 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.6 }}
                                className="text-5xl mb-4"
                            >
                                🔒
                            </motion.div>
                            <h3 className="text-2xl font-light text-green-800 mb-3">Worry Safely Contained</h3>
                            <p className="text-green-700 text-lg font-light mb-4">{randomMessage}</p>
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <Heart className="w-5 h-5" />
                                <span className="text-sm font-light">Your mind has more space for peace now</span>
                                <Sparkles className="w-5 h-5" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stored Worries View */}
                <AnimatePresence>
                    {showWorries && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/60"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-light text-slate-800 flex items-center gap-3">
                                    <Package className="w-6 h-6" />
                                    Your Worry Collection
                                </h3>
                                {worries.length > 0 && (
                                    <Button
                                        onClick={handleDestroyAll}
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl px-4 py-2"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Release All
                                    </Button>
                                )}
                            </div>

                            {worries.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🕊️</div>
                                    <p className="text-slate-600 text-lg font-light">Your worry box is empty.</p>
                                    <p className="text-slate-500 text-sm font-light mt-2">What a peaceful feeling!</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {worries.map((worry) => (
                                        <motion.div
                                            key={worry.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                            className={`relative bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6 shadow-md ${
                                                isDestroying === worry.id ? "animate-pulse" : ""
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Lock className="w-4 h-4 text-slate-500" />
                                                        <span className="text-xs text-slate-500 font-medium">
                              Secured on {formatDate(worry.timestamp)}
                            </span>
                                                    </div>
                                                    <p className="text-slate-700 font-light leading-relaxed">{worry.text}</p>
                                                </div>
                                                <Button
                                                    onClick={() => handleDestroyWorry(worry.id)}
                                                    disabled={isDestroying === worry.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl ml-4 flex-shrink-0"
                                                >
                                                    {isDestroying === worry.id ? (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </motion.div>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Destruction Animation */}
                                            <AnimatePresence>
                                                {isDestroying === worry.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center"
                                                    >
                                                        <div className="text-center">
                                                            <motion.div
                                                                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                                                className="text-3xl mb-2"
                                                            >
                                                                🦋
                                                            </motion.div>
                                                            <p className="text-purple-700 font-light">{randomDestructionMessage}</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-center mt-8"
                >
                    <p className="text-slate-500 text-sm font-light max-w-lg mx-auto leading-relaxed">
                        Sometimes the act of containing our worries helps us gain perspective. Your worries are safe here, and you
                        can choose when to revisit or release them. 💙
                    </p>
                </motion.div>
            </div>
        </div>
    )
}