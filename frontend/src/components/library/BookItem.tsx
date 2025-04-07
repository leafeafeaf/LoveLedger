// components/library/BookItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, Alert } from 'react-native';
import { BookItem as BookItemType } from '../../types';
import MoodIcon from '../common/MoodIcon';
import { theme } from '../../utils/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  deleteFictionStart, 
  deleteFictionSuccess, 
  deleteFictionFailure,
  fetchFictionListStart,
  fetchFictionListSuccess,
  fetchFictionListFailure
} from '../../store/contentSlice';
import { axiosInstance } from '../../api/axios';

interface BookItemProps {
  item: BookItemType;
  onPress: () => void;
  type: 'diary' | 'story';
}

const BookItem: React.FC<BookItemProps> = ({ item, onPress, type }) => {
  const { width } = Dimensions.get('window');
  const bookWidth = (width - 80) / 3; // 3개씩 표시, 양 옆 마진 고려
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.content.fictionDelete);

  const refreshFictionList = async () => {
    try {
      dispatch(fetchFictionListStart());
      const response = await axiosInstance.get("/fictions", {
        params: {
          pageno: 1,
          size: 50,
          sort: "DESC"
        }
      });

      if (response.data.data && response.data.data.content) {
        // API 응답 데이터 구조를 Redux store에 맞게 변환
        const transformedData = {
          series: response.data.data.content.map((item: any) => ({
            seriesid: item.seriesId,
            seriesname: item.seriesName,
            fictions: item.fictions.map((fiction: any) => ({
              fictionId: fiction.fictionId,
              title: fiction.title,
              artUrl: fiction.artUrl,
              createdAt: fiction.createdAt
            }))
          }))
        };
        dispatch(fetchFictionListSuccess(transformedData));
      } else {
        dispatch(fetchFictionListFailure("잘못된 API 응답 구조입니다."));
      }
    } catch (error) {
      dispatch(fetchFictionListFailure(error instanceof Error ? error.message : "소설 목록을 불러오는데 실패했습니다."));
    }
  };

  const handleLongPress = () => {
    if (type === 'story') {
      Alert.alert(
        '소설 삭제',
        '이 소설을 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: handleDelete,
          },
        ]
      );
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteFictionStart());
      await axiosInstance.delete(`/fictions/${item.id}`);
      dispatch(deleteFictionSuccess());
      await refreshFictionList(); // 삭제 후 목록 새로고침
      Alert.alert('성공', '소설이 삭제되었습니다.');
    } catch (error) {
      dispatch(deleteFictionFailure(error instanceof Error ? error.message : "소설 삭제에 실패했습니다."));
      Alert.alert('오류', '소설 삭제에 실패했습니다.');
    }
  };

  const validMoods = ['happy', 'angry', 'peaceful', 'sad'] as const;
type ValidMood = typeof validMoods[number];

const fallbackMood: ValidMood = 'happy';

  // 스토리는 이미지, 다이어리는 색상과 기분 아이콘 사용
  const renderContent = () => {
    if (type === 'story') {
      return (
        <Image 
          source={{ uri: item.coverImage }} 
          style={styles.coverImage} 
          resizeMode="cover" 
        />
      );
    } else {
      // 다이어리는 색상 배경과 기분 아이콘 사용
      const mood: ValidMood = typeof item.mood === 'string' && validMoods.includes(item.mood as ValidMood)
  ? item.mood as ValidMood
  : fallbackMood;
      const backgroundColor = getMoodColor(mood);
      
      return (
        <View style={[styles.diaryContent, { backgroundColor }]}>
          <MoodIcon mood={mood} size={32} color="white" />
          <Text style={styles.diaryTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.diaryDate}>{formatDate(item.date)}</Text>
        </View>
      );
    }
  };

  // 기분에 따른 색상 반환
  const getMoodColor = (mood?: string): string => {
    switch (mood) {
      case 'happy': return '#F6C324'; // 노랑
      case 'angry': return '#55CDFC'; // 하늘색
      case 'peaceful': return '#FFA7C4'; // 분홍색
      case 'sad': return '#CCCCCC'; // 회색
      default: return '#F6C324'; // 기본 노랑
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  return (
    <Pressable
      style={[styles.container, { width: bookWidth }]}
      onPress={onPress}
      onLongPress={handleLongPress}
      disabled={isLoading}
    >
      {renderContent()}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 160,
    marginHorizontal: 4,
    marginBottom: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  diaryContent: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
  },
  diaryDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
});

export default BookItem;