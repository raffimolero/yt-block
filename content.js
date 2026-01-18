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
        'ytd-watch-next-secondary-results-renderer, ytd-compact-video-renderer, ytd-rich-grid-renderer, yt-horizontal-list-renderer'
    );
    recommendations.forEach(el => el.remove());
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
            '[aria-label*="Pinned"], .badge-shape-wiz__text, ytd-pinned-comment-badge-renderer'
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
                'Removed subscriptions-like section via avatar detection'
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
 * Checks the current time and removes recommendations and comments if within curfew.
 * @param {number} startHour - The start hour of the curfew.
 * @param {number} endHour - The end hour of the curfew.
 */
function checkTimeAndRemove(startHour, endHour) {
    const now = new Date();
    const hour = now.getHours();

    if (!isWithinCurfew(hour, startHour, endHour)) {
        return;
    }
    const style = document.createElement('style');
    style.textContent = `
        ytd-comment-thread-renderer:not(.PINNED) {
            visibility: hidden !important;
        }
    `;
    document.head.appendChild(style);

    reactiveCall(() => {
        // redirectShortsToWatch();
        removeRecommendations();
        markPinnedComment();
        removeSubscriptions();
    });
}

// Load settings and run the check
browser.storage.local.get(['startHour', 'endHour'], function (result) {
    const startHour = result.startHour || 21; // Default 9 PM
    const endHour = result.endHour || 7; // Default 7 AM
    checkTimeAndRemove(startHour, endHour);
});
