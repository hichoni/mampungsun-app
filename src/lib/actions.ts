'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore'
import type { User, DiaryEntry, Comment } from '@/lib/definitions'
import { mockUsers, mockDiaryEntries } from './data'
import { randomUUID } from 'crypto'

function toJSON(obj: any) {
    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(toJSON);
    }
    if (obj !== null && typeof obj === 'object') {
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
    if (!db) return null;
    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        return toJSON({ id: userSnap.id, ...userData }) as User;
    }
    return null;
}

export async function getAllStudents(): Promise<User[]> {
    if (!db) return [];
    const q = query(collection(db, "users"), where("grade", ">", 0));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({id: doc.id, ...doc.data()}) as User);
}

export async function loginUser(grade: number, studentClass: number, studentId: number) {
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
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-diary');
}

export async function approveUser(id: string, isApproved: boolean) {
    if (!db) throw new Error("Firestore not configured");
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, { isApproved });
    revalidatePath('/teacher/dashboard');
}

export async function deleteUser(id: string) {
    if (!db) throw new Error("Firestore not configured");
    await deleteDoc(doc(db, "users", id));
    revalidatePath('/teacher/dashboard');
}

export async function addUser(studentData: Omit<User, 'id' | 'pin' | 'isApproved'>): Promise<User> {
    if (!db) throw new Error("Firestore not configured");
    const newUserRef = doc(collection(db, 'users'));
    const newUser: User = {
      id: newUserRef.id,
      ...studentData,
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      isApproved: true,
    };
    await setDoc(newUserRef, newUser);
    revalidatePath('/teacher/dashboard');
    return newUser;
}

// --- Diary Entry Actions ---

export async function getPublicEntries(): Promise<DiaryEntry[]> {
    if (!db) return [];
    const q = query(
        collection(db, "diaryEntries"), 
        where("isPublic", "==", true),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as DiaryEntry);
}

export async function getUserEntries(userId: string): Promise<DiaryEntry[]> {
    if (!db) return [];
    const q = query(
        collection(db, "diaryEntries"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as DiaryEntry);
}

export async function getAllEntries(): Promise<DiaryEntry[]> {
    if (!db) return [];
    const q = query(
        collection(db, "diaryEntries"), 
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => toJSON({ id: doc.id, ...doc.data() }) as DiaryEntry);
}

export async function addDiaryEntry(entryData: Omit<DiaryEntry, 'id' | 'createdAt' | 'likes' | 'comments' | 'likedBy'>) {
    if (!db) throw new Error("Firestore not configured");
    const newEntry = {
        ...entryData,
        createdAt: Timestamp.now(),
        likes: 0,
        likedBy: [],
        comments: [],
    };
    await addDoc(collection(db, "diaryEntries"), newEntry);
    revalidatePath('/dashboard/my-diary');
    revalidatePath('/dashboard');
}

export async function likeEntry(entryId: string, userId: string) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) throw new Error("Entry not found");
    
    const entry = entrySnap.data() as DiaryEntry;
    const likedBy = entry.likedBy || [];
    
    let newLikes;
    let newLikedBy;

    if (likedBy.includes(userId)) {
        // Unlike
        newLikes = Math.max(0, (entry.likes || 0) - 1);
        newLikedBy = likedBy.filter((id:string) => id !== userId);
    } else {
        // Like
        newLikes = (entry.likes || 0) + 1;
        newLikedBy = [...likedBy, userId];
    }
    
    await updateDoc(entryRef, { likes: newLikes, likedBy: newLikedBy });
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-diary');
}

export async function addComment(entryId: string, commentData: Omit<Comment, 'id' | 'createdAt'>, commenterId: string) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) throw new Error("Entry not found");
    const entry = entrySnap.data() as DiaryEntry;

    const newComment: Comment = {
        ...commentData,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        userId: commenterId,
    };

    const newComments = (entry.comments || []).map(c => ({...c, createdAt: new Date(c.createdAt as string).toISOString()}));

    await updateDoc(entryRef, {
        comments: [...newComments, newComment]
    });
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-diary');
}

export async function deleteComment(entryId: string, commentId: string) {
    if (!db) throw new Error("Firestore not configured");
    const entryRef = doc(db, "diaryEntries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) throw new Error("Entry not found");
    const entry = entrySnap.data() as DiaryEntry;

    const updatedComments = (entry.comments || []).filter(c => c.id !== commentId);
    
    await updateDoc(entryRef, { comments: updatedComments });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-diary');
    revalidatePath('/teacher/dashboard/content');
}

export async function deleteEntry(entryId: string) {
    if (!db) throw new Error("Firestore not configured");
    await deleteDoc(doc(db, "diaryEntries", entryId));
    revalidatePath('/teacher/dashboard/content');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/my-diary');
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
    const batch = writeBatch(db);

    // Check if users collection is empty to prevent duplicates
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(query(usersCollection));
    if (usersSnapshot.empty) {
        mockUsers.forEach(user => {
            const docRef = doc(usersCollection, user.id); // Use predefined ID
            batch.set(docRef, user);
        });
    }

    // Check if diaryEntries collection is empty
    const entriesCollection = collection(db, "diaryEntries");
    const entriesSnapshot = await getDocs(query(entriesCollection));
    if (entriesSnapshot.empty) {
        mockDiaryEntries.forEach(entry => {
            const { id, ...restOfEntry } = entry;
            const docRef = doc(entriesCollection, id); // Use predefined ID
            
            // Convert date strings to Timestamps
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
    }

    try {
        await batch.commit();
        revalidatePath('/teacher/dashboard');
        return { success: true, message: "데이터베이스가 샘플 데이터로 성공적으로 초기화되었습니다." };
    } catch (error) {
        console.error("Seeding failed: ", error);
        return { success: false, message: "데이터베이스 초기화 중 오류가 발생했습니다." };
    }
}
