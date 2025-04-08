import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  addGoalImage,
  addLocalGoalImage,
  addRemoteGoalImage,
  removeGoalImage,
  updateGoalMetadata,
  setGoalImages,
  loadGoalImagesFromStorage,
  setLoading,
  setError,
  getGoalImageSource,
  GoalImageMapping,
  normalizeImagePath,
} from "../store/goalSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export const useGoalImages = () => {
  const dispatch = useDispatch();
  const { goalImages, isLoading, error, lastSyncTimestamp } = useSelector(
    (state: RootState) => state.goal
  );

  // 컴포넌트 마운트 시 AsyncStorage에서 저장된 이미지 로드
  useEffect(() => {
    const loadImages = async () => {
      try {
        dispatch(setLoading(true));
        const storedImages = await AsyncStorage.getItem("goalImages");
        if (storedImages) {
          const parsedImages = JSON.parse(storedImages) as GoalImageMapping[];
          dispatch(loadGoalImagesFromStorage(parsedImages));
        }
      } catch (error) {
        console.error("저장된 이미지 로드 중 오류 발생:", error);
        dispatch(setError("저장된 이미지를 불러오는데 실패했습니다."));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadImages();
  }, [dispatch]);

  // 목표 ID를 기준으로 이미지 찾기
  const findGoalImageById = (id: string) => {
    return goalImages.find((img) => img.id === id) || null;
  };

  // 갤러리에서 이미지 선택
  const pickGoalImage = async (
    goalId: string,
    metadata?: GoalImageMapping["metadata"]
  ): Promise<string | null> => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        dispatch(setError("갤러리 접근 권한이 필요합니다."));
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const selectedImageUri = result.assets[0].uri;
      const normalizedUri = normalizeImagePath(selectedImageUri);

      // 이미지 저장 및 Redux 스토어 업데이트
      dispatch(
        addLocalGoalImage({
          id: goalId,
          localUri: normalizedUri,
          metadata,
        })
      );

      return normalizedUri;
    } catch (error) {
      console.error("이미지 선택 중 오류 발생:", error);
      dispatch(setError("이미지 선택 중 오류가 발생했습니다."));
      return null;
    }
  };

  // 원격 URL 이미지 저장
  const saveRemoteGoalImage = async (
    goalId: string,
    remoteUrl: string,
    metadata?: GoalImageMapping["metadata"]
  ): Promise<void> => {
    try {
      dispatch(
        addRemoteGoalImage({
          id: goalId,
          remoteUrl,
          metadata,
        })
      );
    } catch (error) {
      console.error("원격 이미지 저장 중 오류 발생:", error);
      dispatch(setError("원격 이미지 저장 중 오류가 발생했습니다."));
    }
  };

  // 목표 이미지 메타데이터 업데이트
  const updateGoalImageMetadata = (
    goalId: string,
    metadata: GoalImageMapping["metadata"]
  ) => {
    dispatch(updateGoalMetadata({ id: goalId, metadata }));
  };

  // 목표 이미지 삭제
  const deleteGoalImage = (goalId: string) => {
    dispatch(removeGoalImage(goalId));
  };

  // 목표 이미지 소스 가져오기 (React Native Image 컴포넌트용)
  const getGoalImageSourceForId = (goalId: string) => {
    const image = findGoalImageById(goalId);
    return getGoalImageSource(image);
  };

  // 모든 목표 이미지 초기화
  const clearAllGoalImages = () => {
    dispatch(setGoalImages([]));
  };

  return {
    goalImages,
    isLoading,
    error,
    lastSyncTimestamp,
    findGoalImageById,
    pickGoalImage,
    saveRemoteGoalImage,
    updateGoalImageMetadata,
    deleteGoalImage,
    getGoalImageSourceForId,
    clearAllGoalImages,
  };
};

export default useGoalImages;
