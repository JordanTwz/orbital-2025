// theme.ts
import { DefaultTheme } from '@react-navigation/native'

export const AppTheme = {
  ...DefaultTheme,
  colors: {
    primary:    '#1E88E5',  // vivid blue
    background: '#F5F5F5',  // light gray
    card:       '#FFFFFF',
    text:       '#212121',
    border:     '#E0E0E0',
    notification: '#FFC107', // amber
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    small: 14,
  },
  roundness: 8,
}
