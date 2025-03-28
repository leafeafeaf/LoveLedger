// screens/story/StoryDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Share,
  ImageBackground,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import WoodHeader from "../../components/common/WoodHeader";
import PageTurningView from "../../components/story/PageTurningView";
import BlinkingText from "../../components/common/BlinkingText";
import { theme } from "../../utils/theme";
import { LibraryScreenProps } from "../../types";

// LibraryScreenProps 사용
type Props = LibraryScreenProps<"StoryDetail">;

const { width, height } = Dimensions.get("window");

const StoryDetailScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const [showCover, setShowCover] = useState(true);

  // 실제로는 id를 기반으로 데이터를 가져오는 로직이 필요합니다
  // 여기서는 데모 데이터를 사용합니다
  const storyData = {
    id,
    title: "우리의 사랑 이야기",
    series: "Medium Raw",
    content: `I recognize the men at the bar. And the one woman. They're some of the most respected chefs in America. Most of them are French, but all of them made their bones here. They are, each and every one of them, heroes to me—exactly what I aspire to be. They're who I came to this town to be—gods to up-and-coming line cooks, chefs, and wannabe chefs, and to the soon-to-be-ex-career waiters, bartenders, and floor managers everywhere. TV clearly surprised them, vapors being here, to recognize these guys. I'm surprised at who's not here. I've covertly obtained the list of invitees.

I find it notable who chose not to show at this hastily arranged event. At the last minute, I'm told, Jean-Claude insisted on a venue change, from an Italian coffee shop to this place, an anonymous little tavern. Not a restaurant, not a Four Seasons, not Le Cirque, not Daniel, not a place where any of these guys would be seen, ordinarily. Just a bar. It was the sort of petty touch I'd come to expect from Jean-Claude. A deliberate slight.

My heroes came for Jean-Claude, a man I've never met. I came for them.

I walk up to the bar and squeeze in between a few of the chefs. I order my drink of choice, a shot of Jameson and a beer. The bartender gives me my drink and I quickly down the shot. I'm here because I've been invited, sort of. I've covertly obtained the list of invitees.

I try to seem casual, like I belong here.`,
    date: new Date().toISOString(),
    coverImage: getBookImage(id),
  };

  // 컨텐츠를 여러 페이지로 나누기
  const contentPages = splitContentIntoPages(storyData.content);

  // 모든 페이지 생성 (첫 페이지는 시리즈명과
  const pages = [
    // 첫 번째 페이지: 제목과 시리즈명
    <View key="title-page" style={styles.titlePage}>
      <Text style={styles.seriesName}>{storyData.series}</Text>
      <Text style={styles.bookTitle}>{storyData.title}</Text>
      <View style={styles.contentPreview}>
        <Text style={styles.contentText}>{contentPages[0]}</Text>
      </View>
    </View>,
    // 나머지 페이지: 내용만
    ...contentPages.slice(1).map((pageContent, index) => (
      <View key={`content-page-${index}`} style={styles.contentPage}>
        <Text style={styles.contentText}>{pageContent}</Text>
      </View>
    )),
  ];

  // 표지 화면에서 넘기기 애니메이션 시작
  const handleStartReading = () => {
    setShowCover(false);
  };

  // 공유 기능
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this story: ${storyData.title}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.container}>
      <WoodHeader
        title="Story"
        showBack={true}
        showShare={true}
        onBack={() => navigation.goBack()}
        onShare={handleShare}
      />

      {showCover ? (
        // 표지 화면
        <Pressable style={styles.coverContainer} onPress={handleStartReading}>
          <Image
            source={storyData.coverImage}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverTextContainer}>
            <Text style={styles.coverTitle}>{storyData.title}</Text>
            <Text style={styles.coverDate}>
              {new Date(storyData.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.nextIndicator}>
            <BlinkingText text="Next..." style={styles.nextText} />
          </View>
        </Pressable>
      ) : (
        // 책 내용 페이지 (넘김 효과 포함)
        <PageTurningView pages={pages} />
      )}
    </View>
  );
};

// 책 이미지 가져오는 함수
function getBookImage(id: string) {
  switch (id) {
    case "1":
      return require("../../../assets/images/library/book_image_1.png");
    case "2":
      return require("../../../assets/images/library/book_image_2.png");
    case "3":
      return require("../../../assets/images/library/book_image_3.png");
    case "4":
      return require("../../../assets/images/library/book_image_4.png");
    default:
      return require("../../../assets/images/library/book_image_5.png");
  }
}

// 콘텐츠를 페이지로 나누는 함수
function splitContentIntoPages(content: string): string[] {
  // 페이지당 글자 수 제한
  const charsPerPage = 1000;

  // 문단으로 분리
  const paragraphs = content.split("\n\n");

  const pages: string[] = [];
  let currentPage = "";

  for (const paragraph of paragraphs) {
    // 현재 페이지에 단락 추가했을 때 제한 넘으면 다음 페이지로
    if (currentPage.length + paragraph.length > charsPerPage) {
      pages.push(currentPage);
      currentPage = paragraph + "\n\n";
    } else {
      currentPage += paragraph + "\n\n";
    }
  }

  // 마지막 페이지 추가
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  coverContainer: {
    flex: 1,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverTextContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  nextIndicator: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  titlePage: {
    padding: 20,
    paddingTop: 40,
  },
  seriesName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "purple",
    marginBottom: 40,
  },
  contentPage: {
    padding: 20,
  },
  contentPreview: {
    marginTop: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});

export default StoryDetailScreen;
