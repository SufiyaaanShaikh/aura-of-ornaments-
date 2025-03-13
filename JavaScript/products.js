// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", init);

// Main initialization function
function init() {
  const productContainer = document.querySelector(".product-container");

  // ✅ Check if the element exists before running the logic
  if (!productContainer) return;
  fetchProducts();
  setupEventListeners();
  updateCartCount();
}

// Global products array to store fetched data
let allProducts = [];

// Fetch products from the API
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:5020/api/product/");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Store products in global variable
    allProducts = data.data || [];

    const path = window.location.pathname;
    if (path.includes("index.html") || path === "/") {
      displayProducts(allProducts.slice(0, 5)); // Display only 5 products
    } else if (path.includes("product.html")) {
      displayProducts(allProducts); // Display all products
    }
    console.log("Products loaded successfully");
  } catch (error) {
    console.error("Error fetching products:", error);
    document.querySelector(".product-container").innerHTML = `
      <div class="error-message">
        <p>Failed to load products. Please try again later.</p>
      </div>
    `;
  }
}

// Display products in the product container
// In your displayProducts function in products.js, update the product card creation:

function displayProducts(products) {
  const productContainer = document.querySelector(".product-container");

  // Clear existing content but keep the structure
  productContainer.innerHTML = "";

  // Check if products array is empty
  if (!products || products.length === 0) {
    productContainer.innerHTML = `
      <div class="no-products">
        <p>No products found. Try different filters.</p>
      </div>
    `;
    return;
  }

  // Loop through products and create HTML for each
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-cards";
    productCard.setAttribute("data-id", product._id); // Add data-id to the product card

    // Get wishlist status from local storage
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItemIds')) || [];
    const isInWishlist = wishlistItems.includes(product._id);
    
    // Format price with Rs. prefix
    const formattedPrice = `Rs.${product.price}`;

    // Create product card HTML with conditional wishlist icon
    productCard.innerHTML = `
      <div class="product-img">
        <span class="wishlist-icon">
          <img src="${isInWishlist ? 'images/red-heart.svg' : 'images/wishlist.svg'}" alt="Wishlist Icon" class="wishlist-img">
        </span>
        <img src="${product.profilePhoto || "images/product1.jpg"}" alt="${product.name}" class="product-image">
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

    // Append to container
    productContainer.appendChild(productCard);

    // Add click event listener to the product image
    const productImage = productCard.querySelector(".product-image");
    productImage.addEventListener("click", () => {
      window.location.href = `../allProductDetails/productDetail.html?id=${product._id}`;
    });
  });

  // Add event listeners to all "Add to cart" buttons
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const productId = this.getAttribute("data-id");
      addToCart(productId);
    });
  });
  
  // Initialize wishlist functionality
  if (typeof setupWishlistButtons === 'function') {
    setupWishlistButtons();
  }
}

// Cart Functionality

function addToCart(productId) {
  // Find the product in our products array
  const product = allProducts.find((p) => p._id === productId);

  if (!product) {
    console.error("Product not found");
    return;
  }

  // Get existing cart from localStorage or create an empty array
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if the product already exists in the cart
  const existingProduct = cart.find((item) => item.id === productId);

  if (existingProduct) {
    // Prevent adding more if the quantity is already 10
    if (existingProduct.quantity >= 10) {
      showNotification("Maximum quantity per item is 10!");
      return; // Stop further execution
    }

    // Increase quantity only if it's below the limit
    existingProduct.quantity += 1;
  } else {
    // Add new item with quantity 1 if not in the cart
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.profilePhoto, // Store the full Cloudinary URL
      quantity: 1,
    });
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart count in UI
  updateCartCount();

  // Show notification
  showNotification(`${product.name} added to cart!`);
}


// Update the cart count in the header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Create or update cart count element
  let cartCountElement = document.querySelector(".cart-count");

  if (!cartCountElement) {
    cartCountElement = document.createElement("span");
    cartCountElement.className = "cart-count";

    // Find the cart icon in header
    const cartIcon = document.querySelector('.icons a[href*="cart.html"]');
    if (cartIcon) {
      cartIcon.appendChild(cartCountElement);
    }
  }

  // Update the count
  cartCountElement.textContent = totalItems;

  // Hide the count if zero
  if (totalItems === 0) {
    cartCountElement.style.display = "none";
  } else {
    cartCountElement.style.display = "block";
  }
}

// Show notification when item is added to cart
function showNotification(message) {
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector(".notification-container");

  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.className = "notification-container";
    document.body.appendChild(notificationContainer);

    // Add CSS for notification container
    const style = document.createElement("style");
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

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  // Add to container
  notificationContainer.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Setup event listeners for filtering and search
function setupEventListeners() {
  // Category filter
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  categoryRadios.forEach((radio) => {
    radio.addEventListener("change", filterProducts);
  });

  // Price filter
  const priceRadios = document.querySelectorAll('input[name="price"]');
  priceRadios.forEach((radio) => {
    radio.addEventListener("change", filterProducts);
  });

  // Color filter
  const colorRadios = document.querySelectorAll('input[name="color"]');
  colorRadios.forEach((radio) => {
    radio.addEventListener("change", filterProducts);
  });

  // Search functionality
  const searchInput = document.querySelector(".main-search input");
  const searchButton = document.querySelector(".main-search button");

  if (searchButton) {
    searchButton.addEventListener("click", () => {
      performSearch(searchInput.value);
    });
  }

  // Search on Enter key
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch(searchInput.value);
      }
    });
  }
}

// Filter products based on selected criteria
function filterProducts() {
  let filteredProducts = [...allProducts];

  // Get selected category
  const selectedCategory = document.querySelector(
    'input[name="category"]:checked'
  );
  if (selectedCategory && selectedCategory.id !== "optionAll") {
    const categoryName =
      selectedCategory.nextElementSibling.nextElementSibling.textContent.trim();
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    );
  }

  // Get selected price range
  const selectedPrice = document.querySelector('input[name="price"]:checked');
  if (selectedPrice) {
    const priceId = selectedPrice.id;

    // Filter by price range
    if (priceId === "price1") {
      filteredProducts = filteredProducts.filter(
        (product) => product.price < 500
      );
    } else if (priceId === "price2") {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= 500 && product.price < 800
      );
    } else if (priceId === "price3") {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= 800 && product.price <= 1000
      );
    } else if (priceId === "price4") {
      filteredProducts = filteredProducts.filter(
        (product) => product.price > 1000
      );
    }
  }

  // Display filtered products
  displayProducts(filteredProducts);
}

// Search products by name
function performSearch(query) {
  if (!query.trim()) {
    // If search is empty, show all products
    displayProducts(allProducts);
    return;
  }

  // Filter products by name match
  const searchResults = allProducts.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  // Display search results
  displayProducts(searchResults);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", init);