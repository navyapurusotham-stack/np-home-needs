let cat = "All";
let products = [];
let cartData = [];

const SUPABASE_URL = "https://fpbmoddxkiykuhdxclmt.supabase.co";
const SUPABASE_KEY = "sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

async function loadProducts() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  grid.innerHTML = "<p>Products loading...</p>";

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/products?select=*&active=eq.true&order=created_at.asc",
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY
        }
      }
    );

    if (!response.ok) throw new Error(await response.text());

    products = await response.json();
    render();
  } catch (error) {
    console.error("Supabase Error:", error);
    grid.innerHTML = "<p>Products load కాలేదు.</p>";
  }
}

function render() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const searchBox = document.getElementById("search");
  const searchText = searchBox ? searchBox.value.toLowerCase().trim() : "";

  const filtered = products.filter(function (product) {
    const name = String(product.name || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();

    return (
      (cat === "All" || category === cat.toLowerCase()) &&
      (!searchText ||
        name.includes(searchText) ||
        category.includes(searchText))
    );
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p>ఈ category లో products లేవు.</p>";
    return;
  }

  grid.innerHTML = filtered.map(function (product) {
    const price = Number(product.price || 0);
    const offer = Number(product.offer_price || 0);
    const finalPrice = offer > 0 && offer < price ? offer : price;

    let picture = "🛒";

    if (product.image_url) {
      picture =
        '<img src="' +
        escapeHTML(product.image_url) +
        '" alt="' +
        escapeHTML(product.name || "Product") +
        '">';
    }

    let priceHTML = "<b>₹" + finalPrice + "</b>";

    if (offer > 0 && offer < price) {
      priceHTML =
        "<b>₹" + offer + "</b> <del>₹" + price + "</del>";
    }

    return `
      <div class="product">
        <div class="pic">${picture}</div>
        <h3>${escapeHTML(product.name || "Product")}</h3>
        <p>${escapeHTML(product.category || "")}</p>
        <div>${priceHTML}</div>
        <button class="add-cart-btn" data-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".add-cart-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      addToCart(this.getAttribute("data-id"));
    });
  });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function active(button) {
  document.querySelectorAll(".cats button").forEach(function (btn) {
    btn.classList.remove("active");
  });

  if (button) button.classList.add("active");
}

function searchProducts() {
  render();
}

function addToCart(id) {
  const product = products.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!product) return;

  const existing = cartData.find(function (item) {
    return String(item.id) === String(id);
  });

  const price = Number(
    product.offer_price || product.price || 0
  );

  if (existing) {
    existing.qty++;
  } else {
    cartData.push({
      id: product.id,
      name: product.name,
      price: price,
      qty: 1
    });
  }

  updateCart();
}

function removeFromCart(id) {
  cartData = cartData.filter(function (item) {
    return String(item.id) !== String(id);
  });

  updateCart();
}

function changeQty(id, amount) {
  const item = cartData.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    updateCart();
  }
}

function updateCart() {
  const items = document.getElementById("items");
  const totalBox = document.getElementById("total");

  if (!items || !totalBox) return;

  if (cartData.length === 0) {
    items.innerHTML = "<p>Cart empty</p>";
    totalBox.innerText = "₹0";
    return;
  }

  let total = 0;

  items.innerHTML = cartData.map(function (item) {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    return `
      <div style="margin-bottom:12px;">
        <b>${escapeHTML(item.name)}</b><br>
        ₹${item.price} × ${item.qty} = ₹${itemTotal}<br>
        <button onclick="changeQty('${item.id}', -1)">−</button>
        <button onclick="changeQty('${item.id}', 1)">+</button>
        <button onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
  }).join("");

  totalBox.innerText = "₹" + total;
}

async function saveOrderToSupabase() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  let total = 0;

  cartData.forEach(function (item) {
    total += item.price * item.qty;
  });

  const productText = cartData.map(function (item) {
    return item.name + " x " + item.qty +
      " = ₹" + (item.price * item.qty);
  }).join(", ");

  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/customer_orders",
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          customer_name: name,
          phone: phone,
          address: address,
          total: total,
          status: "new",
          products: productText
        })
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Order save error:", error);
    return false;
  }
}

async function order() {
  if (cartData.length === 0) {
    alert("ముందుగా products cart లో add చేయండి.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  let total = 0;

  cartData.forEach(function (item) {
    total += item.price * item.qty;
  });

  if (total < 200) {
    alert("Minimum order ₹200.\nYour total is ₹" + total);
    return;
  }

  if (!name || !phone || !address) {
    alert("Name, Phone Number, Address పూర్తి చేయండి.");
    return;
  }

  await saveOrderToSupabase();

  let message = "NP Home Needs Order\n\n";
  message += "Name: " + name + "\n";
  message += "Phone: " + phone + "\n";
  message += "Address: " + address + "\n\n";
  message += "Products:\n";

  cartData.forEach(function (item) {
    message += item.name + " x " + item.qty +
      " = ₹" + (item.price * item.qty) + "\n";
  });

  message += "\nTotal: ₹" + total;

  const whatsappNumber = "919392453626";
  const whatsappURL =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(whatsappURL, "_blank");
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;
window.searchProducts = searchProducts;
window.order = order;
window.active = active;

loadProducts();
updateCart();
