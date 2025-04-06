import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface GoalUpdateRequest {
  goalamount?: number;
  currentamount?: number;
  startdate?: string;
  goaldate?: string;
  title?: string;
  contenturl?: string;
}

interface GoalUpdateResponse {
  status: number;
  message: string;
  data: null;
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

  return useMutation<GoalUpdateResponse, GoalUpdateError, GoalUpdateRequest>({
    mutationFn: async (goalData) => {
      const response = await axiosInstance.patch<GoalUpdateResponse>("/goal", goalData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
      queryClient.invalidateQueries({ queryKey: ["goalTransactions"] });
    },
  });
}; 