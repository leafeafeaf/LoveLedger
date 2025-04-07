import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";
import { Alert } from "react-native";

interface UpdateTransactionRequest {
  transactionId: string[];
  updatedTargetNames: string[];
}

interface UpdateTransactionResponse {
  status: number;
  message: string;
  success: boolean;
  data?: any;
}

export const useUpdateTransactionHistory = () => {
  return useMutation<UpdateTransactionResponse, Error, UpdateTransactionRequest>({
    mutationFn: async (payload: UpdateTransactionRequest) => {
      console.log("API 호출")
      
      const response = await axiosInstance.patch<UpdateTransactionResponse>(
        "/diary/history",
        payload
      );
      return response.data;
    },

    onSuccess: (data) => {
      if (data.success) {
        Alert.alert("성공", "거래 내역이 성공적으로 수정되었습니다.");
      } else {
        Alert.alert("실패", "서버 응답: " + data.message);
      }
    },

    onError: (error: any) => {
      console.error("거래 내역 수정 중 오류 발생:", error);
      Alert.alert("오류", "거래 내역을 수정하는 도중 문제가 발생했습니다.");
    },
  });
};
