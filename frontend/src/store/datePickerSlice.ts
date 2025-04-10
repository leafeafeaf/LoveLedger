import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DatePickerState {
  selectedDate: string | null;
  startDate: string | null;
  endDate: string | null;
  isRange: boolean;
  isCustomDate: boolean;
}

const initialState: DatePickerState = {
  selectedDate: null,
  startDate: null,
  endDate: null,
  isRange: false,
  isCustomDate: false,
};

const datePickerSlice = createSlice({
  name: "datePicker",
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
      state.isCustomDate = !!action.payload;
    },
    setStartDate: (state, action: PayloadAction<string | null>) => {
      state.startDate = action.payload;
      state.isCustomDate = !!action.payload;
    },
    setEndDate: (state, action: PayloadAction<string | null>) => {
      state.endDate = action.payload;
      state.isCustomDate = !!action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.isRange = true;
      state.isCustomDate = true;
    },
    setRangeMode: (state, action: PayloadAction<boolean>) => {
      state.isRange = action.payload;
    },
    resetDates: (state) => {
      state.startDate = null;
      state.endDate = null;
      state.selectedDate = null;
      state.isCustomDate = false;
    },
  },
});

export const {
  setSelectedDate,
  setStartDate,
  setEndDate,
  setRangeMode,
  resetDates,
  setDateRange,
} = datePickerSlice.actions;

export default datePickerSlice.reducer;
