import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  setSelectedDate,
  setStartDate,
  setEndDate,
  setRangeMode,
  resetDates,
  setDateRange,
} from "../store/datePickerSlice";

export const useDatePicker = () => {
  const dispatch = useAppDispatch();
  const {
    selectedDate: selectedDateStr,
    startDate: startDateStr,
    endDate: endDateStr,
    isRange,
    isCustomDate,
  } = useAppSelector((state) => state.datePicker);

  // ISO 문자열을 Date 객체로 변환
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : null;
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  // 단일 날짜 설정
  const selectDate = useCallback(
    (date: Date | null) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  // 시작 날짜 설정
  const selectStartDate = useCallback(
    (date: Date | null) => {
      dispatch(setStartDate(date));
    },
    [dispatch]
  );

  // 종료 날짜 설정
  const selectEndDate = useCallback(
    (date: Date | null) => {
      dispatch(setEndDate(date));
    },
    [dispatch]
  );

  // 범위 모드 설정
  const setRangeModeEnabled = useCallback(
    (enabled: boolean) => {
      dispatch(setRangeMode(enabled));
    },
    [dispatch]
  );

  // 날짜 초기화
  const resetAllDates = useCallback(() => {
    dispatch(resetDates());
  }, [dispatch]);

  // 날짜 범위 한번에 설정 (깊은 복사 추가)
  const selectDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      const startClone = new Date(startDate.getTime());
      const endClone = new Date(endDate.getTime());
      dispatch(setDateRange({ startDate: startClone, endDate: endClone }));
    },
    [dispatch]
  );

  return {
    // 상태
    selectedDate,
    startDate,
    endDate,
    isRange,
    isCustomDate,

    // 액션 함수
    selectDate,
    selectStartDate,
    selectEndDate,
    setRangeModeEnabled,
    resetAllDates,
    selectDateRange,
  };
};

export default useDatePicker;
