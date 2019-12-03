import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import auth from './auth';
import visitor from './visitor';

const persistConfig = {
  key: 'visitor',
  storage,
}

const persistedReducer = persistReducer(persistConfig, visitor);

export default combineReducers({ 
  visitor: persistedReducer,
  auth: auth,
});