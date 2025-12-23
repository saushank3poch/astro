import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { tier } = useSubscription();

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

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => router.push('/settings/profile'),
    },
    {
      icon: 'card-outline',
      title: 'Subscription',
      subtitle: `Current plan: ${tier}`,
      onPress: () => router.push('/subscription/plans'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => router.push('/settings/notifications'),
    },
    {
      icon: 'time-outline',
      title: 'Prediction History',
      subtitle: 'View all your predictions',
      onPress: () => router.push('/predictions/history'),
    },
    {
      icon: 'settings-outline',
      title: 'Account Settings',
      subtitle: 'Privacy and security',
      onPress: () => router.push('/settings/account'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Astro User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </Card>
          ))}
        </View>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />

        <Text style={styles.version}>Version 1.0.0</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: '700',
  },
  name: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  menu: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  logoutButton: {
    marginBottom: 16,
  },
  version: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
