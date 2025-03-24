import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types";

type DiaryEditScreenProps = NativeStackScreenProps<
  DiaryStackParamList,
  "DiaryEdit"
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

export default function DiaryEditScreen({
  navigation,
  route,
}: DiaryEditScreenProps) {
  const {
    id,
    date,
    title: initialTitle,
    content: initialContent,
    mood: initialMood,
  } = route.params;

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent || "");
  const [selectedMood, setSelectedMood] = useState(initialMood || "happy");
  const [expense, setExpense] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      return new Date(date);
    } catch (e) {
      return new Date();
    }
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const moods: Mood[] = [
    { id: "happy", icon: "emoticon-happy", label: "행복함" },
    { id: "excited", icon: "emoticon-excited", label: "설렘" },
    { id: "peaceful", icon: "emoticon-cool", label: "평온함" },
    { id: "sad", icon: "emoticon-sad", label: "슬픔" },
  ];

  // 일기 저장 처리
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    // TODO: 실제 저장 로직 구현
    Alert.alert("저장 완료", "다이어리가 수정되었습니다.", [
      { text: "확인", onPress: () => navigation.navigate("DiaryCreate") },
    ]);
  };

  // 일기 삭제 처리
  const handleDelete = () => {
    Alert.alert("삭제 확인", "정말로 이 다이어리를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          // TODO: 실제 삭제 로직 구현
          Alert.alert("삭제 완료", "다이어리가 삭제되었습니다.", [
            { text: "확인", onPress: () => navigation.navigate("DiaryCreate") },
          ]);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Header
        title="일기 수정"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
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
          placeholder="제목을 입력하세요..."
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={theme.colors.textLight}
        />
        <View style={styles.moodSelector}>
          <Text style={styles.sectionTitle}>기분은 어땠나요?</Text>
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
          <Text style={styles.sectionTitle}>지출 금액</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="금액 입력"
            value={expense}
            onChangeText={setExpense}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textLight}
          />
        </View>
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor={theme.colors.textLight}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <MaterialCommunityIcons
            name="delete"
            size={24}
            color={theme.colors.error}
          />
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <MaterialCommunityIcons
            name="content-save"
            size={24}
            color={theme.colors.white}
          />
          <Text style={styles.saveButtonText}>저장</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
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
    color: theme.colors.text,
    ...theme.shadows.small,
  },
  contentInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 200,
    ...theme.shadows.small,
  },
  footer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.medium,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
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
});
