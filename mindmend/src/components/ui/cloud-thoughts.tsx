"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Cloud, Wind, Sparkles, RotateCcw, Heart } from "lucide-react"
import Link from "next/link"

interface CloudThought {
  id: string
  text: string
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  color: string
  horizontalDrift: number
}

const CLOUD_COLORS = [
  {
    bg: "rgb(255, 255, 255)",
    border: "#667EEA",
    shadow: "rgba(102, 126, 234, 0.6)",
    accent: "#764BA2",
  },
  {
    bg: "rgb(252, 231, 243)",
    border: "#F093FB",
    shadow: "rgba(240, 147, 251, 0.6)",
    accent: "#F093FB",
  },
  {
    bg: "rgb(255, 245, 235)",
    border: "#FFECD2",
    shadow: "rgba(255, 236, 210, 0.6)",
    accent: "#FCB69F",
  },
  {
    bg: "rgb(240, 253, 244)",
    border: "#A8EDEA",
    shadow: "rgba(168, 237, 234, 0.6)",
    accent: "#A8EDEA",
  },
  {
    bg: "rgb(255, 240, 245)",
    border: "#FFB6C1",
    shadow: "rgba(255, 182, 193, 0.6)",
    accent: "#FFC0CB",
  },
  {
    bg: "rgb(245, 247, 250)",
    border: "#C3CEDA",
    shadow: "rgba(195, 206, 218, 0.6)",
    accent: "#A8B2C0",
  },
]

const ENCOURAGING_MESSAGES = [
  "Your mind feels lighter now, like a gentle breeze through clear skies ✨",
  "Notice how beautifully thoughts can float away, leaving space for peace 🌸",
  "Each thought you release creates more room for serenity and calm 🕊️",
  "You are the infinite sky, and thoughts are just passing clouds ☁️",
  "See how gracefully you can let go, like releasing balloons to the heavens 🎈",
]

