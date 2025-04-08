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

// 날짜 직렬화를 위한 유틸리티 함수
const serializeDate = (date: Date | null): string | null => {
  if (!date) return null;
  try {
    // yyyy-MM-dd 형태로 변환하여 날짜만 저장 (시간 정보 제거)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Date 직렬화 오류:", error);
    return null;
  }
};

const datePickerSlice = createSlice({
  name: "datePicker",
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<Date | null | string>) => {
      if (action.payload) {
        if (typeof action.payload === "string") {
          // 이미 문자열이면 그대로 사용
          state.selectedDate = action.payload;
        } else {
          // Date 객체이면 직렬화
          state.selectedDate = serializeDate(action.payload);
        }
      } else {
        state.selectedDate = null;
      }
      state.isCustomDate = !!action.payload;
    },
    setStartDate: (state, action: PayloadAction<Date | null | string>) => {
      if (action.payload) {
        if (typeof action.payload === "string") {
          // 이미 문자열이면 그대로 사용
          state.startDate = action.payload;
        } else {
          // Date 객체이면 직렬화
          state.startDate = serializeDate(action.payload);
        }
      } else {
        state.startDate = null;
      }
      state.isCustomDate = !!action.payload;
    },
    setEndDate: (state, action: PayloadAction<Date | null | string>) => {
      if (action.payload) {
        if (typeof action.payload === "string") {
          // 이미 문자열이면 그대로 사용
          state.endDate = action.payload;
        } else {
          // Date 객체이면 직렬화
          state.endDate = serializeDate(action.payload);
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
      action: PayloadAction<{
        startDate: Date | string;
        endDate: Date | string;
      }>
    ) => {
      try {
        if (typeof action.payload.startDate === "string") {
          state.startDate = action.payload.startDate;
        } else {
          state.startDate = serializeDate(action.payload.startDate);
        }

        if (typeof action.payload.endDate === "string") {
          state.endDate = action.payload.endDate;
        } else {
          state.endDate = serializeDate(action.payload.endDate);
        }
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
