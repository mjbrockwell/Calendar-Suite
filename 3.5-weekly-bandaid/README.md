# 🩹 Unified Weekly View Bandaid Extension

A backwards-compatible enhancement for David Vargas's Weekly View extension that provides reliable navigation, auto-backlinking, and hashtag enhancement when the original functionality fails.

## 🎯 What is This?

This extension is designed to work **alongside** the popular Weekly View extension from David Vargas's Workbench suite. While the original extension is excellent, it sometimes has reliability issues where buttons don't appear or functionality breaks. This "bandaid" solution monitors for these issues and seamlessly steps in to provide the missing functionality.

Think of it as a safety net that ensures your weekly note workflow never breaks, while preserving full compatibility with the original extension when it's working properly.

## ✨ Features

### 🧭 Navigation Bandaid
- **Smart Detection**: Automatically detects when David Vargas's navigation buttons are missing
- **Seamless Replacement**: Provides "← Last Week" and "Next Week →" buttons with identical functionality
- **Auto-Hide**: Disappears when the original buttons are working properly

### 🔗 Auto-Backlink Bandaid
- **Intelligent Analysis**: Scans your weekly note and determines which daily notes need bidirectional links
- **One-Click Backlinking**: Adds `#[[Weekly Note Title]]` hashtags to all daily notes in the current week
- **Smart Creation**: Creates missing daily note pages automatically
- **Existing Content Preservation**: Only adds hashtags where they don't already exist

### 🎨 Hashtag Enhancer
- **Beautiful Pills**: Transforms ugly hashtags like `#[[06/09 2025 - 06/15 2025]]` into beautiful, readable pills
- **Smart Formatting**: Converts dates to readable format like `📅 Sun Jun 9 - Sat 15`
- **Current Week Highlighting**: Special styling for the current week with subtle pulse animation
- **Preserves Functionality**: All original clicking and navigation remains intact

## 🚀 Installation

1. **Download the Extension**: Save the `extension.js` file to your Roam extensions folder
2. **Enable**: The extension will automatically load when Roam starts
3. **That's It!**: No configuration needed - it works immediately alongside your existing Weekly View extension

### File Location
```
📁 Your Roam Graph/
  📁 extensions/
    📄 extension.js  ← Save the file here
```

## 🔧 How It Works

### Backwards Compatibility Strategy
The extension uses a **detect-and-assist** approach:

1. **Continuous Monitoring**: Watches for weekly note pages and URL changes
2. **Original Extension Detection**: Checks if David Vargas's buttons are present and working
3. **Smart Activation**: Only provides bandaid functionality when the original is missing
4. **Seamless Integration**: When original functionality returns, bandaid features automatically hide

### Technical Architecture

```
🩹 Unified Controller
├── 🧭 Navigation Bandaid (monitors for missing nav buttons)
├── 🔗 Backlink Bandaid (provides auto-backlinking UI)
├── 🎨 Hashtag Enhancer (continuously beautifies hashtags)
└── 🛠️ Shared Utilities (date parsing, DOM helpers, Roam API)
```

### Weekly Note Detection
The extension recognizes weekly notes by detecting this pattern:
- `MM/dd yyyy - MM/dd yyyy` (e.g., "06/09 2025 - 06/15 2025")
- Must be the page title to trigger navigation/backlink features
- Hashtags with this pattern anywhere get enhanced styling

## ⚙️ Configuration

The extension includes several configuration options at the top of the file:

```javascript
const BANDAID_CONFIG = {
    // Feature toggles
    navigationEnabled: true,        // Enable/disable navigation bandaid
    backlinkEnabled: true,         // Enable/disable backlink bandaid  
    hashtagEnhancerEnabled: true,  // Enable/disable hashtag enhancement
    
    // Performance settings
    monitorInterval: 1000,         // How often to check for changes (ms)
    quickCheckInterval: 500,       // Faster retry interval (ms)
    maxRetries: 20,               // Max attempts before giving up
    
    // Styling
    hashtagClassName: 'weekly-hashtag-pill'  // CSS class for enhanced hashtags
};
```

## 📋 Usage Examples

### Navigation
When you're on a weekly note page like "06/09 2025 - 06/15 2025":
- If David Vargas's buttons are missing → Bandaid navigation appears
- If David Vargas's buttons are working → Bandaid stays hidden
- Click "← Last Week" to go to "06/02 2025 - 06/08 2025"
- Click "Next Week →" to go to "06/16 2025 - 06/22 2025"

