import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import useDatePicker from "../../hooks/useDatePicker";

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  isRange?: boolean;
  onSelectRange?: (startDate: Date, endDate: Date) => void;
  startDate?: Date;
  endDate?: Date;
}

interface CalendarDayItem {
  isEmpty?: boolean;
  index?: number;
  date?: Date;
  isToday?: boolean;
  isSelected?: boolean;
  isStartDate?: boolean;
  isEndDate?: boolean;
  isPeriod?: boolean;
}

export default function DatePicker({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  isRange = false,
  onSelectRange,
  startDate,
  endDate,
}: DatePickerProps) {
  // Redux 상태 사용
  const {
    selectDate,
    selectStartDate,
    selectEndDate,
    setRangeModeEnabled,
    resetAllDates,
    selectDateRange,
  } = useDatePicker();

  // 초기 상태 값을 props로부터 설정
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    try {
      // 표시할 월 설정 로직 (우선순위: 범위 시작일 > 선택된 단일날짜 > 현재 날짜)
      if (isRange && startDate) {
        return new Date(startDate.getTime());
      } else if (selectedDate) {
        return new Date(selectedDate.getTime());
      } else {
        return new Date();
      }
    } catch (error) {
      console.error("날짜 초기화 오류:", error);
      return new Date(); // 오류 발생 시 현재 날짜 반환
    }
  });

  // 단일 날짜 선택시 사용할 임시 상태
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(() => {
    try {
      return selectedDate ? new Date(selectedDate.getTime()) : null;
    } catch (error) {
      console.error("날짜 초기화 오류:", error);
      return null;
    }
  });

  // 범위 선택시 사용할 시작/종료일 임시 상태
  const [tempRangeStart, setTempRangeStart] = useState<Date | null>(() => {
    try {
      return startDate ? new Date(startDate.getTime()) : null;
    } catch (error) {
      console.error("날짜 초기화 오류:", error);
      return null;
    }
  });

  const [tempRangeEnd, setTempRangeEnd] = useState<Date | null>(() => {
    try {
      return endDate ? new Date(endDate.getTime()) : null;
    } catch (error) {
      console.error("날짜 초기화 오류:", error);
      return null;
    }
  });

  // 컴포넌트 마운트 또는 visible/props 변경 시 초기값 설정
  useEffect(() => {
    if (visible) {
      setRangeModeEnabled(isRange);

      try {
        if (isRange) {
          // 범위 선택 모드일 때 초기값 설정
          if (startDate) {
            // 깊은 복사로 새 객체 생성
            const startDateClone = new Date(startDate.getTime());
            setTempRangeStart(startDateClone);
            selectStartDate(new Date(startDate.getTime())); // 각 호출마다 새 객체 생성
            setDisplayedMonth(new Date(startDate.getTime()));
          }

          if (endDate) {
            // 깊은 복사로 새 객체 생성
            const endDateClone = new Date(endDate.getTime());
            setTempRangeEnd(endDateClone);
            selectEndDate(new Date(endDate.getTime())); // 각 호출마다 새 객체 생성
          }
        } else {
          // 단일 선택 모드일 때 초기값 설정
          if (selectedDate) {
            // 깊은 복사로 새 객체 생성
            const selectedDateClone = new Date(selectedDate.getTime());
            setTempSelectedDate(selectedDateClone);
            selectDate(new Date(selectedDate.getTime())); // 각 호출마다 새 객체 생성
            setDisplayedMonth(new Date(selectedDate.getTime()));
          }
        }
      } catch (error) {
        console.error("날짜 처리 오류:", error);
      }
    }
  }, [visible, isRange, selectedDate, startDate, endDate]);

  const [isAnimating, setIsAnimating] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const dimensions = useWindowDimensions();

  const screenWidth = Dimensions.get("window").width;
  const calendarWidth = Math.min(screenWidth * 0.9, 400); // 모달 너비 제한
  const dayCellWidth = (calendarWidth - 50) / 7; // 요일 셀 너비를 더 작게 조정

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 이전 달과 다음 달 계산
  const prevMonth = useMemo(() => {
    const date = new Date(displayedMonth);
    date.setMonth(date.getMonth() - 1);
    return date;
  }, [displayedMonth]);

  const nextMonth = useMemo(() => {
    const date = new Date(displayedMonth);
    date.setMonth(date.getMonth() + 1);
    return date;
  }, [displayedMonth]);

  // 현재 달의 캘린더 데이터
  const generateCalendarDays = useMemo((): CalendarDayItem[] => {
    const days = [];
    const totalDays = getDaysInMonth(displayedMonth);
    const firstDay = getFirstDayOfMonth(displayedMonth);
    const today = new Date();

    // 빈 날짜 추가
    for (let i = 0; i < firstDay; i++) {
      days.push({ isEmpty: true, index: i });
    }

    // 실제 날짜 추가
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth(),
        i
      );
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate
        ? date.toDateString() === selectedDate.toDateString()
        : tempSelectedDate
          ? date.toDateString() === tempSelectedDate.toDateString()
          : false;

      // 범위 선택 로직
      let isStartDate = false;
      let isEndDate = false;
      let isPeriod = false;

      if (isRange && tempRangeStart) {
        isStartDate = date.toDateString() === tempRangeStart.toDateString();

        if (tempRangeEnd) {
          isEndDate = date.toDateString() === tempRangeEnd.toDateString();
          // 시작일과 종료일 사이의 기간에 속하는지 확인 (시작일, 종료일 제외)
          isPeriod = date > tempRangeStart && date < tempRangeEnd;
        }
      }

      days.push({
        date,
        isToday,
        isSelected,
        isStartDate,
        isEndDate,
        isPeriod,
      });
    }

    return days;
  }, [
    displayedMonth,
    selectedDate,
    tempSelectedDate,
    tempRangeStart,
    tempRangeEnd,
    isRange,
  ]);

  // 이전 달의 캘린더 데이터
  const prevMonthCalendar = useMemo((): CalendarDayItem[] => {
    const days = [];
    const totalDays = getDaysInMonth(prevMonth);
    const firstDay = getFirstDayOfMonth(prevMonth);
    const today = new Date();

    // 빈 날짜 추가
    for (let i = 0; i < firstDay; i++) {
      days.push({ isEmpty: true, index: i });
    }

    // 실제 날짜 추가
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate
        ? date.toDateString() === selectedDate.toDateString()
        : tempSelectedDate
          ? date.toDateString() === tempSelectedDate.toDateString()
          : false;

      // 범위 선택 로직
      let isStartDate = false;
      let isEndDate = false;
      let isPeriod = false;

      if (isRange && tempRangeStart) {
        isStartDate = date.toDateString() === tempRangeStart.toDateString();

        if (tempRangeEnd) {
          isEndDate = date.toDateString() === tempRangeEnd.toDateString();
          // 시작일과 종료일 사이의 기간에 속하는지 확인 (시작일, 종료일 제외)
          isPeriod = date > tempRangeStart && date < tempRangeEnd;
        }
      }

      days.push({
        date,
        isToday,
        isSelected,
        isStartDate,
        isEndDate,
        isPeriod,
      });
    }

    return days;
  }, [
    prevMonth,
    selectedDate,
    tempSelectedDate,
    tempRangeStart,
    tempRangeEnd,
    isRange,
  ]);

  // 다음 달의 캘린더 데이터
  const nextMonthCalendar = useMemo((): CalendarDayItem[] => {
    const days = [];
    const totalDays = getDaysInMonth(nextMonth);
    const firstDay = getFirstDayOfMonth(nextMonth);
    const today = new Date();

    // 빈 날짜 추가
    for (let i = 0; i < firstDay; i++) {
      days.push({ isEmpty: true, index: i });
    }

    // 실제 날짜 추가
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate
        ? date.toDateString() === selectedDate.toDateString()
        : tempSelectedDate
          ? date.toDateString() === tempSelectedDate.toDateString()
          : false;

      // 범위 선택 로직
      let isStartDate = false;
      let isEndDate = false;
      let isPeriod = false;

      if (isRange && tempRangeStart) {
        isStartDate = date.toDateString() === tempRangeStart.toDateString();

        if (tempRangeEnd) {
          isEndDate = date.toDateString() === tempRangeEnd.toDateString();
          // 시작일과 종료일 사이의 기간에 속하는지 확인 (시작일, 종료일 제외)
          isPeriod = date > tempRangeStart && date < tempRangeEnd;
        }
      }

      days.push({
        date,
        isToday,
        isSelected,
        isStartDate,
        isEndDate,
        isPeriod,
      });
    }

    return days;
  }, [
    nextMonth,
    selectedDate,
    tempSelectedDate,
    tempRangeStart,
    tempRangeEnd,
    isRange,
  ]);

  // 주어진 날짜 배열로 주 단위로 그룹화하는 함수
  const groupIntoWeeks = (days: CalendarDayItem[]): CalendarDayItem[][] => {
    const weeks = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7 || i === days.length - 1) {
        // 마지막 주가 7일이 안 될 경우 빈 셀로 채움
        while (week.length < 7) {
          week.push({ isEmpty: true, index: i + week.length });
        }
        weeks.push([...week]);
        week = [];
      }
    }

    return weeks;
  };

  // 각 월별 주 계산
  const prevMonthWeeks = useMemo(
    () => groupIntoWeeks(prevMonthCalendar),
    [prevMonthCalendar]
  );
  const currentMonthWeeks = useMemo(
    () => groupIntoWeeks(generateCalendarDays),
    [generateCalendarDays]
  );
  const nextMonthWeeks = useMemo(
    () => groupIntoWeeks(nextMonthCalendar),
    [nextMonthCalendar]
  );

  // 날짜 선택 처리 함수
  const handleDateSelect = (date: Date) => {
    try {
      if (!isRange) {
        // 단일 날짜 선택
        setTempSelectedDate(date);
        // Redux 상태 업데이트 - 클론한 날짜 객체를 사용하여 참조가 변경되도록 함
        selectDate(new Date(date.getTime()));
        // onSelectDate(date); // 모달 닫기 제거
      } else {
        // 범위 선택 모드
        if (!tempRangeStart || (tempRangeStart && tempRangeEnd)) {
          // 시작일 설정
          setTempRangeStart(date);
          setTempRangeEnd(null);
          // Redux 상태 업데이트 - 클론한 날짜 객체 사용
          selectStartDate(new Date(date.getTime()));
          selectEndDate(null);
        } else {
          // 종료일 설정 (시작일보다 이전 날짜 선택 시 시작일과 종료일 교체)
          if (date < tempRangeStart) {
            setTempRangeEnd(tempRangeStart);
            setTempRangeStart(date);

            // Redux 상태 업데이트
            selectStartDate(new Date(date.getTime()));
            selectEndDate(new Date(tempRangeStart.getTime()));

            // 콜백 호출 (모달 닫기 제거)
            if (onSelectRange) {
              onSelectRange(date, tempRangeStart);
            }
          } else {
            setTempRangeEnd(date);

            // Redux 상태 업데이트
            selectEndDate(new Date(date.getTime()));

            // 콜백 호출 (모달 닫기 제거)
            if (onSelectRange && tempRangeStart) {
              onSelectRange(tempRangeStart, date);
            }
          }
        }
      }
    } catch (error) {
      console.error("날짜 선택 처리 오류:", error);
    }
  };

  // 선택 적용 핸들러
  const handleApplySelection = () => {
    if (isRange && tempRangeStart && tempRangeEnd) {
      // 범위 선택 확정 - 깊은 복사하여 참조 문제 방지
      const startDateClone = new Date(tempRangeStart.getTime());
      const endDateClone = new Date(tempRangeEnd.getTime());

      // Redux 상태 업데이트
      selectStartDate(startDateClone);
      selectEndDate(endDateClone);

      // 콜백 호출
      if (onSelectRange) {
        onSelectRange(startDateClone, endDateClone);
      }
    } else if (!isRange && tempSelectedDate) {
      // 단일 날짜 선택 확정
      const dateClone = new Date(tempSelectedDate.getTime());
      selectDate(dateClone);
      onSelectDate(dateClone);
    }

    // 모달 닫기
    onClose();
  };

  // 취소 버튼 핸들러: 선택 상태 초기화
  const handleCancel = () => {
    try {
      // 단일 선택 모드
      if (!isRange) {
        setTempSelectedDate(null);
      }
      // 범위 선택 모드
      else {
        setTempRangeStart(null);
        setTempRangeEnd(null);
      }

      // 전역 상태 초기화
      resetAllDates();

      // 선택된 월을 현재 월로 리셋 (옵션)
      setDisplayedMonth(new Date());
    } catch (error) {
      console.error("상태 초기화 오류:", error);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    onClose();
  };

  const renderCalendarDay = (day: CalendarDayItem, index: number) => {
    if (day.isEmpty) {
      return (
        <View
          key={`empty-${index}`}
          style={[
            styles.dayCell,
            styles.emptyDay,
            { width: dayCellWidth, height: dayCellWidth },
          ]}
        />
      );
    }

    return (
      <Pressable
        key={`day-${index}`}
        style={[
          styles.dayCell,
          day.isSelected && styles.selectedDay,
          day.isToday && styles.todayCell,
          day.isPeriod && styles.periodDay,
          day.isStartDate && styles.startDateCell,
          day.isEndDate && styles.endDateCell,
          { width: dayCellWidth, height: dayCellWidth },
        ]}
        onPress={() => day.date && handleDateSelect(day.date)}
      >
        <Text
          style={[
            styles.dayText,
            day.isSelected && styles.selectedDayText,
            day.isToday && styles.todayDayText,
            day.isPeriod && styles.periodDayText,
            (day.isStartDate || day.isEndDate) && styles.boundaryDayText,
          ]}
        >
          {day.date?.getDate()}
        </Text>

        {/* 오늘 날짜 'today' 표시 */}
        {day.isToday && <Text style={styles.todayText}>today</Text>}

        {/* 범위의 시작과 끝 표시 - 날짜 아래로 이동 */}
        {day.isStartDate && (
          <View style={styles.rangeIndicatorContainer}>
            <Text style={styles.rangeIndicatorText}>시작</Text>
          </View>
        )}

        {day.isEndDate && (
          <View style={styles.rangeIndicatorContainer}>
            <Text style={styles.rangeIndicatorText}>끝</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const handlePrevMonth = () => {
    try {
      const newDate = new Date(displayedMonth.getTime());
      newDate.setMonth(displayedMonth.getMonth() - 1);
      setDisplayedMonth(newDate);
    } catch (error) {
      console.error("이전 달 설정 오류:", error);
    }
  };

  const handleNextMonth = () => {
    try {
      const newDate = new Date(displayedMonth.getTime());
      newDate.setMonth(displayedMonth.getMonth() + 1);
      setDisplayedMonth(newDate);
    } catch (error) {
      console.error("다음 달 설정 오류:", error);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    try {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      return "날짜 오류";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable style={[styles.modalContent, { width: calendarWidth }]}>
            <View style={styles.header}>
              <Pressable style={styles.navButton} onPress={handlePrevMonth}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color="#000000"
                />
              </Pressable>

              <Text style={styles.monthText}>
                {`${displayedMonth.getFullYear()}년 ${
                  displayedMonth.getMonth() + 1
                }월`}
              </Text>

              <Pressable style={styles.navButton} onPress={handleNextMonth}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#000000"
                />
              </Pressable>
            </View>

            {/* X 버튼 (닫기) */}
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close" size={24} color="#000000" />
            </Pressable>

            {/* 선택된 범위 표시 */}
            {isRange && (
              <View style={styles.selectedRangeContainer}>
                <Text style={styles.selectedRangeText}>
                  {tempRangeStart
                    ? `${formatDate(tempRangeStart)} ~ ${
                        tempRangeEnd ? formatDate(tempRangeEnd) : "선택 중..."
                      }`
                    : "날짜 범위를 선택하세요"}
                </Text>
              </View>
            )}

            <View style={styles.calendarWrapper}>
              <PanGestureHandler
                onGestureEvent={(event) => {
                  if (!isAnimating) {
                    translateX.setValue(event.nativeEvent.translationX);
                  }
                }}
                onHandlerStateChange={(event) => {
                  if (event.nativeEvent.state === State.END) {
                    if (isAnimating) return;

                    try {
                      const threshold = dimensions.width * 0.15;
                      const distance = event.nativeEvent.translationX;

                      if (Math.abs(distance) > threshold) {
                        setIsAnimating(true);
                        const direction = distance > 0 ? 1 : -1;
                        // 깊은 복사를 사용하여 새 Date 객체 생성
                        const newDate = new Date(displayedMonth.getTime());
                        newDate.setMonth(displayedMonth.getMonth() - direction);

                        setDisplayedMonth(newDate);
                        translateX.setValue(0);
                        setIsAnimating(false);
                      } else {
                        Animated.spring(translateX, {
                          toValue: 0,
                          useNativeDriver: true,
                          friction: 10,
                          tension: 60,
                        }).start(() => {
                          setIsAnimating(false);
                        });
                      }
                    } catch (error) {
                      console.error("제스처 처리 오류:", error);
                      translateX.setValue(0);
                      setIsAnimating(false);
                    }
                  }
                }}
                enabled={true}
              >
                <View>
                  {/* 요일 헤더 - 고정 */}
                  <View
                    style={[
                      styles.calendarContainer,
                      {
                        width: "95%",
                        alignSelf: "center",
                        marginHorizontal: "auto",
                        paddingLeft: 15,
                      },
                    ]}
                  >
                    <View style={styles.weekRow}>
                      {["일", "월", "화", "수", "목", "금", "토"].map(
                        (day, index) => (
                          <View
                            key={day}
                            style={[
                              styles.dayCell,
                              {
                                width: dayCellWidth,
                                height: dayCellWidth * 0.6,
                              },
                            ]}
                          >
                            <Text style={styles.weekdayText}>{day}</Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>

                  {/* 캘린더 컨테이너 */}
                  <View style={styles.swipeCalendarWrapper}>
                    {/* 이전 달 캘린더 */}
                    <Animated.View
                      style={[
                        styles.swipeCalendarContainer,
                        {
                          transform: [
                            {
                              translateX: translateX.interpolate({
                                inputRange: [
                                  -dimensions.width,
                                  0,
                                  dimensions.width,
                                ],
                                outputRange: [
                                  -dimensions.width * 2,
                                  -dimensions.width,
                                  0,
                                ],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.calendarContainer,
                          {
                            width: "95%",
                            alignSelf: "center",
                            marginHorizontal: "auto",
                            paddingLeft: 15,
                          },
                        ]}
                      >
                        {/* 날짜 그리드 */}
                        {prevMonthWeeks.map((week, weekIndex) => (
                          <View
                            key={`prev-week-${weekIndex}`}
                            style={styles.weekRow}
                          >
                            {week.map((day, dayIndex) =>
                              renderCalendarDay(day, weekIndex * 7 + dayIndex)
                            )}
                          </View>
                        ))}
                      </View>
                    </Animated.View>

                    {/* 현재 달 캘린더 */}
                    <Animated.View
                      style={[
                        styles.swipeCalendarContainer,
                        {
                          transform: [{ translateX }],
                          zIndex: 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.calendarContainer,
                          {
                            width: "95%",
                            alignSelf: "center",
                            marginHorizontal: "auto",
                            paddingLeft: 15,
                          },
                        ]}
                      >
                        {/* 날짜 그리드 */}
                        {currentMonthWeeks.map((week, weekIndex) => (
                          <View
                            key={`current-week-${weekIndex}`}
                            style={styles.weekRow}
                          >
                            {week.map((day, dayIndex) =>
                              renderCalendarDay(day, weekIndex * 7 + dayIndex)
                            )}
                          </View>
                        ))}
                      </View>
                    </Animated.View>

                    {/* 다음 달 캘린더 */}
                    <Animated.View
                      style={[
                        styles.swipeCalendarContainer,
                        {
                          transform: [
                            {
                              translateX: translateX.interpolate({
                                inputRange: [
                                  -dimensions.width,
                                  0,
                                  dimensions.width,
                                ],
                                outputRange: [
                                  0,
                                  dimensions.width,
                                  dimensions.width * 2,
                                ],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.calendarContainer,
                          {
                            width: "95%",
                            alignSelf: "center",
                            marginHorizontal: "auto",
                            paddingLeft: 15,
                          },
                        ]}
                      >
                        {/* 날짜 그리드 */}
                        {nextMonthWeeks.map((week, weekIndex) => (
                          <View
                            key={`next-week-${weekIndex}`}
                            style={styles.weekRow}
                          >
                            {week.map((day, dayIndex) =>
                              renderCalendarDay(day, weekIndex * 7 + dayIndex)
                            )}
                          </View>
                        ))}
                      </View>
                    </Animated.View>
                  </View>
                </View>
              </PanGestureHandler>
            </View>

            <View style={[styles.footer]}>
              <Pressable style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>초기화</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.applyButton,
                  (!tempSelectedDate && !isRange) ||
                  (isRange && !tempRangeStart)
                    ? styles.applyButtonDisabled
                    : {},
                ]}
                onPress={handleApplySelection}
                disabled={
                  (!tempSelectedDate && !isRange) ||
                  (isRange && !tempRangeStart)
                }
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    (!tempSelectedDate && !isRange) ||
                    (isRange && !tempRangeStart)
                      ? styles.applyButtonTextDisabled
                      : {},
                  ]}
                >
                  적용
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: "90%",
    maxWidth: 400,
    ...theme.shadows.medium,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  navButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  monthText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  calendarWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  swipeCalendarWrapper: {
    position: "relative",
    height: 320,
    overflow: "hidden",
  },
  swipeCalendarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  calendarContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  weekdayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  weekdayText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  calendar: {
    flexDirection: "column",
    width: "100%",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
  dayCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
    position: "relative",
    backgroundColor: "transparent", // 기본 배경색은 투명으로 설정
  },
  dayText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  emptyDay: {
    backgroundColor: "transparent",
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1.1 }],
  },
  selectedDayText: {
    color: theme.colors.white,
  },
  todayCell: {
    backgroundColor: "#E1F5FE", // 연한 하늘색 배경
    borderWidth: 1.5,
    borderColor: "#2196F3", // 파란색 테두리
  },
  todayDayText: {
    color: "#2196F3", // 파란색 텍스트
    fontWeight: "700",
  },
  todayText: {
    fontSize: 8,
    color: "#2196F3", // 파란색으로 변경
    fontWeight: "700",
    position: "absolute",
    bottom: 2,
  },
  periodDay: {
    backgroundColor: `${theme.colors.primary}30`, // 범위 날짜 배경색 (투명도 30%)
  },
  periodDayText: {
    color: theme.colors.primary,
  },
  startDateCell: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  endDateCell: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  boundaryDayText: {
    color: "black",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: theme.spacing.lg,
    paddingTop: 10,
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  applyButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  applyButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  applyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  applyButtonTextDisabled: {
    color: "#888888",
  },
  selectedRangeContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  selectedRangeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: 5,
    zIndex: 10,
  },
  rangeIndicatorContainer: {
    position: "absolute",
    bottom: 2,
    right: 0,
    left: 0,
    alignItems: "center",
  },
  rangeIndicatorText: {
    fontSize: 9,
    color: theme.colors.white,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
});
