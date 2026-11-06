import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NonLoggedHomeScreen from '../features/nonLoggedHome/NonLoggedHomeScreen';
import { ROUTES, RootStackParamList } from './routes';
import { StubScreen } from './stubs/StubScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Home is the initial route (no active session). Back targets are explicit: every stub pops to Home. */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.NonLoggedHome}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.NonLoggedHome} component={NonLoggedHomeScreen} />
        <Stack.Screen name={ROUTES.LoginScreen} component={StubScreen} />
        <Stack.Screen name={ROUTES.Products} component={StubScreen} />
        <Stack.Screen name={ROUTES.Offers} component={StubScreen} />
        <Stack.Screen name={ROUTES.Faq} component={StubScreen} />
        <Stack.Screen name={ROUTES.TrackApplication} component={StubScreen} />
        <Stack.Screen name={ROUTES.BranchLocator} component={StubScreen} />
        <Stack.Screen
          name={ROUTES.PayNowWebView}
          component={StubScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.title,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
