# API Reference Documentation

## Main Application API (js/index.js)

### Global Variables

```javascript
const container = document.querySelector(".container");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const closeButton = document.querySelector(".close-button");
```

### Core Functions

#### `groupItems(items: Array<VocabularyItem>): Array<Array<VocabularyItem>>`

Groups vocabulary items by separating main words from related sentences.

**Algorithm:**
1. Iterates through items array
2. Identifies sentences using regex pattern `/[.!?]$/`
3. Groups main words with their subsequent sentences
4. Returns array of grouped items

**Parameters:**
- `items` (Array): Vocabulary items from JSON data

**Returns:**
- `Array<Array<VocabularyItem>>`: Grouped vocabulary items

**Example Usage:**
```javascript
const rawData = [
  { Filename: "1", Sound_de: "Hallo", translate_fa: "سلام" },
  { Filename: "2", Sound_de: "Hallo! Wie geht's?", translate_fa: "سلام! چطوری؟" }
];

const grouped = groupItems(rawData);
console.log(grouped);
// Output: [
//   [
//     { Filename: "1", Sound_de: "Hallo", translate_fa: "سلام" },
//     { Filename: "2", Sound_de: "Hallo! Wie geht's?", translate_fa: "سلام! چطوری؟" }
//   ]
// ]
```

#### `createItem(group: Array<VocabularyItem>): HTMLElement`

Creates a complete interactive DOM element for a vocabulary group.

**Process:**
1. Extracts main item and related items from group
2. Determines color coding based on German articles
3. Creates HTML structure with event listeners
4. Returns fully functional DOM element

**Parameters:**
- `group` (Array): Array of related vocabulary items (main word + sentences)

**Returns:**
- `HTMLElement`: Complete item DOM with all interactive features

**Article Color Coding:**
- `"die "` → `pink-text` class
- `"der "` → `blue-text` class  
- `"das "` → `green-text` class

**Generated Structure:**
```html
<div class="item">
  <div class="item-top">
    <div class="filename">1</div>
    <div class="translate">سلام</div>
  </div>
  <div class="root-icon" data-root-content="...">i</div>
  <div class="item-bottom">
    <div class="sound blue-text">
      <span>d</span><span>e</span><span>r</span><span> </span><span>H</span><span>u</span><span>n</span><span>d</span>
    </div>
    <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
    <audio src="audio/1_de.mp3" preload="none"></audio>
    <div class="control-buttons">
      <button class="delete-btn">Delete</button>
      <button class="play-btn">Play Sound</button>
    </div>
    <input type="range" min="0" max="8" value="0" step="1" class="reveal-slider">
  </div>
</div>
```

**Example Usage:**
```javascript
const group = [
  { 
    Filename: "1", 
    Sound_de: "der Hund", 
    translate_fa: "سگ", 
    file: "1_de.mp3",
    root: "animal (حیوان)"
  }
];

const itemElement = createItem(group);
document.querySelector('.accordion-content').appendChild(itemElement);
```

#### `renderItems(items: Array<VocabularyItem>): void`

Renders the complete application interface with accordion structure.

**Process:**
1. Clears existing content
2. Groups items using `groupItems()`
3. Creates accordion sections (50 items per group)
4. Adds interactive controls and event listeners
5. Manages accordion state and content loading

**Parameters:**
- `items` (Array): Complete vocabulary dataset

**Features:**
- **Lazy Loading**: Items loaded only when accordion is expanded
- **State Management**: Only one accordion open at a time
- **Group Navigation**: Numbered groups with item ranges
- **Test Integration**: Direct link to vocabulary testing

**Generated Accordion Structure:**
```html
<div class="accordion">
  <div class="accordion-header">
    <span>Gruppe 1 (1 - 50)</span>
    <div class="header-buttons">
      <button class="test-btn">Worttest</button>
      <button class="toggle-textbox-btn" disabled>Text ein</button>
    </div>
  </div>
  <div class="accordion-content" data-group-index="0">
    <!-- Items loaded on demand -->
  </div>
</div>
```

