import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { Colors } from '@/constants/Colors';
import { api } from '@/lib/api';

export default function NotificationSettingsScreen() {
  const { permissionGranted, requestPermissions } = useNotifications();

  const [settings, setSettings] = useState({
    dailyInsights: true,
    favorablePeriods: true,
    lowCredits: true,
    subscriptionExpiry: true,
  });

  const [saving, setSaving] = useState(false);

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateNotificationSettings(settings);
      Alert.alert('Success', 'Notification preferences updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Notifications</Text>

        {!permissionGranted && (
          <Card style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Enable Notifications</Text>
            <Text style={styles.permissionText}>
              Allow notifications to receive cosmic insights and important updates
            </Text>
            <Button
              title="Enable Notifications"
              onPress={requestPermissions}
              style={styles.permissionButton}
            />
          </Card>
        )}

        <Text style={styles.sectionTitle}>Notification Preferences</Text>

        <Card style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Daily Insights</Text>
            <Text style={styles.settingDescription}>
              Receive daily astrological insights
            </Text>
          </View>
          <Switch
            value={settings.dailyInsights}
            onValueChange={() => toggleSetting('dailyInsights')}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </Card>

        <Card style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Favorable Periods</Text>
            <Text style={styles.settingDescription}>
              Get notified when favorable trading periods begin
            </Text>
          </View>
          <Switch
            value={settings.favorablePeriods}
            onValueChange={() => toggleSetting('favorablePeriods')}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </Card>

        <Card style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Low Credits</Text>
            <Text style={styles.settingDescription}>
              Alert when your credits are running low
            </Text>
          </View>
          <Switch
            value={settings.lowCredits}
            onValueChange={() => toggleSetting('lowCredits')}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </Card>

        <Card style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Subscription Expiry</Text>
            <Text style={styles.settingDescription}>
              Remind before subscription expires
            </Text>
          </View>
          <Switch
            value={settings.subscriptionExpiry}
            onValueChange={() => toggleSetting('subscriptionExpiry')}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </Card>

        <Button
          title="Save Preferences"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
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
  permissionCard: {
    backgroundColor: Colors.primary,
    marginBottom: 24,
    alignItems: 'center',
  },
  permissionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  permissionText: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  permissionButton: {
    backgroundColor: Colors.text,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 24,
  },
});
