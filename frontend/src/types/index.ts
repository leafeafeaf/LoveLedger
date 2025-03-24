// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
// import {
//   CompositeScreenProps,
//   NavigatorScreenParams,
// } from "@react-navigation/native";
// import {
//   NativeStackScreenProps,
//   NativeStackNavigationProp,
// } from "@react-navigation/native-stack";
// import { FC } from "react";
// import { RouteProp } from "@react-navigation/native";

// // MaterialCommunityIcons 아이콘 타입
// type IconName =
//   | "airplane"
//   | "ring"
//   | "car"
//   | "target"
//   | "flag"
//   | "castle"
//   | "draw"
//   | "palette"
//   | "minus-circle-outline"
//   | "camera"
//   | "shape"
//   | "emoticon-happy"
//   | "emoticon-excited"
//   | "emoticon-cool"
//   | "notebook"
//   | "book-open-variant"
//   | "arrow-left"
//   | "close"
//   | "plus"
//   | "check"
//   | "delete"
//   | "pencil"
//   | "cash"
//   | "food"
//   | "coffee"
//   | "store"
//   | "ticket"
//   | "bank"
//   | "account-heart"
//   | "account-heart-outline"
//   | "account-multiple-heart";

// // MainTab 네비게이션 타입
// export type MainTabParamList = {
//   Library: undefined;
//   Dashboard: undefined;
//   Profile: undefined;
// };

// // Root 스택 네비게이션 타입
// export type RootStackParamList = {
//   Auth: undefined;
//   Main: NavigatorScreenParams<MainTabParamList>;
//   Story: undefined;
//   DailyDetail: {
//     selectedDate: Date;
//     transactions: Transaction[];
//   };
//   Diary: undefined;
//   StorySettings: undefined;
//   StoryDetail: { id: string };
//   TransactionEdit: { transaction: Transaction };
//   LinkGeneration: undefined;
//   LinkConfirm: { linkCode: string };
//   LinkSuccess: undefined;
//   LinkError: {
//     errorType: "expired" | "invalid" | "already_linked" | "generic";
//   };
//   ProfileMain: undefined;
// };

// // Auth 스택 네비게이션 타입
// export type AuthStackParamList = {
//   Splash: undefined;
//   Login: undefined;
// };

// // 복합 네비게이션 타입
// export type MainTabScreenProps<T extends keyof MainTabParamList> =
//   CompositeScreenProps<
//     BottomTabScreenProps<MainTabParamList, T>,
//     NativeStackScreenProps<RootStackParamList>
//   >;

// // 기존 NavigationProps를 MainTabScreenProps로 대체
// export type NavigationProps<T extends keyof MainTabParamList> =
//   MainTabScreenProps<T>;

// // 도서 관련 타입
// export type BookItem = {
//   id: string;
//   title: string;
//   date: string;
//   type: "diary" | "story" | "goal";
//   mood?: "happy" | "excited" | "peaceful" | string;
//   theme?: string;
// };

// // 거래 관련 타입
// export type Transaction = {
//   id: string;
//   transactionid?: string;
//   amount: number;
//   date: string;
//   time?: string;
//   notes?: string;
//   remittance: boolean;
//   targetname?: string;
//   category?: string;
// };

// // 대시보드 거래 요약 타입
// export type DashboardTransaction = {
//   id: number | string;
//   title: string;
//   amount: number;
//   isExpense: boolean;
//   date: string;
//   category: string;
// };

// // 카테고리 요약 타입
// export type CategorySummary = {
//   name: string;
//   amount: number;
//   icon: IconName;
// };

// // 목표 관련 타입
// export type Goal = {
//   id: string;
//   title: string;
//   description: string;
//   target: number;
//   current: number;
//   deadline: string;
//   icon: keyof typeof MaterialCommunityIcons.glyphMap;
// };

// // 새 목표 입력 타입
// export type NewGoal = {
//   title: string;
//   description: string;
//   target: string;
//   deadline: string;
//   icon: IconName;
// };

// // 목표 거래 타입
// export type GoalTransaction = {
//   id: string;
//   amount: number;
//   date: string;
//   notes: string;
// };

// // 시리즈 타입
// export type Series = {
//   id: number;
//   title: string;
//   episodes: number;
//   lastUpdated: string;
// };

// // 새 시리즈 타입
// export type NewSeries = {
//   title: string;
// };

// // 스토리 타입
// export type Story = {
//   id?: string;
//   title: string;
//   content: string;
// };

// // 스토리 설정 타입
// export type StorySettings = {
//   themeStyle: string;
//   toneStyle: string;
//   lengthStyle: string;
// };

// // 커버 스타일 타입
// export type CoverStyle = {
//   id: string;
//   label: string;
//   icon: keyof typeof MaterialCommunityIcons.glyphMap;
// };

