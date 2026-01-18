// ==UserScript==
// @name         YouTube ADHD Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Deletes YouTube recommendations and non-pinned comments during specified hours
// @match        *://*.youtube.com/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @version     1.0
// @author      RSB
// @description 1/18/2026, 12:00:21 PM
// ==/UserScript==

function main() {
    const startHour = 0;
    const endHour = -1;
    const now = new Date();
    const hour = now.getHours();

    if (isWithinCurfew(hour, startHour, endHour)) {
        blockAll();
    }
}

/**
 * Removes YouTube video recommendations from the page.
 * Hides the secondary sidebar and removes specific recommendation elements.
 */
function removeRecommendations() {
    // Target the secondary column which contains recommendations
    const secondary = document.getElementById('secondary');
    if (secondary) {
        secondary.style.display = 'none';
    }

    // Also target specific recommendation containers if they exist
    const recommendations = document.querySelectorAll(
        'ytd-watch-next-secondary-results-renderer, ytd-compact-video-renderer',
    );
    recommendations.forEach(el => el.remove());

    // Remove the home recommendations grid
    const home = document.querySelectorAll(
        'ytd-rich-grid-renderer, yt-horizontal-list-renderer',
    );
    home.forEach(el => el.remove());
}

/**
 * Removes the notifications button in the top right corner.
 */
function removeNotificationsButton() {
    const notificationsButton = document.querySelector(
        'ytd-notification-topbar-button-renderer',
    );
    if (notificationsButton) notificationsButton.remove();
}

/**
 * Adds a custom CSS class that hides all non-PINNED comments.
 */
function hideComments() {
    const style = document.createElement('style');
    style.textContent = `
        ytd-comment-thread-renderer:not(.PINNED) {
            visibility: hidden !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Adds a custom CSS class to the pinned comment to make sure it is not hidden.
 */
function markPinnedComment() {
    // Target all comment threads
    const comments = document.querySelectorAll('ytd-comment-thread-renderer');
    comments.forEach(comment => {
        // Check if the comment is pinned by looking for the pinned badge
        const pinnedBadge = comment.querySelector(
            '[aria-label*="Pinned"], .badge-shape-wiz__text, ytd-pinned-comment-badge-renderer',
        );
        if (pinnedBadge) {
            comment.classList.add('PINNED');
        }
    });
}

/**
 * Removes the subscriptions section on the YouTube home page.
 * Targets the specific element by index, hopes it doesn't get rearranged, and removes it.
 */
function removeSubscriptions() {
    document.querySelectorAll('ytd-guide-section-renderer').forEach(section => {
        // Look for channel avatars
        const avatar = section.querySelector('img.yt-img-shadow[src]');

        if (avatar) {
            section.remove();
            console.log(
                'Removed subscriptions-like section via avatar detection',
            );
        }
    });
}

/**
 * Checks if the current hour is within the specified curfew range.
 * Handles wrap-around for ranges that cross midnight.
 * @param {number} hour - The current hour (0-23).
 * @param {number} start - The start hour of the curfew.
 * @param {number} end - The end hour of the curfew.
 * @returns {boolean} True if within curfew, false otherwise.
 */
function isWithinCurfew(hour, start, end) {
    if (start <= end) {
        return hour >= start && hour < end;
    } else {
        // Wrap around midnight
        return hour >= start || hour < end;
    }
}

/**
 * Redirects any YouTube shorts link to the main long-form video URL.
 */
function redirectShortsToWatch() {
    const match = location.pathname.match(/\/shorts\/([^/?]+)/);
    if (!match) return;

    const videoId = match[1];

    const target = `https://www.youtube.com/watch?v=${videoId}`;

    if (location.href !== target) {
        console.log('Redirecting Shorts → Watch:', target);
        location.replace(target);
    }
}

/**
 * Calls a function and sets up a MutationObserver to re-run it on DOM changes.
 * Ensures dynamic content is handled reactively.
 * @param {function} f - The function to call and observe.
 */
function reactiveCall(f) {
    f();

    // Set up a MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver(mutations => {
        mutations.forEach(() => {
            f();
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * Applies all ADHD-blockers.
 */
function blockAll(startHour, endHour) {
    hideComments();
    reactiveCall(() => {
        redirectShortsToWatch();
        removeRecommendations();
        removeNotificationsButton();
        markPinnedComment();
        removeSubscriptions();
    });
}

/**
 * Load settings and run the check.
 */
// browser.storage.local.get(['startHour', 'endHour'], function (result) {
//     const startHour = result.startHour || 21; // Default 9 PM
//     const endHour = result.endHour || 7; // Default 7 AM
//     const now = new Date();
//     const hour = now.getHours();

//     if (isWithinCurfew(hour, startHour, endHour)) {
//         blockAll();
//     }
// });

main();
