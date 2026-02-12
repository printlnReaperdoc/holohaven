import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFeaturedProducts,
  fetchProducts,
  fetchCategories,
} from '../../redux/slices/productsSlice';
import { fetchPromotions as fetchPromotionsAction } from '../../redux/slices/promotionsSlice';

const DEFAULT_FALLBACK = require('../../../assets/default-product-image.jpg');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { featured, loading, items: allProducts, categories } = useSelector((state) => state.products);
  const { items: promotions } = useSelector((state) => state.promotions);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // Initial load of all products and categories
    dispatch(fetchFeaturedProducts());
    dispatch(fetchPromotionsAction());
    dispatch(fetchCategories());
    dispatch(fetchProducts({})); // Fetch with no filter params
  }, [dispatch]);

  const applyFilters = () => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.minPrice = parseFloat(minPrice);
    if (maxPrice) params.maxPrice = parseFloat(maxPrice);
    console.log('Applying filters:', params);
    dispatch(fetchProducts(params));
  };

  const renderPromoCarousel = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.carousel}
      scrollEventThrottle={16}
    >
      {promotions.map((promo) => (
        <TouchableOpacity
          key={promo._id}
          style={styles.promoCard}
          onPress={() =>
            navigation.navigate('PromotionsDrawer', {
              screen: 'PromotionDetail',
              params: { promotionId: promo._id },
            })
          }
        >
          {promo.image && (
            <Image
              source={{ uri: promo.image }}
              style={styles.promoImage}
            />
          )}
          <View style={styles.promoOverlay}>
            <Text style={styles.promoTitle}>{promo.title}</Text>
            {promo.discountPercent && (
              <Text style={styles.discountBadge}>
                {promo.discountPercent}% OFF
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const ImageWithFallback = ({ uri, style }) => {
    const [error, setError] = useState(false);
    if (!uri || error) {
      return <Image source={DEFAULT_FALLBACK} style={style} />;
    }
    return (
      <Image
        source={{ uri }}
        style={style}
        onError={() => setError(true)}
      />
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate('ProductDetail', { productId: item._id })
      }
    >
      <ImageWithFallback uri={item.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.averageRating || 'N/A'}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
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

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar (inline) */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          style={styles.searchInput}
        />
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.categoryButton, category === '' && styles.categoryActive]}
              onPress={() => setCategory('')}
            >
              <Text>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, category === cat && styles.categoryActive]}
                onPress={() => setCategory(cat)}
              >
                <Text>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.priceRow}>
          <TextInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Min"
            keyboardType="numeric"
            style={styles.priceInput}
          />
          <TextInput
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Max"
            keyboardType="numeric"
            style={styles.priceInput}
          />
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Promo Carousel */}
      {promotions.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Featured Promotions</Text>
          {renderPromoCarousel()}
        </View>
      )}

      {/* Products List */}
      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={allProducts.length ? allProducts : featured}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingBottom: 20,
  },
  searchContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  filtersRow: {
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  carousel: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  promoCard: {
    width: 300,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productCard: {
    flex: 0.48,
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
});

export default HomeScreen;
