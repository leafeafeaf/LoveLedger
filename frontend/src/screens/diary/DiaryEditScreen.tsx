// screens/diary/DiaryEditScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types";
import WoodHeader from "../../components/common/WoodHeader";
import DatePicker from "../../components/common/DatePicker";

type DiaryEditScreenProps = NativeStackScreenProps<
  DiaryStackParamList,
  "DiaryEdit"
>;

// 기분 타입 정의
type MoodType = 'happy' | 'excited' | 'peaceful' | 'sad';

interface MoodOption {
  id: MoodType;
  label: string;
  icon: string;
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
  const [selectedMood, setSelectedMood] = useState<MoodType>((initialMood as MoodType) || "happy");
  const [expense, setExpense] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      return new Date(date);
    } catch (e) {
      return new Date();
    }
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 기분 옵션
  const moods: MoodOption[] = [
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
      { text: "확인", onPress: () => navigation.navigate("DiaryCreate", {}) },
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
            {
              text: "확인",
              onPress: () => navigation.navigate("DiaryCreate", {}),
            },
          ]);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
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
        source={require('../../../assets/images/library/library_bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.content}>
          <Pressable
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color="#F6C324"
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
                    color={
                      selectedMood === mood.id
                        ? "white"
                        : "#F6C324"
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
              color="red"
            />
          </Pressable>
          
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <MaterialCommunityIcons
              name="content-save"
              size={24}
              color="white"
            />
            <Text style={styles.saveButtonText}>저장하기</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  moodSelector: {
    marginBottom: 16,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodOption: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "white",
    width: '23%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMoodOption: {
    backgroundColor: "#F6C324",
  },
  moodLabel: {
    fontSize: 12,
    color: theme.colors.text,
    marginTop: 4,
  },
  selectedMoodLabel: {
    color: "white",
  },
  expenseInput: {
    marginBottom: 16,
  },
  amountInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: theme.colors.text,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 200,
    marginBottom: 16,
    textAlignVertical: 'top',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
