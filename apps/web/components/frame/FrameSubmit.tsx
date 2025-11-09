"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { useSignIn } from "@/hooks/use-sign-in";
import { cn } from "@/lib/utils";

interface FrameSubmitProps {
  storyId?: string;
  onSubmit: (content: string, storyId?: string) => Promise<void>;
}

const MAX_LENGTH = 200;

export function FrameSubmit({ storyId, onSubmit }: FrameSubmitProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signIn, isSignedIn, isLoading: isAuthLoading } = useSignIn({ autoSignIn: true });

  const handleSubmit = async () => {
    if (!content.trim() || content.length > MAX_LENGTH) return;

    if (!isSignedIn) {
      await signIn();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content, storyId);
      setIsSuccess(true);
      setContent("");
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = content.length > MAX_LENGTH;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-[--base-blue] mx-auto" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Line Submitted!</h3>
              <p className="text-[--gray-400]">
                Your line is now awaiting community votes. You'll be notified when it's approved!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">Add Your Line</h2>
              <p className="text-sm text-[--gray-400] mb-4">
                Write the next line of crypto history. Keep it under {MAX_LENGTH} characters.
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Once upon a time in the metaverse..."
                maxLength={MAX_LENGTH}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting || isAuthLoading}
                aria-label="Lore line input"
                aria-describedby="char-count"
              />
              <div className="flex items-center justify-between text-xs">
                <span
                  id="char-count"
                  className={cn(
                    "text-[--gray-400]",
                    isOverLimit && "text-[--error]"
                  )}
                  aria-live="polite"
                >
                  {remainingChars} characters remaining
                </span>
                {isOverLimit && (
                  <span className="text-[--error]">
                    Exceeds limit by {content.length - MAX_LENGTH}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="glow"
              onClick={handleSubmit}
              disabled={!content.trim() || isOverLimit || isSubmitting || isAuthLoading || !isSignedIn}
              className="w-full"
              size="lg"
            >
              {isSubmitting || isAuthLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAuthLoading ? "Signing in..." : "Submitting..."}
                </>
              ) : !isSignedIn ? (
                "Sign in to Submit"
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Line
                </>
              )}
            </Button>

            {!isSignedIn && (
              <p className="text-xs text-center text-[--gray-400]">
                Quick Auth: No wallet needed. Sign in with your Farcaster account.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

