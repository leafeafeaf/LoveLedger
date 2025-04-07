import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { 
  fetchDiaryListStart, 
  fetchDiaryListSuccess, 
  fetchDiaryListFailure 
} from '../store/contentSlice';
import { BookItem } from '../types';

export interface DiaryContent {
  id: number;
  title: string;
  content: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string | null;
  mood?: number;  // 기분 정보 추가
}

interface DiaryResponse {
  data: {
    content: DiaryContent[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

interface DiaryQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const useDiaryList = (params: DiaryQueryParams = {}) => {
  const dispatch = useDispatch();

  return useQuery<DiaryResponse>({
    queryKey: ['diaries', params],
    queryFn: async () => {
      try {
        dispatch(fetchDiaryListStart());
        const response = await axiosInstance.get('/diary', {
          params: {
            pageno: params.page || 1,
            size: params.size || 50,
            sort: params.sort || 'DESC'
          }
        });
        dispatch(fetchDiaryListSuccess(response.data.data.content));
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '일기 목록을 불러오는데 실패했습니다.';
        dispatch(fetchDiaryListFailure(errorMessage));
        throw new Error(errorMessage);
      }
    }
  });
}; 