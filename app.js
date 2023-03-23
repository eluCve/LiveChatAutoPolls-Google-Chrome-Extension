let chart = document.getElementById("chart").getContext("2d");
let currentlyViewing = document.getElementById("currentlyViewing");
let startingTimer = 15;
let timerValue = startingTimer;
let resetInterval;
document.getElementById("timer").value;
let resetTimer = document
  .getElementById("set-timer")
  .addEventListener("submit", (e) => {
    timerValue = document.getElementById("timer").value;
    setTimer(timerValue);
    chrome.runtime.sendMessage({
      from: "app",
      action: "reset-data",
    });
    clearInterval(resetInterval);
    resetInterval = setInterval(() => {
      chrome.runtime.sendMessage({
        from: "app",
        action: "reset-data",
      });
    }, timerValue * 1000);
    e.preventDefault();
  });
let barChart = new Chart(chart, {
  type: "bar",
  data: {
    labels: ["", "", "", "", ""],
    datasets: [
      {
        label: "volume",
        data: [0, 0, 0, 0, 0],
        backgroundColor: ["#e86135", "#fff", "#fff", "#fff", "#fff"],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
        grid: {
          color: "#203243",
        },
        ticks: {
          color: "#909090",
        },
      },
      y: {
        grid: {
          color: "#203243",
        },
        ticks: {
          color: ["#e86135", "#fff", "#fff", "#fff", "#fff"],
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});

setInterval(() => {
  chrome.runtime.sendMessage(
    {
      from: "app",
      action: "get-data",
    },
    (response) => {
      console.log(response);
      for (i = 0; i <= 4; i++) {
        barChart.data.labels[i] = response.topFiveWords[i].word;
        barChart.data.datasets[0].data[i] = response.topFiveWords[i].count;
      }
      currentlyViewing.innerHTML = response.currentlyViewing;
      barChart.update();
    }
  );
}, 333);

resetInterval = setInterval(() => {
  chrome.runtime.sendMessage({
    from: "app",
    action: "reset-data",
  });
}, timerValue * 1000);

document.getElementById("reset").addEventListener("click", () => {
  chrome.runtime.sendMessage({
    from: "app",
    action: "reset-data",
  });
  setTimer(timerValue);
  clearInterval(resetInterval);
  resetInterval = setInterval(() => {
    chrome.runtime.sendMessage({
      from: "app",
      action: "reset-data",
    });
  }, timerValue * 1000);
});

function setTimer(value) {
  startingTimer = value;
  timer = value;
}

setInterval(() => {
  if (timer > 0) {
    timer--;
  } else {
    timer = startingTimer;
  }
  document.getElementById("timer-display").innerHTML = timer;
}, 1000);
