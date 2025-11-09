"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoreLine } from "./LoreLine";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string, storyId?: string) => Promise<void>;
  storyId?: string;
  currentUser?: {
    fid: number;
    username: string | null;
  };
}

const MAX_LENGTH = 200;

export function ComposerModal({
  open,
  onOpenChange,
  onSubmit,
  storyId,
  currentUser,
}: ComposerModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content.length > MAX_LENGTH) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, storyId);
      setIsPending(true);
      setContent("");
      // Show pending state for 2 seconds
      setTimeout(() => {
        setIsPending(false);
        setIsSubmitting(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isPending) {
      setContent("");
      onOpenChange(false);
    }
  };

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = content.length > MAX_LENGTH;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]" aria-labelledby="composer-title" aria-describedby="composer-description">
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6 py-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mx-auto w-16 h-16 rounded-full border-4 border-[--base-blue] border-t-transparent"
                />
                <div>
                  <DialogTitle className="text-2xl mb-2">
                    Your line awaits the people's verdict
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Community members are now voting on your submission. You'll
                    be notified when it's approved!
                  </DialogDescription>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="composer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <DialogTitle id="composer-title">Add Your Line</DialogTitle>
                <DialogDescription id="composer-description">
                  Write the next line of crypto history. Keep it under {MAX_LENGTH}{" "}
                  characters.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Once upon a time in the metaverse..."
                    maxLength={MAX_LENGTH}
                    className="min-h-[120px] resize-none"
                    disabled={isSubmitting}
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

                {/* Live Preview */}
                {content.trim() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <p className="text-sm font-medium text-[--gray-400]">
                      Preview:
                    </p>
                    <Card className="border-[--gray-700]">
                      <CardContent className="p-4">
                        <LoreLine
                          content={content}
                          lineNumber={1}
                          author={
                            currentUser || {
                              fid: 0,
                              username: null,
                            }
                          }
                          isApproved={false}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="glow"
                    onClick={handleSubmit}
                    disabled={!content.trim() || isOverLimit || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Line
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

