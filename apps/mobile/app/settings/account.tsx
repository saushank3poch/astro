import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { BiometricToggle } from '@/components/BiometricToggle';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { logout, biometricEnabled, setBiometric } = useAuth();

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password reset link will be sent to your email',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: () => Alert.alert('Success', 'Password reset link sent to your email'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
            logout();
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Account Settings</Text>

        <Text style={styles.sectionTitle}>Security</Text>

        <BiometricToggle enabled={biometricEnabled} onToggle={setBiometric} />

        <Card style={styles.actionCard}>
          <Button
            title="Change Password"
            onPress={handleChangePassword}
            variant="outline"
          />
        </Card>

        <Text style={styles.sectionTitle}>Account Management</Text>

        <Card style={styles.actionCard}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
          />
        </Card>

        <Card style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerText}>
            Deleting your account is permanent and cannot be undone. All your data, predictions,
            and subscription will be lost.
          </Text>
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="outline"
            style={styles.dangerButton}
          />
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Privacy Policy</Text>
          <Text style={styles.infoText}>
            We take your privacy seriously. Read our privacy policy to understand how we
            collect, use, and protect your data.
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Terms of Service</Text>
          <Text style={styles.infoText}>
            By using Astro, you agree to our terms of service. Please review them to understand
            your rights and obligations.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 16,
  },
  dangerCard: {
    borderWidth: 2,
    borderColor: Colors.error,
    marginBottom: 24,
  },
  dangerTitle: {
    color: Colors.error,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  dangerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    borderColor: Colors.error,
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
    marginBottom: 16,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
