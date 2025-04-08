import { axiosInstance } from "./axios";

import {
  AccountVerifyRequest,
  AccountVerifyResponse,
  AccountVerifyConfirmRequest,
  AccountVerifyConfirmResponse,
  Transaction,
} from "../types";

export const verifyAccount = async (
  data: AccountVerifyRequest,
  token: string
): Promise<AccountVerifyResponse> => {
  const response = await axiosInstance.post("/account/verify/request", data)
  return response.data;
};

export const confirmAccountVerification = async (
  data: AccountVerifyConfirmRequest,
  token: string
): Promise<AccountVerifyConfirmResponse> => {
  const response = await axiosInstance.post("/account/verify/confirm", data)
  return response.data;
};

export const getMonthlyTransactions = async (
  year: number,
  month: number,
  token: string
): Promise<Transaction[]> => {
  const response = await axios.get(
    `${BASE_URL}/account/history/monthly`,
    {
      params: {
        year,
        month
      },
      headers: {
        "Content-Type": "application/json; charset=utf8",
        Authorization: token,
      },
    }
  );
  return response.data.data;
};
