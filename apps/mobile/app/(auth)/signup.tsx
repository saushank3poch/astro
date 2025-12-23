import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';

export default function SignupScreen() {
  const router = useRouter();
  const { register, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      // Navigation handled by root layout
    } catch (error) {
      // Error is set in store
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Astro and unlock cosmic financial insights
            </Text>
          </View>

          {error && <ErrorBanner message={error} onDismiss={clearError} />}

          <View style={styles.form}>
            <Input
              label="Full Name *"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="John Doe"
            />

            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="your@email.com"
            />

            <Input
              label="Password *"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              placeholder="At least 8 characters"
            />

            <Input
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              placeholder="Re-enter password"
            />

            <Text style={styles.sectionTitle}>Birth Information (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              For personalized astrological predictions
            </Text>

            <Input
              label="Birth Date"
              value={formData.birthDate}
              onChangeText={(value) => updateField('birthDate', value)}
              placeholder="YYYY-MM-DD"
            />

            <Input
              label="Birth Time"
              value={formData.birthTime}
              onChangeText={(value) => updateField('birthTime', value)}
              placeholder="HH:MM (24-hour format)"
            />

            <Input
              label="Birth Place"
              value={formData.birthPlace}
              onChangeText={(value) => updateField('birthPlace', value)}
              placeholder="City, Country"
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Button
                title="Sign In"
                onPress={() => router.back()}
                variant="outline"
                size="small"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
