import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { JournalEntry } from "../types/types";

export const createJournalEntry = async (entry: JournalEntry) => {
  const docRef = await addDoc(collection(db, "journalEntries"), entry);
  return docRef.id;
};

export const getJournalEntriesByUser = async (userId: string) => {
  const q = query(
    collection(db, "journalEntries"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};