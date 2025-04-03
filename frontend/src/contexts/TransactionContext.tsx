import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '../types';
import { transactionHistoryData } from '../../dummyData';
import { useView } from './ViewContext';

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
  getTransactionsForDate: () => []
};

const TransactionContext = createContext<TransactionContextType>(defaultContext);

export const useTransactions = () => useContext(TransactionContext);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeView } = useView();

  // 트랜잭션 데이터 로드 (현재는 더미 데이터 사용)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // activeView에 따라 데이터 필터링
      let filteredTransactions;
      if (activeView === 'you') {
        filteredTransactions = transactionHistoryData.data.history.filter(t => t.userId === 'user1');
      } else if (activeView === 'partner') {
        filteredTransactions = transactionHistoryData.data.history.filter(t => t.userId === 'user2');
      } else {
        filteredTransactions = transactionHistoryData.data.history;
      }
      
      setTransactions(filteredTransactions);
      setIsLoading(false);
    } catch (err) {
      setError('트랜잭션 데이터 로드 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  }, [activeView]);

  // 특정 날짜의 트랜잭션 가져오기
  const getTransactionsForDate = (date: Date): Transaction[] => {
    const dateString = date.toISOString().split('T')[0];
    return transactions.filter(t => t.date === dateString || t.time?.startsWith(dateString));
  };

  // 트랜잭션 추가
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  // 트랜잭션 업데이트
  const updateTransaction = (transaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    );
  };

  // 트랜잭션 삭제
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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
        getTransactionsForDate
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};