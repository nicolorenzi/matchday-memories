// TO-DO 
// - Add actual cities for location field (maybe use Google Places API?)
// - Add option for profile pic upload (eventually will need to set up Firebase Storage for this, and have guidelines)
// - Add option to change password (will require re-authentication, so maybe do this in a separate screen?)

import { auth } from '@/FirebaseConfig';
import { getUser, isUsernameTaken, updateUser } from '@/services/userService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [originalUsername, setOriginalUsername] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [saving, setSaving] = useState(false);

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameChecking, setUsernameChecking] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const user = await getUser(uid);
            if (user) {
                setName(user.name || '');
                setUsername(user.username || '');
                setOriginalUsername(user.username || '');
                setBio(user.bio || '');
                setLocation(user.location || '');
            }
        };
        fetchUser();
    }, []);

    const handleUsernameChange = (value: string) => {
        const cleaned = value.replace(/[^a-zA-Z0-9_.]/g, '');
        setUsername(cleaned);
        setUsernameError(null);
    };

    const checkUsername = async () => {
        if (!username) return;
        // Skip check if username hasn't changed
        if (username.toLowerCase() === originalUsername.toLowerCase()) return;
        setUsernameChecking(true);
        const taken = await isUsernameTaken(username.toLowerCase());
        setUsernameChecking(false);
        if (taken) setUsernameError('Username is already taken.');
    };

    const handleSave = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        if (!name.trim()) {
            Alert.alert('Missing Info', 'Please enter your name.');
            return;
        }
        if (!username.trim()) {
            Alert.alert('Missing Info', 'Please enter a username.');
            return;
        }
        if (usernameError) {
            Alert.alert('Invalid Username', usernameError);
            return;
        }

        setSaving(true);
        try {
            // Final uniqueness check before saving (skip if username unchanged)
            if (username.toLowerCase() !== originalUsername.toLowerCase()) {
                const taken = await isUsernameTaken(username.toLowerCase());
                if (taken) {
                    setUsernameError('Username is already taken.');
                    setSaving(false);
                    return;
                }
            }

            await updateUser(uid, {
                name: name.trim(),
                username: username.trim(),
                usernameLower: username.trim().toLowerCase(),
                bio: bio.trim(),
                location: location.trim(),
            });
            router.back();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backText}>‹ BACK</Text>
                </TouchableOpacity>
                <Text style={styles.title}>EDIT PROFILE</Text>
            </View>

            <View style={styles.form}>

                {/* Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>NAME</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        placeholder="NAME"
                        autoCapitalize="words"
                        autoCorrect={false}
                    />
                </View>

                {/* Username */}
                <View style={styles.field}>
                    <Text style={styles.label}>USERNAME</Text>
                    <View style={[styles.inputRow, usernameError ? styles.inputError : null]}>
                        <Text style={styles.inputPrefix}>@</Text>
                        <TextInput
                            style={[styles.input, styles.inputFlex]}
                            value={username}
                            onChangeText={handleUsernameChange}
                            onBlur={checkUsername}
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            placeholder="username"
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

                {/* Location */}
                <View style={styles.field}>
                    <Text style={styles.label}>LOCATION</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        placeholder="LOCATION"
                        autoCapitalize="words"
                        autoCorrect={false}
                    />
                </View>

                {/* Bio */}
                <View style={styles.field}>
                    <Text style={styles.label}>BIO</Text>
                    <TextInput
                        style={[styles.input, styles.bioInput]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="BIO"
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        multiline
                        numberOfLines={4}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 22,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.07)',
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    backText: { fontFamily: 'BebasNeue-Regular', fontSize: 14, letterSpacing: 1, color: '#3a7d3a' },
    title: { fontFamily: 'BebasNeue-Regular', fontSize: 20, letterSpacing: 2, color: '#111' },
    form: { padding: 22, gap: 16 },
    field: { gap: 6 },
    label: { fontFamily: 'BebasNeue-Regular', fontSize: 12, letterSpacing: 1.5, color: 'rgba(0,0,0,0.4)' },
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
    inputPrefix: {
        fontFamily: 'BebasNeue-Regular',
        fontSize: 14,
        color: 'rgba(0,0,0,0.3)',
        letterSpacing: 1,
    },
    inputFlex: {
        flex: 1,
        borderWidth: 0,
        paddingLeft: 2,
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
    bioInput: { height: 100, textAlignVertical: 'top' },
    saveButton: {
        backgroundColor: '#3a7d3a',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: { fontFamily: 'BebasNeue-Regular', fontSize: 16, letterSpacing: 2, color: '#fff' },
});