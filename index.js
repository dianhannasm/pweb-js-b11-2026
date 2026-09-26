// ==========================================
// 1. AUTHENTICATION & ELEMENT INITIALIZATION
// ==========================================
const firstName = localStorage.getItem("firstName");

if (!firstName) {
    window.location.href = "Mini_Shopee.html";
}

const userName = document.getElementById("user-name");
if (userName) userName.textContent = firstName;

// Dropdown Kategori
const categoryButton = document.getElementById("category-button");
const categoryMenu = document.getElementById("category-menu");
const categoryMenuLinks = document.querySelectorAll("#category-menu a");

// Cart Elements
const cartButton = document.getElementById("cart-button");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartBadge = document.getElementById("cart-badge");
const cartItems = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const logoutButton = document.getElementById("logout-button");

// Catalogue, Search & Sort
const productList = document.getElementById("product-list");
const loadMoreButton = document.getElementById("load-more-button");
const searchInput = document.getElementById("search-input");
const sortFilter = document.getElementById("sort-filter");
const errorMessage = document.getElementById("error-message");

// Modal Elements
const productModal = document.getElementById("product-modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");


// ==========================================
// 2. TOGGLE DROPDOWN (Pencegah Tumpuk)
// ==========================================
if (categoryButton && categoryMenu) {
    categoryButton.addEventListener("click", (e) => {
        e.stopPropagation();
        categoryMenu.classList.toggle("active");
    });
}

if (sortFilter) {
    sortFilter.addEventListener("click", (e) => {
        e.stopPropagation();
        // Tutup menu Kategori saat Sort Filter diklik
        if (categoryMenu) categoryMenu.classList.remove("active");
    });
}

// Tutup menu saat klik sembarang di luar dropdown
document.addEventListener("click", (e) => {
    if (categoryMenu && !e.target.closest(".category-dropdown")) {
        categoryMenu.classList.remove("active");
    }
});


// ==========================================
// 3. CART FUNCTIONS (LOCAL STORAGE)
// ==========================================
function getCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function showCartToast() {
    const toast = document.getElementById("cart-toast");

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

function addToCart(product) {
    const cart = getCart();
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }

    saveCart(cart);
    renderCart();
    showCartToast();
}

function decreaseQuantity(productId) {
    const cart = getCart();
    const product = cart.find((item) => item.id === productId);

    if (!product) return;

    product.quantity -= 1;

    if (product.quantity <= 0) {
        const updatedCart = cart.filter((item) => item.id !== productId);
        saveCart(updatedCart);
    } else {
        saveCart(cart);
    }

    renderCart();
}

function increaseQuantity(productId) {
    const cart = getCart();
    const product = cart.find((item) => item.id === productId);

    if (!product) return;

    product.quantity += 1;

    saveCart(cart);
    renderCart();
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter((item) => item.id !== productId);
    saveCart(updatedCart);
    renderCart();
}

function renderCart() {
    const cart = getCart();
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">Keranjang masih kosong.</p>`;
        cartBadge.textContent = "0";
        cartTotalPrice.textContent = "$0.00";
        return;
    }

    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>$${item.price.toFixed(2)} / item</p>
                <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
                <div class="quantity-control">
                    <button class="quantity-button decrease-button" data-id="${item.id}">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-button increase-button" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-cart-button" data-id="${item.id}">✕</button>
        `;
        cartItems.appendChild(cartItem);
    });

    cartBadge.textContent = totalQuantity;
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
}


// ==========================================
// 4. STATE MANAGEMENT & FILTER LOGIC
// ==========================================
let allProducts = [];
let filteredProducts = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 8;
let selectedCategory = "all"; // State kategori aktif


// ==========================================
// 5. RENDER PRODUK & LOAD MORE
// ==========================================
function renderProductCards(productsToRender, isAppend = false) {
    if (!isAppend) {
        productList.innerHTML = "";
    }

    if (productsToRender.length === 0 && !isAppend) {
        productList.innerHTML = `<p class="empty-cart" style="grid-column: 1/-1;">Produk tidak ditemukan.</p>`;
        return;
    }

    productsToRender.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-img" style="cursor:pointer;">
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 style="cursor:pointer;">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-rating">★ ${product.rating.toFixed(1)}</p>
                <p class="product-discount">Diskon: ${product.discountPercentage}%</p>
                <button class="add-cart-button" data-id="${product.id}">+ Keranjang</button>
            </div>
        `;

        card.querySelector(".product-img").addEventListener("click", () => showProductDetail(product));
        card.querySelector("h3").addEventListener("click", () => showProductDetail(product));
        card.querySelector(".add-cart-button").addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(product);
        });

        productList.appendChild(card);
    });
}

function loadMoreProducts() {
    const nextBatch = filteredProducts.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);
    renderProductCards(nextBatch, true);

    displayedCount += nextBatch.length;

    if (loadMoreButton) {
        if (displayedCount >= filteredProducts.length) {
            loadMoreButton.classList.add("hidden");
        } else {
            loadMoreButton.classList.remove("hidden");
        }
    }
}

