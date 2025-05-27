// Function to find and log copy buttons
function insertSuperCopyButton() {
    const copyButtons = document.querySelectorAll('button[aria-label="Copy"]');

    copyButtons.forEach((copyButton) => {
        // Skip if already processed
        if (copyButton.dataset.copyPlusInjected) return;

        // Mark this button as processed
        copyButton.dataset.copyPlusInjected = 'true';

        // Create the new Copy+ button
        const newButton = document.createElement('button');
        newButton.innerText = 'SuperCopy';
        newButton.setAttribute('aria-label', 'Copy Plus');
        newButton.style.marginLeft = '8px';

        newButton.addEventListener('click', () => {
            console.log('Copy+ clicked!');
            // Add your advanced copy logic here
        });

        // Insert new button right after the original one
        copyButton.parentNode.insertBefore(newButton, copyButton.nextSibling);
    });
}


// Function to initialize the extension
function initialize() {
    // Initial run after a short delay to ensure page is loaded
    setTimeout(insertSuperCopyButton, 1000);

    // Create a MutationObserver to watch for new buttons
    const observer = new MutationObserver((mutations) => {
        // Only process mutations that add nodes
        const hasNewNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
        if (hasNewNodes) {
            insertSuperCopyButton();
        }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Wait for the page to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 