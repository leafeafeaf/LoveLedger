import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import Header from "../../components/common/Header";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types";

type DiaryListScreenProps = NativeStackScreenProps<
  DiaryStackParamList,
  "DiaryList"
>;

// 임시 다이어리 데이터 타입
interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  mood: string;
  preview: string;
}

export default function DiaryListScreen({ navigation }: DiaryListScreenProps) {
  // 임시 데이터
  const [diaries, setDiaries] = useState<DiaryEntry[]>([
    {
      id: "1",
      title: "우리의 첫 데이트",
      date: "2023-03-15",
      mood: "happy",
      preview: "오늘은 정말 특별한 날이었어. 처음으로 같이 영화를 보고...",
    },
    {
      id: "2",
      title: "기념일 저녁 식사",
      date: "2023-03-20",
      mood: "excited",
      preview: "100일을 맞아 특별한 레스토랑에서 저녁을 먹었다...",
    },
    {
      id: "3",
      title: "주말 나들이",
      date: "2023-03-25",
      mood: "peaceful",
      preview: "한강에서 피크닉을 즐기며 여유로운 시간을 보냈다...",
    },
  ]);

  // 일기 작성 화면으로 이동
  const handleCreateDiary = () => {
    navigation.navigate("DiaryCreate");
  };

  // 일기 상세 화면으로 이동
  const handleDiaryPress = (diary: DiaryEntry) => {
    navigation.navigate("DiaryEdit", {
      id: diary.id,
      date: diary.date,
      title: diary.title,
      content: diary.preview,
      mood: diary.mood,
    });
  };

  // 무드 아이콘 렌더링
  const renderMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return (
          <MaterialCommunityIcons
            name="emoticon-happy"
            size={24}
            color={theme.colors.primary}
          />
        );
      case "excited":
        return (
          <MaterialCommunityIcons
            name="emoticon-excited"
            size={24}
            color={theme.colors.primary}
          />
        );
      case "peaceful":
        return (
          <MaterialCommunityIcons
            name="emoticon-cool"
            size={24}
            color={theme.colors.primary}
          />
        );
      case "sad":
        return (
          <MaterialCommunityIcons
            name="emoticon-sad"
            size={24}
            color={theme.colors.primary}
          />
        );
      default:
        return (
          <MaterialCommunityIcons
            name="emoticon"
            size={24}
            color={theme.colors.primary}
          />
        );
    }
  };

  // 각 일기 항목 렌더링
  const renderDiaryItem = ({ item }: { item: DiaryEntry }) => (
    <Pressable style={styles.diaryItem} onPress={() => handleDiaryPress(item)}>
      <View style={styles.diaryHeader}>
        <Text style={styles.diaryTitle}>{item.title}</Text>
        {renderMoodIcon(item.mood)}
      </View>
      <Text style={styles.diaryDate}>
        {new Date(item.date).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <Text style={styles.diaryPreview} numberOfLines={2}>
        {item.preview}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header title="다이어리" subtitle="소중한 추억을 기록하세요" />

      <FlatList
        data={diaries}
        renderItem={renderDiaryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleCreateDiary}>
        <MaterialCommunityIcons
          name="plus"
          size={24}
          color={theme.colors.white}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  diaryItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  diaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  diaryDate: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  diaryPreview: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  addButton: {
    position: "absolute",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.medium,
  },
});
