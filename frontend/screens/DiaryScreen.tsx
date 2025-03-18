import React, { useState } from 'react';
import DatePicker from '../components/DatePicker';
import Header from '../components/Header';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function DiaryScreen({ route, navigation }) {  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [expense, setExpense] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const moods = [
    { id: 'happy', icon: 'emoticon-happy', label: 'Happy' },
    { id: 'excited', icon: 'emoticon-excited', label: 'Excited' },
    { id: 'peaceful', icon: 'emoticon-cool', label: 'Peaceful' },
    { id: 'sad', icon: 'emoticon-sad', label: 'Sad' },
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Write Diary</Text>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Main')}
          >
            <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Capture your memories</Text>
        </View>
      </View>      <DatePicker 
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      <ScrollView style={styles.content}>
        <Pressable 
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons 
            name="calendar" 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </Text>
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={20} 
            color={theme.colors.primary} 
          />
        </Pressable>
        <TextInput
          style={styles.titleInput}
          placeholder="Title your memory..."
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={theme.colors.textLight}
        />

        <View style={styles.moodSelector}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodOptions}>
            {moods.map((mood) => (
              <Pressable
                key={mood.id}
                style={[
                  styles.moodOption,
                  selectedMood === mood.id && styles.selectedMoodOption
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <MaterialCommunityIcons
                  name={mood.icon}
                  size={24}
                  color={selectedMood === mood.id ? theme.colors.white : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.id && styles.selectedMoodLabel
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.expenseInput}>
          <Text style={styles.sectionTitle}>Add Expense</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="$ Amount"
            value={expense}
            onChangeText={setExpense}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textLight}
          />
        </View>

        <TextInput
          style={styles.contentInput}
          placeholder="Write your story..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor={theme.colors.textLight}
        />      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <MaterialCommunityIcons name="content-save" size={24} color={theme.colors.white} />
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },  header: {
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerButtons: {
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
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: -theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  moodSelector: {
    marginBottom: theme.spacing.xl,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  selectedMoodOption: {
    backgroundColor: theme.colors.primary,
  },
  moodLabel: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  selectedMoodLabel: {
    color: theme.colors.white,
  },
  expenseInput: {
    marginBottom: theme.spacing.xl,
  },
  amountInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    ...theme.shadows.small,
  },
  contentInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    minHeight: 200,
    ...theme.shadows.small,
  },
});