import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getIncomingRequests, acceptFriend } from '../firebase';

type Request = { id: string; };

export default function FriendRequestsScreen() {
    const [requests, setRequests] = useState<Request[]>([]);
    const user = getAuth().currentUser;

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            const incoming = await getIncomingRequests(user.uid);
            setRequests(incoming);
        };
        fetchRequests();
    }, [user]);

    const handleAccept = async (requesterId: string) => {
        if (!user) return;
        await acceptFriend(user.uid, requesterId);
        setRequests(prev => prev.filter(req => req.id !== requesterId));
        Alert.alert('Friend request accepted!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Incoming Friend Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text>User ID: {item.id}</Text>
                        <Button title="Accept" onPress={() => handleAccept(item.id)} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, marginBottom: 10 },
    card: { marginBottom: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
});
