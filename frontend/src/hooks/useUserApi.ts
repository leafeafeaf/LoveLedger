import { useMutation, useQuery } from "@tanstack/react-query";
import { updateUserInfo, updateUserProfile, getUserDetail } from "../api/user";
import { SignUpRequest, UpdateUserRequest, UserDetailResponse } from "../types";
import { useAppDispatch } from "./reduxHooks";
import { loginSuccess, loginFailure } from "../store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 유저 기본 정보 업데이트를 위한 커스텀 훅
 * 회원가입 후 추가 정보 입력에 사용됨
 */
export const useUpdateUserInfo = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (userData: SignUpRequest) => updateUserInfo(userData),
    onSuccess: async (data, variables) => {
      // 성공시 Redux 스토어 업데이트
      if (data.success) {
        // API 응답에 유저 정보가 포함되어 있다면 그 정보로 업데이트
        // 현재는 응답에 유저 정보가 없어서 기존 토큰만 유지
        const token = (await AsyncStorage.getItem("token")) || "";

        dispatch(
          loginSuccess({
            token,
          })
        );
      } else {
        dispatch(loginFailure("사용자 정보 업데이트 실패"));
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "사용자 정보 업데이트 중 오류가 발생했습니다.";
      dispatch(loginFailure(errorMessage));
    },
  });
};

/**
 * 유저 정보 수정을 위한 커스텀 훅
 * @returns mutation 객체 (isLoading, isSuccess, mutate 등)
 */
export const useUpdateUserProfile = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (userData: UpdateUserRequest) => updateUserProfile(userData),
    onSuccess: (data) => {
      if (data.success) {
        // 성공 시 필요한 처리 (예: 토스트 메시지 표시)
        console.log("유저 정보 수정 성공");
      } else {
        dispatch(loginFailure("유저 정보 수정 실패"));
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "유저 정보 수정 중 오류가 발생했습니다.";
      dispatch(loginFailure(errorMessage));
    },
  });
};

/**
 * 유저 상세 정보 조회를 위한 커스텀 훅
 * @returns query 객체 (data, isLoading, isError 등)
 */
export const useUserDetail = () => {
  return useQuery({
    queryKey: ["userDetail"],
    queryFn: getUserDetail,
    select: (response) => response.data as UserDetailResponse,
    staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
  });
};