**Example Usage:**
```javascript
// Typically called after fetching data
fetch('json-worter.json')
  .then(response => response.json())
  .then(data => {
    renderItems(data);
    console.log(`Rendered ${data.length} vocabulary items`);
  })
  .catch(error => {
    console.error('Failed to load vocabulary:', error);
  });
```

### Internal Helper Functions

#### `createItemBottom(item: VocabularyItem, isSentence: boolean): HTMLElement`

Internal function that creates the interactive bottom section of vocabulary items.

**Features:**
- Text segmentation (characters for words, words for sentences)
- Progressive revelation slider
- Audio playback controls
- Writing validation
- Delete functionality

**Event Listeners Added:**
- **Play Button**: Triggers audio playback
- **Delete Button**: Removes item from DOM
- **Text Click**: Toggles full reveal/hide
- **Slider Input**: Progressive text revelation
- **Text Input**: Real-time writing validation

## Test Module API (js/worttest.js)

### Global Variables

```javascript
let score = 0;                    // Current game score
let selectedGerman = null;        // Currently selected German item
let selectedPersian = null;       // Currently selected Persian item
let matchedPairs = 0;            // Number of successful matches
let lockSelection = false;        // Prevents selection during feedback
let timeLeft = 360;              // Remaining time in seconds
let timerInterval = null;        // Timer interval reference
```

### Core Functions

#### `shuffle(array: Array<any>): Array<any>`

Randomizes array order using Fisher-Yates shuffle algorithm.

**Algorithm:**
```javascript
for (let i = array.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [array[i], array[j]] = [array[j], array[i]];
}
```

**Parameters:**
- `array` (Array): Array to shuffle (mutates original)

**Returns:**
- `Array`: Shuffled array (same reference)

**Example Usage:**
```javascript
const numbers = [1, 2, 3, 4, 5];
const shuffled = shuffle(numbers);
console.log(shuffled); // [3, 1, 5, 2, 4] (random order)
console.log(numbers === shuffled); // true (same reference)
```

#### `loadPageItems(): void`

Initializes the test interface with sorted German and shuffled Persian vocabulary.

**Process:**
1. Retrieves test data from localStorage
2. Sorts German items alphabetically by `Sound_de`
3. Shuffles Persian items randomly
4. Creates clickable DOM elements
5. Attaches selection event listeners

**Data Source:**
```javascript
const data = JSON.parse(localStorage.getItem("testGroupData")) || [];
```

**Generated Elements:**
```html
<!-- German Column -->
<div class="item german" data-filename="1">der Hund</div>
<div class="item german" data-filename="2">die Katze</div>

<!-- Persian Column -->
<div class="item persian" data-filename="2">گربه</div>
<div class="item persian" data-filename="1">سگ</div>
```

**Example Usage:**
```javascript
// Set test data before calling
const testData = [
  { Filename: "1", Sound_de: "der Hund", translate_fa: "سگ" },
  { Filename: "2", Sound_de: "die Katze", translate_fa: "گربه" }
];
localStorage.setItem("testGroupData", JSON.stringify(testData));

// Load the test interface
loadPageItems();
```

#### `selectItem(element: HTMLElement, type: string): void`

Handles item selection in the matching game.

**Parameters:**
- `element` (HTMLElement): Clicked vocabulary item
- `type` (string): Either `'german'` or `'persian'`

**Behavior:**
- Prevents selection if game locked or item already matched
- Adds visual selection feedback
- Triggers match checking when both items selected
- Manages selection state

**Visual States:**
- `.selected`: Currently selected item
- `.correct`: Successfully matched item
- `.wrong`: Incorrectly matched item (temporary)

**Example Usage:**
```javascript
// Automatically attached during loadPageItems()
germanItem.addEventListener('click', () => selectItem(germanItem, 'german'));
persianItem.addEventListener('click', () => selectItem(persianItem, 'persian'));
```

#### `checkMatch(): void`

Validates selected German-Persian pairs and provides feedback.

**Validation Logic:**
```javascript
if (selectedGerman.dataset.filename === selectedPersian.dataset.filename) {
  // Correct match
} else {
  // Incorrect match
}
```

