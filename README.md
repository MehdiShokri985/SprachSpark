# WORTLISTE - German-Persian Vocabulary Learning Application

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Data Format](#data-format)
- [Main Application (index.html)](#main-application-indexhtml)
- [Test Module (worttest.html)](#test-module-worttesthtml)
- [JavaScript APIs](#javascript-apis)
- [CSS Components](#css-components)
- [Usage Instructions](#usage-instructions)
- [Installation & Setup](#installation--setup)

## Overview

WORTLISTE is a web-based application designed for learning German vocabulary with Persian translations. It's specifically tailored for Goethe A2 certification preparation. The application features:

- Interactive vocabulary learning with audio support
- Progressive text revelation system
- Writing practice with validation
- Timed vocabulary tests
- Accordion-based organization of vocabulary groups

## Project Structure

```
/
├── index.html              # Main application page
├── worttest.html           # Vocabulary test page
├── json-worter.json        # Vocabulary data (18,320 entries)
├── worter.js              # Legacy main JavaScript (duplicate of js/index.js)
├── worter.css             # Legacy CSS (duplicate of css/index.css)
├── js/
│   ├── index.js           # Main application logic
│   └── worttest.js        # Test functionality
├── css/
│   ├── index.css          # Main application styles
│   └── worttest.css       # Test page styles
└── audio/                 # Audio files for pronunciation
```

## Data Format

The application uses JSON data with the following structure:

```json
{
  "Filename": "2",           // Unique identifier/sequence number
  "Sound_de": "ca",          // German text/word
  "translate_fa": "حدوداً",   // Persian translation
  "file": "2_de.mp3",        // Audio file name
  "root": "circa (حدوداً)"   // Etymology/root information (optional)
}
```

### Data Properties
- **Filename**: String - Unique identifier for sequencing
- **Sound_de**: String - German word or sentence
- **translate_fa**: String - Persian translation
- **file**: String - Audio file path relative to `audio/` directory
- **root**: String (optional) - Etymology or root word information

## Main Application (index.html)

### Features
- Accordion-based vocabulary groups (50 items per group)
- Interactive text revelation system
- Audio playback for pronunciation
- Writing practice with real-time validation
- Modal display for etymology information

### Key Components
- **Container**: Main content area (`.container`)
- **Accordion Groups**: Collapsible sections (`.accordion`)
- **Vocabulary Items**: Individual word/sentence entries (`.item`)
- **Root Modal**: Etymology information popup (`#rootModal`)

## Test Module (worttest.html)

### Features
- Matching game between German and Persian translations
- Timer-based gameplay (360 seconds)
- Score tracking
- Audio feedback for correct/incorrect matches
- Results popup with performance summary

### Key Components
- **German Column**: Sorted German vocabulary (`.german-column`)
- **Persian Column**: Shuffled Persian translations (`.persian-column`)
- **Timer**: Countdown display (`#timer`)
- **Score**: Current score display (`#score`)
- **Result Popup**: Final score modal (`#result-popup`)

## JavaScript APIs

### Main Application API (js/index.js)

#### groupItems(items)
Groups vocabulary items by words and their related sentences.

**Parameters:**
- `items` (Array): Array of vocabulary objects

**Returns:**
- `Array`: Grouped items where each group contains a main word and related sentences

**Example:**
```javascript
const grouped = groupItems([
  { Filename: "1", Sound_de: "Hallo", translate_fa: "سلام" },
  { Filename: "2", Sound_de: "Hallo! Wie geht es?", translate_fa: "سلام! حالت چطوره؟" }
]);
// Returns: [[word, sentence], ...]
```

#### createItem(group)
Creates DOM elements for a vocabulary group with interactive features.

**Parameters:**
- `group` (Array): Array of related vocabulary items

**Returns:**
- `HTMLElement`: Complete item DOM structure with event listeners

**Features:**
- Automatic article color coding (der/die/das)
- Progressive text revelation slider
- Audio playback controls
- Writing validation
- Delete functionality

**Example:**
```javascript
const group = [
  { Filename: "1", Sound_de: "der Hund", translate_fa: "سگ", file: "1_de.mp3" }
];
const itemElement = createItem(group);
document.querySelector('.container').appendChild(itemElement);
```

#### renderItems(items)
Renders the complete application interface with accordion groups.

**Parameters:**
- `items` (Array): Complete vocabulary dataset

**Features:**
- Creates accordion structure
- Groups items (50 per accordion)
- Adds interactive controls
- Manages accordion state

**Example:**
```javascript
fetch('json-worter.json')
  .then(response => response.json())
  .then(data => renderItems(data));
```

### Test Module API (js/worttest.js)

#### shuffle(array)
Randomizes array order using Fisher-Yates algorithm.

**Parameters:**
- `array` (Array): Array to shuffle

**Returns:**
- `Array`: Shuffled array

**Example:**
```javascript
const shuffled = shuffle([1, 2, 3, 4, 5]);
// Returns: [3, 1, 5, 2, 4] (random order)
```

#### loadPageItems()
Initializes the test interface with vocabulary items.

**Features:**
- Sorts German words alphabetically
- Randomizes Persian translations
- Creates clickable items
- Sets up event listeners

**Example:**
```javascript
// Called automatically on page load
loadPageItems();
```

#### selectItem(element, type)
Handles item selection in the matching game.

**Parameters:**
- `element` (HTMLElement): Clicked vocabulary item
- `type` (String): Either 'german' or 'persian'

**Features:**
- Visual selection feedback
- Prevents duplicate selections
- Triggers match checking

#### checkMatch()
Validates selected German-Persian pairs.

**Features:**
- Compares filename attributes
- Updates score
- Plays audio feedback
- Manages visual feedback (correct/wrong)
- Checks game completion

#### restartGame()
Resets the game to initial state.

**Features:**
- Resets score and timer
- Reloads vocabulary items
- Hides result popup
- Restarts timer

#### startTimer()
Initiates the countdown timer.

**Features:**
- 360-second countdown
- Updates display every second
- Auto-triggers game end

## CSS Components

### Main Application Styles (css/index.css)

#### Color Scheme
- **Background**: `#1a252f` (Dark blue-gray)
- **Primary**: `#f1c40f` (Gold/Yellow)
- **Secondary**: `#00ff88` (Green)
- **Accent**: `#2c3e50` (Dark gray)

#### Component Classes

**.container**
- Main content wrapper
- Max-width: 800px
- Centered layout

**.accordion**
- Collapsible content sections
- Sticky headers
- Smooth transitions

**.item**
- Individual vocabulary entries
- Rounded corners
- Shadow effects

**.sound**
- Text display with character/word spans
- Color-coded articles:
  - `.pink-text`: "die" articles
  - `.blue-text`: "der" articles  
  - `.green-text`: "das" articles

**.reveal-slider**
- Progressive text revelation control
- Gradient background
- Custom thumb styling

**.input-text**
- Writing practice input
- Validation styling (`.correct` class)

### Test Module Styles (css/worttest.css)

#### Layout Classes

**.columns**
- Two-column layout for German/Persian
- Responsive design
- Flexbox-based

**.item.german / .item.persian**
- Clickable vocabulary items
- State-based styling:
  - `.selected`: Active selection
  - `.correct`: Successful match
  - `.wrong`: Incorrect match

**.popup**
- Modal result display
- Centered overlay
- Performance summary

## Usage Instructions

### Basic Usage

1. **Open the application**: Load `index.html` in a web browser
2. **Browse vocabulary**: Click accordion headers to expand groups
3. **Learn words**: 
   - Click words to reveal/hide text
   - Use slider for progressive revelation
   - Practice writing in text input
   - Click play button for audio

### Text Input Controls

- **Text ein/aus**: Toggle text input visibility
- **Delete**: Remove individual items
- **Play Sound**: Audio pronunciation

### Taking Tests

1. **Start test**: Click "Worttest" button in any group
2. **Match items**: Click German word, then corresponding Persian translation
3. **Score tracking**: +1 for correct, -1 for incorrect
4. **Time limit**: 360 seconds to complete all matches
5. **Results**: View final score and restart option

### Progressive Learning

The revelation slider allows incremental text disclosure:
- **Characters**: For individual words
- **Words**: For sentences
- **Full reveal**: Click text area

## Installation & Setup

### Requirements
- Modern web browser with JavaScript enabled
- Local web server (for proper audio file loading)

### Quick Start

1. **Clone/download** project files
2. **Place audio files** in `audio/` directory
3. **Start local server**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
4. **Open browser** and navigate to `http://localhost:8000`

### File Structure Setup

Ensure audio files follow naming convention:
- Format: `{Filename}_de.mp3`
- Example: `2_de.mp3`, `3_de.mp3`
- Special files: `falsch.mp3` (incorrect answer sound)

### Data Customization

To use custom vocabulary data:

1. **Format JSON** according to data structure
2. **Update file path** in `index.js` line 318:
   ```javascript
   fetch("your-custom-data.json")
   ```
3. **Add corresponding audio files**

### Browser Compatibility

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features required**: ES6, Fetch API, Audio API
- **Mobile support**: Responsive design included

### Performance Notes

- **Large datasets**: 18,000+ entries load efficiently
- **Memory usage**: Items loaded on-demand per accordion
- **Audio loading**: Lazy loading with `preload="none"`

## API Reference Quick Guide

### Core Functions
```javascript
// Main application
groupItems(items)           // Group related vocabulary
createItem(group)          // Create interactive item
renderItems(items)         // Render complete interface

// Test module  
shuffle(array)             // Randomize array
loadPageItems()            // Initialize test interface
selectItem(element, type)  // Handle selections
checkMatch()               // Validate matches
restartGame()              // Reset game state
startTimer()               // Start countdown
```

### Event Listeners
```javascript
// Item interactions
element.addEventListener('click', playAudio)
element.addEventListener('input', validateText)
element.addEventListener('input', updateSlider)

// Navigation
button.addEventListener('click', toggleAccordion)
button.addEventListener('click', startTest)
```

### CSS Classes for Styling
```css
/* Layout */
.container, .accordion, .item

/* Interactive states */
.selected, .correct, .wrong, .revealed

/* Color coding */
.pink-text, .blue-text, .green-text

/* Components */
.reveal-slider, .input-text, .modal, .popup
```