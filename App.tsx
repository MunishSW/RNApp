/**
 * BHFL app root: store, safe-area, light status bar over the brand page colour,
 * the shared token provider and the app-start non-logged token request.
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { registerTokenProvider, startNonLoggedToken } from './src/services/authService';
import { store } from './src/store';

function AppContent() {
  useEffect(() => {
    registerTokenProvider();
    startNonLoggedToken().catch(() => undefined);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
