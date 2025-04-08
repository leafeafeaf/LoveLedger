import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authReducer from "./authSlice";
import partnerReducer from "./partnerSlice";
import financeReducer from "./financeSlice";
import contentReducer from "./contentSlice";
import datePickerReducer from "./datePickerSlice";
import tokenReducer from "./tokenSlice";
import accountReducer from "./accountSlice";
import coupleReducer from "./coupleSlice";
import goalReducer from "./goalSlice";

// Redux Persist 설정
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "token", "goal"],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedTokenReducer = persistReducer(persistConfig, tokenReducer);
const persistedGoalReducer = persistReducer(persistConfig, goalReducer);

// 스토어 생성
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    partner: partnerReducer,
    finance: financeReducer,
    content: contentReducer,
    datePicker: datePickerReducer,
    token: persistedTokenReducer,
    account: accountReducer,
    couple: coupleReducer,
    goal: persistedGoalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// 타입 추출
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
