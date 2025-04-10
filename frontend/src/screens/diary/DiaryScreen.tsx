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
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DiaryStackParamList, RootStackParamList } from "../../types";
import { useDiaryCreate } from "../../hooks/useDiaryCreate";

type DiaryScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DiaryStackParamList, "DiaryCreate">,
  NativeStackNavigationProp<RootStackParamList>
>;

type DiaryScreenProps = {
  navigation: DiaryScreenNavigationProp;
  route?: {
    params?: DiaryCreateParams;
  };
};

interface DiaryCreateParams {
  date?: string;
}

// 감정 아이콘 타입 정의
type MoodIconType =
  | "emoticon-happy"
  | "emoticon-angry"
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
  const [selectedDate, setSelectedDate] = useState(() => {
    // route.params에서 날짜를 받아오고, 없으면 현재 날짜 사용
    if (route?.params?.date) {
      return new Date(route.params.date);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { mutate: createDiary, isPending } = useDiaryCreate();

  const moods: Mood[] = [
    { id: "1", icon: "emoticon-happy", label: "행복" },
    { id: "2", icon: "emoticon-angry", label: "화남" },
    { id: "3", icon: "emoticon-cool", label: "평온" },
    { id: "4", icon: "emoticon-sad", label: "슬픔" },
  ];

  const formatDateToYYYYMMDD = (date: Date) => {
    return date.toLocaleDateString("sv-SE"); // "YYYY-MM-DD" 형식 (스웨덴 표준)
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    createDiary(
      {
        title: title.trim(),
        content: content.trim(),
        targetDate: formatDateToYYYYMMDD(selectedDate),
        mood: selectedMood,
      },
      {
        onSuccess: (response) => {
          navigation.replace("DiaryEditDaily", {
            diaryId: response.data.id,
            selectedDate: formatDateToYYYYMMDD(selectedDate),
          });
        },
        onError: (error) => {
          Alert.alert("오류", error.message);
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Header
        title="일기 작성"
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>날짜 선택</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateContent}>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
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
                size={24}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            placeholder="오늘의 일기의 제목을 입력하세요..."
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={theme.colors.textLight}
            style={[
              styles.titleInput,
              { fontWeight: title ? "600" : "normal" },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 기분</Text>
          <View style={styles.moodOptions}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodOption,
                  selectedMood === mood.id && styles.selectedMoodOption,
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <MaterialCommunityIcons
                  name={mood.icon}
                  size={32}
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
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일기 내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="오늘의 이야기를 적어보세요..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textLight}
          />
        </View>
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontWeight: "600",
    color: "#000000",
    marginBottom: theme.spacing.md,
  },
  dateSelector: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
    textAlign: "center",
  },
  titleInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    fontSize: 16,
    color: theme.colors.text,
    ...theme.shadows.small,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  moodOption: {
    flex: 1,
    minWidth: Dimensions.get("window").width * 0.4,
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  selectedMoodOption: {
    backgroundColor: theme.colors.primary,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  selectedMoodLabel: {
    color: theme.colors.white,
  },
  amountInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    fontSize: 16,
    ...theme.shadows.small,
  },
  contentInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    fontSize: 16,
    minHeight: 200,
    ...theme.shadows.small,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
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
});
