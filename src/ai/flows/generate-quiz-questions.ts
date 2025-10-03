"use server";

/**
 * @fileOverview Dynamically generates love language-inspired quiz questions using AI.
 *
 * - generateLoveLanguageQuizQuestions - Main entry point to produce quiz question sets.
 * - GenerateLoveLanguageQuizQuestionsInput - Input parameters for generation.
 * - GenerateLoveLanguageQuizQuestionsOutput - Output schema containing generated questions.
 */

import OpenAI from "openai";
import { z } from "zod";

const loveLanguageTypes = [
  "Words of Affirmation",
  "Quality Time",
  "Receiving Gifts",
  "Acts of Service",
  "Physical Touch",
] as const;

type LoveLanguageType = (typeof loveLanguageTypes)[number];

const defaultFocusAreas = [
  "communication",
  "emotional resilience",
  "daily rituals",
  "growth mindset",
  "support networks",
];

const GenerateLoveLanguageQuizQuestionsInputSchema = z
  .object({
    relationshipContext: z
      .string()
      .max(1_500)
      .optional()
      .describe(
        "Optional background details about the couple to personalize question framing."
      ),
    focusAreas: z
      .array(z.string().min(2))
      .min(1)
      .max(8)
      .optional()
      .describe(
        "High-level themes (beyond love languages) to weave into the question prompts."
      ),
    questionCount: z
      .number()
      .int()
      .min(1)
      .max(12)
      .optional()
      .describe("Number of quiz questions to generate. Defaults to 5."),
    temperature: z
      .number()
      .min(0)
      .max(2)
      .optional()
      .describe("Optional creative temperature override for the AI model."),
    previousAnswers: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
          loveLanguage: z.string(),
        })
      )
      .optional()
      .describe("Previous answers from the user to inform contextual follow-up questions."),
    currentQuestionIndex: z
      .number()
      .optional()
      .describe("Current question index in the quiz flow."),
    totalQuestions: z
      .number()
      .optional()
      .describe("Total number of questions in the quiz."),
  })
  .optional();

export type GenerateLoveLanguageQuizQuestionsInput = z.infer<
  typeof GenerateLoveLanguageQuizQuestionsInputSchema
>;

const FollowUpSchema = z.object({
  condition: z
    .string()
    .min(3)
    .describe(
      "Short description of when to surface this follow-up (e.g., selected love languages)."
    ),
  question: z
    .string()
    .min(10)
    .describe("Adaptive follow-up prompt tied to the selected response."),
});

const InteractiveElementSchema = z.object({
  type: z
    .string()
    .min(3)
    .describe("Type of interactive enhancement such as rating_scale or scenario_picker."),
  label: z.string().min(3).describe("User-facing label for the interactive element."),
  description: z
    .string()
    .optional()
    .describe("Optional helper text explaining how to use the element."),
  options: z
    .array(z.string())
    .optional()
    .describe("Optional list of choices when the element requires predefined options."),
  scale: z
    .object({
      min: z.number(),
      max: z.number(),
      anchors: z.record(z.string()).optional(),
    })
    .optional()
    .describe("Optional scale definition for rating-based elements."),
});

const GeneratedAnswerSchema = z.object({
  text: z
    .string()
    .min(10)
    .describe("Rich description of the answer option presented to the user."),
  type: z
    .enum(loveLanguageTypes)
    .describe("The love language that best aligns with this answer option."),
});

const GeneratedQuestionSchema = z
  .object({
    id: z
      .string()
      .min(3)
      .describe("Stable identifier for the question (kebab-case preferred)."),
    title: z
      .string()
      .min(3)
      .describe("Short, engaging title summarizing the question focus."),
    theme: z
      .string()
      .min(3)
      .describe("Theme or domain the question explores beyond the love language alignment."),
    question: z
      .string()
      .min(10)
      .describe("Full text of the question shown to the couple."),
    sampleAnswer: z
      .string()
      .min(15)
      .describe("Concise sample answer that models thoughtful reflection."),
    answers: z
      .array(GeneratedAnswerSchema)
      .length(loveLanguageTypes.length)
      .describe("Exactly five answer options, one per love language."),
    interactiveElement: InteractiveElementSchema.describe(
      "Interactive mechanic that boosts engagement for this question."
    ),
    followUps: z
      .array(FollowUpSchema)
      .min(2)
      .describe(
        "Adaptive follow-up prompts that branch based on the user's chosen answers."
      ),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<LoveLanguageType>();
    for (const answer of value.answers) {
      if (seen.has(answer.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["answers"],
          message: `Duplicate love language detected: ${answer.type}`,
        });
      }
      seen.add(answer.type);
    }
    if (seen.size !== loveLanguageTypes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answers"],
        message: "Each love language must be represented exactly once across answers.",
      });
    }
  });

const GenerateLoveLanguageQuizQuestionsOutputSchema = z.object({
  generatedAt: z
    .string()
    .describe("ISO timestamp representing when the questions were generated."),
  model: z
    .string()
    .describe("The model identifier used for generation."),
  questions: z
    .array(GeneratedQuestionSchema)
    .min(1)
    .describe("List of generated quiz questions."),
});

export type GenerateLoveLanguageQuizQuestionsOutput = z.infer<
  typeof GenerateLoveLanguageQuizQuestionsOutputSchema
>;

