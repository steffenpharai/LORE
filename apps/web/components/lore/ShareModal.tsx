"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId?: string;
  authorName?: string;
  balance?: number;
  badge?: string;
}

export function ShareModal({
  open,
  onOpenChange,
  storyId,
  authorName = "Author",
  balance = 0,
  badge,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Generate OG image URL
  const ogImageUrl = storyId
    ? `${window.location.origin}/api/og?storyId=${storyId}&authorName=${encodeURIComponent(authorName)}&balance=${balance}${badge ? `&badge=${encodeURIComponent(badge)}` : ""}`
    : "";

  // Generate share URL
  const shareLink = storyId
    ? `${window.location.origin}/story/${storyId}`
    : window.location.origin;

  // Pre-filled cast text
  const castText = badge
    ? `I just became a ${badge} on LORE MACHINE! 🎉

${storyId ? `Check out my contribution: ${shareLink}` : "Transform meme momentum into canonical community IP."}

Built on @base 🟦`

    : `I just became an Author of crypto history on LORE MACHINE! 🎉

${storyId ? `Check out my contribution: ${shareLink}` : "Transform meme momentum into canonical community IP."}

Built on @base 🟦`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LORE MACHINE",
          text: castText,
          url: shareLink,
        });
      } catch (error) {
        // User cancelled or error
        console.error("Share failed:", error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleCast = async () => {
    try {
      const res = await fetch("/api/notifications/cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          text: castText,
          embeds: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to cast");
      }

      // Close modal on success
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to cast:", error);
      // Fallback to copy on error
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
          <DialogDescription>
            Share your contribution to the LORE MACHINE with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* OG Image Preview */}
          {ogImageUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[--gray-400]">
                Preview Image
              </label>
              <div className="relative rounded-lg overflow-hidden border border-[--gray-800]">
                <img
                  src={ogImageUrl}
                  alt="Share preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[--gray-400]">
              Share Link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-[--gray-800]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={cn(
                  "shrink-0",
                  copied && "bg-[--success] border-[--success] text-white"
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Cast Text Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[--gray-400]">
              Cast Text (Pre-filled)
            </label>
            <div className="p-4 bg-[--gray-800] rounded-lg text-sm text-white whitespace-pre-wrap">
              {castText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="glow"
              onClick={handleCast}
              className="flex-1"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Cast to Feed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

