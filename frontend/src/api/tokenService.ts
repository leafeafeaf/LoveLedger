import { axiosInstance } from "./axios";

// API 응답 타입 정의
export interface TokenResponse {
  status: number;
  data: {
    accessToken: string;
    expiresIn: number;
  };
  timestamp: string;
  success: boolean;
}

/**
 * 사용자 ID를 기반으로 토큰을 가져오는 API 함수
 * @param userId 사용자 ID
 * @returns 토큰 정보가 포함된 응답 객체
 */
export const fetchToken = async (userId: number): Promise<TokenResponse> => {
  try {
    const response = await axiosInstance.get<TokenResponse>(
      `/test/token/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("토큰 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 액세스 토큰 재발급 API
 * @returns API 응답
 */
export const reissueToken = async () => {
  const { data, headers } = await axiosInstance.post("/reissue");
  return { data, headers };
};
