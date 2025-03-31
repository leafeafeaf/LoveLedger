import {
  useQuery,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { fetchToken, TokenResponse, reissueToken } from "../api/tokenService";
import { useAppDispatch } from "./reduxHooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import React from "react";
import { setToken, setError } from "../store/tokenSlice";
import { useMutation } from "@tanstack/react-query";

/**
 * 토큰 API 호출을 위한 커스텀 훅
 * React Query를 사용하여 토큰을 가져오고 관리합니다.
 */
export const useTokenApi = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const dispatch = useAppDispatch();

  // 토큰 데이터 처리 함수
  const handleTokenSuccess = useCallback(
    async (data: TokenResponse) => {
      if (data.success && data.data.accessToken) {
        // 토큰을 AsyncStorage에 저장
        await AsyncStorage.setItem("token", data.data.accessToken);

        // 토큰 만료 시간 저장
        const expiresAt = Date.now() + data.data.expiresIn;
        await AsyncStorage.setItem("tokenExpiresAt", expiresAt.toString());

        // Redux와 통합이 필요한 경우 여기에 dispatch 추가
        // dispatch(setToken(data.data.accessToken));
      }
    },
    [dispatch]
  );

  // 토큰 조회 쿼리
  const query = useQuery<TokenResponse, Error>({
    queryKey: ["token", userId],
    queryFn: () => {
      if (!userId) throw new Error("사용자 ID가 필요합니다.");
      return fetchToken(userId);
    },
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  });

  // 쿼리 성공 시 토큰 처리
  const { data } = query;

  // 데이터가 변경되면 처리 로직 실행
  React.useEffect(() => {
    if (data) {
      handleTokenSuccess(data);
    }
  }, [data, handleTokenSuccess]);

  // 특정 사용자 ID로 토큰을 가져오는 함수
  const getTokenForUser = (id: number) => {
    setUserId(id);
    return query.refetch();
  };

  return {
    tokenData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    getTokenForUser,
  };
};

/**
 * 액세스 토큰 재발급을 위한 커스텀 훅
 * @returns mutation 객체 (isLoading, isSuccess, mutate 등)
 */
export const useReissueToken = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: reissueToken,
    onSuccess: async (response) => {
      // 응답 헤더에서 새로운 액세스 토큰 추출
      const newAccessToken = response.headers.authorization;

      if (newAccessToken) {
        // 로컬 스토리지에 새로운 토큰 저장
        await AsyncStorage.setItem("token", newAccessToken);

        // Redux 상태 업데이트
        dispatch(
          setToken({
            accessToken: newAccessToken,
            expiresIn: 3600, // 기본 만료 시간 1시간
          })
        );
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "토큰 재발급 중 오류가 발생했습니다.";
      dispatch(setError(errorMessage));
    },
  });
};
