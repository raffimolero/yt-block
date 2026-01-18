/**
 * Saves the curfew start and end hours to browser storage.
 * Displays a status message after saving.
 */
function saveOptions() {
    const startHour = document.getElementById('startHour').value;
    const endHour = document.getElementById('endHour').value;
    browser.storage.local.set(
        {
            startHour: parseInt(startHour),
            endHour: parseInt(endHour),
        },
        function () {
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(() => {
                status.textContent = '';
            }, 750);
        }
    );
}

/**
 * Loads the curfew start and end hours from browser storage and populates the form.
 * Uses default values if not set.
 */
function loadOptions() {
    browser.storage.local.get(['startHour', 'endHour'], function (result) {
        document.getElementById('startHour').value = result.startHour || 21;
        document.getElementById('endHour').value = result.endHour || 7;
    });
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
