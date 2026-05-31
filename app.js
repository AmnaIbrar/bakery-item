const API_URL = "http://localhost:3000/products";

let cart = [];

const productsGrid = document.getElementById("products-grid");
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const categoryBoxes = document.querySelectorAll(".category-box");

const menuSection = document.getElementById("menu-section");
const checkoutSection = document.getElementById("checkout-section");
const checkoutForm = document.getElementById("checkout-form");

const cartToggleBtn = document.getElementById("cart-toggle-btn");
const cartContent = document.getElementById("cart-content");
const cartCount = document.getElementById("cart-count");
const goToCheckoutBtn = document.getElementById("go-to-checkout-btn");
const backToMenuBtn = document.getElementById("back-to-menu-btn");

async function displayProducts(categoryName) {
    try {
        productsGrid.innerHTML = "<p class='loading-text'>Loading premium products...</p>";
        
        const response = await fetch(`${API_URL}?category=${categoryName}`);
        
        if (!response.ok) {
            throw new Error("Server error, status code: " + response.status);
        }
        
        const filteredProducts = await response.json();
        productsGrid.innerHTML = ""; 
        
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = "<p>No items available in this category.</p>";
            return;
        }
        
        filteredProducts.forEach(product => {
            const itemCard = document.createElement("div");
            itemCard.className = "product-item-card";
            itemCard.innerHTML = `
                <h3>${product.name}</h3>
               <div class="product-meta-row">
                    <span>Rs. ${product.price}</span>
                  <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">+ Add</button>
                </div>
            `;
            productsGrid.appendChild(itemCard);
        });
    } catch (error) {
        productsGrid.innerHTML = "<p style='color:red; font-weight:bold;'>Error connecting to server. Please check if JSON Server is running.</p>";
    }
}

categoryBoxes.forEach(box => {
    box.addEventListener("click", (e) => {
        categoryBoxes.forEach(b => b.classList.remove("active"));
        const targetBox = e.currentTarget;
        targetBox.classList.add("active");
        
        const selectedCategory = targetBox.getAttribute("data-category");
        displayProducts(selectedCategory);
    });
});

cartToggleBtn.addEventListener("click", () => {
    cartContent.style.display = (cartContent.style.display === "none") ? "block" : "none";
});

goToCheckoutBtn.addEventListener("click", () => {
    menuSection.style.display = "none";
    checkoutSection.style.display = "block";
    cartContent.style.display = "none";
});

backToMenuBtn.addEventListener("click", () => {
    checkoutSection.style.display = "none";
    menuSection.style.display = "block";
});

function addToCart(id, name, price) {
    const cartItem = cart.find(item => item.id === id);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let count = cart.reduce((total, current) => total + current.quantity, 0);
    cartCount.innerText = count;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        totalPriceElement.innerText = "0";
        goToCheckoutBtn.style.display = "none";
        return;
    }

    let totalBill = 0;
    cart.forEach(item => {
        totalBill += item.price * item.quantity;
        const row = document.createElement("div");
        row.className = "cart-row";
        row.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <small>Rs. ${item.price} x ${item.quantity}</small>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        cartItemsContainer.appendChild(row);
    });

    totalPriceElement.innerText = totalBill;
    goToCheckoutBtn.style.display = "block";
}

checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    
    const orderData = {
        customerName: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        deliveryDate: document.getElementById("date").value,
        address: document.getElementById("address").value,
        items: cart, 
        totalAmount: document.getElementById("total-price").innerText,
        orderAt: new Date().toLocaleString() 
    };

    try {
        const response = await fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error("Failed to save order");
        }

        alert("🎉 Order Placed Successfully! Your data has been saved to the server database.");
        
        cart = [];
        updateCartUI();
        checkoutForm.reset();
        
        checkoutSection.style.display = "none";
        menuSection.style.display = "block";

    } catch (error) {
        alert("❌ Error: Could not save order to server. Make sure JSON Server is running.");
    }
});

displayProducts("cakes");