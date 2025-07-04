"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Volume2, VolumeX, Moon, Sun, BarChart3, Play, Pause } from "lucide-react"

interface TouchPoint {
    id: string
    x: number
    y: number
}

interface Stats {
    totalPets: number
    totalSleeps: number
    yarnPlays: number
    sessionTime: number
    happiness: number
}

interface YarnBall {
    x: number
    y: number
    isDragging: boolean
    velocity: { x: number; y: number }
}

type CatState = "awake" | "sleeping" | "playing"

const CAT_COLORS = {
    primary: "#D4A574", // Warm golden brown
    secondary: "#E8C4A0", // Lighter golden cream
    accent: "#F5E6D8", // Soft cream
    nose: "#FFB6C1", // Soft pink
    eyes: "#6BB6FF", // Bright sky blue
}

export default function CalmCat() {
    const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([])
    const [isPurring, setIsPurring] = useState(false)
    const [isBeingPetted, setIsBeingPetted] = useState(false)
    const [eyesState, setEyesState] = useState<"open" | "closed">("open")
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [catState, setCatState] = useState<CatState>("awake")
    const [showStats, setShowStats] = useState(false)
    const [showYarn, setShowYarn] = useState(false)
    const [catLookDirection, setCatLookDirection] = useState({ x: 0, y: 0 })
    const [yarnBall, setYarnBall] = useState<YarnBall>({
        x: 250,
        y: 150,
        isDragging: false,
        velocity: { x: 0, y: 0 },
    })
    const [stats, setStats] = useState<Stats>({
        totalPets: 0,
        totalSleeps: 0,
        yarnPlays: 0,
        sessionTime: 0,
        happiness: 50,
    })

    const audioContextRef = useRef<AudioContext | null>(null)
    const purrOscillatorRef = useRef<OscillatorNode | null>(null)
    const catRef = useRef<HTMLDivElement>(null)
    const yarnRef = useRef<HTMLDivElement>(null)
    const sessionStartRef = useRef<number>(Date.now())
    const sleepTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Load saved stats
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedStats = localStorage.getItem("calmCatStats")
            if (savedStats) {
                setStats(JSON.parse(savedStats))
            }
        }
    }, [])

    // Save stats
    const saveStats = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("calmCatStats", JSON.stringify(stats))
        }
    }, [stats])

    useEffect(() => {
        saveStats()
    }, [saveStats])

    // Update session time
    useEffect(() => {
        const interval = setInterval(() => {
            setStats((prev) => ({
                ...prev,
                sessionTime: Date.now() - sessionStartRef.current,
            }))
        }, 1000)

        return () => clearInterval(interval)
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

    // Create simple purring sound
    const startPurring = useCallback(() => {
        if (!soundEnabled || !audioContextRef.current || catState === "sleeping") return

        try {
            if (purrOscillatorRef.current) {
                purrOscillatorRef.current.stop()
            }

            const oscillator = audioContextRef.current.createOscillator()
            const gainNode = audioContextRef.current.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)

            oscillator.frequency.setValueAtTime(30, audioContextRef.current.currentTime)
            oscillator.type = "sawtooth"

            gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.2)

            purrOscillatorRef.current = oscillator
            oscillator.start(audioContextRef.current.currentTime)
        } catch (error) {
            console.log("Audio not supported")
        }
    }, [soundEnabled, catState])

    const stopPurring = useCallback(() => {
        if (purrOscillatorRef.current) {
            try {
                purrOscillatorRef.current.stop()
                purrOscillatorRef.current = null
            } catch (error) {
                console.log("Error stopping purr")
            }
        }
    }, [])

    // Handle sleep
    const handleSleep = useCallback(() => {
        if (catState === "sleeping") return

        setCatState("sleeping")
        setEyesState("closed")
        setIsPurring(false)
        setShowYarn(false) // Hide yarn when sleeping
        stopPurring()

        setStats((prev) => ({
            ...prev,
            totalSleeps: prev.totalSleeps + 1,
            happiness: Math.min(100, prev.happiness + 10),
        }))

        // Wake up after 10 seconds
        sleepTimeoutRef.current = setTimeout(() => {
            setCatState("awake")
            setEyesState("open")
        }, 10000)
    }, [catState, stopPurring])

    const handleWakeUp = useCallback(() => {
        if (catState === "awake") return

        setCatState("awake")
        setEyesState("open")

        if (sleepTimeoutRef.current) {
            clearTimeout(sleepTimeoutRef.current)
            sleepTimeoutRef.current = null
        }
    }, [catState])

    // Yarn ball interactions
    const handleYarnMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCatState("playing")
        setYarnBall((prev) => ({ ...prev, isDragging: true }))
    }, [])

    const handleYarnMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!yarnBall.isDragging || !yarnRef.current || !catRef.current) return

            const containerRect = catRef.current.getBoundingClientRect()
            if (!containerRect) return

            const newX = e.clientX - containerRect.left
            const newY = e.clientY - containerRect.top

            // Keep yarn within bounds
            const boundedX = Math.max(20, Math.min(containerRect.width - 20, newX))
            const boundedY = Math.max(20, Math.min(containerRect.height - 20, newY))

            setYarnBall((prev) => ({
                ...prev,
                x: boundedX,
                y: boundedY,
                velocity: {
                    x: (boundedX - prev.x) * 0.1,
                    y: (boundedY - prev.y) * 0.1,
                },
            }))

            // Update cat look direction (cat head is around center)
            setCatLookDirection({
                x: (boundedX - 150) * 0.05, // Cat head center
                y: (boundedY - 80) * 0.05,
            })

            // Increase happiness and playfulness
            setStats((prev) => ({
                ...prev,
                happiness: Math.min(100, prev.happiness + 0.3),
            }))
        },
        [yarnBall.isDragging],
    )

    const handleYarnMouseUp = useCallback(() => {
        setYarnBall((prev) => ({ ...prev, isDragging: false }))
        setStats((prev) => ({
            ...prev,
            yarnPlays: prev.yarnPlays + 1,
        }))

        // Return to awake state after a moment
        setTimeout(() => {
            if (!yarnBall.isDragging) {
                setCatState("awake")
                setCatLookDirection({ x: 0, y: 0 })
            }
        }, 2000)
    }, [yarnBall.isDragging])

    // Handle petting
    const handlePetStart = useCallback(
        (x: number, y: number) => {
            if (!catRef.current || catState === "sleeping") return

            const rect = catRef.current.getBoundingClientRect()
            const relativeX = ((x - rect.left) / rect.width) * 100
            const relativeY = ((y - rect.top) / rect.height) * 100

            const touchPoint: TouchPoint = {
                id: Math.random().toString(36).substr(2, 9),
                x: relativeX,
                y: relativeY,
            }

            setTouchPoints((prev) => [...prev, touchPoint])
            setIsBeingPetted(true)
            setIsPurring(true)

            setStats((prev) => ({
                ...prev,
                totalPets: prev.totalPets + 1,
                happiness: Math.min(100, prev.happiness + 2),
            }))

            startPurring()

            setTimeout(() => {
                setTouchPoints((prev) => prev.filter((tp) => tp.id !== touchPoint.id))
            }, 2000)
        },
        [startPurring, catState],
    )

    const handlePetEnd = useCallback(() => {
        if (catState === "sleeping") return

        setIsBeingPetted(false)
        setIsPurring(false)
        stopPurring()
    }, [stopPurring, catState])

    // Global mouse events for yarn dragging
    useEffect(() => {
        if (yarnBall.isDragging) {
            document.addEventListener("mousemove", handleYarnMouseMove)
            document.addEventListener("mouseup", handleYarnMouseUp)
            return () => {
                document.removeEventListener("mousemove", handleYarnMouseMove)
                document.removeEventListener("mouseup", handleYarnMouseUp)
            }
        }
    }, [yarnBall.isDragging, handleYarnMouseMove, handleYarnMouseUp])

    // Eye state based on petting and sleeping
    useEffect(() => {
        if (catState === "sleeping") {
            setEyesState("closed")
        } else if (isBeingPetted) {
            setEyesState("closed")
        } else {
            setEyesState("open")
        }
    }, [isBeingPetted, catState])

    // Yarn physics
    useEffect(() => {
        if (!yarnBall.isDragging && (Math.abs(yarnBall.velocity.x) > 0.1 || Math.abs(yarnBall.velocity.y) > 0.1)) {
            const interval = setInterval(() => {
                setYarnBall((prev) => ({
                    ...prev,
                    velocity: {
                        x: prev.velocity.x * 0.95, // Friction
                        y: prev.velocity.y * 0.95,
                    },
                    x: Math.max(20, Math.min(280, prev.x + prev.velocity.x)),
                    y: Math.max(20, Math.min(180, prev.y + prev.velocity.y)),
                }))
            }, 16)

            return () => clearInterval(interval)
        }
    }, [yarnBall.isDragging, yarnBall.velocity])

    // Cleanup sleep timeout
    useEffect(() => {
        return () => {
            if (sleepTimeoutRef.current) {
                clearTimeout(sleepTimeoutRef.current)
            }
        }
    }, [])

    // Mouse/touch event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (showYarn && e.target === yarnRef.current) return
        if (catState === "sleeping") {
            handleWakeUp()
        } else {
            handlePetStart(e.clientX, e.clientY)
        }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        if (catState === "sleeping") {
            handleWakeUp()
        } else {
            handlePetStart(touch.clientX, touch.clientY)
        }
    }

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl mx-auto text-center">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="mb-8"
                >
                    <div className="text-5xl mb-4">{catState === "sleeping" ? "😴" : catState === "playing" ? "🐱" : "🐱"}</div>
                    <h1 className="text-4xl font-light bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent mb-3">
                        Calm Cat
                    </h1>
                    <p className="text-slate-600 text-lg font-light">
                        {catState === "sleeping"
                            ? "Your cat is having a peaceful nap... tap to wake up gently"
                            : catState === "playing"
                                ? "Your cat is playful and focused on the yarn! 🧶"
                                : "Pet your virtual companion for comfort"}
                    </p>
                </motion.div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    <Button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        variant="ghost"
                        className={`${
                            soundEnabled ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                        } border border-white/50 hover:bg-orange-200 shadow-md transition-all duration-300 rounded-2xl px-6`}
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                        Sound
                    </Button>

                    <Button
                        onClick={catState === "sleeping" ? handleWakeUp : handleSleep}
                        variant="ghost"
                        disabled={catState === "playing"}
                        className="bg-purple-100 text-purple-700 border border-white/50 hover:bg-purple-200 shadow-md transition-all duration-300 rounded-2xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {catState === "sleeping" ? (
                            <>
                                <Sun className="w-4 h-4 mr-2" />
                                Wake Up
                            </>
                        ) : (
                            <>
                                <Moon className="w-4 h-4 mr-2" />
                                Sleep (10s)
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={() => setShowYarn(!showYarn)}
                        variant="ghost"
                        disabled={catState === "sleeping"}
                        className={`${
                            showYarn ? "bg-pink-100 text-pink-700" : "bg-white/60 text-slate-700"
                        } border border-white/50 hover:bg-pink-200 shadow-md transition-all duration-300 rounded-2xl px-6 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {showYarn ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}🧶 Yarn Ball
                    </Button>

                    <Button
                        onClick={() => setShowStats(!showStats)}
                        variant="ghost"
                        className="bg-blue-100 text-blue-700 border border-white/50 hover:bg-blue-200 shadow-md transition-all duration-300 rounded-2xl px-6"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Stats
                    </Button>
                </div>

                {/* Stats Panel */}
                <AnimatePresence>
                    {showStats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/60"
                        >
                            <h3 className="text-lg font-light text-slate-800 mb-4 flex items-center justify-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Cat Care Stats
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-pink-600">{stats.totalPets}</div>
                                    <div className="text-xs text-slate-600">Total Pets</div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-purple-600">{stats.totalSleeps}</div>
                                    <div className="text-xs text-slate-600">Naps Taken</div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-orange-600">{stats.yarnPlays}</div>
                                    <div className="text-xs text-slate-600">Yarn Plays</div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-blue-600">{formatTime(stats.sessionTime)}</div>
                                    <div className="text-xs text-slate-600">Session Time</div>
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                                    <div className="text-2xl font-bold text-green-600">{Math.round(stats.happiness)}%</div>
                                    <div className="text-xs text-slate-600">Happiness</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Simple Cat */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative flex justify-center mb-8"
                >
                    <div
                        ref={catRef}
                        className="relative cursor-pointer select-none"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handlePetEnd}
                        onMouseLeave={handlePetEnd}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handlePetEnd}
                        style={{ width: "300px", height: "200px" }}
                    >
                        {/* Cat Body */}
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                scale: isBeingPetted ? [1, 1.05, 1] : 1,
                                y: catState === "sleeping" ? [0, 2, 0] : 0,
                            }}
                            transition={{
                                scale: {
                                    duration: 0.5,
                                    repeat: isBeingPetted ? Number.POSITIVE_INFINITY : 0,
                                },
                                y: {
                                    duration: 3,
                                    repeat: catState === "sleeping" ? Number.POSITIVE_INFINITY : 0,
                                    ease: "easeInOut",
                                },
                            }}
                        >
                            {/* Sleeping glow effect */}
                            {catState === "sleeping" && (
                                <div
                                    className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
                                    style={{
                                        background: "radial-gradient(ellipse 250px 150px at center, #E6E6FA 0%, transparent 70%)",
                                        transform: "scale(1.2)",
                                    }}
                                />
                            )}

                            {/* Body */}
                            <div
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-20 rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${CAT_COLORS.primary} 0%, ${CAT_COLORS.secondary} 100%)`,
                                    boxShadow: "0 8px 24px rgba(212, 165, 116, 0.3)",
                                }}
                            />

                            {/* Head */}
                            <div
                                className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full relative"
                                style={{
                                    background: `linear-gradient(135deg, ${CAT_COLORS.primary} 0%, ${CAT_COLORS.accent} 100%)`,
                                    boxShadow: "0 12px 32px rgba(212, 165, 116, 0.3)",
                                }}
                            >
                                {/* Ears */}
                                <motion.div
                                    className="absolute -top-2 left-4 w-6 h-8 rounded-t-full transform -rotate-12"
                                    style={{ backgroundColor: CAT_COLORS.primary }}
                                    animate={{
                                        rotate: catState === "sleeping" ? -8 : catState === "playing" ? [-12, -8, -12] : -12,
                                    }}
                                    transition={{
                                        duration: catState === "playing" ? 1 : 0.5,
                                        repeat: catState === "playing" ? Number.POSITIVE_INFINITY : 0,
                                    }}
                                />
                                <motion.div
                                    className="absolute -top-2 right-4 w-6 h-8 rounded-t-full transform rotate-12"
                                    style={{ backgroundColor: CAT_COLORS.primary }}
                                    animate={{
                                        rotate: catState === "sleeping" ? 8 : catState === "playing" ? [12, 8, 12] : 12,
                                    }}
                                    transition={{
                                        duration: catState === "playing" ? 1 : 0.5,
                                        repeat: catState === "playing" ? Number.POSITIVE_INFINITY : 0,
                                    }}
                                />

                                {/* Eyes */}
                                <motion.div
                                    className="absolute top-8 left-6 w-4 h-4 rounded-full"
                                    style={{ backgroundColor: CAT_COLORS.eyes }}
                                    animate={{
                                        scaleY: eyesState === "closed" ? 0.1 : 1,
                                        x: showYarn && catState === "playing" ? catLookDirection.x * 0.5 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.div
                                    className="absolute top-8 right-6 w-4 h-4 rounded-full"
                                    style={{ backgroundColor: CAT_COLORS.eyes }}
                                    animate={{
                                        scaleY: eyesState === "closed" ? 0.1 : 1,
                                        x: showYarn && catState === "playing" ? catLookDirection.x * 0.5 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                />

                                {/* Pupils */}
                                {eyesState === "open" && (
                                    <>
                                        <motion.div
                                            className="absolute top-9 left-7 w-2 h-3 rounded-full"
                                            style={{ backgroundColor: "#000" }}
                                            animate={{
                                                x: showYarn && catState === "playing" ? catLookDirection.x * 0.3 : 0,
                                                y: showYarn && catState === "playing" ? catLookDirection.y * 0.3 : 0,
                                                scaleY: catState === "playing" ? [1, 0.6, 1] : 1,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                scaleY: { duration: 2, repeat: catState === "playing" ? Number.POSITIVE_INFINITY : 0 },
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-9 right-7 w-2 h-3 rounded-full"
                                            style={{ backgroundColor: "#000" }}
                                            animate={{
                                                x: showYarn && catState === "playing" ? catLookDirection.x * 0.3 : 0,
                                                y: showYarn && catState === "playing" ? catLookDirection.y * 0.3 : 0,
                                                scaleY: catState === "playing" ? [1, 0.6, 1] : 1,
                                            }}
                                            transition={{
                                                duration: 0.3,
                                                scaleY: { duration: 2, repeat: catState === "playing" ? Number.POSITIVE_INFINITY : 0 },
                                            }}
                                        />
                                    </>
                                )}

                                {/* Nose */}
                                <motion.div
                                    className="absolute top-14 left-1/2 transform -translate-x-1/2 w-2 h-1.5 rounded-full"
                                    style={{ backgroundColor: CAT_COLORS.nose }}
                                    animate={{
                                        scale: isPurring ? [1, 1.1, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: isPurring ? Number.POSITIVE_INFINITY : 0,
                                    }}
                                />

                                {/* Mouth */}
                                <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                                    <div className="w-0.5 h-2 bg-gray-800 rounded-full" />
                                    <div className="absolute top-1 -left-1.5 w-3 h-0.5 border-b-2 border-gray-800 rounded-full" />
                                    <div className="absolute top-1 -right-1 w-3 h-0.5 border-b-2 border-gray-800 rounded-full" />
                                </div>

                                {/* Simple Whiskers */}
                                <div className="absolute top-12 left-1 w-8 h-0.5 bg-gray-600 rounded-full transform -rotate-12" />
                                <div className="absolute top-14 left-0 w-10 h-0.5 bg-gray-600 rounded-full transform -rotate-6" />
                                <div className="absolute top-12 right-1 w-8 h-0.5 bg-gray-600 rounded-full transform rotate-12" />
                                <div className="absolute top-14 right-0 w-10 h-0.5 bg-gray-600 rounded-full transform rotate-6" />
                            </div>

                            {/* Simple Tail */}
                            <motion.div
                                className="absolute bottom-8 right-8 w-4 h-16 rounded-full transform rotate-45 origin-bottom"
                                style={{ backgroundColor: CAT_COLORS.primary }}
                                animate={{
                                    rotate:
                                        catState === "sleeping"
                                            ? 35
                                            : catState === "playing"
                                                ? [45, 65, 45]
                                                : isBeingPetted
                                                    ? [45, 55, 45]
                                                    : [45, 50, 45],
                                }}
                                transition={{
                                    duration: catState === "sleeping" ? 0.5 : catState === "playing" ? 0.5 : isBeingPetted ? 1 : 3,
                                    repeat: catState === "sleeping" ? 0 : Number.POSITIVE_INFINITY,
                                }}
                            />

                            {/* Simple Paws */}
                            <div
                                className="absolute bottom-0 left-16 w-6 h-4 rounded-full"
                                style={{ backgroundColor: CAT_COLORS.primary }}
                            />
                            <div
                                className="absolute bottom-0 right-16 w-6 h-4 rounded-full"
                                style={{ backgroundColor: CAT_COLORS.primary }}
                            />
                        </motion.div>

                        {/* Yarn Ball */}
                        <AnimatePresence>
                            {showYarn && catState !== "sleeping" && (
                                <motion.div
                                    ref={yarnRef}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="absolute cursor-grab active:cursor-grabbing z-20"
                                    style={{
                                        left: yarnBall.x - 15,
                                        top: yarnBall.y - 15,
                                    }}
                                    onMouseDown={handleYarnMouseDown}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg relative overflow-hidden"
                                        animate={{
                                            rotate: yarnBall.isDragging ? [0, 360] : 0,
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: yarnBall.isDragging ? Number.POSITIVE_INFINITY : 0,
                                            ease: "linear",
                                        }}
                                    >
                                        {/* Yarn texture lines */}
                                        <div className="absolute inset-0">
                                            <div className="absolute top-1 left-1 w-6 h-0.5 bg-purple-300 rounded-full transform rotate-45" />
                                            <div className="absolute top-2 left-2 w-4 h-0.5 bg-pink-300 rounded-full transform -rotate-45" />
                                            <div className="absolute bottom-2 right-1 w-5 h-0.5 bg-purple-300 rounded-full transform rotate-12" />
                                            <div className="absolute bottom-1 left-2 w-3 h-0.5 bg-pink-300 rounded-full transform -rotate-12" />
                                        </div>

                                        {/* Sparkle effect when dragging */}
                                        <AnimatePresence>
                                            {yarnBall.isDragging && (
                                                <>
                                                    {[...Array(4)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="absolute text-yellow-300 text-xs"
                                                            style={{
                                                                left: `${20 + i * 15}%`,
                                                                top: `${20 + i * 15}%`,
                                                            }}
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{
                                                                opacity: [0, 1, 0],
                                                                scale: [0, 1.5, 0],
                                                                rotate: [0, 180, 360],
                                                            }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{
                                                                duration: 0.8,
                                                                repeat: Number.POSITIVE_INFINITY,
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

                                    {/* Yarn trail */}
                                    <motion.div
                                        className="absolute w-1 h-8 bg-gradient-to-b from-purple-400 to-transparent rounded-full"
                                        style={{
                                            left: "50%",
                                            top: "100%",
                                            transformOrigin: "top center",
                                            transform: `translateX(-50%) rotate(${
                                                Math.atan2(yarnBall.velocity.y, yarnBall.velocity.x) * (180 / Math.PI)
                                            }deg)`,
                                        }}
                                        animate={{
                                            scaleY: yarnBall.isDragging ? 2 : 1,
                                            opacity: yarnBall.isDragging ? 0.8 : 0.4,
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Sleep Z's */}
                        <AnimatePresence>
                            {catState === "sleeping" && (
                                <>
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={`z-${i}`}
                                            className="absolute text-purple-400 text-lg pointer-events-none font-bold"
                                            style={{
                                                left: `${60 + i * 8}%`,
                                                top: `${10 + i * 8}%`,
                                            }}
                                            initial={{ opacity: 0, scale: 0, y: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.2, 0],
                                                y: [-10, -30, -50],
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 3,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: i * 0.5,
                                            }}
                                        >
                                            Z
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>

                        {/* Touch points */}
                        <AnimatePresence>
                            {touchPoints.map((point) => (
                                <motion.div
                                    key={point.id}
                                    className="absolute pointer-events-none"
                                    style={{
                                        left: `${point.x}%`,
                                        top: `${point.y}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, 2, 0],
                                        opacity: [0, 0.8, 0],
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 2 }}
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-300 to-rose-300 blur-sm" />
                                    <div className="absolute inset-0 text-lg">✨</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Heart particles when being petted */}
                        <AnimatePresence>
                            {isBeingPetted && catState === "awake" && (
                                <>
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={`heart-${i}`}
                                            className="absolute text-pink-400 text-xl pointer-events-none"
                                            style={{
                                                left: `${40 + i * 10}%`,
                                                top: `${20 + i * 5}%`,
                                            }}
                                            initial={{ opacity: 0, scale: 0, y: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.5, 0],
                                                y: [-30, -60, -90],
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 2,
                                                delay: i * 0.3,
                                            }}
                                        >
                                            💕
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>

                        {/* Play sparkles when playing with yarn */}
                        <AnimatePresence>
                            {catState === "playing" && showYarn && (
                                <>
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={`play-${i}`}
                                            className="absolute text-yellow-400 text-lg pointer-events-none"
                                            style={{
                                                left: `${30 + i * 15}%`,
                                                top: `${15 + i * 10}%`,
                                            }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 1, 0],
                                                scale: [0, 1.3, 0],
                                                rotate: [0, 180, 360],
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: i * 0.3,
                                            }}
                                        >
                                            ⭐
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                >
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center shadow-lg border border-white/40">
                        <div className="text-lg font-semibold text-slate-800">{stats.totalPets}</div>
                        <div className="text-sm text-slate-600">Pets</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center shadow-lg border border-white/40">
                        <div className="text-lg font-semibold text-slate-800">{stats.totalSleeps}</div>
                        <div className="text-sm text-slate-600">Naps</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center shadow-lg border border-white/40">
                        <div className="text-lg font-semibold text-slate-800">{stats.yarnPlays}</div>
                        <div className="text-sm text-slate-600">Yarn</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center shadow-lg border border-white/40">
                        <div className="text-lg font-semibold text-slate-800">{formatTime(stats.sessionTime)}</div>
                        <div className="text-sm text-slate-600">Time</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center shadow-lg border border-white/40">
                        <div className="text-lg font-semibold text-slate-800">{Math.round(stats.happiness)}%</div>
                        <div className="text-sm text-slate-600">Happy</div>
                    </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40"
                >
                    <h3 className="text-lg font-light text-slate-800 mb-3 flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        {catState === "sleeping"
                            ? "Sleeping Cat"
                            : catState === "playing"
                                ? "Playing with Yarn"
                                : "How to Care for Your Cat"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        {catState === "sleeping" ? (
                            <>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">😴</div>
                                    <p className="font-medium">Peaceful Sleep</p>
                                    <p>Cat is resting for 10 seconds</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">👆</div>
                                    <p className="font-medium">Gentle Wake</p>
                                    <p>Tap to wake up early</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">😊</div>
                                    <p className="font-medium">Happy Dreams</p>
                                    <p>Sleep increases happiness</p>
                                </div>
                            </>
                        ) : catState === "playing" ? (
                            <>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🧶</div>
                                    <p className="font-medium">Drag Yarn</p>
                                    <p>Move the yarn ball around</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">👀</div>
                                    <p className="font-medium">Cat Follows</p>
                                    <p>Watch eyes track the yarn</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">⭐</div>
                                    <p className="font-medium">Playful Joy</p>
                                    <p>Play increases happiness</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">👆</div>
                                    <p className="font-medium">Pet</p>
                                    <p>Click or tap the cat</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🧶</div>
                                    <p className="font-medium">Play</p>
                                    <p>Show yarn ball for fun</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl mb-2">💤</div>
                                    <p className="font-medium">Sleep</p>
                                    <p>Let your cat take a 10s nap</p>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-center mt-8"
                >
                    <p className="text-slate-500 text-sm font-light max-w-md mx-auto">
                        {catState === "sleeping"
                            ? "Shhh... your cat is having sweet dreams. Rest is important for happiness! 💤"
                            : catState === "playing"
                                ? "Your cat is having so much fun with the yarn ball! Watch those eyes follow every movement! 🧶✨"
                                : "Take care of your virtual companion. Pet, play, and let them rest to keep them happy! 🐱💕"}
                    </p>
                </motion.div>
            </div>
        </div>
    )
}