export async function generateLoveLanguageQuizQuestions(
  input?: GenerateLoveLanguageQuizQuestionsInput
): Promise<GenerateLoveLanguageQuizQuestionsOutput> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("YOUR_")) {
    const errorMessage =
      "The OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file and restart the server.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const parsedInput = GenerateLoveLanguageQuizQuestionsInputSchema.parse(input);
  const questionCount = parsedInput?.questionCount ?? 5;
  const focusAreas = parsedInput?.focusAreas?.length
    ? parsedInput.focusAreas
    : defaultFocusAreas;
  const relationshipContext = parsedInput?.relationshipContext ?? "";
  const temperature = parsedInput?.temperature;
  const previousAnswers = parsedInput?.previousAnswers ?? [];
  const currentQuestionIndex = parsedInput?.currentQuestionIndex;
  const totalQuestions = parsedInput?.totalQuestions;

  // Build context from previous answers
  let answerContext = "";
  if (previousAnswers.length > 0) {
    answerContext = `\n\nPrevious answers from this user:\n${previousAnswers
      .map(
        (a, idx) =>
          `${idx + 1}. Q: "${a.question}"\n   A: "${a.answer}" (Love Language: ${a.loveLanguage})`
      )
      .join("\n")}\n\nUse this information to craft follow-up questions that explore their preferences deeper and reveal nuances in their love language profile.`;
  }

  const progressContext =
    currentQuestionIndex !== undefined && totalQuestions
      ? `\n\nThis is question ${currentQuestionIndex + 1} of ${totalQuestions}. ${
          currentQuestionIndex === 0
            ? "Start with foundational questions."
            : currentQuestionIndex < totalQuestions - 2
            ? "Build on previous answers to explore their love language preferences more deeply."
            : "This is near the end - ask questions that help finalize their love language profile."
        }`
      : "";

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are LunaLove, an empathetic relationship coach skilled at crafting thoughtful, inclusive prompts for couples. You blend the five love languages with interpersonal, psychological, and lifestyle themes. When provided with previous answers, use them to create more personalized and contextually relevant follow-up questions. Always respond with valid JSON matching the provided schema.`,
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              instruction: `Generate dynamic multiple-choice questions for a love language quiz.${answerContext}${progressContext}`,
              requirements: {
                questionCount,
                loveLanguages: [
                  "Words of Affirmation",
                  "Quality Time",
                  "Receiving Gifts",
                  "Acts of Service",
                  "Physical Touch"
                ],
                focusAreas,
                relationshipContext,
                tone: "warm, encouraging, inclusive, modern",
                creativityHint: temperature
                  ? `Calibrate creativity to a temperature of ${temperature} on a scale of 0-2.`
                  : undefined,
                interactiveElements: "At least three distinct element types across the full set",
                perQuestionRequirements: {
                  answers: "Exactly five answer objects, each with 'text' (string) and 'type' (single love language string)",
                  followUps: "At least two, with clear branching conditions tied to selected responses",
                  sampleAnswer: "One concise example response modelling depth and vulnerability",
                },
                exampleQuestion: {
                  id: "emotional-support-preferences",
                  title: "Comfort & Connection",
                  theme: "Emotional support preferences",
                  question: "When you're feeling down, what helps you feel most supported?",
                  sampleAnswer: "I appreciate when my partner sits with me quietly, not trying to fix things, just being present.",
                  answers: [
                    { 
                      text: "Hearing words of encouragement and validation from my partner", 
                      type: "Words of Affirmation" 
                    },
                    { 
                      text: "Having my partner set aside everything to spend focused time with me", 
                      type: "Quality Time" 
                    },
                    { 
                      text: "Receiving a small comfort gift that shows they were thinking of me", 
                      type: "Receiving Gifts" 
                    },
                    { 
                      text: "My partner taking care of tasks so I can rest and recover", 
                      type: "Acts of Service" 
                    },
                    { 
                      text: "Physical closeness like a long hug or sitting together", 
                      type: "Physical Touch" 
                    }
                  ],
                  interactiveElement: {
                    type: "rating_scale",
                    label: "How often do you currently receive this type of support?",
                    description: "Rate from 1 (rarely) to 5 (very often)",
                    scale: {
                      min: 1,
                      max: 5,
                      anchors: {
                        "1": "Rarely",
                        "3": "Sometimes",
                        "5": "Very Often"
                      }
                    }
                  },
                  followUps: [
                    {
                      condition: "If user rates support frequency low (1-2)",
                      question: "What's one small way you could invite more of this support into your relationship?"
                    },
                    {
                      condition: "If user rates support frequency high (4-5)",
                      question: "How does receiving this support regularly impact your relationship dynamic?"
                    }
                  ]
                },
                criticalNote: "The 'type' field in each answer MUST be a single string value, NOT an array. Choose exactly one love language per answer.",
                outputFormat: {
                  description: "Return a JSON object with these exact top-level fields:",
                  requiredFields: {
                    generatedAt: "ISO 8601 timestamp string (e.g., '2025-03-10T14:30:00Z')",
                    model: "The model name used (e.g., 'gpt-5-mini')",
                    questions: "Array of question objects following the example structure above"
                  },
                  exampleOutput: {
                    generatedAt: "2025-03-10T14:30:00.000Z",
                    model: "gpt-5-mini",
                    questions: [
                      "...array of question objects as shown in exampleQuestion..."
                    ]
                  }
                }
              },
            },
            null,
            2
          ),
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      throw new Error("AI model returned an empty response");
    }

    const parsed = JSON.parse(rawContent);
    const validated = GenerateLoveLanguageQuizQuestionsOutputSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error("Failed to generate love language quiz questions:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Generated response failed validation: ${error.errors
          .map((issue) => issue.message)
          .join("; ")}`
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate love language quiz questions due to an unknown error.");
  }
}
