function injectedScript() {
  const prefix = "goFullscreen";
  let dialogEl;

  /**
   * Create and attach global styles for fullscreen element. Fix the mobile device notches covering the content.
   */
  function attachFullscreenElementStyles() {
    const elId = `${prefix}Styles`;

    let el = document.getElementById(elId);
    if (el != null) {
      return;
    }

    el = document.createElement("style");
    el.id = elId;
    el.textContent = `
    @media (orientation: portrait) {
      html:fullscreen {
        margin-top: 20pt;
      }
    }

    @media (orientation: landscape) {
      html:fullscreen {
        margin-left: 20pt;
        margin-right: 20pt;
      }
    }`;

    document.head.appendChild(el);
  }

  /**
   * Close and remove the dialog.
   */
  function closeDialog() {
    dialogEl?.remove();
  }

  /**
   * Display root element in fullscreen.
   */
  async function displayFullscreen() {
    await document.documentElement.requestFullscreen();
    closeDialog();
  }

  dialogEl = document.createElement("div");
  dialogEl.className = `${prefix}_dialog`;

  const okButtonEl = document.createElement("button");
  okButtonEl.innerText = "Confirm";
  okButtonEl.addEventListener("click", displayFullscreen);
  const cancelButtonEl = document.createElement("button");
  cancelButtonEl.innerText = "Cancel";
  cancelButtonEl.addEventListener("click", closeDialog);

  const contentEl = document.createElement("div");
  contentEl.className = `${prefix}_dialogContent`;
  contentEl.innerHTML = `<h2 class="${prefix}_dialogTitle">Open in fullscreen?</h2>`;
  contentEl.appendChild(cancelButtonEl);
  contentEl.appendChild(okButtonEl);

  const styleEl = document.createElement("style");
  styleEl.textContent = `
  .${prefix}_dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5000;
    background: rgba(0,0,0,0.8);
    display: grid;
    justify-content: center;
    align-content: center;
}

  .${prefix}_dialogContent {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .${prefix}_dialogTitle {
    grid-column: 1 / -1;
  }`;

  dialogEl.appendChild(styleEl);
  dialogEl.appendChild(contentEl);

  attachFullscreenElementStyles();
  document.body.appendChild(dialogEl);
}

async function handleExtensionButtonClick(activeTab) {
  try {
    await browser.scripting.executeScript({
      target: {
        tabId: activeTab.id
      },
      func: injectedScript,
    });
  } catch(error) {
    console.error('Failed to get active tab', error);
  }
}

browser.action.onClicked.addListener(handleExtensionButtonClick);
