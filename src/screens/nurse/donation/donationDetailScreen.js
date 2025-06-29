import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatDateTime } from '@/utils/formatHelpers';
import bloodDonationAPI from '@/apis/bloodDonation';
import donorStatusLogAPI from '@/apis/donorStatusLog';

const DonationDetailScreen = ({ route }) => {
  const [donationDetail, setDonationDetail] = useState(null);
  const [donorStatusLog, setDonorStatusLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: '',
    notes: '',
    status: '',
  });
  const [isCreatingRestingLog, setIsCreatingRestingLog] = useState(false);
  
  const navigation = useNavigation();
  const donationId = route?.params?.donationId;
  const mode = route?.params?.mode || 'view'; // 'view' or 'update'

  const fetchDonationDetail = async () => {
    try {
      if (!donationId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin hiến máu');
        return;
      }

      const response = await bloodDonationAPI.HandleBloodDonation(
        `/${donationId}`,
        null,
        'get'
      );

      if (response.data) {
        const donation = response.data;
        
        // Transform data để phù hợp với UI
        const transformedData = {
          id: donation._id,
          registrationId: donation.bloodDonationRegistrationId?._id || donation.bloodDonationRegistrationId,
          registrationCode: donation.bloodDonationRegistrationId?.code || "N/A",
          donor: {
            id: donation.userId?._id,
            name: donation.userId?.fullName || "N/A",
            avatar: donation.userId?.avatar || "https://png.pngtree.com/png-clipart/20240321/original/pngtree-avatar-job-student-flat-portrait-of-man-png-image_14639685.png",
            bloodType: donation.bloodGroupId?.name || "N/A",
            gender: donation.userId?.sex === 'male' ? 'Nam' : donation.userId?.sex === 'female' ? 'Nữ' : 'N/A',
            dob: donation.userId?.yob ? new Date(donation.userId.yob).toLocaleDateString('vi-VN') : 'N/A',
            phone: donation.userId?.phone || 'N/A',
            email: donation.userId?.email || 'N/A',
          },
          staff: {
            id: donation.createdBy?._id || donation.createdBy,
            name: donation.createdBy?.userId?.fullName || "N/A",
            avatar: donation.createdBy?.userId?.avatar || "https://png.pngtree.com/png-clipart/20240321/original/pngtree-avatar-job-student-flat-portrait-of-man-png-image_14639685.png",
          },
          bloodGroup: {
            id: donation.bloodGroupId?._id,
            type: donation.bloodGroupId?.name || "N/A",
          },
          code: donation.code || "N/A",
          quantity: donation.quantity || 0,
          donationDate: donation.donationDate,
          donationStartAt: donation.donationDate,
          donationEndAt: donation.updatedAt,
          status: donation.status,
          notes: donation.notes || "",
          facility: {
            name: donation.bloodDonationRegistrationId?.facilityId?.name || "N/A",
            address: donation.bloodDonationRegistrationId?.facilityId?.address || "N/A",
          },
          originalData: donation,
        };
        
        setDonationDetail(transformedData);
        
        // Set initial update data
        setUpdateData({
          quantity: donation.quantity?.toString() || '',
          notes: donation.notes || '',
          status: donation.status || '',
        });
      }
    } catch (error) {
      console.error('Error fetching donation detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết hiến máu');
    }
  };

  const fetchDonorStatusLog = async () => {
    try {
      const response = await donorStatusLogAPI.HandleDonorStatusLog(
        `/donation/${donationId}`,
        null,
        'get'
      );

      if (response.data && response.data.data && response.data.data.length > 0) {
        setDonorStatusLog(response.data.data[0]);
      } else {
        setDonorStatusLog(null);
      }
    } catch (error) {
      console.error('Error fetching donor status log:', error);
      setDonorStatusLog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchDonationDetail(), fetchDonorStatusLog()]);
  }, [donationId]);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      Promise.all([fetchDonationDetail(), fetchDonorStatusLog()]);
    }, [donationId])
  );

  const handleUpdateDonation = async () => {
    if (!donationDetail) return;
    
    if (!updateData.status) {
      Alert.alert('Lỗi', 'Vui lòng chọn trạng thái');
      return;
    }
    // Validation
    if (updateData.status === 'completed' && (!updateData.quantity || parseInt(updateData.quantity) <= 0)) {
      Alert.alert('Lỗi', 'Vui lòng nhập thể tích hiến máu hợp lệ');
      return;
    }

    

    setIsUpdating(true);
    try {
      const updatePayload = {
        quantity: parseInt(updateData.quantity),
        notes: updateData.notes.trim(),
        status: updateData.status,
      };

      const response = await bloodDonationAPI.HandleBloodDonation(
        `/${donationId}`,
        updatePayload,
        'patch'
      );

      if (response.data) {
        Alert.alert(
          'Thành công',
          'Đã cập nhật thông tin hiến máu thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                setUpdateModalVisible(false);
                // Reload the detail page to show updated information
                fetchDonationDetail();
                // Refetch donor status log to update button display
                fetchDonorStatusLog();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateRestingLog = async () => {
    if (!donationDetail) return;
    
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn chuyển người hiến máu sang giai đoạn nghỉ ngơi?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setIsCreatingRestingLog(true);
            try {
              const response = await donorStatusLogAPI.HandleDonorStatusLog(
                '/',
                {
                  donationId: donationDetail.id,
                  userId: donationDetail.donor.id,
                },
                'post'
              );

              if (response.data) {
                Alert.alert(
                  'Thành công',
                  'Đã chuyển người hiến máu sang giai đoạn nghỉ ngơi!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Reload the detail page and donor status log
                        fetchDonationDetail();
                        fetchDonorStatusLog();
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error creating resting log:', error);
              const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trạng thái';
              Alert.alert('Lỗi', errorMessage);
            } finally {
              setIsCreatingRestingLog(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenUpdateModal = () => {
    // Set default values when opening modal, with 'completed' as default status
    setUpdateData({
      quantity: donationDetail.quantity > 0 ? donationDetail.quantity.toString() : '',
      notes: donationDetail.notes || '',
      status: 'completed', // Default to completed status
    });
    setUpdateModalVisible(true);
  };

  const handleNavigateToDonorStatus = () => {
    navigation.navigate('DonorStatus', {
      donationId: donationDetail.id,
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'donating':
        return { label: 'Đang hiến', color: '#FFA502', icon: 'heart-pulse' };
      case 'completed':
        return { label: 'Hoàn thành', color: '#2ED573', icon: 'check-circle' };
      case 'cancelled':
        return { label: 'Đã hủy', color: '#95A5A6', icon: 'cancel' };
      default:
        return { label: 'Chờ xác nhận', color: '#4A90E2', icon: 'clock-outline' };
    }
  };

  const renderUpdateModal = () => (
    <Modal
      visible={updateModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setUpdateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cập nhật thông tin hiến máu</Text>
            <TouchableOpacity onPress={() => setUpdateModalVisible(false)}>
              <MaterialIcons name="close" size={22} color="#636E72" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Information Display */}
            <View style={styles.currentInfoSection}>
              <Text style={styles.currentInfoTitle}>Thông tin hiện tại</Text>
              <View style={styles.currentInfoGrid}>
                <Text style={styles.currentInfoText}>Người hiến: {donationDetail.donor.name}</Text>
                <Text style={styles.currentInfoText}>Nhóm máu: {donationDetail.donor.bloodType}</Text>
                <Text style={styles.currentInfoText}>Thể tích: {donationDetail.quantity > 0 ? `${donationDetail.quantity} ml` : 'Chưa cập nhật'}</Text>
                <Text style={styles.currentInfoText}>Trạng thái: {getStatusInfo(donationDetail.status).label}</Text>
              </View>
            </View>

            {/* Quantity Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thể tích hiến máu (ml) *</Text>
              <TextInput
                style={styles.textInput}
                value={updateData.quantity}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, quantity: text }))}
                placeholder="Nhập thể tích (VD: 450)"
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>Thể tích tiêu chuẩn: 450ml</Text>
            </View>

            {/* Status Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trạng thái *</Text>
              <View style={styles.statusOptions}>
                {[
                  { value: 'completed', label: 'Hoàn thành', icon: 'check-circle', color: '#2ED573' },
                  { value: 'cancelled', label: 'Hủy bỏ', icon: 'cancel', color: '#FF4757' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      updateData.status === option.value && styles.statusOptionActive,
                      updateData.status === option.value && { 
                        borderColor: option.color, 
                        shadowColor: option.color,
                        borderWidth: 2,
                      }
                    ]}
                    onPress={() => setUpdateData(prev => ({ ...prev, status: option.value }))}
                  >
                    <View style={styles.statusOptionContent}>
                      <View style={[styles.statusOptionIcon, { backgroundColor: option.color }]}>
                        <MaterialCommunityIcons 
                          name={option.icon} 
                          size={18} 
                          color="#fff" 
                        />
                      </View>
                      <View style={styles.statusOptionTextContainer}>
                        <Text style={[
                          styles.statusOptionText,
                          updateData.status === option.value && { color: option.color, fontWeight: '600' }
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={styles.statusOptionDescription}>
                          {option.value === 'completed' ? 'Quá trình hiến máu thành công' : 'Dừng quá trình hiến máu'}
                        </Text>
                      </View>
                      {updateData.status === option.value && (
                        <View style={[styles.statusSelectedIndicator, { backgroundColor: option.color }]}>
                          <MaterialCommunityIcons name="check" size={14} color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={updateData.notes}
                onChangeText={(text) => setUpdateData(prev => ({ ...prev, notes: text }))}
                placeholder="Nhập ghi chú về quá trình hiến máu..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setUpdateModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdateDonation}
              disabled={isUpdating}
            >
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading || !donationDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="loading" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(donationDetail.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          navigation.navigate('TabNavigatorNurse', {
            screen: 'Donations',
            params: {
              screen: 'Donations',
            },
          });
        }}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết hiến máu</Text>
          <View style={[styles.headerStatus, { backgroundColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon} size={16} color="#fff" />
            <Text style={styles.headerStatusText}>{statusInfo.label}</Text>
          </View>
        </View>
        {mode === 'update' && donationDetail?.status === 'donating' ? (
          <TouchableOpacity 
            style={styles.updateHeaderButton} 
            onPress={handleOpenUpdateModal}
          >
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card - Compact donor + hero stats */}
        <View style={styles.mainCard}>
          {/* Donor Header */}
          <View style={styles.donorHeader}>
            <Image source={{ uri: donationDetail.donor.avatar }} style={styles.compactAvatar} />
            <View style={styles.donorInfo}>
              <Text style={styles.compactDonorName}>{donationDetail.donor.name}</Text>
              <View style={styles.donorMetaRow}>
                <View style={styles.bloodTypeChip}>
                  <MaterialCommunityIcons name="water" size={16} color="#fff" />
                  <Text style={styles.bloodTypeText}>{donationDetail.donor.bloodType}</Text>
                </View>
                <View style={styles.genderChip}>
                  <MaterialCommunityIcons name="account" size={14} color="#636E72" />
                  <Text style={styles.chipText}>{donationDetail.donor.gender}</Text>
                </View>
              </View>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="phone" size={14} color="#636E72" />
                <Text style={styles.contactText}>{donationDetail.donor.phone}</Text>
                <MaterialCommunityIcons name="email" size={14} color="#636E72" style={{ marginLeft: 16 }} />
                <Text style={styles.contactText}>{donationDetail.donor.email}</Text>
              </View>
            </View>
          </View>

          {/* Hero Metrics Row */}
          <View style={styles.heroMetricsRow}>
            <View style={styles.compactHeroCard}>
              <View style={styles.compactHeroIcon}>
                <MaterialCommunityIcons name="water" size={24} color="#fff" />
              </View>
              <View style={styles.compactHeroContent}>
                <Text style={styles.compactHeroLabel}>NHÓM MÁU</Text>
                <Text style={styles.compactHeroValue}>{donationDetail.donor.bloodType}</Text>
              </View>
            </View>

            <View style={[styles.compactHeroCard, styles.volumeCard]}>
              <View style={[styles.compactHeroIcon, styles.volumeIcon]}>
                <MaterialCommunityIcons name="beaker" size={24} color="#fff" />
              </View>
              <View style={styles.compactHeroContent}>
                <Text style={styles.compactHeroLabel}>THỂ TÍCH</Text>
                <Text style={styles.compactHeroValue}>
                  {donationDetail.quantity > 0 ? `${donationDetail.quantity} ml` : 'Chưa cập nhật'}
                </Text>
              </View>
              {donationDetail.quantity > 0 && (
                <View style={styles.compactProgressBar}>
                  <View 
                    style={[
                      styles.compactProgress, 
                      { width: `${Math.min((donationDetail.quantity / 450) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Process Details Card */}
        <View style={styles.processCard}>
          <View style={styles.processHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color="#FF6B6B" />
            <Text style={styles.processTitle}>Chi tiết quy trình</Text>
            <View style={[styles.statusChip, { backgroundColor: statusInfo.color }]}>
              <MaterialCommunityIcons name={statusInfo.icon} size={12} color="#fff" />
              <Text style={styles.statusChipText}>{statusInfo.label}</Text>
            </View>
          </View>

          {/* Process Info Grid */}
          <View style={styles.processGrid}>
            <View style={styles.processItem}>
              <View style={styles.processItemHeader}>
                <MaterialCommunityIcons name="identifier" size={14} color="#4A90E2" />
                <Text style={styles.processLabel}>Mã hiến máu</Text>
              </View>
              <Text style={styles.processValue} numberOfLines={1} ellipsizeMode="tail">
                {donationDetail.code}
              </Text>
            </View>
            
            <View style={styles.processItem}>
              <View style={styles.processItemHeader}>
                <MaterialCommunityIcons name="card-text" size={14} color="#9B59B6" />
                <Text style={styles.processLabel}>Mã đăng ký</Text>
              </View>
              <Text style={styles.processValue} numberOfLines={1} ellipsizeMode="tail">
                {donationDetail.registrationCode}
              </Text>
            </View>
            
            <View style={styles.processItem}>
              <View style={styles.processItemHeader}>
                <MaterialCommunityIcons name="account-tie" size={14} color="#2ED573" />
                <Text style={styles.processLabel}>Y tá phụ trách</Text>
              </View>
              <Text style={styles.processValue} numberOfLines={1} ellipsizeMode="tail">
                {donationDetail.staff.name}
              </Text>
            </View>
            
            <View style={styles.processItem}>
              <View style={styles.processItemHeader}>
                <MaterialCommunityIcons name="hospital-building" size={14} color="#F39C12" />
                <Text style={styles.processLabel}>Cơ sở y tế</Text>
              </View>
              <Text style={styles.processValue} numberOfLines={2} ellipsizeMode="tail">
                {donationDetail.facility.name}
              </Text>
            </View>
          </View>

          {/* Time Info */}
          <View style={styles.timeInfo}>
            <View style={styles.timeItem}>
              <View style={styles.timeItemHeader}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#636E72" />
                <Text style={styles.timeLabel}>Bắt đầu</Text>
              </View>
              <Text style={styles.timeValue} numberOfLines={2}>
                {formatDateTime(new Date(donationDetail.donationStartAt))}
              </Text>
            </View>
            
            {donationDetail.donationEndAt && donationDetail.status === 'completed' && (
              <View style={styles.timeItem}>
                <View style={styles.timeItemHeader}>
                  <MaterialCommunityIcons name="clock-check-outline" size={14} color="#636E72" />
                  <Text style={styles.timeLabel}>Kết thúc</Text>
                </View>
                <Text style={styles.timeValue} numberOfLines={2}>
                  {formatDateTime(new Date(donationDetail.donationEndAt))}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes Card - Compact */}
        {donationDetail.notes && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <MaterialCommunityIcons name="note-text" size={18} color="#FF6B6B" />
              <Text style={styles.notesTitle}>Ghi chú</Text>
            </View>
            <Text style={styles.compactNotesText}>{donationDetail.notes}</Text>
          </View>
        )}

        {/* Post-Donation Action Card - Compact */}
        {donationDetail.status === 'completed' && (
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <MaterialCommunityIcons 
                name={donorStatusLog ? "check-circle" : "bed"} 
                size={18} 
                color="#2ED573" 
              />
              <Text style={styles.actionTitle}>
                {donorStatusLog ? "Theo dõi sau hiến" : "Giai đoạn nghỉ ngơi"}
              </Text>
              {donorStatusLog && (
                <View style={styles.actionStatus}>
                  <Text style={styles.actionStatusText}>
                    {donorStatusLog.recordedAt ? "Hoàn tất" : "Đang theo dõi"}
                  </Text>
                </View>
              )}
            </View>
            
            {donorStatusLog ? (
              <TouchableOpacity
                style={styles.compactActionButton}
                onPress={handleNavigateToDonorStatus}
              >
                <MaterialCommunityIcons name="heart-plus" size={16} color="#fff" />
                <Text style={styles.compactActionButtonText}>
                  {donorStatusLog.recordedAt ? "Xem chi tiết" : "Cập nhật trạng thái"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.compactActionButton, styles.restingButton, isCreatingRestingLog && styles.restingButtonDisabled]}
                onPress={handleCreateRestingLog}
                disabled={isCreatingRestingLog}
              >
                <MaterialCommunityIcons name="bed" size={16} color="#fff" />
                <Text style={styles.compactActionButtonText}>
                  {isCreatingRestingLog ? 'Đang xử lý...' : 'Chuyển sang nghỉ ngơi'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {renderUpdateModal()}
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={18} color="#636E72" />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

const InfoCard = ({ icon, label, value, color }) => (
  <View style={styles.infoCard}>
    <View style={[styles.infoCardIcon, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color="#fff" />
    </View>
    <Text style={styles.infoCardLabel}>{label}</Text>
    <Text style={styles.infoCardValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  updateHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  compactAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2.5,
    borderColor: '#FF6B6B',
  },
  donorInfo: {
    flex: 1,
    marginLeft: 14,
  },
  compactDonorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 6,
  },
  donorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  bloodTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bloodTypeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 3,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  chipText: {
    fontSize: 10,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 3,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  contactText: {
    fontSize: 11,
    color: '#636E72',
    marginLeft: 3,
    fontWeight: '500',
  },
  heroMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compactHeroCard: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  volumeCard: {
    backgroundColor: '#F39C12',
  },
  compactHeroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  volumeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  compactHeroContent: {
    flex: 1,
  },
  compactHeroLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  compactHeroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 16,
  },
  compactProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  compactProgress: {
    height: '100%',
    backgroundColor: '#fff',
  },
  processCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  processTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 6,
    flex: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 3,
  },
  processGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 6,
  },
  processItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 60,
  },
  processItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  processLabel: {
    fontSize: 10,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 4,
    flex: 1,
  },
  processValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2D3436',
    lineHeight: 14,
  },
  timeInfo: {
    flexDirection: 'row',
    gap: 6,
  },
  timeItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 60,
  },
  timeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 10,
    color: '#636E72',
    fontWeight: '500',
    marginLeft: 4,
  },
  timeValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2D3436',
    lineHeight: 12,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 5,
  },
  compactNotesText: {
    fontSize: 12,
    color: '#636E72',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3436',
    marginLeft: 5,
    flex: 1,
  },
  actionStatus: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionStatusText: {
    fontSize: 9,
    color: '#2ED573',
    fontWeight: '600',
  },
  compactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  restingButton: {
    backgroundColor: '#2ED573',
  },
  restingButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  compactActionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  modalBody: {
    maxHeight: 400,
  },
  currentInfoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  currentInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  currentInfoGrid: {
    gap: 4,
  },
  currentInfoText: {
    fontSize: 12,
    color: '#636E72',
    paddingLeft: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FAFBFC',
    color: '#2D3436',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputHint: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 4,
    fontStyle: 'italic',
    paddingLeft: 2,
  },
  statusOptions: {
    flexDirection: 'column',
    gap: 8,
  },
  statusOption: {
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusOptionActive: {
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusOptionTextContainer: {
    flex: 1,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  statusOptionDescription: {
    fontSize: 11,
    color: '#636E72',
    lineHeight: 14,
  },
  statusSelectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#636E72',
    textAlign: 'center',
  },
  updateButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  updateButtonDisabled: {
    backgroundColor: '#E9ECEF',
    elevation: 0,
    shadowOpacity: 0,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default DonationDetailScreen;
