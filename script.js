```javascript
let products = [];

const SUPABASE_URL =
"https://fpbmoddxkiykuhdxclmt.supabase.co";

const SUPABASE_KEY =
"sb_publishable_rCkMVl4Nw1v3DfvedTHAqg_KpL0v1Jr";

async function loadProducts() {
  const grid = document.getElementById("grid");

  grid.innerHTML = "<p>Products loading...</p>";

  try {
    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/products?select=*&active=eq.true",
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    products = await response.json();

    grid.innerHTML = products.map(function(p) {
      return `
        <div class="product">
          <div class="pic">
            ${p.image_url
              ? `<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;">`
              : "🛒"}
          </div>

          <h3>${p.name}</h3>
          <p>${p.category || ""}</p>
          <b>₹${p.offer_price || p.price || 0}</b>

          <button onclick="addToCart('${p.id}')">
            Add to Cart
          </button>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error(error);
    grid.innerHTML =
      "<p>Products load కాలేదు.</p>";
  }
}

function addToCart(id) {
  const p = products.find(function(x) {
    return String(x.id) === String(id);
  });

  if (p) {
    alert(p.name + " cart లో add అయింది");
  }
}

loadProducts();
```
