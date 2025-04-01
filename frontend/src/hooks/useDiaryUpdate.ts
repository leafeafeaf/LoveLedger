import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../api/axios';
import { 
  fetchDiaryListStart, 
  fetchDiaryListSuccess, 
  fetchDiaryListFailure 
} from '../store/contentSlice';
import { AxiosError } from 'axios';

interface DiaryUpdatePayload {
  title: string;
  content: string;
  targetDate: string;
  mood: string;
}

interface ApiError {
  code: string;
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

interface ValidationError {
  title?: string;
  content?: string;
}

export const useDiaryUpdate = (diaryId: string) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const validateInput = (payload: DiaryUpdatePayload): ValidationError => {
    const errors: ValidationError = {};
    
    if (!payload.title.trim()) {
      errors.title = '제목을 입력해주세요.';
    } else if (payload.title.length > 40) {
      errors.title = '제목은 최대 40자까지 입력 가능합니다.';
    }

    if (!payload.content.trim()) {
      errors.content = '본문을 입력해주세요.';
    } else if (payload.content.length > 500) {
      errors.content = '본문은 최대 500자까지 입력 가능합니다.';
    }

    return errors;
  };

  const updateDiary = async (payload: DiaryUpdatePayload) => {
    const validationErrors = validateInput(payload);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error(Object.values(validationErrors).join(', '));
    }

    try {
      const response = await axiosInstance.patch(`/diary/${diaryId}`, payload);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.status) {
          case 403:
            throw new Error('해당 일기를 수정할 권한이 없습니다.');
          case 404:
            throw new Error('해당 일기를 찾을 수 없습니다.');
          case 400:
            throw new Error(apiError.message);
          default:
            throw new Error('일기 수정에 실패했습니다.');
        }
      }
      throw error;
    }
  };

  const refreshDiaryList = async () => {
    try {
      dispatch(fetchDiaryListStart());
      const response = await axiosInstance.get('/diary', {
        params: {
          page: 1,
          size: 50,
          sort: 'DESC'
        }
      });
      dispatch(fetchDiaryListSuccess(response.data.data.content));
    } catch (error) {
      dispatch(fetchDiaryListFailure(error instanceof Error ? error.message : '일기 목록을 불러오는데 실패했습니다.'));
    }
  };

  return useMutation({
    mutationFn: updateDiary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['diary', diaryId] });
      await refreshDiaryList();
    },
  });
}; 