// ==UserScript==
// @name         Boosty Chat Image Display
// @namespace    https://github.com/c0IIwr/Chat-Image-Display/raw/main/Boosty%20Chat%20Image%20Display.user.js
// @version      1.3
// @description  Display images directly in Boosty streams chat
// @author       c0IIwr
// @match        https://boosty.to/*/streams/video_stream
// @icon         https://boosty.to/apple-touch-icon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function processChatImages(node) {
        const messageElements = node.querySelectorAll('.ChatMessage_text_sXPvk a');
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
                mutation.addedNodes.forEach(processChatImages);
            }
        });
    });

    const config = { childList: true, subtree: true };
    const chatElement = document.querySelector('[data-test-id="CHAT:root"]');

    if (chatElement) {
        processChatImages(chatElement);
        chatObserver.observe(chatElement, config);
    } else {
        console.log('Chat container not found');
    }
})();
