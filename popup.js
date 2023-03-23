let toggleBtn = document.getElementById("toggle");
toggleBtn.addEventListener("click", toggle);
let openAppBtn = document.getElementById("open-app-btn");

chrome.runtime.sendMessage(
  {
    from: "popup",
    action: "check-app-status",
  },
  (response) => {
    if (response.appStatus == "ON") {
      toggleBtn.checked = true;
      openAppBtn.disabled = false;
    } else if (response.appStatus == "OFF") {
      toggleBtn.checked = false;
      openAppBtn.disabled = true;
    }
  }
);

function startChatListener() {
  chrome.runtime.sendMessage({
    from: "popup",
    action: "start-listen-chat",
  });
}

function stopChatListener() {
  chrome.runtime.sendMessage({
    from: "popup",
    action: "stop-listen-chat",
  });
}

function toggle() {
  if (toggleBtn.checked) {
    startChatListener();
    openAppBtn.disabled = false;
  } else {
    stopChatListener();
    openAppBtn.disabled = true;
  }
}
openAppBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage(
    {
      from: "popup",
      action: "app-start",
    },
    (response) => {
      if (response.failed) {
        document.getElementById("error").innerHTML =
          "No twitch chat identified";
      } else {
        document.getElementById("error").innerHTML = "";
      }
    }
  );
});
