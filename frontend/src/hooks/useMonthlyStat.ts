import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  fetchMonthlyStatStart, 
  fetchMonthlyStatSuccess, 
  fetchMonthlyStatFailure 
} from '../store/financeSlice';

// API 응답 타입
interface ApiMonthStatItem {
  categoryName: string;
  consumeSum: number;
  earnSum: number;
}

interface WeekStatItem {
  week: number;
  totalConsumeSum: number;
  totalEarnSum: number;
}

interface ApiResponse {
  status: number;
  data: {
    monthStat: {
      categoryName: string;
      consumeSum: number;
      earnSum: number;
    }[];
    weekStat: {
      week: number;
      totalEarnSum: number;
      totalConsumeSum: number;
    }[];
  };
  timestamp: string;
  success: boolean;
}

// Redux store에서 사용하는 타입
interface MonthStatItem extends ApiMonthStatItem {
  percentage: number;
}

interface MonthlyStatResponse {
  monthStat: MonthStatItem[];
  weekStat: WeekStatItem[];
}

interface MonthlyStatError {
  message: string;
}

// API 호출 함수
const fetchMonthlyStat = async ({ year, month }: { year: number; month: number }): Promise<MonthlyStatResponse> => {
  console.log('월별 통계 API 호출:', { year, month });
  try {
    const response = await axiosInstance.get<ApiResponse>(
      `/account/history/stat`, 
      { 
        params: { 
          year: year.toString(), 
          month: month.toString() 
        } 
      }
    );
    
    console.log('월별 통계 API 응답 데이터 (상세):', JSON.stringify(response.data, null, 2));
    
    // percentage 계산
    const totalAmount = response.data.data.monthStat.reduce((sum, stat) => sum + stat.consumeSum, 0);
    const monthStat = response.data.data.monthStat.map(stat => ({
      ...stat,
      percentage: totalAmount > 0 ? Number(((stat.consumeSum / totalAmount) * 100).toFixed(2)) : 0
    }));

    return {
      monthStat,
      weekStat: response.data.data.weekStat
    };
  } catch (error: any) {
    console.error('월별 통계 API 호출 중 오류 발생:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    throw error;
  }
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