// screens/diary/DiaryEditScreen.tsx
import React, { useState } from "react";
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
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DiaryStackParamList, RootStackParamList } from "../../types";
import WoodHeader from "../../components/common/WoodHeader";
import DatePicker from "../../components/common/DatePicker";
import { useDiaryUpdate } from "../../hooks/useDiaryUpdate";
import { useDiaryDelete } from '../../hooks/useDiaryDelete';
import { useNavigation } from '@react-navigation/native';

type DiaryEditScreenProps = NativeStackScreenProps<
  DiaryStackParamList,
  "DiaryEdit"
>;

// 기분 타입 정의
type MoodType = "happy" | "angry" | "peaceful" | "sad";

interface MoodOption {
  id: MoodType;
  label: string;
  icon: string;
}

// mood 값을 MoodType으로 변환하는 함수
const getMoodText = (mood: number | string | undefined): MoodType => {
  if (mood === undefined) return 'happy';
  
  switch (mood) {
    case 1:
    case 'happy':
      return 'happy';
    case 2:
    case 'angry':
      return 'angry';
    case 3:
    case 'peaceful':
      return 'peaceful';
    case 4:
    case 'sad':
      return 'sad';
    default:
      return 'happy';
  }
};

// MoodType을 숫자로 변환하는 함수
const getMoodNumber = (mood: MoodType): number => {
  switch (mood) {
    case 'happy':
      return 1;
    case 'angry':
      return 2;
    case 'peaceful':
      return 3;
    case 'sad':
      return 4;
    default:
      return 1;
  }
};

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
  const [selectedMood, setSelectedMood] = useState<MoodType>(initialMood as MoodType);
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      return new Date(date);
    } catch (e) {
      return new Date();
    }
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { mutate: updateDiary, isPending } = useDiaryUpdate(id);
  const { mutate: deleteDiary, isPending: isDeleting } = useDiaryDelete();

  // 루트 네비게이션 가져오기
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 기분 옵션
  const moods: MoodOption[] = [
    { id: "happy", icon: "emoticon-happy", label: "행복함" },
    { id: "angry", icon: "emoticon-angry", label: "화남" },
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

    updateDiary(
      {
        title: title.trim(),
        content: content.trim(),
        targetDate: selectedDate.toISOString().split('T')[0],
        mood: getMoodNumber(selectedMood),
      },
      {
        onSuccess: () => {
          Alert.alert("성공", "일기가 수정되었습니다.", [
            { text: "확인", onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error) => {
          Alert.alert("오류", error.message);
        },
      }
    );
  };

  // 일기 삭제 처리
  const handleDelete = () => {
    Alert.alert("삭제 확인", "정말로 이 일기를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteDiary(id, {
            onSuccess: () => {
              Alert.alert("삭제 완료", "일기가 삭제되었습니다.", [
                {
                  text: "확인",
                  onPress: () => {
                    // DiaryEditScreen 닫기
                    navigation.goBack();
                    // DiaryDetailScreen도 닫기
                    rootNavigation.goBack();
                  },
                },
              ]);
            },
            onError: (error) => {
              Alert.alert("오류", error.message);
            },
          });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <WoodHeader
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

      <ImageBackground
        source={require("../../../assets/images/library/library_bg.png")}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.content}>
          <Pressable
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#F6C324" />
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
              color="#F6C324"
            />
          </Pressable>

          <TextInput
            style={styles.titleInput}
            placeholder="다이어리 제목"
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
                    name={mood.icon as any}
                    size={24}
                    color={selectedMood === mood.id ? "white" : "#F6C324"}
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
          <Pressable 
            style={styles.deleteButton} 
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <MaterialCommunityIcons
              name="delete"
              size={24}
              color="red"
            />
          </Pressable>
          
          <Pressable 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isPending}
          >
            <MaterialCommunityIcons
              name="content-save"
              size={24}
              color={theme.colors.white}
            />
            <Text style={styles.saveButtonText}>
              {isPending ? "저장 중..." : "저장하기"}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundImage: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
  },
  titleInput: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  moodSelector: {
    marginBottom: 16,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  moodOption: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.small,
  },
  selectedMoodOption: {
    backgroundColor: theme.colors.primary,
  },
  moodLabel: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.text,
  },
  selectedMoodLabel: {
    color: theme.colors.white,
  },
  contentInput: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 200,
    textAlignVertical: "top",
    ...theme.shadows.small,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 16,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EEECE9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6C324",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
