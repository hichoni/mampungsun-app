'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, deleteDoc, writeBatch, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore'
import type { User, DiaryEntry, Comment } from '@/lib/definitions'
import { mockUsers, mockDiaryEntries } from './data'
import { generateNickname } from '@/ai/flows/generate-nickname-flow'

// Helper function to convert Firestore Timestamps to ISO strings
function toJSON(obj: any): any {
    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(toJSON);
    }
    if (obj !== null && typeof obj === 'object' && !obj.hasOwnProperty('_nanoseconds')) {
        const res: { [key: string]: any } = {};
        for (const key in obj) {
            res[key] = toJSON(obj[key]);
        }
        return res;
    }
    return obj;
}


// --- User Actions ---
export async function getUser(id: string): Promise<User | null> {
    if (!id || !db) return null;
    try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return toJSON({ id: userSnap.id, ...userSnap.data() }) as User;
        }
        return null;
    } catch (error) {
        console.error(`Error getting user ${id}:`, error);
        return null;
    }
}

export async function getAllStudents(): Promise<User[]> {
    if (!db) return [];
    try {
        // Teacher dashboard needs to see ALL students (approved or not), so we remove the isApproved filter.
        // The login page already filters for approved students on the client side.
        const q = query(collection(db, "users"), where("grade", ">=", 0));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => toJSON({id: doc.id, ...doc.data()}) as User);
    } catch (error) {
        console.error("Error getting all students:", error);
        return [];
    }
}

export async function loginUser(grade: number, studentClass: number, studentId: number): Promise<User | null> {
    if (!db) return null;
    const q = query(collection(db, "users"), 
        where("grade", "==", grade), 
        where("class", "==", studentClass),
        where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return toJSON({ id: userDoc.id, ...userDoc.data() }) as User;
    }
    return null;
}

export async function updateUser(id: string, data: Partial<User>) {
    if (!db) throw new Error("Firestore not configured");
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, data);
    revalidatePath('/', 'layout');
}

export async function approveUser(id: string, isApproved: boolean) {
    if (!db) throw new Error("Firestore not configured");
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, { isApproved });
    revalidatePath('/teacher/dashboard');
}

export async function resetStudentPin(id: string) {
    if (!db) throw new Error("Firestore not configured");
    await updateDoc(doc(db, "users", id), { pin: '0000' });
    revalidatePath('/teacher/dashboard');
}

export async function deleteUser(id: string) {
    if (!db) throw new Error("Firestore not configured");
    await deleteDoc(doc(db, "users", id));
    revalidatePath('/teacher/dashboard');
}

export async function addUser(studentData: Omit<User, 'id' | 'pin' | 'isApproved' | 'avatarUrl'>): Promise<User> {
    if (!db) throw new Error("Firestore not configured");
    const newUserRef = doc(collection(db, 'users'));
    const newUser: User = {
      id: newUserRef.id,
      ...studentData,
      pin: '0000', // Set initial PIN to 0000
      isApproved: true,
    };
    await setDoc(newUserRef, newUser);
    revalidatePath('/teacher/dashboard');
    return toJSON(newUser) as User;
}

// --- Diary Entry Actions ---

export async function getPublicEntries(): Promise<DiaryEntry[]> {
    if (!db) return [];
    const q = query(
        collection(db, "diaryEntries"), 
        where("isPublic", "==", true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as DiaryEntry);
}

export async function getUserEntries(userId: string): Promise<DiaryEntry[]> {
    if (!db) return [];
    const q = query(
        collection(db, "diaryEntries"), 
        where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as DiaryEntry);
}

export async function getAllEntries(): Promise<DiaryEntry[]> {
    if (!db) return [];
    const q = query(
        collection(db, "diaryEntries")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as DiaryEntry);
}

export async function addDiaryEntry(entryData: Omit<DiaryEntry, 'id' | 'createdAt' | 'likes' | 'comments' | 'likedBy' | 'isPinned'>) {
    if (!db) throw new Error("Firestore not configured");
    const newEntry = {
        ...entryData,
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        comments: [],
        isPinned: false,
    };
    await addDoc(collection(db, "diaryEntries"), newEntry);
    revalidatePath('/', 'layout');
}

export async function likeEntry(entryId: string, userId: string) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) throw new Error("Entry not found");
    
    const entryData = entrySnap.data();
    const likedBy = entryData.likedBy || [];
    
    if (likedBy.includes(userId)) {
        // Unlike
        await updateDoc(entryRef, {
             likes: Math.max(0, (entryData.likes || 0) - 1),
             likedBy: arrayRemove(userId)
        });
    } else {
        // Like
        await updateDoc(entryRef, {
            likes: (entryData.likes || 0) + 1,
            likedBy: arrayUnion(userId)
        });
    }
    
    revalidatePath('/', 'layout');
}

