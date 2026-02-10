import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPromotionById } from '../../redux/slices/promotionsSlice';

const PromotionDetailScreen = ({ route }) => {
  const { promotionId } = route.params;
  const dispatch = useDispatch();
  const { currentPromotion, loading } = useSelector(
    (state) => state.promotions
  );

  useEffect(() => {
    dispatch(fetchPromotionById(promotionId));
  }, [dispatch, promotionId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!currentPromotion) {
    return (
      <View style={styles.container}>
        <Text>Promotion not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Main Image */}
      {currentPromotion.image && (
        <Image
          source={{ uri: currentPromotion.image }}
          style={styles.mainImage}
        />
      )}

      {/* Promotion Details */}
      <View style={styles.contentSection}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{currentPromotion.title}</Text>
          {currentPromotion.discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountPercent}>
                {currentPromotion.discountPercent}%
              </Text>
              <Text style={styles.offLabel}>OFF</Text>
            </View>
          )}
        </View>

        {currentPromotion.description && (
          <Text style={styles.description}>
            {currentPromotion.description}
          </Text>
        )}

        {/* Validity Period */}
        <View style={styles.validityCard}>
          <Text style={styles.validityTitle}>⏰ Offer Valid</Text>
          <Text style={styles.validityDate}>
            From: {new Date(currentPromotion.validFrom).toLocaleDateString()}
          </Text>
          <Text style={styles.validityDate}>
            Until: {new Date(currentPromotion.validUntil).toLocaleDateString()}
          </Text>
        </View>

        {/* Applicable Products */}
        {currentPromotion.applicableProducts &&
          currentPromotion.applicableProducts.length > 0 && (
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>Applicable Products</Text>
              {currentPromotion.applicableProducts.map((product) => (
                <View key={product._id} style={styles.productItem}>
                  {product.image && (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                    />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.originalPrice}>
                      Original: ${Number(product.price).toFixed(2)}
                    </Text>
                    <Text style={styles.discountedPrice}>
                      Sale:{' '}
                      $
                      {(
                        Number(product.price) *
                        (1 -
                          currentPromotion.discountPercent / 100)
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Applicable Categories */}
        {currentPromotion.applicableCategories &&
          currentPromotion.applicableCategories.length > 0 && (
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>
                Categories on Sale ({currentPromotion.applicableCategories.length})
              </Text>
              <View style={styles.categoriesList}>
                {currentPromotion.applicableCategories.map((category) => (
                  <View key={category} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Call to Action */}
        <TouchableOpacity style={styles.shopButton}>
          <Text style={styles.shopButtonText}>Shop Now 🛍️</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E5E7EB',
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  discountPercent: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  offLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  validityCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    padding: 14,
    marginBottom: 20,
  },
  validityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  validityDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
  },
  categoriesSection: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  shopButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottomBottom: 20,
  },
  shopButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PromotionDetailScreen;
