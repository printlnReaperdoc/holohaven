import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  fetchProfile,
  updateProfile,
  uploadProfilePicture,
  logout,
} from '../../redux/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState('basic'); // 'basic' or 'security'
  
  // Basic info
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Security info
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handlePickImage = async () => {
    // Show choice between camera and library
    const choose = await new Promise((resolve) => {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' },
        { text: 'Take Photo', onPress: () => resolve('camera') },
        { text: 'Choose from Library', onPress: () => resolve('library') },
      ]);
    });

    if (!choose) return;

    if (choose === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera permission required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append('profilePicture', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        dispatch(uploadProfilePicture(formData));
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append('profilePicture', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        dispatch(uploadProfilePicture(formData));
      }
    }
  };

  const handleSaveProfile = async () => {
    if (editTab === 'basic') {
      // Basic info validation
      if (!username.trim() || !email.trim()) {
        Alert.alert('Error', 'Username and email cannot be empty');
        return;
      }
      
      // Simple email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert('Error', 'Please enter a valid email');
        return;
      }

      const result = await dispatch(
        updateProfile({
          fullName,
          bio,
          phone,
          username,
          email,
        })
      );

      if (result.type === updateProfile.fulfilled.type) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.payload?.error || 'Failed to update profile');
      }
    } else if (editTab === 'security') {
      // Security info validation
      if (!currentPassword) {
        Alert.alert('Error', 'Please enter your current password');
        return;
      }

      if (!newPassword) {
        Alert.alert('Error', 'Please enter a new password');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const result = await dispatch(
        updateProfile({
          currentPassword,
          password: newPassword,
        })
      );

      if (result.type === updateProfile.fulfilled.type) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditTab('basic');
        setIsEditing(false);
        Alert.alert('Success', 'Password changed successfully');
      } else {
        Alert.alert('Error', result.payload?.error || 'Failed to change password');
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.navigate('Auth');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={handlePickImage}>
          {user?.profilePicture && !imageError ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profileImage}
              onError={() => setImageError(true)}
            />
          ) : user?.profilePicture && imageError ? (
            <Image
              source={require('../../../assets/default-profile-picture.jpg')}
              style={styles.profileImage}
            />
          ) : user?.username ? (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          ) : (
            <Image
              source={require('../../../assets/default-profile-picture.jpg')}
              style={styles.profileImage}
            />
          )}
          <View style={styles.editImageOverlay}>
            <Text style={styles.editImageText}>📷</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Profile Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <>
            {/* Edit Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  editTab === 'basic' && styles.tabActive,
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    editTab === 'basic' && styles.tabTextActive,
                  ]}
                  onPress={() => setEditTab('basic')}>
                  Basic Info
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  editTab === 'security' && styles.tabActive,
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    editTab === 'security' && styles.tabTextActive,
                  ]}
                  onPress={() => setEditTab('security')}>
                  Security
                </Text>
              </TouchableOpacity>
            </View>

            {/* Basic Info Tab */}
            {editTab === 'basic' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                <TextInput
                  style={[styles.input, { minHeight: 80 }]}
                  placeholder="Bio"
                  multiline
                  value={bio}
                  onChangeText={setBio}
                />
              </>
            )}

            {/* Security Tab */}
            {editTab === 'security' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />

                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditTab('basic');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Username:</Text>
              <Text style={styles.value}>{username || 'Not set'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{email || 'Not set'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Full Name:</Text>
              <Text style={styles.value}>{fullName || 'Not set'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{phone || 'Not set'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Bio:</Text>
              <Text style={[styles.value, { flex: 1 }]}>
                {bio || 'Not set'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Reviews Section */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('ProfileTab')}
      >
        <Text style={styles.menuItemText}>📝 My Reviews</Text>
        <Text style={styles.menuItemArrow}>›</Text>
      </TouchableOpacity>

      {/* Settings Section */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => { }}
      >
        <Text style={styles.menuItemText}>⚙️ Settings</Text>
        <Text style={styles.menuItemArrow}>›</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerSection: {
    backgroundColor: '#FFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImagePlaceholderText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 0,
    backgroundColor: '#FFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  editImageText: {
    fontSize: 18,
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  email: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  editButton: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 13,
    color: '#1F2937',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  menuItem: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#CCC',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
