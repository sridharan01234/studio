'use server';

/**
 * @fileOverview Generates a personalized love letter using AI.
 *
 * - generateLoveLetter - A function that generates the love letter.
 * - GenerateLoveLetterInput - The input type for the generateLoveLetter function.
 * - GenerateLoveLetterOutput - The return type for the generateLoveLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLoveLetterInputSchema = z.object({
  recipientName: z.string().describe('The name of the recipient.'),
  senderName: z.string().describe('The name of the sender.'),
  relationshipDetails: z
    .string()
    .describe(
      'Details about the relationship, including important memories, shared experiences, and inside jokes.'
    ),
  tone: z
    .enum(['romantic', 'humorous', 'passionate', 'sentimental'])
    .describe('The desired tone of the love letter.'),
});
export type GenerateLoveLetterInput = z.infer<typeof GenerateLoveLetterInputSchema>;

const GenerateLoveLetterOutputSchema = z.object({
  loveLetter: z.string().describe('The generated love letter.').optional(),
  error: z.string().describe('An error message if the generation failed.').optional(),
});
export type GenerateLoveLetterOutput = z.infer<typeof GenerateLoveLetterOutputSchema>;

// This is what the GENKIT FLOW returns internally on success
const FlowOutputSchema = z.object({
  loveLetter: z.string().describe('The generated love letter.'),
});

export async function generateLoveLetter(
  input: GenerateLoveLetterInput
): Promise<GenerateLoveLetterOutput> {
  // Check for OpenAI API key instead of Google API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('YOUR_')) {
    const errorMessage = "The OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file and restart the server.";
    console.error(errorMessage);
    return { error: errorMessage };
  }

  try {
    const result = await generateLoveLetterFlow(input);
     if (!result?.loveLetter) {
        throw new Error("The AI model returned an empty or invalid response. This can happen due to the content safety policy or a problem with the prompt.");
    }
    return { loveLetter: result.loveLetter };
  } catch (e: unknown) {
    // Log the detailed error to the server console for debugging.
    console.error("An error occurred in the generateLoveLetter flow:", e);

    // Provide a more helpful error to the client.
    let errorMessage = "Failed to generate love letter. An unknown error occurred.";
    if (e instanceof Error) {
        const message = e.message;
        if (message.includes('API_KEY_INVALID') || message.includes('permission denied') || message.includes('401')) {
            errorMessage = "Failed to generate love letter. Your OpenAI API key is likely invalid or missing required permissions.";
        } else if (message.includes('deadline') || message.includes('timeout')) {
            errorMessage = "Failed to generate love letter. The request timed out. Please try again.";
        } else {
             // Use the full error message from the thrown Error object.
            errorMessage = `Failed to generate love letter: ${message}`;
        }
    } else if (typeof e === 'string') {
        errorMessage = `Failed to generate love letter. Details: ${e.substring(0, 150)}`;
    }
    
    errorMessage += ' Please check the server logs for more information.';
    return { error: errorMessage };
  }
}

const generateLoveLetterFlow = ai.defineFlow(
  {
    name: 'generateLoveLetterFlow',
    inputSchema: GenerateLoveLetterInputSchema,
    outputSchema: FlowOutputSchema,
  },
  async input => {
    const result = await ai.generate({
      model: 'gpt-4o-mini',
      prompt: `You are a professional love letter writer. Please craft a personalized love letter with the following details:

Recipient's Name: ${input.recipientName}
Sender's Name: ${input.senderName}
Relationship Details: ${input.relationshipDetails}
Tone: ${input.tone}

Please ensure the letter is heartfelt, genuine, and reflects the provided relationship details and desired tone. The letter should be no more than 300 words.`,
      output: {
        schema: FlowOutputSchema,
      },
    });
    
    if (!result.output) {
      throw new Error("The AI model did not return a valid output. This may be due to a content safety policy or a problem with the prompt.");
    }
    return result.output;
  }
);
