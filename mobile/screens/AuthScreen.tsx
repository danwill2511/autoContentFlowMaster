import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';

export default function AuthScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      // Navigate to Dashboard after successful login
      navigation.navigate('Dashboard');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>AutoContentFlow</Text>
          <Text style={styles.tagline}>AI-powered content management</Text>
        </View>

        <Surface style={styles.authCard}>
          <Text style={styles.cardTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          
          {!isLogin && (
            <TextInput
              label="Username"
              mode="outlined"
              style={styles.input}
              onChangeText={text => {}}
            />
          )}
          
          <TextInput
            label="Email"
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            label="Password"
            mode="outlined"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <Button
            mode="contained"
            style={styles.button}
            loading={loading}
            onPress={handleAuth}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
          
          <Button
            mode="text"
            onPress={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </Button>
        </Surface>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Key Features:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>AI-powered content generation</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Automated social media scheduling</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Real-time performance analytics</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Push notifications for workflow updates</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  authCard: {
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 16,
    paddingVertical: 8,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  }
});