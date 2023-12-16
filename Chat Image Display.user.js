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

    function processVKPlayChatImages(node) {
        const messageElements = node.querySelectorAll('.ChatMessage_message_r1jzC a');
        processChatImages(messageElements);
    }

    function processBoostyChatImages(node) {
        const messageElements = node.querySelectorAll('.ChatMessage_text_sXPvk a');
        processChatImages(messageElements);
    }

    // Переиспользуемый обработчик изображений для обоих сайтов
    function processChatImages(messageElements) {
        messageElements.forEach(link => {
            const matched = link.href.match(/(\.(jpeg|jpg|gif|png|webp))($|\?.*$|#.*$)/i);
            if (matched !== null) {
                // Общая логика обработки изображений...
            }
        });
    }

    // Обозреватель для VK Play
    const vkChatObserver = new MutationObserver(mutations => {
      // Логика обозревателя...
    });
    
    // Обозреватель для Boosty
    const boostyChatObserver = new MutationObserver(mutations => {
      // Логика обозревателя...
    });

    // Настройки для наблюдателей должны быть представлены в общем объекте, поскольку они идентичны
    const observerConfig = { childList: true, subtree: true };
    
    // Обработка определения текущего сайта и запуск соответствующего кода
    switch(window.location.host) {
        case "vkplay.live": {
            const vkChatElement = document.querySelector('.Chat_chat_x6IXr.Chat_root_tUBSs');
            if (vkChatElement) {
                // Запуск функциональности VK Play...
            }
            break;
        }
        case "boosty.to": {
            const boostyChatElement = document.querySelector('[data-test-id="CHAT:root"]');
            if (boostyChatElement) {
                // Запуск функциональности Boosty...
            }
            break;
        }
        default:
            console.log("This site is not supported by the Unified Chat Image Display script.");
    }
})();
