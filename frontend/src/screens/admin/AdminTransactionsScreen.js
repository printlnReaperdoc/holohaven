import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/ordersSlice';
import { sendRandomPromotion } from '../../redux/slices/notificationsSlice';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminTransactionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allOrders, loading } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    console.log('[ACTION] AdminTransactionsScreen mounted, fetching all orders');
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.forbidden}>Access denied. Admins only.</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    console.log(`[ACTION] Admin updating order ${orderId} to status "${newStatus}"`);
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      Alert.alert('Success', `Order status updated to "${newStatus}". Push notification sent to customer.`);
      setShowStatusModal(false);
      setSelectedOrder(null);
      dispatch(fetchAllOrders());
    } catch (err) {
      Alert.alert('Error', err?.error || 'Failed to update status');
    }
  };

  const handleSendRandomPromotion = async () => {
    console.log('[ACTION] Admin sending random product promotion');
    try {
      const result = await dispatch(sendRandomPromotion()).unwrap();
      Alert.alert(
        'Promotion Sent!',
        `Sent promotion for "${result.product?.name}" to all users.\n${result.message}`
      );
    } catch (err) {
      Alert.alert('Error', err?.error || 'Failed to send promotion');
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        console.log(`[ACTION] Admin viewing order detail: ${item._id}`);
        setSelectedOrder(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderUser}>
            {item.userId?.username || item.userId?.email || 'Unknown User'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.orderItems}>{item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
        <Text style={styles.orderTotal}>${Number(item.totalPrice).toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.updateStatusBtn}
        onPress={() => {
          setSelectedOrder(item);
          setShowStatusModal(true);
        }}
      >
        <Text style={styles.updateStatusText}>Update Status</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Send Random Promotion Button */}
      <TouchableOpacity
        style={styles.promoButton}
        onPress={handleSendRandomPromotion}
      >
        <Text style={styles.promoButtonText}>🎉 Send Random Product Promotion</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={allOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSubtitle}>
              Order #{selectedOrder?._id?.slice(-6).toUpperCase()}
            </Text>

            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedOrder?.status === status && styles.statusOptionActive,
                ]}
                onPress={() => handleStatusUpdate(selectedOrder?._id, status)}
                disabled={selectedOrder?.status === status}
              >
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                <Text style={[
                  styles.statusOptionText,
                  selectedOrder?.status === status && styles.statusOptionTextActive,
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {selectedOrder?.status === status ? ' (current)' : ''}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => { setShowStatusModal(false); setSelectedOrder(null); }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide">
        <ScrollView style={styles.detailModal}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>
              Order #{selectedOrder?._id?.slice(-6).toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => { setShowDetailModal(false); setSelectedOrder(null); }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Customer</Text>
                <Text style={styles.detailText}>
                  {selectedOrder.userId?.username || 'N/A'} ({selectedOrder.userId?.email || 'N/A'})
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status), alignSelf: 'flex-start' }]}>
                  <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Shipping Address</Text>
                {selectedOrder.shippingAddress && (
                  <>
                    <Text style={styles.detailText}>{selectedOrder.shippingAddress.fullName}</Text>
                    <Text style={styles.detailText}>{selectedOrder.shippingAddress.address}</Text>
                    <Text style={styles.detailText}>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </Text>
                    <Text style={styles.detailText}>{selectedOrder.shippingAddress.country}</Text>
                    <Text style={styles.detailText}>Phone: {selectedOrder.shippingAddress.phone}</Text>
                  </>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Items</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.detailItem}>
                    {item.image && (
                      <Image source={{ uri: item.image }} style={styles.detailItemImage} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailItemName}>{item.name}</Text>
                      <Text style={styles.detailItemInfo}>
                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.detailItemTotal}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <View style={styles.detailTotalRow}>
                  <Text style={styles.detailTotalLabel}>Total:</Text>
                  <Text style={styles.detailTotalValue}>
                    ${Number(selectedOrder.totalPrice).toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.updateStatusBtnLarge}
                onPress={() => {
                  setShowDetailModal(false);
                  setShowStatusModal(true);
                }}
              >
                <Text style={styles.updateStatusTextLarge}>Update Status</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  forbidden: {
    color: '#DC2626',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
  },
  promoButton: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  promoButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderItems: {
    fontSize: 12,
    color: '#666',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  updateStatusBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateStatusText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  // Status Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
  },
  statusOptionActive: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: '#999',
  },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Detail Modal
  detailModal: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
    paddingTop: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 8,
  },
  detailSection: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  detailItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailItemInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailItemTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  updateStatusBtnLarge: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    marginTop: 8,
  },
  updateStatusTextLarge: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminTransactionsScreen;
