import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Transaction } from "../types";
import { useView } from "./ViewContext";
import { axiosInstance } from "../api/axios";

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsForDate: (date: Date) => Transaction[];
}

const defaultContext: TransactionContextType = {
  transactions: [],
  isLoading: false,
  error: null,
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  getTransactionsForDate: () => [],
};

const TransactionContext =
  createContext<TransactionContextType>(defaultContext);

export const useTransactions = () => useContext(TransactionContext);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeView } = useView();

  // 트랜잭션 데이터 로드
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get("/account/history");
        const transactionData = response.data.data;

        // activeView에 따라 데이터 필터링
        let filteredTransactions;
        if (activeView === "you") {
          filteredTransactions = transactionData.filter(
            (t: Transaction) => t.userId === "user1"
          );
        } else if (activeView === "partner") {
          filteredTransactions = transactionData.filter(
            (t: Transaction) => t.userId === "user2"
          );
        } else {
          filteredTransactions = transactionData;
        }

        setTransactions(filteredTransactions);
      } catch (err: any) {
        setError(err.message || "트랜잭션 데이터 로드 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [activeView]);

  // 특정 날짜의 트랜잭션 가져오기
  const getTransactionsForDate = (date: Date): Transaction[] => {
    const dateString = date.toISOString().split("T")[0];
    return transactions.filter(
      (t) => t.date === dateString || t.time?.startsWith(dateString)
    );
  };

  // 트랜잭션 추가
  const addTransaction = async (transaction: Transaction) => {
    try {
      const response = await axiosInstance.post(
        "/account/history",
        transaction
      );
      setTransactions((prev) => [response.data.data, ...prev]);
    } catch (err: any) {
      throw new Error(err.message || "트랜잭션 추가 중 오류가 발생했습니다.");
    }
  };

  // 트랜잭션 업데이트
  const updateTransaction = async (transaction: Transaction) => {
    try {
      const response = await axiosInstance.put(
        `/account/history/${transaction.id}`,
        transaction
      );
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? response.data.data : t))
      );
    } catch (err: any) {
      throw new Error(
        err.message || "트랜잭션 업데이트 중 오류가 발생했습니다."
      );
    }
  };

  // 트랜잭션 삭제
  const deleteTransaction = async (id: string) => {
    try {
      await axiosInstance.delete(`/account/history/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "트랜잭션 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsForDate,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
