// TO-DO 
// - Turn off autocorrect 
// - Add actual cities for location field (maybe use Google Places API?)
// - Add option for profile pic upload (eventually will need to set up Firebase Storage for this, and have guidelines)
// - Add duplicate checking for usernames
// - Add option to change password (will require re-authentication, so maybe do this in a separate screen?)

import { auth } from '@/FirebaseConfig';
import { getUser, updateUser } from '@/services/userService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const user = await getUser(uid);
            if (user) {
                setName(user.name || '');
                setUsername(user.username || '');
                setBio(user.bio || '');
                setLocation(user.location || '');
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        setSaving(true);
        try {
            await updateUser(uid, { name, username, bio, location });
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
                {[
                    { label: 'NAME', value: name, setter: setName },
                    { label: 'LOCATION', value: location, setter: setLocation },
                ].map(({ label, value, setter }) => (
                    <View key={label} style={styles.field}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={setter}
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            placeholder={label}
                            autoCapitalize="none"
                        />
                    </View>
                ))}

                <View style={styles.field}>
                    <Text style={styles.label}>USERNAME</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputPrefix}>@</Text>
                        <TextInput
                            style={[styles.input, styles.inputFlex]}
                            value={username}
                            onChangeText={setUsername}
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            placeholder="username"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

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