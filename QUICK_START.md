# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for audio files)

### 1. Setup Local Server

Choose one method:

**Python (Recommended):**
```bash
cd /path/to/wortliste
python -m http.server 8000
```

**Node.js:**
```bash
npx serve . -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

### 2. Open Application
Navigate to: `http://localhost:8000`

## 🎯 Basic Usage

### Learning Mode

1. **Browse Vocabulary**: Click any accordion header (e.g., "Gruppe 1")
2. **Reveal Text**: 
   - Use slider for gradual revelation
   - Click text to toggle full reveal/hide
3. **Practice Writing**: Type in the text input box
4. **Listen**: Click "Play Sound" for pronunciation
5. **View Etymology**: Click "i" icon when available

### Test Mode

1. **Start Test**: Click "Worttest" button in any group
2. **Match Words**: 
   - Click German word → Click Persian translation
   - Correct match: +1 point, green highlight
   - Wrong match: -1 point, red highlight
3. **Complete**: Match all pairs or wait for timer
4. **Results**: View score and restart

## 📂 File Structure Quick Reference

```
Essential Files:
├── index.html          # Main app
├── worttest.html       # Test page
├── json-worter.json    # Vocabulary data
├── js/
│   ├── index.js        # Main logic
│   └── worttest.js     # Test logic
├── css/
│   ├── index.css       # Main styles
│   └── worttest.css    # Test styles
└── audio/              # Sound files
```

## ⚡ Common Tasks

### Add New Vocabulary

1. **Edit JSON**: Add to `json-worter.json`
```json
{
  "Filename": "999",
  "Sound_de": "neues Wort",
  "translate_fa": "کلمه جدید",
  "file": "999_de.mp3",
  "root": "optional etymology"
}
```

2. **Add Audio**: Place `999_de.mp3` in `audio/` folder

### Customize Colors

Edit `css/index.css`:
```css
/* Article colors */
.blue-text { color: #your-color; }   /* der */
.pink-text { color: #your-color; }   /* die */
.green-text { color: #your-color; }  /* das */

/* Theme colors */
body { background-color: #your-bg; }
.accordion-header { background-color: #your-accent; }
```

### Change Group Size

Edit `js/index.js` line 187:
```javascript
const groupSize = 50; // Change to desired size
```

### Custom Audio Path

Edit `js/index.js` line 101:
```javascript
<audio src="your-path/${item.file}" preload="none"></audio>
```

## 🔧 Troubleshooting

### Audio Not Playing
- ✅ Check local server is running
- ✅ Verify audio files exist in `audio/` folder
- ✅ Check file naming: `{Filename}_de.mp3`

### JSON Errors
- ✅ Validate JSON syntax
- ✅ Check required fields: `Filename`, `Sound_de`, `translate_fa`, `file`
- ✅ Ensure proper encoding for Persian text

### Test Mode Issues
- ✅ Check localStorage access (HTTPS/localhost only)
- ✅ Verify test data exists before starting
- ✅ Clear browser cache if needed

### Styling Issues
- ✅ Check CSS file paths
- ✅ Verify class names match documentation
- ✅ Use browser dev tools for debugging

## 📱 Mobile Usage

- **Responsive Design**: Works on phones/tablets
- **Touch Friendly**: Large tap targets
- **Vertical Layout**: Stacks on small screens
- **No Hover**: Touch-optimized interactions

## 🎨 Quick Customization

### Change Timer Duration
Edit `js/worttest.js` line 9:
```javascript
let timeLeft = 360; // Seconds (change as needed)
```

### Modify Reveal Animation
Edit `css/index.css`:
```css
.sound span {
  transition: opacity 0.3s ease; /* Adjust timing */
}
```

### Update Page Title
Edit `index.html` line 7:
```html
<title>Your Custom Title</title>
```

## 🧪 Testing

### Test Data Validation
```javascript
// Console check for data integrity
fetch('json-worter.json')
  .then(r => r.json())
  .then(data => {
    const invalid = data.filter(item => 
      !item.Filename || !item.Sound_de || !item.translate_fa
    );
    console.log('Invalid items:', invalid.length);
  });
```

### Performance Check
```javascript
// Check memory usage
console.log('Items loaded:', document.querySelectorAll('.item').length);
console.log('Memory:', performance.memory);
```

## 🔀 Integration Examples

### Custom Loading Screen
```javascript
// Add to js/index.js before fetch
document.querySelector('.container').innerHTML = 
  '<div class="loading">Loading vocabulary...</div>';
```

### Progress Tracking
```javascript
// Track user progress
function trackProgress(itemId, correct) {
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  progress[itemId] = { correct, timestamp: Date.now() };
  localStorage.setItem('progress', JSON.stringify(progress));
}
```

### Custom Keyboard Shortcuts
```javascript
// Add keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'Space') {
    // Play current audio
    document.querySelector('.play-btn').click();
  }
  if (e.key === 'Enter') {
    // Reveal all text
    document.querySelector('.sound').click();
  }
});
```

## 📊 Data Format Examples

### Basic Word
```json
{
  "Filename": "1",
  "Sound_de": "Hallo",
  "translate_fa": "سلام",
  "file": "1_de.mp3"
}
```

### Word with Article
```json
{
  "Filename": "2",
  "Sound_de": "der Hund",
  "translate_fa": "سگ",
  "file": "2_de.mp3",
  "root": "animal (حیوان)"
}
```

### Sentence
```json
{
  "Filename": "3",
  "Sound_de": "Wie geht es dir?",
  "translate_fa": "حالت چطوره؟",
  "file": "3_de.mp3"
}
```

## 🎯 Best Practices

### Performance
- ✅ Use lazy loading (built-in)
- ✅ Optimize audio files (MP3, 64kbps)
- ✅ Minimize JSON file size
- ✅ Enable gzip compression

### Accessibility
- ✅ Include alt text for audio
- ✅ Use semantic HTML
- ✅ Ensure keyboard navigation
- ✅ Test with screen readers

### Content
- ✅ Consistent audio quality
- ✅ Proper Persian encoding (UTF-8)
- ✅ Meaningful etymology information
- ✅ Progressive difficulty ordering

## 🆘 Quick Fixes

### Reset Application
```javascript
// Clear all data and restart
localStorage.clear();
location.reload();
```

### Force Reload Vocabulary
```javascript
// Bypass cache
fetch('json-worter.json?' + Date.now())
  .then(r => r.json())
  .then(renderItems);
```

### Debug Mode
```javascript
// Enable debug logging
window.DEBUG = true;
console.log('Debug mode enabled');
```

## 📞 Support

### Common Issues
1. **CORS Errors**: Use local server, not file:// protocol
2. **Audio Silent**: Check file paths and formats
3. **Persian Text**: Ensure UTF-8 encoding
4. **Performance**: Large datasets may need chunking

### Browser Console Commands
```javascript
// Check loaded items
console.log('Loaded items:', document.querySelectorAll('.item').length);

// Test audio
new Audio('audio/1_de.mp3').play();

// Validate JSON structure
fetch('json-worter.json').then(r=>r.json()).then(console.log);
```

This quick start guide gets you running immediately while providing solutions for common tasks and issues.