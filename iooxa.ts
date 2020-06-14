import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import runtime, { types } from '@iooxa/runtime';
import { register as basicRegister } from '@iooxa/components';
import '@iooxa/components/dist/iooxa.css';
import { register } from './src/components';
import './src/index.css';
import './index.css';

declare global {
  interface Window {
    iooxa: {
      store: types.Store;
    }
  }
}

window.iooxa = {
  ...window.iooxa,
  store: createStore(
    combineReducers({ runtime: runtime.reducer }),
    applyMiddleware(
      thunkMiddleware,
      runtime.triggerEvaluate,
      runtime.dangerousEvaluatation,
    ),
  ) as types.Store,
};

basicRegister(window.iooxa.store);
register(window.iooxa.store);
