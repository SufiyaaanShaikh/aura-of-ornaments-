// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    setupCartEventListeners();
  });
  
  function displayCartItems() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-container');
    
    // If cart is empty, show message
    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <h1>Shopping Cart</h1>
        <div class="empty-cart">
          <p>Your cart is empty.</p>
          <div class="checkout-btn">
            <a href="../product.html">Continue Shopping</a>
          </div>
        </div>
      `;
      return;
    }
    
    // Start with the heading
    let cartHTML = `<h1>Shopping Cart</h1>`;
    
    // Add each cart item
    cart.forEach((item, index) => {
      const totalPrice = item.price * item.quantity;
      
      cartHTML += `
        <div class="cart-item" data-id="${item.id}">
        <img src="${item.image.startsWith('http') ? item.image : (item.image.startsWith('../') ? item.image : '../' + item.image)}" alt="${item.name}">
          <div class="item-details">
            <h3>${item.name}</h3>
            <h5>Price: Rs.${item.price}</h5>
          </div>
          <div class="quantity-container">
            <div class="quantity-box">
              <button class="decrease">-</button>
              <input type="text" class="quantity" value="${item.quantity}" readonly>
              <button class="increase">+</button>
            </div>
          </div>
          <button class="remove-btn">Remove</button>
        </div>
      `;
    });
    
    // Add checkout button
    cartHTML += `
      <div class="checkout-btn">
        <a href="../userAccount/shipping.html">Proceed to Checkout</a>
      </div>
    `;
    
    // Update the cart container
    cartContainer.innerHTML = cartHTML;
  }
  
  function setupCartEventListeners() {
    // Event delegation for cart item interactions
    document.querySelector('.cart-container').addEventListener('click', function(e) {
      // Increase quantity
      if (e.target.classList.contains('increase')) {
        const cartItem = e.target.closest('.cart-item');
        const itemId = cartItem.getAttribute('data-id');
        updateQuantity(itemId, 1);
      }
      
      // Decrease quantity
      if (e.target.classList.contains('decrease')) {
        const cartItem = e.target.closest('.cart-item');
        const itemId = cartItem.getAttribute('data-id');
        updateQuantity(itemId, -1);
      }
      
      // Remove item
      if (e.target.classList.contains('remove-btn')) {
        const cartItem = e.target.closest('.cart-item');
        const itemId = cartItem.getAttribute('data-id');
        removeCartItem(itemId);
      }
    });
  }
  
  function updateQuantity(itemId, change) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      // Update quantity
      cart[itemIndex].quantity += change;
      
      // Remove item if quantity is 0
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
      
      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Refresh cart display
      displayCartItems();
    }
  }
  
  function removeCartItem(itemId) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Remove the item
    cart = cart.filter(item => item.id !== itemId);
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Refresh cart display
    displayCartItems();
  }