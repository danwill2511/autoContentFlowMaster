
import * as LocalAuthentication from 'expo-local-authentication';

export async function checkBiometricSupport() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return { compatible, enrolled };
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const { compatible, enrolled } = await checkBiometricSupport();
    
    if (!compatible || !enrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}
