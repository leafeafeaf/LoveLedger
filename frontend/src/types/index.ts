import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// MaterialCommunityIcons 아이콘 타입
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// --- 네비게이션 타입 정의 ---

// 메인 탭 네비게이션 타입
export type MainTabParamList = {
  Dashboard: {};
  Main: {};
  Library: {};
};

// 인증 스택 네비게이션 타입
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
};

// Library 스택 파라미터 타입
export type LibraryStackParamList = {
  LibraryMain: undefined;
  DiaryDetail: { id: string; date: string; mood?: string };
  StoryDetail: { id: string };
  DiaryEdit: {
    id: string;
    date: string;
    title: string;
    content: string;
    mood?: string;
  };
};

// 루트 스택 파라미터 타입
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Story: NavigatorScreenParams<StoryStackParamList>;
  Diary: NavigatorScreenParams<DiaryStackParamList>;
  Daily: NavigatorScreenParams<DailyStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Library: NavigatorScreenParams<LibraryStackParamList>;
  DiaryDetail: { id: string; date: string; mood?: string };
  StoryDetail: { id: string };
  TransactionEdit: { transaction: Transaction };
  LinkGeneration: {};
  LinkConfirm: { linkCode: string };
  LinkSuccess: {};
  LinkError: {
    errorType: "expired" | "invalid" | "already_linked" | "generic";
  };
  AccountVerification: undefined;
};

// 프로필 스택 파라미터 타입
export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: { partner: string };
  GoalList: undefined;
  GoalDetail: { goal: Goal };
  AccountVerification: undefined;
};

// 스토리 스택 파라미터 타입
export type StoryStackParamList = {
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
  StoryPreview: {
    settings: StorySettings;
    series: Series | NewSeries;
    story: Story;
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
    coverStyle: string;
  };
  StoryList: undefined;
  StoryDetail: { id: string };
  Publishing: {
    settings: StorySettings;
    series: SeriesData;
    story: Story;
    coverImage: string;
    coverStyle: string;
  };
};

// 다이어리 스택 파라미터 타입
export type DiaryStackParamList = {
  DiaryCreate: undefined;
  DiaryEdit: {
    id: string;
    date: string;
    title: string;
    content?: string;
    mood?: string;
  };
  DiaryEditDaily: {
    diaryId: string;
    selectedDate: string;
  };
};

// Daily 스택 파라미터 타입
export type DailyStackParamList = {
  DailyDetail: {
    selectedDate: string;
    transactions: TransactionDetail[];
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

// Daily 스크린 Props
export type DailyScreenProps<T extends keyof DailyStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DailyStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Library 스크린 Props도 추가
export type LibraryScreenProps<T extends keyof LibraryStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<LibraryStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// 트랜잭션 스크린 Props
export type TransactionStackScreenProps<
  T extends keyof TransactionStackParamList,
> = CompositeScreenProps<
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
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  centerElement?: React.ReactNode;
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
export interface BookItem {
  id: string;
  title: string;
  date: string;
  type: "diary" | "story";
  mood?: string;
  theme?: string;
  coverImage?: string;
  seriesId?: number;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 거래 관련 타입
export interface Transaction {
  id: string;
  transactionid: string;
  amount: number;
  date: string;
  time: string;
  remittance: boolean;
  targetname: string;
  category: string;
  accountNo: string;
}

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
export interface NewGoal {
  title: string;
  description: string;
  target: string;
  deadline: string;
  icon: string;
}

// 목표 거래 타입
export type GoalTransaction = {
  id: string;
  amount: number;
  date: string;
  notes: string;
};

// 시리즈 타입
export type Series = {
  seriesid: number;
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
  seriesid : number;
};

// 스토리 타입
export type Story = {
  id?: string;
  title: string;
  content: string;
  coverImage?: string;
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

// 회원가입 요청 타입
export type SignUpRequest = {
  name: string;
  gender: boolean;
  birthDay: string;
  isMarried: boolean;
};

export interface DailySum {
  targetDate: string;
  totalConsumeSum: number;
  totalEarnSum: number;
}

export interface TransactionDetail {
  transactionId: string;
  date: string;
  time: string;
  remittance: boolean;
  targetName: string;
  afterAmount: number;
  amount: number;
  categoryName: string;
  accountNo: string;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface AccountDetailResponse {
  content: TransactionDetail[];
  page: PageInfo;
}

// 계좌 인증 요청 타입
export interface AccountVerifyRequest {
  accountNo: string;
}

// 계좌 인증 응답 타입
export interface AccountVerifyResponse {
  status: string;
  message: string;
  data: {
    REC: {
      transactionUniqueNo: number;
      accounNo: string;
    };
  };
  timestamp: string;
}

// 계좌 인증 에러 타입
export interface AccountVerifyError {
  status: string;
  message: string;
  data: null;
  timestamp: string;
}

// 계좌 인증 확인 요청 타입
export interface AccountVerifyConfirmRequest {
  authCode: string;
  accountNo: string;
}

// 계좌 인증 확인 응답 타입
export interface AccountVerifyConfirmResponse {
  status: string;
  message: string;
  data: null;
  timestamp: string;
}

// 임계 금액 타입
export type thresholdAmount = number;

export interface InviteResponse {
  data: {
    link: string;
  };
}

export interface InviteErrorResponse {
  status: string;
  message: string;
  data?: {
    existingLink?: string;
    createdAt?: string;
    expiresAt?: string;
    action?: string;
  };
}

export interface CoupleJoinResponse {
  status: number;
  message: string;
}

export interface CoupleJoinErrorResponse {
  status: number;
  message: string;
  code?: string;
  data?: {
    registeredAt?: string;
  };
}

export interface CoupleUnlinkResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface UpdateUserRequest {
  name?: string;
  gender?: boolean;
  birthDay?: string;
  isMarried?: boolean;
}

export interface UserDetailResponse {
  id: string;
  name: string;
  email: string;
  gender: boolean;
  birthDay: string;
  isMarried: boolean;
}

export interface InviteValidateResponse {
  status: string;
  message: string;
  data: {
    isValid: boolean;
    expiresAt?: string;
  };
}
export interface TransactionHistory {
  transactionId: string;
  time: string;
  remittance: boolean;
  targetname: string;
  category_id: number | null;
  afterAmount: number;
  amount: number;
  memo: string;
  transactionTypeName: string;
  summary: string;
  updatedTargetName: string | null;
}

export interface TransactionChange {
  original: TransactionHistory;
  modified: TransactionHistory;
  isSelected: boolean;
}
