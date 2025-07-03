
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Award, Gift, Handshake, MessageSquare, Clock, Repeat, Heart } from 'lucide-react';
import { updateChecklistItem } from '@/services/instanceService';

const quizQuestions = [
  {
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const progress = (currentQuestionIndex / quizQuestions.length) * 100;

  const handleNext = () => {
    if (selectedAnswer) {
      const newAnswers = [...answers, selectedAnswer]
      setAnswers(newAnswers);
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
        updateChecklistItem(instanceId, 'quiz');
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResults(false);
  };
  
  const calculateResults = () => {
    const counts: {[key: string]: number} = {};
    // Note: answers state might not be updated yet when this is called in the same render cycle
    // as setShowResults(true), so we use the `newAnswers` from handleNext logic if we were to calculate
    // it there. Here, we can rely on the final answer being in selectedAnswer.
    const finalAnswers = [...answers, selectedAnswer];
    finalAnswers.forEach(answer => {
      if (answer) {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };


  if (showResults) {
    const result = calculateResults();
    return (
        <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader className="text-center">
                <Award className="mx-auto h-16 w-16 text-primary mb-4"/>
                <CardTitle className="font-headline text-3xl">Your Primary Love Language is:</CardTitle>
                <CardDescription className="font-headline text-4xl text-accent pt-2">{result}</CardDescription>
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="font-headline text-3xl">Question {currentQuestionIndex + 1}</CardTitle>
        <CardDescription className="text-xl pt-2">{currentQuestion.question}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer || undefined} className="space-y-4">
          {currentQuestion.answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-2 p-4 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
              <RadioGroupItem value={answer.type} id={`q${currentQuestionIndex}-a${index}`} />
              <Label htmlFor={`q${currentQuestionIndex}-a${index}`} className="text-base flex-1 cursor-pointer">{answer.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} disabled={!selectedAnswer} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
