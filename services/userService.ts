import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export interface UserData {
  id?: string;
  name?: string;
  username?: string;       // stored as typed, used for display
  usernameLower?: string;  // stored as lowercase, used only for uniqueness checks
  bio?: string;
  location?: string;
  profilePicture?: string;
  following?: number;
  followers?: number;
  createdAt?: string;
}

/**
 * Creates a new user document in the database.
 * @param userId - The Firebase Auth user ID.
 * @param data - The user data to store.
 */
export const createUser = async (userId: string, data: UserData): Promise<void> => {
  await setDoc(doc(db, "users", userId), {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

/**
 * Retrieves user data by user ID.
 * @param userId - The Firebase Auth user ID.
 * @returns User data object or null if not found.
 */
export const getUser = async (userId: string): Promise<UserData | null> => {
  const snapshot = await getDoc(doc(db, "users", userId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as UserData;
};

/**
 * Updates user data for an existing user.
 * @param userId - The Firebase Auth user ID.
 * @param data - Partial user data to update.
 */
export const updateUser = async (userId: string, data: Partial<UserData>): Promise<void> => {
  await updateDoc(doc(db, "users", userId), { ...data });
};

/**
 * Checks if a username is already taken by another user.
 * @param username - The username to check.
 * @returns True if the username is taken, false otherwise.
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const q = query(collection(db, "users"), where("usernameLower", "==", username.toLowerCase()));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};