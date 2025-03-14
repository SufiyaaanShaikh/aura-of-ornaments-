document.addEventListener('DOMContentLoaded', function() {
    displayOrderDetails();
    clearCart();
});

function displayOrderDetails() {
    // Get order ID or session ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const sessionId = urlParams.get('session_id');
    
    // Get user token
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        displayErrorMessage('Please log in to view your order details.');
        return;
    }
    
    // If we have a session ID but no order ID, create the order directly
    if (sessionId && !orderId) {
        createOrderFromSession(sessionId, accessToken);
        return;
    }
    
    // If we have an order ID, fetch order details
    if (orderId) {
        fetchOrderDetails(orderId, accessToken);
    } else {
        displayErrorMessage();
    }
}

// Function to create order from session
function createOrderFromSession(sessionId, accessToken) {
    fetch(`http://localhost:5020/api/payment/create-order-from-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            sessionId: sessionId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.orderId) {
            // Redirect to the same page but with order ID
            window.location.href = `confirmation.html?order_id=${data.orderId}`;
        } else {
            displayErrorMessage();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage();
    });
}

// Function to fetch order details
function fetchOrderDetails(orderId, accessToken) {
    fetch(`http://localhost:5020/api/order/${orderId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.order) {
            displayOrderInfo(data.order);
            clearCart();
        } else {
            displayErrorMessage();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage();
    });
}
function displayOrderInfo(order) {
    const orderInfoContainer = document.getElementById('order-info');
    
    // Format date
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create HTML for order details
    let html = `
        <div class="order-info-item">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> Rs.${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>
        <div class="order-products">
            <h4>Products</h4>
    `;
    
    // Add products
    order.products.forEach(item => {
        html += `
            <div class="order-product">
                <p><strong>${item.product.name}</strong> x ${item.quantity}</p>
                <p>Rs.${item.product.price * item.quantity}</p>
            </div>
        `;
    });
    
    html += `</div>`;
    
    orderInfoContainer.innerHTML = html;
}

function displayErrorMessage(message = 'Unable to load order details.') {
    const orderInfoContainer = document.getElementById('order-info');
    orderInfoContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <p>Please check your order history or contact customer support.</p>
        </div>
    `;
}

function clearCart() {
    // Clear cart after successful order
    localStorage.removeItem('cart');
    localStorage.removeItem('orderSummary');
    localStorage.removeItem('shippingInfo');
}