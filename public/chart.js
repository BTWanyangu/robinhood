// Connect to the WebSocket from the Render backend
const WS_URL = "wss://robinhood-live-tracker.onrender.com"; // your Render domain (wss)
const container = document.getElementById("cards-container");

const stockCards = {}; // symbol -> card element

function createStockCard(symbol) {
  const card = document.createElement("div");
  card.className = "stock-card";
  card.innerHTML = `
    <div class="stock-title">${symbol}</div>
    <div class="stock-price" id="price-${symbol}">--</div>
    <div class="stock-profit" id="profit-${symbol}">--</div>
    <div class="trend" id="trend-${symbol}">📊 Waiting for data...</div>
  `;
  container.appendChild(card);
  stockCards[symbol] = card;
}

function updateStockCard(data) {
  const { name, price, profit, profitToday, bought, sold } = data;
  if (!name) return;

  if (!stockCards[name]) {
    createStockCard(name);
  }

  const priceEl = document.getElementById(`price-${name}`);
  const profitEl = document.getElementById(`profit-${name}`);
  const trendEl = document.getElementById(`trend-${name}`);

  if (priceEl) priceEl.textContent = `$${parseFloat(price || sold || 0).toFixed(2)}`;
  if (profitEl) {
    const val = profitToday || profit;
    if (typeof val === "string" && val.startsWith("-")) {
      profitEl.textContent = val;
      profitEl.className = "stock-profit profit-red";
    } else {
      profitEl.textContent = val;
      profitEl.className = "stock-profit profit-green";
    }
  }

  // trend based on profit
  if (trendEl) {
    if (profit < 0) {
      trendEl.textContent = "📉 Downtrend";
      trendEl.style.color = "#ff5555";
    } else if (profit > 0) {
      trendEl.textContent = "📈 Uptrend";
      trendEl.style.color = "#00ff99";
    } else {
      trendEl.textContent = "⚖️ Neutral";
      trendEl.style.color = "#aaa";
    }
  }
}

// --- Connect WebSocket ---
let socket;

function connectWebSocket() {
  socket = new WebSocket(WS_URL.replace("https://", "wss://").replace("http://", "ws://"));

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📥 Received:", data);
      updateStockCard(data);
    } catch (err) {
      console.error("Failed to parse WS data:", err);
    }
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket closed, retrying...");
    setTimeout(connectWebSocket, 3000);
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
    socket.close();
  };
}

connectWebSocket();
