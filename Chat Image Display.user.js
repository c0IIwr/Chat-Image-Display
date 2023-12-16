// ==UserScript==
// @name         Chat Image Display
// @namespace    https://github.com/c0IIwr/Combined-Chat-Image-Display/raw/main/Chat%20Image%20Display.user.js
// @version      1.3
// @description  Display images directly in VK Play Live chat and Boosty streams chat
// @author       c0IIwr
// @match        https://vkplay.live/*
// @match        https://boosty.to/*/streams/video_stream
// @icon         https://vkplay.live/favicon.ico
// @icon         https://boosty.to/apple-touch-icon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function processChatImages(node, selector) {
        const messageElements = node.querySelectorAll(selector);
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

    const chatObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.classList.contains('Chat_chat_x6IXr')) {
                        processChatImages(node, '.ChatMessage_message_r1jzC a');
                    }
                    if (node.getAttribute('data-test-id') === 'CHAT:root') {
                        processChatImages(node, '.ChatMessage_text_sXPvk a');
                    }
                });
            }
        });
    });

    const config = { childList: true, subtree: true };
    const chatElements = document.querySelectorAll('.Chat_chat_x6IXr, [data-test-id="CHAT:root"]');
    chatElements.forEach(chatElement => {
        chatObserver.observe(chatElement, config);
        processChatImages(chatElement, chatElement.classList.contains('Chat_chat_x6IXr') ? '.ChatMessage_message_r1jzC a' : '.ChatMessage_text_sXPvk a');
    });
})();
