
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Gift, Handshake, MessageSquare, Clock, Repeat, Heart, AlertTriangle } from 'lucide-react';
import { updateChecklistItem } from '@/services/instanceService';

type QuizAnswer = {
  text: string;
  type: string;
};

type QuizQuestion = {
  id?: string;
  title?: string;
  theme?: string;
  question: string;
  sampleAnswer?: string;
  answers: QuizAnswer[];
};

const defaultQuizQuestions: QuizQuestion[] = [
  {
    id: 'meaningful-moments',
    title: "Meaningful Moments",
    question: "It's more meaningful to me when...",
    answers: [
      { text: "My partner says 'I love you' and offers encouragement.", type: "Words of Affirmation" },
      { text: "We spend uninterrupted leisure time together, just the two of us.", type: "Quality Time" },
      { text: "I receive a thoughtful gift from my partner.", type: "Receiving Gifts" },
      { text: "My partner does something practical to help me out.", type: "Acts of Service" },
      { text: "My partner gives me a hug or we hold hands.", type: "Physical Touch" },
    ],
  },
  {
    id: 'feel-loved',
    title: "Feeling Loved",
    question: "I feel most loved when my partner...",
    answers: [
      { text: "Compliments my appearance or something I did.", type: "Words of Affirmation" },
      { text: "Takes the time to listen to me and understands my feelings.", type: "Quality Time" },
      { text: "Surprises me with a little something that shows they were thinking of me.", type: "Receiving Gifts" },
      { text: "Takes on a chore I dislike without me asking.", type: "Acts of Service" },
      { text: "Gives me a backrub or a massage.", type: "Physical Touch" },
    ],
  },
  {
    id: 'tender-triggers',
    title: "Tender Triggers",
    question: "What would hurt you the most?",
    answers: [
      { text: "Harsh or insulting comments from my partner.", type: "Words of Affirmation" },
      { text: "My partner canceling a date or being distracted when we're together.", type: "Quality Time" },
      { text: "A thoughtless or forgotten birthday gift.", type: "Receiving Gifts" },
      { text: "My partner not following through on promises.", type: "Acts of Service" },
      { text: "My partner going a long time without showing physical affection.", type: "Physical Touch" },
    ],
  },
  {
    id: 'feel-special',
    title: "Feeling Special",
    question: "I feel special when my partner...",
    answers: [
      { text: "Writes me a sweet note or sends a loving text.", type: "Words of Affirmation" },
      { text: "Plans a special trip or activity just for us.", type: "Quality Time" },
      { text: "Brings me my favorite snack or drink.", type: "Receiving Gifts" },
      { text: "Helps me with a project or difficult task.", type: "Acts of Service" },
      { text: "Sits close to me while we watch a movie.", type: "Physical Touch" },
    ],
  },
];

const loveLanguageIcons: { [key: string]: JSX.Element } = {
  "Words of Affirmation": <MessageSquare className="h-8 w-8 text-accent" />,
  "Quality Time": <Clock className="h-8 w-8 text-accent" />,
  "Receiving Gifts": <Gift className="h-8 w-8 text-accent" />,
  "Acts of Service": <Handshake className="h-8 w-8 text-accent" />,
  "Physical Touch": <Heart className="h-8 w-8 text-accent" />,
};


