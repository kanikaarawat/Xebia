import cohere from "cohere-ai";

cohere.init(process.env.COHERE_API_KEY!);

export async function generateYoutubeQueryFromMood(moodNotes: string) {
  const prompt = `Given this user's mood log: "${moodNotes}", suggest a short YouTube search query for videos that can help with their current state.`;

  const response = await cohere.generate({
    model: "command-r", // or 'command'
    prompt,
    max_tokens: 20,
    temperature: 0.7,
  });

  return response.body.generations[0]?.text.trim();
}
