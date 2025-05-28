# SuperCopy for ChatGPT - Permissions and Compliance

## Justification for activeTab Permission

We use the `activeTab` permission to:
- Access and modify the copy button functionality on ChatGPT pages
- Enable our enhanced copy features to work with the current page's content
- Allow users to interact with our custom copy button interface
- Access the markdown content for transformation and copying

## Justification for Host Permissions

We request host permissions for:
- `https://chat.openai.com/*`
- `https://chatgpt.com/*`

This permission is required because:
- Our extension specifically targets ChatGPT's interface
- We need to modify the copy button behavior on ChatGPT pages
- We need to access and transform the markdown content from ChatGPT responses
- The extension only functions within the ChatGPT environment

## Justification for Remote Code Use

Our extension uses the following remote resources:
- TurndownService (via CDN) for HTML to Markdown conversion
  - Used to properly convert ChatGPT's HTML content to markdown format
  - No user data is sent to the CDN
  - The library is loaded only when needed for content transformation

## Single-Purpose Description

SuperCopy for ChatGPT is a focused extension that enhances the copy functionality in ChatGPT by:
- Replacing the default copy button with a smarter version
- Providing multiple copy format options:
  - Clean text (removes framing and HR tags)
  - Original format (as is)
  - Without intro/outro text
  - Plain text (no markdown)
- Maintaining proper formatting for:
  - Tables
  - Lists
  - Code blocks
  - Markdown syntax
- Remembering user preferences for future copies

## Data Usage Compliance

✅ We certify that our extension's data usage complies with Chrome Web Store Developer Program Policies:

- No user data is collected or transmitted
- No analytics or tracking is implemented
- No personal information is stored
- All transformations happen locally in the browser
- The extension only modifies the copy functionality on ChatGPT pages
- No data is sent to external servers except for loading the TurndownService library
- All user preferences are stored locally using localStorage 