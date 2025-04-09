import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  Transaction,
  TransactionDetail,
  PageInfo,
  AccountDetailResponse,
} from "../types";

interface Goal {
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  goalDate: string;
  title: string;
  contentURL: string;
}

interface MonthStat {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface WeekStat {
  weekNumber: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface MonthlyStatResponse {
  monthStat: MonthStat;
  weekStat: WeekStat[];
}

interface DailySum {
  targetDate: string;
  totalConsumeSum: number;
  totalEarnSum: number;
}

interface AccountDetailState {
  data: AccountDetailResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  goalList: {
    goal: Goal | null;
    isLoading: boolean;
    error: string | null;
  };
  monthlyStat: {
    monthStat: MonthStat;
    weekStat: WeekStat[];
    isLoading: boolean;
    error: string | null;
  };
  calendarDailySum: {
    data: DailySum[];
    isLoading: boolean;
    error: string | null;
  };
  transactionList: {
    data: Transaction[];
    isLoading: boolean;
    error: string | null;
  };
  accountDetail: AccountDetailState;
  transactionUpdate: {
    isLoading: boolean;
    error: string | null;
  };
  transactionDelete: {
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: FinanceState = {
  transactions: [],
  isLoading: false,
  error: null,
  goalList: {
    goal: null,
    isLoading: false,
    error: null,
  },
  monthlyStat: {
    monthStat: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    },
    weekStat: [],
    isLoading: false,
    error: null,
  },
  calendarDailySum: {
    data: [],
    isLoading: false,
    error: null,
  },
  transactionList: {
    data: [],
    isLoading: false,
    error: null,
  },
  accountDetail: {
    data: null,
    isLoading: false,
    error: null,
  },
  transactionUpdate: {
    isLoading: false,
    error: null,
  },
  transactionDelete: {
    isLoading: false,
    error: null,
  },
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    fetchTransactionsStart: (state) => {
      state.transactionList.isLoading = true;
      state.transactionList.error = null;
    },
    fetchTransactionsSuccess: (state, action: PayloadAction<Transaction[]>) => {
      state.transactionList.data = action.payload;
      state.transactionList.isLoading = false;
    },
    fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.transactionList.isLoading = false;
      state.transactionList.error = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(
        (t) => t.id === action.payload.id
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      );
    },
    fetchGoalListStart: (state) => {
      state.goalList.isLoading = true;
      state.goalList.error = null;
    },
    fetchGoalListSuccess: (state, action: PayloadAction<Goal | null>) => {
      state.goalList.isLoading = false;
      state.goalList.goal = action.payload;
    },
    fetchGoalListFailure: (state, action: PayloadAction<string>) => {
      state.goalList.isLoading = false;
      state.goalList.error = action.payload;
    },
    fetchMonthlyStatStart: (state) => {
      state.monthlyStat.isLoading = true;
      state.monthlyStat.error = null;
    },
    fetchMonthlyStatSuccess: (
      state,
      action: PayloadAction<MonthlyStatResponse>
    ) => {
      state.monthlyStat.monthStat = action.payload.monthStat;
      state.monthlyStat.weekStat = action.payload.weekStat;
      state.monthlyStat.isLoading = false;
    },
    fetchMonthlyStatFailure: (state, action: PayloadAction<string>) => {
      state.monthlyStat.isLoading = false;
      state.monthlyStat.error = action.payload;
    },
    fetchCalendarDailySumStart: (state) => {
      state.calendarDailySum.isLoading = true;
      state.calendarDailySum.error = null;
    },
    fetchCalendarDailySumSuccess: (
      state,
      action: PayloadAction<DailySum[]>
    ) => {
      state.calendarDailySum.data = action.payload;
      state.calendarDailySum.isLoading = false;
    },
    fetchCalendarDailySumFailure: (state, action: PayloadAction<string>) => {
      state.calendarDailySum.isLoading = false;
      state.calendarDailySum.error = action.payload;
    },
    fetchAccountDetailStart: (state) => {
      state.accountDetail.isLoading = true;
      state.accountDetail.error = null;
    },
    fetchAccountDetailSuccess: (
      state,
      action: PayloadAction<AccountDetailResponse>
    ) => {
      state.accountDetail.isLoading = false;
      state.accountDetail.data = action.payload;
    },
    fetchAccountDetailFailure: (state, action: PayloadAction<string>) => {
      state.accountDetail.isLoading = false;
      state.accountDetail.error = action.payload;
    },
    updateTransactionStart: (state) => {
      state.transactionUpdate.isLoading = true;
      state.transactionUpdate.error = null;
    },
    updateTransactionSuccess: (state, action) => {
      state.transactionUpdate.isLoading = false;
      if (state.accountDetail.data) {
        state.accountDetail.data.content = state.accountDetail.data.content.map(
          (transaction) =>
            transaction.transactionId === action.payload.transactionId
              ? { ...transaction, targetName: action.payload.updatedTargetName }
              : transaction
        );
      }
    },
    updateTransactionFailure: (state, action) => {
      state.transactionUpdate.isLoading = false;
      state.transactionUpdate.error = action.payload;
    },
    deleteTransactionStart: (state) => {
      state.transactionDelete.isLoading = true;
      state.transactionDelete.error = null;
    },
    deleteTransactionSuccess: (state, action: PayloadAction<string>) => {
      state.transactionDelete.isLoading = false;
      if (state.accountDetail.data) {
        state.accountDetail.data.content =
          state.accountDetail.data.content.filter(
            (transaction) => transaction.transactionId !== action.payload
          );
      }
    },
    deleteTransactionFailure: (state, action: PayloadAction<string>) => {
      state.transactionDelete.isLoading = false;
      state.transactionDelete.error = action.payload;
    },
  },
});

export const {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  fetchGoalListStart,
  fetchGoalListSuccess,
  fetchGoalListFailure,
  fetchMonthlyStatStart,
  fetchMonthlyStatSuccess,
  fetchMonthlyStatFailure,
  fetchCalendarDailySumStart,
  fetchCalendarDailySumSuccess,
  fetchCalendarDailySumFailure,
  fetchAccountDetailStart,
  fetchAccountDetailSuccess,
  fetchAccountDetailFailure,
  updateTransactionStart,
  updateTransactionSuccess,
  updateTransactionFailure,
  deleteTransactionStart,
  deleteTransactionSuccess,
  deleteTransactionFailure,
} = financeSlice.actions;
export default financeSlice.reducer;
