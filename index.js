
const firstName = localStorage.getItem("firstName");

if (!firstName) {
    window.location.href = "Mini_Shopee.html";
}

const categoryButton = document.getElementById("category-button");
const categoryMenu = document.getElementById("category-menu");

categoryButton.addEventListener("click", () => {
    categoryMenu.classList.toggle("active");
});

const userName = document.getElementById("user-name");
userName.textContent = firstName;
const cartButton = document.getElementById("cart-button");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartBadge = document.getElementById("cart-badge");
const cartItems = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const logoutButton = document.getElementById("logout-button");

function getCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existingProduct = cart.find(
        (item) => item.id === product.id
    );
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
}

function renderCart() {
    const cart = getCart();
    cartItems.innerHTML = "";
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p class="empty-cart">
                Keranjang masih kosong.
            </p>
        `;
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
            <img
                src="${item.thumbnail}"
                alt="${item.title}"
            >
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>
                    ${item.quantity} × $${item.price.toFixed(2)}
                </p>
                <p>
                    Total: $${(item.price * item.quantity).toFixed(2)}
                </p>
            </div>
            <button
                class="remove-cart-button"
                data-id="${item.id}"
            >
                ✕
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    cartBadge.textContent = totalQuantity;
    cartTotalPrice.textContent =
        `$${totalPrice.toFixed(2)}`;
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(
        (item) => item.id !== productId
    );
    saveCart(updatedCart);
    renderCart();
}

cartItems.addEventListener("click", (event) => {
    const removeButton =
        event.target.closest(".remove-cart-button");
    if (!removeButton) return;
    const productId =
        Number(removeButton.dataset.id);
    removeFromCart(productId);
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


logoutButton.addEventListener("click", () => {
    localStorage.removeItem("firstName");
    localStorage.removeItem("cart");
    window.location.href = "Mini_Shopee.html";
});

renderCart();