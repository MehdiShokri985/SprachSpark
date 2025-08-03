# Component Reference Guide

## Main Application Components (index.html)

### Application Container

#### `.container`
Main wrapper for the entire vocabulary application.

**CSS Properties:**
```css
.container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}
```

**Usage:**
- Houses all accordion groups
- Provides centered layout
- Serves as event delegation root

**HTML Structure:**
```html
<div class="container">
  <!-- Accordion groups dynamically added here -->
</div>
```

### Accordion System

#### `.accordion`
Individual collapsible section containing vocabulary groups.

**CSS Properties:**
```css
.accordion {
  margin-bottom: 20px;
}
```

**Components:**
- `.accordion-header`: Clickable header with controls
- `.accordion-content`: Collapsible content area

#### `.accordion-header`
Sticky header with group title and control buttons.

**CSS Properties:**
```css
.accordion-header {
  background-color: #2c3e50;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  color: #00ff88;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}
```

**Features:**
- Sticky positioning for persistent access
- Hover effects on desktop
- Flexbox layout for responsive design

**HTML Structure:**
```html
<div class="accordion-header">
  <span>Gruppe 1 (1 - 50)</span>
  <div class="header-buttons">
    <button class="test-btn">Worttest</button>
    <button class="toggle-textbox-btn" disabled>Text ein</button>
  </div>
</div>
```

#### `.accordion-content`
Collapsible content area for vocabulary items.

**CSS Properties:**
```css
.accordion-content {
  display: none;
  padding: 10px;
  background-color: #2c3e50;
  border-radius: 6px 6px 10px 10px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}

.accordion-content.active {
  display: block;
}
```

**Features:**
- Smooth scrolling with custom scrollbar
- Lazy loading of content
- Maximum height with overflow handling

### Vocabulary Items

#### `.item`
Individual vocabulary entry with all interactive features.

**CSS Properties:**
```css
.item {
  background-color: #34495e;
  border-radius: 10px;
  padding: 0px 15px 17px 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
```

**Structure:**
- `.item-top`: Header with filename and translation
- `.item-bottom`: Interactive content area
- `.root-icon`: Etymology information button

#### `.item-top`
Header section displaying item identification and translation.

**HTML Structure:**
```html
<div class="item-top">
  <div class="filename">123</div>
  <div class="translate">ترجمه فارسی</div>
</div>
```

**CSS Classes:**
- `.filename`: Item number/identifier
- `.translate`: Persian translation text

#### `.item-bottom`
Interactive content area with text, audio, and controls.

**Components:**
- `.sound`: German text with spans
- `.input-text`: Writing practice input
- `audio`: Audio element for pronunciation
- `.control-buttons`: Action buttons
- `.reveal-slider`: Progressive revelation control

#### `.sound`
German text display with character/word segmentation.

**CSS Properties:**
```css
.sound {
  font-size: 1.5em;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  direction: ltr;
}

.sound span {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.sound span.revealed {
  opacity: 1;
}
```

**Article Color Coding:**
```css
.pink-text { color: #ff69b4; }    /* die */
.blue-text { color: #3498db; }    /* der */
.green-text { color: #2ecc71; }   /* das */
```

**Sentence Styling:**
```css
.sound.sentence {
  background-color: #1a252f;
  border: 2px solid #f1c40f;
}
```

#### `.input-text`
Text input for writing practice with validation.

**CSS Properties:**
```css
.input-text {
  width: 100%;
  padding: 8px;
  border: 2px solid #34495e;
  border-radius: 5px;
  background-color: #2c3e50;
  color: #ecf0f1;
  font-size: 1em;
}

.input-text.correct {
  border-color: #27ae60;
  background-color: #d5e8d4;
}
```

**States:**
- Default: Gray border
- `.correct`: Green border and background when text matches

#### `.reveal-slider`
Range input for progressive text revelation.