function resetAndRenderProducts() {
    displayedCount = 0;
    productList.innerHTML = ""; // Kosongkan grid dulu, baru render ulang dari hasil filter/sort terbaru
    loadMoreProducts();
}


// ==========================================
// 6. DEBOUNCE (CLOSURE)
// ==========================================
// debounce() mengembalikan fungsi baru yang "membungkus" fungsi asli (func).
// Variabel timeoutId disimpan lewat closure, jadi tetap "diingat" di antara
// pemanggilan-pemanggilan berikutnya, dan dipakai untuk membatalkan
// (clearTimeout) timer sebelumnya setiap kali user mengetik lagi.
function debounce(func, delay = 400) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


// ==========================================
// 7. FETCH API & FILTER HANDLING
// ==========================================
async function fetchProducts() {
    try {
        if (errorMessage) errorMessage.classList.add("hidden");

        const response = await fetch("https://dummyjson.com/products?limit=100");
        if (!response.ok) throw new Error("Gagal mengambil data dari API.");

        const data = await response.json();
        allProducts = data.products;
        filteredProducts = [...allProducts];

        resetAndRenderProducts();
    } catch (error) {
        console.error("Fetch Error:", error);
        if (errorMessage) {
            errorMessage.textContent = "Gagal memuat produk. Silakan coba lagi.";
            errorMessage.classList.remove("hidden");
        }
    }
}

function applyFilters() {
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedSort = sortFilter ? sortFilter.value : "default";

    // 1. Filter Search (nama ATAU kategori) & Kategori aktif dari dropdown
    filteredProducts = allProducts.filter((product) => {
        const matchesSearch =
            product.title.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue);
        const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    // 2. Sortir Produk
    if (selectedSort === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "name-asc") {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === "name-desc") {
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (selectedSort === "rating-desc") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "rating-asc") {
        filteredProducts.sort((a, b) => a.rating - b.rating);
    }

    // Reset pagination dan tampilkan produk yang sudah di-filter
    resetAndRenderProducts();
}


// ==========================================
// 8. MODAL DETAIL PRODUK
// ==========================================
function showProductDetail(product) {
    if (!productModal || !modalBody) return;

    modalBody.innerHTML = `
        <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
            <img src="${product.thumbnail}" alt="${product.title}" style="max-width: 200px; width: 100%; border-radius: 8px;">
            <div style="flex: 1;">
                <p style="text-transform: uppercase; color: var(--pink-dark); font-size: 12px; font-weight: 700;">${product.category}</p>
                <h2 style="margin: 5px 0;">${product.title}</h2>
                <p style="color: #666; font-size: 14px;">${product.description}</p>
                <h3 style="color: var(--text); font-size: 20px; margin: 10px 0;">$${product.price.toFixed(2)}</h3>
                <p style="font-size: 13px; color: #777;">Rating: ★ ${product.rating} | Stok: ${product.stock}</p>
                <button id="modal-add-btn" class="add-cart-button" style="margin-top: 10px;">+ Tambah ke Keranjang</button>
            </div>
        </div>
    `;

    document.getElementById("modal-add-btn").addEventListener("click", () => {
        addToCart(product);
        closeProductModal();
    });

    productModal.classList.remove("hidden");
}

function closeProductModal() {
    if (productModal) productModal.classList.add("hidden");
}


// ==========================================
// 9. EVENT LISTENERS
// ==========================================

// Klik link kategori di dropdown Navbar
categoryMenuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        selectedCategory = link.getAttribute("data-category") || "all";
        if (categoryMenu) categoryMenu.classList.remove("active");
        applyFilters();
    });
});

// Cart Event
cartItems.addEventListener("click", (event) => {
    const increaseButton = event.target.closest(".increase-button");
    const decreaseButton = event.target.closest(".decrease-button");
    const removeButton = event.target.closest(".remove-cart-button");

    if (increaseButton) {
        increaseQuantity(Number(increaseButton.dataset.id));
        return;
    }

    if (decreaseButton) {
        decreaseQuantity(Number(decreaseButton.dataset.id));
        return;
    }

    if (removeButton) {
        removeFromCart(Number(removeButton.dataset.id));
    }
});

cartButton.addEventListener("click", () => {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
});

function closeCartPanel() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
}

closeCart.addEventListener("click", closeCartPanel);
cartOverlay.addEventListener("click", closeCartPanel);

// Logout Event
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("firstName");
    localStorage.removeItem("cart");
    window.location.href = "Mini_Shopee.html";
});

// Controls Event
const debouncedApplyFilters = debounce(applyFilters, 400);

if (loadMoreButton) loadMoreButton.addEventListener("click", loadMoreProducts);
if (searchInput) searchInput.addEventListener("input", debouncedApplyFilters);
if (sortFilter) sortFilter.addEventListener("change", applyFilters);
if (closeModal) closeModal.addEventListener("click", closeProductModal);

if (productModal) {
    productModal.addEventListener("click", (e) => {
        if (e.target === productModal) closeProductModal();
    });
}


// ==========================================
// 10. INITIALIZATION
// ==========================================
fetchProducts();
renderCart();
