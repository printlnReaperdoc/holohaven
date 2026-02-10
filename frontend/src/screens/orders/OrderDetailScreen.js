import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../redux/slices/ordersSlice';

const OrderDetailScreen = ({ route }) => {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  const getStatusTimeline = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(currentOrder?.status);

    return statuses.map((status, index) => ({
      status,
      completed: index <= currentIndex,
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>
        ${(Number(item.price) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <Text>Order not found</Text>
      </View>
    );
  }

  const timeline = getStatusTimeline();

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.section}>
        <Text style={styles.orderNumber}>
          Order #{currentOrder._id.slice(-6).toUpperCase()}
        </Text>
        <Text style={styles.orderDate}>
          {new Date(currentOrder.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Status Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.timeline}>
          {timeline.map((item, index) => (
            <View key={item.status} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineCircle,
                  item.completed && styles.timelineCircleActive,
                ]}
              />
              {index < timeline.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    item.completed && styles.timelineLineActive,
                  ]}
                />
              )}
              <Text
                style={[
                  styles.timelineLabel,
                  item.completed && styles.timelineLabelActive,
                ]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text style={styles.addressText}>
          {currentOrder.shippingAddress.fullName}
        </Text>
        <Text style={styles.addressText}>
          {currentOrder.shippingAddress.address}
        </Text>
        <Text style={styles.addressText}>
          {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
          {currentOrder.shippingAddress.zipCode}
        </Text>
        <Text style={styles.addressText}>
          {currentOrder.shippingAddress.country}
        </Text>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        <FlatList
          data={currentOrder.items}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>
            ${Number(currentOrder.totalPrice).toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping:</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            ${Number(currentOrder.totalPrice).toFixed(2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  timelineCircleActive: {
    backgroundColor: '#10B981',
  },
  timelineLine: {
    position: 'absolute',
    top: 6,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineLineActive: {
    backgroundColor: '#10B981',
  },
  timelineLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 12,
    color: '#999',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
});

export default OrderDetailScreen;
