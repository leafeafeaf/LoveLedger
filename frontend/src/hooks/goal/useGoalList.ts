import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../api/axios";
import {
  fetchGoalListStart,
  fetchGoalListSuccess,
  fetchGoalListFailure,
} from "../../store/financeSlice";
import type { Goal as TypesGoal, NewGoal } from "../../types";

interface GoalResponse {
  status: number;
  message: string;
  data: TypesGoal;
  timestamp: string;
}

interface GoalError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

// financeSlice.ts에서 사용하는 Goal 타입과 일치하도록 변환
const convertToFinanceGoal = (goal: TypesGoal) => {
  return {
    goalamount: goal.goalAmount,
    currentamount: goal.currentAmount,
    startdate: goal.startDate,
    goaldate: goal.goalDate,
    title: goal.title,
    contenturl: goal.contentURL,
  };
};

export const useGoalList = () => {
  const dispatch = useDispatch();

  return useQuery<TypesGoal | null, GoalError>({
    queryKey: ["goal"],
    queryFn: async () => {
      try {
        dispatch(fetchGoalListStart());
        const response = await axiosInstance.get<GoalResponse>("/goal");

        // financeSlice.ts의 Goal 타입으로 변환하여 디스패치
        dispatch(fetchGoalListSuccess(convertToFinanceGoal(response.data.data)));
        return response.data.data;
      } catch (error: any) {
        // 404 에러인 경우 (목표가 없는 경우) 조용히 null 반환
        if (error.response && error.response.status === 404) {
          dispatch(fetchGoalListSuccess({
            goalamount: 0,
            currentamount: 0,
            startdate: "",
            goaldate: "",
            title: "",
            contenturl: ""
          }));
          return null;
        }

        // 다른 에러인 경우 로그 출력 및 에러 처리
        console.error("목표 데이터 불러오기 실패:", error);
        dispatch(fetchGoalListFailure("목표를 불러오는데 실패했습니다."));
        return null;
      }
    },
    retry: false,
    retryOnMount: false,
  });
};
