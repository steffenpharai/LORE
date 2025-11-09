"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TokenBalance } from "@/components/lore/TokenBalance";
import { AuthorBadge } from "@/components/lore/AuthorBadge";
import { ProfileEditor } from "@/components/lore/ProfileEditor";
import { WalletButton } from "@/components/lore/WalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoreLine } from "@/components/lore/LoreLine";
import { useSignIn } from "@/hooks/use-sign-in";
import { ArrowLeft, Coins, FileText, TrendingUp, Award, Settings } from "lucide-react";
import Link from "next/link";

interface Contribution {
  id: string;
  content: string;
  lineNumber: number;
  story: {
    id: string;
    title?: string;
  };
  isApproved: boolean;
  votes: number;
  createdAt: string;
}

interface ProfileData {
  balance: number;
  pending: number;
  totalContributions: number;
  approvedContributions: number;
  totalVotes: number;
  badges: string[];
  contributions: Contribution[];
  bio?: string;
  theme?: string;
  customAvatarUrl?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const { isSignedIn, user, signIn } = useSignIn({ autoSignIn: true });

  useEffect(() => {
    if (isSignedIn && user) {
      fetchProfile();
    }
  }, [isSignedIn, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      const profileData = data.user;

      setProfile({
        balance: profileData.balance || 0,
        pending: profileData.pending || 0,
        totalContributions: profileData.totalContributions || 0,
        approvedContributions: profileData.approvedContributions || 0,
        totalVotes: profileData.totalVotes || 0,
        badges: profileData.badges || [],
        contributions: profileData.contributions || [],
        bio: profileData.bio,
        theme: profileData.theme,
        customAvatarUrl: profileData.customAvatarUrl,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!isSignedIn) {
      await signIn();
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch("/api/claim/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to claim");
      }

      // Refresh profile
      await fetchProfile();
    } catch (error) {
      console.error("Failed to claim:", error);
    } finally {
      setClaiming(false);
    }
  };

  const handleProfileUpdate = async (updates: { bio?: string; theme?: string; customAvatarUrl?: string }) => {
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    // Refresh profile
    await fetchProfile();
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-[--gray-400]">Please sign in to view your profile</p>
            <Button onClick={signIn} variant="glow">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[--background] flex items-center justify-center">
        <div className="animate-pulse text-[--gray-400]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--background]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-6">
            <AuthorBadge
              pfpUrl={user?.pfp_url || undefined}
              badges={profile.badges}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white font-[--font-space-grotesk]">
                  {user?.display_name || `@${user?.username}` || "User"}
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditorOpen(true)}
                  className="text-[--gray-400] hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[--gray-400]">@{user?.username || user?.fid}</p>
              {user?.custody_address && (
                <p className="text-xs text-[--gray-500] mt-1 font-mono">
                  {user.custody_address.slice(0, 6)}...{user.custody_address.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Wallet Connection</h3>
                  <p className="text-sm text-[--gray-400]">
                    Connect your wallet to claim $LORE tokens on-chain
                  </p>
                </div>
                <WalletButton variant="glow" size="lg" className="shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Balance */}
        <div className="mb-8">
          <TokenBalance
            balance={profile.balance}
            pending={profile.pending}
            showGlow={profile.pending > 0}
          />
          {profile.pending > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button
                variant="glow"
                size="lg"
                onClick={handleClaim}
                disabled={claiming}
                className="w-full"
              >
                <Coins className="mr-2 h-5 w-5" />
                {claiming ? "Claiming..." : `Claim ${profile.pending} $LORE`}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-[--base-blue]" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {profile.totalContributions}
                  </div>
                  <div className="text-sm text-[--gray-400]">Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-[--success]" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {profile.approvedContributions}
                  </div>
                  <div className="text-sm text-[--gray-400]">Approved</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-[--farcaster-purple]" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {profile.totalVotes}
                  </div>
                  <div className="text-sm text-[--gray-400]">Votes Cast</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contribution History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.contributions.length === 0 ? (
              <div className="text-center py-12 text-[--gray-400]">
                <p>No contributions yet. Start writing lore!</p>
                <Link href="/">
                  <Button variant="glow" className="mt-4">
                    Add Your First Line
                  </Button>
                </Link>
              </div>
            ) : (
              profile.contributions.map((contribution) => (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LoreLine
                    content={contribution.content}
                    lineNumber={contribution.lineNumber}
                    author={{
                      fid: typeof user?.fid === 'string' ? parseInt(user.fid, 10) : (user?.fid || 0),
                      username: user?.username || null,
                    }}
                    isApproved={contribution.isApproved}
                    votes={contribution.votes}
                  />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Editor Modal */}
      {user && (
        <ProfileEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          user={{
            fid: user.fid,
            username: user.username,
            display_name: user.display_name,
            pfp_url: user.pfp_url,
            bio: profile?.bio,
            theme: profile?.theme,
            customAvatarUrl: profile?.customAvatarUrl,
            badges: profile?.badges || [],
          }}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}


