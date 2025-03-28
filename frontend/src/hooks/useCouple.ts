import { useMutation } from "@tanstack/react-query";
import { joinCouple, unlinkCouple } from "../api/couple";
import {
  CoupleJoinResponse,
  CoupleJoinErrorResponse,
  CoupleUnlinkResponse,
} from "../types/couple";
import { useAppDispatch } from "./reduxHooks";
import { setError } from "../store/coupleSlice";

/**
 * 부부 연동을 위한 커스텀 훅
 * @returns mutation 객체 (isLoading, isSuccess, mutate 등)
 */
export const useJoinCouple = () => {
  const dispatch = useAppDispatch();

  return useMutation<CoupleJoinResponse, CoupleJoinErrorResponse, string>({
    mutationFn: joinCouple,
    onSuccess: (data) => {
      if (data.status === 200) {
        // 성공 시 필요한 처리 (예: 토스트 메시지 표시)
        console.log("부부 연동 완료");
      }
    },
    onError: (error) => {
      let errorMessage = "부부 연동 중 오류가 발생했습니다.";

      switch (error.status) {
        case 400:
          if (error.code === "I001") {
            errorMessage = "자기자신과 연동은 안됩니다.";
          }
          break;
        case 409:
          if (error.data?.registeredAt) {
            errorMessage = "이미 연동되어 있는 계정입니다.";
          } else {
            errorMessage =
              "초대한 상대방이 이미 다른 사용자와 연동되어 있습니다.";
          }
          break;
        default:
          errorMessage = error.message;
      }

      dispatch(setError(errorMessage));
    },
  });
};

/**
 * 부부 연동 해제를 위한 커스텀 훅
 * @returns mutation 객체 (isLoading, isSuccess, mutate 등)
 */
export const useUnlinkCouple = () => {
  const dispatch = useAppDispatch();

  return useMutation<CoupleUnlinkResponse, Error, string>({
    mutationFn: unlinkCouple,
    onSuccess: (data) => {
      if (data.status === "200") {
        // 성공 시 필요한 처리 (예: 토스트 메시지 표시)
        console.log("부부 연동 해제 완료");
      }
    },
    onError: (error) => {
      const errorMessage = "부부 연동 해제 중 오류가 발생했습니다.";
      dispatch(setError(errorMessage));
    },
  });
};
