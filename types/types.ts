export interface User {
    username: string;
    email: string;
    favoriteTeam: string;
    profilePicUrl?: string;
}

/* Check API for these structures
export interface Team {
    id?: string;
    name: string;
    logoUrl?: string;
}

export interface Competition {
    id?: string;
    name: string;
    logoUrl?: string;
    season?: string;
}
*/

export interface Match {
    id?: string;
    homeTeam: string;
    awayTeam: string;
    date: Date;
    venue: string;
    homeScore?: number;         
    awayScore?: number;
    // lineups: ; *Check API for lineups structure
    // competition: ; *Check API for competition structure
}

export interface JournalEntry {
    id?: string;
    userId: string;
    matchId: string;
    content: string;
    rating: number; // 0 - 5 stars, 0.5 increments
    // date: Date; *Need date and time
}

export interface MatchList {
    id?: string;
    userId: string;            
    title: string;              
    description?: string;      // optional description
    matchIds: string[];        // array of match IDs
    // date: Date; *Need date and time
    isPublic?: boolean;       
}