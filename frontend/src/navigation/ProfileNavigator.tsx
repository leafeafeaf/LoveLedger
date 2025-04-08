import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types";
import ProfileMainScreen from "../screens/profile/ProfileMainScreen";
import ProfileEditScreen from "../screens/profile/ProfileEditScreen";
import GoalListScreen from "../screens/profile/GoalListScreen";
import AccountVerificationScreen from "../screens/profile/AccountVerificationScreen";
import LinkSelectionScreen from "../screens/link/LinkSelectionScreen";
import LinkGenerationScreen from "../screens/link/LinkGenerationScreen";
import LinkConfirmScreen from "../screens/link/LinkConfirmScreen";
import LinkSuccessScreen from "../screens/link/LinkSuccessScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="GoalList" component={GoalListScreen} />
      <Stack.Screen
        name="AccountVerification"
        component={AccountVerificationScreen}
      />
      <Stack.Screen
        name="LinkSelection"
        component={LinkSelectionScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="LinkGeneration"
        component={LinkGenerationScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="LinkConfirm"
        component={LinkConfirmScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="LinkSuccess"
        component={LinkSuccessScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
