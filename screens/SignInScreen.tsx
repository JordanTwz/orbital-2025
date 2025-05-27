// screens/SignInScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, Alert, StyleSheet, View } from 'react-native';
import { login } from '../firebase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Sign In Error', err.message); // future: improve error handling
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <View style={{ height: 12 }} />
      <Button
        title="No account? Sign Up"
        onPress={() => navigation.navigate('SignUp')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: { marginBottom: 12, borderBottomWidth: 1, padding: 8 },
});
