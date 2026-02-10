import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct } from '../../redux/slices/productsSlice';
import axios from 'axios';
import { Platform } from 'react-native';

const DEFAULT_IMAGE = require('../../../assets/default-profile-picture.jpg');

const ENV_API = process.env.REACT_APP_API_URL;
const PLATFORM_DEFAULT = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
let API_URL = ENV_API || PLATFORM_DEFAULT || 'http://192.168.1.100:4000';
if (Platform.OS === 'android' && typeof API_URL === 'string' && API_URL.includes('localhost')) {
  API_URL = API_URL.replace('localhost', '10.0.2.2');
  console.log('Adjusted AdminProductsScreen API_URL for Android emulator:', API_URL);
}

const AdminProductsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    vtuberTag: '',
    image: '',
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`, {
        timeout: 10000,
        headers: {},
      });
      console.log('Products loaded:', response.data.length);
      setTableData(response.data);
    } catch (error) {
      console.error('Error loading products:', error.message);
      Alert.alert('Error', error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      vtuberTag: '',
      image: '',
    });
    setEditingId(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Name, price, and category are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        vtuberTag: formData.vtuberTag,
        image: formData.image || null,
      };

      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, payload, {
          timeout: 10000,
        });
        Alert.alert('Success', 'Product updated');
      } else {
        await axios.post(`${API_URL}/products`, payload, {
          timeout: 10000,
        });
        Alert.alert('Success', 'Product created');
      }

      resetForm();
      setShowModal(false);
      loadProducts();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description || '',
      vtuberTag: product.vtuberTag || '',
      image: product.image || '',
    });
    setEditingId(product._id);
    setShowModal(true);
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert('Confirm', 'Delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/products/${productId}`, {
              timeout: 10000,
            });
            Alert.alert('Success', 'Product deleted');
            loadProducts();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const ImageWithFallback = ({ uri, style }) => {
    const [error, setError] = useState(false);
    if (!uri || error) return <Image source={DEFAULT_IMAGE} style={style} />;
    return <Image source={{ uri }} style={style} onError={() => setError(true)} />;
  };

  const renderProductRow = ({ item }) => (
    <View style={styles.tableRow}>
      <ImageWithFallback uri={item.image} style={styles.productThumbnail} />
      <View style={styles.rowContent}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowCategory}>{item.category}</Text>
        <Text style={styles.rowPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item._id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.forbidden}>Access denied. Admins only.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        <Text style={styles.createButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#8B5CF6" />}

      <FlatList
        data={tableData}
        renderItem={renderProductRow}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found</Text>
        }
      />

      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={formData.name}
            onChangeText={(text) =>
              setFormData({ ...formData, name: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="decimal-pad"
            value={formData.price}
            onChangeText={(text) =>
              setFormData({ ...formData, price: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Category"
            value={formData.category}
            onChangeText={(text) =>
              setFormData({ ...formData, category: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="VTuber Tag"
            value={formData.vtuberTag}
            onChangeText={(text) =>
              setFormData({ ...formData, vtuberTag: text })
            }
          />

          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => Alert.alert('Upload Options', 'Choose method: Camera or Gallery', [
              { text: 'Camera', onPress: () => Alert.alert('Camera not yet implemented') },
              { text: 'Gallery', onPress: () => Alert.alert('Gallery not yet implemented') },
            ])}
          >
            <Text style={styles.imageUploadButtonText}>📷 Upload Image or Use Camera</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Or paste Image URL"
            value={formData.image}
            onChangeText={(text) =>
              setFormData({ ...formData, image: text })
            }
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProduct}
          >
            <Text style={styles.saveButtonText}>Save Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 10,
  },
  createButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  rowContent: {
    flex: 1,
  },
  rowName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  rowCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rowPrice: {
    fontWeight: 'bold',
    color: '#8B5CF6',
    fontSize: 13,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 40,
    fontSize: 14,
  },
  modal: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    minHeight: 44,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageUploadButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  imageUploadButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  forbidden: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AdminProductsScreen;
