// screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, Alert, StyleSheet, View } from 'react-native';
import { register } from '../firebase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await register(email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert('Sign Up Error', err.message); // future: improve error handling
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
      <Button title="Sign Up" onPress={handleSignUp} />
      <View style={{ height: 12 }} />
      <Button
        title="Have an account? Sign In"
        onPress={() => navigation.navigate('SignIn')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: { marginBottom: 12, borderBottomWidth: 1, padding: 8 },
});
