// Check if current time is within blocking hours
function isWithinBlockingHours() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["startTime", "endTime"], function (result) {
      const startTime = result.startTime || "09:00";
      const endTime = result.endTime || "17:00";

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      resolve(
        currentTime >= startTimeInMinutes && currentTime <= endTimeInMinutes
      );
    });
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Check if the URL should be blocked
    chrome.storage.sync.get(["blockedUrls"], function (result) {
      const blockedUrls = result.blockedUrls || [];
      const currentUrl = tab.url.toLowerCase();

      // Check if the current URL contains any of the blocked URLs
      const shouldBlock = blockedUrls.some((blockedUrl) =>
        currentUrl.includes(blockedUrl.toLowerCase())
      );

      if (shouldBlock) {
        // Check if we're within blocking hours
        isWithinBlockingHours().then((withinHours) => {
          if (withinHours) {
            // Redirect to a blocked page
            chrome.tabs.update(tabId, {
              url: chrome.runtime.getURL("blocked.html"),
            });
          }
        });
      }
    });
  }
});
