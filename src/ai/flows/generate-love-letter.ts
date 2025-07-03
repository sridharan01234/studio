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
  try {
    const result = await generateLoveLetterFlow(input);
    return { loveLetter: result.loveLetter };
  } catch (e: any) {
    console.error(`Error in generateLoveLetter flow: ${e.message}`, e);
    
    let errorMessage = "Failed to generate love letter due to an internal error.";
    if (e.message.includes('API key') || e.message.includes('permission')) {
        errorMessage = "Failed to generate love letter. Your Google AI API key is invalid or missing. Please check your .env file and restart the server.";
    }

    return { error: errorMessage };
  }
}

const prompt = ai.definePrompt({
  name: 'generateLoveLetterPrompt',
  input: {schema: GenerateLoveLetterInputSchema},
  output: {schema: FlowOutputSchema},
  prompt: `You are a professional love letter writer. Please craft a personalized love letter with the following details:

Recipient's Name: {{{recipientName}}}
Sender's Name: {{{senderName}}}
Relationship Details: {{{relationshipDetails}}}
Tone: {{{tone}}}

Please ensure the letter is heartfelt, genuine, and reflects the provided relationship details and desired tone. The letter should be no more than 300 words.`,
});

const generateLoveLetterFlow = ai.defineFlow(
  {
    name: 'generateLoveLetterFlow',
    inputSchema: GenerateLoveLetterInputSchema,
    outputSchema: FlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);