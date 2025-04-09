import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '../store/contentSlice';

interface DiaryCreateRequest {
  title: string;
  content: string;
  targetDate: string;
  mood: string;
}

interface DiaryCreateResponse {
  status: number;
  message: string;
  data: {
    id: string;
  };
  timestamp: string;
}

interface ValidationError {
  code: string;
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useDiaryCreate = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<DiaryCreateResponse, ValidationError, DiaryCreateRequest>({
    mutationFn: async (diary) => {
      // 유효성 검사
      if (!diary.title.trim()) {
        throw {
          code: 'V001',
          status: 400,
          message: '제목은 필수 입력 값입니다.',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      if (diary.title.length > 40) {
        throw {
          code: 'V001',
          status: 400,
          message: '제목은 40자를 초과할 수 없습니다.',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      if (!diary.content.trim()) {
        throw {
          code: 'V001',
          status: 400,
          message: '내용은 필수 입력 값입니다.',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      if (diary.content.length > 500) {
        throw {
          code: 'V001',
          status: 400,
          message: '내용은 500자를 초과할 수 없습니다.',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const targetDate = new Date(diary.targetDate);
      const today = new Date();
      targetDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (targetDate > today) {
        throw {
          code: 'V001',
          status: 400,
          message: '미래 날짜는 일기를 작성하실 수 없습니다.',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const response = await axiosInstance.post<DiaryCreateResponse>('/diary', diary);
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(setError(null));
    },
    onSuccess: () => {
      dispatch(setLoading(false));
      // 일기 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
    onError: (error) => {
      dispatch(setLoading(false));
      dispatch(setError(error.message));
    }
  });
}; 