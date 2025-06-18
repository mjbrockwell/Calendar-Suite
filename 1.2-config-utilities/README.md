# Unified Config Utils Extension

**Standalone configuration management for Calendar Suite extensions**

## Overview

The Unified Config Utils Extension is a lightweight, standalone micro-extension that provides centralized configuration management for the entire Calendar Suite. It uses proven cascading block logic to ensure bulletproof reliability and serves as the foundation for all calendar-related extensions.

## Key Features

- ✅ **Single Source of Truth** - One config page for all calendar extensions
- ✅ **Flexible Format Support** - Reads multiple heading formats (`**Section config:**`, `"Section config:"`, `Section config::`)
- ✅ **Safe Writing** - Always writes safe formats to avoid Roam property side effects
- ✅ **Cascading Block Logic** - Proven retry pattern for reliable hierarchy creation
- ✅ **Zero Dependencies** - Works independently, loads first
- ✅ **Bulletproof Error Handling** - Timeouts, retries, detailed logging

## Installation

### Option 1: Manual Installation

1. Copy the extension code to a `.js` file
2. Install via Roam Research Extensions page
3. Enable the extension

### Option 2: Autoloader (Recommended)

This extension is designed to load **first** in the Calendar Suite autoloader sequence:

```
1. Unified Config Utils (this extension)
2. Calendar Utilities
3. Calendar Foundation
4. Calendar Views
```

## Configuration Page

The extension creates and manages: **`[[roam/ext/calendar suite/config]]`**

### Default Structure

```
🗓️ Calendar Suite Configuration
├── **Weekly config:**
│   ├── week-start-day:: Monday
│   ├── format:: MM/DD/YYYY - MM/DD/YYYY
│   └── auto-create-weeks:: true
├── **Monthly config:**
│   ├── format:: MMMM YYYY
│   ├── show-week-numbers:: true
│   └── auto-create-months:: true
└── **Yearly config:**
    ├── default-tags:: yv0,yv1,yv2,yv3,yv4,yv5,yv6
    ├── yv0:: General Events,3a5199,e6efff,🔵
    ├── yv1:: Family Birthdays,c41d69,ffe6f0,🎂
    └── ... (additional tag configurations)
```

## API Reference

### Global Access

```javascript
// Available globally after extension loads
window.UnifiedConfigUtils;
```

### Core Methods

#### Reading Configuration

```javascript
// Generic config reading
const value = UnifiedConfigUtils.readConfigValue(section, key, defaultValue);

// Examples
const weekStart = UnifiedConfigUtils.readConfigValue(
  "Weekly",
  "week-start-day",
  "Monday"
);
const monthFormat = UnifiedConfigUtils.readConfigValue(
  "Monthly",
  "format",
  "MMMM YYYY"
);
```

#### Writing Configuration

```javascript
// Generic config writing
await UnifiedConfigUtils.writeConfigValue(section, key, value);

// Examples
await UnifiedConfigUtils.writeConfigValue("Weekly", "week-start-day", "Sunday");
await UnifiedConfigUtils.writeConfigValue(
  "Monthly",
  "show-week-numbers",
  "false"
);
```

#### Convenience Methods

```javascript
// Common operations
const weekStart = UnifiedConfigUtils.getWeekStartDay();
await UnifiedConfigUtils.setWeekStartDay("Sunday");

const yearlyTags = UnifiedConfigUtils.getYearlyTags();
const tagConfig = UnifiedConfigUtils.getYearlyTagConfig("yv0");
```

#### System Methods

```javascript
// Initialize master config page
await UnifiedConfigUtils.initializeMasterConfig();

// Get system status
const status = UnifiedConfigUtils.getConfigStatus();

// Test cascading logic
const success = await UnifiedConfigUtils.testCascadingLogic();
```

### Yearly Tag Configuration Format

