import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface GoalDeleteResponse {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

interface GoalDeleteError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
  errorCode: string;
}

export const useGoalDelete = () => {
  const queryClient = useQueryClient();

  return useMutation<GoalDeleteResponse, GoalDeleteError>({
    mutationFn: async () => {
      const response = await axiosInstance.delete<GoalDeleteResponse>("/goal");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
  });
}; 