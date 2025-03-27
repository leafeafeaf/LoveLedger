// components/library/BookShelf.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { theme } from '../../utils/theme';
import BookItem from './BookItem';
import { BookItem as BookItemType } from '../../types';

interface BookShelfProps {
  title: string;
  books: BookItemType[];
  onSelectBook: (book: BookItemType) => void;
  type: 'diary' | 'story';
}

const BookShelf: React.FC<BookShelfProps> = ({ title, books, onSelectBook, type }) => {
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
      <ImageBackground
        source={require('../../../assets/images/common/wood.jpg')}
        style={styles.shelf}
        resizeMode="cover"
      >
        <View style={styles.labelContainer}>
          <Text style={styles.shelfLabel}>{title}</Text>
        </View>
      </ImageBackground>
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