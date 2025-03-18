import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  Modal 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  isRange?: boolean;
  onSelectRange?: (startDate: Date, endDate: Date) => void;
}

export default function DatePicker({ 
  visible, 
  onClose, 
  onSelectDate,
  selectedDate,
  isRange,
  onSelectRange
}: DatePickerProps) {
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const days = [];
    const totalDays = getDaysInMonth(displayedMonth);
    const firstDay = getFirstDayOfMonth(displayedMonth);
    
    // Add empty days
    for (let i = 0; i < firstDay; i++) {
      days.push({ isEmpty: true, index: i });
    }
    
    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), i);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      // Range selection logic
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      
      if (isRange && rangeStart && rangeEnd) {
        isInRange = date >= rangeStart && date <= rangeEnd;
        isRangeStart = date.toDateString() === rangeStart.toDateString();
        isRangeEnd = date.toDateString() === rangeEnd.toDateString();
      }
      
      days.push({
        date,
        isToday,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
      });
    }
    
    return days;
  };  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [tempRangeStart, setTempRangeStart] = useState<Date | null>(null);
  const [tempRangeEnd, setTempRangeEnd] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    if (!isRange) {
      setTempSelectedDate(date);
      return;
    }

    if (!tempRangeStart || (tempRangeStart && tempRangeEnd)) {
      setTempRangeStart(date);
      setTempRangeEnd(null);
    } else {
      if (date < tempRangeStart) {
        setTempRangeEnd(tempRangeStart);
        setTempRangeStart(date);
      } else {
        setTempRangeEnd(date);
      }
    }
  };

  const handleApply = () => {
    if (!isRange && tempSelectedDate) {
      onSelectDate(tempSelectedDate);
      onClose();
    } else if (isRange && tempRangeStart && tempRangeEnd && onSelectRange) {
      onSelectRange(tempRangeStart, tempRangeEnd);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                const newDate = new Date(displayedMonth);
                newDate.setMonth(displayedMonth.getMonth() - 1);
                setDisplayedMonth(newDate);
              }}
            >
              <MaterialCommunityIcons 
                name="chevron-left" 
                size={24} 
                color={theme.colors.text} 
              />
            </Pressable>
            
            <Text style={styles.monthText}>
              {displayedMonth.toLocaleDateString('ko-KR', { 
                year: 'numeric',
                month: 'long'
              })}
            </Text>
            
            <Pressable
              onPress={() => {
                const newDate = new Date(displayedMonth);
                newDate.setMonth(displayedMonth.getMonth() + 1);
                setDisplayedMonth(newDate);
              }}
            >
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.text} 
              />
            </Pressable>
          </View>

          <View style={styles.weekdayHeader}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendar}>
            {generateCalendarDays().map((day, index) => (  <Pressable
    key={day.isEmpty ? `empty-${index}` : day.date?.toISOString()}
    style={[
      styles.dayCell,
      day.isEmpty && styles.emptyDay,
      day.isSelected && styles.selectedDay,
      day.isToday && styles.todayCell,
      day.isInRange && styles.rangeDay,
      day.isRangeStart && styles.rangeStartDay,
      day.isRangeEnd && styles.rangeEndDay,
    ]}
    onPress={() => day.date && handleDateSelect(day.date)}
    onHoverIn={() => {
      if (day.date) {
        event.currentTarget.style.backgroundColor = `${theme.colors.primary}10`;
        event.currentTarget.style.transform = 'scale(1.1)';
      }
    }}
    onHoverOut={() => {
      if (day.date && !day.isSelected) {
        event.currentTarget.style.backgroundColor = 'transparent';
        event.currentTarget.style.transform = 'scale(1)';
      }
    }}
  >
                {!day.isEmpty && (
                  <Text style={[
                    styles.dayText,
                    (day.isSelected || day.isInRange) && styles.selectedDayText,
                    day.isToday && styles.todayText
                  ]}>
                    {day.date?.getDate()}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>          <View style={styles.footer}>
            <Pressable 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable 
              style={[
                styles.applyButton,
                (!tempSelectedDate && !tempRangeEnd) && styles.disabledButton
              ]}
              onPress={handleApply}
              disabled={!tempSelectedDate && !tempRangeEnd}
            >
              <Text style={[
                styles.applyButtonText,
                (!tempSelectedDate && !tempRangeEnd) && styles.disabledButtonText
              ]}>
                적용하기
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },  dayCell: {
    width: '13.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    margin: 1,
    position: 'relative',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedDay: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderRadius: theme.borderRadius.sm,
    transform: [{ scale: 1.05 }],
  },
  selectedDayText: {
    fontWeight: '700',
  },  todayCell: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}10`,
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },  rangeDay: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: `${theme.colors.primary}30`,
    borderWidth: 1,
  },  rangeStartDay: {
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.sm,
    borderBottomLeftRadius: theme.borderRadius.sm,
    transform: [{ scale: 1.1 }],
  },  rangeEndDay: {
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopRightRadius: theme.borderRadius.sm,
    borderBottomRightRadius: theme.borderRadius.sm,
    transform: [{ scale: 1.1 }],
  },  footer: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  cancelButton: {
    padding: theme.spacing.sm,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: theme.colors.textLight,
  },
});