import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { format, parseISO } from 'date-fns';

interface TimingPeriod {
  date: string;
  score: number;
  type: 'favorable' | 'unfavorable' | 'neutral';
}

interface TimingCalendarProps {
  periods: TimingPeriod[];
}

export function TimingCalendar({ periods }: TimingCalendarProps) {
  const getColor = (type: string) => {
    switch (type) {
      case 'favorable':
        return Colors.success;
      case 'unfavorable':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {periods.map((period, index) => (
          <View key={index} style={styles.periodContainer}>
            <View
              style={[
                styles.periodBar,
                {
                  backgroundColor: getColor(period.type),
                  height: Math.max(20, period.score * 1.2),
                },
              ]}
            />
            <Text style={styles.dateText}>
              {format(parseISO(period.date), 'MMM dd')}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
  },
  periodBar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
});
