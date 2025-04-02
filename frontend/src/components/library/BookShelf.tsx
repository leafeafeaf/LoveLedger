// components/library/BookShelf.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, Pressable, Alert } from 'react-native';
import { theme } from '../../utils/theme';
import BookItem from './BookItem';
import { BookItem as BookItemType } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  deleteSeriesStart, 
  deleteSeriesSuccess, 
  deleteSeriesFailure,
  fetchFictionListStart,
  fetchFictionListSuccess,
  fetchFictionListFailure
} from '../../store/contentSlice';
import { axiosInstance } from '../../api/axios';

interface BookShelfProps {
  title: string;
  books: BookItemType[];
  onSelectBook: (book: BookItemType) => void;
  type: 'diary' | 'story';
  seriesId?: number;  // 시리즈 ID 추가
}

const BookShelf: React.FC<BookShelfProps> = ({ title, books, onSelectBook, type, seriesId }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.content.seriesDelete);

  const refreshFictionList = async () => {
    try {
      dispatch(fetchFictionListStart());
      const response = await axiosInstance.get("/fiction", {
        params: {
          pageno: 1,
          size: 50,
          sort: "DESC"
        }
      });
      dispatch(fetchFictionListSuccess(response.data.data));
    } catch (error) {
      dispatch(fetchFictionListFailure(error instanceof Error ? error.message : "소설 목록을 불러오는데 실패했습니다."));
    }
  };

  const handleLongPress = async () => {
    if (type === 'story' && seriesId) {
      Alert.alert(
        '시리즈 삭제',
        '이 시리즈의 모든 소설이 삭제됩니다. 계속하시겠습니까?',
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
    if (!seriesId) return;
    
    try {
      dispatch(deleteSeriesStart());
      await axiosInstance.delete(`/series/${seriesId}`);
      dispatch(deleteSeriesSuccess());
      await refreshFictionList(); // 삭제 후 목록 새로고침
      Alert.alert('성공', '시리즈가 삭제되었습니다.');
    } catch (error) {
      dispatch(deleteSeriesFailure(error instanceof Error ? error.message : "시리즈 삭제에 실패했습니다."));
      Alert.alert('오류', '시리즈 삭제에 실패했습니다.');
    }
  };

  if (books.length === 0) return null;
  
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookItem 
            item={item} 
            onPress={() => onSelectBook(item)}
            type={type}
          />
        )}
        contentContainerStyle={styles.booksContainer}
      />
      <Pressable
        onLongPress={handleLongPress}
        disabled={isLoading || type !== 'story' || !seriesId}
      >
        <ImageBackground
          source={require('../../../assets/images/common/wood.jpg')}
          style={styles.shelf}
          resizeMode="cover"
        >
          <View style={styles.labelContainer}>
            <Text style={styles.shelfLabel}>{title}</Text>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  booksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  shelf: {
    height: 20,
    justifyContent: 'center',
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  labelContainer: {
    backgroundColor: 'rgba(114, 75, 50, 0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  shelfLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default BookShelf;