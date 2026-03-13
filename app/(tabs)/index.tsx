// Users can: 
// - List of popular matches 
// - Recommended accounts to follow
// - Friend activity 

import React from "react";
import { Button, View } from "react-native";
import { createJournalEntry, getJournalEntriesByUser } from "../../services/journalService";

const MOCK_USER_ID = "demoUser123";

/**
 * Home screen component displaying popular matches and user activity.
 * Currently shows mock buttons for testing journal functionality.
 */
export default function HomeScreen() {
   // Handles adding a mock journal entry for testing purposes.
  const handleAdd = async () => {
    await createJournalEntry({
      userId: MOCK_USER_ID,
      matchId: "match1",
      review: "Last minute winner. Unreal.",
      rating: 4.5,
      createdAt: new Date().toISOString(),
    });
  };

  // Handles fetching and logging the user's journal entries.
  const handleFetch = async () => {
    await getJournalEntriesByUser(MOCK_USER_ID);
  };

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="Add Journal Entry" onPress={handleAdd} />
      <Button title="Fetch My Entries" onPress={handleFetch} />
    </View>
  );
}
