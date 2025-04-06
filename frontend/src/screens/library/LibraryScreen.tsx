import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ImageBackground,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchDiaryListStart, fetchDiaryListSuccess, fetchDiaryListFailure } from "../../store/contentSlice";
import { axiosInstance } from "../../api/axios";
import { useDiaryList } from "../../hooks/useDiaryList";
import { useFictionList } from "../../hooks/useFictionList";
import { BookItem, BookItem as BookItemType } from "../../types";
import SearchBar from "../../components/library/SearchBar";
import ViewToggle from "../../components/library/ViewToggle";
import ContentToggle from "../../components/library/ContentToggle";
import BookShelf from "../../components/library/BookShelf";
import BookListItem from "../../components/library/BookListItem";
import { theme } from "../../utils/theme";
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Library: undefined;
  DiaryDetail: { id: string, date: string, mood: string };
  StoryDetail: { id: string };
  // 다른 화면들 추가...
};

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Library'>;

interface LibraryScreenProps {
  navigation: LibraryScreenNavigationProp;
}

const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const [activeView, setActiveView] = useState<"album" | "list">("album");
  const [activeContent, setActiveContent] = useState<"diaries" | "stories">("stories");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { diaries } = useSelector((state: RootState) => state.content.diary);
  const { data: diaryData, refetch: refetchDiaryList, isLoading: isDiaryLoading } = useDiaryList();
  const { data: fictionData, refetch: refetchFictionList, isLoading: isFictionLoading } = useFictionList({
    pageno: 1,
    size: 50,
    sort: "DESC"
  });

  const moodMap: Record<number, 'happy' | 'angry' | 'peaceful' | 'sad'> = {
    1: 'happy',
    2: 'angry',
    3: 'peaceful',
    4: 'sad',
  };

  // 화면 진입 시마다 새로 fetch
  useFocusEffect(
    useCallback(() => {
      const fetchDiaries = async () => {
        try {
          dispatch(fetchDiaryListStart());
          const response = await axiosInstance.get('/diary', {
            params: { page: 1, size: 50, sort: 'DESC' },
          });
          dispatch(fetchDiaryListSuccess(response.data.data.content));
        } catch (err) {
          dispatch(fetchDiaryListFailure(err instanceof Error ? err.message : '일기 목록을 불러오는데 실패했습니다.'));
        }
      };

      fetchDiaries();
      refetchFictionList();
    }, [dispatch, refetchFictionList])
  );

  const series = fictionData?.series ?? [];

  const filteredBooks: BookItem[] = activeContent === "diaries"
  ? diaries.map((diary) => ({
      id: String(diary.id),
      title: diary.title,
      date: diary.targetDate,
      type: 'diary' as 'diary', // 'diary'로 명확하게 지정
      mood: moodMap[diary.mood] || 'happy',
      content: diary.content,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt || undefined,
      theme: '',
      coverImage: '',
      seriesId: 0,
    }))
  : series.flatMap((s) =>
      s.fictions.map((fiction) => ({
        id: String(fiction.fictionId),
        title: fiction.title,
        date: new Date(fiction.createdAt).toISOString().split('T')[0],
        type: 'story' as 'story', // 'story'로 명확하게 지정
        theme: s.seriesName,
        coverImage: fiction.artUrl,
        seriesId: s.seriesId,
      }))
    ).filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const groupedBooks = filteredBooks.reduce((acc, item) => {
    const key = item.type === "diary"
      ? `${new Date(item.date).getFullYear()}/${String(new Date(item.date).getMonth() + 1).padStart(2, "0")}`
      : item.theme || "Default Series";

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, BookItemType[]>);

  const sortedGroupKeys = Object.keys(groupedBooks).sort((a, b) =>
    activeContent === "diaries" ? b.localeCompare(a) : a.localeCompare(b)
  );

  const handleSelectBook = (book: BookItemType) => {
    if (book.type === "diary") {
      navigation.navigate("DiaryDetail", {
        id: book.id,
        date: book.date,
        mood: book.mood,
      });
    } else {
      navigation.navigate("StoryDetail", { id: book.id });
    }
  };

  const renderAlbumView = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
      <ImageBackground
        source={require("../../../assets/images/common/wood.jpg")}
        style={styles.header}
      >
        <StatusBar barStyle="light-content" />
        <Text style={styles.headerTitle}>Library</Text>
      </ImageBackground>

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

        <View style={styles.controlsContainer}>
          <View style={styles.searchContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <ViewToggle activeView={activeView} onToggle={setActiveView} />
          </View>
          <ContentToggle activeContent={activeContent} onToggle={setActiveContent} />
        </View>

        {(isDiaryLoading || isFictionLoading)
          ? <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingContainer} />
          : activeView === "album"
            ? renderAlbumView()
            : renderListView()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 72, paddingBottom: 16, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "white" },
  bgContainer: { flex: 1, width: "100%" },
  logoContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  logo: { width: 200, height: 200 },
  controlsContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  listContent: { backgroundColor: "#FFFBF2" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default LibraryScreen;
