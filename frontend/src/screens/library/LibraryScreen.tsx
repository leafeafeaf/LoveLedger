// screens/library/LibraryScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ImageBackground,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MainTabScreenProps } from "../../types";
import { BookItem as BookItemType } from "../../types";
import SearchBar from "../../components/library/SearchBar";
import ViewToggle from "../../components/library/ViewToggle";
import ContentToggle from "../../components/library/ContentToggle";
import BookShelf from "../../components/library/BookShelf";
import BookListItem from "../../components/library/BookListItem";
import { theme } from "../../utils/theme";

type Props = MainTabScreenProps<"Library">;

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const [activeView, setActiveView] = useState<"album" | "list">("album");
  const [activeContent, setActiveContent] = useState<"diaries" | "stories">("stories");
  const [searchQuery, setSearchQuery] = useState("");
  const { width } = Dimensions.get("window");

  // Mock data
  const mockDiaries: BookItemType[] = [
    {
      id: "1",
      title: "Our First Date",
      date: "2024-03-13",
      type: "diary",
      mood: "happy",
    },
    {
      id: "2",
      title: "Weekend Getaway",
      date: "2024-03-12",
      type: "diary",
      mood: "excited",
    },
    {
      id: "3",
      title: "Coffee Shop Meeting",
      date: "2024-03-11",
      type: "diary",
      mood: "peaceful",
    },
    {
      id: "4",
      title: "Our First Trade",
      date: "2024-02-15",
      type: "diary",
      mood: "peaceful",
    },
    {
      id: "5",
      title: "Anything",
      date: "2024-02-10",
      type: "diary",
      mood: "happy",
    },
  ];

  const mockStories: BookItemType[] = [
    {
      id: "1",
      title: "Our Love Story",
      date: "2024-03-13",
      type: "story",
      theme: "Series 1",
    },
    {
      id: "2",
      title: "Future Dreams",
      date: "2024-03-10",
      type: "story",
      theme: "Series 1",
    },
    {
      id: "3",
      title: "The Vacation",
      date: "2024-03-05",
      type: "story",
      theme: "Series 1",
    },
    {
      id: "4",
      title: "The Concert",
      date: "2024-02-20",
      type: "story",
      theme: "Series 2",
    },
    {
      id: "5",
      title: "First Meeting",
      date: "2024-02-15",
      type: "story",
      theme: "Series 2",
    },
  ];

  // Filter books by search query
  const filteredBooks = 
    activeContent === "diaries" 
      ? mockDiaries.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : mockStories.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Group books by month (for diaries) or series (for stories)
  const groupedBooks = filteredBooks.reduce((acc, item) => {
    let key;
    
    if (activeContent === "diaries") {
      const date = new Date(item.date);
      key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = item.theme || "Default Series";
    }
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(item);
    return acc;
  }, {} as Record<string, BookItemType[]>);

  // Sort groups
  const sortedGroupKeys = Object.keys(groupedBooks).sort().reverse();

  // Handle book selection
  const handleSelectBook = (book: BookItemType) => {
    if (book.type === "diary") {
      navigation.navigate("DiaryDetail", {
        id: book.id,
        date: book.date,
        mood: book.mood,
      });
    } else {
      navigation.navigate("StoryDetail", {
        id: book.id,
      });
    }
  };

  // 헤더 렌더링
  const renderHeader = () => (
    <ImageBackground
      source={require("../../../assets/images/common/wood.jpg")}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" />
      <Text style={styles.headerTitle}>Library</Text>
    </ImageBackground>
  );

  // 컨트롤 영역 렌더링
  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ViewToggle
          activeView={activeView}
          onToggle={setActiveView}
        />
      </View>
      
      <ContentToggle
        activeContent={activeContent}
        onToggle={setActiveContent}
      />
    </View>
  );

  // 앨범 뷰 렌더링
  const renderAlbumView = () => (
    <ScrollView 
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {sortedGroupKeys.map((key) => (
        <BookShelf
          key={key}
          title={key}
          books={groupedBooks[key]}
          onSelectBook={handleSelectBook}
          type={activeContent === 'stories' ? 'story' : 'diary'}
        />
      ))}
    </ScrollView>
  );

  // 리스트 뷰 렌더링
  const renderListView = () => (
    <FlatList
      style={[styles.content, styles.listContent]}
      data={filteredBooks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BookListItem
          item={item}
          onPress={() => handleSelectBook(item)}
          type={activeContent === 'stories' ? 'story' : 'diary'}
        />
      )}
    />
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ImageBackground
        source={require("../../../assets/images/library/library_bg.png")}
        style={styles.bgContainer}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/library/inner_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {renderControls()}

        {activeView === "album" ? renderAlbumView() : renderListView()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 72,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  bgContainer: {
    flex: 1,
    width: "100%",
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logo: {
    width: 200,
    height: 200,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  listContent: {
    backgroundColor: "#FFFBF2", // 연한 베이지색
  },
});

export default LibraryScreen;
