import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../api/axios";
import { fetchSeriesListStart, fetchSeriesListSuccess, fetchSeriesListFailure } from "../store/contentSlice";

interface Series {
  seriesid: number;
  seriesname: string;
}

interface SeriesListResponse {
  series: Series[];
}

interface SeriesListError {
  message: string;
}

export const useSeriesList = () => {
  const dispatch = useDispatch();

  return useQuery<SeriesListResponse, SeriesListError>({
    queryKey: ["series"],
    queryFn: async () => {
      try {
        dispatch(fetchSeriesListStart());
        const response = await axiosInstance.get("/series");
        dispatch(fetchSeriesListSuccess(response.data.data));
        return response.data.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "시리즈 목록을 불러오는데 실패했습니다.";
        dispatch(fetchSeriesListFailure(errorMessage));
        throw { message: errorMessage };
      }
    },
  });
}; 