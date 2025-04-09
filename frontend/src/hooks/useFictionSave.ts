import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface FictionSaveRequest {
  content: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  title: string;
  seriesId: number;
}

interface FictionSaveResponse {
  status: string;
  message: string;
  data: null;
  timestamp: string;
}

interface FictionSaveError {
  status: number;
  message: string;
  data: null;
  timestamp: string;
}

export const useFictionSave = () => {
  return useMutation<FictionSaveResponse, FictionSaveError, FictionSaveRequest>({
    mutationFn: async ({
      content,
      imageUrl,
      startDate,
      endDate,
      title,
      seriesId
    }) => {
      console.log("소설 저장 시작")

      const response = await axiosInstance.post<FictionSaveResponse>("/fictions", {
        content,
        imageUrl,
        startDate,
        endDate,
        title,
        seriesId
      });

      console.log(response)

      return response.data;
    },
    onError: (error) => {
      // 에러 메시지에 따른 에러 코드 처리
      console.error(error)

      if (error.message.includes("시작 날짜가 끝 날짜보다 이후일 수 없습니다")) {
        throw new Error("INVALID_DATE_RANGE");
      } else if (error.message.includes("테마가 존재하지 않습니다")) {
        throw new Error("THEME_NOT_FOUND");
      } else if (error.message.includes("시리즈가 존재하지 않습니다")) {
        throw new Error("SERIES_NOT_FOUND");
      } else if (error.message.includes("제목은 40자를 초과할 수 없습니다")) {
        throw new Error("TITLE_TOO_LONG");
      }
      throw error;
    },
  });
}; 