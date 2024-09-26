document.addEventListener('DOMContentLoaded', function () {
  const speedInput = document.getElementById('speed');
  const speedValue = document.getElementById('speedValue');
  const resetButton = document.getElementById('resetSpeed');

  // Function to get the current playback speed of the first video (injected into the page)
  function getCurrentVideoSpeed() {
    const video = document.querySelector('video');
    if (video) {
      return video.playbackRate;
    }
    return 1.0; // Default speed if no video is found
  }

  // Function to change the video speed (injected into the page)
  function changeVideoSpeed(speed) {
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) {
      console.error("No video elements found on the page.");
      return;
    }

    // Update the playback rate of each video
    videos.forEach(video => {
      video.playbackRate = speed;
    });

    // Observe changes in the DOM (important for SPAs like YouTube, Netflix, etc.)
    const observer = new MutationObserver(() => {
      const newVideos = document.querySelectorAll("video");
      newVideos.forEach(video => {
        video.playbackRate = speed;
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Fetch and display the current speed when the popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    
    // Ensure the URL is not a restricted page
    if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('file://')) {
      // Inject script to get the current video speed
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getCurrentVideoSpeed
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const currentSpeed = results[0].result;
          speedInput.value = currentSpeed;
          speedValue.textContent = `${currentSpeed.toFixed(2)}x`; // Display speed with two decimal places
        }
      });
    } else {
      return;
    }
  });

  // Handle input change in the popup
  speedInput.oninput = function () {
    const speed = parseFloat(this.value);
    speedValue.textContent = `${speed.toFixed(2)}x`; // Update text as slider changes

    // Inject the video speed-changing script into the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      
      // Ensure the URL is not a restricted page
      if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('file://')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: changeVideoSpeed,
          args: [speed]
        });
      } else {
        return;
      }
    });
  };

  // Handle reset button click
  resetButton.onclick = function () {
    const resetSpeed = 1.0;
    speedInput.value = resetSpeed;
    speedValue.textContent = `${resetSpeed.toFixed(2)}x`; // Reset text to 1x

    // Reset speed to 1x for all videos
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      
      // Ensure the URL is not a restricted page
      if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('file://')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: changeVideoSpeed,
          args: [resetSpeed]
        });
      } else {
        return;
      }
    });
  };
});
