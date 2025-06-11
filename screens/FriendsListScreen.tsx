import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

export default function FriendsListScreen() {
    const [friends, setFriends] = useState<string[]>([]);
    const user = getAuth().currentUser;

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            const docSnap = await getDoc(doc(db, 'users', user.uid));
            if (docSnap.exists()) {
                setFriends(docSnap.data().friends || []);
            }
        };
        fetchFriends();
    }, [user]);

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>Your Friends</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item}
                renderItem={({ item }) => <Text>User ID: {item}</Text>}
            />
        </View>
    );
}
