// ==UserScript==
// @name           Chat Image Display
// @namespace      https://c0iiwr.github.io/Chat-Image-Display/
// @version        1.20
// @description    Displaying images, video, and audio in chat
// @description:ru Отображение изображений, видео и аудио в чате
// @author         c0IIwr
// @match          https://live.vkvideo.ru/*
// @match          https://www.twitch.tv/*
// @match          https://goodgame.ru/*
// @match          https://trovo.live/*
// @match          https://boosty.to/*
// @match          https://kick.com/*
// @connect        segs.lol
// @icon           https://cdn-icons-png.flaticon.com/512/6631/6631821.png
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  const siteConfigs = [
    {
      domain: "live.vkvideo.ru",
      scrollableSelector: ".ChatBoxBase_root_k1P9S",
      chatInputSelector: '.ce-paragraph.cdx-block[contenteditable="true"]',
    },
    {
      domain: "boosty.to",
      scrollableSelector: ".ReactVirtualized__Grid__innerScrollContainer",
      chatInputSelector: '.ce-paragraph.cdx-block[contenteditable="true"]',
    },
    {
      domain: "kick.com",
      scrollableSelector: ".overflow-x-hidden.overflow-y-scroll.py-3",
      placeholderSelector:
        "#chat-input-wrapper div.pointer-events-none.absolute",
    },
    {
      domain: "www.twitch.tv",
      scrollableSelector: ".scrollable-contents",
      placeholderSelector: ".chat-wysiwyg-input__placeholder",
    },
    {
      domain: "goodgame.ru",
      scrollableSelector: ".tse-scroll-content",
      chatInputSelector: '.textarea[contenteditable="true"]',
    },
    {
      domain: "trovo.live",
      scrollableSelector: ".chat-list-box.snap-scroller-content",
      chatInputSelector: '[data-v-71b14096][contenteditable="true"]',
    },
  ];

  function getCurrentSiteConfig() {
    const currentDomain = window.location.hostname;
    return siteConfigs.find((config) => currentDomain.includes(config.domain));
  }

  const siteConfig = getCurrentSiteConfig();

  function isVKVideoAuthorized() {
    if (siteConfig && siteConfig.domain === "live.vkvideo.ru") {
      const loginButton = document.querySelector(
        "button.TopMenuRightUnAuthorized_button_wn5kP"
      );
      return !loginButton;
    }
    return true;
  }

  function clickLikeButton() {
    if (!isVKVideoAuthorized()) return;

    let likeButton = document.querySelector("[class^=LikeButton_]");
    if (
      likeButton &&
      likeButton.querySelector(".LikeButton_iconLiked_ETS_f") === null
    ) {
      likeButton.click();
    }
  }

  function clickBonusButton() {
    let bonusButton = document.querySelector(
      "[class^=PointActions_buttonBonus_]"
    );
    if (bonusButton) bonusButton.click();
  }

  setInterval(() => {
    clickLikeButton();
    clickBonusButton();
  }, 1000);

  const loadingAnimation = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let animationIndex = 0;
  let animationInterval = null;

  function displayLoadingMessage() {
    let target = null;

    if (
      siteConfig.domain === "www.twitch.tv" ||
      siteConfig.domain === "kick.com"
    ) {
      target = document.querySelector(siteConfig.placeholderSelector);
    } else {
      target = document.querySelector(siteConfig.chatInputSelector);
    }

    if (!target) return;

    target.textContent = "";

    animationInterval = setInterval(() => {
      const text = "Загрузка " + loadingAnimation[animationIndex];
      animationIndex = (animationIndex + 1) % loadingAnimation.length;
      target.textContent = text;
    }, 100);
  }

  function showSuccessMessage() {
    if (
      siteConfig.domain === "www.twitch.tv" ||
      siteConfig.domain === "kick.com"
    ) {
      const placeholder = document.querySelector(
        siteConfig.placeholderSelector
      );
      if (placeholder) {
        placeholder.textContent = "Ссылка скопирована в буфер обмена";
        setTimeout(() => {
          if (placeholder.textContent === "Ссылка скопирована в буфер обмена") {
            placeholder.textContent = "Send a message";
          }
        }, 3000);
      }
    }
  }

  function stopLoadingAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }

  function getFileExtension(fileName) {
    const parts = fileName.split(".");
    return parts.length > 1 ? "." + parts.pop().toLowerCase() : "";
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("[CID] Clipboard API failed:", err);
      return false;
    }
  }

  let currentFileExtension = "";

  function uploadFile(file) {
    currentFileExtension = getFileExtension(file.name);
    displayLoadingMessage();
    const formData = new FormData();
    formData.append("file", file);

    GM_xmlhttpRequest({
      method: "POST",
      url: "https://segs.lol/api/upload",
      data: formData,
      onload: async (response) => {
        stopLoadingAnimation();
        try {
          const jsonResponse = JSON.parse(response.responseText);
          let link = jsonResponse.link;
          if (currentFileExtension) link += currentFileExtension;

          let copied = false;
          for (let i = 0; i < 3; i++) {
            copied = await copyToClipboard(link);
            if (copied) break;
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          if (
            siteConfig.domain === "www.twitch.tv" ||
            siteConfig.domain === "kick.com"
          ) {
            showSuccessMessage();
          } else {
            const chatInput = document.querySelector(
              siteConfig.chatInputSelector
            );
            if (chatInput) {
              chatInput.textContent = link;
              chatInput.dispatchEvent(
                new Event("input", { bubbles: true, cancelable: true })
              );
              chatInput.focus();
            }
          }
        } catch (e) {
          console.error(
            "[CID] Error parsing segs.lol response",
            e,
            response.responseText
          );
        }
      },
      onerror: (response) => {
        stopLoadingAnimation();
        console.error("[CID] segs.lol upload error", response);
      },
    });
  }

  function handlePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) {
          uploadFile(file);
          event.preventDefault();
          break;
        }
      }
    }
  }

  function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }

  document.addEventListener("paste", handlePaste);
  document.addEventListener("drop", handleFileDrop);
  document.addEventListener("dragover", (event) => event.preventDefault());

  function processMedia(extensions, createMediaElementCallback) {
    const links = [
      ...document.querySelectorAll('a[href]:not([data-processed="true"])'),
    ];

    links.forEach((linkElement) => {
      let originalHref = linkElement.getAttribute("href");
      let checkHref = originalHref.toLowerCase();

      if (
        siteConfig &&
        siteConfig.domain === "kick.com" &&
        (originalHref.includes("files.kick.com") ||
          originalHref.includes("/img/default-channel-banners/"))
      ) {
        return;
      }

      if (
        siteConfig &&
        siteConfig.scrollableSelector &&
        siteConfig.domain !== "kick.com"
      ) {
        if (!linkElement.closest(siteConfig.scrollableSelector)) return;
      }

      let mediaSrc = originalHref;
      if (checkHref.endsWith(".gifv")) {
        checkHref = checkHref.slice(0, -1);
        mediaSrc = originalHref.slice(0, -1);
      }

      if (extensions.some((ext) => checkHref.includes(ext))) {
        linkElement.dataset.processed = "true";

        const media = createMediaElementCallback(mediaSrc);

        if (media) {
          media.onload = media.onloadedmetadata = () => {
            const wrapperDiv = document.createElement("div");
            wrapperDiv.style.display = "inline-block";
            wrapperDiv.style.maxWidth = "100%";
            wrapperDiv.style.position = "relative";
            wrapperDiv.appendChild(media);

            linkElement.parentNode.insertBefore(
              wrapperDiv,
              linkElement.nextSibling
            );
            linkElement.style.display = "none";

            if (
              siteConfig &&
              siteConfig.scrollableSelector &&
              siteConfig.domain !== "goodgame.ru"
            ) {
              const scrollable = document.querySelector(
                siteConfig.scrollableSelector
              );
              if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
            }
          };

          Object.assign(media.style, {
            maxWidth: "100%",
            maxHeight: "322px",
            display: "block",
            cursor: "pointer",
            borderRadius: "4px",
            margin: "4px",
          });

          media.addEventListener("click", (e) => {
            if (e.button === 0) {
              e.preventDefault();
              navigator.clipboard.writeText(originalHref);
              window.open(originalHref, "_blank", "noopener,noreferrer");
            }
          });

          media.addEventListener("auxclick", (e) => {
            if (e.button === 1) {
              e.preventDefault();
              const newWindow = window.open(
                originalHref,
                "_blank",
                "noopener,noreferrer"
              );
              if (newWindow) newWindow.blur();
              window.focus();
            }
          });

          media.addEventListener("mousedown", (e) => {
            if (e.button === 1) e.preventDefault();
          });
        }
      }
    });
  }

  function processChatImage() {
    processMedia([".jpeg", ".jpg", ".png", ".gif", ".webp", ".avif"], (src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }

  function processChatVideo() {
    processMedia([".mp4", ".webm", ".mov"], (src) => {
      const video = document.createElement("video");
      video.src = src;
      video.loop = true;
      video.muted = true;
      video.preload = "auto";

      let timeout;
      video.onmouseover = () => {
        clearTimeout(timeout);
        video.play();
        video.controls = true;
      };
      video.onmouseout = () => {
        timeout = setTimeout(() => {
          video.muted = true;
          video.controls = false;
        }, 3000);
      };

      return video;
    });
  }

  function processChatAudio() {
    processMedia([".mp3", ".ogg"], (src) => {
      const audio = document.createElement("audio");
      audio.src = src;
      audio.loop = true;
      audio.muted = true;
      audio.preload = "auto";
      audio.controls = true;

      let timeout;
      audio.onmouseover = () => {
        clearTimeout(timeout);
        audio.play();
      };
      audio.onmouseout = () => {
        timeout = setTimeout(() => {
          audio.muted = true;
        }, 3000);
      };

      return audio;
    });
  }

  processChatImage();
  processChatVideo();
  processChatAudio();

  setInterval(() => {
    processChatImage();
    processChatVideo();
    processChatAudio();
  }, 1000);
})();
