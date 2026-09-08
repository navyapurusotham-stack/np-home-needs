```javascript
let cat = "All";
let products = [];
let cartData = [];

const SUPABASE_URL =
  "https://fpbmoddxkiykuhdxclmt.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* ================= LOAD PRODUCTS ================= */

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Products loading error:", error);

    const grid = document.getElementById("grid");

    if (grid) {
      grid.innerHTML =
        "<p>Products load కాలేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.</p>";
    }

    return;
  }

  products = (data || []).map((p) => ({
    id: p.id,
    name: p.name || "Product",
    cat: p.category || "Kirana",
    price: Number(p.price) || 0,
    offer_price:
      p.offer_price !== null &&
      p.offer_price !== undefined
        ? Number(p.offer_price)
        : null,
    unit: p.unit || "1 item",
    icon: getCategoryIcon(p.category),
    image_url: p.image_url || ""
  }));

  render();
  updateCart();
}


/* ================= CATEGORY ICON ================= */

function getCategoryIcon(category) {
  if (category === "Vegetables") return "🥦";
  if (category === "Fruits") return "🍎";
  if (category === "Kirana") return "🛒";
  if (category === "Fancy Items") return "✨";
  if (category === "Gifts") return "🎁";

  return "🛍️";
}


/* ================= RENDER PRODUCTS ================= */

function render() {
  const grid = document.getElementById("grid");
  const searchBox = document.getElementById("search");

  if (!grid) return;

  const search = searchBox
    ? searchBox.value.toLowerCase().trim()
    : "";

  const list = products.filter((p) => {
    const categoryMatch =
      cat === "All" || p.cat === cat;

    const searchMatch =
      p.name.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });

  if (list.length === 0) {
    grid.innerHTML =
      "<p>Products ఏమీ కనిపించలేదు.</p>";
    return;
  }

  grid.innerHTML = list
    .map((p) => {

      const hasOffer =
        p.offer_price !== null &&
        p.offer_price < p.price;

      const displayPrice =
        hasOffer ? p.offer_price : p.price;

      const imageHTML = p.image_url
        ? `
          <img
            src="${p.image_url}"
            alt="${p.name}"
            class="product-image"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <div class="emoji-fallback" style="display:none;">
            ${p.icon}
          </div>
        `
        : `
          <div class="emoji-fallback">
            ${p.icon}
          </div>
        `;

      return `
        <div class="product-card">

          <div class="product-picture">
            ${imageHTML}
          </div>

          <div class="product-info">

            <h3>${p.name}</h3>

            <div class="product-category">
              ${p.unit}
            </div>

            <div class="product-price">

              ${
                hasOffer
                  ? `
                    <span class="old-price">
                      ₹${p.price}
                    </span>

                    <span class="offer-price">
                      ₹${displayPrice}
                    </span>
                  `
                  : `
                    <span class="offer-price">
                      ₹${displayPrice}
                    </span>
                  `
              }

            </div>

            <button
              class="add-cart"
              onclick="addToCart('${p.id}')"
            >
              🛒 Cartలో Add చేయండి
            </button>

          </div>

        </div>
      `;
    })
    .join("");
}


/* ================= ADD TO CART ================= */

function addToCart(id) {

  const product =
    products.find((p) => String(p.id) === String(id));

  if (!product) return;

  const existing =
    cartData.find(
      (item) => String(item.id) === String(id)
    );

  if (existing) {
    existing.qty++;
  } else {
    cartData.push({
      ...product,
      qty: 1
    });
  }

  updateCart();
}


/* ================= CHANGE QUANTITY ================= */

function changeQty(id, change) {

  const item =
    cartData.find(
      (p) => String(p.id) === String(id)
    );

  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cartData =
      cartData.filter(
        (p) => String(p.id) !== String(id)
      );
  }

  updateCart();
}


/* ================= UPDATE CART ================= */

function updateCart() {

  const items =
    document.getElementById("items");

  const totalBox =
    document.getElementById("total");

  const countBox =
    document.getElementById("count");

  if (!items) return;

  if (cartData.length === 0) {

    items.innerHTML =
      "<p>Cart ఖాళీగా ఉంది.</p>";

  } else {

    items.innerHTML = cartData
      .map((item) => {

        const itemPrice =
          item.offer_price !== null &&
          item.offer_price < item.price
            ? item.offer_price
            : item.price;

        const itemTotal =
          itemPrice * item.qty;

        return `
          <div class="cart-item">

            <div>
              <b>
                ${item.icon}
                ${item.name}
              </b>

              <br>

              <small>
                ₹${itemPrice} × ${item.qty}
                = ₹${itemTotal}
              </small>
            </div>

            <div class="quantity-control">

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
      })
      .join("");
  }


  const total = cartData.reduce(
    (sum, item) => {

      const itemPrice =
        item.offer_price !== null &&
        item.offer_price < item.price
          ? item.offer_price
          : item.price;

      return sum + itemPrice * item.qty;
    },
    0
  );


  const count = cartData.reduce(
    (sum, item) =>
      sum + item.qty,
    0
  );


  if (totalBox) {
    totalBox.textContent =
      `₹${total}`;
  }

  if (countBox) {
    countBox.textContent =
      count;
  }
}


