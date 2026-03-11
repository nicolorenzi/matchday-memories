// API types (Team, Competition, Match) live in footballService.ts
// User data lives in userService.ts

export interface JournalEntry {
  id?: string;
  userId: string;
  matchId: string;        // references Match.id from the API
  review: string;
  rating: number;         // 0–5 stars, 0.5 increments
  createdAt: string;
}

export interface List {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  matchIds: string[];     // references Match.id from the API
  isPublic?: boolean;
  createdAt: string;
}