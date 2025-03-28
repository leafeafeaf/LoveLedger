// screens/diary/DiaryDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../utils/theme';
import WoodHeader from '../../components/common/WoodHeader';
import MoodIcon from '../../components/common/MoodIcon';

// 로컬 타입 정의
type DiaryDetailParams = {
  id: string;
  date: string;
  mood?: string;
};

type Props = NativeStackScreenProps<
  { DiaryDetail: DiaryDetailParams },
  'DiaryDetail'
>;

const DiaryDetailScreen = ({ navigation, route }: Props) => {
  const { id, date, mood } = route.params;
  
  // 실제 다이어리 데이터는 id를 기반으로 가져오는 로직이 필요합니다
  // 여기서는 예시로 더미 데이터를 사용합니다
  const diaryData = {
    id,
    title: '다이어리 제목',
    content: '여기에 다이어리 내용이 표시됩니다. 이 부분은 실제 데이터베이스나 상태에서 가져온 데이터로 대체해야 합니다.',
    date,
    mood: mood || 'happy',
  };

  // 편집 화면으로 이동
  const handleEdit = () => {
    navigation.navigate('Diary', {
      screen: 'DiaryEdit',
      params: {
        id: diaryData.id,
        date: diaryData.date,
        title: diaryData.title,
        content: diaryData.content,
        mood: diaryData.mood,
      },
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // 기분에 따른 한글 텍스트 반환
  const getMoodText = (mood: string): string => {
    switch (mood) {
      case 'happy': return '행복';
      case 'excited': return '설렘';
      case 'peaceful': return '평온';
      case 'sad': return '슬픔';
      default: return '행복';
    }
  };

  return (
    <View style={styles.container}>
      <WoodHeader
        title="Diary"
        showBack={true}
        onBack={() => navigation.goBack()}
      />
      
      <ImageBackground
        source={require('../../../assets/images/library/library_bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{diaryData.title}</Text>
              <Text style={styles.date}>{formatDate(diaryData.date)}</Text>
            </View>
            
            <View style={styles.moodContainer}>
              <MoodIcon 
                mood={diaryData.mood as any} 
                size={40} 
                showLabel={true} 
                color="#F6C324"
              />
            </View>
          </View>
          
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{diaryData.content}</Text>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Pressable
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>수정하기</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  moodContainer: {
    alignItems: 'center',
  },
  contentBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  footer: {
    padding: 16,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#F6C324',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DiaryDetailScreen;