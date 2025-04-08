import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { verifyAccount, confirmAccountVerification } from "../api/account";
import { AccountVerifyRequest, AccountVerifyConfirmRequest } from "../types";
import {
  setVerifiedAccount,
  setConfirmedAccount,
  setError,
  setLoading,
} from "../store/accountSlice";
import { useAppSelector } from "./reduxHooks";
import { Alert } from "react-native"

export const useAccountVerification = () => {
  const dispatch = useDispatch();
  const { verifiedAccount, confirmedAccount, loading, error } = useAppSelector(
    (state) => state.account
  );

  const verifyMutation = useMutation({
    mutationFn: async ({
      accountNo,
      token,
    }: AccountVerifyRequest & { token: string }) => {
      dispatch(setLoading(true));
      return verifyAccount({ accountNo }, token);
    },
    onSuccess: (data) => {
      dispatch(setVerifiedAccount(data));
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      dispatch(
        setError(
          error.response?.data?.message || "계좌 인증 중 오류가 발생했습니다."
        )
      );
      dispatch(setLoading(false));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async ({
      authCode,
      accountNo,
      token,
    }: AccountVerifyConfirmRequest & { token: string }) => {
      dispatch(setLoading(true));
      return confirmAccountVerification({ authCode, accountNo }, token);
    },
    onSuccess: (data) => {
      dispatch(setConfirmedAccount(data));
      dispatch(setLoading(false));
      Alert.alert("성공", "계좌 등록에 성공하였습니다.");
    },
    onError: (error: any) => {
      dispatch(
        setError(
          error.response?.data?.message ||
            "계좌 인증 확인 중 오류가 발생했습니다."
        )
      );
      dispatch(setLoading(false));
    },
  });

  return {
    verifyAccount: verifyMutation.mutate,
    confirmAccount: confirmMutation.mutate,
    isLoading: loading,
    error,
    verifiedAccount,
    confirmedAccount,
  };
};
