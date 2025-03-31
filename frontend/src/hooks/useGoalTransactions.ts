import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  notes: string;
  remittance: boolean;
}

interface GoalTransactionsResponse {
  status: number;
  message: string;
  data: Transaction[];
  timestamp: string;
}

interface GoalTransactionsError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
  errorCode: string;
}

export const useGoalTransactions = () => {
  return useQuery<GoalTransactionsResponse, GoalTransactionsError>({
    queryKey: ["goalTransactions"],
    queryFn: async () => {
      const response = await axiosInstance.get<GoalTransactionsResponse>("/goal/transactions");
      return response.data;
    },
  });
}; 