### Auto-Backlinking
1. Navigate to any weekly note page
2. If daily notes are missing hashtags → "🔗 Auto-backlink to Daily Notes?" button appears
3. Click the button to automatically:
   - Create missing daily note pages (e.g., "June 9th, 2025", "June 10th, 2025", etc.)
   - Add `#[[06/09 2025 - 06/15 2025]]` hashtag to each daily note
   - Skip daily notes that already have the hashtag

### Hashtag Enhancement
Happens automatically everywhere in your graph:
- `#[[06/09 2025 - 06/15 2025]]` → `📅 Sun Jun 9 - Sat 15`
- Current week gets special red styling with pulse animation
- All original link functionality preserved

## 🎨 Visual Styling

### Navigation Buttons
- **Design**: Purple gradient with subtle shadows
- **Hover Effects**: Lift animation and enhanced shadow
- **Positioning**: Spans the full width under the page title

### Backlink Button  
- **Design**: Green theme with rounded corners
- **States**: Normal → Processing → Complete/Error
- **Auto-removal**: Disappears after 3 seconds when done

### Enhanced Hashtags
- **Design**: Soft gray pills with smooth gradients
- **Current Week**: Red gradient with subtle pulse animation  
- **Hover Effects**: Lift animation and color transitions
- **Mobile Responsive**: Smaller sizing on mobile devices

## 🐛 Troubleshooting

### Navigation Buttons Not Appearing
**Check**: Are you on a weekly note page with the correct title format?
- ✅ Correct: "06/09 2025 - 06/15 2025"
- ❌ Incorrect: "Week of June 9th" or "6/9/25 - 6/15/25"

**Check**: Are David Vargas's buttons already working?
- The bandaid only appears when the original buttons are missing

### Backlink Button Not Appearing  
**Check**: Do your daily notes already have the hashtag?
- The button only appears when daily notes are missing the weekly hashtag
- Check pages like "June 9th, 2025" for existing `#[[06/09 2025 - 06/15 2025]]` tags

### Hashtags Not Enhancing
**Check**: Is the hashtag in the correct format?
- Must match the pattern: `MM/dd yyyy - MM/dd yyyy`
- Works with: `#[[06/09 2025 - 06/15 2025]]`
- Won't work with: `#[[Week 23]]` or `#[[June 9-15]]`

### Performance Issues
**Solution**: Adjust monitoring intervals in configuration:
```javascript
monitorInterval: 2000,     // Check less frequently
quickCheckInterval: 1000   // Slower retry speed
```

## 🔧 Advanced Configuration

### Disable Specific Features
```javascript
const BANDAID_CONFIG = {
    navigationEnabled: false,      // Disable navigation bandaid
    backlinkEnabled: true,         // Keep backlink bandaid
    hashtagEnhancerEnabled: true   // Keep hashtag enhancement
};
```

### Customize Hashtag Styling
Edit the CSS section in the extension file to modify:
- Colors and gradients
- Animation timing
- Hover effects
- Mobile responsiveness

### Add Custom Date Formats
The extension can be extended to support additional weekly note formats by modifying:
- `BANDAID_CONFIG.weeklyPagePattern`
- `BANDAID_CONFIG.weeklyTitlePattern`  
- `BandaidUtils.parseWeeklyNote()`

## 📊 Performance Impact

- **Memory**: Minimal - single monitoring loop vs multiple timers
- **CPU**: Low - smart checking only when needed
- **Network**: None - all processing is local
- **Roam Performance**: Negligible - efficient DOM queries and API usage

## 🤝 Compatibility

### Tested With
- ✅ David Vargas Weekly View extension (all versions)
- ✅ Roam Research (current version)
- ✅ All major browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers

### Known Conflicts
- None identified - designed for maximum compatibility

## 🛠️ Development

### Code Structure
```
extension.js
├── 📋 Configuration & State Management
├── 🛠️ Shared Utilities (dates, DOM, Roam API)
├── 🎨 CSS Styles (all styling in one place)
├── 🧭 Navigation Bandaid Module
├── 🔗 Backlink Bandaid Module  
├── 🎨 Hashtag Enhancer Module
├── 🎯 Unified Controller (orchestrates everything)
└── 🚀 Initialization
```

### Contributing
The code is well-documented and modular. Common modification points:
- **Configuration**: Top of file
- **Styling**: CSS injection section
- **Date Formats**: Utility functions
- **New Features**: Add to appropriate module

## 📝 License

This is a community tool designed to enhance the Roam Research experience. Use and modify as needed for your workflow.

## 🙏 Acknowledgments

- **David Vargas** for the original Weekly View extension that inspired this bandaid solution
- **Roam Research** for providing the extensible platform
- **The Roam Community** for continuous inspiration and feedback

---

*Made with ❤️ for the Roam community. Because reliable weekly notes shouldn't be a weekly struggle.*