import { auth } from '@/FirebaseConfig';
import { isUsernameTaken, updateUser } from '@/services/userService';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserInfoScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const handleUsernameChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9_.]/g, '');
    setUsername(cleaned);
    setUsernameError(null);
  };

  const checkUsername = async () => {
    if (!username) return;
    setUsernameChecking(true);
    const taken = await isUsernameTaken(username.toLowerCase());
    setUsernameChecking(false);
    if (taken) setUsernameError('Username is already taken.');
  };

  const handleConfirm = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Missing Info', 'Please choose a username.');
      return;
    }
    if (usernameError) {
      Alert.alert('Invalid Username', usernameError);
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    try {
      const taken = await isUsernameTaken(username.toLowerCase());
      if (taken) {
        setUsernameError('Username is already taken.');
        setSaving(false);
        return;
      }

      await updateUser(uid, {
        name: name.trim(),
        username: username.trim(),
        usernameLower: username.trim().toLowerCase(),
        bio: bio.trim(),
        location: location.trim(),
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navLogo}>Matchday Memories</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>LET'S GET STARTED!</Text>
        <Text style={styles.subtitle}>TELL US A BIT ABOUT YOURSELF</Text>

        <View style={styles.card}>

          {/* Name - required */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>NAME</Text>
              <Text style={styles.required}>REQUIRED</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="YOUR NAME"
              placeholderTextColor="rgba(0,0,0,0.3)"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Username - required */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>USERNAME</Text>
              <Text style={styles.required}>REQUIRED</Text>
            </View>
            <View style={[styles.inputRow, usernameError ? styles.inputError : null]}>
              <Text style={styles.inputPrefix}>@</Text>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={username}
                onChangeText={handleUsernameChange}
                onBlur={checkUsername}
                placeholder="USERNAME"
                placeholderTextColor="rgba(0,0,0,0.3)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {usernameChecking && (
                <ActivityIndicator size="small" color="#3a7d3a" style={{ marginRight: 10 }} />
              )}
              {!usernameChecking && username.length > 0 && !usernameError && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : (
              <Text style={styles.hintText}>LETTERS, NUMBERS, . AND _ ONLY</Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.optionalDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OPTIONAL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Location - optional */}
          <View style={styles.field}>
            <Text style={styles.label}>LOCATION</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="WHERE ARE YOU FROM?"
              placeholderTextColor="rgba(0,0,0,0.3)"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Bio - optional */}
          <View style={styles.field}>
            <Text style={styles.label}>BIO</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="TELL US ABOUT YOURSELF..."
              placeholderTextColor="rgba(0,0,0,0.3)"
              multiline
              numberOfLines={4}
              autoCorrect={false}
            />
          </View>

        </View>

        <TouchableOpacity
          style={[styles.confirmButton, saving && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={saving}
        >
          <Text style={styles.confirmButtonText}>
            {saving ? 'SAVING...' : 'CONFIRM'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  navLogo: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 22,
    letterSpacing: 2,
    color: '#3a7d3a',
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 30,
    letterSpacing: 2,
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 13,
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.35)',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: 18,
    gap: 16,
    marginBottom: 20,
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 12,
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.4)',
  },
  required: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: '#3a7d3a',
  },
  input: {
    fontFamily: 'BebasNeue-Regular',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    letterSpacing: 1,
    backgroundColor: '#fff',
    color: '#111',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingLeft: 12,
  },
  inputError: {
    borderColor: '#c0392b',
  },
  inputFlex: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 2,
  },
  inputPrefix: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 14,
    color: 'rgba(0,0,0,0.3)',
    letterSpacing: 1,
  },
  checkmark: {
    fontSize: 16,
    color: '#3a7d3a',
    marginRight: 12,
    fontWeight: 'bold',
  },
  errorText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#c0392b',
  },
  hintText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    letterSpacing: 0.8,
    color: 'rgba(0,0,0,0.25)',
  },
  optionalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  dividerLabel: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.25)',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#3a7d3a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 16,
    letterSpacing: 2,
    color: '#fff',
  },
});