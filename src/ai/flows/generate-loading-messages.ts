"use server";

/**
 * @fileOverview Generates engaging loading messages for the quiz experience.
 *
 * - generateLoadingMessages - Generates a set of warm, encouraging messages.
 */

import OpenAI from "openai";
import { z } from "zod";

const GenerateLoadingMessagesOutputSchema = z.object({
  messages: z
    .array(z.string().min(10).max(150))
    .min(15)
    .describe("Array of engaging loading messages including facts and encouragement"),
});

export type GenerateLoadingMessagesOutput = z.infer<
  typeof GenerateLoadingMessagesOutputSchema
>;

export async function generateLoadingMessages(): Promise<GenerateLoadingMessagesOutput> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) {
    // Return fallback messages if API key not configured
    return {
      messages: [
        "Crafting questions that speak to your heart...",
        "Did you know? Couples who understand each other's love language report 40% higher satisfaction.",
        "Weaving insights from the five love languages...",
        "Fun fact: Quality Time is the most common love language among millennials.",
        "Preparing your personalized journey...",
        "Discovering the language of your love...",
        "Did you know? Dr. Gary Chapman identified the 5 love languages in 1992.",
        "Creating meaningful moments of reflection...",
        "Interesting: Most people have a primary and secondary love language.",
        "Tailoring questions just for you...",
        "Building bridges to deeper understanding...",
        "Did you know? Your love language can evolve over time and life stages.",
        "Curating your unique love story...",
        "Gathering wisdom for your relationship...",
        "Fun fact: Physical Touch isn't just romantic—it includes all affectionate contact.",
      ],
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a creative writer for LunaLove, a relationship app. Generate warm, encouraging, and poetic loading messages that make users feel excited about discovering their love language. Respond with JSON format.`,
        },
        {
          role: "user",
          content: `Generate 20 unique, engaging loading messages for a love language quiz. Mix two types of messages:

1. Encouraging process messages (10 messages):
   - Tone: warm, encouraging, romantic, thoughtful
   - Style: Present continuous tense, like 'Crafting...' or 'Preparing...'
   - Length: 40-80 characters

2. "Did you know?" style facts (10 messages):
   - Start with "Did you know?", "Fun fact:", "Interesting:", or "Research shows:"
   - Share fascinating insights about love languages, relationships, or psychology
   - Tone: informative but warm and engaging
   - Length: 60-120 characters

Themes for both types:
- Discovery and self-awareness
- Connection and understanding
- Personalization
- Love languages (Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, Physical Touch)
- Relationship growth and research

Requirements:
- Avoid clichés and include variety
- Make facts accurate and interesting
- Balance the two message types

Return the response as a JSON object with this structure:
{
  "messages": [
    "Example: Weaving your unique love story...",
    "Example: Did you know? Most people have both a primary and secondary love language.",
    "...18 more messages alternating between types"
  ]
}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      throw new Error("AI returned empty response");
    }

    const parsed = JSON.parse(rawContent);
    const validated = GenerateLoadingMessagesOutputSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error("Failed to generate loading messages:", error);
    // Return fallback messages on error
    return {
      messages: [
        "Crafting questions that speak to your heart...",
        "Weaving insights from the five love languages...",
        "Preparing your personalized journey...",
        "Discovering the language of your love...",
        "Creating meaningful moments of reflection...",
        "Tailoring questions just for you...",
        "Building bridges to deeper understanding...",
        "Curating your unique love story...",
        "Gathering wisdom for your relationship...",
        "Preparing thoughtful prompts ahead...",
      ],
    };
  }
}
