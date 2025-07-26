import ScheduleChart from "@/components/ScheduleChart";
import ScheduleEditor from "@/components/ScheduleEditor";
import { useApiClient } from "@/lib/api";
import { useSaveSchedule, useSchedule } from "@/lib/queries";
import { useAuth } from "@clerk/clerk-expo";
import { Calendar, Clock, Edit, Users } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyScheduleScreen() {
  const { isSignedIn } = useAuth();
  useApiClient(); // Initialize API client with auth

  const { data: scheduleData, isLoading, error } = useSchedule();
  const saveScheduleMutation = useSaveSchedule();
  const [editorVisible, setEditorVisible] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-4">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Error loading schedule
        </Text>
        <Text className="text-gray-600 text-center">
          Please check your connection and try again
        </Text>
      </SafeAreaView>
    );
  }

  // Show auth required state
  if (!isSignedIn) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-4">
        <Text className="text-gray-800 text-xl font-bold mb-2">
          Sign in required
        </Text>
        <Text className="text-gray-600 text-center">
          Please sign in to view your schedule
        </Text>
      </SafeAreaView>
    );
  }

  const schedule = scheduleData?.weeklySchedule || {};
  const stats = scheduleData?.stats || {
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    blockedSlots: 0,
  };

  const handleSlotPress = (day: string, time: string, status: string) => {
    const statusMessages = {
      booked: `${day.charAt(0).toUpperCase() + day.slice(1)} at ${time} is booked`,
      available: `${day.charAt(0).toUpperCase() + day.slice(1)} at ${time} is available for booking`,
      blocked: `${day.charAt(0).toUpperCase() + day.slice(1)} at ${time} is blocked`,
      empty: `${day.charAt(0).toUpperCase() + day.slice(1)} at ${time} is not scheduled`,
    };

    Alert.alert(
      "Time Slot",
      statusMessages[status as keyof typeof statusMessages] || "Unknown status",
      [
        { text: "OK", style: "default" },
        {
          text: "Edit",
          style: "default",
          onPress: () => {
            // TODO: Implement slot editing
            console.log("Edit slot", { day, time, status });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-4 pb-6 px-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-gray-800">
              My Schedule
            </Text>
            <TouchableOpacity
              onPress={() => setEditorVisible(true)}
              className="bg-blue-500 rounded-2xl px-4 py-2 flex-row items-center"
            >
              <Edit size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Edit</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">
            Manage your availability and view bookings
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-4 mb-6">
          <View className="flex-row space-x-3 mb-3">
            <View className="bg-white rounded-3xl shadow-lg p-4 flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
                  <Calendar size={16} color="#10B981" />
                </View>
                <Text className="text-2xl font-bold text-green-600">
                  {stats.availableSlots}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">Available Slots</Text>
            </View>

            <View className="bg-white rounded-3xl shadow-lg p-4 flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Users size={16} color="#3B82F6" />
                </View>
                <Text className="text-2xl font-bold text-blue-600">
                  {stats.bookedSlots}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">Booked</Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl shadow-lg p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
                  <Clock size={16} color="#6B7280" />
                </View>
                <Text className="text-gray-800 font-semibold">
                  Total Weekly Slots
                </Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                {stats.totalSlots}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Chart */}
        <View className="px-4 mb-6">
          <ScheduleChart schedule={schedule} onSlotPress={handleSlotPress} />
        </View>

        {/* Recent Bookings */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-3xl shadow-lg p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Upcoming Bookings
            </Text>

            <View className="items-center py-8">
              <Text className="text-gray-500 text-lg mb-2">
                No upcoming bookings
              </Text>
              <Text className="text-gray-400 text-center">
                Bookings will appear here when people schedule with you
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Tips */}
        <View className="px-4 mb-6">
          <View className="bg-blue-50 rounded-3xl p-6">
            <Text className="text-lg font-bold text-blue-800 mb-3">
              💡 Schedule Tips
            </Text>
            <View className="space-y-2">
              <Text className="text-blue-700 text-sm">
                • Set your available hours to let people book with you
              </Text>
              <Text className="text-blue-700 text-sm">
                • Block time slots when you're not available
              </Text>
              <Text className="text-blue-700 text-sm">
                • Booked slots are automatically protected from double-booking
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Schedule Editor Modal */}
      <ScheduleEditor
        visible={editorVisible}
        schedule={schedule}
        onClose={() => setEditorVisible(false)}
      />
    </SafeAreaView>
  );
}

              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
