// Users can: 
// - List of popular matches 
// - Recommended accounts to follow
// - Friend activity 

import React from "react";
import { Button, View } from "react-native";
import { createJournalEntry, getJournalEntriesByUser } from "../../services/journalService";

const MOCK_USER_ID = "demoUser123";

export default function HomeScreen() {
  const handleAdd = async () => {
    await createJournalEntry({
      userId: MOCK_USER_ID,
      matchId: "match1",
      content: "Last minute winner. Unreal.",
      rating: 4.5,
      createdAt: new Date().toISOString(),
    });

    console.log("Entry added");
  };

  const handleFetch = async () => {
    const entries = await getJournalEntriesByUser(MOCK_USER_ID);
    console.log(entries);
  };

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="Add Journal Entry" onPress={handleAdd} />
      <Button title="Fetch My Entries" onPress={handleFetch} />
    </View>
  );
}
