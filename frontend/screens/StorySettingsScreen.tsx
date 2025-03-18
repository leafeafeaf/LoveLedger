import React, { useState } from 'react';
import DatePicker from '../components/DatePicker';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function StorySettingsScreen({ navigation }) {  const [period, setPeriod] = useState('month');
  const [themeStyle, setThemeStyle] = useState('romantic');
  const [font, setFont] = useState('classic');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const periods = [
    { id: 'week', label: 'Last Week', icon: 'calendar-week' },
    { id: 'month', label: 'Last Month', icon: 'calendar-month' },
    { id: 'quarter', label: 'Last 3 Months', icon: 'calendar-text' },
    { id: 'custom', label: 'Custom Range', icon: 'calendar-range' },
  ];

  const themes = [
    { id: 'romantic', label: 'Romantic', icon: 'heart-multiple' },
    { id: 'fantasy', label: 'Fantasy', icon: 'castle' },
    { id: 'paparazzi', label: 'Paparazzi', icon: 'camera' },
    { id: 'healing', label: 'Healing', icon: 'leaf' },
    { id: 'comedy', label: 'Romantic Comedy', icon: 'emoticon-happy' },
  ];

  const fonts = [
    { id: 'classic', label: 'Classic' },
    { id: 'handwriting', label: 'Handwriting' },
    { id: 'modern', label: 'Modern' },
    { id: 'elegant', label: 'Elegant' },
  ];

  const renderPeriodOption = (item) => (
    <Pressable
      key={item.id}
      style={[styles.optionButton, period === item.id && styles.activeOption]}      onPress={() => {
        if (item.id === 'custom') {
          setShowDatePicker(true);
        } else {
          setPeriod(item.id);
        }
      }}
    >
      <MaterialCommunityIcons 
        name={item.icon} 
        size={20} 
        color={period === item.id ? theme.colors.white : theme.colors.primary} 
      />
      <Text style={[styles.optionText, period === item.id && styles.activeOptionText]}>
        {item.label}
      </Text>
    </Pressable>
  );

  const renderThemeOption = (item) => (
    <Pressable
      key={item.id}
      style={[styles.themeCard, themeStyle === item.id && styles.activeThemeCard]}
      onPress={() => setThemeStyle(item.id)}
    >
      <MaterialCommunityIcons 
        name={item.icon} 
        size={32} 
        color={themeStyle === item.id ? theme.colors.white : theme.colors.primary} 
      />
      <Text style={[styles.themeLabel, themeStyle === item.id && styles.activeThemeLabel]}>
        {item.label}
      </Text>
    </Pressable>
  );

  const renderFontOption = (item) => (
    <Pressable
      key={item.id}
      style={[styles.fontOption, font === item.id && styles.activeFontOption]}
      onPress={() => setFont(item.id)}
    >
      <Text 
        style={[
          styles.fontSample, 
          font === item.id && styles.activeFontSample,
          item.id === 'handwriting' && styles.handwritingFont,
          item.id === 'modern' && styles.modernFont,
          item.id === 'elegant' && styles.elegantFont,
        ]}
      >
        Aa
      </Text>
      <Text style={[styles.fontLabel, font === item.id && styles.activeFontLabel]}>
        {item.label}
      </Text>
    </Pressable>
  );

  return (    <View style={styles.container}>      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Story Settings</Text>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Main')}
          >
            <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Customize your story</Text>
        </View>
      </View>      <DatePicker 
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        isRange={true}
        onSelectRange={(start, end) => {
          setDateRange({ start, end });
          setPeriod('custom');
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Period</Text>
          <View style={styles.optionsRow}>
            {periods.map(renderPeriodOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Theme</Text>
          <View style={styles.themeGrid}>
            {themes.map(renderThemeOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Font</Text>
          <View style={styles.fontGrid}>
            {fonts.map(renderFontOption)}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.nextButton}
          onPress={() => navigation.navigate('SeriesSelection', {
            settings: { period, themeStyle, font }
          })}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={theme.colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },  header: {
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },  subtitleContainer: {
    alignItems: 'center',
    marginTop: -theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
  },
  activeOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  activeOptionText: {
    color: theme.colors.white,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  themeCard: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  activeThemeCard: {
    backgroundColor: theme.colors.primary,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  activeThemeLabel: {
    color: theme.colors.white,
  },
  fontGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontOption: {
    width: '23%',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  activeFontOption: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  fontSample: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  activeFontSample: {
    color: theme.colors.primary,
  },
  handwritingFont: {
    fontStyle: 'italic',
  },
  modernFont: {
    fontWeight: '300',
  },
  elegantFont: {
    fontWeight: '700',
  },
  fontLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  activeFontLabel: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});