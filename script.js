/**
 * Nessa's Fit - Modern Shopping App Script
 * 2026+ ES6+ Implementation
 */

// =========== CART MANAGEMENT ===========
const CartManager = (() => {
  const CART_KEY = 'nessafit_cart_v2';
  
  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (err) {
      console.error('Failed to read cart:', err);
      return [];
    }
  };

  const writeCart = (cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      notifyCartUpdated();
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  const addItem = (item) => {
    const cart = readCart();
    const existing = cart.find(
      (i) => i.name === item.name && i.price === item.price
    );
    
    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    
    writeCart(cart);
    return cart;
  };

  const notifyCartUpdated = () => {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: readCart() }));
  };

  return { readCart, writeCart, addItem, notifyCartUpdated };
})();

// =========== UI UPDATES ===========
const UIManager = (() => {
  const updateCartBadge = () => {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    
    const cart = CartManager.readCart();
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline-block' : 'none';
  };

  const injectAddToCartButtons = () => {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach((card) => {
      if (card.querySelector('.add-to-cart')) return;
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'add-to-cart';
      btn.textContent = 'Add to Cart';
      btn.setAttribute('aria-label', 'Add this item to cart');
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const title = card.querySelector('h3')?.textContent.trim();
        const priceText = card.querySelector('.price')?.textContent || '';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        const image = card.querySelector('img')?.src || '';
        
        if (title && price > 0) {
          CartManager.addItem({ name: title, price, image, quantity: 1 });
          btn.textContent = 'Added ✓';
          setTimeout(() => { btn.textContent = 'Add to Cart'; }, 1500);
        }
      });
      
      const priceEl = card.querySelector('.price');
      if (priceEl) {
        priceEl.insertAdjacentElement('afterend', btn);
      }
    });
  };

  return { updateCartBadge, injectAddToCartButtons };
})();

// =========== NAVIGATION ===========
const NavManager = (() => {
  const menu = document.getElementById('primary-navigation');
  const toggleBtn = document.getElementById('menu-toggle');
  const overlay = document.getElementById('nav-overlay');

  const isMenuOpen = () => menu?.classList.contains('active');

  const setMenuState = (isOpen) => {
    if (!menu || !toggleBtn || !overlay) return;

    menu.classList.toggle('active', isOpen);
    toggleBtn.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  };

  const close = () => setMenuState(false);

  const init = () => {
    if (!menu || !toggleBtn || !overlay) return;

    toggleBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setMenuState(!isMenuOpen());
    });

    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a.navbar__link');
      if (link) {
        close();
      }
    });

    overlay.addEventListener('click', close);

    document.addEventListener('click', (event) => {
      if (!isMenuOpen() || !menu) return;
      if (!menu.contains(event.target) && !toggleBtn.contains(event.target)) {
        close();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isMenuOpen()) {
        close();
      }
    });
  };

  return { init, close };
})();

// =========== SCROLL BEHAVIOR ==========
const HeaderManager = (() => {
  const header = document.querySelector('.site-header');

  const update = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  const init = () => {
    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  return { init, update };
})();

// =========== INITIALIZATION ===========
const init = () => {
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  UIManager.updateCartBadge();
  UIManager.injectAddToCartButtons();
  NavManager.init();
  HeaderManager.init();
  
  // Update badge when cart changes
  window.addEventListener('cartUpdated', () => {
    UIManager.updateCartBadge();
  });
  
  // Register service worker for PWA support (2026+ feature)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Service worker registration failed - not critical for app functionality
    });
  }
};

// Start app
init();

// Expose API for debugging/manual use
window.NessaFit = {
  CartManager,
  UIManager,
  NavManager
};

// Compatibility with older inline menu toggles
window.menutoggle = NavManager.toggle;
window.closeMenu = NavManager.close;






