"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Video {
  id: number
  title: string | null
  description: string | null
  type: string | null
  url: string | null
  category: string | null
  created_at: string | null
}

const PAGE_SIZE = 8;

function VideoSkeleton() {
  return (
    <div className="animate-pulse bg-white/60 rounded-xl shadow-lg h-80 flex flex-col gap-4 p-4">
      <div className="bg-slate-200 h-48 w-full rounded-lg" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  );
}

function getYouTubeId(url: string): string | null {
  // Extracts the YouTube video ID from a URL
  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|(?:v|e(?:mbed)?|shorts)\/)|youtu\.be\/)([\w-]{11})/
  )
  return match ? match[1] : null
}

// Helper for truncating description
function truncate(str: string | null, n: number) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export default function VideoLibraryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string>("")
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState("")

  // Fetch all categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("selfhelp_video_library")
        .select("category")
        .neq("category", null)
      if (!error && data) {
        const cats = Array.from(new Set(data.map((v: any) => v.category).filter(Boolean)))
        setAllCategories(cats)
      }
    }
    fetchCategories()
  }, [])

  // Fetch videos for current page/category
  useEffect(() => {
    setLoading(true)
    setVideos([])
    setPage(1)
    setHasMore(true)
    const fetchVideos = async () => {
      let query = supabase
        .from("selfhelp_video_library")
        .select("id, title, description, url, category, created_at")
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1)
      if (category) query = query.eq("category", category)
      const { data, error } = await query
      if (!error && data) {
        setVideos(data.map((v: any) => ({ ...v, type: null })))
        setHasMore(data.length === PAGE_SIZE)
      }
      setLoading(false)
    }
    fetchVideos()
  }, [category])

  // Load more videos
  const loadMore = async () => {
    setLoading(true)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    let query = supabase
      .from("selfhelp_video_library")
      .select("id, title, description, url, category, created_at")
      .order("created_at", { ascending: false })
      .range(from, to)
    if (category) query = query.eq("category", category)
    const { data, error } = await query
    if (!error && data) {
      setVideos((prev) => [
        ...prev,
        ...data.map((v: any) => ({ ...v, type: null }))
      ])
      setHasMore(data.length === PAGE_SIZE)
      setPage((p) => p + 1)
    }
    setLoading(false)
  }

  // Filter videos by search
  const filteredVideos = videos.filter((video) => {
    const q = search.toLowerCase()
    return (
      (video.title?.toLowerCase().includes(q) || "") ||
      (video.description?.toLowerCase().includes(q) || "")
    )
  })

  // Helper to prettify titles (remove trailing numbers, capitalize)
  function prettifyTitle(title: string | null): string {
    if (!title) return ""
    // Remove trailing numbers and extra spaces
    let t = title.replace(/\s*\d+$/, "").trim()
    // Capitalize first letter of each word
    t = t.replace(/\b\w/g, (c) => c.toUpperCase())
    return t
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dreamy Layered Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-300 via-pink-300 to-orange-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-400/30 via-transparent to-pink-200/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-yellow-200/10" />
        {/* Floating atmospheric elements */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${60 + i * 15}px`,
              height: `${40 + i * 8}px`,
              left: `${(i * 8) % 100}%`,
              top: `${(i * 12) % 80}%`,
              background: `radial-gradient(ellipse, ${[
                "rgba(255,255,255,0.1)",
                "rgba(255,182,193,0.08)",
                "rgba(173,216,230,0.1)",
                "rgba(221,160,221,0.09)",
                "rgba(255,218,185,0.08)",
                "rgba(176,224,230,0.1)",
              ][i % 6]} 0%, transparent 70%)`,
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
      </div>
      <div className="relative z-10 max-w-4xl mx-auto py-16 px-2 md:px-8" >
        <motion.h1
          className="text-4xl font-bold text-center mb-4 text-slate-700 drop-shadow-lg "
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Calming Video Library
        </motion.h1>
        <motion.p
          className="text-center text-lg text-slate-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Relax with these curated videos to help calm your mind and mood.
        </motion.p>
        <motion.div
          className="flex flex-col md:flex-row gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="w-full md:w-64">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full md:w-80 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </motion.div>
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <VideoSkeleton key={i} />)}
          </div>
        )}
        {!loading && filteredVideos.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-6xl mb-4">🎬</span>
            <div className="text-center text-slate-500 text-lg">No videos available.<br />Check back soon for calming content!</div>
          </motion.div>
        )}
        {!loading && filteredVideos.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <AnimatePresence>
              {filteredVideos.map((video) => {
                const ytId = video.url ? getYouTubeId(video.url) : null
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, type: "spring" }}
                  >
                    <Card className="overflow-hidden border border-white/30 bg-white/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl group relative">
                      {/* Gradient accent bar */}
                      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 opacity-60 group-hover:opacity-90 transition-all duration-300" />
                      <CardContent className="p-4 flex flex-col gap-4">
                        {ytId ? (
                          <motion.div
                            className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-xl"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={video.title || "Calming Video"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-60 rounded-xl border-0"
                            />
                          </motion.div>
                        ) : (
                          <div className="bg-slate-200 text-slate-500 flex items-center justify-center h-60 rounded-xl">
                            Invalid YouTube URL
                          </div>
                        )}
                        <div className="pl-3">
                          <h2 className="text-xl font-semibold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors duration-300">{prettifyTitle(video.title)}</h2>
                          <p className="text-slate-600 mb-2 line-clamp-2" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'}}>{truncate(video.description, 120)}</p>
                          {video.category && (
                            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                              {video.category}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
        {!loading && hasMore && filteredVideos.length > 0 && (
          <motion.button
            onClick={loadMore}
            className="mt-8 mx-auto block bg-blue-200 hover:bg-blue-300 text-blue-800 font-semibold px-6 py-2 rounded-full shadow transition-all duration-300"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
          >
            Load More
          </motion.button>
        )}
      </div>
    </div>
  )
} 