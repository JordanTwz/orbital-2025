import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { sendFriendRequest } from '../firebase'; // Make sure it's exported!
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export default function SearchUsersScreen() {
    const [email, setEmail] = useState('');
    const [foundUserId, setFoundUserId] = useState<string | null>(null);

    const handleSearch = async () => {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            Alert.alert('User not found');
            setFoundUserId(null);
        } else {
            const doc = snapshot.docs[0];
            setFoundUserId(doc.id);
        }
    };

    const handleSendRequest = async () => {
        const senderId = getAuth().currentUser?.uid;
        if (!senderId || !foundUserId) return;

        await sendFriendRequest(senderId, foundUserId);
        Alert.alert('Friend request sent!');
        setFoundUserId(null);
        setEmail('');
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Enter user's email"
                value={email}
                onChangeText={setEmail}
                style={{ borderBottomWidth: 1, marginBottom: 20 }}
            />
            <Button title="Search" onPress={handleSearch} />
            {foundUserId && (
                <>
                    <Text style={{ marginVertical: 10 }}>User found!</Text>
                    <Button title="Send Friend Request" onPress={handleSendRequest} />
                </>
            )}
        </View>
    );
}
