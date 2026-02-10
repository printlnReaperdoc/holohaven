import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  fetchCategories,
  setFilters,
} from '../../redux/slices/productsSlice';

const DEFAULT_IMAGE = require('../../../assets/default-profile-picture.jpg');

const CategoriesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, categories, loading, filters } = useSelector(
    (state) => state.products
  );
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleSearch = (text) => {
    dispatch(setFilters({ search: text }));
  };

  const handleCategorySelect = (category) => {
    dispatch(setFilters({ category: category === filters.category ? '' : category }));
  };

  const handlePriceFilter = () => {
    dispatch(
      setFilters({
        minPrice: minPrice ? parseFloat(minPrice) : 0,
        maxPrice: maxPrice ? parseFloat(maxPrice) : 999999,
      })
    );
  };

  const ImageWithFallback = ({ uri, style }) => {
    const [error, setError] = useState(false);
    if (!uri || error) return <Image source={DEFAULT_IMAGE} style={style} />;
    return <Image source={{ uri }} style={style} onError={() => setError(true)} />;
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
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={filters.search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryTag,
                filters.category === '' && styles.categoryTagActive,
              ]}
              onPress={() => dispatch(setFilters({ category: '' }))}
            >
              <Text style={styles.categoryTagText}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTag,
                  filters.category === cat && styles.categoryTagActive,
                ]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text style={styles.categoryTagText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.priceFilter}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="decimal-pad"
              value={minPrice}
              onChangeText={setMinPrice}
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="decimal-pad"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handlePriceFilter}
            >
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={items}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  filterIcon: {
    fontSize: 20,
  },
  filterPanel: {
    backgroundColor: '#FFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryTagActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryTagText: {
    color: '#1F2937',
    fontWeight: '500',
    fontSize: 12,
  },
  priceFilter: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceSeparator: {
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  applyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  category: {
    fontSize: 10,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default CategoriesScreen;
