import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BeeIcon } from './native/BeeIcon';

interface HeaderProps {
  currentDate: string;
  streak?: number;
  colors: {
    text: string;
    textSecondary: string;
    border: string;
    accentYellow: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ currentDate, streak = 0, colors }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { text: 'Good morning!', emoji: '🌅' };
    } else if (hour < 17) {
      return { text: 'Good afternoon!', emoji: '☀️' };
    } else {
      return { text: 'Good evening!', emoji: '🌙' };
    }
  };

  const greeting = getGreeting();

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.date,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {currentDate}
      </Text>
      <View style={styles.greetingRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BeeIcon size={32} />
          <Text
            style={[
              styles.greeting,
              {
                color: colors.text,
              },
            ]}
          >
            {greeting.text} {greeting.emoji}
          </Text>
        </View>
        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.accentYellow }]}>
            <Text style={styles.streakText}>
              🔥 {streak}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  date: {
    fontSize: 16,
    marginBottom: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});


