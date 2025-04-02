import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "./reduxHooks";
import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@env";
import {
  InviteResponse,
  InviteErrorResponse,
  InviteValidateResponse,
} from "../types";

/**
 * 초대 링크 생성을 위한 React Query 커스텀 훅
 * @returns 초대 링크 생성 관련 데이터와 함수들
 */
export const useInvite = () => {
  const accessToken = useAppSelector((state) => {
    console.log("Redux State:", state);
    console.log("Auth State:", state.auth);
    return state.auth.userToken;
  });

  console.log("Access Token:", accessToken);

  return useQuery<InviteResponse, InviteErrorResponse>({
    queryKey: ["invite"],
    queryFn: async () => {
      console.log("Executing query function");
      console.log("Access Token in query:", accessToken);

      if (!accessToken) {
        console.error("No access token available");
        throw new Error("인증 토큰이 없습니다.");
      }

      try {
        console.log("Making API request to:", `${API_BASE_URL}/invite`);
        const response = await axios.get(`${API_BASE_URL}/invite`, {
          headers: {
            "Content-Type": "application/json; charset=utf8",
            Authorization: accessToken,
          },
        });
        console.log("API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        if (axios.isAxiosError(error)) {
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
          // API 명세에 맞는 에러 응답 형식으로 변환
          const errorResponse: InviteErrorResponse = {
            status: error.response?.status.toString() || "500",
            message:
              error.response?.data?.message ||
              "알 수 없는 오류가 발생했습니다.",
            data: error.response?.data?.data || null,
            timestamp: new Date().toISOString(),
          };
          throw errorResponse;
        }
        throw error;
      }
    },
    enabled: !!accessToken,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
  });
};

/**
 * 초대 링크 유효성 검사를 위한 React Query 커스텀 훅
 * @param linkCode 초대 링크 코드
 * @param userId 사용자 ID
 * @returns 초대 링크 유효성 검사 관련 데이터와 함수들
 */
export const useValidateInviteLink = (linkCode: string, userId: string) => {
  const accessToken = useAppSelector((state) => state.auth.userToken);

  return useQuery<InviteValidateResponse, InviteErrorResponse>({
    queryKey: ["validateInvite", linkCode],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/invite/validate/${linkCode}`,
          {
            headers: {
              "Content-Type": "application/json; charset=utf8",
              Authorization: accessToken,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorResponse: InviteErrorResponse = {
            status: error.response?.status.toString() || "500",
            message:
              error.response?.data?.message ||
              "알 수 없는 오류가 발생했습니다.",
            data: error.response?.data?.data || null,
            timestamp: new Date().toISOString(),
          };
          throw errorResponse;
        }
        throw error;
      }
    },
    enabled: !!accessToken && !!linkCode,
    retry: 1,
  });
};

/**
 * 부부 연동을 위한 React Query 커스텀 훅
 * @returns 부부 연동 관련 함수들
 */
export const useJoinCouple = () => {
  const accessToken = useAppSelector((state) => state.auth.userToken);

  return useMutation({
    mutationFn: async (linkCode: string) => {
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/couple/join/${linkCode}`,
          {},
          {
            headers: {
              "Content-Type": "application/json; charset=utf8",
              Authorization: accessToken,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorResponse: InviteErrorResponse = {
            status: error.response?.status.toString() || "500",
            message:
              error.response?.data?.message ||
              "알 수 없는 오류가 발생했습니다.",
            data: error.response?.data?.data || null,
            timestamp: new Date().toISOString(),
          };
          throw errorResponse;
        }
        throw error;
      }
    },
  });
};
