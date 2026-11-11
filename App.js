import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import NutritionScreen from './screens/NutritionScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import TimerScreen from './screens/TimerScreen';
import DailyScreen from './screens/DailyScreen';
import LogScreen from './screens/LogScreen';
import RestWatcher from './components/RestWatcher';
import { colors } from './theme';

const Tab = createBottomTabNavigator();

// name = clé interne, title = titre complet (header), short = libellé de l'onglet (6 onglets = place limitée)
const TABS = [
  { name: 'Nutrition', title: 'Recettes & Nutrition', short: 'Nutrition', icon: 'restaurant-outline', component: NutritionScreen },
  { name: 'Courses', title: 'Liste de courses', short: 'Courses', icon: 'cart-outline', component: ShoppingScreen },
  { name: 'Muscu', title: 'Musculation', short: 'Muscu', icon: 'barbell-outline', component: WorkoutScreen },
  { name: 'Minuteur', title: 'Minuteur', short: 'Minuteur', icon: 'timer-outline', component: TimerScreen },
  { name: 'Suivi', title: 'Suivi Quotidien', short: 'Suivi', icon: 'stats-chart-outline', component: DailyScreen },
  { name: 'Carnet', title: "Carnet d'entraînement", short: 'Carnet', icon: 'journal-outline', component: LogScreen },
];

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.card, text: colors.text, border: colors.border, primary: colors.accent },
};

export default function App() {
  const [tab, setTab] = useState(TABS[0].name);
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={theme}
        documentTitle={{ formatter: () => 'FitApp' }}
        onStateChange={(st) => st && setTab(st.routes[st.index]?.name)}
      >
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.sub,
            tabBarLabelStyle: { fontSize: 10 },
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          {TABS.map((t) => (
            <Tab.Screen
              key={t.name}
              name={t.name}
              component={t.component}
              options={{
                title: t.title,
                tabBarLabel: t.short,
                tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} size={size} color={color} />,
              }}
            />
          ))}
        </Tab.Navigator>
        <RestWatcher hidePill={tab === 'Minuteur'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
