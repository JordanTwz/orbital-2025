import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { searchUser, sendFriendRequest } from '../firebase';

export default function SearchUsersScreen() {
    const [uid, setUid] = useState('');
    const [foundUserId, setFoundUserId] = useState<string | null>(null);
    const currentUser = getAuth().currentUser;

    const handleSearch = async () => {
        const result = await searchUser(uid.trim());
        if (result && result.id !== currentUser?.uid) {
            setFoundUserId(result.id);
        } else {
            setFoundUserId(null);
            Alert.alert(result?.id === currentUser?.uid ? 'You cannot add yourself' : 'User not found');
        }
    };

    const handleSendRequest = async () => {
        if (!currentUser || !foundUserId) return;
        await sendFriendRequest(currentUser.uid, foundUserId);
        Alert.alert('Friend request sent!');
        setUid('');
        setFoundUserId(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Friend by UID</Text>
            <TextInput
                placeholder="Enter user UID"
                value={uid}
                onChangeText={setUid}
                style={styles.input}
            />
            <Button title="Search" onPress={handleSearch} />
            {foundUserId && (
                <>
                    <Text style={styles.result}>User found: {foundUserId}</Text>
                    <Button title="Send Friend Request" onPress={handleSendRequest} />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, marginBottom: 10 },
    input: { borderBottomWidth: 1, marginBottom: 20, fontSize: 16 },
    result: { marginVertical: 10 },
});