export default function InteractiveQuiz({ instanceId }: { instanceId: string }) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{ question: string; answer: string; loveLanguage: string }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([
    "Crafting questions that speak to your heart...",
    "Weaving insights from the five love languages...",
    "Preparing your personalized journey...",
  ]);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState("");
  const router = useRouter();

  // Load loading messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/loading-messages');
        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            setLoadingMessages(data.messages);
          }
        }
      } catch (error) {
        console.error('Failed to load loading messages:', error);
        // Keep default messages
      }
    };
    loadMessages();
  }, []);

  // Update loading message whenever loading state changes
  useEffect(() => {
    if (isLoadingQuestions || isLoadingNextQuestion) {
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setCurrentLoadingMessage(randomMessage);
    }
  }, [isLoadingQuestions, isLoadingNextQuestion, loadingMessages]);

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      setLoadError(null);
      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            questionCount: 5,
            previousAnswers: answeredQuestions.length > 0 ? answeredQuestions : undefined
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(errorBody || 'Failed to fetch questions');
        }

        const data = await response.json();
        const generatedQuestions: QuizQuestion[] | undefined = data?.questions;

        if (
          isMounted &&
          Array.isArray(generatedQuestions) &&
          generatedQuestions.length > 0
        ) {
          setQuizQuestions(generatedQuestions);
        } else if (isMounted) {
          // Fallback to default questions if generation fails
          setQuizQuestions(defaultQuizQuestions);
          setLoadError('Using fallback questions');
        }
      } catch (error) {
        console.error('Failed to load dynamic quiz questions', error);
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : 'Unknown error generating questions'
          );
          // Use default questions as fallback
          setQuizQuestions(defaultQuizQuestions);
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalQuestions = quizQuestions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  const handleNext = async () => {
    if (selectedAnswer) {
      const currentQuestion = quizQuestions[currentQuestionIndex];
      const selectedAnswerObj = currentQuestion.answers.find(a => a.type === selectedAnswer);
      
      // Track the answered question with context
      const newAnsweredQuestions = [
        ...answeredQuestions,
        {
          question: currentQuestion.question,
          answer: selectedAnswerObj?.text || selectedAnswer,
          loveLanguage: selectedAnswer,
        }
      ];
      setAnsweredQuestions(newAnsweredQuestions);
      
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (currentQuestionIndex < totalQuestions - 1) {
        // Generate next question based on previous answers
        setIsLoadingNextQuestion(true);
        try {
          const response = await fetch('/api/questions', {
            method: 'POST',
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              questionCount: 1,
              previousAnswers: newAnsweredQuestions,
              currentQuestionIndex: currentQuestionIndex + 1,
              totalQuestions: totalQuestions
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const nextQuestion: QuizQuestion[] | undefined = data?.questions;
            
            if (Array.isArray(nextQuestion) && nextQuestion.length > 0) {
              // Replace the upcoming question with the AI-generated contextual one
              const updatedQuestions = [...quizQuestions];
              updatedQuestions[currentQuestionIndex + 1] = nextQuestion[0];
              setQuizQuestions(updatedQuestions);
            }
          }
        } catch (error) {
          console.error('Failed to generate contextual next question:', error);
          // Continue with existing questions if generation fails
        } finally {
          setIsLoadingNextQuestion(false);
        }
        
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
        await updateChecklistItem(instanceId, 'quiz');
        router.refresh();
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setAnsweredQuestions([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setLoadError(null);
    setIsLoadingQuestions(true);
    
    // Reload questions from scratch
    window.location.reload();
  };
  
  const calculateResults = () => {
    const counts: {[key: string]: number} = {};
    // Note: answers state might not be updated yet when this is called in the same render cycle
    // as setShowResults(true), so we use the `newAnswers` from handleNext logic if we were to calculate
    // it there. Here, we can rely on the final answer being in selectedAnswer.
    const finalAnswers = [...answers, selectedAnswer].filter(Boolean) as string[];
    finalAnswers.forEach(answer => {
      counts[answer] = (counts[answer] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'Words of Affirmation');
  };


  if (showResults) {
    const result = calculateResults();
    const resultIcon = loveLanguageIcons[result] ?? (
      <Heart className="h-8 w-8 text-accent" />
    );
    return (
        <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader className="text-center">
                <Award className="mx-auto h-16 w-16 text-primary mb-4"/>
                <CardTitle className="font-headline text-3xl">Your Primary Love Language is:</CardTitle>
                <CardDescription className="font-headline text-4xl text-accent pt-2 flex items-center justify-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    {resultIcon}
                  </span>
                  <span>{result}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-lg text-muted-foreground">This is how you most naturally give and receive love. Understanding this can help you and your partner connect on a deeper level.</p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleRestart} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Repeat className="mr-2 h-4 w-4"/>
                    Take Again
                </Button>
            </CardFooter>
        </Card>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Show loading state while fetching questions
  if (isLoadingQuestions) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Preparing Your Quiz...</CardTitle>
          <CardDescription className="text-xl pt-2">
            {currentLoadingMessage || "Generating personalized questions just for you"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show loading state while generating next question
  if (isLoadingNextQuestion) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-full mb-4" />
          {currentLoadingMessage && (
            <p className="text-lg text-muted-foreground animate-pulse">
              {currentLoadingMessage}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Quiz Unavailable</CardTitle>
          <CardDescription>
            We couldn&apos;t load the quiz questions right now. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="font-headline text-3xl">Question {currentQuestionIndex + 1}</CardTitle>
        <CardDescription className="text-xl pt-2 flex items-start gap-2">
          {currentQuestion.question}
        </CardDescription>
        {currentQuestion.title && (
          <p className="text-sm text-muted-foreground pt-1">{currentQuestion.title}</p>
        )}
        {loadError && (
          <div className="pt-3 flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>{loadError}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <RadioGroup 
          onValueChange={setSelectedAnswer} 
          value={selectedAnswer || undefined} 
          className="space-y-4"
          key={currentQuestionIndex}
        >
          {currentQuestion.answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-2 p-4 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
              <RadioGroupItem value={answer.type} id={`q${currentQuestionIndex}-a${index}`} />
              <Label htmlFor={`q${currentQuestionIndex}-a${index}`} className="text-base flex-1 cursor-pointer">{answer.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleNext} 
          disabled={!selectedAnswer} 
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
