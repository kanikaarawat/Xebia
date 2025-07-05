"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Heart, Wind, Coffee, Package, Sparkles, Cloud, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface MindMendHubProps {
    onCardClick?: (cardId: string) => void
}

export default function Component({ onCardClick }: MindMendHubProps = {}) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)

    const routeMap = {
        "video-library": null,
        "calm-cat": "/calm-cat",
        "guided-breathing": "/guided-breathing",
        "mindful-sipping": "/mindful-sipping",
        "worry-box": "/worry-box",
        "loud-thoughts": "/cloud-thoughts",
        "chatroom": "/chat-room",
    }

    const router = useRouter()

    const handleCardClick = (cardId: string) => {
        if (onCardClick) {
            onCardClick(cardId)
        } else {
            const route = routeMap[cardId as keyof typeof routeMap]
            if (route) {
                router.push(route)
            } else {
                console.warn(`No route found for card: ${cardId}`)
            }
        }
    }

    const cards = [
        {
            id: "video-library",
            title: "Video Library",
            description: "Calming nature sounds & visuals",
            icon: Play,
            gradient: "from-blue-100 to-green-100",
            hoverGradient: "from-blue-200 to-green-200",
            preview: "Rain on leaves, flowing streams...",
        },
        {
            id: "calm-cat",
            title: "Calm Cat",
            description: "Breathe and relax together",
            icon: Heart,
            gradient: "from-pink-100 to-orange-100",
            hoverGradient: "from-pink-200 to-orange-200",
            preview: "Purr... purr... breathe...",
        },
        {
            id: "guided-breathing",
            title: "Guided Breathing",
            description: "Breathe with me",
            icon: Wind,
            gradient: "from-cyan-100 to-blue-100",
            hoverGradient: "from-cyan-200 to-blue-200",
            preview: "Inhale... hold... exhale...",
        },
        {
            id: "mindful-sipping",
            title: "Mindful Sipping",
            description: "Focus on warmth & sensation",
            icon: Coffee,
            gradient: "from-amber-100 to-yellow-100",
            hoverGradient: "from-amber-200 to-yellow-200",
            preview: "Feel the warmth, taste the moment...",
        },
        {
            id: "worry-box",
            title: "Worry Box",
            description: "Send your worries away",
            icon: Package,
            gradient: "from-purple-100 to-pink-100",
            hoverGradient: "from-purple-200 to-pink-200",
            preview: "Let it go... whoosh...",
        },
        {
            id: "loud-thoughts",
            title: "Loud Thoughts",
            description: "Write it down, let it drift away",
            icon: Cloud,
            gradient: "from-slate-100 to-gray-100",
            hoverGradient: "from-slate-200 to-gray-200",
            preview: "Write... release... watch it float away...",
        },
        {
            id: "chatroom",
            title: "Safe Space Chat",
            description: "Connect with others who understand",
            icon: MessageCircle,
            gradient: "from-emerald-100 to-teal-100",
            hoverGradient: "from-emerald-200 to-teal-200",
            preview: "You're not alone... share, listen, heal...",
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Welcome Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4 font-rounded">
                        What does your mind need today?
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Take a moment to breathe, relax, and find your inner peace with these gentle activities.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, index) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                onHoverStart={() => setHoveredCard(card.id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className="relative"
                            >
                                <Card
                                    className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    <motion.div
                                        className={`absolute inset-0 bg-gradient-to-br ${
                                            hoveredCard === card.id ? card.hoverGradient : card.gradient
                                        } transition-all duration-300`}
                                        animate={{
                                            scale: hoveredCard === card.id ? 1.02 : 1,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <CardContent className="relative p-6 h-48 flex flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <motion.div
                                                animate={{
                                                    scale: hoveredCard === card.id ? 1.1 : 1,
                                                    rotate: hoveredCard === card.id ? 5 : 0,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md"
                                            >
                                                <Icon className="w-6 h-6 text-slate-600" />
                                            </motion.div>
                                            {card.id === "worry-box" && (
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.5, 1, 0.5],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                    }}
                                                >
                                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-slate-700 group-hover:text-slate-800 transition-colors">
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                                                {card.description}
                                            </p>
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: hoveredCard === card.id ? 1 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-xs text-slate-500 italic"
                                            >
                                                {card.preview}
                                            </motion.p>
                                        </div>

                                        {/* Special animations for specific cards */}
                                        {card.id === "calm-cat" && (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    ease: "easeInOut",
                                                }}
                                                className="absolute top-4 right-4 w-2 h-2 bg-pink-300 rounded-full opacity-60"
                                            />
                                        )}
                                        {card.id === "guided-breathing" && (
                                            <motion.div
                                                animate={{
                                                    scale: [0.8, 1.2, 0.8],
                                                    opacity: [0.3, 0.7, 0.3],
                                                }}
                                                transition={{
                                                    duration: 4,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    ease: "easeInOut",
                                                }}
                                                className="absolute bottom-4 right-4 w-8 h-8 border-2 border-cyan-300 rounded-full"
                                            />
                                        )}
                                        {card.id === "mindful-sipping" && (
                                            <motion.div
                                                animate={{
                                                    y: [-2, 2, -2],
                                                    opacity: [0.4, 0.8, 0.4],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    ease: "easeInOut",
                                                }}
                                                className="absolute top-6 right-8 w-1 h-4 bg-gradient-to-t from-transparent to-amber-300 rounded-full"
                                            />
                                        )}
                                        {card.id === "loud-thoughts" && (
                                            <>
                                                <motion.div
                                                    animate={{
                                                        x: [0, 20, 0],
                                                        opacity: [0.3, 0.6, 0.3],
                                                    }}
                                                    transition={{
                                                        duration: 6,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="absolute top-4 right-4 w-6 h-4 bg-white/60 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{
                                                        x: [10, -15, 10],
                                                        opacity: [0.2, 0.5, 0.2],
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                        delay: 2,
                                                    }}
                                                    className="absolute top-8 right-8 w-4 h-3 bg-white/40 rounded-full"
                                                />
                                            </>
                                        )}
                                        {card.id === "chatroom" && (
                                            <>
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        opacity: [0.4, 0.8, 0.4],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="absolute top-4 right-4 w-3 h-3 bg-emerald-300 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.3, 0.6, 0.3],
                                                    }}
                                                    transition={{
                                                        duration: 2.5,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                        delay: 1,
                                                    }}
                                                    className="absolute top-6 right-6 w-2 h-2 bg-teal-300 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.15, 1],
                                                        opacity: [0.2, 0.5, 0.2],
                                                    }}
                                                    transition={{
                                                        duration: 4,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                        delay: 0.5,
                                                    }}
                                                    className="absolute top-8 right-8 w-1.5 h-1.5 bg-emerald-400 rounded-full"
                                                />
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Footer Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="text-center mt-12"
                >
                    <p className="text-slate-500 text-sm">
                        Take your time. There's no rush. You're exactly where you need to be. 💚
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
