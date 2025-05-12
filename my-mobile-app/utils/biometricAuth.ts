import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Biometric authentication states
export enum BiometricState {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  DISABLED = 'DISABLED',
  ENABLED = 'ENABLED',
}

// Biometric type names map
const biometricTypeNames = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'Fingerprint',
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'Face ID',
  [LocalAuthentication.AuthenticationType.IRIS]: 'Iris',
};

// Check if biometrics are available on the device
export async function isBiometricAvailable(): Promise<boolean> {
  const isCompatible = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return isCompatible && isEnrolled;
}

// Get biometric types supported by device
export async function getSupportedBiometricTypes(): Promise<string[]> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types.map(type => biometricTypeNames[type] || 'Unknown');
  } catch (error) {
    console.error('Error getting biometric types:', error);
    return [];
  }
}

// Get main biometric type (for UI display)
export async function getMainBiometricType(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.length === 0) return 'None';
    
    // Prioritize face recognition, then fingerprint
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return biometricTypeNames[LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION];
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return biometricTypeNames[LocalAuthentication.AuthenticationType.FINGERPRINT];
    } else {
      return biometricTypeNames[types[0]] || 'Biometrics';
    }
  } catch (error) {
    console.error('Error getting main biometric type:', error);
    return 'None';
  }
}

// Authenticate with biometrics
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to continue'
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}

// Get current biometric state
export async function getBiometricState(): Promise<BiometricState> {
  try {
    const isAvailable = await isBiometricAvailable();
    
    if (!isAvailable) {
      return BiometricState.NOT_SUPPORTED;
    }
    
    const enabled = await AsyncStorage.getItem('biometricsEnabled');
    return enabled === 'true' ? BiometricState.ENABLED : BiometricState.DISABLED;
  } catch (error) {
    console.error('Error getting biometric state:', error);
    return BiometricState.NOT_SUPPORTED;
  }
}

// Enable biometric authentication
export async function enableBiometrics(): Promise<boolean> {
  try {
    // First authenticate to ensure the real user is enabling biometrics
    const authenticated = await authenticateWithBiometrics(
      'Authenticate to enable biometric login'
    );
    
    if (!authenticated) {
      return false;
    }
    
    await AsyncStorage.setItem('biometricsEnabled', 'true');
    return true;
  } catch (error) {
    console.error('Error enabling biometrics:', error);
    return false;
  }
}

// Disable biometric authentication
export async function disableBiometrics(): Promise<boolean> {
  try {
    // First authenticate to ensure the real user is disabling biometrics
    const authenticated = await authenticateWithBiometrics(
      'Authenticate to disable biometric login'
    );
    
    if (!authenticated) {
      return false;
    }
    
    await AsyncStorage.setItem('biometricsEnabled', 'false');
    return true;
  } catch (error) {
    console.error('Error disabling biometrics:', error);
    return false;
  }
}

// Initialize biometric settings
export async function initializeBiometricSettings(): Promise<void> {
  try {
    const isAvailable = await isBiometricAvailable();
    
    if (!isAvailable) {
      await AsyncStorage.setItem('biometricsEnabled', 'false');
      return;
    }
    
    // Check if setting exists
    const enabled = await AsyncStorage.getItem('biometricsEnabled');
    
    // If no setting exists yet, set default to disabled
    if (enabled === null) {
      await AsyncStorage.setItem('biometricsEnabled', 'false');
    }
  } catch (error) {
    console.error('Error initializing biometric settings:', error);
  }
}