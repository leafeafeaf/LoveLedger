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
    setSelectedDate: (state, action: PayloadAction<Date | null>) => {
      if (action.payload) {
        try {
          state.selectedDate = action.payload.toISOString();
        } catch (error) {
          console.error("Date 변환 오류:", error);
          state.selectedDate = null;
        }
      } else {
        state.selectedDate = null;
      }
      state.isCustomDate = !!action.payload;
    },
    setStartDate: (state, action: PayloadAction<Date | null>) => {
      if (action.payload) {
        try {
          state.startDate = action.payload.toISOString();
        } catch (error) {
          console.error("Date 변환 오류:", error);
          state.startDate = null;
        }
      } else {
        state.startDate = null;
      }
      state.isCustomDate = !!action.payload;
    },
    setEndDate: (state, action: PayloadAction<Date | null>) => {
      if (action.payload) {
        try {
          state.endDate = action.payload.toISOString();
        } catch (error) {
          console.error("Date 변환 오류:", error);
          state.endDate = null;
        }
      } else {
        state.endDate = null;
      }
      state.isCustomDate = !!action.payload;
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
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: Date; endDate: Date }>
    ) => {
      try {
        state.startDate = action.payload.startDate.toISOString();
        state.endDate = action.payload.endDate.toISOString();
      } catch (error) {
        console.error("Date 변환 오류:", error);
        state.startDate = null;
        state.endDate = null;
      }
      state.isRange = true;
      state.isCustomDate = true;
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
