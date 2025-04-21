document.addEventListener("DOMContentLoaded", function () {
  const urlInput = document.getElementById("urlInput");
  const addButton = document.getElementById("addUrl");
  const blockedUrlsContainer = document.getElementById("blockedUrls");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const saveTimeButton = document.getElementById("saveTime");

  // Load and display blocked URLs
  function loadBlockedUrls() {
    chrome.storage.sync.get(["blockedUrls"], function (result) {
      const blockedUrls = result.blockedUrls || [];
      const urlsList =
        blockedUrlsContainer.querySelector("div") ||
        document.createElement("div");
      urlsList.innerHTML = "";

      blockedUrls.forEach((url) => {
        const urlElement = document.createElement("div");
        urlElement.className = "blocked-url";
        urlElement.innerHTML = `
          <span>${url}</span>
          <span class="remove-btn" data-url="${url}">x</span>
        `;
        urlsList.appendChild(urlElement);
      });

      if (!blockedUrlsContainer.querySelector("div")) {
        blockedUrlsContainer.appendChild(urlsList);
      }
    });
  }

  // Load time settings
  function loadTimeSettings() {
    chrome.storage.sync.get(["startTime", "endTime"], function (result) {
      startTimeInput.value = result.startTime || "09:00";
      endTimeInput.value = result.endTime || "17:00";
    });
  }

  // Add new URL to blocked list
  addButton.addEventListener("click", function () {
    const url = urlInput.value.trim().toLowerCase();
    if (url) {
      // Remove http://, https://, and www. from the URL for better matching
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, "");

      chrome.storage.sync.get(["blockedUrls"], function (result) {
        const blockedUrls = result.blockedUrls || [];
        if (!blockedUrls.includes(cleanUrl)) {
          blockedUrls.push(cleanUrl);
          chrome.storage.sync.set({ blockedUrls: blockedUrls }, function () {
            urlInput.value = "";
            loadBlockedUrls();
          });
        }
      });
    }
  });

  // Remove URL from blocked list
  blockedUrlsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      const urlToRemove = e.target.getAttribute("data-url");
      chrome.storage.sync.get(["blockedUrls"], function (result) {
        const blockedUrls = result.blockedUrls || [];
        const updatedUrls = blockedUrls.filter((url) => url !== urlToRemove);
        chrome.storage.sync.set({ blockedUrls: updatedUrls }, function () {
          loadBlockedUrls();
        });
      });
    }
  });

  // Save time settings
  saveTimeButton.addEventListener("click", function () {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    chrome.storage.sync.set(
      {
        startTime: startTime,
        endTime: endTime,
      },
      function () {
        alert("Schedule saved!");
      }
    );
  });

  // Initial load
  loadBlockedUrls();
  loadTimeSettings();
});
