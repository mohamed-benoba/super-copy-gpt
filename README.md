# SuperCopy for ChatGPT

A Chrome extension that enhances the copy functionality in ChatGPT by providing advanced markdown copying options and transformations.

## Features

### Smart Copy Button
- Replace the old copy button with a newer one
- Dropdown menu for selecting different copy formats

### Copy Options
1. **Copy as is**
   - Copies the content exactly as it appears
   - Preserves all formatting and structure

2. **Copy without framing text**
   - Removes the first and last paragraphs
   - Eliminates adjacent horizontal rules (HR tags)
   - Perfect for copying just the main content

3. **Copy without framing and HR tags**
   - Removes all horizontal rules
   - Removes framing text
   - Clean output without dividers

4. **Copy plain text (no markdown)**
   - Removes all markdown formatting
   - Converts to plain text
   - Preserves only the content

### Smart Features
- **Default Setting Memory**: Remembers your preferred copy format
- **Visual Feedback**: Shows a checkmark icon when content is copied
- **Hover Effects**: Interactive UI with hover states
- **Proper Table Support**: Maintains table formatting in markdown
- **Clean List Formatting**: Preserves proper bullet point and numbered list formatting

## Technical Details

### Transformations
The extension applies various transformations to clean up the content:
- Removes framing text (first/last paragraphs)
- Eliminates horizontal rules
- Strips markdown formatting
- Preserves table structures
- Maintains proper list formatting

### UI Components
- Split button design with main action and dropdown
- Dropdown menu with format options
- Visual feedback for copy actions
- Hover effects for better UX

## Usage

1. Click the main button to copy with your default settings
2. Click the dropdown arrow to select a different copy format
3. Your selected format becomes the new default for future copies

## Installation

1. Clone this repository
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Dependencies
- TurndownService for HTML to Markdown conversion
- Chrome Extension APIs

## License
MIT License