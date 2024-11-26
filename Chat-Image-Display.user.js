// ==UserScript==
// @name           Chat Image Display
// @namespace      https://c0iiwr.github.io/Chat-Image-Display/
// @version        1.18
// @description    Displaying images, video, and audio in chat
// @description:ru Отображение изображений, видео и аудио в чате
// @author         c0IIwr
// @match          https://live.vkvideo.ru/*
// @match          https://live.vkplay.ru/*
// @match          https://www.twitch.tv/*
// @match          https://goodgame.ru/*
// @match          https://trovo.live/*
// @match          https://boosty.to/*
// @match          https://kick.com/*
// @match          https://nuum.ru/*
// @connect        kappa.lol
// @icon           https://cdn-icons-png.flaticon.com/512/6631/6631821.png
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";

  const siteConfigs = [
    {
      domain: "live.vkplay.ru",
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
      chatInputSelector: '[id="message-input"][contenteditable="true"]',
    },
    {
      domain: "www.twitch.tv",
      scrollableSelector: ".scrollable-contents",
      chatInputSelector: ".chat-wysiwyg-input__placeholder",
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
    {
      domain: "nuum.ru",
      chatInputSelector: ".chat-input__input.input",
      messageSelector: ".message__body-text",
    },
  ];

  function getCurrentSiteConfig() {
    const currentDomain = window.location.hostname;
    return siteConfigs.find((config) => currentDomain.includes(config.domain));
  }

  function clickLikeButton() {
    let likeButton = document.querySelector("[class^=LikeButton_]");
    if (
      likeButton &&
      likeButton.querySelector(".LikeButton_iconLiked_ETS_f") === null
    ) {
      likeButton.click();
    }

    let likeNuumButton = document.querySelector(".reactions__button");
    if (
      likeNuumButton &&
      !likeNuumButton.classList.contains("button--active")
    ) {
      likeNuumButton.click();
    }
  }

  function clickBonusButton() {
    let bonusButton = document.querySelector(
      "[class^=PointActions_buttonBonus_]"
    );
    if (bonusButton) {
      bonusButton.click();
    }
  }

  setInterval(() => {
    clickLikeButton();
    clickBonusButton();
  }, 1000);

  const currentSiteConfig = getCurrentSiteConfig();
  const loadingAnimation = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let animationIndex = 0;
  let animationInterval;

  function displayLoadingMessage() {
    const chatInput = document.querySelector(
      currentSiteConfig.chatInputSelector
    );
    if (chatInput) {
      startLoadingAnimation(chatInput);
    }
  }

  function startLoadingAnimation(chatInput) {
    animationInterval = setInterval(function () {
      chatInput.textContent = "Загрузка " + loadingAnimation[animationIndex];
      animationIndex = (animationIndex + 1) % loadingAnimation.length;
    }, 100);
  }

  function stopLoadingAnimation(chatInput) {
    clearInterval(animationInterval);
    chatInput.textContent = "";
  }

  function getFileExtension(fileName) {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  function copyToClipboard(text) {
    const input = document.createElement("input");
    input.style.position = "fixed";
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }

  function uploadToKappa(file) {
    displayLoadingMessage();
    let formData = new FormData();
    formData.append("file", file);
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://kappa.lol/api/upload",
      data: formData,
      onload: function (response) {
        stopLoadingAnimation(
          document.querySelector(currentSiteConfig.chatInputSelector)
        );
        const jsonResponse = JSON.parse(response.responseText);
        const link = jsonResponse.link;
        const fileExtension = getFileExtension(file.name);
        const completeLink = `${link}.${fileExtension}`;
        copyToClipboard(completeLink);
        postLinkInChat(completeLink);
      },
      onerror: function (response) {
        stopLoadingAnimation(
          document.querySelector(currentSiteConfig.chatInputSelector)
        );
        console.error("[CID] Kappa upload error", response);
      },
    });
  }

  function postLinkInChat(link) {
    const chatInput = document.querySelector(
      currentSiteConfig.chatInputSelector
    );
    if (chatInput) {
      chatInput.textContent = link;
      const event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      chatInput.dispatchEvent(event);
    } else {
      console.error("[CID] Chat input not found");
    }
  }

  function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) {
      uploadToKappa(files[0]);
    }
  }
  document.addEventListener("drop", handleFileDrop);
  document.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + "</a>";
    });
  }

  function processChatLinks() {
    const currentSiteConfig = getCurrentSiteConfig();
    const messageSelector =
      currentSiteConfig.messageSelector || ".message__body-text";
    const messages = document.querySelectorAll(messageSelector);
    messages.forEach(function (message) {
      if (!message.dataset.processed) {
        if (!message.querySelector('img[class*="sticker"]')) {
          message.innerHTML = linkify(message.textContent);
        }
        message.dataset.processed = "true";
      }
    });
  }

  let processChatImage = () => {
    let imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp", ".avif"];
    let links = [...document.querySelectorAll("[href]")];
    let siteConfig = getCurrentSiteConfig();
    links.forEach((imageElement) => {
      if (imageElement.dataset.processed === "true") {
        return;
      }
      let imageLink = imageElement.getAttribute("href");
      if (imageLink.endsWith(".gifv")) {
        imageLink = imageLink.slice(0, -1);
        imageElement.setAttribute("href", imageLink);
        imageElement.textContent = imageLink;
      }
      let matched = imageExtensions.some((ext) => imageLink.includes(ext));
      if (matched) {
        imageElement.dataset.processed = "true";

        let image = new Image();
        image.onload = () => {
          let wrapperDiv = document.createElement("div");
          wrapperDiv.style.display = "inline-block";
          wrapperDiv.style.maxWidth = "100%";
          wrapperDiv.style.position = "relative";
          wrapperDiv.appendChild(image);
          imageElement.parentNode.insertBefore(
            wrapperDiv,
            imageElement.nextSibling
          );
          imageElement.style.display = "none";
          if (siteConfig && siteConfig.scrollableSelector) {
            let scrollableElement = document.querySelector(
              siteConfig.scrollableSelector
            );
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          } else {
            parent.scrollIntoView(false);
          }
        };
        image.src = imageLink;
        image.style.maxWidth = "100%";
        image.style.maxHeight = "322px";
        image.style.display = "block";
        image.style.cursor = "pointer";
        image.style.borderRadius = "4px";
        image.style.margin = "4px";
        let clicks = 0;
        image.addEventListener("mousedown", (event) => {
          if (event.which === 2) {
            event.preventDefault();
            window.open(imageLink, "_blank");
          }
        });
        image.addEventListener("click", (event) => {
          const doubleClickDelay = 400;
          clicks++;
          if (clicks === 1) {
            setTimeout(() => {
              if (clicks === 1) {
                navigator.clipboard
                  .writeText(imageLink)
                  .then(() => {
                    console.log("Image link copied to clipboard");
                  })
                  .catch((err) => {
                    console.error(
                      "[CID] Error copying image link to clipboard",
                      err
                    );
                  });
              }
              clicks = 0;
            }, doubleClickDelay);
          } else if (clicks === 2) {
            window.open(imageLink, "_blank");
            clicks = 0;
          }
        });
      }
    });
  };

  let processChatVideo = () => {
    let videoExtensions = [".mp4", ".webm", ".mov"];
    let links = [...document.querySelectorAll("[href]")];
    let siteConfig = getCurrentSiteConfig();
    links.forEach((videoElement) => {
      if (videoElement.dataset.processed === "true") {
        return;
      }
      let videoLink = videoElement.getAttribute("href");
      let matched = videoExtensions.some((ext) => videoLink.includes(ext));
      if (matched) {
        videoElement.dataset.processed = "true";

        let video = document.createElement("video");
        video.setAttribute("src", videoLink);
        video.setAttribute("loop", "loop");
        video.setAttribute("muted", "muted");
        video.setAttribute("preload", "auto");
        video.style.maxWidth = "100%";
        video.style.maxHeight = "322px";
        video.style.display = "block";
        video.style.borderRadius = "4px";
        video.style.margin = "4px";
        video.addEventListener("mousedown", (event) => {
          if (event.which === 2) {
            event.preventDefault();
            window.open(videoLink, "_blank");
          }
        });
        let controlsTimeout;
        video.onmouseover = () => {
          clearTimeout(controlsTimeout);
          video.play();
          video.controls = true;
          video.muted = true;
        };
        video.onmouseout = () => {
          controlsTimeout = setTimeout(() => {
            video.controls = false;
            video.muted = true;
          }, 500);
        };
        video.onloadedmetadata = () => {
          let wrapperDiv = document.createElement("div");
          wrapperDiv.style.display = "inline-block";
          wrapperDiv.style.maxWidth = "100%";
          wrapperDiv.style.position = "relative";
          wrapperDiv.appendChild(video);
          videoElement.parentNode.insertBefore(
            wrapperDiv,
            videoElement.nextSibling
          );
          videoElement.style.display = "none";
          if (siteConfig && siteConfig.scrollableSelector) {
            let scrollableElement = document.querySelector(
              siteConfig.scrollableSelector
            );
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          } else {
            parent.scrollIntoView(false);
          }
        };
      }
    });
  };

  let processChatAudio = () => {
    let audioExtensions = [".mp3", ".ogg"];
    let links = [...document.querySelectorAll("[href]")];
    let siteConfig = getCurrentSiteConfig();
    links.forEach((audioElement) => {
      if (audioElement.dataset.processed === "true") {
        return;
      }
      let audioLink = audioElement.getAttribute("href");
      let matched = audioExtensions.some((ext) => audioLink.includes(ext));
      if (matched) {
        audioElement.dataset.processed = "true";

        let audio = document.createElement("audio");
        audio.setAttribute("src", audioLink);
        audio.setAttribute("loop", "loop");
        audio.setAttribute("muted", "muted");
        audio.setAttribute("preload", "auto");
        audio.setAttribute("controls", "controls");
        audio.style.maxWidth = "100%";
        audio.style.maxHeight = "322px";
        audio.style.display = "block";
        audio.style.borderRadius = "4px";
        audio.style.margin = "4px";
        audio.addEventListener("mousedown", (event) => {
          if (event.which === 2) {
            event.preventDefault();
            window.open(audioLink, "_blank");
          }
        });
        let controlsTimeout;
        audio.onmouseover = () => {
          clearTimeout(controlsTimeout);
          audio.play();
          audio.muted = true;
        };
        audio.onmouseout = () => {
          controlsTimeout = setTimeout(() => {
            audio.muted = true;
          }, 500);
        };
        audio.onloadedmetadata = () => {
          let wrapperDiv = document.createElement("div");
          wrapperDiv.style.display = "inline-block";
          wrapperDiv.style.maxWidth = "100%";
          wrapperDiv.style.position = "relative";
          wrapperDiv.appendChild(audio);
          audioElement.parentNode.insertBefore(
            wrapperDiv,
            audioElement.nextSibling
          );
          audioElement.style.display = "none";
          if (siteConfig && siteConfig.scrollableSelector) {
            let scrollableElement = document.querySelector(
              siteConfig.scrollableSelector
            );
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          } else {
            parent.scrollIntoView(false);
          }
        };
      }
    });
  };

  processChatImage();
  processChatVideo();
  processChatAudio();
  processChatLinks();
  setInterval(() => {
    processChatImage();
    processChatVideo();
    processChatAudio();
    processChatLinks();
  }, null);
})();
