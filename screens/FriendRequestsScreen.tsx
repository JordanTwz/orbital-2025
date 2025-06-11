import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export default function FriendRequestsScreen() {
    const [requests, setRequests] = useState<string[]>([]);
    const user = getAuth().currentUser;

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                setRequests(docSnap.data().incomingRequests || []);
            }
        };
        fetchRequests();
    }, [user]);

    const acceptRequest = async (requesterId: string) => {
        if (!user) return;

        const currentUserRef = doc(db, 'users', user.uid);
        const requesterRef = doc(db, 'users', requesterId);

        await updateDoc(currentUserRef, {
            incomingRequests: arrayRemove(requesterId),
            friends: arrayUnion(requesterId)
        });

        await updateDoc(requesterRef, {
            outgoingRequests: arrayRemove(user.uid),
            friends: arrayUnion(user.uid)
        });

        Alert.alert('Friend added!');
        setRequests(requests.filter(id => id !== requesterId));
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Incoming Friend Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 10 }}>
                        <Text>User ID: {item}</Text>
                        <Button title="Accept" onPress={() => acceptRequest(item)} />
                    </View>
                )}
            />
        </View>
    );
}
