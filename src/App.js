import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/createStore';
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter as Router } from 'react-router-dom';
// COMPONENTS
import Navigation from './react/components/Navigation';
// MATERIAL UI 
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import deepPurple from '@material-ui/core/colors/deepPurple';
import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    primary: deepPurple,
    secondary: grey,
  },
});

const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <div className="App">  
              <Navigation/>
            </div>
          </Router>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}

export default App;