**CSS Properties:**
```css
.reveal-slider {
  width: 100%;
  height: 25px;
  border-radius: 15px;
  background: linear-gradient(to right, #00ff88 0%, #34495e 0%);
  outline: none;
  margin-top: 10px;
}
```

**Dynamic Styling:**
- Background gradient updates based on slider value
- Custom thumb styling for better UX

#### `.control-buttons`
Container for action buttons.

**HTML Structure:**
```html
<div class="control-buttons">
  <button class="delete-btn">Delete</button>
  <button class="play-btn">Play Sound</button>
</div>
```

**Button Styles:**
```css
.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 5px;
}

.play-btn {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}
```

#### `.root-icon`
Etymology information trigger button.

**CSS Properties:**
```css
.root-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 25px;
  height: 25px;
  background-color: #f1c40f;
  color: #2c3e50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}
```

**Usage:**
- Displays "i" icon
- Shows root/etymology information in modal
- Only appears when `root` data exists

### Modal System

#### `#rootModal`
Modal overlay for displaying etymology information.

**CSS Properties:**
```css
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### `.modal-content`
Content container within the modal.

**CSS Properties:**
```css
.modal-content {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  position: relative;
}
```

**Components:**
- `.close-button`: X button to close modal
- `#modalRootContent`: Text content area

## Test Module Components (worttest.html)

### Test Container

#### `.container` (Test Version)
Main container for the test interface.

**CSS Properties:**
```css
.container {
  max-width: 800px;
  width: 100%;
  padding: 10px;
  background-color: #1a2b44;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
```

### Game Interface

#### `.score`
Score display component.

**CSS Properties:**
```css
.score {
  font-size: 1.2em;
  margin-bottom: 5px;
  text-align: center;
}
```

**HTML Structure:**
```html
<div class="score">Punktzahl: <span id="score">0</span></div>
```

#### `.timer`
Timer display component.

**CSS Properties:**
```css
.timer {
  font-size: 1.2em;
  margin-bottom: 10px;
  text-align: center;
}

#timer {
  color: #f7f0f6;
  font-size: 1.2em;
}
```

#### `.back-button`
Navigation button to return to main application.

**CSS Properties:**
```css
.back-button {
  background-color: #cca509;
  color: #2c3e50;
  border: none;
  padding: 2px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 5px;
  font-size: 0.8em;
}

.back-button:hover {
  background-color: #d4b32f;
}
```

### Matching Game Layout

#### `.columns`
Two-column layout for German and Persian vocabulary.

**CSS Properties:**
```css
.columns {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.column {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #2c3e50;
  border-radius: 10px;
}
```

**Responsive Design:**
```css
@media (max-width: 600px) {
  .columns {
    flex-direction: column;
    gap: 10px;
  }
}
```

#### `.item` (Test Version)
Clickable vocabulary items in the matching game.

**Base Styles:**
```css
.item {
  padding: 10px;
  margin-bottom: 8px;
  background-color: #34495e;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}
```

**State Styles:**
```css
.item:hover {
  background-color: #3e5771;
}

.item.selected {
  background-color: #f39c12;
  color: #2c3e50;
  transform: scale(1.05);
}

.item.correct {
  background-color: #27ae60;
  color: white;
  cursor: default;
  animation: correctPulse 0.6s ease-in-out;
}

.item.wrong {
  background-color: #e74c3c;
  color: white;
  animation: wrongShake 0.6s ease-in-out;
}
```

**Type-Specific Styles:**
```css
.item.german {
  border-left: 4px solid #3498db;
}

.item.persian {
  border-right: 4px solid #e67e22;
  direction: rtl;
}
```

#### `.popup`
Result modal for displaying game completion.

**CSS Properties:**
```css
.popup {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #2c3e50;
  color: #f4d03f;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  text-align: center;
  min-width: 300px;
}
```

**Content Elements:**
```css
.popup h2 {
  color: #f1c40f;
  margin-top: 0;
}

.popup button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}
```

## Animation Classes

### Keyframe Animations

#### Correct Match Animation
```css
@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

#### Wrong Match Animation
```css
@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

