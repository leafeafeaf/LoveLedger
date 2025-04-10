//TODO 다른데서 불러와야할듯

import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface FictionArtRequest {
  content: string;
  drawStyle: string;
  title: string;
}

interface FictionArtResponse {
  status: string;
  message: string;
  data: {
    imageUrl: string;
  };
  timestamp: string;
}

interface FictionArtError {
  status: string;
  message: string;
  data: null;
  timestamp: string;
}

export const useFictionArt = () => {
  return useMutation<FictionArtResponse, FictionArtError, FictionArtRequest>({
    mutationFn: async ({ content, drawStyle, title }) => {
      console.log("그림 생성 API 실행")
      console.log("API에 전송되는 drawStyle:", drawStyle)
      console.log("API 요청 데이터:", { content: content.substring(0, 50) + "...", drawStyle, title })
      
      const response = await axiosInstance.post<FictionArtResponse>("/fictions/art", {
        content,
        drawStyle,
        title,
      });
      return response.data;
    },
    onError: (error) => {
      console.log(error)
      if (error.message.includes("테마가 존재하지 않습니다")) {
        throw new Error("THEME_NOT_FOUND");
      }
      throw error;
    },
  });
}; 