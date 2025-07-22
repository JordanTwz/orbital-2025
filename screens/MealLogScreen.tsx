// screens/MealLogScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { addMealLog } from '../firebase';
import type { RootStackParamList } from '../App';
import { AppTheme } from '../theme';

type Dish = {
  name: string;
  calories: number;
  macros: {
    carbs: number;
    fats: number;
    proteins: number;
  };
};

type Analysis = {
  description: string;
  totalCalories: number;
  dishes: Dish[];
};

const SERVER = 'https://orbital-2025-6zhd.onrender.com';

type Props = NativeStackScreenProps<RootStackParamList, 'MealLog'>;

export default function MealLogScreen({}: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Pick from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your photos.');
      return;
    }
    const picker = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!picker.canceled) {
      setImageUri(picker.assets[0].uri);
      setAnalysis(null);
      setExpandedIndex(null);
    }
  };

  // Take a new photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your camera.');
      return;
    }
    const picker = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!picker.canceled) {
      setImageUri(picker.assets[0].uri);
      setAnalysis(null);
      setExpandedIndex(null);
    }
  };

  // Send to server and save
  const analyzeImage = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const uriParts = imageUri.split('/');
      const fileName = uriParts.pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const fileType = match ? `image/${match[1]}` : 'image';
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        name: fileName,
        type: fileType,
      } as any);

      const resp = await fetch(`${SERVER}/analyze`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Server error');
      }
      const json = (await resp.json()) as Analysis;
      setAnalysis(json);

      // Save to Firestore
      const uid = getAuth().currentUser?.uid;
      if (uid) {
        await addMealLog(uid, {
          description: json.description,
          totalCalories: json.totalCalories,
          dishes: json.dishes,
          timestamp: Date.now(),
        });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Log a Meal</Text>

        {/* Photo preview */}
        <View style={styles.photoBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>No photo selected</Text>
          )}
        </View>

        {/* Pick / Take buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Text style={styles.actionText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Meal */}
        {imageUri && (
          <TouchableOpacity
            style={[styles.actionButton, styles.analyzeButton]}
            onPress={analyzeImage}
          >
            <Text style={styles.actionText}>Analyze Meal</Text>
          </TouchableOpacity>
        )}

        {/* Loading overlay */}
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        )}

        {/* Analysis results */}
        {analysis && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analysis</Text>
            <Text style={styles.summary}>
              {analysis.description} — {analysis.totalCalories} kcal
            </Text>
            {analysis.dishes.map((dish, idx) => (
              <View key={idx} style={styles.dishContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandedIndex(expandedIndex === idx ? null : idx)
                  }
                  style={styles.dishHeader}
                >
                  <Text style={styles.dishText}>
                    {dish.name} — {dish.calories} kcal
                  </Text>
                </TouchableOpacity>
                {expandedIndex === idx && (
                  <View style={styles.macroTable}>
                    {Object.entries(dish.macros).map(([m, g]) => (
                      <View key={m} style={styles.macroRow}>
                        <Text style={styles.macroName}>{m}</Text>
                        <Text style={styles.macroValue}>{g} g</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  container: {
    padding: AppTheme.spacing.md,
    alignItems: 'center',
  },
  heading: {
    fontSize: AppTheme.typography.h2,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.lg,
  },
  photoBox: {
    width: '100%',
    height: 250,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.roundness,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: AppTheme.spacing.md,
  },
  photoPlaceholder: {
    color: AppTheme.colors.border,
    fontSize: AppTheme.typography.body,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: AppTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    marginHorizontal: AppTheme.spacing.xs,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    elevation: 2,
  },
  analyzeButton: {
    width: '100%',
    marginVertical: AppTheme.spacing.md,   
    elevation: 4,                        
  },

  actionText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.roundness,
    padding: AppTheme.spacing.md,
    elevation: 2,
    marginTop: AppTheme.spacing.md,
  },
  cardTitle: {
    fontSize: AppTheme.typography.h3,
    fontWeight: 'bold',
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.text,
  },
  summary: {
    fontSize: AppTheme.typography.body,
    marginBottom: AppTheme.spacing.md,
    color: AppTheme.colors.text,
  },
  dishContainer: {
    borderTopWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: AppTheme.spacing.sm,
  },
  dishHeader: {
    paddingVertical: AppTheme.spacing.xs,
  },
  dishText: {
    fontSize: AppTheme.typography.body,
    fontWeight: '500',
    color: AppTheme.colors.text,
  },
  macroTable: {
    paddingLeft: AppTheme.spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: AppTheme.spacing.xs,
  },
  macroName: {
    fontSize: AppTheme.typography.small,
    color: AppTheme.colors.text,
  },
  macroValue: {
    fontSize: AppTheme.typography.small,
    color: AppTheme.colors.text,
  },
});