#### Slider Progress Animation
```css
@keyframes sliderFill {
  from { background-position: 0% 0%; }
  to { background-position: 100% 0%; }
}
```

## Responsive Design Classes

### Mobile Adaptations

#### Mobile-Specific Styles
```css
@media (max-width: 768px) {
  .accordion-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-buttons {
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  
  .item-top {
    flex-direction: column;
    text-align: center;
  }
  
  .sound {
    font-size: 1.2em;
  }
}
```

#### Touch Device Adaptations
```css
@media (hover: none) and (pointer: coarse) {
  .accordion-header:hover,
  .item:hover {
    background-color: inherit;
  }
  
  .item {
    padding: 15px;
    font-size: 1.1em;
  }
}
```

## Utility Classes

### Text Direction
```css
.ltr { direction: ltr; }
.rtl { direction: rtl; }
```

### Visibility
```css
.hidden { display: none; }
.visible { display: block; }
```

### Error States
```css
.error {
  color: #e74c3c;
  background-color: #fadbd8;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}
```

## Component Usage Examples

### Creating a Complete Vocabulary Item

```html
<div class="item">
  <div class="item-top">
    <div class="filename">123</div>
    <div class="translate">سگ</div>
  </div>
  <div class="root-icon" data-root-content="animal (حیوان)">i</div>
  <div class="item-bottom" data-reveal-index="0">
    <div class="sound blue-text">
      <span>d</span><span>e</span><span>r</span><span> </span>
      <span>H</span><span>u</span><span>n</span><span>d</span>
    </div>
    <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
    <audio src="audio/123_de.mp3" preload="none"></audio>
    <div class="control-buttons">
      <button class="delete-btn">Delete</button>
      <button class="play-btn">Play Sound</button>
    </div>
    <input type="range" min="0" max="8" value="0" step="1" class="reveal-slider">
  </div>
</div>
```

### Setting Up Test Interface

```html
<div class="container">
  <button class="back-button">Zurück zur Startseite</button>
  <div class="score">Punktzahl: <span id="score">0</span></div>
  <div class="timer">Verbleibende Zeit: <span id="timer">360</span> Sekunden</div>
  <div class="columns">
    <div class="column" id="german-column">
      <div class="item german" data-filename="1">der Hund</div>
      <div class="item german" data-filename="2">die Katze</div>
    </div>
    <div class="column" id="persian-column">
      <div class="item persian" data-filename="2">گربه</div>
      <div class="item persian" data-filename="1">سگ</div>
    </div>
  </div>
</div>
```

### Modal Implementation

```html
<div id="rootModal" class="modal">
  <div class="modal-content">
    <span class="close-button">&times;</span>
    <p id="modalRootContent">Etymology content here</p>
  </div>
</div>
```

## Customization Guide

### Color Theme Customization

#### Primary Colors
```css
:root {
  --primary-bg: #1a252f;
  --secondary-bg: #2c3e50;
  --accent-bg: #34495e;
  --primary-text: #f1c40f;
  --secondary-text: #00ff88;
  --success-color: #27ae60;
  --error-color: #e74c3c;
  --warning-color: #f39c12;
}
```

#### Article Colors
```css
:root {
  --der-color: #3498db;    /* Blue for masculine */
  --die-color: #ff69b4;    /* Pink for feminine */
  --das-color: #2ecc71;    /* Green for neuter */
}
```

### Typography Customization

```css
:root {
  --primary-font: 'Vazir', Arial, sans-serif;
  --heading-size: 1.2em;
  --content-size: 1em;
  --large-size: 1.5em;
}

body {
  font-family: var(--primary-font);
  font-size: var(--content-size);
}
```

### Layout Customization

```css
:root {
  --container-width: 800px;
  --item-spacing: 15px;
  --border-radius: 10px;
  --transition-speed: 0.3s;
}
```

This comprehensive component reference provides all the styling information needed to customize or extend the application's user interface.