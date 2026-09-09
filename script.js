```javascript
// ===============================
// NP HOME NEEDS
// Supabase + Cart + WhatsApp
// ===============================

const SUPABASE_URL = "https://fpbmoddxkiykuhdxclmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// Elements
// ===============================

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");

const cartItems = document.getElementById("items");
const cartTotal = document.getElementById("total");

let products = [];
let cart = [];

// ===============================
// Category Icons
// ===============================

function getCategoryIcon(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("vegetable") || value.includes("koor")) return "🥕";
  if (value.includes("fruit") || value.includes("pandu")) return "🍎";
  if (value.includes("fancy")) return "🎀";
  if (value.includes("gift")) return "🎁";
  if (value.includes("kirana") || value.includes("grocery")) return "🛒";

  return "🛍️";
}

// ===============================
// Load Products from Supabase
// ===============================

async function loadProducts() {
  if (!grid) return;

  grid.innerHTML = `
    <div style="padding:20px;text-align:center;">
      Products loading...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase products error:", error);

    grid.innerHTML = `
      <div style="padding:20px;text-align:center;">
        <h3>Products load కాలేదు</h3>
        <p>Please refresh the page.</p>
      </div>
    `;

    return;
  }

  products = data || [];

  renderProducts(products);
}

// ===============================
// Render Products
// ===============================

function renderProducts(list) {
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div style="padding:20px;text-align:center;">
        <h3>No products found</h3>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(product => {
    const price = Number(product.price || 0);
    const offerPrice =
      product.offer_price !== null &&
      product.offer_price !== undefined &&
      Number(product.offer_price) > 0
        ? Number(product.offer_price)
        : price;

    const hasOffer = offerPrice < price;

    const image = product.image_url
      ? `<img src="${escapeHtml(product.image_url)}"
              alt="${escapeHtml(product.name)}"
              onerror="this.style.display='none'">`
      : `<div style="font-size:50px;">${getCategoryIcon(product.category)}</div>`;

    return `
      <div class="product-card">

        <div class="product-image">
          ${image}
        </div>

        <h3>${escapeHtml(product.name)}</h3>

        <p>${escapeHtml(product.category || "")}</p>

        <div class="price">
          ${
            hasOffer
              ? `<del>₹${price.toFixed(0)}</del>
                 <strong>₹${offerPrice.toFixed(0)}</strong>`
              : `<strong>₹${price.toFixed(0)}</strong>`
          }
        </div>

        <button onclick="addToCart('${product.id}')">
          Add to Cart
        </button>

      </div>
    `;
  }).join("");
}

// ===============================
// Search
// ===============================

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase().trim();

    const filtered = products.filter(product =>
      String(product.name || "").toLowerCase().includes(value) ||
      String(product.category || "").toLowerCase().includes(value)
    );

    renderProducts(filtered);
  });
}

// ===============================
// Category Filter
// ===============================

document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  const category = button.dataset.category;

  if (!category || category.toLowerCase() === "all") {
    renderProducts(products);
    return;
  }

  const filtered = products.filter(product => {
    const productCategory =
      String(product.category || "").toLowerCase();

    const selected =
      String(category || "").toLowerCase();

    return productCategory === selected ||
      productCategory.includes(selected) ||
      selected.includes(productCategory);
  });

  renderProducts(filtered);
});

// ===============================
// Add to Cart
// ===============================

function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return;

  const existing = cart.find(
    item => String(item.id) === String(id)
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      qty: 1
    });
  }

  renderCart();
}

// ===============================
// Change Quantity
// ===============================

function changeQty(id, amount) {
  const item = cart.find(
    product => String(product.id) === String(id)
  );

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(
      product => String(product.id) !== String(id)
    );
  }

  renderCart();
}

// ===============================
// Cart Total
// ===============================

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const price =
      item.offer_price !== null &&
      item.offer_price !== undefined &&
      Number(item.offer_price) > 0
        ? Number(item.offer_price)
        : Number(item.price || 0);

    return sum + price * item.qty;
  }, 0);
}

// ===============================
// Render Cart
// ===============================

function renderCart() {
  if (!cartItems || !cartTotal) return;

  if (!cart.length) {
    cartItems.innerHTML = `
      <p>Your cart is empty.</p>
    `;

    cartTotal.textContent = "₹0";
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const price =
      item.offer_price !== null &&
      item.offer_price !== undefined &&
      Number(item.offer_price) > 0
        ? Number(item.offer_price)
        : Number(item.price || 0);

    return `
      <div class="cart-item">

        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <br>
          ₹${price.toFixed(0)} × ${item.qty}
        </div>

        <div>
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>

      </div>
    `;
  }).join("");

  cartTotal.textContent =
    "₹" + getCartTotal().toFixed(0);
}

// ===============================
// Save Order to Supabase
// ===============================

async function saveOrderToSupabase(
  customerName,
  phone,
  address,
  total,
  productText
) {
  const { data, error } = await supabaseClient
    .from("customer_orders")
    .insert([
      {
        customer_name: customerName,
        phone: phone,
        address: address,
        total: total,
        status: "pending",
        products: productText
      }
    ])
    .select();

  if (error) {
    console.error("Order save error:", error);
    return {
      success: false,
      error
    };
  }

  return {
    success: true,
    data
  };
}

// ===============================
// Place Order
// ===============================

async function order() {
  if (!cart.length) {
    alert("Cart is empty.");
    return;
  }

  const total = getCartTotal();

  if (total < 200) {
    alert("Minimum order ₹200.");
    return;
  }

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");

  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const address = addressInput ? addressInput.value.trim() : "";

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  if (!phone) {
    alert("Please enter your phone number.");
    return;
  }

  if (!address) {
    alert("Please enter your address.");
    return;
  }

  const productText = cart.map(item => {
    const price =
      item.offer_price !== null &&
      item.offer_price !== undefined &&
      Number(item.offer_price) > 0
        ? Number(item.offer_price)
        : Number(item.price || 0);

    return `${item.name} x ${item.qty} = ₹${price * item.qty}`;
  }).join("\n");

  // Save order in Supabase
  const result = await saveOrderToSupabase(
    name,
    phone,
    address,
    total,
    productText
  );

  if (!result.success) {
    alert(
      "Order save కాలేదు. Please try again."
    );
    return;
  }

  // WhatsApp message
  const message = `
NP Home Needs Order

Name: ${name}
Phone: ${phone}
Address: ${address}

Products:
${productText}

Total: ₹${total.toFixed(0)}
`;

  // IMPORTANT:
  // Put your NP Home Needs WhatsApp number here.
  const whatsappNumber = "919392453626";

  const whatsappURL =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(whatsappURL, "_blank");

  alert("Order placed successfully!");

  cart = [];
  renderCart();
}

// ===============================
// Escape HTML
// ===============================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===============================
// Start
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
  renderCart();
});
```
      
