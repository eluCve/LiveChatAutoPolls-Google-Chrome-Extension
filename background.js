let appStatus = "OFF";
let allowAppStart = false;
let startChatListener = false;
let stopChatListener = false;
let allWordsList = [];
let currentlyViewing = "";
let doNotInclude = ["", "i"];
let isAlreadyOn = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // REQUESTS FROM POPUP
  if (request.from == "popup") {
    if (request.action == "start-listen-chat") {
      startChatListener = true;
      appStatus = "ON";
      isAlreadyOn = true;
    } else if (request.action == "stop-listen-chat") {
      stopChatListener = true;
      appStatus = "OFF";
      isAlreadyOn = false;
    } else if (request.action == "check-app-status") {
      sendResponse({ appStatus });
    } else if (request.action == "app-start") {
      if (allowAppStart) {
        sendResponse({ failed: false });
        let top = 200;
        let left = 200;
        chrome.windows.create({
          url: "app.html",
          type: "popup",
          width: 450,
          height: 350,
          left,
          top,
        });
      } else {
        sendResponse({ failed: true });
      }
    }
  }
  // REQUESTS FROM CONTENT
  if (request.from == "content") {
    // every twitch window use these requests simultaniusly
    if (startChatListener) {
      sendResponse({ startChatListener, stopChatListener });
      startChatListener = false;
    } else if (stopChatListener) {
      sendResponse({ startChatListener, stopChatListener });
      stopChatListener = false;
    } else {
      sendResponse({ startChatListener: false, stopChatListener: false });
    }
  }

  if (request.from == "content-message") {
    splitWordsFromMessage(request.message);
    currentlyViewing = request.currentlyViewing;
  }

  if (request.from == "content-app-permission") {
    if (request.action == "allowAppStart") {
      allowAppStart = true;
    } else if (request.action == "disableAppStart") {
      allowAppStart = false;
    }
  }

  if (request.from == "content-starting") {
    sendResponse({ isAlreadyOn });
  }
  //REQUESTS FROM APP
  if (request.from == "app") {
    if (request.action == "get-data") {
      let topFiveWords = allWordsListSorted.slice(0, 5);
      sendResponse({ topFiveWords, currentlyViewing });
    } else if (request.action == "reset-data") {
      resetDataChart();
    }
  }
});

function splitWordsFromMessage(message) {
  let wordsArray = message.split(" ");
  let wordsArrayLowcase = wordsArray.map((word) => {
    return word.toLowerCase();
  });
  let filteredArray = wordsArrayLowcase.filter(
    (word) => !doNotInclude.includes(word)
  );
  let uniqueWordsArrayLowcase = [...new Set(filteredArray)];
  uniqueWordsArrayLowcase.forEach((word) => {
    let findWord = allWordsList.find((pair) => pair.word === word);
    if (findWord) {
      findWord.count++;
    } else {
      allWordsList.push({ word, count: 1 });
    }
  });
  allWordsListSorted = allWordsList.sort((a, b) => b.count - a.count);
}

function resetDataChart() {
  allWordsList = [];
}
