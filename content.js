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

// 🍔 Create menu component
function createMenu(copyButton, markdownDiv) {
  const menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.backgroundColor = "white";
  menu.style.border = "1px solid #ccc";
  menu.style.borderRadius = "4px";
  menu.style.padding = "8px";
  menu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  menu.style.zIndex = "1000";

  const option1 = document.createElement("div");
  option1.innerText = "Copy with framing text";
  option1.style.padding = "4px 8px";
  option1.style.cursor = "pointer";
  option1.style.hover = "background-color: #f0f0f0";
  option1.addEventListener("click", () => {
    const markdownText = extractMarkdownText(markdownDiv, false);
    copyToClipboard(markdownText)
      .then(() => console.log("Copied markdown content with framing text"))
      .catch((err) => console.error("Failed to copy:", err));
    menu.remove();
  });

  const option2 = document.createElement("div");
  option2.innerText = "Copy without framing text";
  option2.style.padding = "4px 8px";
  option2.style.cursor = "pointer";
  option2.style.hover = "background-color: #f0f0f0";
  option2.addEventListener("click", () => {
    const markdownText = extractMarkdownText(markdownDiv, true);
    copyToClipboard(markdownText)
      .then(() => console.log("Copied markdown content without framing text"))
      .catch((err) => console.error("Failed to copy:", err));
    menu.remove();
  });

  menu.appendChild(option1);
  menu.appendChild(option2);

  // Position the menu below the button
  const buttonRect = copyButton.getBoundingClientRect();
  menu.style.top = `${buttonRect.bottom + window.scrollY}px`;
  menu.style.left = `${buttonRect.left + window.scrollX}px`;

  // Close menu when clicking outside
  document.addEventListener("click", function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== copyButton) {
      menu.remove();
      document.removeEventListener("click", closeMenu);
    }
  });

  return menu;
}

// 🧭 Find the markdown container near a copy button
function findMarkdownContainer(copyButton) {
  const copyParent = copyButton.closest("div");
  const outerParent = copyParent?.parentElement;
  const sibling =
    outerParent?.previousElementSibling || outerParent?.nextElementSibling;
  return sibling?.querySelector(".markdown");
}

// 🧹 Clean up markdown content by removing first/last paragraphs and adjacent HRs
function removeFramingText(element) {
  const paragraphs = element.getElementsByTagName('p');
  if (paragraphs.length > 0) {
    // Handle first paragraph
    if (paragraphs[0].textContent !== '') {
      // Remove HR after first paragraph if it exists
      const hrAfter = paragraphs[0].nextElementSibling;
      if (hrAfter && hrAfter.tagName === 'HR') {
        hrAfter.remove();
      }
      // Remove first paragraph
      element.removeChild(paragraphs[0]);
    }

    // Handle last paragraph
    if (paragraphs[paragraphs.length - 1].textContent !== '') {
      // Remove HR before last paragraph if it exists
      const hrBefore = paragraphs[paragraphs.length - 1].previousElementSibling;
      if (hrBefore && hrBefore.tagName === 'HR') {
        hrBefore.remove();
      }
      // Remove last paragraph
      element.removeChild(paragraphs[paragraphs.length - 1]);
    }
  }
  return element;
}

// 📄 Extract and clean markdown text from HTML using turndown
function extractMarkdownText(markdownDiv, removeFraming = true) {
  if (!markdownDiv) {
    console.error('Markdown div is undefined');
    return '';
  }

  if (typeof TurndownService === 'undefined') {
    console.error('TurndownService is not loaded');
    return markdownDiv.innerText.trim();
  }

  try {
    // Create a clone of the markdown div to avoid modifying the original
    const clonedDiv = markdownDiv.cloneNode(true);
    console.log(clonedDiv);

    // Clean up the content if removeFraming is true
    if (removeFraming) {
      removeFramingText(clonedDiv);
    }

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
    let markdown = turndownService.turndown(clonedDiv.innerHTML);
    
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

    const menu = createMenu(superCopyButton, markdownDiv);
    document.body.appendChild(menu);
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
