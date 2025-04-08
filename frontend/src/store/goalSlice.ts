import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// 목표 이미지 매핑 인터페이스
export interface GoalImageMapping {
  id: string;
  localUri?: string;
  remoteUrl?: string;
  base64Data?: string;
  timestamp: number;
  metadata?: {
    title?: string;
    goalAmount?: number;
    currentAmount?: number;
    startDate?: string;
    goalDate?: string;
  };
}

// 목표 이미지 스토어 상태 인터페이스
interface GoalState {
  goalImages: GoalImageMapping[];
  isLoading: boolean;
  error: string | null;
  lastSyncTimestamp: number | null;
}

const initialState: GoalState = {
  goalImages: [],
  isLoading: false,
  error: null,
  lastSyncTimestamp: null,
};

export const goalSlice = createSlice({
  name: "goal",
  initialState,
  reducers: {
    // 목표 이미지 추가
    addGoalImage: (
      state,
      action: PayloadAction<Omit<GoalImageMapping, "timestamp">>
    ) => {
      const newGoalImage = {
        ...action.payload,
        timestamp: Date.now(),
      };

      // 동일한 ID가 있는 경우 업데이트, 없으면 추가
      const existingIndex = state.goalImages.findIndex(
        (img) => img.id === newGoalImage.id
      );
      if (existingIndex !== -1) {
        state.goalImages[existingIndex] = newGoalImage;
      } else {
        state.goalImages.push(newGoalImage);
      }

      // AsyncStorage에 목표 이미지 상태 저장
      saveGoalImagesToStorage(state.goalImages);
    },

    // 로컬 URI로 목표 이미지 추가
    addLocalGoalImage: (
      state,
      action: PayloadAction<{
        id: string;
        localUri: string;
        metadata?: GoalImageMapping["metadata"];
      }>
    ) => {
      const { id, localUri, metadata } = action.payload;
      const newGoalImage: GoalImageMapping = {
        id,
        localUri,
        timestamp: Date.now(),
        metadata,
      };

      const existingIndex = state.goalImages.findIndex((img) => img.id === id);
      if (existingIndex !== -1) {
        state.goalImages[existingIndex] = {
          ...state.goalImages[existingIndex],
          ...newGoalImage,
        };
      } else {
        state.goalImages.push(newGoalImage);
      }

      saveGoalImagesToStorage(state.goalImages);
    },

    // 원격 URL로 목표 이미지 추가
    addRemoteGoalImage: (
      state,
      action: PayloadAction<{
        id: string;
        remoteUrl: string;
        metadata?: GoalImageMapping["metadata"];
      }>
    ) => {
      const { id, remoteUrl, metadata } = action.payload;
      const newGoalImage: GoalImageMapping = {
        id,
        remoteUrl,
        timestamp: Date.now(),
        metadata,
      };

      const existingIndex = state.goalImages.findIndex((img) => img.id === id);
      if (existingIndex !== -1) {
        state.goalImages[existingIndex] = {
          ...state.goalImages[existingIndex],
          ...newGoalImage,
        };
      } else {
        state.goalImages.push(newGoalImage);
      }

      saveGoalImagesToStorage(state.goalImages);
    },

    // 목표 이미지 삭제
    removeGoalImage: (state, action: PayloadAction<string>) => {
      const idToRemove = action.payload;
      state.goalImages = state.goalImages.filter(
        (img) => img.id !== idToRemove
      );
      saveGoalImagesToStorage(state.goalImages);
    },

    // 목표 이미지 일괄 설정
    setGoalImages: (state, action: PayloadAction<GoalImageMapping[]>) => {
      state.goalImages = action.payload;
      saveGoalImagesToStorage(state.goalImages);
    },

    // 목표 이미지 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 목표 이미지 에러 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 마지막 동기화 시간 설정
    setLastSyncTimestamp: (state, action: PayloadAction<number>) => {
      state.lastSyncTimestamp = action.payload;
    },

    // 목표 이미지 데이터 로드
    loadGoalImagesFromStorage: (
      state,
      action: PayloadAction<GoalImageMapping[]>
    ) => {
      state.goalImages = action.payload;
    },

    // 목표 이미지 메타데이터 업데이트
    updateGoalMetadata: (
      state,
      action: PayloadAction<{
        id: string;
        metadata: GoalImageMapping["metadata"];
      }>
    ) => {
      const { id, metadata } = action.payload;
      const imageIndex = state.goalImages.findIndex((img) => img.id === id);
      if (imageIndex !== -1) {
        state.goalImages[imageIndex].metadata = {
          ...state.goalImages[imageIndex].metadata,
          ...metadata,
        };
        state.goalImages[imageIndex].timestamp = Date.now();
        saveGoalImagesToStorage(state.goalImages);
      }
    },
  },
});

// 비동기적으로 AsyncStorage에 목표 이미지 저장
const saveGoalImagesToStorage = async (goalImages: GoalImageMapping[]) => {
  try {
    await AsyncStorage.setItem("goalImages", JSON.stringify(goalImages));
  } catch (error) {
    console.error("목표 이미지 저장 중 오류 발생:", error);
  }
};

// 유틸리티 함수: 목표 이미지 소스 가져오기
export const getGoalImageSource = (
  goalImage: GoalImageMapping | null | undefined
) => {
  if (!goalImage) return null;

  if (goalImage.localUri) {
    return { uri: goalImage.localUri };
  } else if (goalImage.remoteUrl) {
    return { uri: goalImage.remoteUrl };
  } else if (goalImage.base64Data) {
    return { uri: `data:image/jpeg;base64,${goalImage.base64Data}` };
  }

  return null;
};

// 유틸리티 함수: 목표 이미지 JSON 변환
export const goalImageToJson = (goalImage: GoalImageMapping): string => {
  return JSON.stringify(goalImage);
};

// 유틸리티 함수: JSON에서 목표 이미지 복원
export const jsonToGoalImage = (
  jsonString: string
): GoalImageMapping | null => {
  try {
    return JSON.parse(jsonString) as GoalImageMapping;
  } catch (error) {
    console.error("JSON에서 목표 이미지 변환 중 오류 발생:", error);
    return null;
  }
};

// 유틸리티 함수: 플랫폼에 따른 이미지 경로 정규화
export const normalizeImagePath = (path: string): string => {
  if (Platform.OS === "android" && !path.startsWith("file://")) {
    return `file://${path}`;
  }
  return path;
};

export const {
  addGoalImage,
  addLocalGoalImage,
  addRemoteGoalImage,
  removeGoalImage,
  setGoalImages,
  setLoading,
  setError,
  setLastSyncTimestamp,
  loadGoalImagesFromStorage,
  updateGoalMetadata,
} = goalSlice.actions;

export default goalSlice.reducer;
