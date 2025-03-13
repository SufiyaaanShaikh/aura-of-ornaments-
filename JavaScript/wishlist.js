// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
  });
  
  // Global variables
  let isLoggedIn = false;
  
  // Initialize the wishlist functionality
  function init() {
    // Check if user is logged in by checking for token
    const token = localStorage.getItem('accessToken');
    isLoggedIn = !!token;
  
    if (isLoggedIn) {
      // Get user's wishlist if logged in
      fetchWishlist();
      
      // Setup event listeners on product pages
      setupWishlistButtons();
    } else {
      // Handle not logged in state
      handleNotLoggedIn();
    }
  }
  
  // Fetch user's wishlist from the API
  async function fetchWishlist() {
    try {
        const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5020/api/wishlist/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}` 
        },
        credentials: 'include' // Include cookies for authentication
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Store wishlist items for reference
      if (data.data) {
        const wishlistItems = data.data.map(item => item._id);
        localStorage.setItem('wishlistItemIds', JSON.stringify(wishlistItems));
        
        // Update UI with wishlist items
        updateWishlistUI(wishlistItems);
        
        // If on wishlist page, display items
        if (window.location.pathname.includes('wishlist.html')) {
          displayWishlistItems(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }
  
  // Setup event listeners for wishlist buttons
  // Setup event listeners for wishlist buttons
function setupWishlistButtons() {
  const wishlistButtons = document.querySelectorAll('.wishlist-icon');

  wishlistButtons.forEach(button => {
      button.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          if (!isLoggedIn) {
              showLoginNotification();
              return;
          }

          const productCard = this.closest('.product-cards');
          const productId = productCard?.getAttribute('data-id') ||
              document.querySelector('.product-detail-container')?.getAttribute('data-id');

          if (productId) {
              toggleWishlistItem(productId, this);
          } else {
              console.error('Product ID not found');
          }
      });
  });
}

// Toggle item in wishlist (add or remove)
async function toggleWishlistItem(productId, button) {
  try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5020/api/wishlist/toggle', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ productId })
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const isAdded = data.data.added;

      // Update the UI immediately
      const wishlistImg = button.querySelector(".wishlist-img");
      if (isAdded) {
          wishlistImg.src = "../images/red-heart.svg";
          showNotification('Item added to wishlist!');
      } else {
          wishlistImg.src = "../images/wishlist.svg";
          showNotification('Item removed from wishlist!');
      }

      // Update local storage
      updateLocalWishlist(productId, isAdded);

  } catch (error) {
      console.error('Error toggling wishlist item:', error);
      showNotification('Failed to update wishlist. Please try again.');
  }
}

  // Update local storage wishlist
  function updateLocalWishlist(productId, isAdding) {
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItemIds')) || [];
    
    if (isAdding) {
      // Add to wishlist if not already there
      if (!wishlistItems.includes(productId)) {
        wishlistItems.push(productId);
      }
    } else {
      // Remove from wishlist
      const index = wishlistItems.indexOf(productId);
      if (index !== -1) {
        wishlistItems.splice(index, 1);
      }
    }
    
    localStorage.setItem('wishlistItemIds', JSON.stringify(wishlistItems));
  }
  
  // Update UI with wishlist items
  function updateWishlistUI(wishlistItems) {
    // Update all product cards with appropriate wishlist icon
    const productCards = document.querySelectorAll('.product-cards');
    
    productCards.forEach(card => {
      const productId = card.getAttribute('data-id') || 
                        card.querySelector('.add-to-cart-btn')?.getAttribute('data-id');
      const wishlistIcon = card.querySelector('.wishlist-img');
      
      if (productId && wishlistIcon) {
        if (wishlistItems.includes(productId)) {
          wishlistIcon.src = "../images/red-heart.svg";
        } else {
          wishlistIcon.src = "../images/wishlist.svg";
        }
      }
    });
  }
  
  // Display wishlist items on wishlist page
  function displayWishlistItems(items) {
    const container = document.querySelector('.product-container');
    
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-wishlist">
          <h3>Your wishlist is empty</h3>
          <div class="btn">
            <a href="../product.html">Browse Products</a>
          </div>
        </div>
      `;
      return;
    }
    
    // Create product cards for each wishlist item
    items.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-cards';
      productCard.setAttribute('data-id', product._id);
      
      // Format price with Rs. prefix
      const formattedPrice = `Rs.${product.price}`;
      
      productCard.innerHTML = `
        <div class="product-img">
          <span class="wishlist-icon">
            <img src="../images/red-heart.svg" alt="Wishlist Icon" class="wishlist-img">
          </span>
          <img src="${product.profilePhoto || "../images/product1.jpg"}" alt="${product.name}">
        </div>
        <div class="product-content">
          <h4>${product.category || "Jewelry"}</h4>
          <h3>${product.name}</h3>
          <h5>${formattedPrice}</h5>
          <div class="btn">
            <a href="#" class="add-to-cart-btn" data-id="${product._id}">Add to cart</a>
          </div>
        </div>
      `;
      
      container.appendChild(productCard);
    });
    
    // Add event listeners
    setupWishlistButtons();
    setupAddToCartButtons();
  }
  
  // Check if wishlist is empty and show message
  function checkEmptyWishlist() {
    const container = document.querySelector('.product-container');
    if (!container.querySelector('.product-cards')) {
      container.innerHTML = `
        <div class="empty-wishlist">
          <h3>Your wishlist is empty</h3>
          <div class="btn">
            <a href="../product.html">Browse Products</a>
          </div>
        </div>
      `;
    }
  }
  
  // Setup event listeners for Add to Cart buttons
  function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const productId = this.getAttribute('data-id');
        
        // Import addToCart function from products.js
        if (typeof addToCart === 'function') {
          addToCart(productId);
        } else {
          // Fallback if addToCart function is not available
          console.warn('addToCart function not found, using simplified version');
          addToCartSimple(productId);
        }
      });
    });
  }
  
  // Simplified addToCart function (fallback if the original is not available)
  function addToCartSimple(productId) {
    // Get wishlist items to find product details
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    const product = wishlistItems.find(item => item._id === productId);
    
    if (!product) {
      console.error('Product not found in wishlist items');
      return;
    }
    
    // Get existing cart from localStorage or create empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === productId);
    
    if (existingProductIndex > -1) {
      // Product exists, increase quantity
      cart[existingProductIndex].quantity += 1;
    } else {
      // Product doesn't exist, add new item
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.profilePhoto,
        quantity: 1
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
  }
  
  // Show notification
  function showNotification(message) {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
      
      // Add CSS for notification container if not already added
      if (!document.querySelector('style#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }
          .notification {
            background-color: #333;
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 5px;
            opacity: 0;
            transform: translateX(50px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          .notification.show {
            opacity: 1;
            transform: translateX(0);
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  // Show login notification for non-logged-in users
  function showLoginNotification() {
    showNotification('Please log in to add items to your wishlist');
  }
  
  // Handle not logged in state
  function handleNotLoggedIn() {
    // Show appropriate UI for logged out users
    if (window.location.pathname.includes('wishlist.html')) {
      const container = document.querySelector('.product-container');
      if (container) {
        container.innerHTML = `
          <div class="login-required">
            <h3>Please log in to view your wishlist</h3>
            <div class="btn">
              <a href="../form/sign_in.html">Sign In</a>
            </div>
          </div>
        `;
      }
    }
    
    // Add click handlers to wishlist icons that prompt for login
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    wishlistIcons.forEach(icon => {
      icon.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginNotification();
      });
    });
  }
  
  // Helper function to get cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }