// 🔍 Find all "Copy" buttons
function getCopyButtons() {
  const buttons = document.querySelectorAll('button[aria-label="Copy"]');
  return Array.from(buttons).filter(button => {
    const parent = button.parentElement;
    return parent && parent.querySelector('[data-testid="good-response-turn-action-button"]');
  });
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
  container.style.position = "relative";
  container.style.padding = "2px 0";

  // Main icon button (refresh/sync SVG)
  const iconButton = document.createElement("button");
  iconButton.setAttribute("aria-label", "Super Copy");
  iconButton.style.background = "none";
  iconButton.style.border = "none";
  iconButton.style.cursor = "pointer";
  iconButton.style.display = "flex";
  iconButton.style.alignItems = "center";
  iconButton.style.padding = "4px";
  iconButton.style.width = "24px";
  iconButton.style.height = "24px";
  iconButton.title = "Copy";

  const copyIconSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>
  `;
  const checkIconSVG = `
    <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"size-6\" width=\"24\" height=\"24\">
      <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.5 12.75l6 6 9-13.5\" />
    </svg>
  `;
  iconButton.innerHTML = copyIconSVG;

  let checkTimeout = null;
  iconButton.addEventListener("click", () => {
    if (checkTimeout) clearTimeout(checkTimeout);
    iconButton.innerHTML = checkIconSVG;
    checkTimeout = setTimeout(() => {
      iconButton.innerHTML = copyIconSVG;
    }, 2000);
    onCopy();
  });
  
  // Add hover effect for iconButton
  container.addEventListener("mouseenter", () => {
    container.style.background = "#2E2E2E";
    container.style.borderRadius = "8px";
  });
  container.addEventListener("mouseleave", () => {
    container.style.background = "none";
    container.style.borderRadius = "0";
  });

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
  menu.style.backgroundColor = "#2E2E2E";
  // menu.style.border = "1px solid #ccc";
  menu.style.borderRadius = "16px";
  menu.style.padding = "8px";
  menu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  menu.style.zIndex = "1000";
  menu.style.color = "white";
  menu.style.minWidth = "180px";

  const options = [
    {
      text: "Copy clean text (Recommended)",
      transformations: [removeFramingText, removeAllHRs]
    },
    {
      text: "Copy as is",
      transformations: []
    },
    {
      text: "Copy without intro/outro",
      transformations: [removeFramingText]
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
    optionElement.style.padding = "8px 12px";
    optionElement.style.cursor = "pointer";
    optionElement.style.borderRadius = "8px";
    optionElement.style.fontSize = "15px";
    optionElement.style.background = idx === currentIdx ? "#484848" : "#2E2E2E";
    optionElement.addEventListener("click", () => {
      setDefaultTransformationIndex(idx);
      menu.remove();
      if (onSelect) onSelect(idx);
    });
    optionElement.addEventListener("mouseenter", () => {
      optionElement.style.background = "#484848";
    });
    optionElement.addEventListener("mouseleave", () => {
      optionElement.style.background = idx === currentIdx ? "#484848" : "#2E2E2E";
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

    // Configure turndown to handle tables
    turndownService.addRule('tables', {
      filter: ['table'],
      replacement: function(content, node) {
        const table = node;
        const rows = Array.from(table.querySelectorAll('tr'));
        
        // Get headers
        const headers = Array.from(rows[0].querySelectorAll('th, td'))
          .map(cell => cell.textContent.trim());
        
        // Create header row
        let markdown = '| ' + headers.join(' | ') + ' |\n';
        
        // Create separator row
        markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
        
        // Add data rows
        for (let i = 1; i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll('td'))
            .map(cell => cell.textContent.trim());
          markdown += '| ' + cells.join(' | ') + ' |\n';
        }
        
        return markdown;
      }
    });

    // Configure turndown to handle lists properly
    turndownService.addRule('lists', {
      filter: ['ul', 'ol'],
      replacement: function(content, node) {
        const listItems = Array.from(node.querySelectorAll('li'));
        const isOrdered = node.tagName.toLowerCase() === 'ol';
        
        let markdown = '';
        listItems.forEach((item, index) => {
          const prefix = isOrdered ? `${index + 1}. ` : '- ';
          const text = item.textContent.trim();
          markdown += `${prefix}${text}\n`;
        });
        
        return markdown;
      }
    });

    // Convert HTML to Markdown
    let markdown = turndownService.turndown(transformedDiv.innerHTML);
    
    // Clean up any extra newlines and spaces
    markdown = markdown
      .replace(/\n{3,}/g, '\n\n')  // Replace 3 or more newlines with 2
      .replace(/\n\s*\n\s*[-*+]\s/g, '\n- ')  // Fix spacing before bullet points
      .replace(/\n\s*\n\s*\d+\.\s/g, '\n1. ')  // Fix spacing before numbered lists
      .trim();
    
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

  // Hide the original copy button
  copyButton.style.display = "none";

  const options = [
    {
      text: "Copy clean text (Recommended)",
      transformations: [removeFramingText, removeAllHRs]
    },
    {
      text: "Copy as is",
      transformations: []
    },
    {
      text: "Copy without intro/outro",
      transformations: [removeFramingText]
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
