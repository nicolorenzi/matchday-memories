import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../../FirebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // RootLayout will redirect automatically
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navLogo}>Matchday Memories</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>LOGIN</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="EMAIL"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="PASSWORD"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/signup")}
          style={styles.signupLink}
        >
          <Text style={styles.signupText}>
            DON'T HAVE AN ACCOUNT? <Text style={styles.signupHighlight}>SIGN UP</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  navbar: { flexDirection: "row", justifyContent: "center", paddingVertical: 12 },
  navLogo: { fontFamily: "BebasNeue-Regular", fontSize: 22, letterSpacing: 2, color: "#3a7d3a" },
  container: { flex: 1, paddingHorizontal: 22, justifyContent: "center" },
  title: { fontFamily: "BebasNeue-Regular", fontSize: 26, letterSpacing: 2, color: "#111", marginBottom: 20 },
  card: { backgroundColor: "rgba(0,0,0,0.02)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.07)", padding: 18, gap: 14 },
  input: { fontFamily: "BebasNeue-Regular", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", borderRadius: 10, padding: 12, fontSize: 14, letterSpacing: 1, backgroundColor: "#fff" },
  loginButton: { backgroundColor: "#3a7d3a", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 4 },
  loginButtonText: { fontFamily: "BebasNeue-Regular", fontSize: 16, letterSpacing: 2, color: "#fff" },
  signupLink: { marginTop: 20, alignItems: "center" },
  signupText: { fontFamily: "BebasNeue-Regular", fontSize: 12, letterSpacing: 1, color: "rgba(0,0,0,0.5)" },
  signupHighlight: { color: "#3a7d3a" },
});