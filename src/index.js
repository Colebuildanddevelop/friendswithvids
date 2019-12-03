import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as firebase from 'firebase/app';

// FIREBASE CONFIG OBJECT
const firebaseConfig = {
  apiKey: "AIzaSyBdTQ6oxjMwVnogn8W0RjBn3nJaD9ij2q8",
  authDomain: "friendswithvids.firebaseapp.com",
  databaseURL: "https://friendswithvids.firebaseio.com",
  projectId: "friendswithvids",
  storageBucket: "friendswithvids.appspot.com",
  messagingSenderId: "834583113137",
  appId: "1:834583113137:web:103622f4e91beab95d2190",
  measurementId: "G-GX5KC241ED"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

ReactDOM.render(<App />, document.getElementById('root'));