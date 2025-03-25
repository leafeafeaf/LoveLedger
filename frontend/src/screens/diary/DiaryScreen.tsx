import React, { useState } from "react";
import DatePicker from "../../components/common/DatePicker";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types";

type DiaryScreenProps = NativeStackScreenProps<
  DiaryStackParamList,
  "DiaryCreate"
>;

// 감정 아이콘 타입 정의
type MoodIconType =
  | "emoticon-happy"
  | "emoticon-excited"
  | "emoticon-cool"
  | "emoticon-sad";

interface Mood {
  id: string;
  icon: MoodIconType;
  label: string;
}

export default function DiaryScreen({ navigation, route }: DiaryScreenProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("happy");
  const [expense, setExpense] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const moods: Mood[] = [
    { id: "happy", icon: "emoticon-happy", label: "Happy" },
    { id: "excited", icon: "emoticon-excited", label: "Excited" },
    { id: "peaceful", icon: "emoticon-cool", label: "Peaceful" },
    { id: "sad", icon: "emoticon-sad", label: "Sad" },
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Header title="일기" showBack={true} onBack={() => navigation.goBack()} />
      <DatePicker
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
            {selectedDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
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
                  selectedMood === mood.id && styles.selectedMoodOption,
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <MaterialCommunityIcons
                  name={mood.icon}
                  size={24}
                  color={
                    selectedMood === mood.id
                      ? theme.colors.white
                      : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.id && styles.selectedMoodLabel,
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
        />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <MaterialCommunityIcons
            name="content-save"
            size={24}
            color={theme.colors.white}
          />
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  moodSelector: {
    marginBottom: theme.spacing.xl,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodOption: {
    alignItems: "center",
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
