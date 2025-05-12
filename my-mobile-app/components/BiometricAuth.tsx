import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  BiometricState,
  isBiometricAvailable,
  getMainBiometricType,
  authenticateWithBiometrics,
  getBiometricState,
} from '../utils/biometricAuth';

interface BiometricAuthProps {
  onSuccess: () => void;
  onCancel?: () => void;
  promptMessage?: string;
  style?: any;
}

const BiometricAuth = ({
  onSuccess,
  onCancel,
  promptMessage = 'Authenticate to continue',
  style,
}: BiometricAuthProps) => {
  const [biometricType, setBiometricType] = useState<string>('Biometrics');
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if biometrics are available and enabled
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        setLoading(true);
        
        // Check if biometrics are available on the device
        const available = await isBiometricAvailable();
        setIsAvailable(available);
        
        if (available) {
          // Get the main biometric type for display
          const mainType = await getMainBiometricType();
          setBiometricType(mainType);
          
          // Check if biometrics are enabled by the user
          const state = await getBiometricState();
          setIsEnabled(state === BiometricState.ENABLED);
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkBiometrics();
  }, []);

  // Handle authentication
  const handleAuthenticate = async () => {
    try {
      // If biometrics are not available or not enabled, skip
      if (!isAvailable || !isEnabled) {
        return;
      }
      
      // Authenticate with biometrics
      const success = await authenticateWithBiometrics(promptMessage);
      
      if (success) {
        // Authentication successful
        onSuccess();
      } else if (onCancel) {
        // User canceled authentication
        onCancel();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', 'Please try again or use password');
    }
  };

  // Render biometric icon based on type
  const renderBiometricIcon = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#007AFF" />;
    }
    
    if (!isAvailable || !isEnabled) {
      return null;
    }
    
    // Choose icon based on biometric type
    const iconName = biometricType.toLowerCase().includes('face')
      ? 'ios-face-id'
      : 'ios-finger-print';
    
    return (
      <Ionicons name={iconName} size={32} color="#007AFF" />
    );
  };

  // Don't render anything if biometrics are not available or not enabled
  if (!loading && (!isAvailable || !isEnabled)) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleAuthenticate}
      disabled={loading || !isAvailable || !isEnabled}
    >
      <View style={styles.content}>
        {renderBiometricIcon()}
        <Text style={styles.text}>
          {loading
            ? 'Checking biometrics...'
            : `Sign in with ${biometricType}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  text: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default BiometricAuth;