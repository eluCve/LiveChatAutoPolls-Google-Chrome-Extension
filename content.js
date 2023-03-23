const messageList = document.getElementsByClassName(
  "chat-scrollable-area__message-container"
);
let chatObserver;
let currentlyViewing;

function startObserver() {
  chatObserver.observe(messageList[0], {
    attributes: false,
    childList: true,
    characterData: false,
  });
}

chatObserver = new MutationObserver((entries) => {
  entries.forEach((element) => {
    let allMessages = element.target.children;
    let lastMessage = Object.values(allMessages).pop();
    let lastMessageText = lastMessage
      .querySelector('[data-a-target="chat-line-message-body"]')
      .getElementsByClassName("text-fragment")[0];
    if (lastMessageText.textContent || lastMessageText.textContent != "")
      sendList(lastMessageText.textContent);
  });
});

function sendList(message) {
  chrome.runtime.sendMessage({
    from: "content-message",
    message,
    currentlyViewing: window.location.pathname,
  });
}

setInterval(() => {
  chrome.runtime.sendMessage({
      from: "content",
    },
    (response) => {
      if (response.startChatListener) {
        chrome.runtime.sendMessage({
          from: "content-app-permission",
          action: "allowAppStart",
        });
        startObserver();
      }
      if (response.stopChatListener) {
        chatObserver.disconnect();
        chrome.runtime.sendMessage({
          from: "content-app-permission",
          action: "disableAppStart",
        });
      }
    }
  );
}, 1000);

window.onload = () => {
  chrome.runtime.sendMessage({
      from: "content-starting",
    },
    (response) => {
      if (response.isAlreadyOn) {
        chrome.runtime.sendMessage({
          from: "content-app-permission",
          action: "allowAppStart",
        });
        startObserver();
      }
    }
  );
};