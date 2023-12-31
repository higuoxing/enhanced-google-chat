// ==UserScript==
// @name         Enhanced Google Chat
// @namespace    http://tampermonkey.net/
// @version      2023-12-30
// @description  Bring missing features to Google Chat.
// @author       @higuoxing
// @license      MIT
// @match        https://mail.google.com/chat/u/*
// @match        https://chat.google.com/u/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js
// @resource     REMOTE_CSS https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @downloadURL https://update.greasyfork.org/scripts/483445/Enhanced%20Google%20Chat.user.js
// @updateURL https://update.greasyfork.org/scripts/483445/Enhanced%20Google%20Chat.meta.js
// ==/UserScript==

/* global hljs */

function format_codes() {
    let spans = document.getElementsByTagName("span");
    for (let span of spans) {
        let data_cd_attr = span.getAttribute("data-cd");
        // We use "```" to identify code blocks.
        if (data_cd_attr === "hidden" && span.textContent === "```") {
            let next_sibling_element = span.nextElementSibling;
            if (next_sibling_element != null && next_sibling_element.getAttribute("role") === "complementary") {
                // The next sibling element is the content
                // of the code block.
                let parent_div = span.parentElement;
                let orig_code_block = span.nextElementSibling;

                // Create code container.
                let pre_ele = document.createElement("pre");
                let code_ele = document.createElement("code");

                // Determine the language.
                let orig_code_content = orig_code_block.innerText;
                let orig_code_lines = orig_code_content.split('\n');
                if (orig_code_lines.length < 1) {
                    continue;
                }
                let language = orig_code_lines[0];
                code_ele.setAttribute("class", "language-" + language);

                // Remove the 1st line that specifies the language.
                orig_code_lines.shift();
                // Append our new code block.
                code_ele.textContent = orig_code_lines.join('\n');
                pre_ele.appendChild(code_ele);

                // We're ready to highlight it.
                hljs.highlightElement(code_ele);

                let language_mark = document.createElement("span");
                language_mark.setAttribute("class", "hljs-language-mark");
                language_mark.textContent = "-----------\nCode block: " + language;
                parent_div.appendChild(language_mark);

                // Append it to the parent element.
                parent_div.appendChild(pre_ele);

                // Remove the original code block.
                orig_code_block.remove();
            }

            // Remove the <span> tag so that we won't render the code block twice.
            span.remove();
        }
    }
}

// Called only once.
function initialize() {
    // Initialize stylesheets.
    const hljs_css = GM_getResourceText("REMOTE_CSS");
    GM_addStyle(hljs_css);
    // I'm not a CSS expert, we force the font family of every hljs elements to be monospace.
    GM_addStyle(`[class^="hljs-"], [class*=" hljs-"], [class^="hljs"], [class*=" hljs"] {
                     font-family: "Roboto Mono",monospace;
                 }`
    );
}

// Called periodically.
function main() {
    format_codes();
}

function debounce(fn, delay) {
    let timeout = null;
    return function() {
        if(timeout) {
            return;
        } else {
            timeout = setTimeout(function() {
                fn();
                timeout = null;
            }, delay);
        }
    }
}

(function() {
    'use strict';
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
        createHTML: (string, sink) => string
        });
    }

    initialize();

    let el = document.documentElement;
    el.addEventListener('DOMSubtreeModified', debounce(main, 1000));
})();