// // 헤더 컴포넌트 props 타입
// export type HeaderProps = {
//   title: string;
//   showBack?: boolean;
//   showClose?: boolean;
//   onBackPress?: () => void;
//   onClosePress?: () => void;
// };

// // DatePicker 컴포넌트 props 타입
// export type DatePickerProps = {
//   value: Date;
//   onChange: (date: Date) => void;
//   mode?: "date" | "time";
//   minimumDate?: Date;
//   maximumDate?: Date;
// };

// // 공통 스타일 타입
// export type Theme = {
//   colors: {
//     primary: string;
//     secondary: string;
//     background: string;
//     text: string;
//     textLight: string;
//     white: string;
//     error: string;
//     success: string;
//     accent: string;
//   };
//   spacing: {
//     xs: number;
//     sm: number;
//     md: number;
//     lg: number;
//     xl: number;
//   };
//   borderRadius: {
//     sm: number;
//     md: number;
//     lg: number;
//   };
//   shadows: {
//     small: {
//       shadowColor: string;
//       shadowOffset: {
//         width: number;
//         height: number;
//       };
//       shadowOpacity: number;
//       shadowRadius: number;
//       elevation: number;
//     };
//     medium: {
//       shadowColor: string;
//       shadowOffset: {
//         width: number;
//         height: number;
//       };
//       shadowOpacity: number;
//       shadowRadius: number;
//       elevation: number;
//     };
//   };
// };

// export type ProfileStackParamList = {
//   ProfileMain: undefined;
//   ProfileEdit: undefined;
//   GoalList: undefined;
//   GoalDetail: { goal: Goal };
// };

// // 프로필 스크린 Props 타입
// export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
//   NativeStackScreenProps<ProfileStackParamList, T>;

// export type StoryStackParamList = {
//   StorySelection: undefined;
//   StorySettings: {
//     themeStyle: string;
//     period: string;
//   };
//   SeriesSelection: undefined;
//   StoryGeneration: {
//     settings: {
//       themeStyle: string;
//       period: string;
//     };
//     series: {
//       name: string;
//     };
//   };
//   CoverSelection: {
//     settings: {
//       themeStyle: string;
//       period: string;
//     };
//     series: {
//       name: string;
//     };
//     story: {
//       title: string;
//       content: string;
//     };
//   };
//   CoverPreview: {
//     settings: StorySettings;
//     series: SeriesData;
//     story: Story;
//     coverImage: string;
//     coverStyle: string;
//   };
//   StoryList: undefined;
//   StorySave: {
//     settings: StorySettings;
//     series: SeriesData;
//     story: Story;
//     coverImage: string;
//     coverStyle: string;
//   };
// };

// export type SeriesData = {
//   id?: number;
//   title: string;
//   episodes?: number;
//   lastUpdated?: string;
// };

// export type StoryScreenProps<T extends keyof StoryStackParamList> =
//   NativeStackScreenProps<StoryStackParamList, T>;

// export type RootStackScreenProps<T extends keyof RootStackParamList> =
//   NativeStackScreenProps<RootStackParamList, T>;

// export type PartnerSwitchProps = {
//   activeView: "you" | "partner" | "combined";
//   onViewChange: (view: "you" | "partner" | "combined") => void;
// };

// export type PartnerInfo = {
//   name: string;
//   avatar: string | null;
//   joinDate: string;
//   message?: string;
// };

// export type TransactionStackParamList = {
//   TransactionEdit: {
//     transaction: Transaction;
//   };
//   TransactionList: undefined;
// };

// export type TransactionStackScreenProps<
//   T extends keyof TransactionStackParamList
// > = {
//   navigation: NativeStackNavigationProp<TransactionStackParamList, T>;
//   route: RouteProp<TransactionStackParamList, T>;
// };

// export type DiaryStackParamList = {
//   DiaryList: undefined;
//   DiaryCreate: undefined;
//   DailyDetail: {
//     selectedDate: Date;
//     transactions: Transaction[];
//   };
//   DiaryEdit: {
//     id: string;
//     date: string;
//     title: string;
//     content: string;
//     mood?: string;
//   };
// };

// export type DiaryScreenProps<T extends keyof DiaryStackParamList> =
//   NativeStackScreenProps<DiaryStackParamList, T>;

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// MaterialCommunityIcons 아이콘 타입
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// --- 네비게이션 타입 정의 ---

// 메인 탭 네비게이션 타입
export type MainTabParamList = {
  Dashboard: undefined;
  Main: undefined;
  Library: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

// 인증 스택 네비게이션 타입
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
};

