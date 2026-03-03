// change this to reference the dataset you chose to work with.
import { climateData as chartData } from "./data/climateData.js";

// --- DOM helpers ---
const monthSelect = document.getElementById("monthSelect");
const citySelect = document.getElementById("citySelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const months = [...new Set(chartData.map(r => r.month))];
const citys = [...new Set(chartData.map(r => r.city))];

months.forEach(m => monthSelect.add(new Option(m, m)));
citys.forEach(h => citySelect.add(new Option(h, h)));

monthSelect.value = months[0];
citySelect.value = citys[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const month = monthSelect.value;
  const city = citySelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { month, city, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { month, city, metric }) {
  if (type === "bar") return barByCity(month, metric);
  if (type === "line") return lineOverTime(city, ["windKph", "airQualityIndex"]);
  if (type === "scatter") return scatterTripsVsTemp(city);
  if (type === "doughnut") return doughnutWeatherVsSelf(month, city);
  if (type === "radar") return radarCompareCitys(month);
  return barByCity(month, metric);
}

// Task A: BAR — compare citys for a given month
function barByCity(month, metric) {
  const rows = chartData.filter(r => r.month === month);

  const labels = rows.map(r => r.city);
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
        title: { display: true, text: `City comparison (${month})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "City" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one city (2 datasets)
function lineOverTime(city, metrics) {
  const rows = chartData.filter(r => r.city === city);

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
        title: { display: true, text: `Trends over time: ${city}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Month" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(city) {
  const rows = chartData.filter(r => r.city === city);

  const points = rows.map(r => ({ x: r.minTempC, y: r.maxTempC }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Trips vs Temp (${city})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does temperature affect trips? (${city})` }
      },
      scales: {
        x: { title: { display: true, text: "Temperature (C)" } },
        y: { title: { display: true, text: "Trips" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one city + month
function doughnutWeatherVsSelf(month, city) {
  const row = chartData.find(r => r.month === month && r.city === city);

  const weather = Math.round(row.avgTempC * 100);
  const self = 100 - weather;

  return {
    type: "doughnut",
    data: {
      labels: ["Weathers (%)", "Self (%)"],
      datasets: [{ label: "Rider mix", data: [weather, self] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${city} (${month})` }
      }
    }
  };
}

// RADAR — compare citys across multiple metrics for one month
function radarCompareCitys(month) {
  const rows = chartData.filter(r => r.month === month);

  const metrics = ["avgTempC", "minTempC", "maxTempC", "humidityPct"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.city,
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