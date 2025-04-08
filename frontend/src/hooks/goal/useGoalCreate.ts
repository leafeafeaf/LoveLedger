import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../api/axios";

export interface GoalCreateRequest {
  title?: string;
  goalAmount?: number;
  currentAmount?: number;
  startDate?: string;
  goalDate?: string;
  contentURL?: string;
}

interface GoalCreateResponse {
  status: number;
  message: string;
  data: {
    goalId: string;
  } | null;
  timestamp: string;
}

interface GoalCreateError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
  errorCode?: string;
}

export const useGoalCreate = () => {
  const queryClient = useQueryClient();

  return useMutation<GoalCreateResponse, GoalCreateError, GoalCreateRequest>({
    mutationFn: async (goalData) => {
      // 직렬화 가능한 객체로 변환
      const requestData: Record<string, any> = {};

      // 숫자와 문자열만 포함하도록 설정
      if (goalData.title !== undefined) {
        requestData.title = String(goalData.title);
      }

      if (goalData.goalAmount !== undefined) {
        requestData.goalAmount = Number(goalData.goalAmount);
      }

      if (goalData.currentAmount !== undefined) {
        requestData.currentAmount = Number(goalData.currentAmount);
      }

      if (goalData.startDate !== undefined) {
        // Date 객체인 경우 yyyy-MM-dd 형식의 문자열로 변환
        requestData.startDate =
          typeof goalData.startDate === "string"
            ? goalData.startDate
            : new Date(goalData.startDate).toISOString().split("T")[0];
      }

      if (goalData.goalDate !== undefined) {
        // Date 객체인 경우 yyyy-MM-dd 형식의 문자열로 변환
        requestData.goalDate =
          typeof goalData.goalDate === "string"
            ? goalData.goalDate
            : new Date(goalData.goalDate).toISOString().split("T")[0];
      }

      if (goalData.contentURL !== undefined) {
        requestData.contentURL = String(goalData.contentURL);
      }

      const response = await axiosInstance.post<GoalCreateResponse>(
        "/goal",
        requestData
      );

      return response.data;
    },
    onSuccess: () => {
      // 성공 시 목표 데이터와 관련 트랜잭션 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      queryClient.invalidateQueries({ queryKey: ["goalTransactions"] });
    },
  });
};
