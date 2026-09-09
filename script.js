```javascript
let cat = "All";
let products = [];
let cartData = [];

const SUPABASE_URL =
  "https://fpbmoddxkiykuhdxclmt.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

async function loadProducts() {
  const grid = document.getElementById("grid");

  if (!grid) return;

  grid.innerHTML = "<p>Products loading...</p>";

  try {
    const url =
      SUPABASE_URL +
      "/rest/v1/products?select=*&active=eq.true&order=created_at.asc";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    products = await response.json();

    render();

  } catch (error) {
    console.error("Products Error:", error);

    grid.innerHTML =
      "<p>Products load కాలేదు. Please try again.</p>";
  }
}

function render() {
  const grid = document.getElementById("grid");

  if (!grid) return;

  const search =
    document.getElementById("search");

  const searchText =
    search ? search.value.toLowerCase().trim() : "";

  const filtered =
    products.filter(function(p) {

      const productCategory =
        String(p.category || "").toLowerCase();

      const productName =
        String(p.name || "").toLowerCase();

      const categoryOK =
        cat === "All" ||
        productCategory === cat.toLowerCase();

      const searchOK =
        !searchText ||
        productName.includes(searchText) ||
        productCategory.includes(searchText);

      return categoryOK && searchOK;
    });

  if (filtered.length === 0) {
    grid.innerHTML =
      "<p>No products found.</p>";
    return;
  }

  grid.innerHTML =
    filtered.map(function(p) {

      const price =
        Number(p.price || 0);

      const offer =
        Number(p.offer_price || 0);

      const finalPrice =
        offer > 0 && offer < price
          ? offer
          : price;

      let imageHTML = "";

      if (p.image_url) {
        imageHTML =
          '<img src="' +
          p.image_url +
          '" alt="' +
          escapeHTML(p.name) +
          '">';
      } else {
        imageHTML =
          '<span class="product-icon">🛒</span>';
      }

      let priceHTML =
        "<b>₹" + finalPrice + "</b>";

      if (offer > 0 && offer < price) {
        priceHTML =
          "<b>₹" +
          offer +
          "</b> <del>₹" +
          price +
          "</del>";
      }

      return `
        <div class="product">

          <div class="pic">
            ${imageHTML}
          </div>

          <h3>${escapeHTML(p.name || "Product")}</h3>

          <p>${escapeHTML(p.category || "")}</p>

          <div class="product-price">
            ${priceHTML}
          </div>

          <button onclick="addToCart('${p.id}')">
            Add to Cart
          </button>

        </div>
      `;

    }).join("");
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
  document
    .querySelectorAll(".cats button")
    .forEach(function(btn) {
      btn.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }
}

function searchProducts() {
  render();
}

function addToCart(id) {

  const product =
    products.find(function(p) {
      return String(p.id) === String(id);
    });

  if (!product) return;

  const existing =
    cartData.find(function(item) {
      return String(item.id) === String(id);
    });

  const price =
    Number(
      product.offer_price ||
      product.price ||
      0
    );

  if (existing) {
    existing.qty += 1;
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

  cartData =
    cartData.filter(function(item) {
      return String(item.id) !== String(id);
    });

  updateCart();
}

function changeQty(id, amount) {

  const item =
    cartData.find(function(x) {
      return String(x.id) === String(id);
    });

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  updateCart();
}

function updateCart() {

  const items =
    document.getElementById("items");

  const totalBox =
    document.getElementById("total");

  if (!items || !totalBox) return;

  if (cartData.length === 0) {
    items.innerHTML =
      "<p>Cart empty</p>";

    totalBox.innerText =
      "₹0";

    return;
  }

  let total = 0;

  items.innerHTML =
    cartData.map(function(item) {

      const itemTotal =
        item.price * item.qty;

      total += itemTotal;

      return `
        <div class="cart-item">

          <b>${escapeHTML(item.name)}</b>

          <br>

          ₹${item.price} × ${item.qty}
          = ₹${itemTotal}

          <br>

          <button onclick="changeQty('${item.id}', -1)">
            −
          </button>

          <button onclick="changeQty('${item.id}', 1)">
            +
          </button>

          <button onclick="removeFromCart('${item.id}')">
            Remove
          </button>

        </div>
      `;

    }).join("");

  totalBox.innerText =
    "₹" + total;
}

async function saveOrderToSupabase() {

  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const address =
    document.getElementById("address").value.trim();

  let total = 0;

  cartData.forEach(function(item) {
    total += item.price * item.qty;
  });

  const productText =
    cartData.map(function(item) {
      return (
        item.name +
        " x " +
        item.qty +
        " = ₹" +
        (item.price * item.qty)
      );
    }).join(", ");

  try {

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/customer_orders",
        {
          method: "POST",

          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization":
              "Bearer " + SUPABASE_KEY,
            "Content-Type":
              "application/json",
            "Prefer":
              "return=minimal"
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

    console.error(
      "Order Error:",
      error
    );

    return false;
  }
}

async function order() {

  if (cartData.length === 0) {
    alert(
      "ముందుగా products cart లో add చేయండి."
    );
    return;
  }

  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const address =
    document.getElementById("address").value.trim();

  let total = 0;

  cartData.forEach(function(item) {
    total += item.price * item.qty;
  });

  if (total < 200) {
    alert(
      "Minimum order ₹200.\nYour cart total ₹" +
      total
    );
    return;
  }

  if (!name || !phone || !address) {
    alert(
      "Name, Phone Number, Address పూర్తి చేయండి."
    );
    return;
  }

  await saveOrderToSupabase();

  let message =
    "NP Home Needs Order\n\n";

  message +=
    "Name: " + name + "\n";

  message +=
    "Phone: " + phone + "\n";

  message +=
    "Address: " + address + "\n\n";

  message +=
    "Products:\n";

  cartData.forEach(function(item) {

    message +=
      item.name +
      " x " +
      item.qty +
      " = ₹" +
      (item.price * item.qty) +
      "\n";
  });

  message +=
    "\nTotal: ₹" + total;

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
}

loadProducts();
updateCart();
```
            
