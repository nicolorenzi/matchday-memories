import { createUser } from "@/services/userService";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../../FirebaseConfig";

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Signup Failed", "Passwords do not match.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert("Signup Failed", passwordError);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await createUser(uid, {
        name: "",
        username: "",
        bio: "",
        location: "",
        createdAt: new Date().toISOString(),
      });

      router.replace("/auth/user_info");
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
            autoCorrect={false}
            spellCheck={false}
            keyboardType="email-address"
            style={styles.input}
          />

          {/* Password */}
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="PASSWORD"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.passwordRow}>
            <TextInput
              placeholder="CONFIRM PASSWORD"
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(v => !v)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

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

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  passwordInput: {
    flex: 1,
    fontFamily: "BebasNeue-Regular",
    padding: 12,
    fontSize: 14,
    letterSpacing: 1,
    color: "#111",
  },

  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  eyeIcon: {
    fontSize: 16,
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