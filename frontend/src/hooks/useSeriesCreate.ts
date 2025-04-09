import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { useDispatch } from 'react-redux';
import { 
  createSeriesStart, 
  createSeriesSuccess, 
  createSeriesFailure 
} from '../store/contentSlice';

interface SeriesCreateResponse {
  status: number;
  message: string;
  data: {
    title: string;
    seriesId: number;
  }
  timestamp: string;
  errorCode?: string;
}

interface SeriesCreateError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
  errorCode: string;
}

export const useSeriesCreate = () => {
  const dispatch = useDispatch();

  return useMutation<SeriesCreateResponse, SeriesCreateError, string>({
    mutationFn: async (title: string) => {
      dispatch(createSeriesStart());
      const response = await axiosInstance.post<SeriesCreateResponse>('/series', { title });
      return response.data;
    },
    onSuccess: () => {
      dispatch(createSeriesSuccess());
    },
    onError: (error) => {
      dispatch(createSeriesFailure(error.message));
    }
  });
}; 