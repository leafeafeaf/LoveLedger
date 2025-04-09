// screens/diary/DiaryDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LibraryStackParamList, RootStackParamList } from '../../types';
import { useDiaryDetail } from '../../hooks/useDiaryDetail';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { theme } from '../../utils/theme';
import Header from '../../components/common/Header';
import MoodIcon from '../../components/common/MoodIcon';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DiaryDetailScreenProps = NativeStackScreenProps<LibraryStackParamList, 'DiaryDetail'>;
type RootNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type MoodType = 'happy' | 'angry' | 'peaceful' | 'sad';

export default function DiaryDetailScreen({ navigation, route }: DiaryDetailScreenProps) {
  const { id } = route.params;
  const { data, isLoading, error } = useDiaryDetail(id);
  const { isLoading: isReduxLoading } = useSelector((state: RootState) => state.content.diary);
  const rootNavigation = useNavigation<RootNavigationProp>();

  // mood 값을 MoodType으로 변환하는 함수
  const getMoodText = (mood: number | string): MoodType => {
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

  // 편집 화면으로 이동
  const handleEdit = () => {
    if (data) {
      rootNavigation.navigate('Diary', {
        screen: 'DiaryEdit',
        params: {
          id: id,
          date: data.data.targetDate,
          title: data.data.title,
          content: data.data.content,
          mood: getMoodText(data.data.mood),
        },
      });
    }
  };

  if (isLoading || isReduxLoading) {
    return (
      <View style={styles.container}>
        <Header title="일기 상세" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Header title="일기 상세" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error?.message || '일기를 불러오는데 실패했습니다.'}</Text>
        </View>
      </View>
    );
  }

  const moodText = getMoodText(data.data.mood);

  // 상세 보기 UI
  return (
    <View style={styles.container}>
      <Header 
        title="일기 상세" 
        showBack={true} 
        onBack={() => navigation.goBack()}
        rightElement={
          <Text style={styles.editButton} onPress={handleEdit}>
            수정
          </Text>
        }
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{data.data.title}</Text>
            <View style={styles.moodContainer}>
              <MoodIcon mood={moodText} size={32} color={theme.colors.primary} />
            </View>
          </View>
          <Text style={styles.date}>{data.data.targetDate}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.contentText}>{data.data.content}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.metadata}>작성일: {data.data.createdAt}</Text>
          <Text style={styles.metadata}>수정일: {data.data.updatedAt}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  moodContainer: {
    marginLeft: theme.spacing.md,
  },
  date: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  metadata: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  editButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});