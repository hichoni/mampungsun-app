'use server'

import { revalidatePath } from 'next/cache'
import { db, auth } from '@/lib/firebase'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, deleteDoc, writeBatch, Timestamp, arrayUnion, arrayRemove, increment } from 'firebase/firestore'
import type { User, DiaryEntry, Comment, DiaryEntryAnalysisResult } from '@/lib/definitions'
import { mockUsers, mockDiaryEntries } from './data'
import { generateNickname } from '@/ai/flows/generate-nickname-flow'
import { signInAnonymously } from 'firebase/auth'

// Helper function to convert Firestore Timestamps to ISO strings
function toJSON(obj: any): any {
    if (obj && typeof obj.toDate === 'function') {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(toJSON);
    }
    if (obj !== null && typeof obj === 'object') {
        const res: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                res[key] = toJSON(obj[key]);
            }
        }
        return res;
    }
    return obj;
}

// Helper to revalidate paths where diary entries are displayed
async function revalidateDiaryPaths() {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-diary');
    revalidatePath('/teacher/dashboard/content');
}

// --- Auth Action ---
export async function getAnonymousSession(): Promise<{ success: boolean; error?: string }> {
    if (!auth) {
        return { success: false, error: "Firebase is not configured correctly. Please check your .env.local file." };
    }
    try {
        await signInAnonymously(auth);
        return { success: true };
    } catch (error: any) {
        console.error("Anonymous sign-in failed on server:", error);
        if (error.code === 'auth/configuration-not-found') {
            return { success: false, error: "익명 로그인이 Firebase 프로젝트에 설정되지 않았습니다. Firebase 콘솔 > Authentication > Sign-in method 에서 '익명' 제공업체를 활성화해주세요." };
        }
        return { success: false, error: "인증 서비스에 연결하지 못했습니다. Firebase 설정 또는 인터넷 연결을 확인해주세요." };
    }
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
        throw error; // Re-throw to be caught by the caller
    }
}

export async function getAllStudents(): Promise<User[]> {
    if (!db) return [];
    try {
        const q = query(collection(db, "users"));
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

export async function recordLogin(userId: string) {
    if (!db) throw new Error("Firestore not configured");
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        loginCount: increment(1),
        lastLoginAt: Timestamp.now(),
        loginHistory: arrayUnion(Timestamp.now())
    });
}

export async function updateUser(id: string, data: Partial<User>) {
    if (!db) throw new Error("Firestore not configured");
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, data);
    revalidatePath('/dashboard/profile');
    await revalidateDiaryPaths();
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

export async function addUser(studentData: Omit<User, 'id' | 'pin' | 'isApproved' | 'avatarUrl' | 'loginCount' | 'lastLoginAt' | 'loginHistory'>): Promise<User> {
    if (!db) throw new Error("Firestore not configured");
    const newUserRef = doc(collection(db, 'users'));
    const newUser: User = {
      id: newUserRef.id,
      ...studentData,
      pin: '0000',
      isApproved: true,
      loginCount: 0,
      loginHistory: [],
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

export async function addDiaryEntry(entryData: {userId: string, content: string, isPublic: boolean}) {
    if (!db) throw new Error("Firestore not configured");
    const newEntry = {
        ...entryData,
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        comments: [],
        isPinned: false,
        visitCount: 0,
        dominantEmotion: '분석 중...',
        suggestedResponses: [],
    };
    await addDoc(collection(db, "diaryEntries"), newEntry);
    await revalidateDiaryPaths();
}

export async function updateDiaryEntryAnalysis(entryId: string, analysisResult: DiaryEntryAnalysisResult) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    await updateDoc(entryRef, {
        dominantEmotion: analysisResult.dominantEmotion,
        suggestedResponses: analysisResult.suggestedResponses,
    });
    await revalidateDiaryPaths();
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
    
    await revalidateDiaryPaths();
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
    
    await revalidateDiaryPaths();
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

    await revalidateDiaryPaths();
}

export async function deleteEntry(entryId: string) {
    if (!db) throw new Error("Firestore not configured");
    await deleteDoc(doc(db, "diaryEntries", entryId));
    await revalidateDiaryPaths();
}

export async function pinEntry(entryId: string, isPinned: boolean) {
    if (!db) throw new Error("Firestore not configured");
    await updateDoc(doc(db, "diaryEntries", entryId), { isPinned });
    revalidatePath('/teacher/dashboard/content');
}

export async function incrementVisitCount(entryId: string) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    await updateDoc(entryRef, {
        visitCount: increment(1)
    });
    await revalidateDiaryPaths();
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
        const { lastLoginAt, loginHistory, ...restOfUser } = user;
        const firestoreUser = {
            ...restOfUser,
            lastLoginAt: user.lastLoginAt ? Timestamp.fromDate(new Date(user.lastLoginAt as string)) : null,
            loginHistory: (user.loginHistory || []).map(lh => Timestamp.fromDate(new Date(lh as string)))
        };
        batch.set(docRef, firestoreUser);
    });

    mockDiaryEntries.forEach(entry => {
        const { id, ...restOfEntry } = entry;
        const docRef = doc(entriesCollection, id);
        
        const firestoreEntry = {
            ...restOfEntry,
            createdAt: Timestamp.fromDate(new Date(entry.createdAt as string)),
            comments: (entry.comments || []).map(c => ({
                ...c,
                createdAt: c.createdAt ? Timestamp.fromDate(new Date(c.createdAt as string)) : Timestamp.now()
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
