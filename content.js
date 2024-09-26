document.addEventListener('DOMContentLoaded', function () {
  const speedInput = document.getElementById('speed');
  const speedValue = document.getElementById('speedValue');
  const resetButton = document.getElementById('resetSpeed');
  const decreaseBtn = document.getElementById('decrease');
  const increaseBtn = document.getElementById('increase');

  // get current video speed
  function getCurrentVideoSpeed() {
    const video = document.querySelector('video');
    if (video) {
      return video.playbackRate;
    }
    return 1.0;
  }

  // change the video speed 
  function changeVideoSpeed(speed) {
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) {
      return;
    }

    videos.forEach(video => {
      video.playbackRate = speed;
    });

    // all the video in the page will get the current speed
    const observer = new MutationObserver(() => {
      const newVideos = document.querySelectorAll("video");
      newVideos.forEach(video => {
        video.playbackRate = speed;
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    
    if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('file://')) {
      // Inject script to get the current video speed
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getCurrentVideoSpeed
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const currentSpeed = results[0].result;
          speedInput.value = currentSpeed;
          speedValue.textContent = `${currentSpeed.toFixed(2)}x`;
        }
      });
    } else {
      return;
    }
  });

  speedInput.oninput = function () {
    const speed = parseFloat(this.value);
    speedValue.textContent = `${speed.toFixed(2)}x`; 

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      
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
    speedValue.textContent = `${resetSpeed.toFixed(2)}x`; 

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

  // Decrease button handler
  decreaseBtn.onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      // Ensure the URL is not a restricted page
      if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('file://')) {
        // Get current video speed from the active tab
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: getCurrentVideoSpeed,
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const currSpeed = results[0].result;
            const newSpeed = Math.max(0.25, currSpeed - 0.25);

            // Update the UI
            speedInput.value = newSpeed;
            speedValue.textContent = newSpeed;

            // Change the video speed on the page
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: changeVideoSpeed,
              args: [newSpeed]
            });
          }
        });
      }
    });
  };

  // Increase button handler
  increaseBtn.onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      // Ensure the URL is not a restricted page
      if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('about:') && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('file://')) {
        // Get current video speed from the active tab
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: getCurrentVideoSpeed,
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const currSpeed = results[0].result;
            const newSpeed = Math.min(5, currSpeed + 0.25);

            // Update the UI
            speedInput.value = newSpeed;
            speedValue.textContent = newSpeed;

            // Change the video speed on the page
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: changeVideoSpeed,
              args: [newSpeed]
            });
          }
        });
      }
    });
  };

});

