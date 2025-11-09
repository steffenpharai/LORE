export interface User {
  id: string;
  fid: number;
  username?: string;
  lorePoints: number;
}

export interface Story {
  id: string;
  title?: string;
  lineCount: number;
  totalVotes: number;
  isComplete: boolean;
  nftTokenId?: number;
  lines: StoryLine[];
}

export interface StoryLine {
  id: string;
  storyId: string;
  content: string;
  lineNumber: number;
  voteCount: number;
  isApproved: boolean;
  author: {
    fid: number;
    username?: string;
  };
}

export interface Vote {
  id: string;
  lineId: string;
  amount: number;
}

export interface Claim {
  id: string;
  amount: number;
  merkleRoot?: string;
  proof: string[];
  isClaimed: boolean;
  txHash?: string;
}

