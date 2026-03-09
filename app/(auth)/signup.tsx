import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../FirebaseConfig";

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name: "",
        username: "",
        bio: "",
        location: "",
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message);
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

        <Text style={styles.title}>SIGN UP</Text>

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

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            ALREADY HAVE AN ACCOUNT? <Text style={styles.loginHighlight}>LOGIN</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },

  navLogo: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
    letterSpacing: 2,
    color: "#3a7d3a",
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: "center",
  },

  title: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 26,
    letterSpacing: 2,
    color: "#111",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
    padding: 18,
    gap: 14,
  },

  input: {
    fontFamily: "BebasNeue-Regular",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    letterSpacing: 1,
    backgroundColor: "#fff",
  },

  signupButton: {
    backgroundColor: "#3a7d3a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },

  signupButtonText: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 16,
    letterSpacing: 2,
    color: "#fff",
  },

  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },

  loginText: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 12,
    letterSpacing: 1,
    color: "rgba(0,0,0,0.5)",
  },

  loginHighlight: {
    color: "#3a7d3a",
  },

});