import { useMutation } from "@tanstack/react-query";
import { updateUserInfo } from "../api/user";
import { SignUpRequest } from "../types";
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
            userInfo: {
              id: "", // 서버에서 받은 사용자 ID를 넣어주어야 함
              name: variables.name,
              email: "", // 서버에서 받은 이메일 정보를 넣어주어야 함
            },
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
