import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../utils/theme";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTransactionsStart, fetchTransactionsSuccess, fetchTransactionsFailure, setSelectedYear, setSelectedMonth } from "../../store/financeSlice";
import { CategorySummary, IconName, Transaction } from "../../types";
import { useMonthlyStat } from "../../hooks/useMonthlyStat";
import { useAccountDetail } from "../../hooks/useAccountDetail";
import { useMonthlyTransactions } from "../../hooks/useMonthlyTransactions";
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";

// 통화 포맷 함수
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, monthlyStat, selectedYear, selectedMonth } = useAppSelector(state => state.finance);
  const { activeView } = useAppSelector(state => state.partner);
  
  // 연도 선택을 위한 배열 생성 (최근 5년)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // 월 선택을 위한 배열 생성
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  // SelectBox 상태 관리
  const [showYearPicker, setShowYearPicker] = React.useState(false);
  const [showMonthPicker, setShowMonthPicker] = React.useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showWeeklyCharts, setShowWeeklyCharts] = useState(false);
  const [pieChartView, setPieChartView] = useState<'income' | 'expense'>('income');
  const [lineChartView, setLineChartView] = useState<'income' | 'expense'>('income');

  // 월별 통계 데이터 가져오기
  const { data: monthlyStatData, isLoading: isMonthlyStatLoading } = useMonthlyStat(selectedYear, selectedMonth);

  // 선택된 월의 거래 내역 가져오기
  const { data: accountDetailData, isLoading: isAccountDetailLoading } = useAccountDetail({
    year: selectedYear,
    month: selectedMonth,
    pageno: 1,
    size: 100, // 한 달의 거래 내역을 충분히 가져오기 위한 크기
    sort: 'DESC'
  });

  // 선택된 연도/월 변경 감지
  useEffect(() => {
    console.log('DashboardScreen - 선택된 연도/월 변경:', { selectedYear, selectedMonth });
  }, [selectedYear, selectedMonth]);

  // 데이터 로드
  useEffect(() => {
    dispatch(fetchTransactionsStart());
    
    try {
      if (accountDetailData?.content) {
      let filteredTransactions;
      if (activeView === 'you') {
          filteredTransactions = accountDetailData.content.filter(t => t.accountNo === 'user1');
      } else if (activeView === 'partner') {
          filteredTransactions = accountDetailData.content.filter(t => t.accountNo === 'user2');
      } else {
          filteredTransactions = accountDetailData.content;
        }
        
        // Transaction 타입으로 변환
        const convertedTransactions = filteredTransactions.map(t => ({
          id: t.transactionId,
          transactionid: t.transactionId,
          amount: t.amount,
          date: t.date,
          time: t.time,
          remittance: t.remittance,
          targetname: t.targetName,
          category: t.categoryName,
          accountNo: t.accountNo
        }));
        
        dispatch(fetchTransactionsSuccess(convertedTransactions));
      }
    } catch (error) {
      dispatch(fetchTransactionsFailure('데이터 로드 중 오류가 발생했습니다.'));
    }
  }, [activeView, dispatch, accountDetailData]);
  

  // 데이터 계산을 memoize
  const summaryData = useMemo(() => {
    // 1. 총 지출/수입 계산 (API 데이터 우선 사용)
    const totalSpent = monthlyStat?.monthStat?.reduce(
      (total, stat) => total + stat.consumeSum, 
      0
    ) || transactions.reduce(
      (total, transaction) => 
        transaction.remittance ? total + transaction.amount : total, 
      0
    );

    const totalEarned = monthlyStat?.monthStat?.reduce(
      (total, stat) => total + stat.earnSum, 
      0
    ) || transactions.reduce(
      (total, transaction) => 
        !transaction.remittance ? total + transaction.amount : total, 
      0
    );

    // 2. 일일 평균 계산 (해당 월의 실제 일수 사용)
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthlyAverage = totalEarned || totalSpent ? Math.round((totalEarned - totalSpent) / daysInMonth) : 0;

    // 3. 카테고리별 지출 계산 (API 데이터 사용)
    const categories: CategorySummary[] = monthlyStat?.monthStat?.map(stat => {
      console.log('카테고리 데이터:', stat);

        // 카테고리에 따른 아이콘 지정
        let icon: IconName = "cash";
      if (stat.categoryName === "식비") icon = "food";
      else if (stat.categoryName === "카페") icon = "coffee";
      else if (stat.categoryName === "마트/편의점") icon = "store";
      else if (stat.categoryName === "문화/여가") icon = "ticket";
      else if (stat.categoryName === "현금인출") icon = "bank";

      return { 
        name: stat.categoryName, 
        amount: stat.consumeSum || 0,  // 지출액 표시
        percentage: stat.percentage || 0,
        icon 
      };
    })?.sort((a, b) => b.amount - a.amount) || [];

    console.log('가공된 카테고리 데이터:', categories);

    // 4. 주간 통계 데이터 처리
    const weekStats = monthlyStat?.weekStat || Array.from({ length: 4 }, (_, index) => ({
      week: index + 1,
      totalConsumeSum: 0,
      totalEarnSum: 0
    }));

    console.log('주간 통계 데이터:', weekStats);

    // 5. 최근 거래 데이터 처리
    // const currentMonthTransactions = transactions
    //   .filter(transaction => {
    //     const transactionDate = new Date(transaction.date);
    //     return transactionDate.getMonth() + 1 === selectedMonth && 
    //            transactionDate.getFullYear() === selectedYear;
    //   })
    //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // console.log('최근 거래 데이터:', currentMonthTransactions);

    // // 날짜별로 그룹화
    // const groupedTransactions = currentMonthTransactions.reduce((acc, transaction) => {
    //   const date = transaction.date;
    //   if (!acc[date]) {
    //     acc[date] = [];
    //   }
    //   acc[date].push(transaction);
    //   return acc;
    // }, {} as Record<string, Transaction[]>);
    // console.log('날짜별 그룹화 데이터:', groupedTransactions);

    // // 날짜별로 정렬된 배열로 변환
    // const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    //   new Date(b).getTime() - new Date(a).getTime()
    // );
    // console.log('정렬된 날짜:', sortedDates);

    return {
      totalSpent,
      totalEarned,
      monthlyAverage,
      categories,
      weekStats,
      groupedTransactions,
      // sortedDates
    };
  }, [transactions, monthlyStat, selectedYear, selectedMonth]);

  // 지출이 있는 카테고리만 필터링
  const spendingCategories = useMemo(() => {
    return summaryData.categories.filter(category => category.amount > 0);
  }, [summaryData.categories]);

  const { data: monthlyTransactions, isLoading: isMonthlyTransactionsLoading } = useMonthlyTransactions(
    selectedYear,
    selectedMonth
  );

  const groupedTransactions = useMemo(() => {
    if (!monthlyTransactions) return [];
    
    const groups = monthlyTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, typeof monthlyTransactions>);

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, transactions]) => ({
        date,
        transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));
  }, [monthlyTransactions]);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!summaryData.weekStats || summaryData.weekStats.length === 0) {
      return {
        pieData: [],
        lineData: {
          labels: [],
          datasets: []
        },
        areaData: {
          labels: [],
          datasets: []
        },
        barData: {
          labels: [],
          datasets: []
        }
      };
    }

    // 1. 파이 차트 데이터 (수입과 지출 비율)
    const totalEarn = summaryData.weekStats.reduce((sum, stat) => sum + stat.totalEarnSum, 0);
    const totalConsume = summaryData.weekStats.reduce((sum, stat) => sum + stat.totalConsumeSum, 0);
    
    const pieData = [
      {
        name: "수입",
        population: totalEarn,
        color: theme.colors.success,
        legendFontColor: theme.colors.text,
        legendFontSize: 12
      },
      {
        name: "지출",
        population: totalConsume,
        color: theme.colors.error,
        legendFontColor: theme.colors.text,
        legendFontSize: 12
      }
    ];

    // 2. 라인 차트 데이터 (수입과 지출 추이)
    const lineData = {
      labels: summaryData.weekStats.map(stat => `${stat.week + 1}주차`),
      datasets: [
        {
          data: summaryData.weekStats.map(stat => stat.totalEarnSum / 10000), // 만원 단위로 변환
          color: (opacity = 1) => theme.colors.success,
          strokeWidth: 2
        },
        {
          data: summaryData.weekStats.map(stat => stat.totalConsumeSum / 10000), // 만원 단위로 변환
          color: (opacity = 1) => theme.colors.error,
          strokeWidth: 2
        }
      ],
      legend: ["수입", "지출"]
    };

    // 3. 스택 영역 차트 데이터 (수입 누적)
    const areaData = {
      labels: summaryData.weekStats.map(stat => `${stat.week + 1}주차`),
      datasets: [
        {
          // 누적 데이터 계산: 각 주차까지의 totalEarnSum 합산
          data: summaryData.weekStats.map((stat, index) => {
            // 현재 주차까지의 모든 수입 합산 (누적)
            const cumulativeSum = summaryData.weekStats
              .slice(0, index + 1)
              .reduce((sum, weekStat) => sum + weekStat.totalEarnSum, 0) / 10000; // 만원 단위로 변환
            return cumulativeSum;
          }),
          color: (opacity = 1) => `rgba(76, 175, 80, 1)`, // 투명도 없이 항상 선명한 색상
          strokeWidth: 2
        }
      ],
      legend: ["누적 수입"]
    };

    // 4. 바 차트 데이터 (주차별 수입과 지출)
    const barData = {
      labels: summaryData.weekStats.map(stat => `${stat.week + 1}주차`),
      datasets: [
        {
          data: summaryData.weekStats.map(stat => stat.totalEarnSum / 10000), // 만원 단위로 변환
          color: (opacity = 1) => theme.colors.success,
        },
        {
          data: summaryData.weekStats.map(stat => stat.totalConsumeSum / 10000), // 만원 단위로 변환
          color: (opacity = 1) => theme.colors.error,
        }
      ],
      legend: ["수입", "지출"]
    };

    return {
      pieData,
      lineData,
      areaData,
      barData
    };
  }, [summaryData.weekStats]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 연월 선택 영역 */}
      <View style={styles.dateSelectorContainer}>
        <View style={styles.dateSelectorWrapper}>
          {/* 연도 선택 */}
          <View style={styles.selectorBox}>
            <Pressable
              style={styles.dateSelector}
              onPress={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false); // 다른 피커는 닫기
              }}
            >
              <Text style={styles.dateSelectorText}>{selectedYear}년</Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.text} />
            </Pressable>
            {showYearPicker && (
              <View style={[styles.pickerScrollContainer, styles.yearPickerContainer]}>
                <ScrollView nestedScrollEnabled={true}>
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerItem,
                        year === selectedYear && styles.pickerItemSelected
                      ]}
                      onPress={() => {
                        dispatch(setSelectedYear(year));
                        setShowYearPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        year === selectedYear && styles.pickerItemTextSelected
                      ]}>
                        {year}년
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* 월 선택 */}
          <View style={styles.selectorBox}>
            <Pressable
              style={styles.dateSelector}
              onPress={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false); // 다른 피커는 닫기
              }}
            >
              <Text style={styles.dateSelectorText}>{selectedMonth}월</Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.colors.text} />
            </Pressable>
            {showMonthPicker && (
              <View style={[styles.pickerScrollContainer, styles.monthPickerContainer]}>
                 <ScrollView nestedScrollEnabled={true}>
                  {months.map((month) => (
                    <Pressable
                      key={month}
                      style={[
                        styles.pickerItem,
                        month === selectedMonth && styles.pickerItemSelected
                      ]}
                      onPress={() => {
                        dispatch(setSelectedMonth(month));
                        setShowMonthPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        month === selectedMonth && styles.pickerItemTextSelected
                      ]}>
                        {month}월
                      </Text>
                    </Pressable>
                  ))}
                 </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>재정 요약</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewColumn}>
            <Text style={styles.overviewLabel}>총 지출</Text>
            <Text style={[styles.amount, { color: theme.colors.error }]}>
              {formatCurrency(summaryData.totalSpent)}
            </Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewColumn}>
            <Text style={styles.overviewLabel}>총 수입</Text>
            <Text style={[styles.amount, { color: theme.colors.success }]}>
              {formatCurrency(summaryData.totalEarned)}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          일일 평균: {formatCurrency(summaryData.monthlyAverage)}
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>주요 카테고리 지출 내역</Text>
        {spendingCategories.length > 4 && (
          <Pressable
            style={styles.moreButton}
            onPress={() => setShowAllCategories(!showAllCategories)}
          >
            <MaterialCommunityIcons
              name={showAllCategories ? "chevron-up" : "chevron-down"}
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        )}
      </View>
      {spendingCategories.length > 0 ? (
        <View style={styles.categoriesContainer}>
          {(showAllCategories ? spendingCategories : spendingCategories.slice(0, 4)).map((category) => (
            <View key={category.name} style={styles.categoryCard}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>
                {formatCurrency(category.amount)}
              </Text>
              <Text style={styles.categoryPercentage}>
                {category.percentage}%
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>이번 달 지출 내역이 없습니다.</Text>
        </View>
      )}

      {/* 주간 통계 섹션 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>주간 통계</Text>
        {/* 모든 주차의 수입과 지출이 0인 경우 moreButton 숨김 */}
        {summaryData.weekStats && 
          summaryData.weekStats.length > 0 && 
          summaryData.weekStats.some(stat => stat.totalConsumeSum > 0 || stat.totalEarnSum > 0) && (
          <Pressable 
            style={styles.moreButton} 
            onPress={() => setShowWeeklyCharts(!showWeeklyCharts)}
          >
            <MaterialCommunityIcons
              name={showWeeklyCharts ? "chevron-up" : "chevron-down"}
              size={24}
              color={theme.colors.primary}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.weeklyStatsContainer}>
        {/* 모든 주차의 수입과 지출이 0인지 확인 */}
        {!summaryData.weekStats || 
         summaryData.weekStats.length === 0 || 
         !summaryData.weekStats.some(stat => stat.totalConsumeSum > 0 || stat.totalEarnSum > 0) ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>이번 달 거래 내역이 없습니다.</Text>
          </View>
        ) : !showWeeklyCharts ? (
          <View style={styles.weeklyStatsContent}>
            {summaryData.weekStats.map((weekStat) => (
              <View key={weekStat.week} style={styles.weeklyStatItem}>
                <Text style={styles.weekText}>{weekStat.week + 1}주차</Text>
                <View style={styles.weeklyAmounts}>
                  <Text style={[styles.amountText, styles.expenseText]}>
                    {formatCurrency(weekStat.totalConsumeSum)}
                  </Text>
                  <Text style={[styles.amountText, styles.incomeText]}>
                    {formatCurrency(weekStat.totalEarnSum)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.chartsContainer}>
            {/* 1. 파이 차트 - 수입과 지출 비율 */}
            <View style={styles.chartRow}>
              <View style={styles.pieChartContainer}>
                <Text style={styles.chartTitle}>수입/지출 비율</Text>
                <View style={styles.pieChartNavigation}>
                  <Pressable 
                    style={styles.pieChartNavButton} 
                    onPress={() => setPieChartView('income')}
                  >
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={24}
                      color={pieChartView === 'income' ? theme.colors.primary : theme.colors.textLight}
                    />
                    <Text style={[
                      styles.pieChartNavText,
                      pieChartView === 'income' && styles.pieChartNavTextActive
                    ]}>수입</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.pieChartNavButton} 
                    onPress={() => setPieChartView('expense')}
                  >
                    <Text style={[
                      styles.pieChartNavText,
                      pieChartView === 'expense' && styles.pieChartNavTextActive
                    ]}>지출</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={pieChartView === 'expense' ? theme.colors.primary : theme.colors.textLight}
                    />
                  </Pressable>
                </View>
                <View style={styles.pieChartsContainer}>
                  {pieChartView === 'income' ? (
                    <View style={styles.pieChartWrapper}>
                      <Text style={styles.pieChartSubtitle}>수입</Text>
                      {chartData.pieData.length > 0 ? (
                        summaryData.weekStats.some(stat => stat.totalEarnSum > 0) ? (
                          <PieChart
                            data={summaryData.weekStats.map((stat, index) => {
                              // 전체 수입 합계 계산
                              const totalEarn = summaryData.weekStats.reduce((sum, s) => sum + s.totalEarnSum, 0);
                              // 각 주차의 비율 계산 (소수점 첫째자리까지)
                              const percentage = totalEarn > 0 ? Math.round((stat.totalEarnSum / totalEarn) * 1000) / 10 : 0;
                              
                              return {
                                name: `${stat.week + 1}주차 (${percentage}%)`,
                                population: stat.totalEarnSum,
                                color: `hsl(${120 + index * 30}, 70%, 50%)`,
                                legendFontColor: theme.colors.text,
                                legendFontSize: 8
                              };
                            })}
                            width={Dimensions.get("window").width - theme.spacing.md * 2}
                            height={160}
                            chartConfig={{
                              backgroundColor: theme.colors.white,
                              backgroundGradientFrom: theme.colors.white,
                              backgroundGradientTo: theme.colors.white,
                              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="0"
                            absolute
                            hasLegend={true}
                            center={[0, 0]}
                            avoidFalseZero={true}
                          />
                        ) : (
                          <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>수입 없음</Text>
                          </View>
                        )
                      ) : (
                        <View style={styles.noDataContainer}>
                          <Text style={styles.noDataText}>데이터가 없습니다</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.pieChartWrapper}>
                      <Text style={styles.pieChartSubtitle}>지출</Text>
                      {chartData.pieData.length > 0 ? (
                        summaryData.weekStats.some(stat => stat.totalConsumeSum > 0) ? (
                          <PieChart
                            data={summaryData.weekStats.map((stat, index) => {
                              // 전체 지출 합계 계산
                              const totalConsume = summaryData.weekStats.reduce((sum, s) => sum + s.totalConsumeSum, 0);
                              // 각 주차의 비율 계산 (소수점 첫째자리까지)
                              const percentage = totalConsume > 0 ? Math.round((stat.totalConsumeSum / totalConsume) * 1000) / 10 : 0;
                              
                              return {
                                name: `${stat.week + 1}주차 (${percentage}%)`,
                                population: stat.totalConsumeSum,
                                color: `hsl(${0 + index * 30}, 70%, 50%)`,
                                legendFontColor: theme.colors.text,
                                legendFontSize: 8
                              };
                            })}
                            width={Dimensions.get("window").width - theme.spacing.md * 2}
                            height={160}
                            chartConfig={{
                              backgroundColor: theme.colors.white,
                              backgroundGradientFrom: theme.colors.white,
                              backgroundGradientTo: theme.colors.white,
                              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="0"
                            absolute
                            hasLegend={true}
                            center={[0, 0]}
                            avoidFalseZero={true}
                          />
                        ) : (
                          <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>지출 없음</Text>
                          </View>
                        )
                      ) : (
                        <View style={styles.noDataContainer}>
                          <Text style={styles.noDataText}>데이터가 없습니다</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* 2. 라인 차트 - 수입과 지출 추이 */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>수입과 지출 추이</Text>
              <View style={styles.chartSubtitle}>
                <Text style={styles.chartUnitText}>(단위: 만원)</Text>
              </View>
              <View style={styles.pieChartNavigation}>
                <Pressable 
                  style={styles.pieChartNavButton} 
                  onPress={() => setLineChartView('income')}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={24}
                    color={lineChartView === 'income' ? theme.colors.primary : theme.colors.textLight}
                  />
                  <Text style={[
                    styles.pieChartNavText,
                    lineChartView === 'income' && styles.pieChartNavTextActive
                  ]}>수입</Text>
                </Pressable>
                <Pressable 
                  style={styles.pieChartNavButton} 
                  onPress={() => setLineChartView('expense')}
                >
                  <Text style={[
                    styles.pieChartNavText,
                    lineChartView === 'expense' && styles.pieChartNavTextActive
                  ]}>지출</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={lineChartView === 'expense' ? theme.colors.primary : theme.colors.textLight}
                  />
                </Pressable>
              </View>
              {chartData.lineData.labels.length > 0 ? (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={{
                      labels: chartData.lineData.labels,
                      datasets: [
                        {
                          data: lineChartView === 'income' 
                            ? chartData.lineData.datasets[0].data
                            : chartData.lineData.datasets[1].data,
                          color: (opacity = 1) => lineChartView === 'income' 
                            ? theme.colors.success
                            : theme.colors.error,
                          strokeWidth: 2
                        }
                      ],
                      legend: [lineChartView === 'income' ? "수입" : "지출"]
                    }}
                    width={Dimensions.get("window").width - theme.spacing.md * 4}
                    height={200}
                    chartConfig={{
                      backgroundColor: theme.colors.white,
                      backgroundGradientFrom: theme.colors.white,
                      backgroundGradientTo: theme.colors.white,
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: lineChartView === 'income' ? theme.colors.success : theme.colors.error
                      },
                      formatYLabel: (value) => `${value}`,
                      // Y축은 자동으로 데이터의 최대값을 기준으로 5등분됩니다
                      formatTopBarValue: () => "",
                      useShadowColorFromDataset: false
                    }}
                    bezier={false}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                      alignSelf: 'center'
                    }}
                    yAxisLabel=""
                    yAxisSuffix=""
                    yAxisInterval={1}
                    segments={5}
                    fromZero={true}
                    withVerticalLines={true}
                    withHorizontalLines={true}
                    withInnerLines={true}
                    withOuterLines={true}
                    withDots={true}
                    withShadow={false}
                    getDotColor={(dataPoint, dataPointIndex) => 
                      lineChartView === 'income' ? theme.colors.success : theme.colors.error
                    }
                    renderDotContent={({x, y, index, indexData}) => null}
                    onDataPointClick={({value, index, x, y}) => {
                      // 데이터 포인트 클릭 시 정확한 값을 표시하는 툴팁 표시
                      Alert.alert(
                        `${chartData.lineData.labels[index]}`,
                        `${lineChartView === 'income' ? '수입' : '지출'}: ${formatCurrency(value * 10000)}`
                      );
                    }}
                  />
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>데이터가 없습니다</Text>
                </View>
              )}
            </View>

            {/* 3. 스택 영역 차트 - 수입 누적 */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>수입 누적</Text>
              <View style={styles.chartSubtitle}>
                <Text style={styles.chartUnitText}>(단위: 만원)</Text>
              </View>
              {chartData.areaData.labels.length > 0 ? (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={chartData.areaData}
                    width={Dimensions.get("window").width - theme.spacing.md * 4}
                    height={200}
                    chartConfig={{
                      backgroundColor: theme.colors.white,
                      backgroundGradientFrom: theme.colors.white,
                      backgroundGradientTo: theme.colors.white,
                      decimalPlaces: 1,
                      // 그래프 선의 색상을 투명도 없이 설정
                      color: (opacity = 1) => `rgba(76, 175, 80, 1)`,
                      // 그래프 아래 영역 색상 설정
                      fillShadowGradient: `rgba(76, 175, 80, 1)`,
                      fillShadowGradientOpacity: 0.2,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: theme.colors.success
                      },
                      formatYLabel: (value) => `${value}`,
                      formatTopBarValue: () => "",
                      useShadowColorFromDataset: false,
                    }}
                    bezier={false}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                      alignSelf: 'center'
                    }}
                    yAxisLabel=""
                    yAxisSuffix=""
                    yAxisInterval={1}
                    segments={5}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    withInnerLines={true}
                    withOuterLines={true}
                    withDots={true}
                    withShadow={false}
                    fromZero={true}
                    withScrollableDot={false}
                    getDotColor={(dataPoint, dataPointIndex) => theme.colors.success}
                    renderDotContent={({x, y, index, indexData}) => null}
                    // LineChart 영역 채우기 활성화
                    withVerticalLines={false}
                    // 아래 영역 채우기 활성화
                    hidePointsAtIndex={[]}
                    // 데이터 포인트 클릭 이벤트
                    onDataPointClick={({value, index, x, y}) => {
                      // 누적 값과 현재 주차 값을 계산
                      const currentWeekValue = index === 0 
                        ? summaryData.weekStats[0].totalEarnSum 
                        : summaryData.weekStats[index].totalEarnSum;
                      
                      Alert.alert(
                        `${chartData.areaData.labels[index]}`,
                        `이번 주 수입: ${formatCurrency(currentWeekValue)}\n누적 수입: ${formatCurrency(value * 10000)}`
                      );
                    }}
                  />
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>데이터가 없습니다</Text>
                </View>
              )}
            </View>

            {/* 4. 바 차트 - 주차별 수입과 지출 */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>주차별 수입과 지출</Text>
              <View style={styles.chartSubtitle}>
                <Text style={styles.chartUnitText}>(단위: 만원)</Text>
              </View>
              {chartData.barData.labels.length > 0 ? (
                <View style={styles.weeklyBarChartContainer}>
                  {summaryData.weekStats.map((weekStat, index) => (
                    <View key={index} style={styles.weeklyBarCard}>
                      <Text style={styles.weeklyBarCardTitle}>{weekStat.week + 1}주차</Text>
                      <View style={styles.weeklyBarChartWrapper}>
                        <BarChart
                          data={{
                            labels: ['수입', '지출'],
                            datasets: [
                              {
                                data: [
                                  weekStat.totalEarnSum / 10000, 
                                  weekStat.totalConsumeSum / 10000
                                ],
                                colors: [
                                  (opacity = 1) => theme.colors.success,
                                  (opacity = 1) => theme.colors.error
                                ]
                              }
                            ]
                          }}
                          width={140}
                          height={180}
                          chartConfig={{
                            backgroundColor: theme.colors.white,
                            backgroundGradientFrom: theme.colors.white,
                            backgroundGradientTo: theme.colors.white,
                            decimalPlaces: 1,
                            color: (opacity = 1, index) => {
                              return `rgba(150, 150, 150, ${opacity})`;
                            },
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                              borderRadius: 16
                            },
                            barPercentage: 0.6,
                            formatYLabel: (value) => `${value}`,
                            formatTopBarValue: (value) => value.toFixed(1),
                          }}
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                            alignSelf: 'center'
                          }}
                          fromZero={true}
                          showValuesOnTopOfBars={true}
                          withInnerLines={false}
                          segments={3}
                          yAxisLabel=""
                          yAxisSuffix=""
                        />
                      </View>
                      <View style={styles.weeklyBarCardInfo}>
                        <View style={styles.weeklyBarInfoItem}>
                          <Text style={styles.infoLabel}>수입</Text>
                          <Text style={styles.infoAmount}>{formatCurrency(weekStat.totalEarnSum)}</Text>
                        </View>
                        <View style={styles.weeklyBarInfoItem}>
                          <Text style={styles.infoLabel}>지출</Text>
                          <Text style={styles.infoAmount}>{formatCurrency(weekStat.totalConsumeSum)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>데이터가 없습니다</Text>
                </View>
              )}
            </View>

            {/* 흑자/적자 표시 */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>월간 흑자/적자 현황</Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.profitLossScrollContainer}>
                <View style={styles.profitLossContainer}>
                  {summaryData.weekStats.map((weekStat, index) => {
                    const profit = weekStat.totalEarnSum - weekStat.totalConsumeSum;
                    const isProfit = profit >= 0;
                    
                    return (
                      <View key={index} style={styles.profitLossItem}>
                        <Text style={styles.weekLabel}>{weekStat.week + 1}주차</Text>
                        <View style={[styles.profitLossIndicator, isProfit ? styles.profitIndicator : styles.lossIndicator]}>
                          <Text style={styles.profitLossText}>
                            {isProfit ? "흑자" : "적자"}
                          </Text>
                          <Text style={styles.profitLossAmount}>
                            {formatCurrency(Math.abs(profit))}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 76,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  overviewCard: {
    margin: theme.spacing.md,
    // marginTop: 76,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  overviewTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overviewColumn: {
    flex: 1,
    alignItems: "center",
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  overviewLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  },
  moreButton: {
    padding: theme.spacing.sm,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
    // marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  categoryCard: {
    width: "48.5%",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  categoryPercentage: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  dateSelectorContainer: {
    marginTop: 76,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    position: 'relative',
    zIndex: 10,
  },
  dateSelectorWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  selectorBox: {
    position: 'relative',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
    minWidth: 100,
    justifyContent: 'center',
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  pickerScrollContainer: {
    position: 'absolute',
    top: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
    ...theme.shadows.medium,
    zIndex: 1000,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  yearPickerContainer: {
    left: 0,
    right: undefined,
    width: 120,
  },
  monthPickerContainer: {
    right: 0,
    left: undefined,
    width: 120,
  },
  pickerItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.primary + '1A',
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  weeklyStatsContainer: {
    margin: theme.spacing.md,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  weeklyStatsContent: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  weeklyStatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  weeklyAmounts: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "500",
  },
  expenseText: {
    color: theme.colors.error,
  },
  incomeText: {
    color: theme.colors.success,
  },
  chartsContainer: {
    gap: theme.spacing.md,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  pieChartContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.medium,
    width: '100%',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  noDataContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  profitLossScrollContainer: {
    flexGrow: 0,
  },
  profitLossContainer: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  profitLossItem: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    minWidth: 70,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profitLossIndicator: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    minWidth: 60,
  },
  profitIndicator: {
    backgroundColor: theme.colors.success + '20',
  },
  lossIndicator: {
    backgroundColor: theme.colors.error + '20',
  },
  profitLossText: {
    fontSize: 12,
    fontWeight: "600",
  },
  profitLossAmount: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  pieChartsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  pieChartWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  pieChartSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  pieChartNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  pieChartNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  pieChartNavText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textLight,
    marginHorizontal: theme.spacing.xs,
  },
  pieChartNavTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  chartSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  chartUnitText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
    marginLeft: -theme.spacing.md,
  },
  weeklyBarChartContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  weeklyBarCard: {
    width: "47%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
    marginBottom: theme.spacing.md,
  },
  weeklyBarCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  weeklyBarChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  weeklyBarCardInfo: {
    marginTop: theme.spacing.sm,
  },
  weeklyBarInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    flex: 1,
  },
  infoAmount: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.text,
  },
});