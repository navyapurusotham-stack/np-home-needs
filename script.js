```javascript
// ==========================================
// NP HOME NEEDS - FINAL SUPABASE VERSION
// ==========================================

const SUPABASE_URL =
  "https://fpbmoddxkiykuhdxclmt.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

let supabaseClient = null;
let products = [];
let cart = [];
let cat = "All";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const cartItems = document.getElementById("items");
const cartTotal = document.getElementById("total");
const count = document.getElementById("count");

// ==========================================
// ERROR DISPLAY
// ==========================================

function showError(message) {
  if (!grid) return;

  grid.innerHTML = `
    <div style="
      padding:20px;
      margin:10px 0;
      border:1px solid #ddd;
      border-radius:12px;
      text-align:center;
    ">
      <h3>Products load కాలేదు</h3>
      <p>${escapeHtml(message)}</p>
      <button onclick="location.reload()">
        Refresh
      </button>
    </div>
  `;
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// CATEGORY ICON
// ==========================================

function getCategoryIcon(category) {
  const value = String(category || "").toLowerCase();

  if (
    value.includes("vegetable") ||
    value.includes("koor")
  ) return "🥕";

  if (
    value.includes("fruit") ||
    value.includes("pandu")
  ) return "🍎";

  if (value.includes("fancy")) return "🎀";

  if (value.includes("gift")) return "🎁";

  if (
    value.includes("kirana") ||
    value.includes("grocery")
  ) return "🛒";

  return "🛍️";
}

// ==========================================
// SUPABASE INITIALIZE
// ==========================================

function initializeSupabase() {

  try {

    if (!window.supabase) {
      throw new Error(
        "Supabase library load కాలేదు."
      );
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    loadProducts();

  } catch (error) {

    console.error(error);

    showError(
      error.message || "Supabase initialization error"
    );
  }
}

// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

  if (!grid) return;

  grid.innerHTML = `
    <div style="
      padding:20px;
      text-align:center;
    ">
      Products loading...
    </div>
  `;

  try {

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", {
          ascending: true
        });

    if (error) {
      console.error(error);

      showError(
        "Database error: " + error.message
      );

      return;
    }

    products = data || [];

    console.log(
      "NP Home Needs products:",
      products
    );

    render();

  } catch (error) {

    console.error(error);

    showError(
      error.message || "Products loading error"
    );
  }
}

// ==========================================
// RENDER
// ==========================================

function render() {

  if (!grid) return;

  const search =
    searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

  let filtered = products;

  if (cat !== "All") {

    filtered = filtered.filter(product => {

      const productCategory =
        String(
          product.category || ""
        ).toLowerCase();

      const selectedCategory =
        String(cat || "").toLowerCase();

      return (
        productCategory === selectedCategory ||
        productCategory.includes(selectedCategory) ||
        selectedCategory.includes(productCategory)
      );
    });
  }

  if (search) {

    filtered = filtered.filter(product => {

      const name =
        String(
          product.name || ""
        ).toLowerCase();

      const category =
        String(
          product.category || ""
        ).toLowerCase();

      return (
        name.includes(search) ||
        category.includes(search)
      );
    });
  }

  if (!filtered.length) {

    grid.innerHTML = `
      <div style="
        padding:20px;
        text-align:center;
      ">
        <h3>No products found</h3>
      </div>
    `;

    return;
  }

  grid.innerHTML = filtered.map(product => {

    const price =
      Number(product.price || 0);

    const offerPrice =
      product.offer_price !== null &&
      product.offer_price !== undefined &&
      Number(product.offer_price) > 0
        ? Number(product.offer_price)
        : price;

    const hasOffer =
      offerPrice < price;

    const image =
      product.image_url
        ? `
          <img
            src="${escapeHtml(product.image_url)}"
            alt="${escapeHtml(product.name)}"
            style="
              width:100%;
              max-height:180px;
              object-fit:contain;
            "
            onerror="this.style.display='none'"
          >
        `
        : `
          <div style="
            font-size:55px;
            padding:20px;
          ">
            ${getCategoryIcon(product.category)}
          </div>
        `;

    return `
      <div class="product-card">

        <div class="product-image">
          ${image}
        </div>

        <h3>
          ${escapeHtml(product.name)}
        </h3>

        <p>
          ${escapeHtml(product.category || "")}
        </p>

        <div class="price">

          ${
            hasOffer
              ? `
                <del>
                  ₹${price.toFixed(0)}
                </del>

                <strong>
                  ₹${offerPrice.toFixed(0)}
                </strong>
              `
              : `
                <strong>
                  ₹${price.toFixed(0)}
                </strong>
              `
          }

        </div>

        <button
          onclick="addToCart('${product.id}')"
        >
          Add to Cart
        </button>

      </div>
    `;

  }).join("");
}

// ==========================================
// CATEGORY BUTTON COMPATIBILITY
// ==========================================

function active(button) {

  document
    .querySelectorAll(".cats button")
    .forEach(btn =>
      btn.classList.remove("active")
    );

  if (button) {
    button.classList.add("active");
  }
}

// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    render
  );
}

// ==========================================
// ADD CART
// ==========================================

function addToCart(id) {

  const product =
    products.find(
      p => String(p.id) === String(id)
    );

  if (!product) return;

  const existing =
    cart.find(
      item =>
        String(item.id) === String(id)
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

// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQty(id, amount) {

  const item =
    cart.find(
      product =>
        String(product.id) === String(id)
    );

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {

    cart =
      cart.filter(
        product =>
          String(product.id) !== String(id)
      );
  }

  renderCart();
}

// ==========================================
// CART TOTAL
// ==========================================

function getPrice(item) {

  if (
    item.offer_price !== null &&
    item.offer_price !== undefined &&
    Number(item.offer_price) > 0
  ) {
    return Number(item.offer_price);
  }

  return Number(item.price || 0);
}

function getCartTotal() {

  return cart.reduce(
    (sum, item) =>
      sum + getPrice(item) * item.qty,
    0
  );
}

// ==========================================
// RENDER CART
// ==========================================

function renderCart() {

  if (!cartItems || !cartTotal) return;

  if (!cart.length) {

    cartItems.innerHTML =
      "<p>Your cart is empty.</p>";

    cartTotal.textContent = "₹0";

    if (count) {
      count.textContent = "0";
    }

    return;
  }

  cartItems.innerHTML =
    cart.map(item => {

      const price =
        getPrice(item);

      return `
        <div class="cart-item">

          <div>
            <strong>
              ${escapeHtml(item.name)}
            </strong>

            <br>

            ₹${price.toFixed(0)}
            × ${item.qty}
          </div>

          <div>

            <button
              onclick="changeQty('${item.id}', -1)"
            >
              −
            </button>

            <span>
              ${item.qty}
            </span>

            <button
              onclick="changeQty('${item.id}', 1)"
            >
              +
            </button>

          </div>

        </div>
      `;

    }).join("");

  cartTotal.textContent =
    "₹" + getCartTotal().toFixed(0);

  if (count) {

    count.textContent =
      cart.reduce(
        (sum, item) =>
          sum + item.qty,
        0
      );
  }
}

// ==========================================
// SAVE ORDER
// ==========================================

async function saveOrderToSupabase(
  customerName,
  phone,
  address,
  total,
  productText
) {

  const { error } =
    await supabaseClient
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
      ]);

  if (error) {

    console.error(
      "Order save error:",
      error
    );

    return false;
  }

  return true;
}

// ==========================================
// ORDER
// ==========================================

async function order() {

  if (!cart.length) {

    alert("Cart is empty.");

    return;
  }

  const total =
    getCartTotal();

  if (total < 200) {

    alert(
      "Minimum order ₹200."
    );

    return;
  }

  const name =
    document
      .getElementById("name")
      ?.value.trim();

  const phone =
    document
      .getElementById("phone")
      ?.value.trim();

  const address =
    document
      .getElementById("address")
      ?.value.trim();

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

  const productText =
    cart.map(item => {

      const price =
        getPrice(item);

      return (
        `${item.name} x ${item.qty} = ₹` +
        `${price * item.qty}`
      );

    }).join("\n");

  const saved =
    await saveOrderToSupabase(
      name,
      phone,
      address,
      total,
      productText
    );

  if (!saved) {

    alert(
      "Order save కాలేదు. Please try again."
    );

    return;
  }

  const message = `
NP Home Needs Order

Name: ${name}
Phone: ${phone}
Address: ${address}

Products:
${productText}

Total: ₹${total.toFixed(0)}
`;

  const whatsappNumber =
    "919392453626";

  const whatsappURL =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(
    whatsappURL,
    "_blank"
  );

  cart = [];

  renderCart();

  alert(
    "Order placed successfully!"
  );
}

// ==========================================
// START
// ==========================================

renderCart();

initializeSupabase();
```
      