**Correct Match Actions:**
1. Adds `.correct` class to both items
2. Increments score (+1)
3. Plays success audio
4. Checks for game completion
5. Resets selection

**Incorrect Match Actions:**
1. Adds `.wrong` class temporarily
2. Decrements score (-1)
3. Plays error audio (`falsch.mp3`)
4. Removes visual feedback after 1 second
5. Resets selection

**Audio Files:**
- Success: `audio/{filename}_de.mp3`
- Error: `audio/falsch.mp3`

#### `startTimer(): void`

Initiates the 360-second countdown timer.

**Features:**
- Updates display every second
- Auto-triggers game end when time expires
- Stores interval reference for cleanup

**Timer Logic:**
```javascript
timerInterval = setInterval(() => {
  timeLeft--;
  timerDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    showResult();
  }
}, 1000);
```

#### `restartGame(): void`

Resets the game to initial state.

**Reset Actions:**
1. Score → 0
2. Matched pairs → 0  
3. Timer → 360 seconds
4. Hide result popup
5. Reload vocabulary items
6. Restart timer

#### `showResult(): void`

Displays final game results in popup modal.

**Display Elements:**
- Total possible score (number of vocabulary items)
- Earned score (correct matches)
- Restart and navigation buttons

## Type Definitions

### VocabularyItem Interface

```typescript
interface VocabularyItem {
  Filename: string;        // Unique identifier
  Sound_de: string;        // German text
  translate_fa: string;    // Persian translation
  file: string;           // Audio file name
  root?: string;          // Optional etymology
}
```

### Event Handler Types

```typescript
type AccordionClickHandler = (event: MouseEvent) => void;
type ItemSelectionHandler = (element: HTMLElement, type: 'german' | 'persian') => void;
type SliderInputHandler = (event: Event) => void;
type ButtonClickHandler = (event: MouseEvent) => void;
```

## Integration Examples

### Custom Vocabulary Loading

```javascript
// Load custom vocabulary data
async function loadCustomVocabulary(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Validate data structure
    const isValid = data.every(item => 
      item.Filename && item.Sound_de && item.translate_fa
    );
    
    if (!isValid) {
      throw new Error('Invalid vocabulary data structure');
    }
    
    renderItems(data);
    console.log(`Loaded ${data.length} vocabulary items`);
  } catch (error) {
    console.error('Failed to load vocabulary:', error);
    container.innerHTML = `<div class="error">Error loading vocabulary: ${error.message}</div>`;
  }
}

// Usage
loadCustomVocabulary('custom-vocabulary.json');
```

### Test Data Filtering

```javascript
// Filter vocabulary for specific test
function createTestFromGroup(groupIndex, allItems) {
  const groupSize = 50;
  const start = groupIndex * groupSize;
  const end = Math.min(start + groupSize, allItems.length);
  
  const testData = allItems.slice(start, end);
  localStorage.setItem("testGroupData", JSON.stringify(testData));
  
  // Navigate to test page
  window.location.href = "worttest.html";
}
```

### Audio Management

```javascript
// Preload audio for better performance
function preloadAudio(items) {
  const audioPromises = items.map(item => {
    return new Promise((resolve) => {
      const audio = new Audio(`audio/${item.file}`);
      audio.addEventListener('canplaythrough', resolve);
      audio.load();
    });
  });
  
  return Promise.all(audioPromises);
}

// Usage with error handling
preloadAudio(vocabularyItems)
  .then(() => console.log('Audio preloaded'))
  .catch(error => console.warn('Audio preload failed:', error));
```

### Progressive Enhancement

```javascript
// Feature detection and progressive enhancement
function initializeApplication() {
  // Check for required features
  if (!window.fetch) {
    console.error('Fetch API not supported');
    return;
  }
  
  if (!window.Audio) {
    console.warn('Audio API not supported - audio features disabled');
  }
  
  // Initialize with feature flags
  const features = {
    audio: !!window.Audio,
    localStorage: !!window.localStorage,
    modern: 'querySelector' in document
  };
  
  fetch('json-worter.json')
    .then(response => response.json())
    .then(data => {
      renderItems(data);
      console.log('Application initialized with features:', features);
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}
```