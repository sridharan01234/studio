import {genkit} from 'genkit';
import {openAI} from 'genkitx-openai';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Make sure the API key is available
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY environment variable is not set!');
  console.error('Make sure you have OPENAI_API_KEY in your .env.local file');
} else {
  console.log('OpenAI API key loaded successfully');
}

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: apiKey,
    })
  ],
});
