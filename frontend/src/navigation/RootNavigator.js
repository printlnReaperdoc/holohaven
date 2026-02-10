import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { TouchableOpacity, Text } from 'react-native';

import { verifyToken } from '../redux/slices/authSlice';
import { registerForPush } from '../notifications/push';
import CustomDrawer from './CustomDrawer';

// Import Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PromotionsScreen from '../screens/promotions/PromotionsScreen';
import PromotionDetailScreen from '../screens/promotions/PromotionDetailScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminTransactionsScreen from '../screens/admin/AdminTransactionsScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ title: 'HoloHaven' }}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ title: 'Product Details' }}
    />
  </Stack.Navigator>
);

// Categories Stack
const CategoriesStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="CategoriesTab"
      component={CategoriesScreen}
      options={{ title: 'Categories' }}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ title: 'Product Details' }}
    />
  </Stack.Navigator>
);

// Cart Stack
const CartStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="CartTab"
      component={CartScreen}
      options={{ title: 'Shopping Cart' }}
    />
    <Stack.Screen
      name="Checkout"
      component={CheckoutScreen}
      options={{ title: 'Checkout' }}
    />
  </Stack.Navigator>
);

// Orders Stack
const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="OrdersTab"
      component={OrdersScreen}
      options={{ title: 'Orders' }}
    />
    <Stack.Screen
      name="OrderDetail"
      component={OrderDetailScreen}
      options={{ title: 'Order Details' }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Stack.Navigator>
);

// Promotions Stack
const PromotionsStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="PromotionsTab"
      component={PromotionsScreen}
      options={{ title: 'Promotions' }}
    />
    <Stack.Screen
      name="PromotionDetail"
      component={PromotionDetailScreen}
      options={{ title: 'Promotion Details' }}
    />
  </Stack.Navigator>
);

// Admin Products Stack
const AdminProductsStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="AdminProductsTab"
      component={AdminProductsScreen}
      options={{ title: 'Product Management' }}
    />
  </Stack.Navigator>
);

// Admin Transactions Stack
const AdminTransactionsStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerShown: true,
      headerTintColor: '#8B5CF6',
      headerTitleStyle: { fontWeight: 'bold' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ paddingLeft: 16 }}
        >
          <Text style={{ fontSize: 24 }}>☰</Text>
        </TouchableOpacity>
      ),
    })}
  >
    <Stack.Screen
      name="AdminTransactionsTab"
      component={AdminTransactionsScreen}
      options={{ title: 'Transactions' }}
    />
  </Stack.Navigator>
);


// Main App Stack (with Drawer)
const MainAppStack = () => {
  const { user } = useSelector((state) => state.auth);

  // If user is admin, only show admin routes in drawer
  if (user?.isAdmin) {
    return (
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: '#8B5CF6',
          drawerLabelStyle: { marginLeft: -16 },
        }}
        drawerContent={(props) => <CustomDrawer {...props} />}
      >
        <Drawer.Screen
          name="AdminProductsDrawer"
          component={AdminProductsStack}
          options={{ drawerLabel: 'Product Management' }}
        />
        <Drawer.Screen
          name="AdminTransactionsDrawer"
          component={AdminTransactionsStack}
          options={{ drawerLabel: 'Transactions' }}
        />
      </Drawer.Navigator>
    );
  }

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#8B5CF6',
        drawerLabelStyle: { marginLeft: -16 },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="HomeDrawer"
        component={HomeStack}
        options={{ drawerLabel: 'Home' }}
      />
      <Drawer.Screen
        name="CategoriesDrawer"
        component={CategoriesStack}
        options={{ drawerLabel: 'Categories' }}
      />
      <Drawer.Screen
        name="CartDrawer"
        component={CartStack}
        options={{ drawerLabel: 'Cart' }}
      />
      <Drawer.Screen
        name="OrdersDrawer"
        component={OrdersStack}
        options={{ drawerLabel: 'Orders' }}
      />
      <Drawer.Screen
        name="ProfileDrawer"
        component={ProfileStack}
        options={{ drawerLabel: 'Profile' }}
      />
      <Drawer.Screen
        name="PromotionsDrawer"
        component={PromotionsStack}
        options={{ drawerLabel: 'Promotions' }}
      />
    </Drawer.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt');
        if (token) {
          await dispatch(verifyToken());
        }
        // Register for push notifications
        await registerForPush();
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animationEnabled: false }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainAppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
