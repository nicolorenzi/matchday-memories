import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { JournalEntry } from "../types/types";

/**
 * Creates a new journal entry in the database.
 * @param entry - The journal entry data to create.
 * @returns The ID of the created document.
 */
export const createJournalEntry = async (entry: JournalEntry) => {
  const docRef = await addDoc(collection(db, "journalEntries"), entry);
  return docRef.id;
};

/**
 * Retrieves all journal entries for a specific user, ordered by creation date descending.
 * @param userId - The ID of the user whose entries to fetch.
 * @returns Array of journal entries with document IDs.
 */
export const getJournalEntriesByUser = async (userId: string) => {
  const q = query(
    collection(db, "journalEntries"),
    where("userId", "==", userId), 
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};