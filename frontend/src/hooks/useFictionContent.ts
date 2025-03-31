import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface FictionContentRequest {
  themeId: number;
  seriesid: number;
  startdate: string;
  enddate: string;
}

interface FictionContentResponse {
  status: number;
  message: string;
  data: {
    content: string;
    title: string;
  };
  timestamp: string;
}

interface FictionContentError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useFictionContent = () => {
  return useMutation<FictionContentResponse, FictionContentError, FictionContentRequest>({
    mutationFn: async ({ themeId, seriesid, startdate, enddate }) => {
      const response = await axiosInstance.post<FictionContentResponse>("/fiction/content", {
        themeId,
        seriesid,
        startdate,
        enddate,
      });
      return response.data;
    },
    onError: (error) => {
      // 에러 메시지에 따른 에러 코드 처리
      if (error.message.includes("시작 날짜가 끝 날짜보다 이후일 수 없습니다")) {
        throw new Error("INVALID_DATE_RANGE");
      } else if (error.message.includes("테마가 존재하지 않습니다")) {
        throw new Error("THEME_NOT_FOUND");
      } else if (error.message.includes("시리즈가 존재하지 않습니다")) {
        throw new Error("SERIES_NOT_FOUND");
      }
      throw error;
    },
  });
}; 