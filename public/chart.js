const ctx = document.getElementById("chart").getContext("2d");
let chart;

function createChart() {
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Live Price",
        data: [],
        borderColor: "lime",
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      animation: false,
      scales: {
        x: { display: false },
        y: { beginAtZero: false }
      }
    }
  });
}

function updateChart(symbol, price) {
  const ts = new Date().toLocaleTimeString();
  document.getElementById("symbol").textContent = symbol;
  if (chart.data.labels.length > 100) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push(ts);
  chart.data.datasets[0].data.push(price);
  chart.update();
}

// Connect to WebSocket server
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("✅ Connected to stream");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateChart(data.symbol, data.sold || data.price);
};
ws.onclose = () => console.log("❌ Disconnected");

createChart();