/* ================= CATEGORY ================= */

function active(button) {

  document
    .querySelectorAll(".cats button")
    .forEach((btn) => {
      btn.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }
}


/* ================= SAVE ORDER TO SUPABASE ================= */

async function saveOrderToSupabase(
  name,
  phone,
  address,
  total,
  productText
) {

  const { data, error } =
    await supabaseClient
      .from("customer_orders")
      .insert([
        {
          customer_name: name,
          phone: phone,
          address: address,
          total: total,
          status: "pending",
          products: productText
        }
      ])
      .select();

  if (error) {

    console.error(
      "Order save error:",
      error
    );

    return {
      success: false,
      error: error.message
    };
  }

  return {
    success: true,
    data: data
  };
}


/* ================= WHATSAPP ORDER ================= */

async function order() {

  if (cartData.length === 0) {

    alert(
      "ముందుగా Cartలో products add చేయండి."
    );

    return;
  }


  const name =
    document
      .getElementById("name")
      .value
      .trim();

  const phone =
    document
      .getElementById("phone")
      .value
      .trim();

  const address =
    document
      .getElementById("address")
      .value
      .trim();


  const total = cartData.reduce(
    (sum, item) => {

      const itemPrice =
        item.offer_price !== null &&
        item.offer_price < item.price
          ? item.offer_price
          : item.price;

      return sum + itemPrice * item.qty;
    },
    0
  );


  /* MINIMUM ORDER */

  if (total < 200) {

    alert(
      "Minimum order ₹200. ఇంకా products add చేయండి."
    );

    return;
  }


  /* CUSTOMER DETAILS */

  if (!name || !phone || !address) {

    alert(
      "మీ పేరు, ఫోన్ నంబర్, డెలివరీ అడ్రస్ పూర్తి చేయండి."
    );

    return;
  }


  /* PRODUCT LIST */

  const productText =
    cartData
      .map((item) => {

        const itemPrice =
          item.offer_price !== null &&
          item.offer_price < item.price
            ? item.offer_price
            : item.price;

        const itemTotal =
          itemPrice * item.qty;

        return `${item.name} - ${item.qty} × ₹${itemPrice} = ₹${itemTotal}`;
      })
      .join("\n");


  /* SAVE TO SUPABASE */

  const saveResult =
    await saveOrderToSupabase(
      name,
      phone,
      address,
      total,
      productText
    );


  if (!saveResult.success) {

    alert(
      "Order databaseలో save కాలేదు.\n\n" +
      saveResult.error
    );

    return;
  }


  /* WHATSAPP MESSAGE */

  const message = `
🛒 NP Home Needs Order

👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}

Products:
${productText}

💰 Total: ₹${total}

Order databaseలో save అయింది.
Please confirm my order.
`;


  const whatsappNumber =
    "919392453626";


  const url =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


  window.open(url, "_blank");
}


/* ================= START ================= */

loadProducts();
updateCart();
```
                
