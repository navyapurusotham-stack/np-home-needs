let cat = "All";

const products = [
  {id:1,name:"టమాటా",cat:"Vegetables",price:40,unit:"1 kg",icon:"🍅"},
  {id:2,name:"బంగాళాదుంప",cat:"Vegetables",price:35,unit:"1 kg",icon:"🥔"},
  {id:3,name:"ఉల్లిపాయ",cat:"Vegetables",price:35,unit:"1 kg",icon:"🧅"},
  {id:4,name:"క్యారెట్",cat:"Vegetables",price:60,unit:"1 kg",icon:"🥕"},
  {id:5,name:"అరటి పండ్లు",cat:"Fruits",price:50,unit:"1 dozen",icon:"🍌"},
  {id:6,name:"ఆపిల్",cat:"Fruits",price:140,unit:"1 kg",icon:"🍎"},
  {id:7,name:"ఆరెంజ్",cat:"Fruits",price:100,unit:"1 kg",icon:"🍊"},
  {id:8,name:"బియ్యం",cat:"Kirana",price:60,unit:"1 kg",icon:"🍚"},
  {id:9,name:"చక్కెర",cat:"Kirana",price:50,unit:"1 kg",icon:"🧂"},
  {id:10,name:"కందిపప్పు",cat:"Kirana",price:130,unit:"1 kg",icon:"🫘"},
  {id:11,name:"సన్‌ఫ్లవర్ ఆయిల్",cat:"Kirana",price:150,unit:"1 L",icon:"🫗"},
  {id:12,name:"టీ పౌడర్",cat:"Kirana",price:120,unit:"250 g",icon:"☕"}
];

let cartData = [];

function render() {
  const grid = document.getElementById("grid");
  const searchBox = document.getElementById("search");

  if (!grid) return;

  const search = searchBox ? searchBox.value.toLowerCase().trim() : "";

  const list = products.filter(p => {
    const categoryMatch = cat === "All" || p.cat === cat;
    const searchMatch = p.name.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });

  if (list.length === 0) {
    grid.innerHTML = "<p>Products ఏమీ కనిపించలేదు.</p>";
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product">
      <div class="pic">${p.icon}</div>
      <h3>${p.name}</h3>
      <p>${p.unit}</p>
      <div class="price">₹${p.price}</div>
      <button onclick="addToCart(${p.id})">🛒 Cartలో Add చేయండి</button>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cartData.find(item => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cartData.push({...product, qty:1});
  }

  updateCart();
}

function changeQty(id, change) {
  const item = cartData.find(p => p.id === id);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cartData = cartData.filter(p => p.id !== id);
  }

  updateCart();
}

function updateCart() {
  const items = document.getElementById("items");
  const totalBox = document.getElementById("total");
  const countBox = document.getElementById("count");

  if (!items) return;

  if (cartData.length === 0) {
    items.innerHTML = "<p>Cart ఖాళీగా ఉంది.</p>";
  } else {
    items.innerHTML = cartData.map(item => `
      <div class="cart-item">
        <div>
          <b>${item.icon} ${item.name}</b>
          <br>
          <small>₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</small>
        </div>

        <div class="qty">
          <button onclick="changeQty(${item.id},-1)">−</button>
          <b>${item.qty}</b>
          <button onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>
    `).join("");
  }

  const total = cartData.reduce(
    (sum,item) => sum + item.price * item.qty,
    0
  );

  const count = cartData.reduce(
    (sum,item) => sum + item.qty,
    0
  );

  if (totalBox) totalBox.textContent = `₹${total}`;
  if (countBox) countBox.textContent = count;
}

function active(button) {
  document.querySelectorAll(".cats button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }
}

function order() {
  if (cartData.length === 0) {
    alert("ముందుగా Cartలో products add చేయండి.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const total = cartData.reduce(
    (sum,item) => sum + item.price * item.qty,
    0
  );

  if (total < 200) {
    alert("Minimum order ₹200. ఇంకా products add చేయండి.");
    return;
  }

  if (!name || !phone || !address) {
    alert("మీ పేరు, ఫోన్ నంబర్, డెలివరీ అడ్రస్ పూర్తి చేయండి.");
    return;
  }

  const productText = cartData.map(item =>
    `${item.name} - ${item.qty} × ₹${item.price} = ₹${item.price * item.qty}`
  ).join("\n");

  const message =
`🛒 NP Home Needs Order

👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}

Products:
${productText}

💰 Total: ₹${total}

Please confirm my order.`;

  /*
    IMPORTANT:
    క్రింద ఉన్న 91XXXXXXXXXX స్థానంలో
    NP Home Needs WhatsApp business number పెట్టాలి.
    ఉదాహరణ: 919876543210
  */

  const whatsappNumber = "91XXXXXXXXXX";

  const url =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

render();
updateCart();
