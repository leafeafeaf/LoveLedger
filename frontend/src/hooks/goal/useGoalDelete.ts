import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../api/axios";
import { useDispatch } from "react-redux";
import { removeGoalImage } from "../../store/goalSlice";

interface GoalDeleteResponse {
  status: number;
  message: string;
  data: {
    goalId: string;
  } | null;
  timestamp: string;
}

interface GoalDeleteError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
  errorCode?: string;
}

export const useGoalDelete = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const currentGoal = queryClient.getQueryData<{ id: string }>(["goal"]);

  return useMutation<GoalDeleteResponse, GoalDeleteError>({
    mutationFn: async () => {
      const response = await axiosInstance.delete<GoalDeleteResponse>("/goal");

      // 목표 ID가 있으면 Redux 스토어에서 이미지 삭제
      const goalId = response.data.data?.goalId || currentGoal?.id;
      if (goalId) {
        dispatch(removeGoalImage(goalId));
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
  });
};
