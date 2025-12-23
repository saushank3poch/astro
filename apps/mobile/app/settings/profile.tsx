import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/store/userStore';
import { Colors } from '@/constants/Colors';

export default function ProfileSettingsScreen() {
  const { user } = useAuth();
  const { updateProfile, loading } = useUserStore();

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    timezone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        birthDate: user.birthDate || '',
        birthTime: user.birthTime || '',
        birthPlace: user.birthPlace || '',
        timezone: user.timezone || 'UTC',
      });
    }
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Edit Profile</Text>

          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="John Doe"
          />

          <Text style={styles.sectionTitle}>Birth Information</Text>
          <Text style={styles.sectionSubtitle}>
            Required for accurate astrological predictions
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

          <Input
            label="Timezone"
            value={formData.timezone}
            onChangeText={(value) => updateField('timezone', value)}
            placeholder="UTC, America/New_York, etc."
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
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
    padding: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
