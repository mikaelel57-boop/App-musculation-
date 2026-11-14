import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import TodayScreen from './screens/TodayScreen';
import TrainingScreen from './screens/training/TrainingScreen';
import ProgramsScreen from './screens/training/ProgramsScreen';
import ProgramScreen from './screens/training/ProgramScreen';
import ProgramEditScreen from './screens/training/ProgramEditScreen';
import LibraryScreen from './screens/training/LibraryScreen';
import ExerciseScreen from './screens/training/ExerciseScreen';
import SessionScreen from './screens/training/SessionScreen';
import TimerScreen from './screens/TimerScreen';
import NutritionScreen from './screens/nutrition/NutritionScreen';
import RecipesScreen from './screens/nutrition/RecipesScreen';
import RecipeScreen from './screens/nutrition/RecipeScreen';
import AddFoodScreen from './screens/nutrition/AddFoodScreen';
import ProgressScreen from './screens/ProgressScreen';
import MoreScreen from './screens/more/MoreScreen';
import ProfileScreen from './screens/more/ProfileScreen';
import DailyScreen from './screens/DailyScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import BackupScreen from './screens/more/BackupScreen';
import CreditsScreen from './screens/more/CreditsScreen';
import RestWatcher from './components/RestWatcher';
import { useStore } from './store/useStore';
import { colors } from './theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.card, text: colors.text, border: colors.border, primary: colors.accent },
};
const stackOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTitleStyle: { fontWeight: '700', color: colors.text },
  headerTintColor: colors.accent,
  headerBackTitle: 'Retour',
  contentStyle: { backgroundColor: colors.bg },
};

// Écrans partagés par plusieurs onglets
const shared = (S) => (
  <>
    <S.Screen name="Exercise" component={ExerciseScreen} options={{ title: 'Exercice' }} />
    <S.Screen name="Library" component={LibraryScreen} options={{ title: 'Exercices' }} />
    <S.Screen name="Timer" component={TimerScreen} options={{ title: 'Minuteur' }} />
    <S.Screen name="Recipe" component={RecipeScreen} options={{ title: 'Recette' }} />
    <S.Screen name="AddFood" component={AddFoodScreen} options={{ title: 'Ajouter un aliment' }} />
  </>
);

function TodayStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Today" component={TodayScreen} options={{ title: "Aujourd'hui" }} />
      <Stack.Screen name="Daily" component={DailyScreen} options={{ title: 'Suivi quotidien' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon profil' }} />
      {shared(Stack)}
    </Stack.Navigator>
  );
}
function TrainingStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Training" component={TrainingScreen} options={{ title: 'Entraînement' }} />
      <Stack.Screen name="Programs" component={ProgramsScreen} options={{ title: 'Programmes' }} />
      <Stack.Screen name="Program" component={ProgramScreen} options={{ title: 'Programme' }} />
      <Stack.Screen name="ProgramEdit" component={ProgramEditScreen} options={{ title: 'Mon programme' }} />
      <Stack.Screen name="Session" component={SessionScreen} options={{ title: 'Séance', headerBackTitle: 'Retour' }} />
      {shared(Stack)}
    </Stack.Navigator>
  );
}
function NutritionStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Nutrition" component={NutritionScreen} options={{ title: 'Nutrition' }} />
      <Stack.Screen name="Recipes" component={RecipesScreen} options={{ title: 'Recettes' }} />
      {shared(Stack)}
    </Stack.Navigator>
  );
}
function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progrès' }} />
      <Stack.Screen name="Daily" component={DailyScreen} options={{ title: 'Suivi quotidien' }} />
      {shared(Stack)}
    </Stack.Navigator>
  );
}
function MoreStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="More" component={MoreScreen} options={{ title: 'Plus' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon profil' }} />
      <Stack.Screen name="Daily" component={DailyScreen} options={{ title: 'Suivi quotidien' }} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} options={{ title: 'Liste de courses' }} />
      <Stack.Screen name="Backup" component={BackupScreen} options={{ title: 'Sauvegarde' }} />
      <Stack.Screen name="Credits" component={CreditsScreen} options={{ title: 'Crédits' }} />
      {shared(Stack)}
    </Stack.Navigator>
  );
}

const TABS = [
  { name: 'TabToday', label: "Aujourd'hui", icon: 'home', component: TodayStack },
  { name: 'TabTraining', label: 'Entraînement', icon: 'barbell', component: TrainingStack },
  { name: 'TabNutrition', label: 'Nutrition', icon: 'restaurant', component: NutritionStack },
  { name: 'TabProgress', label: 'Progrès', icon: 'trending-up', component: ProgressStack },
  { name: 'TabMore', label: 'Plus', icon: 'menu', component: MoreStack },
];

// Nom de l'écran affiché (en descendant dans les navigateurs imbriqués)
const focusedRoute = (st) => {
  let r = st?.routes?.[st.index];
  while (r?.state) r = r.state.routes[r.state.index];
  return r?.name;
};

export default function App() {
  const hydrated = useStore((st) => st.hydrated);
  const [route, setRoute] = useState('Today');

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={theme}
        documentTitle={{ formatter: () => 'FitApp' }}
        onStateChange={(st) => setRoute(focusedRoute(st))}
      >
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.sub,
            tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          }}
        >
          {TABS.map((t) => (
            <Tab.Screen
              key={t.name}
              name={t.name}
              component={t.component}
              options={{
                tabBarLabel: t.label,
                tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? t.icon : `${t.icon}-outline`} size={size} color={color} />,
              }}
            />
          ))}
        </Tab.Navigator>
        <RestWatcher hidePill={route === 'Timer' || route === 'Session'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
