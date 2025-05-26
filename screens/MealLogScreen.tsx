// screens/MealLogScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, AppTheme } from '../App';

// IMPORTANT: Replace with your server IP (can we explore the use of ngrok?)
const SERVER = 'http://192.168.XX.XX:3000';

type Dish = {
  name: string;
  calories: number;
  macros: { carbs: number; fats: number; proteins: number };
};
type Analysis = {
  description: string;
  totalCalories: number;
  dishes: Dish[];
};

type Props = NativeStackScreenProps<RootStackParamList, 'MealLog'>;

export default function MealLogScreen({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  async function pickImage() {
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
  }

  async function analyzeImage() {
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
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Log a Meal</Text>

        <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>Tap to add a photo</Text>
          )}
        </TouchableOpacity>

        {imageUri && <Button title="Analyze Meal" onPress={analyzeImage} />}

        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {analysis && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis</Text>
            <Text style={styles.summary}>
              {analysis.description} — Total: {analysis.totalCalories} kcal
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
                    {Object.entries(dish.macros).map(([macro, grams]) => (
                      <View key={macro} style={styles.macroRow}>
                        <Text style={styles.macroName}>{macro}</Text>
                        <Text style={styles.macroValue}>{grams} g</Text>
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
  safeArea: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: {
    alignItems: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 20,
    marginBottom: 16,
    color: AppTheme.colors.text,
  },
  photoBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppTheme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    color: AppTheme.colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 2,
    width: '100%',
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summary: {
    marginBottom: 12,
    color: AppTheme.colors.text,
  },
  dishContainer: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  dishHeader: {
    paddingVertical: 8,
  },
  dishText: {
    fontSize: 16,
    fontWeight: '500',
    color: AppTheme.colors.text,
  },
  macroTable: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  macroName: {
    fontSize: 14,
    color: AppTheme.colors.text,
  },
  macroValue: {
    fontSize: 14,
    color: AppTheme.colors.text,
  },
});
