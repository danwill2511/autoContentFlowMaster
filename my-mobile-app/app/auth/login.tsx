import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import BiometricAuth from '../../components/BiometricAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  isBiometricAvailable, 
  initializeBiometricSettings 
} from '../../utils/biometricAuth';

export default function LoginScreen() {
  // Auth context and loading state
  const { login, isLoading } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Biometric authentication state
  const [storedUsername, setStoredUsername] = useState<string | null>(null);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  
  // Safe area insets for proper layout
  const insets = useSafeAreaInsets();
  
  // Check for stored credentials on component mount
  useEffect(() => {
    const init = async () => {
      try {
        // Check for stored credentials
        const savedUsername = await AsyncStorage.getItem('lastUsername');
        if (savedUsername) {
          setStoredUsername(savedUsername);
          setUsername(savedUsername);
        }
        
        // Initialize biometric settings
        await initializeBiometricSettings();
        
        // Check if biometrics are available
        const available = await isBiometricAvailable();
        setBiometricsAvailable(available);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    
    init();
  }, []);

  // Handle biometric login
  const handleBiometricLogin = async () => {
    try {
      // Get stored password for username
      const storedPassword = await AsyncStorage.getItem(`password_${storedUsername}`);
      
      if (!storedUsername || !storedPassword) {
        setErrorMsg('Biometric login failed. Please log in with your credentials.');
        return;
      }
      
      setErrorMsg(null);
      await login(storedUsername, storedPassword);
      router.replace('/');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Biometric authentication failed. Please log in with your credentials.');
      }
    }
  };

  // Handle traditional login
  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg('Please enter both username and password');
      return;
    }

    setErrorMsg(null);
    try {
      await login(username, password);
      
      // Save credentials for biometric login
      await AsyncStorage.setItem('lastUsername', username);
      await AsyncStorage.setItem(`password_${username}`, password);
      
      router.replace('/');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unexpected error occurred');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('../../assets/images/icon.png')}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AutoContentFlow</Text>
          <Text style={styles.tagline}>AI-Powered Content Management</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {errorMsg && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Reset Password', 'This feature is coming soon!')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          {/* Biometric authentication */}
          {storedUsername && (
            <BiometricAuth
              onSuccess={handleBiometricLogin}
              promptMessage={`Sign in as ${storedUsername}`}
            />
          )}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f8fafc',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6366f1',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    color: '#64748b',
    fontSize: 14,
  },
  registerLink: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  biometricContainer: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
});