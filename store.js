/**
 * Store - Client-side Data Management (localStorage)
 * 2026+ Implementation with ES6+
 * 
 * ⚠️  WARNING: This is for demo purposes only.
 * For production, use a secure backend with proper authentication,
 * encryption, and database management.
 */

(() => {
  // Storage keys
  const KEYS = {
    USERS: 'nessafit_users_v2',
    ORDERS: 'nessafit_orders_v2',
    REVIEWS: 'nessafit_reviews_v2',
    SESSION: 'nessafit_session_v2',
  };

  // ========== UTILITIES ==========
  const Storage = {
    read: (key) => {
      try {
        return JSON.parse(localStorage.getItem(key)) || [];
      } catch (err) {
        console.error(`Failed to read storage key '${key}':`, err);
        return [];
      }
    },

    write: (key, data) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (err) {
        console.error(`Failed to write storage key '${key}':`, err);
        return false;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (err) {
        console.error(`Failed to remove storage key '${key}':`, err);
        return false;
      }
    },

    clear: () => {
      try {
        Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
        return true;
      } catch (err) {
        console.error('Failed to clear storage:', err);
        return false;
      }
    },
  };

  const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}_${timestamp}_${random}`;
  };

  // ========== USER MANAGEMENT ==========
  const Users = {
    getAll: () => Storage.read(KEYS.USERS),

    save: (users) => Storage.write(KEYS.USERS, users),

    create: ({ name, email, password }) => {
      const users = Users.getAll();

      // Check for existing email
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered. Please use a different email.');
      }

      const user = {
        id: generateId('u'),
        name: name?.trim() || '',
        email: email?.toLowerCase()?.trim() || '',
        password: password || '', // NOTE: Never store plain passwords in production!
        createdAt: new Date().toISOString(),
      };

      if (!user.email || !user.password || !user.name) {
        throw new Error('Name, email, and password are required');
      }

      users.push(user);
      Users.save(users);
      return user;
    },

    authenticate: (email, password) => {
      const users = Users.getAll();
      const user = users.find(
        (u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password
      );

      if (!user) {
        return null;
      }

      // Save session
      Session.set({ userId: user.id });
      return user;
    },

    getById: (userId) => {
      const users = Users.getAll();
      return users.find((u) => u.id === userId) || null;
    },
  };

  // ========== SESSION MANAGEMENT ==========
  const Session = {
    get: () => {
      try {
        return JSON.parse(localStorage.getItem(KEYS.SESSION)) || null;
      } catch (err) {
        return null;
      }
    },

    set: (data) => Storage.write(KEYS.SESSION, data),

    getCurrentUserId: () => Session.get()?.userId || null,

    getCurrentUser: () => {
      const userId = Session.getCurrentUserId();
      return userId ? Users.getById(userId) : null;
    },

    clear: () => Storage.remove(KEYS.SESSION),
  };

  // ========== ORDER MANAGEMENT ==========
  const Orders = {
    getAll: () => Storage.read(KEYS.ORDERS),

    save: (orders) => Storage.write(KEYS.ORDERS, orders),

    generateNumber: () => {
      const random = Math.floor(Math.random() * 900000) + 100000;
      return `ORD${random}`;
    },

    create: ({ userId, items, shippingAddress, email }) => {
      const orders = Orders.getAll();
      const order = {
        id: generateId('order'),
        number: Orders.generateNumber(),
        userId: userId || null,
        email: email?.toLowerCase()?.trim() || null,
        items: Array.isArray(items) ? items : [],
        shippingAddress: shippingAddress?.trim() || null,
        status: 'received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            timestamp: new Date().toISOString(),
            status: 'received',
            note: 'Order received',
          },
        ],
      };

      orders.unshift(order);
      Orders.save(orders);
      return order;
    },

    getByNumber: (orderNumber) => {
      const orders = Orders.getAll();
      return orders.find((o) => o.number === orderNumber) || null;
    },

    getByUserId: (userId) => {
      const orders = Orders.getAll();
      return orders.filter((o) => o.userId === userId);
    },

    updateStatus: (orderId, newStatus, note = '') => {
      const orders = Orders.getAll();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      order.history = order.history || [];
      order.history.push({
        timestamp: new Date().toISOString(),
        status: newStatus,
        note,
      });

      Orders.save(orders);
      return order;
    },
  };

  // ========== REVIEW MANAGEMENT ==========
  const Reviews = {
    getAll: () => Storage.read(KEYS.REVIEWS),

    save: (reviews) => Storage.write(KEYS.REVIEWS, reviews),

    add: ({ productId, userId, userName, rating, comment }) => {
      const reviews = Reviews.getAll();
      const review = {
        id: generateId('rev'),
        productId,
        userId: userId || null,
        userName: userName?.trim() || 'Guest',
        rating: Math.max(0, Math.min(5, Number(rating) || 0)),
        comment: comment?.trim() || '',
        createdAt: new Date().toISOString(),
      };

      if (!productId) {
        throw new Error('Product ID is required');
      }

      reviews.unshift(review);
      Reviews.save(reviews);
      return review;
    },

    getByProductId: (productId) => {
      const reviews = Reviews.getAll();
      return reviews.filter((r) => r.productId === productId);
    },

    getAverageRating: (productId) => {
      const reviews = Reviews.getByProductId(productId);
      if (reviews.length === 0) return 0;
      const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      return (total / reviews.length).toFixed(1);
    },
  };

  // ========== DEMO DATA SEEDING ==========
  const seedDemoData = () => {
    // Only seed if empty
    if (Users.getAll().length === 0) {
      try {
        Users.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'admin123',
        });
        Users.create({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });
      } catch (err) {
        console.warn('Failed to seed users:', err);
      }
    }

    if (Orders.getAll().length === 0) {
      try {
        Orders.create({
          userId: 'u_jane',
          email: 'jane@example.com',
          items: [{ id: 'tee-001', qty: 1, title: 'Black Tee', price: 25 }],
          shippingAddress: '123 Main Street, Springfield',
        });
      } catch (err) {
        console.warn('Failed to seed orders:', err);
      }
    }

    if (Reviews.getAll().length === 0) {
      try {
        Reviews.add({
          productId: 'tee-001',
          userId: 'u_jane',
          userName: 'Jane Doe',
          rating: 5,
          comment: 'Excellent quality and great fit!',
        });
      } catch (err) {
        console.warn('Failed to seed reviews:', err);
      }
    }
  };

  // ========== PUBLIC API ==========
  window.Store = {
    // Users
    getUsers: Users.getAll,
    createUser: Users.create,
    authenticate: Users.authenticate,
    getCurrentUser: Session.getCurrentUser,
    signOut: Session.clear,

    // Orders
    getOrders: Orders.getAll,
    createOrder: Orders.create,
    getOrderThrough: Orders.getByNumber,
    getOrdersByUser: Orders.getByUserId,
    updateOrderStatus: Orders.updateStatus,

    // Reviews
    getReviews: Reviews.getAll,
    addReview: Reviews.add,
    getReviewsForProduct: Reviews.getByProductId,
    getAverageRating: Reviews.getAverageRating,

    // Session
    getCurrentUserId: Session.getCurrentUserId,

    // Utilities
    seedDemoData,
    clearAllData: Storage.clear,
  };

  // Initialize demo data
  try {
    seedDemoData();
  } catch (err) {
    console.warn('Failed to seed demo data:', err);
  }
})();
