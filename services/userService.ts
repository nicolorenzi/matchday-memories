import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export interface UserData {
  id?: string;
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  following?: number;
  followers?: number;
  createdAt?: string;
}

export const createUser = async (userId: string, data: UserData): Promise<void> => {
  await setDoc(doc(db, "users", userId), {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const getUser = async (userId: string): Promise<UserData | null> => {
  const snapshot = await getDoc(doc(db, "users", userId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as UserData;
};

export const updateUser = async (userId: string, data: Partial<UserData>): Promise<void> => {
  await updateDoc(doc(db, "users", userId), { ...data });
};

export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};