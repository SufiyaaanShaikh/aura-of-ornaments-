// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items and user data
    displayOrderSummary();
    loadUserData();
    setupFormValidation();
  });
  
  // Display order summary from cart items
  function displayOrderSummary() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summaryContainer = document.querySelector('.summary-container');
    
    // If cart is empty, redirect back to cart page
    if (cart.length === 0) {
      window.location.href = '../userAccount/cart.html';
      return;
    }
    
    // Start with the heading
    let summaryHTML = `<h3>Order Summary</h3>`;
    
    // Calculate subtotal
    let subtotal = 0;
    
    // Add each cart item
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      summaryHTML += `
        <div class="summary-item">
          <img src="${item.image.startsWith('http') ? item.image : (item.image.startsWith('../') ? item.image : '../' + item.image)}" alt="${item.name}">
          <div class="details">
            <h3>${item.name}</h3>
            <p>Qty: ${item.quantity}</p>
          </div>
          <p class="price">Rs.${itemTotal}</p>
        </div>
      `;
    });
    
    // Calculate shipping and total
    const shipping = Math.round(subtotal * 0.02); // 2% shipping charge
    const total = subtotal + shipping;
    
    // Add totals section
    summaryHTML += `
      <div class="total-price">
        <p><strong>Subtotal:</strong> Rs.${subtotal}</p>
        <p><strong>Shipping (2%):</strong> Rs.${shipping}</p>
        <p><strong>Total:</strong> Rs.${total}</p>
      </div>
    `;
    
    // Update the summary container
    summaryContainer.innerHTML = summaryHTML;
    
    // Store order summary in localStorage for payment page
    localStorage.setItem('orderSummary', JSON.stringify({
      subtotal,
      shipping,
      total
    }));
  }
  
  // Load user data if logged in
  async function loadUserData() {
    // Check if user is logged in by checking for accessToken
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.log('User not logged in');
      return;
    }
    
    try {
      // Fetch user data from backend
      const response = await fetch('http://localhost:5020/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      
      // Fill form with user data
      if (userData && userData.data) {
        const user = userData.data;
        
        // Fill basic info
        document.getElementById('name').value = user.name || '';
        
        // Fill address info if exists
        if (user.address) {
          document.getElementById('address').value = user.address.street || '';
          document.getElementById('city').value = user.address.city || '';
          document.getElementById('state').value = user.address.state || '';
          document.getElementById('zip').value = user.address.zip || '';
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  
  // Helper function to get cookie value
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  // Set up form validation
  function setupFormValidation() {
    const form = document.querySelector('#shipping-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Check if all fields are filled
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const address = document.getElementById('address').value;
      const city = document.getElementById('city').value;
      const state = document.getElementById('state').value;
      const zip = document.getElementById('zip').value;
      
      if (!name || !phone || !address || !city || !state || !zip) {
        alert('Please fill all fields to continue.');
        return;
      }
      
      // Store shipping info in localStorage
      const shippingInfo = {
        name,
        phone,
        address,
        city,
        state,
        zip
      };
      
      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
      
      // Redirect to payment page
      window.location.href = '../userAccount/payment.html';
    });
  }