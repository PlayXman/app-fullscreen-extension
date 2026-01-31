async function openFullscreen(activeTab) {
  try {
    await browser.scripting.executeScript({
      target: {
        tabId: activeTab.id
      },
      func: async () => {
        try {
          if (!document.fullscreenElement) {
            console.info('Switching to fullscreen mode');
            await document.body.requestFullscreen();
          } else {
            console.info('Exiting fullscreen mode');
            document.exitFullscreen?.();
          }
        } catch (error) {
          console.error('Failed to request fullscreen', error);
        }
      },
    });
  } catch(error) {
    console.error('Failed to get active tab', error);
  }
}

browser.action.onClicked.addListener(openFullscreen);
