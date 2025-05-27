// theme.ts
import { DefaultTheme, Theme } from '@react-navigation/native'

export const AppTheme: Theme = {
  ...DefaultTheme,
  // We can toggle 'dark' here if we ever want a dark theme :) can we explore changing based on system settings?
  // For now, we’ll keep it light
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary:      '#6200ee', // future: consider making this customisable
    background:   '#ffffff',
    card:         '#ffffff',
    text:         '#333333',
    border:       '#cccccc',
    notification: '#ff80ab',
  },
}
