async function openFullscreen() {
  try {
    const currentTab = await browser.tabs.getCurrent();
    await currentTab.body.requestFullscreen();
  } catch(error) {
    console.error('Failed to open in fullscreen', error);
  }
}

browser.browserAction.onClicked.addListener(openFullscreen);