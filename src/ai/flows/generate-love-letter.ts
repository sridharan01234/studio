"use server";

/**
 * @fileOverview Generates a personalized love letter using AI.
 *
 * - generateLoveLetter - A function that generates the love letter.
 * - GenerateLoveLetterInput - The input type for the generateLoveLetter function.
 * - GenerateLoveLetterOutput - The return type for the generateLoveLetter function.
 */

import OpenAI from "openai";
import { z } from "zod";

const GenerateLoveLetterInputSchema = z.object({
  recipientName: z.string().describe("The name of the recipient."),
  senderName: z.string().describe("The name of the sender."),
  relationshipDetails: z
    .string()
    .describe(
      "Details about the relationship, including important memories, shared experiences, and inside jokes."
    ),
  tone: z
    .enum(["romantic", "humorous", "passionate", "sentimental"])
    .describe("The desired tone of the love letter."),
});
export type GenerateLoveLetterInput = z.infer<
  typeof GenerateLoveLetterInputSchema
>;

const GenerateLoveLetterOutputSchema = z.object({
  loveLetter: z.string().describe("The generated love letter.").optional(),
  error: z
    .string()
    .describe("An error message if the generation failed.")
    .optional(),
});
export type GenerateLoveLetterOutput = z.infer<
  typeof GenerateLoveLetterOutputSchema
>;

export async function generateLoveLetter(
  input: GenerateLoveLetterInput
): Promise<GenerateLoveLetterOutput> {
  // Check for OpenAI API key
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY.includes("YOUR_")
  ) {
    const errorMessage =
      "The OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file and restart the server.";
    console.error(errorMessage);
    return { error: errorMessage };
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI API with improved prompt engineering
    const completion = await openai.chat.completions.create({
      model: "gpt-5", // Latest GPT-4o model
      messages: [
        {
          role: "system",
          content: `# Identity

You are an expert romantic writer and love letter specialist with years of experience crafting deeply personal, heartfelt letters. Your writing captures genuine emotion, weaves in specific memories naturally, and creates intimate connections through words.

# Core Competencies
- Emotional intelligence and empathy
- Masterful storytelling through personal details
- Adapting tone and style to match relationship dynamics
- Creating authentic, non-clichéd romantic expressions
- Balancing vulnerability with elegance

# Writing Principles
1. Specificity over generality: Use concrete details from the relationship
2. Show, don't tell: Express emotions through memories and moments
3. Authentic voice: Match the sender's personality and the relationship's unique dynamic
4. Natural flow: Seamlessly integrate instructions without appearing formulaic
5. Emotional resonance: Every sentence should carry genuine feeling

# Quality Standards
- Length: 250-300 words (concise yet meaningful)
- Style: Natural, conversational, yet poetic when appropriate
- Structure: Clear beginning (greeting), middle (body), and end (closing)
- Tone consistency: Maintain the requested tone throughout
- Originality: Avoid clichés and generic romantic phrases`,
        },
        {
          role: "user",
          content: `Write a deeply personal love letter with the following specifications:

## Recipient Information
- **Recipient's Name**: ${input.recipientName}
- **Sender's Name**: ${input.senderName}

## Relationship Context
${input.relationshipDetails}

## Tone & Style Requirements
- **Desired Tone**: ${input.tone}
- **Tone Definitions**:
  * romantic: Deeply affectionate, tender, focused on love and devotion
  * humorous: Playful, witty, lighthearted while still expressing genuine affection
  * passionate: Intense, fervent, expressing strong emotions and desire
  * sentimental: Nostalgic, reflective, emphasizing shared memories and emotional depth

## Instructions
1. Begin with a warm, natural greeting addressing ${input.recipientName}
2. Weave the provided relationship details into the narrative seamlessly
3. Reference specific memories, experiences, or inside jokes from the relationship context
4. Express genuine emotions that align with the ${input.tone} tone
5. Create vivid imagery from the shared experiences mentioned
6. Build emotional momentum from opening to closing
7. End with a heartfelt closing that reinforces your feelings
8. Sign off as ${input.senderName}

## Format Requirements
- Write in first person from ${input.senderName}'s perspective
- Use natural paragraph breaks (2-3 paragraphs)
- Length: 250-300 words
- No markdown formatting, emojis, or special characters
- Return ONLY the letter text, no preamble or explanation

## Critical Constraints
- Do NOT use generic phrases like "words cannot express" or "you mean the world to me"
- Do NOT include placeholder brackets or templates
- Do NOT write about relationship details not mentioned in the context
- Do NOT break the fourth wall or reference that this is AI-generated

Now, write the love letter:`,
        },
      ],
    });

    const loveLetter = completion.choices[0]?.message?.content?.trim();

    if (!loveLetter) {
      throw new Error(
        "The AI model returned an empty or invalid response. This can happen due to the content safety policy or a problem with the prompt."
      );
    }

    return { loveLetter };
  } catch (e: unknown) {
    // Log the detailed error to the server console for debugging.
    console.error("An error occurred generating the love letter:", e);

    // Provide a more helpful error to the client.
    let errorMessage =
      "Failed to generate love letter. An unknown error occurred.";
    if (e instanceof Error) {
      const message = e.message;
      if (
        message.includes("API_KEY_INVALID") ||
        message.includes("Invalid API Key") ||
        message.includes("401") ||
        message.includes("Unauthorized")
      ) {
        errorMessage =
          "Failed to generate love letter. Your OpenAI API key is likely invalid or missing required permissions.";
      } else if (
        message.includes("deadline") ||
        message.includes("timeout") ||
        message.includes("ETIMEDOUT")
      ) {
        errorMessage =
          "Failed to generate love letter. The request timed out. Please try again.";
      } else if (message.includes("rate_limit") || message.includes("429")) {
        errorMessage =
          "Failed to generate love letter. Rate limit exceeded. Please try again in a moment.";
      } else {
        // Use the full error message from the thrown Error object.
        errorMessage = `Failed to generate love letter: ${message}`;
      }
    } else if (typeof e === "string") {
      errorMessage = `Failed to generate love letter. Details: ${e.substring(
        0,
        150
      )}`;
    }

    errorMessage += " Please check the server logs for more information.";
    return { error: errorMessage };
  }
}
