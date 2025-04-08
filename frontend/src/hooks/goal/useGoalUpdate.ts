import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../api/axios";
import { useDispatch } from "react-redux";
import {
  updateGoalMetadata,
  addLocalGoalImage,
  addRemoteGoalImage,
} from "../../store/goalSlice";

// 이미지 URL이 로컬 이미지인지 확인하는 함수
const isLocalImage = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith("file:///");
};

interface GoalUpdateRequest {
  goalAmount?: number;
  currentAmount?: number;
  startDate?: string;
  goalDate?: string;
  title?: string;
  contentURL?: string;
}

interface GoalUpdateResponse {
  status: number;
  message: string;
  data: {
    goalId: string;
  } | null;
  timestamp: string;
}

interface GoalUpdateError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
  errorCode: string;
}

export const useGoalUpdate = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<GoalUpdateResponse, GoalUpdateError, GoalUpdateRequest>({
    mutationFn: async (goalData) => {
      const response = await axiosInstance.patch<GoalUpdateResponse>(
        "/goal",
        goalData
      );

      // 응답에서 목표 ID 가져오기
      const goalId = response.data.data?.goalId;

      if (goalId) {
        // 이미지 URL이 포함된 경우 이미지 정보 업데이트
        if (goalData.contentURL) {
          const imageUrl = goalData.contentURL;

          // 목표 메타데이터
          const metadata = {
            title: goalData.title,
            goalAmount: goalData.goalAmount,
            currentAmount: goalData.currentAmount,
            startDate: goalData.startDate,
            goalDate: goalData.goalDate,
          };

          // 로컬 이미지인지 원격 이미지인지 확인하여 적절한 액션 디스패치
          if (isLocalImage(imageUrl)) {
            dispatch(
              addLocalGoalImage({
                id: goalId,
                localUri: imageUrl,
                metadata,
              })
            );
          } else {
            dispatch(
              addRemoteGoalImage({
                id: goalId,
                remoteUrl: imageUrl,
                metadata,
              })
            );
          }
        } else {
          // 이미지 URL 없이 다른 정보만 업데이트하는 경우
          // 메타데이터만 업데이트
          const metadataToUpdate = {
            title: goalData.title,
            goalAmount: goalData.goalAmount,
            currentAmount: goalData.currentAmount,
            startDate: goalData.startDate,
            goalDate: goalData.goalDate,
          };

          // 정의된 값만 있는 메타데이터 객체 생성
          const definedMetadata = Object.entries(metadataToUpdate)
            .filter(([_, value]) => value !== undefined)
            .reduce(
              (obj, [key, value]) => {
                obj[key] = value;
                return obj;
              },
              {} as Record<string, any>
            );

          if (Object.keys(definedMetadata).length > 0) {
            dispatch(
              updateGoalMetadata({
                id: goalId,
                metadata: definedMetadata,
              })
            );
          }
        }
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      queryClient.invalidateQueries({ queryKey: ["goalTransactions"] });
    },
  });
};
