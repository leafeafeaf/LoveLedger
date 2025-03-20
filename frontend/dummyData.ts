import { Transaction as AppTransaction } from "./src/types";

export interface DailyFinance {
  day: string;
  earn: number;
  consume: number;
  timestamp: string;
  userId?: string; // Add user identifier
}

export interface Transaction {
  id: string;
  transactionid?: string;
  amount: number;
  date: string;
  time?: string;
  notes?: string;
  remittance: boolean;
  targetname?: string;
  category?: string;
  userId?: string;
}

export interface DailyFinanceResponse {
  status: string;
  message: string;
  data: {
    days: DailyFinance[];
  };
  timestamp: string;
}

export interface TransactionHistoryResponse {
  status: string;
  message: string;
  data: {
    history: Transaction[];
  };
  timestamp: string;
}

// Function to generate random transactions for a given date range
const generateTransactionsForDateRange = (
  startDate: Date,
  endDate: Date,
  userId?: string
) => {
  const transactions: Transaction[] = [];
  const categories = [
    "식비",
    "카페",
    "마트/편의점",
    "문화/여가",
    "쇼핑",
    "교통",
    "병원",
    "여행",
  ];
  const stores = {
    식비: ["맛있는 식당", "한식당", "일식당", "중식당", "분식집"],
    카페: ["스타벅스", "투썸플레이스", "이디야", "파스쿠찌", "커피빈"],
    "마트/편의점": ["GS25", "CU", "세븐일레븐", "이마트", "홈플러스"],
    "문화/여가": ["CGV", "메가박스", "롯데시네마", "넷플릭스", "웨이브"],
    쇼핑: ["자라", "H&M", "유니클로", "나이키", "아디다스"],
    교통: ["택시", "버스", "지하철", "카카오T", "쏘카"],
    병원: ["연세의원", "삼성병원", "성모병원", "자애병원", "미소치과"],
    여행: ["호텔", "리조트", "펜션", "항공권", "기차표"],
  };

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const numTransactions = Math.floor(Math.random() * 5) + 1; // 1-5 transactions per day

    for (let i = 0; i < numTransactions; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const storeList = stores[category as keyof typeof stores];
      const store = storeList[Math.floor(Math.random() * storeList.length)];
      const amount = Math.floor(Math.random() * 150000) + 5000; // Random amount between 5,000 and 155,000

      transactions.push({
        id: String(Math.floor(Math.random() * 1000000)),
        transactionid: String(Math.floor(Math.random() * 1000000)),
        amount: amount,
        date: currentDate.toISOString().split("T")[0],
        time: `${currentDate.toISOString().split("T")[0]}T${String(
          Math.floor(Math.random() * 24)
        ).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(
          2,
          "0"
        )}:00`,
        remittance: Math.random() > 0.2,
        targetname: store,
        category: category,
        userId: userId,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return transactions.sort((a, b) => {
    const timeA = a.time || "";
    const timeB = b.time || "";
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });
};

// Generate 6 months of transaction history for both users
const startDate = new Date("2025-01-01");
const endDate = new Date("2025-06-30");

export const myTransactions = generateTransactionsForDateRange(
  startDate,
  endDate,
  "user1"
);
export const partnerTransactions = generateTransactionsForDateRange(
  startDate,
  endDate,
  "user2"
);

// Combine all transactions
export const transactionHistoryData: TransactionHistoryResponse = {
  status: "200",
  message: "Success",
  data: {
    history: [...myTransactions, ...partnerTransactions],
  },
  timestamp: "2025-03-12T10:18Z",
};

// Generate daily finance data from transactions
const generateDailyFinance = (transactions: Transaction[], userId?: string) => {
  const dailyFinance: DailyFinance[] = [];
  const dateMap = new Map<string, { earn: number; consume: number }>();

  transactions.forEach((transaction) => {
    if (transaction.userId === userId && transaction.time) {
      const date = transaction.time.split("T")[0];
      const current = dateMap.get(date) || { earn: 0, consume: 0 };

      if (transaction.remittance) {
        current.consume += transaction.amount;
      } else {
        current.earn += transaction.amount;
      }

      dateMap.set(date, current);
    }
  });

  dateMap.forEach((value, key) => {
    dailyFinance.push({
      day: key,
      earn: value.earn,
      consume: value.consume,
      timestamp: new Date().toISOString(),
      userId: userId,
    });
  });

  return dailyFinance.sort(
    (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime()
  );
};

export const myDailyFinance = generateDailyFinance(myTransactions, "user1");
export const partnerDailyFinance = generateDailyFinance(
  partnerTransactions,
  "user2"
);

export const dailyFinanceData: DailyFinanceResponse = {
  status: "200",
  message: "정상적으로 반환하였습니다.",
  data: {
    days: [...myDailyFinance, ...partnerDailyFinance],
  },
  timestamp: "2025-03-12T10:18Z",
};