export async function addComment(entryId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);

    const newComment: Comment = {
        ...commentData,
        id: doc(collection(db, 'dummy')).id, // Generate a client-side safe random ID
        createdAt: Timestamp.now(),
    };
    
    await updateDoc(entryRef, {
        comments: arrayUnion(newComment)
    });
    
    revalidatePath('/', 'layout');
    return toJSON(newComment) as Comment;
}

export async function deleteComment(entryId: string, commentId: string) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) throw new Error("Entry not found");
    const entry = entrySnap.data() as DiaryEntry;

    const commentToDelete = (entry.comments || []).find(c => c.id === commentId);

    if (commentToDelete) {
        await updateDoc(entryRef, {
            comments: arrayRemove(commentToDelete)
        });
    }

    revalidatePath('/', 'layout');
}

export async function deleteEntry(entryId: string) {
    if (!db) throw new Error("Firestore not configured");
    await deleteDoc(doc(db, "diaryEntries", entryId));
    revalidatePath('/', 'layout');
}

export async function pinEntry(entryId: string, isPinned: boolean) {
    if (!db) throw new Error("Firestore not configured");
    await updateDoc(doc(db, "diaryEntries", entryId), { isPinned });
    revalidatePath('/teacher/dashboard/content');
}

// --- Seeding Action ---
export async function seedDatabase() {
    if (!db) {
        return { success: false, message: "Firestore is not configured. Please check your .env.local file." };
    }
    
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(query(usersCollection));
    const entriesCollection = collection(db, "diaryEntries");
    const entriesSnapshot = await getDocs(query(entriesCollection));

    if (!usersSnapshot.empty || !entriesSnapshot.empty) {
        return { success: false, message: "데이터베이스가 비어있지 않아 초기화를 진행하지 않았습니다. 기존 데이터를 삭제하고 다시 시도해주세요." };
    }

    const batch = writeBatch(db);

    mockUsers.forEach(user => {
        const docRef = doc(usersCollection, user.id);
        batch.set(docRef, user);
    });

    mockDiaryEntries.forEach(entry => {
        const { id, ...restOfEntry } = entry;
        const docRef = doc(entriesCollection, id);
        
        const firestoreEntry = {
            ...restOfEntry,
            createdAt: Timestamp.fromDate(new Date(entry.createdAt as string)),
            comments: (entry.comments || []).map(c => ({
                ...c,
                createdAt: Timestamp.fromDate(new Date(c.createdAt as string))
            }))
        };

        batch.set(docRef, firestoreEntry);
    });

    try {
        await batch.commit();
        revalidatePath('/', 'layout');
        return { success: true, message: "데이터베이스가 샘플 데이터로 성공적으로 초기화되었습니다." };
    } catch (error: any) {
        console.error("Seeding failed: ", error);
        return { success: false, message: `데이터베이스 초기화 중 오류가 발생했습니다: ${error.message}` };
    }
}

// --- Font Settings Actions ---

const DEFAULT_FONTS = {
    headline: 'Belleza',
    body: 'Alegreya',
};

export async function getFontSettings(): Promise<{headline: string; body: string}> {
    if (!db) return DEFAULT_FONTS;
    try {
        const settingsRef = doc(db, "settings", "global");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists() && settingsSnap.data().fonts) {
            return toJSON(settingsSnap.data().fonts);
        }
        return DEFAULT_FONTS;
    } catch (error) {
        console.error("Error getting font settings:", error);
        return DEFAULT_FONTS;
    }
}

export async function updateFontSettings(settings: {headline: string; body: string}) {
    if (!db) throw new Error("Firestore not configured");
    const settingsRef = doc(db, "settings", "global");
    await setDoc(settingsRef, { fonts: settings }, { merge: true });
    revalidatePath('/', 'layout');
}
