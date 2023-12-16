// ==UserScript==
// @name         Chat Image Display
// @namespace    https://c0iiwr.github.io/Chat-Image-Display/
// @version      1.3
// @updateurl    https://github.com/c0IIwr/Chat-Image-Display/raw/main/Chat%20Image%20Display.user.js
// @downloadurl  https://github.com/c0IIwr/Chat-Image-Display/raw/main/Chat%20Image%20Display.user.js
// @description  Display images in the chat room
// @description:ru Отображение изображений в чате
// @author       c0IIwr
// @match        https://vkplay.live/*
// @match        https://boosty.to/*
// @icon         https://cdn-icons-png.flaticon.com/512/6631/6631821.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function processChatImages(node, messageSelector) {
        const messageElements = node.querySelectorAll(messageSelector);
        messageElements.forEach(link => {
            const matched = link.href.match(/(\.(jpeg|jpg|gif|png|webp))($|\?.*$|#.*$)/i);
            if (matched !== null) {
                link.href = link.href.substring(0, link.href.indexOf(matched[1]) + matched[1].length);
                link.textContent = link.href;
                link.style.display = 'none';
                let image = new Image();
                image.src = link.href;
                image.style.maxWidth = '100%';
                image.style.maxHeight = '322px';
                image.style.display = 'block';
                image.style.cursor = 'pointer';

                let clicks = 0;
                image.onclick = (event) => {
                    const doubleClickDelay = 400;
                    clicks++;

                    if (clicks === 1) {
                        setTimeout(() => {
                            if (clicks === 1) {
                                navigator.clipboard.writeText(link.href)
                                    .then(() => {
                                    console.log('Link copied to clipboard: ' + link.href);
                                })
                                    .catch(err => {
                                    console.error('Unable to copy link: ' + err);
                                });
                            }
                            clicks = 0;
                        }, doubleClickDelay);
                    } else if (clicks === 2) {
                        window.open(link.href, '_blank');
                        clicks = 0;
                    }
                };

                image.onload = () => {
                    if (!link.imageLoaded) {
                        link.imageLoaded = true;
                        link.parentNode.insertBefore(image, link.nextSibling);
                    }
                };
            }
        });
    }

    let chatSelector, messageSelector;
    if (location.href.includes('vkplay.live')) {
        chatSelector = '.Chat_chat_x6IXr.Chat_root_tUBSs';
        messageSelector = '.ChatMessage_message_r1jzC a';
    } else if (location.href.includes('boosty.to')) {
        chatSelector = '[data-test-id="CHAT:root"]';
        messageSelector = '.ChatMessage_text_sXPvk a';
    }

    if (chatSelector) {
        const chatObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => processChatImages(node, messageSelector));
                }
            });
        });

        const config = { childList: true, subtree: true };
        const chatElement = document.querySelector(chatSelector);

        if (chatElement) {
            processChatImages(chatElement, messageSelector);
            chatObserver.observe(chatElement, config);
        } else {
            console.log('Chat container not found');
        }
    }
})();
