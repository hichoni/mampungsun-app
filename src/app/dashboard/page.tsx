'use client'

import { useState, useEffect } from "react"
import { DiaryCard } from "@/components/diary-card"
import { mockDiaryEntries, mockUsers } from "@/lib/data"
import type { DiaryEntry, User, Comment } from "@/lib/definitions"
import { generateAiComment } from "@/ai/flows/generate-ai-comment-flow"
import { generateWelcomeMessage } from "@/ai/flows/generate-welcome-message-flow"
import { Lightbulb } from "lucide-react"

const AI_CHEERER_ID = 'ai-cheerer';
// For demonstration, any post older than 1 hour without engagement gets a comment.
const AI_COMMENT_THRESHOLD_HOURS = 1;

export default function DashboardPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [isLoadingWelcome, setIsLoadingWelcome] = useState<boolean>(true);

  // Load entries from localStorage on mount and run AI checks
  useEffect(() => {
    // Fetch welcome message
    const fetchWelcomeMessage = async () => {
      setIsLoadingWelcome(true);
      try {
        const result = await generateWelcomeMessage();
        setWelcomeMessage(result.welcomeMessage || "친구들의 마음에 귀를 기울이고, 따뜻한 응원을 보내보세요!");
      } catch (error) {
        console.error("Failed to generate welcome message:", error);
        setWelcomeMessage("친구들의 마음에 귀를 기울이고, 따뜻한 응원을 보내보세요!"); // Fallback message
      } finally {
        setIsLoadingWelcome(false);
      }
    };
    
    const storedEntriesStr = localStorage.getItem('diaryEntries');
    let initialEntries = storedEntriesStr ? JSON.parse(storedEntriesStr) : mockDiaryEntries;

    if (storedEntriesStr === null) {
      localStorage.setItem('diaryEntries', JSON.stringify(mockDiaryEntries));
    }
    
    const addAutoComments = async () => {
      let entriesWereUpdated = false;
      const aiUser = mockUsers.find(u => u.id === AI_CHEERER_ID);
      if (!aiUser) return;

      const updatedEntriesPromises = initialEntries.map(async (entry: DiaryEntry) => {
        const newEntry = { ...entry, comments: [...entry.comments] };
        const hasEngagement = newEntry.likes > 0 || newEntry.comments.length > 0;
        const hasAiComment = newEntry.comments.some((c: any) => c.userId === AI_CHEERER_ID);
        
        if (hasEngagement || hasAiComment) return newEntry;

        const entryDate = new Date(newEntry.createdAt);
        const hoursDiff = (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > AI_COMMENT_THRESHOLD_HOURS) {
          try {
            const result = await generateAiComment({ diaryEntryContent: newEntry.content });
            if (result.comment) {
              const aiComment: Comment = {
                id: `ai-${newEntry.id}-${Date.now()}`,
                userId: AI_CHEERER_ID,
                nickname: aiUser.nickname,
                comment: result.comment,
                likes: 0,
              };
              newEntry.comments.push(aiComment);
              entriesWereUpdated = true;
            }
          } catch (error) {
            console.error("Failed to generate AI comment for entry:", newEntry.id, error);
          }
        }
        return newEntry;
      });

      const processedEntries = await Promise.all(updatedEntriesPromises);

      if (entriesWereUpdated) {
        setEntries(processedEntries);
        localStorage.setItem('diaryEntries', JSON.stringify(processedEntries));
      } else {
        setEntries(initialEntries);
      }
    };
    
    fetchWelcomeMessage();
    addAutoComments();
  }, []);


  const handleComment = (entryId: string, newComment: Comment) => {
    setEntries(currentEntries => {
      const newEntries = JSON.parse(JSON.stringify(currentEntries));
      const entryIndex = newEntries.findIndex((e: DiaryEntry) => e.id === entryId);
      if (entryIndex !== -1) {
        newEntries[entryIndex].comments.push(newComment);
        localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
        return newEntries;
      }
      return currentEntries;
    });
  };
  
  const handleLikeEntry = (entryId: string, action: 'like' | 'unlike') => {
    setEntries(currentEntries => {
      const updatedEntries = currentEntries.map(entry => {
        if (entry.id === entryId) {
          const newLikes = action === 'like' ? entry.likes + 1 : Math.max(0, entry.likes - 1);
          return { ...entry, likes: newLikes };
        }
        return entry;
      });
      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
      return updatedEntries;
    });
  };

  const handleLikeComment = (entryId: string, commentIndex: number, action: 'like' | 'unlike') => {
    setEntries(currentEntries => {
      const newEntries = JSON.parse(JSON.stringify(currentEntries));
      const entryIndex = newEntries.findIndex((e: DiaryEntry) => e.id === entryId);

      if (entryIndex === -1 || !newEntries[entryIndex].comments[commentIndex]) {
        return currentEntries;
      }
      
      const comment = newEntries[entryIndex].comments[commentIndex];
      comment.likes = action === 'like' ? comment.likes + 1 : Math.max(0, comment.likes - 1);
  
      localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
      return newEntries;
    });
  };

  const handleDeleteComment = (entryId: string, commentIndex: number) => {
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
      <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 mb-6 border border-primary/20">
        <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
        <div>
          <h1 className="text-lg font-semibold md:text-xl font-headline text-primary">모두의 맘풍선</h1>
          {isLoadingWelcome ? (
             <p className="text-muted-foreground animate-pulse">따뜻한 환영 인사를 준비 중이에요...</p>
          ) : (
            <p className="text-muted-foreground">{welcomeMessage}</p>
          )}
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
