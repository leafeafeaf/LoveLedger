// components/library/BookItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { BookItem as BookItemType } from '../../types';
import MoodIcon from '../common/MoodIcon';
import { theme } from '../../utils/theme';

interface BookItemProps {
  item: BookItemType;
  onPress: () => void;
  type: 'diary' | 'story';
}

const BookItem: React.FC<BookItemProps> = ({ item, onPress, type }) => {
  const { width } = Dimensions.get('window');
  const bookWidth = (width - 80) / 3; // 3개씩 표시, 양 옆 마진 고려

  // 스토리는 이미지, 다이어리는 색상과 기분 아이콘 사용
  const renderContent = () => {
    if (type === 'story') {
      // 책 표지 이미지 결정
      let imageSource;
      if (item.id === '1') imageSource = require('../../../assets/images/library/book_image_1.png');
      else if (item.id === '2') imageSource = require('../../../assets/images/library/book_image_2.png');
      else if (item.id === '3') imageSource = require('../../../assets/images/library/book_image_3.png');
      else if (item.id === '4') imageSource = require('../../../assets/images/library/book_image_4.png');
      else imageSource = require('../../../assets/images/library/book_image_5.png');
      
      return <Image source={imageSource} style={styles.coverImage} resizeMode="cover" />;
    } else {
      // 다이어리는 색상 배경과 기분 아이콘 사용
      const backgroundColor = getMoodColor(item.mood);
      
      return (
        <View style={[styles.diaryContent, { backgroundColor }]}>
          <MoodIcon mood={item.mood as any || 'happy'} size={32} color="white" />
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
      case 'excited': return '#55CDFC'; // 하늘색
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