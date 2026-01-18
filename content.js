function removeRecommendations() {
    // Target the secondary column which contains recommendations
    const secondary = document.getElementById('secondary');
    if (secondary) {
        secondary.style.display = 'none';
    }

    // Also target specific recommendation containers if they exist
    const recommendations = document.querySelectorAll(
        'ytd-watch-next-secondary-results-renderer, ytd-compact-video-renderer'
    );
    recommendations.forEach(el => el.remove());
}

function checkTimeAndRemove() {
    const now = new Date();
    const hour = now.getHours();

    // Check if it's 9 PM or later (21:00 in 24-hour format)
    if (hour >= 21) {
        removeRecommendations();

        // Set up a MutationObserver to handle dynamically loaded content
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    removeRecommendations();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
}

// Run the check when the content script loads
checkTimeAndRemove();
