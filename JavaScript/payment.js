// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    setupStripeCheckout();
});

// Load order summary from localStorage
function loadOrderSummary() {
    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Get order summary
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || {
        subtotal: 0,
        shipping: 0,
        total: 0
    };
    
    // Get shipping info
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo')) || {};
    
    // Display cart items
    const summaryItemsContainer = document.querySelector('.summary-items');
    let itemsHTML = '';
    
    cart.forEach(item => {
        itemsHTML += `
            <div class="summary-item">
                <img src="${item.image.startsWith('http') ? item.image : (item.image.startsWith('../') ? item.image : '../' + item.image)}" alt="${item.name}">
                <div class="details">
                    <h3>${item.name}</h3>
                    <p>Qty: ${item.quantity}</p>
                </div>
                <p class="price">Rs.${item.price * item.quantity}</p>
            </div>
        `;
    });
    
    summaryItemsContainer.innerHTML = itemsHTML;
    
    // Display totals
    const summaryTotalsContainer = document.querySelector('.summary-totals');
    summaryTotalsContainer.innerHTML = `
        <p><strong>Subtotal:</strong> Rs.${orderSummary.subtotal}</p>
        <p><strong>Shipping:</strong> Rs.${orderSummary.shipping}</p>
        <p class="total"><strong>Total:</strong> Rs.${orderSummary.total}</p>
    `;
}

// Set up Stripe checkout
function setupStripeCheckout() {
    const stripe = Stripe('pk_test_51R2BYc4K8gM188HqPmHQd18HX90jJg1DfOZikBDbLTZl26zLjNLo1i05hjLI696KW1jisO8RNKqGAtN8CUoAYPjs00MXpTtyQw'); // Replace with your actual publishable key
    const checkoutButton = document.getElementById('checkout-button');
    
    checkoutButton.addEventListener('click', async function() {
        try {
            // Get user token
            const accessToken = localStorage.getItem('accessToken');
            
            if (!accessToken) {
                alert('Please log in to complete your purchase.');
                window.location.href = '../form/sign_in.html';
                return;
            }
            
            // Prepare order data
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || {};
            const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo')) || {};
            
            // Create checkout session
            const response = await fetch('http://localhost:5020/api/payment/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    cart,
                    orderSummary,
                    shippingInfo
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }
            
            const session = await response.json();
            console.log('Checkout session created with ID:', session.id);
            
            // Redirect to Stripe checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing your payment. Please try again.');
        }
    });
}