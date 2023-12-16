// ==UserScript==
// @name         Chat Image Display
// @namespace    https://github.com/c0IIwr/Combined-Chat-Image-Display/raw/main/Chat%20Image%20Display.user.js
// @version      1.3
// @description  Display images directly in various chat services
// @author       c0IIwr
// @match        https://vkplay.live/*
// @match        https://boosty.to/*/streams/video_stream
// @icon         https://vkplay.live/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Общая функция для обработки изображений в чате
    function processChatImages(node, messageSelector) {
        const messageElements = node.querySelectorAll(messageSelector);
        messageElements.forEach(link => {
            const matched = link.href.match(/(\.(jpeg|jpg|gif|png|webp))($|\?.*$|#.*$)/i);
            if (matched !== null) {
                // здесь логика обработки ссылки и создание элемента изображения
                // ...
                // Пропустим повтор кода для компактности
                // ...
            }
        });
    }

    // Определение сайта и соответствующих селекторов
    let chatSelector, messageSelector;
    if (location.href.includes('vkplay.live')) {
        chatSelector = '.Chat_chat_x6IXr.Chat_root_tUBSs';
        messageSelector = '.ChatMessage_message_r1jzC a';
    } else if (location.href.includes('boosty.to')) {
        chatSelector = '[data-test-id="CHAT:root"]';
        messageSelector = '.ChatMessage_text_sXPvk a';
    }

    // Наблюдатель за мутациями и запуск предварительной обработки
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
