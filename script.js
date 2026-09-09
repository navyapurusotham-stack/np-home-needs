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
    const url =
      SUPABASE_URL +
      "/rest/v1/products?select=*&active=eq.true&order=created_at.asc";

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    products = await response.json();

    if (!products.length) {
      grid.innerHTML = "<p>No products found.</p>";
      return;
    }

    grid.innerHTML = products.map(function(product) {
      const price =
        product.offer_price || product.price || 0;

      return `
        <div class="product">
          <div class="pic">
            ${
              product.image_url
                ? `<img src="${product.image_url}"
                     style="width:100%;height:100%;object-fit:cover;">`
                : "🛒"
            }
          </div>

          <h3>${product.name || "Product"}</h3>

          <p>${product.category || ""}</p>

          <b>₹${price}</b>

          <button onclick="addToCart('${product.id}')">
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
  const product =
    products.find(function(p) {
      return String(p.id) === String(id);
    });

  if (!product) return;

  alert(product.name + " cart లో add అయింది");
}

loadProducts();
```
