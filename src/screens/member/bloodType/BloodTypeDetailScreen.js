import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import bloodGroupAPI from "@/apis/bloodGroup";

const bloodCompatibility = [
  {
    type: "A+",
    canGiveTo: ["A+", "AB+"],
    canReceiveFrom: ["A+", "A-", "O+", "O-"],
  },
  {
    type: "A-",
    canGiveTo: ["A+", "A-", "AB+", "AB-"],
    canReceiveFrom: ["A-", "O-"],
  },
  {
    type: "B+",
    canGiveTo: ["B+", "AB+"],
    canReceiveFrom: ["B+", "B-", "O+", "O-"],
  },
  {
    type: "B-",
    canGiveTo: ["B+", "B-", "AB+", "AB-"],
    canReceiveFrom: ["B-", "O-"],
  },
  {
    type: "AB+",
    canGiveTo: ["AB+"],
    canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  {
    type: "AB-",
    canGiveTo: ["AB+", "AB-"],
    canReceiveFrom: ["A-", "B-", "AB-", "O-"],
  },
  {
    type: "O+",
    canGiveTo: ["O+", "A+", "B+", "AB+"],
    canReceiveFrom: ["O+", "O-"],
  },
  {
    type: "O-",
    canGiveTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    canReceiveFrom: ["O-"],
  },
];

const donationTips = [
  "Uống nhiều nước trước khi hiến máu",
  "Đảm bảo đủ 8 tiếng ngủ đêm trước",
  "Ăn đầy đủ bữa sáng",
  "Tránh thức ăn nhiều dầu mỡ",
];

export default function BloodTypeDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const compatibilityData = bloodCompatibility.find(
    (item) => item.type === group?.name
  );

  useEffect(() => {
    const fetchGroup = async () => {
      const response = await bloodGroupAPI.HandleBloodGroup(`/${groupId}`);
      setGroup(response.data);
    };
    fetchGroup();
  }, [groupId]);

  const renderCompatibilitySection = (title, types) => (
    <View style={styles.compatibilitySection}>
      <Text style={styles.sectionSubtitle}>{title}</Text>
      <View style={styles.bloodTypeGrid}>
        {types?.map((type) => (
          <View key={type} style={styles.bloodTypeChip}>
            <Text style={styles.bloodTypeChipText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderList = (items) => (
    <View style={styles.listContainer}>
      {items?.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.listItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.bloodType}>{group?.name}</Text>
            <Text style={styles.percentage}>
              {group?.populationRate}% dân số
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin chung</Text>
            <Text style={styles.description}>{group?.note}</Text>
          </View>

          {/* Compatibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tương thích máu</Text>
            {renderCompatibilitySection(
              "Có thể cho máu cho",
              compatibilityData?.canGiveTo
            )}
            {renderCompatibilitySection(
              "Có thể nhận máu từ",
              compatibilityData?.canReceiveFrom
            )}
          </View>

          {/* Characteristics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đặc điểm</Text>
            {renderList(group?.characteristics)}
          </View>

          {/* Donation Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lưu ý khi hiến máu</Text>
            {renderList(donationTips)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FF6B6B",
    padding: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  bloodType: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  percentage: {
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#95A5A6",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#2D3436",
    lineHeight: 24,
  },
  compatibilitySection: {
    marginBottom: 16,
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  bloodTypeChip: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  bloodTypeChipText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3436",
    flex: 1,
  },
});
