const PRODUCTS_URL = "http://localhost:3000/products";
const ORDERS_URL = "http://localhost:3000/orders";

const adminTableBody = document.getElementById("admin-table-body");
const adminProductForm = document.getElementById("admin-product-form");
const submitFormBtn = document.getElementById("submit-form-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formTitle = document.getElementById("form-title");

const productIdInput = document.getElementById("product-id");
const prodNameInput = document.getElementById("prod-name");
const prodCategoryInput = document.getElementById("prod-category");
const prodPriceInput = document.getElementById("prod-price");

const statTotalItems = document.getElementById("stat-total-items");
const statTotalOrders = document.getElementById("stat-total-orders");
const statTotalSales = document.getElementById("stat-total-sales");

const totalProductsCard = document.getElementById("stat-total-items") ? document.getElementById("stat-total-items").closest('.card') : null;
const countCakesEl = document.getElementById("countCakes");
const countChocolatesEl = document.getElementById("countChocolates");
const countCookiesEl = document.getElementById("countCookies");
const countBreadsEl = document.getElementById("countBreads");

let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    loadAdminDashboard();
    
    if (totalProductsCard) {
        totalProductsCard.style.cursor = "pointer"; 
        totalProductsCard.addEventListener("click", () => {
            renderAdminTable(allProducts);
        });
    }
    
    setupCategoryFilters();
});

async function loadAdminDashboard() {
    try {
        const prodResponse = await fetch(PRODUCTS_URL);
        if (!prodResponse.ok) throw new Error("Failed to load products");
        allProducts = await prodResponse.json(); 

        const orderResponse = await fetch(ORDERS_URL);
        if (!orderResponse.ok) throw new Error("Failed to load orders");
        const orders = await orderResponse.json();

        calculateStats(allProducts, orders);
        renderAdminTable(allProducts);

    } catch (error) {
        console.error(error);
    }
}

function calculateStats(products, orders) {
    if (statTotalItems) statTotalItems.innerText = products.length;
    if (statTotalOrders) statTotalOrders.innerText = orders.length;
    
    let revenue = orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
    if (statTotalSales) statTotalSales.innerText = "Rs. " + revenue;

    const cakesCount = products.filter(p => p.category && p.category.toLowerCase() === "cakes").length;
    const chocolatesCount = products.filter(p => p.category && p.category.toLowerCase() === "chocolates").length;
    const cookiesCount = products.filter(p => p.category && p.category.toLowerCase() === "cookies").length;
    const breadsCount = products.filter(p => p.category && p.category.toLowerCase() === "breads").length;

    if (countCakesEl) countCakesEl.innerText = cakesCount;
    if (countChocolatesEl) countChocolatesEl.innerText = chocolatesCount;
    if (countCookiesEl) countCookiesEl.innerText = cookiesCount;
    if (countBreadsEl) countBreadsEl.innerText = breadsCount;
    
    const countAllEl = document.getElementById("countAll");
    if (countAllEl) countAllEl.innerText = products.length;
}

function setupCategoryFilters() {
    const categoryBoxes = document.querySelectorAll(".category-box, [data-category]");
    categoryBoxes.forEach(box => {
        box.style.cursor = "pointer";
        box.addEventListener("click", () => {
            const category = box.getAttribute("data-category") || box.id.replace("box", "").toLowerCase();
            
            if (!category || category === "all") {
                renderAdminTable(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
                renderAdminTable(filtered);
            }
        });
    });
}

function renderAdminTable(products) {
    adminTableBody.innerHTML = "";

    if (products.length === 0) {
        adminTableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No products found in inventory.</td></tr>";
        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${product.id}</strong></td>
            <td>${product.name}</td>
            <td><span class="admin-badge" style="background:#7f5539;">${product.category ? product.category.toUpperCase() : ""}</span></td>
            <td>Rs. ${product.price}</td>
            <td>
                <button class="action-btn edit-btn" onclick="setupEditMode('${product.id}', '${product.name.replace(/'/g, "\\'")}', '${product.category}', ${product.price})"> Edit</button>
                <button class="action-btn del-btn" onclick="deleteProduct('${product.id}')"> Delete</button>
            </td>
        `;
        adminTableBody.appendChild(row);
    });
}

adminProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = productIdInput.value; 
    const productData = {
        name: prodNameInput.value,
        category: prodCategoryInput.value.toLowerCase(), 
        price: Number(prodPriceInput.value)
    };

    try {
        if (id) {
            const finalId = isNaN(id) ? id : Number(id);
            const response = await fetch(`${PRODUCTS_URL}/${finalId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error("Update failed");
            alert("Product updated successfully!");
        } else {
            const response = await fetch(PRODUCTS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error("Insert failed");
            alert("New product added to inventory!");
        }

        clearForm();
        loadAdminDashboard();

    } catch (error) {
        alert("Action failed: " + error.message);
    }
});

function setupEditMode(id, name, category, price) {
    formTitle.innerText = "Edit Bakery Product (#" + id + ")";
    submitFormBtn.innerText = " Save Changes";
    cancelEditBtn.style.display = "inline-block";

    productIdInput.value = id;
    prodNameInput.value = name;
    prodCategoryInput.value = category.toLowerCase(); 
    prodPriceInput.value = price;
    
    adminProductForm.scrollIntoView({ behavior: 'smooth' });
}

cancelEditBtn.addEventListener("click", clearForm);

function clearForm() {
    formTitle.innerText = "Add New Bakery Product";
    submitFormBtn.innerText = " Save Product";
    cancelEditBtn.style.display = "none";
    productIdInput.value = "";
    adminProductForm.reset();
}

async function deleteProduct(id) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    
    if (confirmDelete) {
        try {
            const finalId = isNaN(id) ? id : Number(id);
            const response = await fetch(`${PRODUCTS_URL}/${finalId}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Delete failed");

            alert("Product successfully deleted.");
            loadAdminDashboard(); 

        } catch (error) {
            alert("Could not delete item: " + error.message);
        }
    }
}