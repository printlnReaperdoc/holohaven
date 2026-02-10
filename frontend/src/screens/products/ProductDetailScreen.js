import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../redux/slices/productsSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchReviews } from '../../redux/slices/reviewsSlice';

const DEFAULT_FALLBACK = require('../../../assets/default-profile-picture.jpg');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const { currentProduct, loading, error } = useSelector((state) => state.products);
  const { productReviews } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(fetchProductById(productId));
    dispatch(fetchReviews(productId));
  }, [dispatch, productId]);

  const handleAddToCart = () => {
    dispatch(addToCart({ productId, quantity }));
    Alert.alert('Success', 'Product added to cart', [{ text: 'OK' }]);
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.userId.username}</Text>
        <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
      </View>
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString()}
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

  if (error || !currentProduct) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Product Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || 'This product is no longer available or has been removed.'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const ImageWithFallback = ({ uri, style }) => {
    const [error, setError] = useState(false);
    if (!uri || error) return <Image source={DEFAULT_FALLBACK} style={style} />;
    return <Image source={{ uri }} style={style} onError={() => setError(true)} />;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Product Image Gallery */}
      <ImageWithFallback uri={currentProduct.image} style={styles.mainImage} />

      {/* Product Info */}
      <View style={styles.infoSection}>
        <Text style={styles.productName}>{currentProduct.name}</Text>
        <Text style={styles.price}>
          ${Number(currentProduct.price).toFixed(2)}
        </Text>

        <View style={styles.ratingSection}>
          <Text style={styles.rating}>
            ⭐ {currentProduct.averageRating || 0}
          </Text>
          <Text style={styles.reviewCount}>
            ({currentProduct.reviewCount} reviews)
          </Text>
        </View>

        {currentProduct.vtuberTag && (
          <Text style={styles.vtuberTag}>🎌 {currentProduct.vtuberTag}</Text>
        )}

        {currentProduct.description && (
          <Text style={styles.description}>{currentProduct.description}</Text>
        )}
      </View>

      {/* Quantity & Add to Cart */}
      <View style={styles.actionSection}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews ({productReviews.length})</Text>
          {user && (
            <TouchableOpacity onPress={() => setShowReviewForm(!showReviewForm)}>
              <Text style={styles.addReviewButton}>
                {showReviewForm ? '✕' : '+ Add'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showReviewForm && user && (
          <View style={styles.reviewForm}>
            <View style={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={styles.starButton}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts..."
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={productReviews}
          renderItem={renderReview}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.noReviews}>No reviews yet</Text>
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mainImage: {
    width: '100%',
    height: 350,
    backgroundColor: '#E5E7EB',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    color: '#F59E0B',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  vtuberTag: {
    fontSize: 14,
    color: '#7C3AED',
    marginBottom: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  quantityButton: {
    padding: 8,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  quantityValue: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewsSection: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addReviewButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
    paddingHorizontal: 8,
  },
  reviewForm: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  ratingInput: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  starButton: {
    fontSize: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewComment: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  noReviews: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});

export default ProductDetailScreen;
