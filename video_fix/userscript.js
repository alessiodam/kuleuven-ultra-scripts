// ==UserScript==
// @name         KU Leuven Ultra: video fix
// @namespace    https://github.com/alessiodam/kuleuven-ultra-scripts
// @version      1.0
// @description  Makes embedded videos on Ultra fit the screen so you don't have to scroll inside them
// @author       alessiodam
// @license      MIT
// @match        https://ultra.edu.kuleuven.cloud/ultra/*
// @updateURL    https://raw.githubusercontent.com/alessiodam/kuleuven-ultra-scripts/main/video_fix/userscript.js
// @downloadURL  https://raw.githubusercontent.com/alessiodam/kuleuven-ultra-scripts/main/video_fix/userscript.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const extra = 8;
    const margin = 16;

    function setStyle(el, prop, value) {
        if (el.style.getPropertyValue(prop) !== value || el.style.getPropertyPriority(prop) !== 'important') {
            el.style.setProperty(prop, value, 'important');
        }
    }

    function fixVideos() {
        const frames = document.querySelectorAll('iframe.embedded-app-container');
        for (const frame of frames) {
            const wrapper = frame.closest('.bb-embedded-app') || frame.parentElement;
            const content = frame.closest('.ql-editor') || wrapper.parentElement;
            const header = document.querySelector('header, .bb-offcanvas-header');
            const headerBottom = header ? header.getBoundingClientRect().bottom : 70;
            const maxWidth = content.clientWidth - 16;
            const maxHeight = window.innerHeight - headerBottom - margin * 2;
            const width = Math.floor(Math.min(maxWidth, (maxHeight - extra) * 16 / 9));
            const height = Math.round(width * 9 / 16 + extra);

            for (const el of [frame, wrapper]) {
                setStyle(el, 'width', width + 'px');
                setStyle(el, 'height', height + 'px');
                setStyle(el, 'max-height', 'none');
            }
            setStyle(wrapper, 'margin', '0px auto');
            if (frame.getAttribute('scrolling') !== 'no') {
                frame.setAttribute('scrolling', 'no');
            }
        }
    }

    let queued = false;
    function queueFix() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            fixVideos();
        });
    }

    new MutationObserver(queueFix).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
    window.addEventListener('resize', queueFix);

    queueFix();
})();
