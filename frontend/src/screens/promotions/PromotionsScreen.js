import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromotions } from '../../redux/slices/promotionsSlice';

const PromotionsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items: promotions, loading } = useSelector(
    (state) => state.promotions
  );

  useEffect(() => {
    dispatch(fetchPromotions());
  }, [dispatch]);

  const renderPromotion = ({ item }) => (
    <TouchableOpacity
      style={styles.promoCard}
      onPress={() =>
        navigation.navigate('PromotionDetail', { promotionId: item._id })
      }
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.promoImage} />
      )}

      <View style={styles.promoContent}>
        <View style={styles.promoHeader}>
          <Text style={styles.promoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discountPercent}%</Text>
              <Text style={styles.offText}>OFF</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.promoDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.promoFooter}>
          <Text style={styles.validUntil}>
            Valid until:{' '}
            {new Date(item.validUntil).toLocaleDateString()}
          </Text>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (promotions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyText}>No promotions available</Text>
          <Text style={styles.emptySubtext}>
            Check back soon for amazing deals!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        renderItem={renderPromotion}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContent: {
    padding: 16,
  },
  promoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  promoContent: {
    padding: 16,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  discountText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  offText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promoDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validUntil: {
    fontSize: 11,
    color: '#999',
  },
  viewButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },
});

export default PromotionsScreen;
