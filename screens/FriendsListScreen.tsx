import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFriends } from '../firebase';

export default function FriendsListScreen() {
    type Friend = { id: string; };
    const [friends, setFriends] = useState<Friend[]>([]);
    const user = getAuth().currentUser;

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            const list = await getFriends(user.uid);
            setFriends(list);
        };
        fetchFriends();
    }, [user]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Friends</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (<Text>User: {item.id})</Text>)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, marginBottom: 10 },
    friendItem: { marginBottom: 8 },
});
