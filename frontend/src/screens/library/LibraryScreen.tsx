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
  ActivityIndicator,
} from "react-native";
import { MainTabScreenProps, LibraryStackParamList, LibraryScreenProps } from "../../types";
import { BookItem as BookItemType } from "../../types";
import { DiaryContent } from "../../store/contentSlice";
import SearchBar from "../../components/library/SearchBar";
import ViewToggle from "../../components/library/ViewToggle";
import ContentToggle from "../../components/library/ContentToggle";
import BookShelf from "../../components/library/BookShelf";
import BookListItem from "../../components/library/BookListItem";
import { theme } from "../../utils/theme";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchFictionListStart, fetchFictionListSuccess, fetchFictionListFailure, fetchDiaryListStart, fetchDiaryListSuccess, fetchDiaryListFailure } from "../../store/contentSlice";
import { axiosInstance } from "../../api/axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDiaryList } from '../../hooks/useDiaryList';

type Props = LibraryScreenProps<"LibraryMain">;

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const [activeView, setActiveView] = useState<"album" | "list">("album");
  const [activeContent, setActiveContent] = useState<"diaries" | "stories">(
    "stories"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { width } = Dimensions.get("window");
  const dispatch = useDispatch();
  const { series, isLoading: isFictionLoading } = useSelector((state: RootState) => state.content.fictionList);
  const { diaries, isLoading: isDiaryLoading } = useSelector((state: RootState) => state.content.diary);
  const { data: diaryData, isLoading: isDiaryQueryLoading } = useDiaryList();

  // API 데이터 가져오기
  useEffect(() => {
    const fetchFictionList = async () => {
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

    const fetchDiaryList = async () => {
      try {
        dispatch(fetchDiaryListStart());
        const response = await axiosInstance.get('/diary', {
          params: {
            page: 1,
            size: 50,
            sort: 'DESC'
          }
        });
        dispatch(fetchDiaryListSuccess(response.data.data.content));
      } catch (error) {
        dispatch(fetchDiaryListFailure(error instanceof Error ? error.message : '일기 목록을 불러오는데 실패했습니다.'));
      }
    };

    fetchFictionList();
    fetchDiaryList();
  }, [dispatch]);

  // Filter books by search query
  const filteredBooks: BookItemType[] = 
    activeContent === "diaries" 
      ? diaries.map((diary) => ({
          id: String(diary.id),
          title: diary.title,
          date: diary.targetDate,
          type: 'diary' as const,
          mood: diary.mood || 'happy',
          content: diary.content,
          createdAt: diary.createdAt,
          updatedAt: diary.updatedAt || undefined,
          theme: '',
          coverImage: '',
          seriesId: 0
        }))
      : series.flatMap(series => 
          series.fictions.map(fiction => ({
            id: fiction.createat,
            title: fiction.title,
            date: new Date(fiction.createat).toISOString().split('T')[0],
            type: "story" as const,
            theme: series.seriesname,
            coverImage: fiction.arturl,
            seriesId: series.seriesid,
          }))
        ).filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Group books by month (for diaries) or series (for stories)
  const groupedBooks = filteredBooks.reduce((acc, item) => {
    let key;

    if (activeContent === "diaries") {
      const date = new Date(item.date);
      key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    } else {
      key = item.theme || "Default Series";
    }

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {} as Record<string, BookItemType[]>);

  // Sort groups by date (for diaries) or alphabetically (for stories)
  const sortedGroupKeys = Object.keys(groupedBooks).sort((a, b) => {
    if (activeContent === "diaries") {
      return b.localeCompare(a); // 최신 날짜가 먼저 오도록 정렬
    } else {
      return a.localeCompare(b); // 알파벳 순으로 정렬
    }
  });

  // Handle book selection
  const handleSelectBook = (book: BookItemType) => {
    if (book.type === "diary") {
      // 일반적인 navigate 호출
      navigation.navigate("DiaryDetail", {
        id: book.id,
        date: book.date,
        mood: book.mood,
      });
    } else {
      // 일반적인 navigate 호출
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
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <ViewToggle activeView={activeView} onToggle={setActiveView} />
      </View>

      <ContentToggle
        activeContent={activeContent}
        onToggle={setActiveContent}
      />
    </View>
  );

  // 로딩 상태 렌더링
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
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
          seriesId={activeContent === 'stories' ? groupedBooks[key][0]?.seriesId : undefined}
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
          type={activeContent === "stories" ? "story" : "diary"}
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

        {isFictionLoading || isDiaryQueryLoading ? renderLoading() : (
          activeView === "album" ? renderAlbumView() : renderListView()
        )}
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
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  bgContainer: {
    flex: 1,
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LibraryScreen;
