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
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../redux/slices/productsSlice';
import { axiosInstance } from '../../api/api';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProductImageToCloudinary } from '../../utils/cloudinaryUpload';

const DEFAULT_IMAGE = require('../../../assets/default-product-image.jpg');

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
      const response = await axiosInstance.get('/products');
      console.log('Products loaded:', response.data.length);
      
      // Log first product image for debugging
      if (response.data.length > 0) {
        console.log('First product image:', response.data[0].image);
        console.log('All product images:', response.data.map(p => ({ name: p.name, image: p.image })));
      }
      
      setTableData(response.data);
    } catch (error) {
      console.error('Error loading products:', error.message);
      Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to load products');
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

  // Validate and handle price input - only allow numbers and one decimal point
  const handlePriceChange = (text) => {
    // Remove any non-numeric characters except decimal point
    let cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts[1];
    }
    
    // Don't allow leading zeros (except "0" itself or "0.xx")
    if (cleaned.startsWith('0') && cleaned.length > 1 && !cleaned.startsWith('0.')) {
      cleaned = cleaned.substring(1);
    }
    
    setFormData({ ...formData, price: cleaned });
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Gallery image selected:', imageUri);
        console.log('Image picker result:', {
          uri: imageUri,
          mimeType: result.assets[0].mimeType,
          type: result.assets[0].type,
        });
        setFormData({ ...formData, image: imageUri });
        Alert.alert('Success', 'Image selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Camera image captured:', imageUri);
        setFormData({ ...formData, image: imageUri });
        Alert.alert('Success', 'Photo captured');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSaveProduct = async () => {
    // Validate required fields
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Name, price, and category are required');
      return;
    }

    // Validate price is a valid number
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Price must be a valid positive number');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image;
      
      // Check if we have a local image to upload - if so, upload to Cloudinary first
      if (formData.image && formData.image.startsWith('file://')) {
        console.log('📸 Local image detected, uploading to Cloudinary first...');
        try {
          imageUrl = await uploadProductImageToCloudinary(formData.image, editingId);
          console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        } catch (error) {
          Alert.alert('Image Upload Failed', 'Failed to upload image to Cloudinary: ' + error.message);
          setLoading(false);
          return;
        }
      } else if (formData.image) {
        console.log('🔗 Using existing image URL:', formData.image);
      } else {
        console.log('ℹ️ No image provided');
      }

      // Now send JSON data to backend with the Cloudinary URL (no FormData needed)
      const dataToSend = {
        name: formData.name,
        price: priceValue, // Use the validated number
        category: formData.category,
        description: formData.description,
        vtuberTag: formData.vtuberTag,
        image: imageUrl || null,
      };

      console.log('📦 Sending product data to backend:', {
        ...dataToSend,
        image: imageUrl ? imageUrl.substring(0, 50) + '...' : null,
      });

      // Dispatch Redux action
      let result;
      if (editingId) {
        result = await dispatch(updateProduct({ productId: editingId, formData: dataToSend }));
        console.log('✅ Product updated via Redux');
      } else {
        result = await dispatch(createProduct(dataToSend));
        console.log('✅ Product created via Redux');
      }

      if (result.payload) {
        console.log('✅ Product saved:', result.payload);
        
        // Update local table data immediately for instant UI update
        if (editingId) {
          // Update existing product in table
          setTableData(prevData => 
            prevData.map(p => p._id === editingId ? result.payload : p)
          );
          console.log('♻️ Updated product in table:', result.payload._id);
        } else {
          // Add new product to table
          setTableData(prevData => [result.payload, ...prevData]);
          console.log('♻️ Added new product to table:', result.payload._id);
        }
        
        Alert.alert('Success', editingId ? 'Product updated' : 'Product created');
        resetForm();
        setShowModal(false);
        
        // Fetch fresh data from server to ensure sync
        console.log('🔄 Refreshing product list from server...');
        dispatch(fetchProducts());
      } else {
        throw new Error(result.error?.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Request error:', error);
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
            const result = await dispatch(deleteProduct(productId));
            if (result.payload) {
              // Remove from local table immediately for instant feedback
              setTableData(prevData => prevData.filter(p => p._id !== productId));
              console.log('♻️ Removed product from table:', productId);
              
              Alert.alert('Success', 'Product deleted');
              
              // Refresh from server to ensure sync
              console.log('🔄 Refreshing product list from server...');
              dispatch(fetchProducts());
            } else {
              throw new Error(result.error?.message || 'Failed to delete product');
            }
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
            onChangeText={handlePriceChange}
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
              { text: 'Camera', onPress: pickImageFromCamera },
              { text: 'Gallery', onPress: pickImageFromGallery },
              { text: 'Cancel', style: 'cancel' },
            ])}
          >
            <Text style={styles.imageUploadButtonText}>📷 Upload Image or Use Camera</Text>
          </TouchableOpacity>

          {formData.image && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: formData.image }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setFormData({ ...formData, image: '' })}
              >
                <Text style={styles.removeImageButtonText}>Remove Image</Text>
              </TouchableOpacity>
            </View>
          )}

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
  imagePreviewContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#E5E7EB',
  },
  removeImageButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  removeImageButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  forbidden: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AdminProductsScreen;
