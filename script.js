```javascript
let cat = "All";
let products = [];
let cartData = [];

const SUPABASE_URL =
  "https://fpbmoddxkiykuhdxclmt.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

const PRODUCTS_URL =
  SUPABASE_URL +
  "/rest/v1/products?select=*&active=eq.true&order=created_at.asc";

const ORDERS_URL =
  SUPABASE_URL + "/rest/v1/customer_orders";

async function loadProducts() {
  const grid = document.getElementById("grid");

  if (grid) {
    grid.innerHTML = "<p>Products loading...</p>";
  }

  try {
    const response = await fetch(PRODUCTS_URL, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();

    products = Array.isArray(data) ? data : [];

    render();

  } catch (error) {
    console.error("Products Error:", error);

    if (grid) {
      grid.innerHTML =
        "<p>Products load కాలేదు. Supabase connection check చేయండి.</p>";
    }
  }
}


function render() {
  const grid = document.getElementById("grid");

  if (!grid) return;

  const searchBox = document.getElementById("search");
  const searchText = searchBox
    ? searchBox.value.toLowerCase().trim()
    : "";

  let filtered = products.filter(function (p) {

    const productCategory =
      String(p.category || "").toLowerCase();

    const productName =
      String(p.name || "").toLowerCase();

    const categoryMatch =
      cat === "All" ||
      productCategory === cat.toLowerCase();

    const searchMatch =
      !searchText ||
      productName.includes(searchText) ||
      productCategory.includes(searchText);

    return categoryMatch && searchMatch;
  });


  if (filtered.length === 0) {
    grid.innerHTML =
      "<p>ఈ category లో products లేవు.</p>";
    return;
  }


  grid.innerHTML = filtered.map(function (p) {

    const normalPrice =
      Number(p.price || 0);

    const offerPrice =
      Number(
        p.offer_price ||
        p.price ||
        0
      );

    const image =
      p.image_url
        ? '<img src="' +
          p.image_url +
          '" alt="' +
          escapeHtml(p.name) +
          '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">'
        : '<span style="font-size:45px;">🛒</span>';


    let priceHtml = "";

    if (
      p.offer_price &&
      Number(p.offer_price) < normalPrice
    ) {
      priceHtml =
        '<b>₹' +
        offerPrice +
        '</b> ' +
        '<del>₹' +
        normalPrice +
        '</del>';
    } else {
      priceHtml =
        '<b>₹' +
        normalPrice +
        '</b>';
    }


    return `
      <div class="product">

        <div class="pic">
          ${image}
        </div>

        <div class="product-info">

          <h3>${escapeHtml(p.name || "Product")}</h3>

          <p>${escapeHtml(p.category || "")}</p>

          <div class="price">
            ${priceHtml}
          </div>

          <button onclick="addToCart('${p.id}')">
            Add to Cart
          </button>

        </div>

      </div>
    `;

  }).join("");
}


function escapeHtml(value) {
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
    .forEach(function (btn) {
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

  const product = products.find(function (p) {
    return String(p.id) === String(id);
  });

  if (!product) return;


  const existing = cartData.find(function (item) {
    return String(item.id) === String(id);
  });


  if (existing) {
    existing.qty += 1;
  } else {
    cartData.push({
      id: product.id,
      name: product.name,
      price: Number(
        product.offer_price ||
        product.price ||
        0
      ),
      qty: 1
    });
  }

  updateCart();
}


function removeFromCart(id) {

  cartData =
    cartData.filter(function (item) {
      return String(item.id) !== String(id);
    });

  updateCart();
}


function changeQty(id, amount) {

  const item =
    cartData.find(function (x) {
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

  const itemsBox =
    document.getElementById("items");

  const totalBox =
    document.getElementById("total");


  if (!itemsBox || !totalBox) return;


  if (cartData.length === 0) {

    itemsBox.innerHTML =
      "<p>Cart empty</p>";

    totalBox.innerText = "₹0";

    return;
  }


  let total = 0;


  itemsBox.innerHTML =
    cartData.map(function (item) {

      const itemTotal =
        item.price * item.qty;

      total += itemTotal;


      return `
        <div style="margin-bottom:12px;padding:10px;border-bottom:1px solid #ddd;">

          <b>${escapeHtml(item.name)}</b>

          <br>

          ₹${item.price} × ${item.qty}
          = ₹${itemTotal}

          <br>

          <button onclick="changeQty('${item.id}',-1)">−</button>

          <button onclick="changeQty('${item.id}',1)">+</button>

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

  cartData.forEach(function (item) {
    total += item.price * item.qty;
  });


  const productsText =
    cartData.map(function (item) {
      return (
        item.name +
        " x " +
        item.qty +
        " = ₹" +
        (item.price * item.qty)
      );
    }).join(", ");


  const response =
    await fetch(ORDERS_URL, {
      method: "POST",

      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },

      body: JSON.stringify({
        customer_name: name,
        phone: phone,
        address: address,
        total: total,
        status: "new",
        products: productsText
      })
    });


  if (!response.ok) {

    const errorText =
      await response.text();

    console.error(
      "Order Save Error:",
      errorText
    );

    return false;
  }


  return true;
}


async function order() {

  if (cartData.length === 0) {
    alert("ముందుగా products cart లో add చేయండి.");
    return;
  }


  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const address =
    document.getElementById("address").value.trim();


  let total = 0;

  cartData.forEach(function (item) {
    total += item.price * item.qty;
  });


  if (total < 200) {
    alert(
      "Minimum order ₹200. ప్రస్తుతం మీ cart total ₹" +
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


  const saved =
    await saveOrderToSupabase();


  if (!saved) {

    alert(
      "Order save కాలేదు. WhatsApp ద్వారా order continue చేయవచ్చు."
    );
  }


  let message =
    "NP Home Needs Order%0A%0A";

  message +=
    "Name: " +
    encodeURIComponent(name) +
    "%0A";

  message +=
    "Phone: " +
    encodeURIComponent(phone) +
    "%0A";

  message +=
    "Address: " +
    encodeURIComponent(address) +
    "%0A%0A";


  message += "Products:%0A";


  cartData.forEach(function (item) {

    message +=
      encodeURIComponent(
        item.name +
        " x " +
        item.qty +
        " = ₹" +
        (item.price * item.qty)
      ) +
      "%0A";
  });


  message +=
    "%0ATotal: ₹" +
    total;


  const whatsappNumber =
    "919392453626";


  const whatsappUrl =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    message;


  window.open(
    whatsappUrl,
    "_blank"
  );
}


loadProducts();
updateCart();
```
            
