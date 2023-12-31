// ==UserScript==
// @name           Chat Image Display
// @namespace      https://c0iiwr.github.io/Chat-Image-Display/
// @version        1.8
// @description    Displaying images, video, and audio in chat
// @description:ru Отображение изображений, видео и аудио в чате
// @author         c0IIwr
// @match          https://vkplay.live/*
// @match          https://boosty.to/*
// @match          https://kick.com/*
// @connect        api.imgur.com
// @icon           https://cdn-icons-png.flaticon.com/512/6631/6631821.png
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    const siteConfigs = [{
        domain: 'vkplay.live',
        chatSelector: '.Chat_chat_x6IXr.Chat_root_tUBSs',
        messageSelector: '.ChatMessage_message_r1jzC a',
        scrollableSelector: '.ChatBoxBase_root_k1P9S',
        chatInputSelector: '.ce-paragraph.cdx-block[contenteditable="true"]'
    }, {
        domain: 'boosty.to',
        chatSelector: '[data-test-id="CHAT:root"]',
        messageSelector: '.ChatMessage_text_sXPvk a',
        scrollableSelector: '.ReactVirtualized__Grid__innerScrollContainer',
        chatInputSelector: '.ce-paragraph.cdx-block[contenteditable="true"]'
    }, {
        domain: 'kick.com',
        chatInputSelector: '[id="message-input"][contenteditable="true"]',
        linkSelector: 'a[data-v-0e5d260d]'
    },];

    function getCurrentSiteConfig() {
        const currentDomain = window.location.hostname;
        return siteConfigs.find(config => currentDomain.includes(config.domain));
    }

    function getScrollableElement(config) {
        return document.querySelector(config.scrollableSelector);
    }

    function clickLikeButton() {
        let likeButton = document.querySelector('[class^=LikeButton_container_]');
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
    const clientId = 'e7ba2c27273a2fe';
    const loadingAnimation = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let animationIndex = 0;
    let animationInterval;

    function displayLoadingMessage() {
        const chatInput = document.querySelector(currentSiteConfig.chatInputSelector);
        if (chatInput) {
            startLoadingAnimation(chatInput);
        }
        else {
            console.error('Chat input not found');
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

    function uploadToImgur(file) {
        displayLoadingMessage();
        let formData = new FormData();
        formData.append('image', file);
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.imgur.com/3/image',
            headers: {
                'Authorization': 'Client-ID ' + clientId,
                'Accept': 'application/json'
            },
            data: formData,
            onload: function (response) {
                stopLoadingAnimation(document.querySelector(currentSiteConfig.chatInputSelector));
                const jsonResponse = JSON.parse(response.responseText);
                if (jsonResponse.success) {
                    const link = jsonResponse.data.link;
                    postLinkInChat(link);
                }
                else {
                    console.error('Imgur upload failed', jsonResponse);
                    document.querySelector(currentSiteConfig.chatInputSelector).textContent = 'Неверный тип файла';
                    setTimeout(() => {
                        document.querySelector(currentSiteConfig.chatInputSelector).textContent = ''
                    }, 500);
                }
            },
            onerror: function (response) {
                stopLoadingAnimation(document.querySelector(currentSiteConfig.chatInputSelector));
                console.error('Imgur upload error', response);
            }
        });
    }

    function postLinkInChat(link) {
        const chatInput = document.querySelector(currentSiteConfig.chatInputSelector);
        if (chatInput) {
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            const modifiedLink = link.replace(/h\./, '.');
            chatInput.textContent = modifiedLink;
            chatInput.dispatchEvent(event);
        }
        else {
            console.error('Chat input not found');
        }
    }

    function handleFileDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length) {
            uploadToImgur(files[0]);
        }
    }
    document.addEventListener('drop', handleFileDrop);
    document.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    function processChatImage(node, messageSelector, scrollable) {
        const messageElements = node.querySelectorAll(messageSelector);
        messageElements.forEach((link) => {
            const matched = link.href.match(/(\.(jpeg|jpg|png|gif|gifv|webp|avif))($|\S*)/i);
            if (matched !== null) {
                const urlWithoutQueryString = link.href.substring(0, link.href.indexOf(matched[1]) + matched[1].length);
                const urlWithoutExtraText = urlWithoutQueryString.split(' ')[0];
                link.href = urlWithoutExtraText;
                link.textContent = link.href;
                link.style.display = 'none';
                let image = new Image();
                image.src = link.href;
                image.style.maxWidth = '100%';
                image.style.maxHeight = '322px';
                image.style.display = 'block';
                image.style.cursor = 'pointer';
                image.style.borderRadius = '8px';
                image.style.marginTop = '4px';
                let clicks = 0;
                image.onclick = (event) => {
                    const doubleClickDelay = 400;
                    clicks++;
                    if (clicks === 1) {
                        setTimeout(
                            () => {
                                if (clicks === 1) {
                                    navigator.clipboard.writeText(link.href).then(
                                        () => {
                                            console.log('Link copied to clipboard: ' + link.href);
                                        }).catch(
                                        (err) => {
                                            console.error('Unable to copy link: ' + err);
                                        });
                                }
                                clicks = 0;
                            }, doubleClickDelay);
                    }
                    else if (clicks === 2) {
                        window.open(link.href, '_blank');
                        clicks = 0;
                    }
                };
                image.onload = () => {
                    if (!link.imageLoaded) {
                        link.imageLoaded = true;
                        let wrapperDiv = document.createElement('div');
                        wrapperDiv.style.display = 'inline-block';
                        wrapperDiv.style.maxWidth = '100%';
                        wrapperDiv.style.position = 'relative';
                        wrapperDiv.appendChild(image);
                        link.parentNode.insertBefore(wrapperDiv, link.nextSibling);
                        if (scrollable) {
                            scrollable.scrollTop = scrollable.scrollHeight;
                        }
                    }
                };
            }
        });
    }

    function processChatVideo(node, messageSelector, scrollable) {
        const messageElements = node.querySelectorAll(messageSelector);
        messageElements.forEach((link) => {
            const matched = link.href.match(/(\.(mp4|webm|mov))($|\?.*$|#.*$)/i);
            if (matched !== null) {
                link.href = link.href.substring(0, link.href.indexOf(matched[1]) + matched[1].length);
                link.textContent = link.href;
                link.style.display = 'none';
                let video = document.createElement('video');
                video.src = link.href;
                video.setAttribute('loop', 'loop');
                video.setAttribute('muted', 'muted');
                video.setAttribute('preload', 'auto');
                video.style.maxWidth = '100%';
                video.style.maxHeight = '322px';
                video.style.display = 'block';
                video.style.borderRadius = '8px';
                video.style.marginTop = '4px';
                let controlsTimeout;
                video.onmouseover = () => {
                    clearTimeout(controlsTimeout);
                    video.play();
                    video.controls = true;
                    video.muted = false;
                };
                video.onmouseout = () => {
                    controlsTimeout = setTimeout(() => {
                        video.controls = false;
                        video.muted = true;
                    }, 500);
                };
                video.onloadedmetadata = () => {
                    if (!link.videoLoaded) {
                        link.videoLoaded = true;
                        let wrapperDiv = document.createElement('div');
                        wrapperDiv.style.display = 'inline-block';
                        wrapperDiv.style.maxWidth = '100%';
                        wrapperDiv.style.position = 'relative';
                        wrapperDiv.appendChild(video);
                        link.parentNode.insertBefore(wrapperDiv, link.nextSibling);
                        if (scrollable) {
                            scrollable.scrollTop = scrollable.scrollHeight;
                        }
                    }
                };
            }
        });
    }

    function processChatAudio(node, messageSelector, scrollable) {
        const messageElements = node.querySelectorAll(messageSelector);
        messageElements.forEach((link) => {
            const matched = link.href.match(/(\.(mp3|ogg))($|\?.*$|#.*$)/i);
            if (matched !== null) {
                link.href = link.href.substring(0, link.href.indexOf(matched[1]) + matched[1].length);
                link.textContent = link.href;
                link.style.display = 'none';
                let audio = document.createElement('audio');
                audio.src = link.href;
                audio.setAttribute('loop', 'loop');
                audio.setAttribute('muted', 'muted');
                audio.setAttribute('preload', 'auto');
                audio.setAttribute('controls', 'controls');
                audio.style.maxWidth = '100%';
                audio.style.maxHeight = '322px';
                audio.style.display = 'block';
                audio.style.borderRadius = '8px';
                audio.style.marginTop = '4px';
                let controlsTimeout;
                audio.onmouseover = () => {
                    clearTimeout(controlsTimeout);
                    audio.play();
                    audio.muted = false;
                };
                audio.onmouseout = () => {
                    controlsTimeout = setTimeout(() => {
                        audio.muted = true;
                    }, 500);
                };
                audio.onloadedmetadata = () => {
                    if (!link.audioLoaded) {
                        link.audioLoaded = true;
                        let wrapperDiv = document.createElement('div');
                        wrapperDiv.style.display = 'inline-block';
                        wrapperDiv.style.maxWidth = '100%';
                        wrapperDiv.style.position = 'relative';
                        wrapperDiv.appendChild(audio);
                        link.parentNode.insertBefore(wrapperDiv, link.nextSibling);
                        if (scrollable) {
                            scrollable.scrollTop = scrollable.scrollHeight;
                        }
                    }
                };
            }
        });
    }
    let processKickImage = () => {
        let imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif'];
        let links = [...document.querySelectorAll(getCurrentSiteConfig().linkSelector)];
        links.forEach(imageElement => {
            let imageLink = imageElement.getAttribute('href');
            if (imageLink.endsWith('.gifv')) {
                imageLink = imageLink.slice(0, -1) + 'f';
                imageElement.setAttribute('href', imageLink);
                imageElement.textContent = imageLink;
            }
            let matched = imageLink.match(/(\.(jpeg|jpg|png|gif|webp|avif))(\S*)/i);
            if (matched !== null) {
                let cleanimageLink = imageLink.substring(0, imageLink.indexOf(matched[1]) + matched[1].length);
                let spaceIndex = cleanimageLink.lastIndexOf(' ');
                let finalimageLink = spaceIndex !== -1 ? cleanimageLink.substring(0, spaceIndex) : cleanimageLink;
                imageElement.setAttribute('href', finalimageLink);
                imageElement.textContent = finalimageLink;
                imageElement.style.display = 'none';
                if (imageExtensions.some(ext => imageLink.includes(ext))) {
                    let image = document.createElement('img');
                    image.setAttribute('src', imageLink);
                    image.style.maxWidth = '100%';
                    image.style.maxHeight = '322px';
                    image.style.display = 'block';
                    image.style.cursor = 'pointer';
                    image.style.borderRadius = '4px';
                    image.style.marginTop = '4px';
                    let clicks = 0;
                    image.addEventListener('click', (event) => {
                        const doubleClickDelay = 400;
                        clicks++;
                        if (clicks === 1) {
                            setTimeout(() => {
                                if (clicks === 1) {
                                    navigator.clipboard.writeText(finalimageLink);
                                }
                                clicks = 0;
                            }, doubleClickDelay);
                        }
                        else if (clicks === 2) {
                            window.open(finalimageLink, '_blank');
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
                    parent.scrollIntoView(false);
                }
            }
        });
    };
    let processKickVideo = () => {
        let videoExtensions = ['mp4', 'webm', 'mov'];
        let links = [...document.querySelectorAll(getCurrentSiteConfig().linkSelector)];
        links.forEach(videoElement => {
            let videoLink = videoElement.getAttribute('href');
            if (videoExtensions.some(ext => videoLink.includes(ext))) {
                let video = document.createElement('video');
                video.setAttribute('src', videoLink);
                video.setAttribute('loop', 'loop');
                video.setAttribute('muted', 'muted');
                video.setAttribute('preload', 'auto');
                video.style.maxWidth = '100%';
                video.style.maxHeight = '322px';
                video.style.display = 'block';
                video.style.borderRadius = '4px';
                video.style.marginTop = '4px';
                let controlsTimeout;
                video.onmouseover = () => {
                    clearTimeout(controlsTimeout);
                    video.play();
                    video.controls = true;
                    video.muted = false;
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
                    parent.scrollIntoView(false);
                };
                let parent = videoElement.parentElement;
                parent.appendChild(video);
                parent.removeChild(videoElement);
            }
        });
    };
    let processKickAudio = () => {
        let audioExtensions = ['mp3', 'ogg'];
        let links = [...document.querySelectorAll(getCurrentSiteConfig().linkSelector)];
        links.forEach(audioElement => {
            let audioLink = audioElement.getAttribute('href');
            if (audioExtensions.some(ext => audioLink.includes(ext))) {
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
                audio.style.marginTop = '4px';
                let controlsTimeout;
                audio.onmouseover = () => {
                    clearTimeout(controlsTimeout);
                    audio.play();
                    audio.muted = false;
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
                    parent.scrollIntoView(false);
                };
                let parent = audioElement.parentElement;
                parent.appendChild(audio);
                parent.removeChild(audioElement);
            }
        });
    };
    let processKickMedia = (callback = null, timeout = null) => {
        processKickImage();
        processKickVideo();
        processKickAudio();
        if (callback) {
            setTimeout(() => callback(callback), timeout);
        }
    };
    processKickMedia((callback) => processKickMedia(callback));
    const currentSiteConfig = getCurrentSiteConfig();
    if (currentSiteConfig) {
        const chatObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        processChatImage(node, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
                        processChatVideo(node, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
                        processChatAudio(node, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
                    });
                }
            });
        });
        const config = {
            childList: true,
            subtree: true
        };
        const chatElement = document.querySelector(currentSiteConfig.chatSelector);
        if (chatElement) {
            processChatImage(chatElement, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
            processChatVideo(chatElement, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
            processChatAudio(chatElement, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
            chatObserver.observe(chatElement, config);
        }
        else {
            console.log('Chat container not found');
        }
    }
})();