// 루트 스택 파라미터 타입
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Story: NavigatorScreenParams<StoryStackParamList>;
  Diary: NavigatorScreenParams<DiaryStackParamList>;
  DailyDetail: {
    selectedDate: Date;
    transactions: Transaction[];
  };
  TransactionEdit: { transaction: Transaction };
  LinkGeneration: undefined;
  LinkConfirm: { linkCode: string };
  LinkSuccess: undefined;
  LinkError: {
    errorType: "expired" | "invalid" | "already_linked" | "generic";
  };
};

// 프로필 스택 파라미터 타입
export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: { partner: string };
  GoalList: undefined;
  GoalDetail: { goal: Goal };
};

// 스토리 스택 파라미터 타입
export type StoryStackParamList = {
  StorySelection: undefined;
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
    series: SeriesData;
    story: Story;
    coverImage: string;
    coverStyle: string;
  };
  StoryList: undefined;
  StoryDetail: { id: string };
  StorySave: {
    settings: StorySettings;
    series: SeriesData;
    story: Story;
    coverImage: string;
    coverStyle: string;
  };
};

// 다이어리 스택 파라미터 타입
export type DiaryStackParamList = {
  DiaryList: undefined;
  DiaryCreate: undefined;
  DailyDetail: {
    selectedDate: Date;
    transactions: Transaction[];
  };
  DiaryEdit: {
    id: string;
    date: string;
    title: string;
    content: string;
    mood?: string;
  };
};

// 트랜잭션 스택 파라미터 타입
export type TransactionStackParamList = {
  TransactionEdit: {
    transaction: Transaction;
  };
  TransactionList: undefined;
};

// --- 스크린 Props 타입 정의 ---

// 루트 스택 스크린 Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// 메인 탭 스크린 Props (복합 네비게이션)
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// 프로필 스크린 Props
export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// 스토리 스크린 Props
export type StoryScreenProps<T extends keyof StoryStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<StoryStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// 다이어리 스크린 Props
export type DiaryScreenProps<T extends keyof DiaryStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DiaryStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// 트랜잭션 스크린 Props
export type TransactionStackScreenProps<T extends keyof TransactionStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<TransactionStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// --- 컴포넌트 Props 타입 정의 ---

// PartnerSwitch Props
export type PartnerSwitchProps = {
  activeView: "you" | "partner" | "combined";
  onViewChange: (view: "you" | "partner" | "combined") => void;
  partnerName?: string;
};

// 헤더 컴포넌트 Props
export type HeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  rightElement?: React.ReactNode;
};

// DatePicker 컴포넌트 Props
export type DatePickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  isRange?: boolean;
  onSelectRange?: (startDate: Date, endDate: Date) => void;
};

// --- 데이터 모델 타입 정의 ---

// 도서 항목 타입
export type BookItem = {
  id: string;
  title: string;
  date: string;
  type: "diary" | "story" | "goal";
  mood?: "happy" | "excited" | "peaceful" | string;
  theme?: string;
};

// 거래 관련 타입
export type Transaction = {
  id: string;
  transactionid?: string;
  amount: number;
  date: string;
  time?: string;
  notes?: string;
  remittance: boolean;
  targetname?: string;
  category?: string;
  userId?: string;
};

// 대시보드 거래 요약 타입
export type DashboardTransaction = {
  id: number | string;
  title: string;
  amount: number;
  isExpense: boolean;
  date: string;
  category: string;
};

// 카테고리 요약 타입
export type CategorySummary = {
  name: string;
  amount: number;
  icon: IconName;
};

// 목표 관련 타입
export type Goal = {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  icon: IconName;
};

// 새 목표 입력 타입
export type NewGoal = {
  title: string;
  description: string;
  target: string;
  deadline: string;
  icon: IconName;
};

// 목표 거래 타입
export type GoalTransaction = {
  id: string;
  amount: number;
  date: string;
  notes: string;
};

// 시리즈 타입
export type Series = {
  id: number;
  title: string;
  episodes: number;
  lastUpdated: string;
};

// 시리즈 데이터 타입
export type SeriesData = {
  id?: number;
  title: string;
  episodes?: number;
  lastUpdated?: string;
};

// 새 시리즈 타입
export type NewSeries = {
  name: string;
};

// 스토리 타입
export type Story = {
  id?: string;
  title: string;
  content: string;
};

// 스토리 설정 타입
export type StorySettings = {
  themeStyle: string;
  toneStyle: string;
  lengthStyle?: string;
  period?: string;
};

// 커버 스타일 타입
export type CoverStyle = {
  id: string;
  label: string;
  icon: IconName;
};

// 파트너 정보 타입
export type PartnerInfo = {
  name: string;
  avatar: string | null;
  joinDate: string;
  message?: string;
};

// --- 테마 타입 정의 ---

// 공통 스타일 타입
export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textLight: string;
    white: string;
    error: string;
    success: string;
    accent: string;
    border: string;
    disabled: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
};