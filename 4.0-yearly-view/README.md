# 📅 Yearly View Extension - Calendar Suite

A comprehensive Roam Research extension that deploys an interactive yearly calendar component, automatically detecting year pages and providing rich event visualization and navigation.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Roam Research](https://img.shields.io/badge/Roam-Research-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### 📊 Interactive Yearly Calendar

- **12-Month Grid Layout**: Beautiful 3×4 grid showing all months for any year
- **Page-Based Navigation**: Automatically detects when you're on year pages like `[[2024]]`, `[[2025]]`
- **Event Visualization**: Displays tagged events from month pages (`[[January 2025]]`, `[[February 2025]]`, etc.)
- **Smart Filtering**: Toggle event categories on/off with customizable tag system
- **Real-time Updates**: Refresh events from all month pages with one click

### 🚀 Advanced Navigation

- **Click Year Buttons**: Navigate directly to other year pages (`[[2023]]`, `[[2026]]`)
- **Click Month Panels**: Jump to specific month pages (`[[March 2025]]`)
- **Sidebar Integration**: Open months or events in Roam's right sidebar (Shift+Click)
- **Direct Event Navigation**: Click any event to jump to that specific block
- **Page Existence Checking**: Warns users when pages don't exist yet

### 🔧 Smart Deployment

- **Auto-Detection**: Monitors page navigation and prompts when you visit year pages
- **One-Click Setup**: Simple dialog to add yearly calendar to any year page
- **Component Reuse**: Deploys ClojureScript component once, reuses across multiple years
- **Non-Intrusive**: Only prompts when appropriate (30-second cooldown)

### ⚙️ Customizable Configuration

- **Tag Categories**: Support for unlimited event categories with colors and emojis
- **Custom Styling**: Each category has configurable colors, backgrounds, and icons
- **Default Filters**: Set which categories are active by default
- **Collapsible Help**: Built-in navigation help that users can show/hide

## 🚀 Quick Start

### Prerequisites

1. **Roam Research** account with extension support
2. **RoamExtensionSuite** extension (dependency)
3. **Month pages** with tagged events (e.g., `[[January 2025]]` with `#yv1` tags)

### Installation

1. Download `yearly-view-extension.js`
2. Add to your Roam graph via Roam Depot or manual installation
3. The extension will auto-deploy on load

### Immediate Usage

1. **Visit `[[2025]]`** (or current year) - the calendar will be automatically added
2. **Create month pages** like `[[January 2025]]`, `[[February 2025]]`
3. **Add tagged events** in month pages: `15 (Mo) - #yv5 Meeting`
4. **Refresh calendar** to see your events appear
5. **Visit other year pages** like `[[2024]]` for automatic setup prompts

## 📋 Event Format

The yearly calendar reads events from month pages using this format:

```
15 (Mo) - Doctor appointment #yv1
22 (We) - Team meeting #yv5
31 (Su) - Birthday party #yv2
```

**Pattern**: `DAY (WEEKDAY) - EVENT_DESCRIPTION #TAG`

### Default Event Categories

| Tag    | Category         | Color  | Emoji | Default |
| ------ | ---------------- | ------ | ----- | ------- |
| `#yv0` | General Events   | Blue   | 🔵    | ✅      |
| `#yv1` | Family Birthdays | Pink   | 🎂    | ✅      |
| `#yv2` | Other Birthdays  | Purple | 🟪    | ❌      |
| `#yv3` | Deadlines        | Orange | 📌    | ✅      |
| `#yv4` | Holidays         | Green  | 🎉    | ✅      |
| `#yv5` | Meetings         | Purple | 👥    | ❌      |
| `#yv6` | For Fun          | Orange | 🥳    | ❌      |

## ⚙️ Custom Configuration

Create a page called `[[roam/yearly calendar config]]` to customize event categories:

```
yv0 - Work Events
    text-color:: 2563eb
    bg-color:: eff6ff
    emoji:: 💼
    default-active:: true

yv1 - Personal Events
    text-color:: dc2626
    bg-color:: fef2f2
    emoji:: 🏠
    default-active:: false

yv7 - Travel
    text-color:: 059669
    bg-color:: ecfdf5
    emoji:: ✈️
    default-active:: true
```

**Configuration Properties:**

- `text-color`: Hex color for text and borders
- `bg-color`: Hex color for background
- `emoji`: Icon displayed with events
- `default-active`: Whether category is enabled by default

## 🎯 Usage Examples

### Basic Setup

1. Create `[[January 2025]]` page
2. Add events: `5 (Sun) - #yv1 Family dinner`
3. Visit `[[2025]]` to see your calendar
4. Click refresh to load new events

### Advanced Navigation

- **Navigate years**: Click `← 2024` or `2026 →` buttons
- **Open in sidebar**: Click `➡️` next to month names
- **Event details**: Click any event to jump to its block
- **Sidebar events**: Shift+Click events to open in sidebar

### Multi-Year Planning

- Visit `[[2024]]`, `[[2025]]`, `[[2026]]`
- Each gets its own calendar automatically
- Switch between years to compare events
- Use month navigation to plan across years

## 🛠️ Technical Details

### Architecture

- **ClojureScript Component**: Deployed to `[[roam/render]]` hierarchy
- **Extension Framework**: Built on Roam Depot extension system
- **Dependency**: Requires RoamExtensionSuite for utilities
- **Page Detection**: Monitors navigation for year pages (4-digit numbers)

### Component Location

```
[[roam/render]]
  └── **Components added by Extensions:**
      └── **Added by Calendar Suite:**
          └── **Yearly View**
              └── ClojureScript component code block
```

### Data Sources

- **Month Pages**: `[[January 2025]]`, `[[February 2025]]`, etc.
- **Config Page**: `[[roam/yearly calendar config]]` (optional)
- **Year Pages**: `[[2024]]`, `[[2025]]`, etc. (auto-created)

## 🐛 Troubleshooting

### Calendar Not Appearing

1. Check that RoamExtensionSuite is loaded first
2. Look for console messages: `F12 → Console`
3. Try running manually: `deployYearlyViewSystem()`
4. Refresh the page after component deployment

### No Events Showing

1. Verify month pages exist: `[[January 2025]]`
2. Check event format: `15 (Mo) - #yv1 Event`
3. Ensure tags match config (default: `yv0` through `yv6`)
4. Click refresh button in calendar

### Year Page Detection Not Working

1. Make sure you're on a 4-digit year page: `[[2025]]`
2. Wait 2-3 seconds for detection
3. Check 30-second cooldown between prompts
4. Look for console messages about detection

### Navigation Issues

1. Verify target pages exist before clicking
2. Check browser console for navigation errors
3. Try creating pages manually first
4. Refresh Roam if navigation becomes unresponsive

## 🔧 Development

### Manual Commands

```javascript
// Deploy entire system
deployYearlyViewSystem();

// Check current page detection
checkForYearPage();

// Test component deployment only
deployYearlyViewComponent();
```

### Debug Information

The extension logs detailed information to browser console:

- Component deployment status
- UID harvesting results
- Page detection events
- Navigation attempts
- Error details

### Extension Lifecycle

1. **onload**: Sets up detection system and auto-deploys
2. **Auto-execution**: Runs deployment after dependencies load
3. **Page monitoring**: Checks every 2 seconds for year pages
4. **onunload**: Cleans up intervals and global functions

## 📞 Support

### Common Issues

- **Dependency missing**: Install RoamExtensionSuite first
- **Events not loading**: Check month page format and tags
- **Navigation failing**: Verify page existence and console errors
- **Component not updating**: Try manual deployment command

### Getting Help

1. Check browser console (`F12`) for error messages
2. Verify all prerequisites are met
3. Test with simple event format first
4. Try manual deployment commands

## 🎉 Success Criteria

Your yearly calendar is working correctly when:

✅ **Component deployed** to `[[roam/render]]` hierarchy  
✅ **Year page detection** active (console shows monitoring)  
✅ **Calendar appears** on year pages like `[[2025]]`  
✅ **Events load** from month pages with tagged entries  
✅ **Navigation works** between years, months, and events  
✅ **Filtering system** toggles categories on/off  
✅ **Auto-prompting** works when visiting new year pages

---

## 📝 License

MIT License - feel free to modify and distribute.

## 🙏 Credits

Part of the **Calendar Suite** for Roam Research. Built with the RoamExtensionSuite framework.

---

_Happy planning! 📅✨_
