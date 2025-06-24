'use client'

import { useState, useEffect } from "react"
import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User, Comment } from "@/lib/definitions"
import { generateAiComment } from "@/ai/flows/generate-ai-comment-flow"

const AI_CHEERER_ID = 'ai-cheerer';
// For demonstration, any post older than 1 hour without engagement gets a comment.
const AI_COMMENT_THRESHOLD_HOURS = 1;

export default function DashboardPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>(mockDiaryEntries);

  const updateAndStoreEntries = (updatedEntries: DiaryEntry[]) => {
    setEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
  };


  useEffect(() => {
    const storedEntriesStr = localStorage.getItem('diaryEntries');
    const initialEntries = storedEntriesStr ? JSON.parse(storedEntriesStr) : mockDiaryEntries;
    
    if (storedEntriesStr === null) {
      localStorage.setItem('diaryEntries', JSON.stringify(mockDiaryEntries));
    }
    
    setEntries(initialEntries);

    const addAutoComments = async () => {
      let currentEntries: DiaryEntry[] = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
      let entriesWereUpdated = false;
      const aiUser = mockUsers.find(u => u.id === AI_CHEERER_ID);

      if (!aiUser) return;
      
      const updatedEntries = [...currentEntries];

      for (let i = 0; i < updatedEntries.length; i++) {
        const entry = updatedEntries[i];
        const hasEngagement = entry.likes > 0 || entry.comments.length > 0;
        const hasAiComment = entry.comments.some((c: any) => c.userId === AI_CHEERER_ID);
        
        if (hasEngagement || hasAiComment) {
          continue;
        }

        const entryDate = new Date(entry.createdAt);
        const hoursDiff = (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > AI_COMMENT_THRESHOLD_HOURS) {
          try {
            const result = await generateAiComment({ diaryEntryContent: entry.content });
            
            if (result.comment) {
              const aiComment: Comment = {
                id: `ai-${entry.id}`,
                userId: AI_CHEERER_ID,
                nickname: aiUser.nickname,
                comment: result.comment,
                likes: 0,
              };
              updatedEntries[i].comments.push(aiComment);
              entriesWereUpdated = true;
            }
          } catch (error) {
            console.error("Failed to generate AI comment for entry:", entry.id, error);
          }
        }
      }

      if (entriesWereUpdated) {
        updateAndStoreEntries(updatedEntries);
      }
    };
    
    // Set a small timeout to avoid running this on very fast re-renders
    // and to allow the initial state to settle.
    const timer = setTimeout(() => {
      addAutoComments();
    }, 1000); // Wait 1 second before checking
    
    return () => clearTimeout(timer);

  }, []); // Run only on mount


  const handleComment = (entryId: string, newComment: Comment) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          comments: [...entry.comments, newComment],
        };
      }
      return entry;
    });
    updateAndStoreEntries(updatedEntries);
  };
  
  const handleLikeEntry = (entryId: string, action: 'like' | 'unlike') => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        const newLikes = action === 'like' ? entry.likes + 1 : Math.max(0, entry.likes - 1);
        return { ...entry, likes: newLikes };
      }
      return entry;
    });
    updateAndStoreEntries(updatedEntries);
  };

  const handleLikeComment = (entryId: string, commentId: string, action: 'like' | 'unlike') => {
    const newEntries = [...entries];
    const entryIndex = newEntries.findIndex(e => e.id === entryId);

    if (entryIndex > -1) {
      let alreadyUpdated = false;
      const newComments = newEntries[entryIndex].comments.map(comment => {
        if (comment.id === commentId && !alreadyUpdated) {
          alreadyUpdated = true;
          const newLikes = action === 'like' ? comment.likes + 1 : Math.max(0, comment.likes - 1);
          return { ...comment, likes: newLikes };
        }
        return comment;
      });

      const entryToUpdate = { ...newEntries[entryIndex], comments: newComments };
      newEntries[entryIndex] = entryToUpdate;
      updateAndStoreEntries(newEntries);
    }
  };

  const handleDeleteComment = (entryId: string, commentId: string) => {
    // Students cannot delete comments from this view.
    console.log("Delete action not permitted for students.");
  };


  // In a real app, you would fetch this data
  const publicEntries = entries.filter(entry => entry.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const findUserById = (userId: string): User | undefined => {
    return mockUsers.find(user => user.id === userId);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl font-headline">모두의 맘풍선</h1>
          <p className="text-muted-foreground">다른 친구들의 마음 이야기를 들어보세요.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {publicEntries.map(entry => (
          <DiaryCard 
            key={entry.id} 
            entry={entry} 
            author={findUserById(entry.userId)} 
            onComment={handleComment}
            onLikeEntry={handleLikeEntry}
            onLikeComment={handleLikeComment}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </div>
    </>
  )
}
