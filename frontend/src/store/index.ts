import { configureStore, combineReducers } from "@reduxjs/toolkit";
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

// 루트 리듀서 설정
const rootReducer = combineReducers({
  auth: authReducer,
  partner: partnerReducer,
  finance: financeReducer,
  content: contentReducer,
  datePicker: datePickerReducer,
  token: tokenReducer,
});

// Redux Persist 설정
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "partner", "token"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 스토어 생성
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// 타입 추출
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
