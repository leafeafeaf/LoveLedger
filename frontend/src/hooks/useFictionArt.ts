import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";

interface FictionArtRequest {
  context: string;
  themeId: number;
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
    mutationFn: async ({ context, themeId, title }) => {
      const response = await axiosInstance.post<FictionArtResponse>("/fiction/art", {
        context,
        themeId,
        title,
      });
      return response.data;
    },
    onError: (error) => {
      if (error.message.includes("테마가 존재하지 않습니다")) {
        throw new Error("THEME_NOT_FOUND");
      }
      throw error;
    },
  });
}; 