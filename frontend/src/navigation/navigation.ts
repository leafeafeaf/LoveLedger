import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigatorScreenParams } from "@react-navigation/native";
import {
  Series,
  NewSeries,
  Story,
  StorySettings,
  Goal,
  Transaction,
} from "../types";

// 메인 탭 네비게이션 타입
export type MainTabParamList = {
  Dashboard: {};
  Main: {};
  Library: {};
};

// 스토리 관련 스택 파라미터 타입
export type StoryStackParamList = {
  StoryList: {};
  StoryDetail: { id: string };
  StorySettings: {
    themeStyle?: string;
    toneStyle?: string;
  };
  SeriesSelection: {
    settings: StorySettings;
  };
  StoryGeneration: {
    settings: StorySettings;
    series: Series | NewSeries;
  };
  CoverSelection: {
    settings: StorySettings;
    series: Series | NewSeries;
    story: Story;
  };
  CoverPreview: {
    settings: StorySettings;
    series: Series | NewSeries;
    story: Story;
    coverImage: string;
    coverStyle: string;
  };
  StorySave: {
    id: string;
  };
};

// 프로필 관련 스택 파라미터 타입
export type ProfileStackParamList = {
  ProfileMain: {};
  ProfileEdit: {
    partner: string;
  };
  GoalList: {};
  GoalDetail: {
    goal: Goal;
  };
};

// 다이어리 관련 스택 파라미터 타입
export type DiaryStackParamList = {
  DiaryCreate: {};
};

// Daily 관련 스택 파라미터 타입
export type DailyStackParamList = {
  DailyDetail: {
    selectedDate: string;
    transactions: Transaction[];
  };
};

// 인증 스택 네비게이션 타입
export type AuthStackParamList = {
  Login: {};
  Register: {};
  // 필요한 다른 인증 화면들 추가
};

// 메인 스택 파라미터 타입
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Story: NavigatorScreenParams<StoryStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Diary: NavigatorScreenParams<DiaryStackParamList>;
  Daily: NavigatorScreenParams<DailyStackParamList>;
  TransactionEdit: { transaction: Transaction };
  LinkGeneration: {};
  LinkConfirm: { linkCode: string };
  LinkSuccess: {};
  LinkError: {
    errorType: "expired" | "invalid" | "already_linked" | "generic";
  };
};
