import { useQuery } from "@tanstack/react-query";
import { getMonthlyTransactions } from "../api/account";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { 
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure
} from "../store/financeSlice";

export const useMonthlyTransactions = (year: number, month: number) => {
  const dispatch = useAppDispatch();
  const { userToken } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ["monthlyTransactions", year, month],
    queryFn: async () => {
      try {
        dispatch(fetchTransactionsStart());
        const data = await getMonthlyTransactions(year, month, userToken || "");
        dispatch(fetchTransactionsSuccess(data));
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
        dispatch(fetchTransactionsFailure(errorMessage));
        throw error;
      }
    },
    enabled: !!userToken && year > 0 && month > 0,
  });
}; 