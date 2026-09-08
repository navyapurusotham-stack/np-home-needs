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

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Products loading error:", error);
    return;
  }

  products = data.map((p) => ({
    id: p.id,
    name: p.name,
    cat: p.category,
    price: Number(p.price),
    offer_price:
      p.offer_price !== null
        ? Number(p.offer_price)
        : null,
    unit: "1 item",
    icon: "🛒",
    image_url: p.image_url || ""
  }));

  render();
  updateCart();
}

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

      const image = p.image_url
        ? `
          <img
            src="${p.image_url}"
            alt="${p.name}"
            class="product-image"
          >
        `
        : `
          <div class="emoji">
            ${p.icon}
          </div>
        `;

      return `
        <div class="product">

          <div class="pic">
            ${image}
          </div>

          <div class="product-details">

            <h3>${p.name}</h3>

            <p>${p.unit}</p>

            <div class="price">
              ${
                hasOffer
                  ? `
                    <del>₹${p.price}</del>
                    <span>₹${displayPrice}</span>
                  `
                  : `
                    <span>₹${displayPrice}</span>
                  `
              }
            </div>

            <button
              onclick="addToCart('${p.id}')">
              🛒 Cartలో Add చేయండి
            </button>

          </div>

        </div>
      `;
    })
    .join("");
}

function addToCart(id) {
  const product =
    products.find((p) => p.id === id);

  if (!product) return;

  const existing =
    cartData.find((item) => item.id === id);

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

function changeQty(id, change) {
  const item =
    cartData.find((p) => p.id === id);

  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cartData =
      cartData.filter((p) => p.id !== id);
  }

  updateCart();
}

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
                =
                ₹${itemPrice * item.qty}
              </small>
            </div>

            <div class="qty">

              <button
                onclick="changeQty('${item.id}', -1)">
                −
              </button>

              <b>${item.qty}</b>

              <button
                onclick="changeQty('${item.id}', 1)">
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

      return (
        sum +
        itemPrice * item.qty
      );
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

function order() {
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

      return (
        sum +
        itemPrice * item.qty
      );
    },
    0
  );

  if (total < 200) {
    alert(
      "Minimum order ₹200. ఇంకా products add చేయండి."
    );
    return;
  }

  if (!name || !phone || !address) {
    alert(
      "మీ పేరు, ఫోన్ నంబర్, డెలివరీ అడ్రస్ పూర్తి చేయండి."
    );
    return;
  }

  const productText =
    cartData
      .map((item) => {
        const itemPrice =
          item.offer_price !== null &&
          item.offer_price < item.price
            ? item.offer_price
            : item.price;

        return `
${item.name} - ${item.qty} × ₹${itemPrice}
= ₹${itemPrice * item.qty}
        `;
      })
      .join("\n");

  const message = `
🛒 NP Home Needs Order

👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}

Products:
${productText}

💰 Total: ₹${total}

Please confirm my order.
`;

  const whatsappNumber =
    "919392453626";

  const url =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

  window.open(url, "_blank");
}

loadProducts();
updateCart();
```
            
