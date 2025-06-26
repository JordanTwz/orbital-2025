// components/Card.tsx

import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppTheme } from '../theme';

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.roundness,
    padding: AppTheme.spacing.md,
    marginVertical: AppTheme.spacing.sm,
    marginHorizontal: AppTheme.spacing.md,
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevation for Android
    elevation: 2,
  },
});
