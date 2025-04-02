import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  fetchMonthlyStatStart, 
  fetchMonthlyStatSuccess, 
  fetchMonthlyStatFailure 
} from '../store/financeSlice';

// 타입 정의
interface MonthStat {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface WeekStat {
  weekNumber: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface MonthlyStatResponse {
  monthStat: MonthStat;
  weekStat: WeekStat[];
}

interface MonthlyStatError {
  message: string;
}

// API 호출 함수
const fetchMonthlyStat = async ({ year, month }: { year: number; month: number }): Promise<MonthlyStatResponse> => {
  const response = await axiosInstance.get<MonthlyStatResponse>(`/account/stat?year=${year}&month=${month}`);
  return response.data;
};

// 커스텀 훅
export const useMonthlyStat = (year: number, month: number) => {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['monthlyStat', year, month],
    queryFn: () => fetchMonthlyStat({ year, month }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
  });

  useEffect(() => {
    if (query.data) {
      dispatch(fetchMonthlyStatSuccess(query.data as MonthlyStatResponse));
    }
  }, [query.data, dispatch]);

  useEffect(() => {
    if (query.error) {
      dispatch(fetchMonthlyStatFailure((query.error as MonthlyStatError).message));
    }
  }, [query.error, dispatch]);

  useEffect(() => {
    if (query.isLoading) {
      dispatch(fetchMonthlyStatStart());
    }
  }, [query.isLoading, dispatch]);

  return query;
}; 