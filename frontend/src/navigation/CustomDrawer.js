import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const DEFAULT_PROFILE = require('../../assets/default-profile-picture.jpg');

const CustomDrawer = (props) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
        },
      },
    ]);
  };

  const ProfileImage = () => {
    if (!user?.profilePicture || imageError) {
      return <Image source={DEFAULT_PROFILE} style={styles.profileImage} />;
    }
    return (
      <Image
        source={{ uri: user.profilePicture }}
        style={styles.profileImage}
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* User Profile Header */}
      <View style={styles.userSection}>
        <ProfileImage />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CustomDrawer;
