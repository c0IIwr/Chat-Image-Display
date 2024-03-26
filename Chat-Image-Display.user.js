// ==UserScript==
// @name           Chat Image Display
// @namespace      https://c0iiwr.github.io/Chat-Image-Display/
// @version        1.12
// @description    Displaying images, video, and audio in chat
// @description:ru Отображение изображений, видео и аудио в чате
// @author         c0IIwr
// @match          https://www.twitch.tv/*
// @match          https://goodgame.ru/*
// @match          https://live.vkplay.ru/*
// @match          https://trovo.live/*
// @match          https://boosty.to/*
// @match          https://kick.com/*
// @match          https://nuum.ru/*
// @connect        kappa.lol
// @icon           https://cdn-icons-png.flaticon.com/512/6631/6631821.png
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const siteConfigs = [{
        domain: 'vkplay.live',
        scrollableSelector: '.ChatBoxBase_root_k1P9S',
        chatInputSelector: '.ce-paragraph.cdx-block[contenteditable="true"]'
    }, {
        domain: 'boosty.to',
        scrollableSelector: '.ReactVirtualized__Grid__innerScrollContainer',
        chatInputSelector: '.ce-paragraph.cdx-block[contenteditable="true"]'
    }, {
        domain: 'kick.com',
        chatInputSelector: '[id="message-input"][contenteditable="true"]'
    }, {
        domain: 'twitch.tv',
        chatInputSelector: '.gWqzmh'
    }, {
        domain: 'goodgame.ru',
        chatInputSelector: '.textarea[contenteditable="true"]'
    }, {
        domain: 'trovo.live',
        chatInputSelector: '[data-v-71b14096][contenteditable="true"]'
    }, {
        domain: 'nuum.ru',
        chatInputSelector: '.chat-input__input.input'
    },];

    function getCurrentSiteConfig() {
        const currentDomain = window.location.hostname;
        return siteConfigs.find((config) => currentDomain.includes(config.domain));
    }

    function clickLikeButton() {
        let likeButton = document.querySelector('[class^=LikeButton_]');
        if (likeButton && likeButton.querySelector('.LikeButton_iconLiked_ETS_f') === null) {
            likeButton.click();
        }
    }

    function clickBonusButton() {
        let bonusButton = document.querySelector('[class^=PointActions_buttonBonus_]');
        if (bonusButton) {
            bonusButton.click();
        }
    }
    setInterval(() => {
        clickLikeButton();
        clickBonusButton();
    }, 1000);

    const currentSiteConfig = getCurrentSiteConfig();
    const loadingAnimation = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let animationIndex = 0;
    let animationInterval;

    function displayLoadingMessage() {
        const chatInput = document.querySelector(currentSiteConfig.chatInputSelector);
        if (chatInput) {
            startLoadingAnimation(chatInput);
        }
    }

    function startLoadingAnimation(chatInput) {
        animationInterval = setInterval(function () {
            chatInput.textContent = 'Загрузка ' + loadingAnimation[animationIndex];
            animationIndex = (animationIndex + 1) % loadingAnimation.length;
        }, 100);
    }

    function stopLoadingAnimation(chatInput) {
        clearInterval(animationInterval);
        chatInput.textContent = '';
    }

    function getFileExtension(fileName) {
        return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
    }

    function copyToClipboard(text) {
        const input = document.createElement('input');
        input.style.position = 'fixed';
        input.style.opacity = 0;
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }

    function uploadToKappa(file) {
        displayLoadingMessage();
        let formData = new FormData();
        formData.append('file', file);
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://kappa.lol/api/upload',
            data: formData,
            onload: function (response) {
                stopLoadingAnimation(document.querySelector(currentSiteConfig.chatInputSelector));
                const jsonResponse = JSON.parse(response.responseText);
                const link = jsonResponse.link;
                const fileExtension = getFileExtension(file.name);
                const completeLink = `${link}.${fileExtension}`;
                copyToClipboard(completeLink);
                postLinkInChat(completeLink);
            },
            onerror: function (response) {
                stopLoadingAnimation(document.querySelector(currentSiteConfig.chatInputSelector));
                console.error('[CID] Kappa upload error', response);
            },
        });
    }

    function postLinkInChat(link) {
        const chatInput = document.querySelector(currentSiteConfig.chatInputSelector);
        if (chatInput) {
            chatInput.textContent = link;
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            chatInput.dispatchEvent(event);
        } else {
            console.error('[CID] Chat input not found');
        }
    }

    function handleFileDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length) {
            uploadToKappa(files[0]);
        }
    }
    document.addEventListener('drop', handleFileDrop);
    document.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    let processChatImage = () => {
        let imageExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.avif'];
        let links = [...document.querySelectorAll('[href]'),];
        let siteConfig = getCurrentSiteConfig();
        links.forEach((imageElement) => {
            let imageLink = imageElement.getAttribute('href');
            if (imageLink.endsWith('.gifv')) {
                imageLink = imageLink.slice(0, -1);
                imageElement.setAttribute('href', imageLink);
                imageElement.textContent = imageLink;
            }
            let matched = imageLink.match(/(\.(jpeg|jpg|png|gif|webp|avif))(\S*)/i);
            if (matched !== null) {
                imageElement.setAttribute('href', imageLink);
                imageElement.textContent = imageLink;
                imageElement.style.display = 'none';
                if (imageExtensions.some((ext) => imageLink.includes(ext))) {
                    let image = document.createElement('img');
                    image.setAttribute('src', imageLink);
                    image.style.maxWidth = '100%';
                    image.style.maxHeight = '322px';
                    image.style.display = 'block';
                    image.style.cursor = 'pointer';
                    image.style.borderRadius = '4px';
                    image.style.margin = '4px';
                    let clicks = 0;
                    image.addEventListener('mousedown', (event) => {
                        if (event.which === 2) {
                            event.preventDefault();
                            window.open(imageLink, '_blank');
                        }
                    });
                    image.addEventListener('click', (event) => {
                        const doubleClickDelay = 400;
                        clicks++;
                        if (clicks === 1) {
                            setTimeout(() => {
                                if (clicks === 1) {
                                    navigator.clipboard.writeText(imageLink);
                                }
                                clicks = 0;
                            }, doubleClickDelay);
                        } else if (clicks === 2) {
                            window.open(imageLink, '_blank');
                            clicks = 0;
                        }
                        image.onload = () => {
                            if (!imageLink.imageLoaded) {
                                imageLink.imageLoaded = true;
                                let wrapperDiv = document.createElement('div');
                                wrapperDiv.style.display = 'inline-block';
                                wrapperDiv.style.maxWidth = '100%';
                                wrapperDiv.style.position = 'relative';
                                wrapperDiv.appendChild(image);
                                imageLink.parentNode.insertBefore(wrapperDiv, imageLink.nextSibling);
                            }
                        };
                    });
                    let parent = imageElement.parentElement;
                    parent.appendChild(image);
                    parent.removeChild(imageElement);
                    if (siteConfig && siteConfig.scrollableSelector) {
                        let scrollableElement = document.querySelector(siteConfig.scrollableSelector);
                        scrollableElement.scrollTop = scrollableElement.scrollHeight;
                    } else {
                        parent.scrollIntoView(false);
                    }
                }
            }
        });
    };

    let processChatVideo = () => {
        let videoExtensions = ['.mp4', '.webm', '.mov'];
        let links = [...document.querySelectorAll('[href]'),];
        let siteConfig = getCurrentSiteConfig();
        links.forEach((videoElement) => {
            let videoLink = videoElement.getAttribute('href');
            if (videoExtensions.some((ext) => videoLink.includes(ext))) {
                let video = document.createElement('video');
                video.setAttribute('src', videoLink);
                video.setAttribute('loop', 'loop');
                video.setAttribute('muted', 'muted');
                video.setAttribute('preload', 'auto');
                video.style.maxWidth = '100%';
                video.style.maxHeight = '322px';
                video.style.display = 'block';
                video.style.borderRadius = '4px';
                video.style.margin = '4px';
                video.addEventListener('mousedown', (event) => {
                    if (event.which === 2) {
                        event.preventDefault();
                        window.open(videoLink, '_blank');
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
                    let wrapperDiv = document.createElement('div');
                    wrapperDiv.style.display = 'inline-block';
                    wrapperDiv.style.maxWidth = '100%';
                    wrapperDiv.style.position = 'relative';
                    if (siteConfig && siteConfig.scrollableSelector) {
                        let scrollableElement = document.querySelector(siteConfig.scrollableSelector);
                        scrollableElement.scrollTop = scrollableElement.scrollHeight;
                    } else {
                        parent.scrollIntoView(false);
                    }
                };
                let parent = videoElement.parentElement;
                parent.appendChild(video);
                parent.removeChild(videoElement);
            }
        });
    };

    let processChatAudio = () => {
        let audioExtensions = ['.mp3', '.ogg'];
        let links = [...document.querySelectorAll('[href]'),];
        let siteConfig = getCurrentSiteConfig();
        links.forEach((audioElement) => {
            let audioLink = audioElement.getAttribute('href');
            if (audioExtensions.some((ext) => audioLink.includes(ext))) {
                let audio = document.createElement('audio');
                audio.setAttribute('src', audioLink);
                audio.setAttribute('loop', 'loop');
                audio.setAttribute('muted', 'muted');
                audio.setAttribute('preload', 'auto');
                audio.setAttribute('controls', 'controls');
                audio.style.maxWidth = '100%';
                audio.style.maxHeight = '322px';
                audio.style.display = 'block';
                audio.style.borderRadius = '4px';
                audio.style.margin = '4px';
                audio.addEventListener('mousedown', (event) => {
                    if (event.which === 2) {
                        event.preventDefault();
                        window.open(audioLink, '_blank');
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
                    let wrapperDiv = document.createElement('div');
                    wrapperDiv.style.display = 'inline-block';
                    wrapperDiv.style.maxWidth = '100%';
                    wrapperDiv.style.position = 'relative';
                    if (siteConfig && siteConfig.scrollableSelector) {
                        let scrollableElement = document.querySelector(siteConfig.scrollableSelector);
                        scrollableElement.scrollTop = scrollableElement.scrollHeight;
                    } else {
                        parent.scrollIntoView(false);
                    }
                };
                let parent = audioElement.parentElement;
                parent.appendChild(audio);
                parent.removeChild(audioElement);
            }
        });
    };

    let processChatMedia = (callback = null, timeout = null) => {
        processChatImage();
        processChatVideo();
        processChatAudio();
        if (callback) {
            setTimeout(() => callback(callback), timeout);
        }
    };

    processChatMedia((callback) => processChatMedia(callback));
})();
