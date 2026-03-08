import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../../FirebaseConfig";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.07)",
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: { fontFamily: "BebasNeue-Regular", fontSize: 14, letterSpacing: 1, color: "#3a7d3a" },
  title: { fontFamily: "BebasNeue-Regular", fontSize: 20, letterSpacing: 2, color: "#111" },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 32 },
  logoutButton: {
    borderWidth: 1,
    borderColor: "rgba(200,0,0,0.25)",
    backgroundColor: "rgba(200,0,0,0.04)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutText: { fontFamily: "BebasNeue-Regular", fontSize: 16, letterSpacing: 2, color: "#c00" },
});