const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!;

export async function fetchYouTubeVideos(query: string) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${API_KEY}`
  );
  const data = await res.json();
  return data.items;
}