// Enhanced OPAQUE Cloud Shape Component - Corner Positioned
const CloudShape = ({
  children,
  color,
  size = 1,
  className = "",
}: {
  children: React.ReactNode
  color: { bg: string; border: string; shadow: string; accent: string }
  size?: number
  className?: string
}) => (
  <div className={`relative ${className}`} style={{ transform: `scale(${size})` }}>
    {/* Outer Glow Effect - Enhanced for opaque clouds */}
    <div
      className="absolute inset-0 rounded-full blur-3xl opacity-60"
      style={{
        background: `radial-gradient(ellipse at center, ${color.shadow} 0%, ${color.accent}70 30%, transparent 70%)`,
        transform: "scale(1.4)",
      }}
    />

    {/* SVG Cloud Shape - OPAQUE and BIG */}
    <div className="relative w-[600px] h-[400px]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 600 400"
        className="absolute inset-0"
        style={{
          filter: `drop-shadow(0 15px 45px ${color.shadow}) drop-shadow(0 8px 25px ${color.shadow})`,
        }}
      >
        <defs>
          <linearGradient id={`cloudGradient-${color.border}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color.bg} />
            <stop offset="30%" stopColor={color.bg} />
            <stop offset="70%" stopColor={color.bg} />
            <stop offset="100%" stopColor={color.bg} />
          </linearGradient>

          <linearGradient id={`cloudAccent-${color.border}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.accent} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color.border} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color.accent} stopOpacity="0.2" />
          </linearGradient>

          <filter id={`cloudGlow-${color.border}`}>
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Cloud Body - OPAQUE Enhanced Shape */}
        <path
          d="M100 220 
             C70 220, 40 190, 40 160
             C40 120, 80 80, 120 90
             C140 50, 190 35, 240 55
             C280 20, 340 30, 380 70
             C430 30, 500 45, 530 90
             C570 70, 600 100, 590 140
             C610 170, 590 200, 560 210
             C550 250, 500 270, 450 260
             C420 280, 370 275, 330 265
             C300 280, 250 275, 200 260
             C170 275, 130 270, 110 250
             C90 260, 85 240, 100 220 Z"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="4"
          filter={`url(#cloudGlow-${color.border})`}
          opacity="1"
        />

        {/* Accent overlay for depth - OPAQUE */}
        <path
          d="M100 220 
             C70 220, 40 190, 40 160
             C40 120, 80 80, 120 90
             C140 50, 190 35, 240 55
             C280 20, 340 30, 380 70
             C430 30, 500 45, 530 90
             C570 70, 600 100, 590 140
             C610 170, 590 200, 560 210
             C550 250, 500 270, 450 260
             C420 280, 370 275, 330 265
             C300 280, 250 275, 200 260
             C170 275, 130 270, 110 250
             C90 260, 85 240, 100 220 Z"
          fill={`url(#cloudAccent-${color.border})`}
          opacity="0.6"
        />

        {/* Enhanced fluffy details - OPAQUE */}
        <circle
          cx="180"
          cy="130"
          r="45"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />
        <circle
          cx="280"
          cy="115"
          r="55"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />
        <circle
          cx="380"
          cy="135"
          r="50"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />
        <circle
          cx="460"
          cy="155"
          r="40"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />

        {/* Bottom fluffy bumps - OPAQUE */}
        <ellipse
          cx="220"
          cy="230"
          rx="60"
          ry="35"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />
        <ellipse
          cx="320"
          cy="240"
          rx="70"
          ry="32"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />
        <ellipse
          cx="420"
          cy="225"
          rx="55"
          ry="28"
          fill={color.bg}
          stroke={color.border}
          strokeWidth="3"
          opacity="1"
          filter={`url(#cloudGlow-${color.border})`}
        />
      </svg>

      {/* Enhanced Text Content - OPAQUE background */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center max-w-md px-6">
          <div
            className="text-2xl font-semibold leading-relaxed px-12 py-8 rounded-3xl border-3 shadow-2xl"
            style={{
              color: color.border,
              backgroundColor: "rgb(255,255,255)",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderColor: color.border,
              boxShadow: `0 12px 40px ${color.shadow}, 0 0 0 2px rgba(255,255,255,1)`,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Enhanced Animated Sparkle Effects */}
      <motion.div
        className="absolute top-12 right-16 w-6 h-6 rounded-full z-30"
        style={{ backgroundColor: color.accent }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 2, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-20 right-24 w-4 h-4 rounded-full z-30"
        style={{ backgroundColor: color.border }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1.6, 0],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-16 left-20 w-5 h-5 rounded-full z-30"
        style={{ backgroundColor: color.accent }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1.8, 0],
          rotate: [0, 270, 360],
        }}
        transition={{
          duration: 2.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full z-30"
          style={{
            backgroundColor: color.accent,
            left: `${15 + i * 10}%`,
            top: `${25 + (i % 4) * 12}%`,
          }}
          animate={{
            y: [-8, -20, -8],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  </div>
)

export default function CloudThoughts() {
  const [currentThought, setCurrentThought] = useState("")
  const [clouds, setClouds] = useState<CloudThought[]>([])
  const [cloudCount, setCloudCount] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [screenHeight, setScreenHeight] = useState(800)
  const [previewCloudColor, setPreviewCloudColor] = useState(CLOUD_COLORS[0])

  const audioContextRef = useRef<AudioContext | null>(null)
  const windSoundRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Change preview cloud color as user types
  useEffect(() => {
    if (currentThought.length > 0) {
      const colorIndex = currentThought.length % CLOUD_COLORS.length
      setPreviewCloudColor(CLOUD_COLORS[colorIndex])
    }
  }, [currentThought])

  // Get screen height for proper cloud animation
  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight)
    }

    updateScreenHeight()
    window.addEventListener("resize", updateScreenHeight)
    return () => window.removeEventListener("resize", updateScreenHeight)
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

  // Enhanced ambient wind sound
  const playWindSound = () => {
    if (!soundEnabled || !audioContextRef.current) return

    try {
      if (windSoundRef.current) {
        windSoundRef.current.stop()
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      const filter = audioContextRef.current.createBiquadFilter()

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.type = "sawtooth"
      oscillator.frequency.setValueAtTime(60, audioContextRef.current.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContextRef.current.currentTime + 4)

      filter.type = "lowpass"
      filter.frequency.setValueAtTime(180, audioContextRef.current.currentTime)
      filter.Q.setValueAtTime(1.5, audioContextRef.current.currentTime)

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.03, audioContextRef.current.currentTime + 0.8)
      gainNode.gain.linearRampToValueAtTime(0.015, audioContextRef.current.currentTime + 4)
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 8)

      windSoundRef.current = oscillator
      gainNodeRef.current = gainNode

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 8)
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  // Enhanced chime sound
  const playChimeSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;
    try {
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const duration = 1.5;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600; // a bit brighter
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2); // louder
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + duration - 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(ctx.currentTime);
      source.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const createCloud = (thought: string) => {
    const newCloud: CloudThought = {
      id: Math.random().toString(36).substr(2, 9),
      text: thought,
      x: 50, // Fixed position in top-left corner
      y: 50, // Fixed position in top-left corner
      size: Math.random() * 0.2 + 0.8, // Smaller size for corner positioning
      opacity: 1,
      speed: Math.random() * 2 + 4, // Slower for corner display
      color: previewCloudColor.bg,
      horizontalDrift: 0, // No drift for corner positioning
    }

    setClouds((prev) => [...prev, newCloud])
    setCloudCount((prev) => prev + 1)
    playWindSound()

    // Remove cloud after display time
    setTimeout(
      () => {
        setClouds((prev) => prev.filter((cloud) => cloud.id !== newCloud.id))
      },
      8000, // Display for 8 seconds in corner
    )

    if (cloudCount + 1 >= 3) {
      setTimeout(() => {
        setShowCompletion(true)
        playChimeSound()
      }, 4000)
    }
  }

  const handleSubmitThought = () => {
    if (currentThought.trim()) {
      createCloud(currentThought.trim())
      setCurrentThought("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitThought()
    }
  }

  const resetExercise = () => {
    setClouds([])
    setCloudCount(0)
    setShowCompletion(false)
    setCurrentThought("")
  }

  const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
  const previewCloudScale = Math.min(0.3 + (currentThought.length / 150) * 0.2, 0.5) // Smaller for corner

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Aesthetic Sky Background */}
      <div className="absolute inset-0">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-300 via-pink-300 to-orange-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-400/30 via-transparent to-pink-200/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-yellow-200/10" />

        {/* Floating atmospheric elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${60 + i * 15}px`,
              height: `${40 + i * 8}px`,
              left: `${(i * 8) % 100}%`,
              top: `${(i * 12) % 80}%`,
              background: `radial-gradient(ellipse, ${
                [
                  "rgba(255,255,255,0.1)",
                  "rgba(255,182,193,0.08)",
                  "rgba(173,216,230,0.1)",
                  "rgba(221,160,221,0.09)",
                  "rgba(255,218,185,0.08)",
                  "rgba(176,224,230,0.1)",
                ][i % 6]
              } 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}

        {/* Twinkling stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* CORNER CLOUDS - Top Left Position */}
      <div className="absolute top-0 left-0 pointer-events-none z-30">
        <AnimatePresence>
          {clouds.map((cloud) => {
            const cloudColor = CLOUD_COLORS.find((c) => c.bg === cloud.color) || CLOUD_COLORS[0]
            return (
              <motion.div
                key={cloud.id}
                initial={{
                  x: cloud.x,
                  y: cloud.y,
                  opacity: 0,
                  scale: 0.2,
                }}
                animate={{
                  x: cloud.x,
                  y: cloud.y,
                  opacity: 1,
                  scale: cloud.size,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.1,
                  transition: { duration: 1 },
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
                className="absolute"
                style={{ left: 0, top: 0 }}
              >
                <CloudShape color={cloudColor} size={cloud.size}>
                  {cloud.text}
                </CloudShape>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Preview Cloud - Top Left Corner */}
      <AnimatePresence>
        {currentThought.length > 0 && !showCompletion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{
              opacity: 0.7,
              scale: previewCloudScale,
              y: [0, -10, 0],
            }}
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{
              duration: 0.8,
              y: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
            className="absolute top-4 left-4 pointer-events-none z-20"
          >
            <CloudShape color={previewCloudColor} size={previewCloudScale}>
              {currentThought || "Your thought will appear here..."}
            </CloudShape>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
              <div className="bg-white/90 px-4 py-2 rounded-full border border-white/50 shadow-lg">
                <p className="text-sm text-slate-700 font-medium flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    ✨
                  </motion.div>
                  Forming in corner...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="text-8xl mb-6 filter drop-shadow-lg"
          >
            ☁️
          </motion.div>
          <motion.h1
            className="text-6xl font-light bg-gradient-to-r from-white via-pink-100 to-blue-100 bg-clip-text text-transparent mb-6 drop-shadow-2xl"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            Cloud Thoughts
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 max-w-lg leading-relaxed drop-shadow-lg font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Transform your thoughts into solid, opaque clouds that appear in the corner ✨
          </motion.p>
        </motion.div>

        {/* Enhanced Input Section */}
        {!showCompletion && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Cloud className="w-7 h-7 text-white/80" />
                </motion.div>
                <span className="text-white font-light text-xl">What's floating through your mind?</span>
                {currentThought.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="ml-auto">
                    <div className="flex items-center gap-2 text-sm text-white bg-white/20 px-4 py-2 rounded-full font-medium backdrop-blur-sm">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        ☁️
                      </motion.div>
                      Appearing in corner...
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="relative mb-6">
                <textarea
                  value={currentThought}
                  onChange={(e) => setCurrentThought(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Let your thoughts flow... watch them become solid, opaque clouds in the corner..."
                  className="w-full h-32 p-6 bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-white/50 text-slate-800 placeholder-slate-500 transition-all duration-500 shadow-inner text-lg font-light leading-relaxed"
                  maxLength={150}
                />
                <motion.div
                  initial={false}
                  animate={{
                    scale: isInputFocused ? 1.02 : 1,
                    opacity: isInputFocused ? 1 : 0.8,
                  }}
                  className="absolute -inset-1 bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-blue-400/30 rounded-2xl -z-10 blur-sm"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-white/80 font-light">
                  <span className="font-medium">{currentThought.length}/150</span> characters
                  {currentThought.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-3 text-pink-200 font-medium"
                    >
                      • Solid Cloud {Math.round((currentThought.length / 150) * 100)}% formed ✨
                    </motion.span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="ghost"
                    size="sm"
                    className={`${
                      soundEnabled
                        ? "text-white bg-white/20 hover:bg-white/30"
                        : "text-white/60 bg-white/10 hover:bg-white/20"
                    } rounded-full p-3 border border-white/30 backdrop-blur-sm transition-all duration-300`}
                  >
                    <Wind className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleSubmitThought}
                    disabled={!currentThought.trim()}
                    className="bg-gradient-to-r from-pink-400/80 via-purple-400/80 to-blue-400/80 hover:from-pink-500/90 hover:via-purple-500/90 hover:to-blue-500/90 text-white px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed border-0 font-medium text-lg backdrop-blur-sm"
                  >
                    <motion.span
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      Place in Corner ↖
                    </motion.span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Progress indicator */}
            {cloudCount > 0 && cloudCount < 5 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8">
                <div className="flex justify-center gap-4 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        i < cloudCount ? "bg-white shadow-lg shadow-white/50" : "bg-white/30"
                      }`}
                      animate={
                        i < cloudCount
                          ? {
                              scale: [1, 1.3, 1],
                              opacity: [0.8, 1, 0.8],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xl text-white font-light drop-shadow-lg mt-4">
                  {cloudCount < 5
                    ? 'Your thoughts are gently floating away.'
                    : 'Your thoughts are resting peacefully in the corner.'}
                </p>
              </motion.div>
            )}
            {/* Enhanced Real-time cloud status */}
            {cloudCount >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
                <div className="bg-white/15 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/20 shadow-xl">
                  <p className="text-lg text-white flex items-center justify-center gap-3 font-light">
                    <Heart className="w-5 h-5 text-pink-300" />
                    {cloudCount} opaque thought{cloudCount !== 1 ? "s" : ""} settled in corner
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      ✨
                    </motion.div>
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Enhanced Completion Message */}
        <AnimatePresence>
          {showCompletion && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-2xl text-center"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="text-9xl mb-8 filter drop-shadow-lg"
                >
                  🌤️
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-4xl font-light text-white mb-6 drop-shadow-lg"
                >
                  Your Corner is Peaceful
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-white/90 text-xl leading-relaxed mb-8 font-light max-w-lg mx-auto"
                >
                  {randomMessage}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-white/20"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Sparkles className="w-7 h-7 text-yellow-300" />
                    </motion.div>
                    <span className="text-xl font-light text-white">Reflection</span>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed font-light">
                    Notice how your thoughts have found a peaceful resting place in the corner, solid and contained.
                    This represents your ability to give thoughts a safe space without letting them overwhelm your
                    entire awareness.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center"
                >
                  <Button
                    onClick={resetExercise}
                    className="bg-gradient-to-r from-pink-400/80 via-purple-400/80 to-blue-400/80 hover:from-pink-500/90 hover:via-purple-500/90 hover:to-blue-500/90 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-0 font-medium text-lg backdrop-blur-sm"
                  >
                    <RotateCcw className="w-5 h-5 mr-3" />
                    Journey Again
                  </Button>
                  <Link href="/mindmend-hub" passHref legacyBehavior>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 font-medium text-lg backdrop-blur-sm"
                    >
                      <Heart className="w-5 h-5 mr-3" />
                      Carry This Peace
                    </Button>
                  </Link>
                </motion.div>
                <p className="mt-8 text-white/80 text-lg font-light">Take this sense of calm with you to the Mindmend Hub.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Footer - only show if no clouds and no input */}
        {(cloudCount === 0 && currentThought.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-white/70 text-lg font-light drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
              Begin typing to see your thoughts become solid, opaque clouds that settle in the corner
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}