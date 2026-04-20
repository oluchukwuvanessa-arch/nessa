/**
 * Cart Management Script
 * Handles dynamic cart rendering, calculations, and localStorage persistence
 */

const CartUI = (() => {
  const CART_KEY = 'nessafit_cart_v2';
  const TAX_RATE = 0.10;
  const SHIPPING_COST = 2500; // Free shipping over ₦50,000

  // Read cart from localStorage
  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (err) {
      console.error('Failed to read cart:', err);
      return [];
    }
  };

  // Write cart to localStorage
  const writeCart = (cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  // Format price to Nigerian Naira
  const formatPrice = (amount) => {
    return '₦' + Math.round(amount || 0).toLocaleString('en-NG');
  };

  // Calculate totals
  const calculateTotals = (cart) => {
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const tax = subtotal * TAX_RATE;
    const shipping = subtotal > 50000 ? 0 : SHIPPING_COST;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  // Render individual cart item
  const renderCartItem = (item, index) => {
    const subtotal = (item.price || 0) * (item.quantity || 1);
    
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.setAttribute('data-index', index);
    
    itemEl.innerHTML = `
      <div class="cart-item__product">
        <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" loading="lazy">
        <div class="product-info">
          <h4>${item.name || 'Unknown Product'}</h4>
          <p class="product-sku">${item.sku || 'N/A'}</p>
        </div>
      </div>
      <div class="cart-item__price">${formatPrice(item.price)}</div>
      <div class="cart-item__quantity">
        <button class="qty-btn qty-decrease" aria-label="Decrease quantity" data-index="${index}">−</button>
        <input type="number" class="qty-input" value="${item.quantity || 1}" min="1" max="999" data-index="${index}" aria-label="Quantity">
        <button class="qty-btn qty-increase" aria-label="Increase quantity" data-index="${index}">+</button>
      </div>
      <div class="cart-item__subtotal">${formatPrice(subtotal)}</div>
      <button class="cart-item__remove" aria-label="Remove item" data-index="${index}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    return itemEl;
  };

  // Render full cart
  const render = () => {
    const cart = readCart();
    const emptyState = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const itemsList = document.getElementById('cart-items-list');
    const clearBtn = document.getElementById('clear-cart-btn');

    if (!cart || cart.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      if (cartContent) cartContent.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';
    if (clearBtn) clearBtn.style.display = 'inline-block';

    if (itemsList) {
      itemsList.innerHTML = '';
      cart.forEach((item, idx) => {
        itemsList.appendChild(renderCartItem(item, idx));
      });
    }

    updateCartSummary();
    attachEventListeners();
  };

  // Update cart summary totals
  const updateCartSummary = () => {
    const cart = readCart();
    const { subtotal, tax, shipping, total } = calculateTotals(cart);

    const subtotalEl = document.getElementById('subtotal-amount');
    const taxEl = document.getElementById('tax-amount');
    const shippingEl = document.getElementById('shipping-amount');
    const totalEl = document.getElementById('total-amount');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (shippingEl) shippingEl.textContent = shipping > 0 ? formatPrice(shipping) : 'Free';
    if (totalEl) totalEl.textContent = formatPrice(total);
  };

  // Update cart badge in header
  const updateBadge = () => {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    const cart = readCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    badge.textContent = totalQty;
  };

  // Remove item from cart
  const removeItem = (index) => {
    const cart = readCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      writeCart(cart);
      render();
      updateBadge();
    }
  };

  // Update item quantity
  const updateQuantity = (index, quantity) => {
    const cart = readCart();
    quantity = Math.max(1, Math.min(999, parseInt(quantity) || 1));
    
    if (index >= 0 && index < cart.length) {
      cart[index].quantity = quantity;
      writeCart(cart);
      render();
      updateBadge();
    }
  };

  // Clear entire cart
  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      writeCart([]);
      render();
      updateBadge();
    }
  };

  // Attach event listeners
  const attachEventListeners = () => {
    // Quantity decrease buttons
    document.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        const cart = readCart();
        if (cart[index]) {
          updateQuantity(index, (cart[index].quantity || 1) - 1);
        }
      });
    });

    // Quantity increase buttons
    document.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        const cart = readCart();
        if (cart[index]) {
          updateQuantity(index, (cart[index].quantity || 1) + 1);
        }
      });
    });

    // Quantity input fields
    document.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        updateQuantity(index, e.target.value);
      });
    });

    // Remove item buttons
    document.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('button').dataset.index);
        removeItem(index);
      });
    });

    // Clear cart button
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.removeEventListener('click', clearCart);
      clearBtn.addEventListener('click', clearCart);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.removeEventListener('click', handleCheckout);
      checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Promo form
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
      promoForm.removeEventListener('submit', handlePromo);
      promoForm.addEventListener('submit', handlePromo);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    const cart = readCart();
    if (cart.length === 0) {
      alert('Your cart is empty. Add items before checking out.');
      return;
    }
    
    const { total } = calculateTotals(cart);
    alert(`Proceeding to checkout. Total: ${formatPrice(total)}\n\nThis is a demo. Actual payment integration would go here.`);
  };

  // Handle promo code
  const handlePromo = (e) => {
    e.preventDefault();
    const promoInput = document.getElementById('promo-input');
    const promoMessage = document.getElementById('promo-message');
    
    if (!promoInput || !promoMessage) return;

    const code = promoInput.value.toUpperCase().trim();
    
    // Demo promo codes
    const promoCodes = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'NESSA50': 50
    };

    if (promoCodes[code]) {
      promoMessage.style.color = '#28a745';
      promoMessage.textContent = `✓ Promo code applied! ${promoCodes[code]}% discount`;
    } else {
      promoMessage.style.color = '#dc3545';
      promoMessage.textContent = '✗ Invalid promo code';
    }
  };

  // Public API
  return {
    init: () => {
      render();
      updateBadge();
      attachEventListeners();
    },
    render,
    updateBadge,
    readCart,
    writeCart,
    removeItem,
    updateQuantity,
    formatPrice
  };
})();

// Initialize cart UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CartUI.init());
} else {
  CartUI.init();
}

// Expose to window for debugging
window.CartUI = CartUI;
