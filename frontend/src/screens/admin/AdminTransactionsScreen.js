import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const AdminTransactionsScreen = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.forbidden}>Access denied. Admins only.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions Management</Text>
      <Text style={styles.hint}>Implement transactions view and actions here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  hint: {
    marginTop: 8,
    color: '#6B7280',
  },
  forbidden: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
});

export default AdminTransactionsScreen;
