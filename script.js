 (function () {
      // ---------- state ----------
      let allProducts = [];
      let filteredProducts = [];
      let cart = [];
      let activeCategory = 'all';
      const USD_TO_PKR = 280;

      // DOM elements
      const loader = document.getElementById('loader');
      const grid = document.getElementById('productGrid');
      const filterDiv = document.getElementById('filterContainer');
      const cartSpan = document.getElementById('cartCount');
      const cartPanel = document.getElementById('cartPanel');
      const cartItemsDiv = document.getElementById('cartItemsList');
      const cartTotalSpan = document.getElementById('cartTotal');
      const cartIcon = document.getElementById('cartIcon');
      const closeCart = document.getElementById('closeCartBtn');
      const reviewModal = document.getElementById('reviewModal');
      const reviewList = document.getElementById('reviewList');
      const modalTitle = document.getElementById('modalProductTitle');
      const closeModalBtn = document.getElementById('closeModalBtn');
      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.getElementById('searchBtn');

      // ---------- fetch data ----------
      async function fetchData() {
        loader.style.display = 'flex';
        try {
    const res = await fetch('https://corsproxy.io/?https://fakestoreapi.com/products');
          const data = await res.json();
          allProducts = data;
          filteredProducts = [...allProducts];
          renderFilterButtons();
          renderProducts(filteredProducts);
        } catch (err) {
          grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">failed to load 😢</p>';
        } finally {
          loader.style.display = 'none';
        }
      }

      // render filter buttons (all varieties)
      function renderFilterButtons() {
        const categories = ['all', ...new Set(allProducts.map(p => p.category))];
        filterDiv.innerHTML = '';
        categories.forEach(cat => {
          const btn = document.createElement('button');
          btn.className = `filter-btn ${cat === 'all' ? 'active' : ''}`;
          btn.dataset.cat = cat;
          btn.textContent = cat === 'all' ? 'ALL STYLES' : cat.toUpperCase();
          btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = cat;
            applyFilterAndSearch();
          });
          filterDiv.appendChild(btn);
        });
      }

      // search + filter combined
      function applyFilterAndSearch() {
        let temp = allProducts;
        // filter by category
        if (activeCategory !== 'all') {
          temp = temp.filter(p => p.category === activeCategory);
        }
        // search term
        const term = searchInput.value.trim().toLowerCase();
        if (term !== '') {
          temp = temp.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
          );
        }
        filteredProducts = temp;
        renderProducts(filteredProducts);
      }

      // render products
      function renderProducts(products) {
        if (!products.length) {
          grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:2rem;">✨ no matching items</div>';
          return;
        }
        let html = '';
        products.forEach((p, idx) => {
          const fullStars = Math.floor(p.rating.rate);
          const half = (p.rating.rate % 1 >= 0.5) ? '½' : '';
          const stars = '★'.repeat(fullStars) + half;
          html += `
          <div class="product-card" style="animation-delay:${idx * 0.03}s">
            <div class="card-img"><img src="${p.image}" loading="lazy"></div>
            <div class="card-body">
              <span class="card-category">${p.category}</span>
              <div class="card-title">${p.title.substring(0, 45)}</div>
              <div class="price-row">
                <span class="price-usd">$${p.price}</span>
                <span class="price-pkr">Rs.${(p.price * USD_TO_PKR).toFixed(0)}</span>
              </div>
              <div class="rating">
                <span class="stars">${stars}</span>
                <button class="view-reviews" data-id="${p.id}" data-title="${p.title}">${p.rating.count} reviews</button>
              </div>
              <button class="add-to-cart" data-id="${p.id}" data-title="${p.title}" data-price="${p.price}"><i class="fas fa-cart-plus"></i> add</button>
            </div>
          </div>`;
        });
        grid.innerHTML = html;

        // attach review modal
        document.querySelectorAll('.view-reviews').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const prod = allProducts.find(p => p.id == id);
            if (prod) {
              modalTitle.innerText = prod.title;
              reviewList.innerHTML = `<div class="review-item">⭐ ${prod.rating.rate} / 5 (${prod.rating.count} ratings)</div>
                                      <div class="review-item">“amazing fit, true to size” — sample review</div>
                                      <div class="review-item">“fast shipping, good quality”</div>`;
              reviewModal.classList.add('show');
            }
          });
        });

        // add to cart
        document.querySelectorAll('.add-to-cart').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const title = btn.dataset.title;
            const price = parseFloat(btn.dataset.price);
            const existing = cart.find(item => item.id === id);
            if (existing) existing.quantity++;
            else cart.push({ id, title, price, quantity: 1 });
            updateCartUI();
            cartPanel.classList.add('open');
          });
        });
      }

      // update cart
      function updateCartUI() {
        let totalQ = 0, totalPrice = 0;
        cartItemsDiv.innerHTML = '';
        cart.forEach(item => {
          totalQ += item.quantity;
          totalPrice += item.price * item.quantity;
          cartItemsDiv.innerHTML += `<div class="cart-item">${item.title.substring(0, 18)} x${item.quantity}  $${(item.price * item.quantity).toFixed(2)}</div>`;
        });
        cartSpan.innerText = totalQ;
        cartTotalSpan.innerText = `Total: $${totalPrice.toFixed(2)} (Rs.${(totalPrice * USD_TO_PKR).toFixed(0)})`;
      }

      // ---------- event listeners ----------
      searchBtn.addEventListener('click', applyFilterAndSearch);
      searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') applyFilterAndSearch(); });

      document.getElementById('placeOrderBtn').addEventListener('click', () => {
        const name = document.getElementById('orderName').value;
        const product = document.getElementById('orderProduct').value;
        const phone = document.getElementById('orderPhone').value;
        const addr = document.getElementById('orderAddress').value;
        const msg = `New order from VELA VISTA:%0AName: ${name}%0AProduct: ${product}%0APhone: ${phone}%0AAddress: ${addr}`;
        window.open(`https://wa.me/923047733597?text=${encodeURIComponent(msg)}`, '_blank');
      });

      document.getElementById('sendComplaintBtn').addEventListener('click', () => {
        const name = document.getElementById('complaintName').value;
        const msg = document.getElementById('complaintMsg').value;
        const subject = `VELA VISTA complaint from ${name}`;
        const body = `Name: ${name}%0D%0AMessage: ${msg}`;
        window.location.href = `mailto:shahbazbashir1073@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });

      cartIcon.addEventListener('click', () => cartPanel.classList.add('open'));
      closeCart.addEventListener('click', () => cartPanel.classList.remove('open'));
      closeModalBtn.addEventListener('click', () => reviewModal.classList.remove('show'));
      window.addEventListener('click', (e) => { if (e.target === reviewModal) reviewModal.classList.remove('show'); });

      document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (!cart.length) return alert('cart empty');
        let items = '';
        cart.forEach(i => { items += `${i.title} x${i.quantity} $${i.price * i.quantity}\n`; });
        const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const msg = `VELA VISTA order:%0A${items}%0ATotal USD: $${total} (PKR: ${total * USD_TO_PKR})`;
        window.open(`https://wa.me/923047733597?text=${encodeURIComponent(msg)}`, '_blank');
      });

      // initial fetch
      fetchData();
    })();
