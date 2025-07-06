import { useEffect, useState } from "react";

export function PersonalizedVideos({ userId }: { userId: string }) {
  const [videos, setVideos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchPersonalizedVideos = async () => {
      setLoading(true);
      setError(null);
      // 1. Get latest mood note from Supabase
      const res = await fetch(`/api/mood-insights/history?userId=${userId}`);
      const { moods } = await res.json();
      const notes = moods?.[0]?.notes || "I feel very anxious and overwhelmed";
      // 2. Use API route to generate a YouTube search query
      const queryResp = await fetch("/api/generate-youtube-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const { query } = await queryResp.json();
      // 3. Fetch videos using YouTube Data API (or your own endpoint)
      const ytResp = await fetch(`/api/youtube-search?query=${encodeURIComponent(query)}`);
      if (!ytResp.ok) {
        setError("Could not fetch videos");
        setLoading(false);
        return;
      }
      const { videos: ytVideos } = await ytResp.json();
      setVideos(ytVideos);
      setLoading(false);
    };
    fetchPersonalizedVideos();
  }, [userId]);

  if (loading) return <div className="text-blue-600 text-center py-6">Loading personalized videos...</div>;
  if (error) return <div className="text-red-600 text-center py-6">{error}</div>;
  if (!videos.length) return <div className="text-slate-500 text-center py-6">No recommendations found for your mood.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      {videos.slice(0, 4).map((video) => (
        <div key={video.id.videoId} className="rounded-xl overflow-hidden bg-white/70 shadow hover:shadow-lg transition-all duration-300">
          <iframe
            width="100%"
            height="220"
            src={`https://www.youtube.com/embed/${video.id.videoId}`}
            frameBorder="0"
            allowFullScreen
            className="w-full h-56 rounded-t-xl"
          ></iframe>
          <div className="p-3">
            <p className="font-medium text-blue-800 text-base mb-1 line-clamp-2">{video.snippet.title}</p>
            <p className="text-xs text-slate-600 line-clamp-2">{video.snippet.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 