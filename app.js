// change this to reference the dataset you chose to work with.
import { bikeShare as chartData } from "./data/bikeShare.js";

// --- DOM helpers ---
const monthSelect = document.getElementById("monthSelect");
const hoodSelect = document.getElementById("hoodSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const months = [...new Set(chartData.map(r => r.month))];
const hoods = [...new Set(chartData.map(r => r.hood))];

months.forEach(m => monthSelect.add(new Option(m, m)));
hoods.forEach(h => hoodSelect.add(new Option(h, h)));

monthSelect.value = months[0];
hoodSelect.value = hoods[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const month = monthSelect.value;
  const hood = hoodSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { month, hood, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { month, hood, metric }) {
  if (type === "bar") return barByNeighborhood(month, metric);
  if (type === "line") return lineOverTime(hood, ["trips", "revenueUSD"]);
  if (type === "scatter") return scatterTripsVsTemp(hood);
  if (type === "doughnut") return doughnutMemberVsCasual(month, hood);
  if (type === "radar") return radarCompareNeighborhoods(month);
  return barByNeighborhood(month, metric);
}

// Task A: BAR — compare neighborhoods for a given month
function barByNeighborhood(month, metric) {
  const rows = chartData.filter(r => r.month === month);

  const labels = rows.map(r => r.hood);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${month}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Neighborhood comparison (${month})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Neighborhood" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborhood (2 datasets)
function lineOverTime(hood, metrics) {
  const rows = chartData.filter(r => r.hood === hood);

  const labels = rows.map(r => r.month);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${hood}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Month" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(hood) {
  const rows = chartData.filter(r => r.hood === hood);

  const points = rows.map(r => ({ x: r.tempC, y: r.trips }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Trips vs Temp (${hood})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does temperature affect trips? (${hood})` }
      },
      scales: {
        x: { title: { display: true, text: "Temperature (C)" } },
        y: { title: { display: true, text: "Trips" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one hood + month
function doughnutMemberVsCasual(month, hood) {
  const row = chartData.find(r => r.month === month && r.hood === hood);

  const member = Math.round(row.memberShare * 100);
  const casual = 100 - member;

  return {
    type: "doughnut",
    data: {
      labels: ["Members (%)", "Casual (%)"],
      datasets: [{ label: "Rider mix", data: [member, casual] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${hood} (${month})` }
      }
    }
  };
}

// RADAR — compare neighborhoods across multiple metrics for one month
function radarCompareNeighborhoods(month) {
  const rows = chartData.filter(r => r.month === month);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.hood,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${month})` }
      }
    }
  };
}