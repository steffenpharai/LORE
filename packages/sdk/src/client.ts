import type { User, Story, StoryLine, Vote, Claim } from './types';

export class LoreClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = '', token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl + endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyAuth(token: string): Promise<{ user: User }> {
    return this.fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async submitLine(content: string, storyId?: string): Promise<{ line: StoryLine }> {
    return this.fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ content, storyId }),
    });
  }

  async vote(lineId: string, amount: number): Promise<{ vote: Vote }> {
    return this.fetch('/api/vote', {
      method: 'POST',
      body: JSON.stringify({ lineId, amount }),
    });
  }

  async getStories(limit = 10, offset = 0): Promise<{ stories: Story[] }> {
    return this.fetch(`/api/stories?limit=${limit}&offset=${offset}`);
  }

  async cast(text: string): Promise<{ cast: { hash: string; text: string } }> {
    return this.fetch('/api/notifications/cast', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

