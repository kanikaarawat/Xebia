"use client";

import { useEffect, useState } from "react";
import { fetchYouTubeVideos } from "@/lib/youtubeClient";
import { supabase } from "@/lib/supabaseClient";

export default function PersonalizedVideos() {
  const [videos, setVideos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalizedVideos = async () => {
      // Step 1: Get latest mood note from Supabase
      const { data, error } = await supabase
        .from("mood_logs")
        .select("notes")
        .order("created_at", { ascending: false })
        .limit(1);

      const notes = data?.[0]?.notes || "I feel very anxious and overwhelmed";

      // Step 2: Use API route to generate a YouTube search query
      const queryResp = await fetch("/api/generate-youtube-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const { query } = await queryResp.json();

      // Step 3: Fetch videos using the generated query
      const vids = await fetchYouTubeVideos(query);
      setVideos(vids);
      setLoading(false);
    };

    fetchPersonalizedVideos();
  }, []);

  if (loading) return <p className="text-sm">Loading personalized recommendations...</p>;

  return (
    <div className="grid gap-4 mt-4">
      {videos.map((video) => (
        <div key={video.id.videoId}>
          <iframe
            width="100%"
            height="250"
            src={`https://www.youtube.com/embed/${video.id.videoId}`}
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <p className="mt-2 font-medium text-sm">{video.snippet.title}</p>
        </div>
      ))}
    </div>
  );
}
