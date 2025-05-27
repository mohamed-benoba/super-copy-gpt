// 🔍 Find all "Copy" buttons
function getCopyButtons() {
  return document.querySelectorAll('button[aria-label="Copy"]');
}

// ✅ Check if SuperCopy was already added
function isSuperCopyInjected(button) {
  return button.dataset.copyPlusInjected === "true";
}

// 🧷 Mark the button as processed
function markAsInjected(button) {
  button.dataset.copyPlusInjected = "true";
}

// 🧱 Create the SuperCopy button
function createSuperCopyButton(onClick) {
  const button = document.createElement("button");
  button.innerText = "SuperCopy";
  button.setAttribute("aria-label", "Super Copy");
  button.style.marginLeft = "8px";
  button.addEventListener("click", onClick);
  return button;
}

// 🧭 Find the markdown container near a copy button
function findMarkdownContainer(copyButton) {
  const copyParent = copyButton.closest("div");
  const outerParent = copyParent?.parentElement;
  const sibling =
    outerParent?.previousElementSibling || outerParent?.nextElementSibling;
  return sibling?.querySelector(".markdown");
}

// 📄 Extract and clean markdown text from HTML using turndown
function extractMarkdownText(markdownDiv) {
  if (typeof TurndownService === 'undefined') {
    console.error('TurndownService is not loaded');
    return markdownDiv.innerText.trim();
  }

  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      bulletListMarker: '-',
      strongDelimiter: '**'
    });

    // Configure turndown to handle code blocks properly
    turndownService.addRule('codeBlocks', {
      filter: ['pre'],
      replacement: function(content, node) {
        const code = node.querySelector('code');
        const language = code?.className?.replace('language-', '') || '';
        return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
      }
    });

    // Configure turndown to handle inline code
    turndownService.addRule('inlineCode', {
      filter: ['code'],
      replacement: function(content) {
        return `\`${content}\``;
      }
    });

    // Convert HTML to Markdown
    let markdown = turndownService.turndown(markdownDiv.innerHTML);
    
    // Clean up any extra newlines
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
    
    return markdown;
  } catch (error) {
    console.error('Error converting to markdown:', error);
    return markdownDiv.innerText.trim();
  }
}

// 📋 Copy text to clipboard
function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

// ⚡ Add SuperCopy button next to Copy button
function addSuperCopyButton(copyButton) {
  if (isSuperCopyInjected(copyButton)) return;

  markAsInjected(copyButton);

  const superCopyButton = createSuperCopyButton(() => {
    const markdownDiv = findMarkdownContainer(copyButton);
    if (!markdownDiv) {
      console.warn("Markdown container not found");
      return;
    }

    const markdownText = extractMarkdownText(markdownDiv);

    copyToClipboard(markdownText)
      .then(() => console.log("Copied markdown content to clipboard"))
      .catch((err) => console.error("Failed to copy:", err));
  });

  copyButton.parentNode.insertBefore(superCopyButton, copyButton.nextSibling);
}

// 🔁 Run main logic
function processAllCopyButtons() {
  const buttons = getCopyButtons();
  buttons.forEach(addSuperCopyButton);
}

// Observer to watch for new buttons
function initialize() {
  // Wait for turndown to be loaded
  if (typeof TurndownService === 'undefined') {
    console.log('Waiting for turndown to load...');
    setTimeout(initialize, 100);
    return;
  }

  setTimeout(processAllCopyButtons, 1000);

  const observer = new MutationObserver((mutations) => {
    const hasNewNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasNewNodes) processAllCopyButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
