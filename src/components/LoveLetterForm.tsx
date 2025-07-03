"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateLoveLetter } from "@/ai/flows/generate-love-letter";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader, Sparkles } from "lucide-react";

const formSchema = z.object({
  recipientName: z.string().min(1, "Recipient's name is required."),
  senderName: z.string().min(1, "Your name is required."),
  relationshipDetails: z.string().min(10, "Please provide some details about your relationship."),
  tone: z.enum(['romantic', 'humorous', 'passionate', 'sentimental']),
});

export default function LoveLetterForm() {
  const [loveLetter, setLoveLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientName: "",
      senderName: "",
      relationshipDetails: "",
      tone: "romantic",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLoveLetter("");
    try {
      const result = await generateLoveLetter(values);
      setLoveLetter(result.loveLetter);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate love letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Your Love Story</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-lg">Recipient's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Luna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline text-lg">Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="relationshipDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-lg">Relationship Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share some sweet memories, inside jokes, or things you love about them..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the more personal the letter will be.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-lg">Tone of the Letter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="romantic">Romantic</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                        <SelectItem value="passionate">Passionate</SelectItem>
                        <SelectItem value="sentimental">Sentimental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                {isLoading ? (
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                {isLoading ? "Crafting Your Letter..." : "Generate Love Letter"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loveLetter && (
        <Card className="mt-12 shadow-lg border-2 border-primary/50 animate-in fade-in-50 duration-1000">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-center text-primary">Your Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose-lg max-w-none text-gray-700 whitespace-pre-wrap p-4 bg-primary/5 rounded-lg">
                <p>{loveLetter}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