```javascript
// Tag config format: "name,textColor,bgColor,emoji"
yv0:: General Events,3a5199,e6efff,🔵
yv1:: Family Birthdays,c41d69,ffe6f0,🎂

// Retrieved as object:
const tagConfig = UnifiedConfigUtils.getYearlyTagConfig("yv0")
// Returns: { id: "yv0", name: "General Events", textColor: "3a5199", bgColor: "e6efff", emoji: "🔵" }
```

## Command Palette Integration

The extension adds several commands accessible via `Cmd+P`:

- **"Config: Initialize Master Config"** - Creates/initializes the config page
- **"Config: Test Cascading Logic"** - Runs system tests
- **"Config: Show Status"** - Displays configuration status
- **"Config: Open Config Page"** - Navigates to config page

## Integration with Other Extensions

### For Extension Developers

```javascript
// Check if config utils are available
if (window.UnifiedConfigUtils) {
  const weekStart = window.UnifiedConfigUtils.getWeekStartDay();
  // Use in your extension logic
}

// Register with Calendar Foundation (optional)
if (window.CalendarSuite) {
  window.CalendarSuite.registerUtility(
    "UnifiedConfigUtils",
    UnifiedConfigUtils
  );
}
```

### Configuration Sections

Extensions should use these standard sections:

- **Weekly config:** - Week-related settings (start day, format, etc.)
- **Monthly config:** - Month-related settings (format, display options, etc.)
- **Yearly config:** - Year-related settings (tags, colors, etc.)
- **Custom config:** - Extension-specific settings

## Format Compatibility

The extension reads multiple heading formats for backward compatibility:

### Supported Formats (Reading)

- `**Weekly config:**` ✅ (Bold - Preferred)
- `"Weekly config:"` ✅ (Quoted - Acceptable)
- `Weekly config::` ✅ (Property - Legacy support)
- `**Weekly:**` ✅ (Short bold)
- `Weekly:` ✅ (Plain)

### Writing Format (Always Safe)

- Always writes: `**Section config:**` format
- Avoids `::` properties to prevent Roam side effects

## Error Handling

### Timeout Protection

- Operations timeout after 5 seconds
- Automatic retry with exponential backoff
- Detailed error logging

### Graceful Degradation

```javascript
// Safe pattern for extension integration
const weekStart = window.UnifiedConfigUtils?.getWeekStartDay() || "Monday";
```

## Troubleshooting

### Common Issues

**1. Config page not found**

```bash
Solution: Run "Config: Initialize Master Config" command
```

**2. Permission errors**

```bash
Cause: Roam API restrictions
Solution: Ensure extension has proper permissions
```

**3. Cascading logic timeout**

```bash
Cause: Network latency or Roam performance
Solution: Extension automatically retries with backoff
```

### Debug Information

```javascript
// Get detailed status
const status = window.UnifiedConfigUtils.getConfigStatus();
console.log(status);

// Test core functionality
const testResult = await window.UnifiedConfigUtils.testCascadingLogic();
console.log("Test result:", testResult);
```

## Technical Details

### Cascading Block Logic

The extension uses a proven retry pattern for reliable block creation:

1. **Check if target exists** → Continue if found
2. **Create missing block** → Restart verification loop
3. **Verify creation** → Proceed to next level
4. **Timeout protection** → Fail gracefully after 5 seconds

### Memory Footprint

- **Minimal global footprint** - Single `window.UnifiedConfigUtils` object
- **No persistent state** - Reads from Roam database on demand
- **Efficient caching** - Only queries when necessary

## Version History

### v1.0.0

- Initial release
- Cascading block logic implementation
- Multi-format reading support
- Safe writing with format standardization
- Command palette integration
- Comprehensive error handling

## License

Part of the Calendar Suite extension collection.

## Support

For issues, feature requests, or integration questions:

1. Check the troubleshooting section above
2. Use the built-in test commands to verify functionality
3. Review console logs for detailed error information

---

**Note**: This extension is designed to load **first** in the Calendar Suite sequence to provide configuration services to all other calendar extensions.
