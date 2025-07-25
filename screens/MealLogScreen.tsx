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
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { addMealLog } from '../firebase';
import type { RootStackParamList } from '../App';
import { AppTheme } from '../theme';
import { uploadImageAnalysis} from "../uploadImageAnalysis";

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

export default function MealLogScreen({ navigation }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // new state for privacy choice
  const [isPublic, setIsPublic] = useState<boolean>(false);

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
      setIsPublic(false);
    }
  };

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
      setIsPublic(false);
    }
  };

  // analyze only, do NOT save here
  const analyzeImage = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const result = await uploadImageAnalysis({
        imageUri,
        serverUrl: SERVER,
      });
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // new: only save when user presses Save
  const handleSave = async () => {
    if (!analysis) return;
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    try {
      const docRef = await addMealLog(uid, {
        description:   analysis.description,
        totalCalories: analysis.totalCalories,
        dishes:        analysis.dishes,
        timestamp:     Date.now(),
        isPublic,                      // honor user’s choice
      });
      // build a log to navigate to detail
      const newLog = {
        id:           docRef.id,
        ownerUid:     uid,
        ...analysis,
        isPublic,
        likes:        [] as string[],
        timestamp:    Date.now(),
      };
      navigation.replace('MealDetail', { log: newLog });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Log a Meal</Text>

        <View style={styles.photoBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>No photo selected</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Text style={styles.actionText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {imageUri && !analysis && (
          <TouchableOpacity
            style={[styles.actionButton, styles.analyzeButton]}
            onPress={analyzeImage}
          >
            <Text style={styles.actionText}>Analyze Meal</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        )}

        {analysis && (
          <>
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

            {/* privacy toggle */}
            <View style={styles.privacyRow}>
              <Text style={styles.label}>Public</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>

            {/* Save */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: {
    padding:    AppTheme.spacing.md,
    alignItems: 'center',
  },
  heading: {
    fontSize:   AppTheme.typography.h2,
    fontWeight: 'bold',
    color:      AppTheme.colors.text,
    marginBottom: AppTheme.spacing.lg,
  },
  photoBox: {
    width:            '100%',
    height:           250,
    backgroundColor:  AppTheme.colors.card,
    borderRadius:     AppTheme.roundness,
    borderWidth:      1,
    borderColor:      AppTheme.colors.border,
    alignItems:       'center',
    justifyContent:   'center',
    overflow:         'hidden',
    marginBottom:     AppTheme.spacing.md,
  },
  photoPlaceholder: {
    color:    AppTheme.colors.border,
    fontSize: AppTheme.typography.body,
  },
  photo: {
    width:  '100%',
    height: '100%',
  },
  buttonRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    width:           '100%',
    marginBottom:    AppTheme.spacing.md,
  },
  actionButton: {
    flex:          1,
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    marginHorizontal: AppTheme.spacing.xs,
    borderRadius:    AppTheme.roundness,
    alignItems:     'center',
    elevation:      2,
  },
  analyzeButton: {
    width:          '100%',
    marginVertical: AppTheme.spacing.md,
    elevation:      4,
  },
  actionText: {
    color:      '#fff',
    fontSize:   AppTheme.typography.body,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  card: {
    width:         '100%',
    backgroundColor: AppTheme.colors.card,
    borderRadius:  AppTheme.roundness,
    padding:       AppTheme.spacing.md,
    elevation:     2,
    marginTop:     AppTheme.spacing.md,
  },
  cardTitle: {
    fontSize:   AppTheme.typography.h3,
    fontWeight: 'bold',
    marginBottom: AppTheme.spacing.sm,
    color:      AppTheme.colors.text,
  },
  summary: {
    fontSize:   AppTheme.typography.body,
    marginBottom: AppTheme.spacing.md,
    color:      AppTheme.colors.text,
  },
  dishContainer: {
    borderTopWidth: 1,
    borderColor:    AppTheme.colors.border,
    paddingVertical: AppTheme.spacing.sm,
  },
  dishHeader: {
    paddingVertical: AppTheme.spacing.xs,
  },
  dishText: {
    fontSize:   AppTheme.typography.body,
    fontWeight: '500',
    color:      AppTheme.colors.text,
  },
  macroTable: {
    paddingLeft: AppTheme.spacing.md,
  },
  macroRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: AppTheme.spacing.xs,
  },
  macroName: {
    fontSize: AppTheme.typography.small,
    color:    AppTheme.colors.text,
  },
  macroValue: {
    fontSize: AppTheme.typography.small,
    color:    AppTheme.colors.text,
  },
  privacyRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginVertical: AppTheme.spacing.sm,
    width:          '100%',
  },
  label: {
    fontSize: AppTheme.typography.body,
    color:    AppTheme.colors.text,
  },
  saveButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius:    AppTheme.roundness,
    alignItems:      'center',
    marginTop:       AppTheme.spacing.xl,
    elevation:       2,
    width:           '100%',
  },
  saveButtonText: {
    color:      '#fff',
    fontSize:   AppTheme.typography.body,
    fontWeight: '600',
  },
});
