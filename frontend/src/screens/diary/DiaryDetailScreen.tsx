// screens/diary/DiaryDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LibraryStackParamList, RootStackParamList } from '../../types';
import { useDiaryDetail } from '../../hooks/useDiaryDetail';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { theme } from '../../utils/theme';
import WoodHeader from '../../components/common/WoodHeader';
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

const formatKoreanDateTime = (isoDateString: string): string => {
  const date = new Date(isoDateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours >= 12 ? "오후" : "오전";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${year}년 ${month}월 ${day}일 ${period} ${displayHour}시 ${minutes}분`;
};

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
        <WoodHeader title="일기 상세" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <WoodHeader title="일기 상세" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error?.message || '일기를 불러오는데 실패했습니다.'}</Text>
        </View>
      </View>
    );
  }

  const moodText = getMoodText(data.data.mood);

  return (
    <View style={styles.container}>
      <WoodHeader 
        title="일기 상세" 
        showBack={true} 
        onBack={() => navigation.goBack()}
      />
      
      <ImageBackground
        source={require("../../../assets/images/library/library_bg.png")}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={styles.headerSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{data.data.title}</Text>
                <View style={styles.moodContainer}>
                  <MoodIcon mood={moodText} size={32} color={theme.colors.primary} />
                </View>
              </View>
              <Text style={styles.date}>{data.data.targetDate}</Text>
            </View>
            
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>{data.data.content}</Text>
            </View>
            
            <View style={styles.footerSection}>
              <Text style={styles.metadata}>작성일: {formatKoreanDateTime(data.data.createdAt)}</Text>
              <Text style={styles.metadata}>수정일: {formatKoreanDateTime(data.data.updatedAt)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <Pressable style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>수정하기</Text>
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
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  headerSection: {
    marginBottom: theme.spacing.md,
  },
  contentSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minHeight: 400,
    ...theme.shadows.medium,
  },
  footerSection: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
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
  bottomButtonContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  editButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});