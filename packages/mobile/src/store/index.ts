import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';
import ordersReducer from '@/store/slices/ordersSlice';
import preferencesReducer from '@/store/slices/preferencesSlice';
import productsReducer from '@/store/slices/productsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  orders: ordersReducer,
  preferences: preferencesReducer,
  products: productsReducer,
});

const persistedReducer = persistReducer(
  {
    key: 'ecommerce-mobile',
    storage: AsyncStorage,
    whitelist: ['cart', 'preferences'],
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
