import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { setLoading, setError, setCurrentDiary, clearCurrentDiary } from '../store/contentSlice';
import { useEffect } from 'react';

interface DiaryDetailResponse {
  status: number;
  message: string;
  data: {
    id: string;
    title: string;
    content: string;
    targetDate: string;
    createdAt: string;
    updatedAt: string;
    mood: string;
  };
  timestamp: string;
}

interface ApiError {
  code: string;
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useDiaryDetail = (diaryId: string) => {
  const dispatch = useDispatch();

  const query = useQuery<DiaryDetailResponse, ApiError>({
    queryKey: ['diary', diaryId],
    queryFn: async () => {
      try {
        dispatch(setLoading(true));
        const response = await axiosInstance.get(`/diary/${diaryId}`);
        dispatch(setCurrentDiary(response.data.data));
        return response.data;
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.status === 403) {
          dispatch(setError('접근 권한이 없습니다.'));
        } else if (apiError.status === 404) {
          dispatch(setError('해당 일기를 찾을 수 없습니다.'));
        } else {
          dispatch(setError(apiError.message || '일기 상세 정보를 불러오는데 실패했습니다.'));
        }
        throw apiError;
      } finally {
        dispatch(setLoading(false));
      }
    },
    enabled: !!diaryId,
  });

  useEffect(() => {
    return () => {
      dispatch(clearCurrentDiary());
    };
  }, [dispatch]);

  return query;
}; 