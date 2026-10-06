const fs = require('fs');
const path = require('path');

// Mock browser environment for DOM testing
function createMockDom(htmlContent) {
    const listeners = {};

    // Basic DOM element mock
    class ElementMock {
        constructor(tagName, attributes = {}, className = '', id = '') {
            this.tagName = tagName.toUpperCase();
            this.attributes = attributes;
            this.className = className;
            this.id = id;
            this.children = [];
            this.parentElement = null;
            this.checked = attributes.checked !== undefined;
            this.disabled = attributes.disabled !== undefined;
            this.textContent = '';
            this.value = attributes.value || '';
            this.style = {};
            this.classList = {
                contains: (c) => (this.className || '').split(' ').includes(c),
                add: (c) => {
                    if (!this.classList.contains(c)) {
                        this.className = (this.className + ' ' + c).trim();
                    }
                },
                remove: (c) => {
                    this.className = (this.className || '').split(' ').filter(x => x !== c).join(' ');
                }
            };
        }

        getAttribute(attr) {
            return this.attributes[attr] !== undefined ? String(this.attributes[attr]) : null;
        }

        setAttribute(attr, val) {
            this.attributes[attr] = String(val);
        }

        closest(selector) {
            if (selector.startsWith('.')) {
                const cls = selector.substring(1);
                let current = this;
                while (current) {
                    if (current.classList && current.classList.contains(cls)) return current;
                    current = current.parentElement;
                }
            }
            return null;
        }

        querySelector(selector) {
            return this.querySelectorAll(selector)[0] || null;
        }

        querySelectorAll(selector) {
            const result = [];
            const search = (node) => {
                for (const child of node.children) {
                    let matches = false;
                    if (selector.startsWith('.')) {
                        matches = child.classList.contains(selector.substring(1));
                    } else if (selector.startsWith('#')) {
                        matches = child.id === selector.substring(1);
                    } else if (selector.includes('[data-valid="true"]')) {
                        matches = child.classList.contains('js-cart-row') && (child.getAttribute('data-valid') === 'true');
                    }
                    if (matches) result.push(child);
                    search(child);
                }
            };
            search(this);
            return result;
        }

        addEventListener(evt, handler) {
            if (!listeners[evt]) listeners[evt] = [];
            listeners[evt].push({ element: this, handler });
        }
    }

    return { ElementMock, listeners };
}

console.log("=== RUNNING FRONTEND DOM LOGIC VERIFICATION ===");

// Load cart.html and app.js
const appJsPath = path.join(__dirname, '../src/main/resources/static/js/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Verify selector definitions in app.js
const requiredSelectors = [
    '.js-cart-row',
    '.js-cart-item-checkbox',
    '#js-cart-select-all',
    '#js-selected-count',
    '#js-total-valid-count',
    '#js-summary-selected-count',
    '.js-cart-summary-subtotal',
    '.js-cart-summary-total',
    '#js-start-checkout-btn'
];

let allSelectorsFound = true;
requiredSelectors.forEach(sel => {
    if (!appJsContent.includes(sel)) {
        console.error(`MISSING SELECTOR IN APP.JS: ${sel}`);
        allSelectorsFound = false;
    } else {
        console.log(`Selector verified: ${sel}`);
    }
});

// Verify attributes in cart.html
const cartHtmlPath = path.join(__dirname, '../src/main/resources/templates/cart.html');
const cartHtmlContent = fs.readFileSync(cartHtmlPath, 'utf8');

const requiredAttrs = [
    'data-item-id',
    'data-product-detail-id',
    'data-quantity',
    'data-unit-price',
    'data-line-total',
    'data-valid'
];

let allAttrsFound = true;
requiredAttrs.forEach(attr => {
    if (!cartHtmlContent.includes(attr)) {
        console.error(`MISSING ATTRIBUTE IN CART.HTML: ${attr}`);
        allAttrsFound = false;
    } else {
        console.log(`Attribute verified in HTML: ${attr}`);
    }
});

if (allSelectorsFound && allAttrsFound) {
    console.log("=== ALL SELECTORS & DATA ATTRIBUTES SUCCESSFULLY VERIFIED ===");
} else {
    console.error("=== VERIFICATION FAILED ===");
    process.exit(1);
}
