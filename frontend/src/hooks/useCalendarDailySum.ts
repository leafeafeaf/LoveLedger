import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { 
  fetchCalendarDailySumStart, 
  fetchCalendarDailySumSuccess, 
  fetchCalendarDailySumFailure 
} from '../store/financeSlice';
import { RootState } from '../store/';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  try {
    const response = await axiosInstance.get<CalendarDailySumResponse>(`/account/history/sum/list?year=${year}&month=${month}`);
    console.log('API 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('API 에러:', error);
    throw error;
  }
};

// 커스텀 훅
export const useCalendarDailySum = (year: number, month: number) => {
  const dispatch = useDispatch();
  const calendarData = useSelector((state: RootState) => state.finance.calendarDailySum);

  const query = useQuery({
    queryKey: ['calendarDailySum', year, month],
    queryFn: () => fetchCalendarDailySum({ year, month }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      console.log('Redux에 저장될 데이터:', query.data.data);
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

  return { ...query, calendarData };
};

// axios.ts의 인터셉터에서
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    console.log('현재 토큰:', token); // 토큰 확인
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 