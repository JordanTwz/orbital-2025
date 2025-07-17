// screens/SignInScreen.tsx

import React, { useState } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { login } from '../firebase'
import { AppTheme } from '../theme'

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async () => {
    try {
      await login(email, password)
      navigation.replace('Home')
    } catch (err: any) {
      Alert.alert('Sign In Error', err.message) // future: improve error handling
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={AppTheme.colors.border}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={AppTheme.colors.border}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: {
    flex: 1,
    padding: AppTheme.spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: AppTheme.typography.h2,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
    alignSelf: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  input: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness,
    fontSize: AppTheme.typography.body,
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  primaryButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginBottom: AppTheme.spacing.sm,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  linkText: {
    color: AppTheme.colors.primary,
    fontSize: AppTheme.typography.small,
    textAlign: 'center',
    marginTop: AppTheme.spacing.sm,
  },
})
