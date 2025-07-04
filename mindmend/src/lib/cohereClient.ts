import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

function getVideoThemeByScore(moodScore?: number): string {
  if (typeof moodScore !== 'number') return '';
  if (moodScore <= 2) return 'dealing with difficult emotions, stress, or tough times';
  if (moodScore === 3) return 'coping strategies, general well-being, light workout, movement, and how to manage emotions';
  if (moodScore >= 4) return 'mindfulness, relaxation, and achieving inner peace';
  return '';
}

export async function generateYoutubeQueryFromMood(moodNotes: string, moodScore?: number) {
  let prompt = "";
  const theme = getVideoThemeByScore(moodScore);
  if (moodNotes && moodNotes.trim().length > 0) {
    prompt = `The user wrote the following mood log: "${moodNotes}" and their mood score is ${moodScore ?? 'unknown'}/5. Based on this, generate a single, short YouTube search query (just the keywords, no explanation, no numbering, no extra words) for videos related to mental health, mindfulness, or emotional well-being. The query should focus on ${theme || 'uplifting the user\'s mood and guiding them toward calmness, positivity, or self-reflection'}. Respond with only the search query, nothing else.`;
  } else if (typeof moodScore === 'number') {
    prompt = `The user's mood score is ${moodScore}/5. Based on this, generate a single, short YouTube search query (just the keywords, no explanation, no numbering, no extra words) for videos related to mental health, mindfulness, or emotional well-being. The query should focus on ${theme || 'uplifting the user\'s mood and guiding them toward calmness, positivity, or self-reflection'}. Respond with only the search query, nothing else.`;
  } else {
    prompt = `Generate a single, short YouTube search query (just the keywords, no explanation, no numbering, no extra words) for videos about mental health. Respond with only the search query, nothing else.`;
  }

  const response = await cohere.generate({
    model: "command",
    prompt,
    maxTokens: 100,
    temperature: 0.7,
  });

  let query = response.generations[0]?.text.trim();
  // Post-process to remove extra text
  const match = query.match(/["“](.+?)["”]/);
  if (match) {
    query = match[1];
  } else {
    query = query.split('\n')[0].split('.')[0];
  }
  return query;
}
