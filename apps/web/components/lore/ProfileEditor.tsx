"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Palette, User, Sparkles, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    fid: string;
    username?: string;
    display_name?: string;
    pfp_url?: string;
    bio?: string;
    theme?: string;
    customAvatarUrl?: string;
    badges?: string[];
  };
  onSave: (updates: { bio?: string; theme?: string; customAvatarUrl?: string }) => Promise<void>;
}

const themes = [
  { id: "base-blue", name: "Base Blue", gradient: "from-[--base-blue] to-[--base-blue-light]" },
  { id: "farcaster-purple", name: "Farcaster Purple", gradient: "from-[--farcaster-purple] to-[--farcaster-purple-light]" },
  { id: "sunset", name: "Sunset", gradient: "from-orange-500 to-pink-500" },
  { id: "ocean", name: "Ocean", gradient: "from-cyan-500 to-blue-500" },
  { id: "forest", name: "Forest", gradient: "from-green-500 to-emerald-500" },
  { id: "custom", name: "Custom", gradient: "from-[--base-blue] to-[--farcaster-purple]" },
];

export function ProfileEditor({
  open,
  onOpenChange,
  user,
  onSave,
}: ProfileEditorProps) {
  const [bio, setBio] = useState(user.bio || "");
  const [theme, setTheme] = useState(user.theme || "base-blue");
  const [customAvatarUrl, setCustomAvatarUrl] = useState(user.customAvatarUrl || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setBio(user.bio || "");
      setTheme(user.theme || "base-blue");
      setCustomAvatarUrl(user.customAvatarUrl || "");
    }
  }, [open, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        bio: bio.trim() || undefined,
        theme: theme || undefined,
        customAvatarUrl: customAvatarUrl.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = customAvatarUrl || user.pfp_url || "";
  const bioLength = bio.length;
  const maxBioLength = 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customize Your Profile
          </DialogTitle>
          <DialogDescription>
            Express yourself! Customize your bio, theme, and avatar to stand out in the LORE MACHINE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[--gray-400] flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-[--gray-700]"
                />
              )}
              <div className="flex-1">
                <Input
                  placeholder="Custom avatar URL (optional)"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="bg-[--gray-800]"
                />
                <p className="text-xs text-[--gray-500] mt-1">
                  Leave empty to use your Base app profile picture
                </p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[--gray-400] flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Bio
            </label>
            <Textarea
              placeholder="Tell the community about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={maxBioLength}
              className="bg-[--gray-800] min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-[--gray-500]">
                Share your story, interests, or what brings you to LORE MACHINE
              </p>
              <p className={cn(
                "text-xs",
                bioLength > maxBioLength * 0.9 ? "text-yellow-500" : "text-[--gray-500]"
              )}>
                {bioLength}/{maxBioLength}
              </p>
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[--gray-400] flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all",
                    theme === t.id
                      ? "border-[--base-blue] bg-[--gray-800]"
                      : "border-[--gray-700] bg-[--gray-900] hover:border-[--gray-600]"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn(
                    "h-12 w-full rounded mb-2 bg-gradient-to-br",
                    t.gradient
                  )} />
                  <p className="text-xs text-white font-medium">{t.name}</p>
                  {theme === t.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="h-4 w-4 rounded-full bg-[--base-blue] flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Badges Showcase */}
          {user.badges && user.badges.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[--gray-400] flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Your Badges
              </label>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <Badge key={badge} variant="default" className="text-xs">
                    {badge.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="glow"
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

