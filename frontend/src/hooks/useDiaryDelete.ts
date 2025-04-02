import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../api/axios';
import { 
  deleteDiaryStart, 
  deleteDiarySuccess, 
  deleteDiaryFailure,
  fetchDiaryListStart,
  fetchDiaryListSuccess,
  fetchDiaryListFailure
} from '../store/contentSlice';

interface DiaryDeleteResponse {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

interface DiaryDeleteError {
  code: string;
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useDiaryDelete = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

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

  return useMutation<DiaryDeleteResponse, DiaryDeleteError, string>({
    mutationFn: async (diaryId: string) => {
      dispatch(deleteDiaryStart());
      try {
        const response = await axiosInstance.delete(`/diary/${diaryId}`);
        dispatch(deleteDiarySuccess());
        return response.data;
      } catch (error: any) {
        const errorResponse: DiaryDeleteError = {
          code: error.response?.data?.code || 'UNKNOWN',
          status: error.response?.status || 500,
          message: error.response?.data?.message || '알 수 없는 오류가 발생했습니다.',
          data: null,
          timestamp: new Date().toISOString()
        };
        dispatch(deleteDiaryFailure(errorResponse.message));
        throw errorResponse;
      }
    },
    onSuccess: async () => {
      // 일기 목록 캐시 무효화 및 새로고침
      await queryClient.invalidateQueries({ queryKey: ['diaries'] });
      await refreshDiaryList();
    },
    onError: (error) => {
      // 에러 처리 (상위 컴포넌트에서 처리)
      console.error('일기 삭제 실패:', error);
    }
  });
}; 