import "react-native-gesture-handler"; // MUST be first for web
import "react-native-url-polyfill/auto";
import "./src/web-polyfills";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Platform } from "react-native";
import { useState, useEffect, useCallback } from "react";

import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoopDetailScreen } from "./src/screens/LoopDetailScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { TemplateLibraryScreen } from "./src/screens/TemplateLibraryScreen";
import { TemplateDetailScreen } from "./src/screens/TemplateDetailScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { AdminDashboardScreen } from "./src/screens/admin/AdminDashboardScreen";
import { AdminTemplatesScreen } from "./src/screens/admin/AdminTemplatesScreen";
import { AdminCreatorsScreen } from "./src/screens/admin/AdminCreatorsScreen";
import { AdminUsersScreen } from "./src/screens/admin/AdminUsersScreen";
import { AdminAffiliatesScreen } from "./src/screens/admin/AdminAffiliatesScreen";
import { AdminReviewsScreen } from "./src/screens/admin/AdminReviewsScreen";
import { AdminAnalyticsScreen } from "./src/screens/admin/AdminAnalyticsScreen";
import { AdminAuditLogsScreen } from "./src/screens/admin/AdminAuditLogsScreen";
import { AdminRolesScreen } from "./src/screens/admin/AdminRolesScreen";
import { AdminSettingsScreen } from "./src/screens/admin/AdminSettingsScreen";
import { LoopSommelierScreen } from "./src/screens/LoopSommelierScreen";

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  ResetPassword: undefined;
  Home: undefined;
  LoopDetail: { loopId: string };
  TemplateLibrary: undefined;
  TemplateDetail: { templateId: string };
  Settings: undefined;
  AdminDashboard: undefined;
  AdminTemplates: undefined;
  AdminCreators: undefined;
  AdminUsers: undefined;
  AdminAffiliates: undefined;
  AdminReviews: undefined;
  AdminAnalytics: undefined;
  AdminAuditLogs: undefined;
  AdminRoles: undefined;
  AdminSettings: undefined;
  LoopSommelier: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ["http://localhost:8081", "https://doloop.app", "https://www.doloop.app"],
  config: {
    screens: {
      Onboarding: "onboarding",
      Login: "login",
      ResetPassword: "reset-password",
      Home: "",
      LoopDetail: "loop/:loopId",
      TemplateLibrary: "templates",
      TemplateDetail: "template/:templateId",
      Settings: "settings",
      AdminDashboard: "admin",
      AdminTemplates: "admin/templates",
      AdminCreators: "admin/creators",
      AdminUsers: "admin/users",
      AdminAffiliates: "admin/affiliates",
      AdminReviews: "admin/reviews",
      LoopSommelier: "sommelier",
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  console.log("[App] Fonts loaded:", fontsLoaded);

  // ==== Navigation state persistence ====
  const NAV_STATE_KEY = "NAV_STATE_v1";
  const [initialNavState, setInitialNavState] = useState();
  const [isNavReady, setIsNavReady] = useState(false);

  // Hydrate nav state for web (persist across reloads)
  // BUT skip restoration if URL contains a deep link path (e.g., /reset-password)
  // so that deep linking can take precedence
  useEffect(() => {
    // Only run on web
    if (Platform.OS === "web") {
      const restoreState = async () => {
        try {
          // Check if the current URL has a specific path that should be deep linked
          const currentPath = window.location.pathname;
          const deepLinkPaths = ["/reset-password", "/loop/", "/template/", "/sommelier"];
          const isDeepLink = deepLinkPaths.some(path => currentPath.startsWith(path));

          if (isDeepLink) {
            console.log("[App] Deep link detected, skipping nav state restoration:", currentPath);
            // Clear saved state so the deep link takes precedence
            localStorage.removeItem(NAV_STATE_KEY);
          } else {
            const savedState = localStorage.getItem(NAV_STATE_KEY);
            if (savedState) {
              setInitialNavState(JSON.parse(savedState));
            }
          }
        } catch {}
        setIsNavReady(true);
      };
      restoreState();
    } else {
      setIsNavReady(true);
      console.log("[App] Navigation ready (mobile)");
    }
  }, []);

  console.log("[App] isNavReady:", isNavReady);

  const handleStateChange = useCallback((state: any) => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, []);

  if (!fontsLoaded || !isNavReady) {
    console.log("[App] Rendering Loading Placeholder (null)");
    return null; // or loading spinner
  }

  console.log("[App] Rendering Navigator");

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer
            linking={linking}
            initialState={initialNavState}
            onStateChange={handleStateChange}
          >
            <Stack.Navigator
              initialRouteName="Onboarding"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="LoopDetail" component={LoopDetailScreen} />
              <Stack.Screen
                name="TemplateLibrary"
                component={TemplateLibraryScreen}
              />
              <Stack.Screen
                name="TemplateDetail"
                component={TemplateDetailScreen}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
              />
              <Stack.Screen
                name="AdminTemplates"
                component={AdminTemplatesScreen}
              />
              <Stack.Screen
                name="AdminCreators"
                component={AdminCreatorsScreen}
              />
              <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
              <Stack.Screen
                name="AdminAffiliates"
                component={AdminAffiliatesScreen}
              />
              <Stack.Screen
                name="AdminReviews"
                component={AdminReviewsScreen}
              />
              <Stack.Screen
                name="AdminAnalytics"
                component={AdminAnalyticsScreen}
              />
              <Stack.Screen
                name="AdminAuditLogs"
                component={AdminAuditLogsScreen}
              />
              <Stack.Screen name="AdminRoles" component={AdminRolesScreen} />
              <Stack.Screen
                name="AdminSettings"
                component={AdminSettingsScreen}
              />
              <Stack.Screen
                name="LoopSommelier"
                component={LoopSommelierScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
