import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  fetchCalendarDailySumStart, 
  fetchCalendarDailySumSuccess, 
  fetchCalendarDailySumFailure 
} from '../store/financeSlice';

// 타입 정의
interface DailySum {
  targetDate: string;
  totalConsumeSum: number;
  totalEarnSum: number;
}

interface CalendarDailySumResponse {
  status: number;
  message: string;
  data: DailySum[];
  timestamp: string;
  success: boolean;
}

interface CalendarDailySumError {
  message: string;
}

// API 호출 함수
const fetchCalendarDailySum = async ({ year, month }: { year: number; month: number }): Promise<CalendarDailySumResponse> => {
  const response = await axiosInstance.get<CalendarDailySumResponse>(`/account/history/sum/list?year=${year}&month=${month}`);
  return response.data;
};

// 커스텀 훅
export const useCalendarDailySum = (year: number, month: number) => {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['calendarDailySum', year, month],
    queryFn: () => fetchCalendarDailySum({ year, month }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
  });

  useEffect(() => {
    if (query.data) {
      dispatch(fetchCalendarDailySumSuccess(query.data.data));
    }
  }, [query.data, dispatch]);

  useEffect(() => {
    if (query.error) {
      dispatch(fetchCalendarDailySumFailure((query.error as CalendarDailySumError).message));
    }
  }, [query.error, dispatch]);

  useEffect(() => {
    if (query.isLoading) {
      dispatch(fetchCalendarDailySumStart());
    }
  }, [query.isLoading, dispatch]);

  return query;
}; 