// ==UserScript==
// @name         Chat Image Display
// @namespace    https://c0iiwr.github.io/Chat-Image-Display/
// @version      1.5
// @description  Display images in the chat room
// @description:ru Отображение изображений в чате
// @author       c0IIwr
// @match        https://vkplay.live/*
// @match        https://boosty.to/*
// @icon         https://cdn-icons-png.flaticon.com/512/6631/6631821.png
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    const siteConfigs = [
        {
            domain: "vkplay.live",
            chatSelector: ".Chat_chat_x6IXr.Chat_root_tUBSs",
            messageSelector: ".ChatMessage_message_r1jzC a",
            scrollableSelector: ".ChatBoxBase_root_k1P9S"
        },
        {
            domain: "boosty.to",
            chatSelector: '[data-test-id="CHAT:root"]',
            messageSelector: ".ChatMessage_text_sXPvk a",
            scrollableSelector: ".ReactVirtualized__Grid__innerScrollContainer"
        },
    ];

    function getCurrentSiteConfig() {
        const currentDomain = window.location.hostname;
        return siteConfigs.find(config => currentDomain.includes(config.domain));
    }

    function getScrollableElement(config) {
        return document.querySelector(config.scrollableSelector);
    }

    function processChatImages(node, messageSelector, scrollable) {
        const messageElements = node.querySelectorAll(messageSelector);
        messageElements.forEach((link) => {
            const matched = link.href.match(/(\.(jpeg|jpg|png|gif|gifv|webp|avif))($|\?.*$|#.*$)/i);
            if(matched !== null) {
                link.href = link.href.substring(0, link.href.indexOf(matched[1]) + matched[1].length);
                link.textContent = link.href;
                link.style.display = "none";
                if(matched[2] === "gifv") {
                    link.href = link.href.substring(0, link.href.indexOf(matched[1]) + matched[1].length - 1);
                }
                let image = new Image();
                image.src = link.href;
                image.style.maxWidth = "100%";
                image.style.maxHeight = "322px";
                image.style.display = "block";
                image.style.cursor = "pointer";
                image.style.borderRadius = "8px";
                image.style.marginTop = "4px";
                let clicks = 0;
                image.onclick = (event) => {
                    const doubleClickDelay = 400;
                    clicks++;
                    if(clicks === 1) {
                        setTimeout(
                            () => {
                                if(clicks === 1) {
                                    navigator.clipboard.writeText(link.href).then(
                                        () => {
                                            console.log("Link copied to clipboard: " + link.href);
                                        }).catch(
                                        (err) => {
                                            console.error("Unable to copy link: " + err);
                                        });
                                }
                                clicks = 0;
                            }, doubleClickDelay);
                    } else if(clicks === 2) {
                        window.open(link.href, "_blank");
                        clicks = 0;
                    }
                };
                image.onload = () => {
                    if(!link.imageLoaded) {
                        link.imageLoaded = true;
                        let wrapperDiv = document.createElement("div");
                        wrapperDiv.style.display = "inline-block";
                        wrapperDiv.style.maxWidth = "100%";
                        wrapperDiv.style.position = "relative";
                        wrapperDiv.appendChild(image);
                        link.parentNode.insertBefore(wrapperDiv, link.nextSibling);
                        if(scrollable) {
                            scrollable.scrollTop = scrollable.scrollHeight;
                        }
                    }
                };
            }
        });
    }

    const currentSiteConfig = getCurrentSiteConfig();

    if (currentSiteConfig) {
        const chatObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        processChatImages(node, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
                    });
                }
            });
        });

        const config = { childList: true, subtree: true };
        const chatElement = document.querySelector(currentSiteConfig.chatSelector);

        if (chatElement) {
            processChatImages(chatElement, currentSiteConfig.messageSelector, getScrollableElement(currentSiteConfig));
            chatObserver.observe(chatElement, config);
        } else {
            console.log("Chat container not found");
        }
    }
})();
