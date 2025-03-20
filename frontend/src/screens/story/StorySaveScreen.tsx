import React, { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import Header from "../../components/common/Header";
import { StoryStackParamList, StoryScreenProps } from "../../types";

type StorySaveScreenNavigationProp = NativeStackNavigationProp<
  StoryStackParamList,
  "StorySave"
>;
type StorySaveScreenRouteProp = RouteProp<StoryStackParamList, "StorySave">;

type IconName =
  | "arrow-left"
  | "close"
  | "information"
  | "pencil"
  | "content-save";

const StorySaveScreen: FC<StoryScreenProps<"StorySave">> = ({
  navigation,
  route,
}) => {
  const { settings, series, story, coverImage, coverStyle } = route.params;

  const handleSave = async () => {
    try {
      // 1. 스토리 데이터 저장
      // 2. 시리즈 데이터 업데이트
      // 3. 커버 이미지 저장
      navigation.navigate("StoryList");
    } catch (error) {
      // 에러 처리
    }
  };

  return (
    <View style={styles.container}>
      <Header title="스토리 저장" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.text}>스토리 ID: {story.id}</Text>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>저장하기</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default StorySaveScreen;
