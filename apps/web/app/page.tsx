'use client';

import { useState, useEffect } from 'react';

interface Story {
  id: string;
  lineCount: number;
  totalVotes: number;
  lines: Array<{
    id: string;
    content: string;
    lineNumber: number;
    author: {
      fid: number;
      username: string | null;
    };
  }>;
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLine, setNewLine] = useState('');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories?limit=10');
      const data = await res.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newLine.trim()) return;

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, this would come from Farcaster auth
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storyId: selectedStory,
          content: newLine,
        }),
      });

      if (res.ok) {
        setNewLine('');
        fetchStories();
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            LORE MACHINE
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Decentralized collaborative lore generator
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Submit New Lore</h2>
          <div className="space-y-4">
            <select
              value={selectedStory || ''}
              onChange={(e) => setSelectedStory(e.target.value || null)}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">New Story</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  Story #{story.id.slice(0, 8)} ({story.lineCount} lines)
                </option>
              ))}
            </select>
            <textarea
              value={newLine}
              onChange={(e) => setNewLine(e.target.value)}
              placeholder="Write your line of lore..."
              maxLength={500}
              className="w-full p-3 border rounded-lg min-h-[100px] dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Submit Line
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Active Stories
          </h2>
          {stories.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-12">
              No stories yet. Be the first to create one!
            </p>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    Story #{story.id.slice(0, 8)}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {story.lineCount} lines • {story.totalVotes} votes
                  </div>
                </div>
                <div className="space-y-2">
                  {story.lines.map((line) => (
                    <div
                      key={line.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <p className="text-gray-800 dark:text-gray-200">
                        {line.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        — Line {line.lineNumber} by @{line.author.username || `fid:${line.author.fid}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
