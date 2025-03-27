// components/library/BookListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { BookItem as BookItemType } from '../../types';
import MoodIcon from '../common/MoodIcon';

interface BookListItemProps {
  item: BookItemType;
  onPress: () => void;
  type: 'diary' | 'story';
}

const BookListItem: React.FC<BookListItemProps> = ({ item, onPress, type }) => {
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
    <Pressable style={styles.listItem} onPress={onPress}>
      {type === 'story' ? (
        <>
          <Image 
            source={getBookImage(item.id)} 
            style={styles.listItemImage} 
            resizeMode="cover"
          />
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{item.title}</Text>
            <Text style={styles.listItemSubtitle}>{item.theme || "Series"}</Text>
            <Text style={styles.listItemDate}>{formatDate(item.date)}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.moodIconContainer}>
            <MoodIcon 
              mood={item.mood as any || 'happy'} 
              size={28} 
              color="#F6C324" 
            />
          </View>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{item.title}</Text>
            <Text style={styles.listItemDate}>{formatDate(item.date)}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
};

// 책 이미지 가져오는 함수
function getBookImage(id: string) {
  switch(id) {
    case '1': return require('../../../assets/images/library/book_image_1.png');
    case '2': return require('../../../assets/images/library/book_image_2.png');
    case '3': return require('../../../assets/images/library/book_image_3.png');
    case '4': return require('../../../assets/images/library/book_image_4.png');
    default: return require('../../../assets/images/library/book_image_5.png');
  }
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginRight: 12,
  },
  moodIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  listItemDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default BookListItem;