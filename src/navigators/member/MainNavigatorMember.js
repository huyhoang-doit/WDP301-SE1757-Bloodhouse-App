import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DonationScreen from "@/screens/member/donation/DonationScreen";
import BloodTypeDetailScreen from "@/screens/member/bloodType/BloodTypeDetailScreen";
import BloodTypeListScreen from "@/screens/member/bloodType/BloodTypeListScreen";
import BlogDetailScreen from "@/screens/member/blog/BlogDetailScreen";
import BlogListScreen from "@/screens/member/blog/BlogListScreen";
import SecurityScreen from "@/screens/member/profile/SecurityScreen";
import HelpScreen from "@/screens/member/profile/HelpScreen";
import AboutScreen from "@/screens/member/profile/AboutScreen";
import NearbyScreen from "@/screens/member/map/NearbyScreen";
import DonationHistoryScreen from "@/screens/member/profile/DonationHistoryScreen";
import EmergencyStatusScreen from "@/screens/member/bloodReceiveRequest/EmergencyStatusScreen";
import FacilityDetailScreen from "@/screens/member/facility/FacilityDetailScreen";
import EditProfileScreen from "@/screens/member/profile/EditProfileScreen";
import TabNavigatorMember from "./TabNavigatorMember";
import ReceiveRequestScreen from "@/screens/member/bloodReceiveRequest/ReceiveRequestScreen";
import BloodCompatibilityScreen from "@/screens/member/bloodCompatibility/BloodCompatibilityScreen";
import ReceiveRequestDetailScreen from "@/screens/member/bloodReceiveRequest/ReceiveRequestDetailScreen";
import VerifyLevel2Screen from "@/screens/member/profile/VerifyLevel2Screen";
import SupportRequestsScreen from "@/screens/member/supportRequest/SupportRequestsScreen";
import SupportRequestDetailScreen from "@/screens/member/supportRequest/SupportRequestDetailScreen";
import DeliveryTrackingScreen from "@/screens/member/bloodReceiveRequest/DeliveryTrackingScreen";
import DonationRegistrationDetailScreen from "@/screens/member/donation/DonationRegistrationDetailScreen";
import DonationTimeline from "@/screens/member/donation/DonationTimeline";
import EventListScreen from "@/screens/member/event/EventListScreen";
import EventDetailScreen from "@/screens/member/event/EventDetailScreen";

const MainNavigatorMember = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="TabNavigatorMember" component={TabNavigatorMember} />
      <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
      <Stack.Screen name="Donation" component={DonationScreen} />
      <Stack.Screen name="ReceiveRequest" component={ReceiveRequestScreen} />
      <Stack.Screen name="EmergencyStatus" component={EmergencyStatusScreen} />
      <Stack.Screen name="BloodTypeDetail" component={BloodTypeDetailScreen} />
      <Stack.Screen name="BloodTypeList" component={BloodTypeListScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="BlogList" component={BlogListScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="Nearby" component={NearbyScreen} />
      <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} />
      <Stack.Screen
        name="BloodCompatibility"
        component={BloodCompatibilityScreen}
      />
      <Stack.Screen
        name="ReceiveRequestDetail"
        component={ReceiveRequestDetailScreen}
      />
      <Stack.Screen name="VerifyLevel2Screen" component={VerifyLevel2Screen} />
      <Stack.Screen
        name="SupportRequestScreen"
        component={SupportRequestsScreen}
      />
      <Stack.Screen
        name="SupportRequestDetail"
        component={SupportRequestDetailScreen}
      />
      <Stack.Screen
        name="DeliveryTrackingScreen"
        component={DeliveryTrackingScreen}
      />
      <Stack.Screen
        name="DonationRegistrationDetail"
        component={DonationRegistrationDetailScreen}
      />
      <Stack.Screen
        name="DonationTimeline"
        component={DonationTimeline}
      />
      <Stack.Screen
        name="EventList"
        component={EventListScreen}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default MainNavigatorMember;
