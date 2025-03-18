import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  useWindowDimensions,
  PanResponder
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { Transaction } from '../utils/dummyData';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const DailySummary = React.memo(({ selectedDate, transactions }) => {
  const total = transactions.reduce((acc, curr) => {
    return curr.remittance ? acc - curr.amount : acc + curr.amount;
  }, 0);
  
  return (
    <View style={styles.dailySummaryContainer}>
      <Text style={styles.dailySummaryDate}>
        {selectedDate.toLocaleDateString('ko-KR', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })}
      </Text>
      <View style={styles.dailySummaryAmounts}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>수입</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
            {formatCurrency(transactions.reduce((acc, curr) => !curr.remittance ? acc + curr.amount : acc, 0))}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>지출</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
            {formatCurrency(transactions.reduce((acc, curr) => curr.remittance ? acc + curr.amount : acc, 0))}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>합계</Text>
          <Text style={[styles.summaryAmount, { color: total >= 0 ? theme.colors.success : theme.colors.error }]}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const FABComponent = React.memo(({ navigation, showFabMenu, toggleFabMenu, fabAnimation, menuAnimation, position, setPosition }) => {
  const pan = useRef(new Animated.ValueXY(position)).current;
  const { width, height } = useWindowDimensions();
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const newX = pan.x._value;
        const newY = pan.y._value;

        // Calculate bounds
        const maxX = width - 80;
        const maxY = height - 200;
        const minX = 0;
        const minY = 0;

        // Check if FAB is dragged too far
        const isOffScreenX = newX < minX || newX > maxX;
        const isOffScreenY = newY < minY || newY > maxY;

        let finalX = newX;
        let finalY = newY;

        // If off screen, snap to nearest edge
        if (isOffScreenX) {
          finalX = newX < minX ? minX : maxX;
        }
        if (isOffScreenY) {
          finalY = newY < minY ? minY : maxY;
        }

        // Snap to edges if close
        const snapThreshold = 40;
        if (Math.abs(newX - maxX) < snapThreshold) finalX = maxX;
        if (Math.abs(newX - minX) < snapThreshold) finalX = minX;
        if (Math.abs(newY - maxY) < snapThreshold) finalY = maxY;
        if (Math.abs(newY - minY) < snapThreshold) finalY = minY;

        const finalPosition = { x: finalX, y: finalY };

        Animated.spring(pan, {
          toValue: finalPosition,
          useNativeDriver: false,
          friction: 7,
          tension: 40
        }).start(() => {
          setPosition(finalPosition);
        });
      }
    })
  ).current;

  return (
    <Animated.View 
      style={[
        styles.fabContainer,
        {
          transform: pan.getTranslateTransform(),
          zIndex: 1000,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View 
        style={[
          styles.fabMenu,
          {
            opacity: menuAnimation,
            transform: [
              { scale: menuAnimation },
              {
                translateY: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
            ]
          }
        ]}
      >
        <Pressable 
          style={styles.fabMenuItem}
          onPress={() => {
            toggleFabMenu();
            navigation.navigate('StorySettings');
          }}
        >
          <MaterialCommunityIcons 
            name="book-open-variant" 
            size={20} 
            color={theme.colors.white} 
          />
          <Text style={styles.fabMenuText}>Create Story</Text>
        </Pressable>
        
        <Pressable 
          style={styles.fabMenuItem}
          onPress={() => {
            toggleFabMenu();
            navigation.navigate('Diary');
          }}
        >
          <MaterialCommunityIcons 
            name="notebook" 
            size={20} 
            color={theme.colors.white} 
          />
          <Text style={styles.fabMenuText}>Write Diary</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              {
                rotate: fabAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg']
                })
              }
            ]
          }
        ]}
      >
        <Pressable 
          onPress={toggleFabMenu}
          style={styles.fabButton}
        >
          <MaterialCommunityIcons 
            name="pencil" 
            size={24} 
            color={theme.colors.white} 
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

export default function DailyDetailScreen({ navigation, route }) {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const toggleFabMenu = () => {
    const toValue = showFabMenu ? 0 : 1;
    setShowFabMenu(!showFabMenu);
    
    Animated.parallel([
      Animated.spring(fabAnimation, {
        toValue,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.spring(menuAnimation, {
        toValue,
        friction: 6,
        tension: 35,
        useNativeDriver: true
      })
    ]).start();
  };

  const { selectedDate, transactions } = route.params;

  return (    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.colors.text} />
          </Pressable>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Main')}
          >
            <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        <Text style={styles.title}>Daily Details</Text>
        <Text style={styles.subtitle}>Transaction History</Text>
      </View>


      <ScrollView style={styles.content}>
        <DailySummary 
          selectedDate={selectedDate}
          transactions={transactions}
        />

        {transactions.length > 0 ? (
          <View style={styles.transactionsContainer}>            {transactions.map((transaction) => (
              <View 
                key={transaction.transactionid} 
                style={styles.transactionItem}
              >
                <Pressable 
                  style={styles.transactionContent}
                  onPress={() => navigation.navigate('TransactionEdit', { transaction })}
                >
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTarget}>{transaction.targetname}</Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <Text style={styles.transactionTime}>
                        {new Date(transaction.time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text 
                    style={[
                      styles.transactionAmount,
                      transaction.remittance ? styles.expenseAmount : styles.incomeAmount
                    ]}
                  >
                    {transaction.remittance ? '- ' : '+ '}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noTransactionsContainer}>
            <MaterialCommunityIcons 
              name="receipt-text-outline" 
              size={48} 
              color={theme.colors.textLight} 
            />
            <Text style={styles.noTransactionsText}>No transactions for this date</Text>
          </View>
        )}      </ScrollView>
      
      <FABComponent 
        navigation={navigation}
        showFabMenu={showFabMenu}
        toggleFabMenu={toggleFabMenu}
        fabAnimation={fabAnimation}
        menuAnimation={menuAnimation}
        position={fabPosition}
        setPosition={setFabPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: 90,
    alignItems: 'flex-end',
    elevation: 1000,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenu: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    backgroundColor: 'transparent',
    gap: theme.spacing.md,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    transform: [{ scale: 1.05 }],
    maxWidth: 140,
    minWidth: 126,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  fabMenuText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.md,
    fontSize: 13,
    flexShrink: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },  header: {
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  content: {
    flex: 1,
  },
  dailySummaryContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  dailySummaryDate: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dailySummaryAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  transactionsContainer: {
    padding: theme.spacing.md,
  },  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  transactionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  transactionTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  transactionCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  transactionTime: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseAmount: {
    color: theme.colors.error,
  },
  incomeAmount: {
    color: theme.colors.success,
  },
  noTransactionsContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  noTransactionsText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});