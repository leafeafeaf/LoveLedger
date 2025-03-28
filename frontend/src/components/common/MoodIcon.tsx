// components/common/MoodIcon.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MoodType = 'happy' | 'excited' | 'peaceful' | 'sad';

interface MoodIconProps {
  mood: MoodType;
  size?: number;
  showLabel?: boolean;
  color?: string;
}

const MoodIcon: React.FC<MoodIconProps> = ({
  mood,
  size = 24,
  showLabel = false,
  color = '#F6C324',
}) => {
  const moodData = {
    happy: { icon: 'emoticon-happy', label: '행복' },
    excited: { icon: 'emoticon-excited', label: '설렘' },
    peaceful: { icon: 'emoticon-cool', label: '평온' },
    sad: { icon: 'emoticon-sad', label: '슬픔' },
  };

  const { icon, label } = moodData[mood];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={size} color={color} />
      {showLabel && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default MoodIcon;