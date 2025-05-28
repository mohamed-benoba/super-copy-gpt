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

// 🧱 Create the SuperCopy split button
function createSuperCopySplitButton(onCopy, onMenu) {
  const container = document.createElement("div");
  container.style.display = "inline-flex";
  container.style.alignItems = "center";
  container.style.marginLeft = "8px";
  container.style.position = "relative";

  // Main icon button (refresh/sync SVG)
  const iconButton = document.createElement("button");
  iconButton.setAttribute("aria-label", "Super Copy");
  iconButton.style.background = "none";
  iconButton.style.border = "none";
  iconButton.style.cursor = "pointer";
  iconButton.style.display = "flex";
  iconButton.style.alignItems = "center";
  iconButton.style.padding = "4px";
  iconButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M10 16V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14.36 14.36L15.78 15.78" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M2 10H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 10H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M4.22 15.78L5.64 14.36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14.36 5.64L15.78 4.22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
    </svg>
  `;
  iconButton.addEventListener("click", onCopy);

  // Chevron button
  const chevronButton = document.createElement("button");
  chevronButton.setAttribute("aria-label", "Super Copy Options");
  chevronButton.style.background = "none";
  chevronButton.style.border = "none";
  chevronButton.style.cursor = "pointer";
  chevronButton.style.display = "flex";
  chevronButton.style.alignItems = "center";
  chevronButton.style.padding = "4px";
  chevronButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  chevronButton.addEventListener("click", (e) => {
    e.stopPropagation();
    onMenu(container, chevronButton);
  });

  container.appendChild(iconButton);
  container.appendChild(chevronButton);
  return container;
}

// 🏷️ Default transformation index (persisted in localStorage)
const SUPER_COPY_DEFAULT_KEY = 'superCopyDefaultIndex';
function getDefaultTransformationIndex() {
  const idx = localStorage.getItem(SUPER_COPY_DEFAULT_KEY);
  return idx !== null ? parseInt(idx, 10) : 0;
}
function setDefaultTransformationIndex(idx) {
  localStorage.setItem(SUPER_COPY_DEFAULT_KEY, idx);
}

// 🍔 Create menu component for selecting default
function createMenuForDefault(parent, anchorButton, onSelect) {
  const menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.backgroundColor = "white";
  menu.style.border = "1px solid #ccc";
  menu.style.borderRadius = "4px";
  menu.style.padding = "8px";
  menu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  menu.style.zIndex = "1000";
  menu.style.color = "black";
  menu.style.minWidth = "180px";

  const options = [
    {
      text: "Copy as is",
      transformations: []
    },
    {
      text: "Copy without framing text",
      transformations: [removeFramingText]
    },
    {
      text: "Copy without framing and HR tags",
      transformations: [removeFramingText, removeAllHRs]
    },
    {
      text: "Copy plain text (no markdown)",
      transformations: [removeMarkdownFormatting]
    }
  ];
  const currentIdx = getDefaultTransformationIndex();

  options.forEach((option, idx) => {
    const optionElement = document.createElement("div");
    optionElement.innerText = option.text + (idx === currentIdx ? "  ✓" : "");
    optionElement.style.padding = "4px 8px";
    optionElement.style.cursor = "pointer";
    optionElement.style.background = idx === currentIdx ? "#f0f0f0" : "white";
    optionElement.addEventListener("click", () => {
      setDefaultTransformationIndex(idx);
      menu.remove();
      if (onSelect) onSelect(idx);
    });
    optionElement.addEventListener("mouseenter", () => {
      optionElement.style.background = "#f0f0f0";
    });
    optionElement.addEventListener("mouseleave", () => {
      optionElement.style.background = idx === currentIdx ? "#f0f0f0" : "white";
    });
    menu.appendChild(optionElement);
  });

  // Position the menu below the anchor button
  const rect = anchorButton.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target) && e.target !== anchorButton) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 0);

  document.body.appendChild(menu);
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

// 🧹 Remove all HR tags from the element
function removeAllHRs(element) {
  const hrs = element.getElementsByTagName('hr');
  while (hrs.length > 0) {
    hrs[0].remove();
  }
  return element;
}

// 🧹 Remove all markdown formatting
function removeMarkdownFormatting(element) {
  // Remove all formatting elements while preserving text
  const elementsToRemove = element.querySelectorAll('strong, em, code, pre, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, li');
  elementsToRemove.forEach(el => {
    const textNode = document.createTextNode(el.textContent);
    el.parentNode.replaceChild(textNode, el);
  });
  return element;
}

// 🧹 Apply transformations to the element
function applyTransformations(element, transformations) {
  const clonedElement = element.cloneNode(true);
  transformations.forEach(transform => transform(clonedElement));
  return clonedElement;
}

// 📄 Extract and clean markdown text from HTML using turndown
function extractMarkdownText(markdownDiv, transformations = []) {
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

    // Apply transformations if any
    const transformedDiv = transformations.length > 0 
      ? applyTransformations(clonedDiv, transformations)
      : clonedDiv;

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
    let markdown = turndownService.turndown(transformedDiv.innerHTML);
    
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

// ⚡ Add SuperCopy split button next to Copy button
function addSuperCopyButton(copyButton) {
  if (isSuperCopyInjected(copyButton)) return;
  markAsInjected(copyButton);

  const options = [
    {
      text: "Copy as is",
      transformations: []
    },
    {
      text: "Copy without framing text",
      transformations: [removeFramingText]
    },
    {
      text: "Copy without framing and HR tags",
      transformations: [removeFramingText, removeAllHRs]
    },
    {
      text: "Copy plain text (no markdown)",
      transformations: [removeMarkdownFormatting]
    }
  ];

  const superCopyButton = createSuperCopySplitButton(
    () => {
      const markdownDiv = findMarkdownContainer(copyButton);
      if (!markdownDiv) {
        console.warn("Markdown container not found");
        return;
      }
      const idx = getDefaultTransformationIndex();
      const markdownText = extractMarkdownText(markdownDiv, options[idx].transformations);
      copyToClipboard(markdownText)
        .then(() => console.log(`Copied markdown content: ${options[idx].text}`))
        .catch((err) => console.error("Failed to copy:", err));
    },
    (container, anchorButton) => {
      createMenuForDefault(container, anchorButton, () => {});
    }
  );

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
