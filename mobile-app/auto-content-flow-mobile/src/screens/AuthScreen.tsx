import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  useTheme,
  Divider,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const theme = useTheme();
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Form error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate login form
  const validateLoginForm = () => {
    const formErrors: Record<string, string> = {};
    
    if (!loginUsername.trim()) {
      formErrors.loginUsername = 'Username is required';
    }
    
    if (!loginPassword.trim()) {
      formErrors.loginPassword = 'Password is required';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Validate register form
  const validateRegisterForm = () => {
    const formErrors: Record<string, string> = {};
    
    if (!registerUsername.trim()) {
      formErrors.registerUsername = 'Username is required';
    }
    
    if (!registerEmail.trim()) {
      formErrors.registerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      formErrors.registerEmail = 'Email is invalid';
    }
    
    if (!registerPassword.trim()) {
      formErrors.registerPassword = 'Password is required';
    } else if (registerPassword.length < 6) {
      formErrors.registerPassword = 'Password must be at least 6 characters';
    }
    
    if (registerPassword !== registerConfirmPassword) {
      formErrors.registerConfirmPassword = 'Passwords do not match';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle login submit
  const handleLoginSubmit = async () => {
    if (validateLoginForm()) {
      await login(loginUsername, loginPassword);
    }
  };

  // Handle register submit
  const handleRegisterSubmit = async () => {
    if (validateRegisterForm()) {
      await register(registerUsername, registerEmail, registerPassword);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <StatusBar style="auto" />

      <View style={styles.brandHeader}>
        <Text style={styles.brandTitle}>AutoContentFlow</Text>
        <Text style={styles.brandSubtitle}>
          Streamline your content creation workflow
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.authContainer}>
          <Text style={styles.header}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>

          {isLogin ? (
            /* Login Form */
            <View style={styles.form}>
              <TextInput
                label="Username"
                value={loginUsername}
                onChangeText={setLoginUsername}
                mode="outlined"
                style={styles.input}
                error={!!errors.loginUsername}
                disabled={isLoading}
              />
              {errors.loginUsername && (
                <Text style={styles.errorText}>{errors.loginUsername}</Text>
              )}

              <TextInput
                label="Password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.loginPassword}
                disabled={isLoading}
              />
              {errors.loginPassword && (
                <Text style={styles.errorText}>{errors.loginPassword}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleLoginSubmit}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                Log In
              </Button>
            </View>
          ) : (
            /* Register Form */
            <View style={styles.form}>
              <TextInput
                label="Username"
                value={registerUsername}
                onChangeText={setRegisterUsername}
                mode="outlined"
                style={styles.input}
                error={!!errors.registerUsername}
                disabled={isLoading}
              />
              {errors.registerUsername && (
                <Text style={styles.errorText}>{errors.registerUsername}</Text>
              )}

              <TextInput
                label="Email"
                value={registerEmail}
                onChangeText={setRegisterEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                error={!!errors.registerEmail}
                disabled={isLoading}
              />
              {errors.registerEmail && (
                <Text style={styles.errorText}>{errors.registerEmail}</Text>
              )}

              <TextInput
                label="Password"
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.registerPassword}
                disabled={isLoading}
              />
              {errors.registerPassword && (
                <Text style={styles.errorText}>{errors.registerPassword}</Text>
              )}

              <TextInput
                label="Confirm Password"
                value={registerConfirmPassword}
                onChangeText={setRegisterConfirmPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.registerConfirmPassword}
                disabled={isLoading}
              />
              {errors.registerConfirmPassword && (
                <Text style={styles.errorText}>
                  {errors.registerConfirmPassword}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleRegisterSubmit}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin
                ? "Don't have an account?"
                : 'Already have an account?'}
            </Text>
            <TouchableOpacity
              onPress={toggleAuthMode}
              disabled={isLoading}
            >
              <Text style={styles.footerLink}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>
            Automate your social media content
          </Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              ✓ AI-powered content generation
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              ✓ Cross-platform publishing
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              ✓ Customizable content workflows
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>
              ✓ Advanced analytics and insights
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  brandHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#4F46E5',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  authContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    marginTop: -4,
    fontSize: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginRight: 8,
  },
  footerLink: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  features: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
});