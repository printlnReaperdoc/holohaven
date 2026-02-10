import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'holohaven_cart';
const isWeb = Platform.OS === 'web' || !SQLite.openDatabase;
let db = null;

if (!isWeb) {
  db = SQLite.openDatabase('holohaven.db');
}

function executeSqlAsync(sql, params = []) {
  if (isWeb) {
    return Promise.reject(new Error('SQLite not available on web. Use AsyncStorage fallback.'));
  }
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    }, (txError) => reject(txError));
  });
}

// Native (SQLite) implementation
export const initializeSQLite = async () => {
  if (isWeb) {
    console.log('SQLite not available on web — using SecureStore fallback');
    return;
  }

  try {
    await executeSqlAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId TEXT NOT NULL UNIQUE,
        productName TEXT,
        price REAL,
        quantity INTEGER,
        image TEXT,
        addedAt DATETIME DEFAULT (datetime('now'))
      );
    `);
    console.log('SQLite initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite:', error);
  }
};

// Fallback: use SecureStore on web or when SQLite is unavailable
async function saveCartToStorage(cartItems) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(cartItems || []));
  } catch (e) {
    console.error('SecureStore save error:', e);
  }
}

async function loadCartFromStorage() {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('SecureStore load error:', e);
    return [];
  }
}

export const saveCartToSQLite = async (cartItems) => {
  if (isWeb) {
    await saveCartToStorage(cartItems);
    console.log('Cart saved to SecureStore (fallback)');
    return;
  }

  try {
    await executeSqlAsync('DELETE FROM cart;');

    for (const item of cartItems) {
      const productId = item.productId?._id || item.productId;
      const productName = item.productId?.name || item.productName || '';
      const price = Number(item.productId?.price || item.price || 0);
      const quantity = item.quantity || 1;
      const image = item.productId?.image || item.image || '';

      await executeSqlAsync(
        `INSERT OR REPLACE INTO cart (productId, productName, price, quantity, image)
         VALUES (?, ?, ?, ?, ?);`,
        [productId, productName, price, quantity, image]
      );
    }

    console.log('Cart saved to SQLite successfully');
  } catch (error) {
    console.error('Error saving cart to SQLite:', error);
  }
};

export const loadCartFromSQLite = async () => {
  if (isWeb) {
    const items = await loadCartFromStorage();
    console.log('Cart loaded from SecureStore (fallback):', items);
    return items;
  }

  try {
    const result = await executeSqlAsync('SELECT * FROM cart;');
    const rows = result.rows && result.rows._array ? result.rows._array : [];
    const items = rows.map((row) => ({
      productId: {
        _id: row.productId,
        price: row.price,
        name: row.productName,
        image: row.image,
      },
      productName: row.productName,
      price: row.price,
      quantity: row.quantity,
      image: row.image,
    }));
    console.log('Cart loaded from SQLite:', items);
    return items;
  } catch (error) {
    console.error('Error loading cart from SQLite:', error);
    return [];
  }
};

export const clearCartFromSQLite = async () => {
  if (isWeb) {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      console.log('Cart cleared from SecureStore (fallback)');
    } catch (e) {
      console.error('SecureStore clear error:', e);
    }
    return;
  }

  try {
    await executeSqlAsync('DELETE FROM cart;');
    console.log('Cart cleared from SQLite');
  } catch (error) {
    console.error('Error clearing cart from SQLite:', error);
  }
};

export const addItemToSQLiteCart = async (cartItem) => {
  if (isWeb) {
    const items = await loadCartFromStorage();
    const productId = cartItem.productId?._id || cartItem.productId;
    const existingIndex = items.findIndex(i => (i.productId?._id || i.productId) === productId);
    if (existingIndex >= 0) {
      items[existingIndex].quantity = (items[existingIndex].quantity || 1) + (cartItem.quantity || 1);
    } else {
      items.push(cartItem);
    }
    await saveCartToStorage(items);
    console.log('Item added to SecureStore cart (fallback)');
    return;
  }

  try {
    const productId = cartItem.productId?._id || cartItem.productId;
    const productName = cartItem.productId?.name || cartItem.productName || '';
    const price = Number(cartItem.productId?.price || cartItem.price || 0);
    const quantity = cartItem.quantity || 1;
    const image = cartItem.productId?.image || cartItem.image || '';

    await executeSqlAsync(
      `INSERT OR REPLACE INTO cart (productId, productName, price, quantity, image)
       VALUES (?, ?, ?, ?, ?);`,
      [productId, productName, price, quantity, image]
    );
    console.log('Item added to SQLite cart');
  } catch (error) {
    console.error('Error adding item to SQLite cart:', error);
  }
};

export const removeItemFromSQLiteCart = async (productId) => {
  if (isWeb) {
    try {
      const items = await loadCartFromStorage();
      const filtered = items.filter(i => (i.productId?._id || i.productId) !== productId);
      await saveCartToStorage(filtered);
      console.log('Item removed from SecureStore cart (fallback)');
    } catch (e) {
      console.error('SecureStore remove error:', e);
    }
    return;
  }

  try {
    await executeSqlAsync('DELETE FROM cart WHERE productId = ?;', [productId]);
    console.log('Item removed from SQLite cart');
  } catch (error) {
    console.error('Error removing item from SQLite cart:', error);
  }
};
