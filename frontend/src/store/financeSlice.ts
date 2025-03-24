import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../types';

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  transactions: [],
  isLoading: false,
  error: null
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    fetchTransactionsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTransactionsSuccess: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.isLoading = false;
    },
    fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    }
  }
});

export const { 
  fetchTransactionsStart, 
  fetchTransactionsSuccess, 
  fetchTransactionsFailure,
  addTransaction,
  updateTransaction,
  deleteTransaction
} = financeSlice.actions;
export default financeSlice.reducer;