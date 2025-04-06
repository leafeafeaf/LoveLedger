import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../api/axios";
import {
  fetchGoalListStart,
  fetchGoalListSuccess,
  fetchGoalListFailure,
} from "../store/financeSlice";
import type { NewGoal } from "../types";

interface GoalListResponse {
  goalamount: number;
  currentamount: number;
  startdate: string;
  goaldate: string;
  title: string;
  contenturl: string;
}

interface GoalListError {
  message: string;
  errorCode?: string;
}

export const useGoalList = () => {
  const dispatch = useDispatch();

  return useQuery<GoalListResponse, GoalListError>({
    queryKey: ["goal"],
    queryFn: async () => {
      try {
        dispatch(fetchGoalListStart());
        const response = await axiosInstance.get("/goal");
        dispatch(fetchGoalListSuccess(response.data.data));
        return response.data.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "목표를 불러오는데 실패했습니다.";
        dispatch(fetchGoalListFailure(errorMessage));
        throw { message: errorMessage };
      }
    },
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGoal: NewGoal) => {
      const response = await axiosInstance.post("/goal", {
        title: newGoal.title,
        description: newGoal.description,
        goalamount: parseInt(newGoal.target),
        goaldate: newGoal.deadline,
        icon: newGoal.icon,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};
