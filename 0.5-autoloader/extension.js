// ===================================================================
// 🗓️ CALENDAR SUITE AUTOLOADER - Single-File Extension Loader
// ===================================================================
// Version: 2.0 MVP
// Purpose: Load entire calendar suite from one GitHub Raw URL
// Architecture: Static configuration + Blob URL loading method

// ===================================================================
// 📋 CONFIGURATION - Static hardcoded extension list
// ===================================================================
const AUTOLOADER_CONFIG = {
  repository: {
    username: "yourusername",
    repository: "calendar-suite",
    branch: "main",
  },
  extensions: [
    {
      id: "calendar-foundation",
      name: "Calendar Foundation",
      file: "genericURLone", // User will replace with actual path
      critical: true,
      loadDelay: 1000,
    },
    {
      id: "calendar-utilities",
      name: "Calendar Utilities",
      file: "genericURLtwo", // User will replace with actual path
      critical: true,
      loadDelay: 800,
    },
    {
      id: "monthly-view",
      name: "Monthly View",
      file: "genericURLthree", // User will replace with actual path
      critical: false,
      loadDelay: 800,
    },
    {
      id: "weekly-view",
      name: "Weekly View",
      file: "genericURLfour", // User will replace with actual path
      critical: false,
      loadDelay: 800,
    },
    {
      id: "calendar-addon-one",
      name: "Calendar Addon One",
      file: "genericURLfive", // User will replace with actual path
      critical: false,
      loadDelay: 800,
    },
    {
      id: "calendar-addon-two",
      name: "Calendar Addon Two",
      file: "genericURLsix", // User will replace with actual path
      critical: false,
      loadDelay: 800,
    },
  ],
};

// ===================================================================
// 🛠️ CORE UTILITIES
// ===================================================================

/**
 * Create delay for sequential loading
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate unique IDs for tracking
 */
function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Add style element to page with cleanup tracking
 */
function addStyle(css, id = generateUID()) {
  const styleElement = document.createElement("style");
  styleElement.id = `calendar-autoloader-${id}`;
  styleElement.textContent = css;
  document.head.appendChild(styleElement);

  // Track for cleanup
  if (window._calendarRegistry) {
    window._calendarRegistry.elements.push(styleElement);
  }

  return styleElement;
}

// ===================================================================
// 🌐 CALENDAR PLATFORM CREATION
// ===================================================================

/**
 * Create the shared calendar platform for extension coordination
 */
function createCalendarPlatform() {
  const platform = {
    version: "2.0.0",
    loadedExtensions: new Map(),
    utilities: new Map(),

    // Register a utility function for shared use
    registerUtility: (name, fn) => {
      platform.utilities.set(name, fn);
      console.log(`🔧 Utility registered: ${name}`);
    },

    // Get a registered utility
    getUtility: (name) => {
      return platform.utilities.get(name);
    },

    // Register an extension as loaded
    registerExtension: (id, extensionData) => {
      platform.loadedExtensions.set(id, {
        id,
        loadedAt: new Date(),
        ...extensionData,
      });
      console.log(`📦 Extension registered: ${id}`);
    },

    // Check if extension is loaded
    isExtensionLoaded: (id) => {
      return platform.loadedExtensions.has(id);
    },

    // Get extension data
    getExtension: (id) => {
      return platform.loadedExtensions.get(id);
    },

    // Get platform status
    getStatus: () => {
      return {
        version: platform.version,
        extensionsLoaded: platform.loadedExtensions.size,
        utilitiesAvailable: platform.utilities.size,
        extensions: Array.from(platform.loadedExtensions.keys()),
      };
    },
  };

  return platform;
}

// ===================================================================
// 🚀 CORE LOADING FUNCTIONS
// ===================================================================

/**
 * Create mock extension API for loaded extensions
 */
function createMockAPI(config) {
  return {
    settings: {
      get: (key) => localStorage.getItem(`cal-${config.id}-${key}`),
      set: (key, value) =>
        localStorage.setItem(`cal-${config.id}-${key}`, value),
      panel: {
        create: (panelConfig) => {
          console.log(
            `⚙️ Settings panel created for ${config.name}:`,
            panelConfig
          );
        },
      },
    },
    platform: window.CalendarSuite,
    registry: window._calendarRegistry,
  };
}

/**
 * Load a single remote extension using blob URL method
 * This bypasses GitHub Raw MIME type restrictions
 */
async function loadRemoteExtension(config) {
  const url = config.file.startsWith("http")
    ? config.file // Direct URL provided
    : `https://raw.githubusercontent.com/${AUTOLOADER_CONFIG.repository.username}/${AUTOLOADER_CONFIG.repository.repository}/${AUTOLOADER_CONFIG.repository.branch}/${config.file}`;

  console.log(`📍 Loading: ${config.name}`);
  console.log(`📂 File: ${config.file}`);
  console.log(`🔗 URL: ${url}`);

  try {
    // Fetch as text to bypass MIME restrictions
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const code = await response.text();

    if (!code.trim()) {
      throw new Error("Empty file content");
    }

    // Create blob with correct MIME type
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    try {
      // Import as ES6 module
      const module = await import(blobUrl);
      console.log(`📦 Module exports: ${Object.keys(module)}`);

      // Execute extension if properly formatted
      if (module.default?.onload) {
        const extensionAPI = createMockAPI(config);
        await module.default.onload({ extensionAPI });

        // Register with platform
        window.CalendarSuite.registerExtension(config.id, {
          name: config.name,
          module: module.default,
          config,
        });

        // Store for cleanup
        if (module.default?.onunload) {
          window._calendarRegistry = window._calendarRegistry || {
            elements: [],
            observers: [],
            domListeners: [],
            commands: [],
            timeouts: [],
            intervals: [],
            utilities: {},
            extensions: new Map(),
          };

          window._calendarRegistry.extensions.set(config.id, {
            id: config.id,
            name: config.name,
            onunload: module.default.onunload,
            loadedAt: new Date(),
          });
        }

        return { success: true, module };
      } else {
        throw new Error("Extension does not export valid onload function");
      }
    } finally {
      // Always cleanup blob URL to prevent memory leaks
      URL.revokeObjectURL(blobUrl);
    }
  } catch (error) {
    console.error(`❌ Failed to load ${config.name}:`, error.message);
    throw error;
  }
}

/**
 * Sequential loader - loads extensions in dependency order
 */
async function loadCalendarSuite() {
  console.log("🗓️ Loading Calendar Suite...");
  console.log(`📊 Extensions to load: ${AUTOLOADER_CONFIG.extensions.length}`);

  const results = { successful: [], failed: [] };

  for (const config of AUTOLOADER_CONFIG.extensions) {
    try {
      console.log(`🔄 Loading ${config.name}...`);

      const result = await loadRemoteExtension(config);
      results.successful.push(config);

      console.log(`✅ ${config.name} loaded successfully`);

      // Wait before loading next extension (prevents race conditions)
      if (config.loadDelay > 0) {
        console.log(
          `⏳ Waiting ${config.loadDelay}ms before next extension...`
        );
        await delay(config.loadDelay);
      }
    } catch (error) {
      console.error(`❌ Failed to load ${config.name}:`, error.message);
      results.failed.push({ config, error: error.message });

      // Continue loading other extensions
      if (config.critical) {
        console.warn(
          `⚠️ CRITICAL extension failed: ${config.name} - suite may not work properly`
        );
      } else {
        console.log(
          `ℹ️ Non-critical extension failed: ${config.name} - continuing...`
        );
      }
    }
  }

  // Report final status
  console.groupCollapsed(`🎯 Calendar Suite Loading Complete`);
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.successful.length > 0) {
    console.log(`Successfully loaded:`);
    results.successful.forEach((config) => {
      console.log(`  ✓ ${config.name}`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`Failed to load:`);
    results.failed.forEach((failure) => {
      console.log(`  ✗ ${failure.config.name}: ${failure.error}`);
    });
  }

  console.log(`🌐 Platform status:`, window.CalendarSuite?.getStatus());
  console.groupEnd();

  return results;
}

// ===================================================================
// 🧹 CLEANUP SYSTEM
// ===================================================================

/**
 * Unload all extensions and clean up resources
 */
function unloadAllExtensions() {
  const registry = window._calendarRegistry;
  if (!registry) {
    console.log("🧹 No registry found - nothing to clean up");
    return;
  }

  console.log("🧹 Starting cleanup process...");

  // Unload all extensions
  const loadedExtensions = Array.from(registry.extensions.values());
  console.log(`📦 Unloading ${loadedExtensions.length} extensions...`);

  loadedExtensions.forEach((ext) => {
    try {
      if (ext.onunload && typeof ext.onunload === "function") {
        ext.onunload();
        console.log(`✅ ${ext.name || ext.id} unloaded`);
      }
    } catch (error) {
      console.warn(`⚠️ Error unloading ${ext.name || ext.id}:`, error);
    }
  });

  // Clean up DOM elements
  registry.elements.forEach((element) => {
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } catch (error) {
      console.warn("⚠️ Error removing DOM element:", error);
    }
  });

  // Clean up observers
  registry.observers.forEach((observer) => {
    try {
      observer.disconnect();
    } catch (error) {
      console.warn("⚠️ Error disconnecting observer:", error);
    }
  });

  // Clean up timeouts and intervals
  registry.timeouts.forEach((id) => clearTimeout(id));
  registry.intervals.forEach((id) => clearInterval(id));

  // Clear registry
  window._calendarRegistry = {
    elements: [],
    observers: [],
    domListeners: [],
    commands: [],
    timeouts: [],
    intervals: [],
    utilities: {},
    extensions: new Map(),
  };

  // Clear platform
  if (window.CalendarSuite) {
    window.CalendarSuite.loadedExtensions.clear();
    window.CalendarSuite.utilities.clear();
  }

  console.log("✅ All extensions unloaded and resources cleaned up");
}

// ===================================================================
// 🎨 AUTOLOADER STYLES
// ===================================================================

const autoloaderStyles = `
/* Calendar Suite Autoloader Styles */
.calendar-suite-autoloader {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.calendar-loading-indicator {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #667eea;
  margin: 4px 0;
}

.calendar-loading-indicator::before {
  content: "🗓️";
  margin-right: 6px;
}

.calendar-error-indicator {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(234, 88, 12, 0.1);
  border: 1px solid rgba(234, 88, 12, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #ea580c;
  margin: 4px 0;
}

.calendar-error-indicator::before {
  content: "❌";
  margin-right: 6px;
}
`;

// ===================================================================
// 🚀 ROAM EXTENSION EXPORT
// ===================================================================

export default {
  onload: async ({ extensionAPI }) => {
    console.log("🚀 Calendar Suite Autoloader starting...");

    try {
      // Initialize global registry
      window._calendarRegistry = {
        elements: [],
        observers: [],
        domListeners: [],
        commands: [],
        timeouts: [],
        intervals: [],
        utilities: {},
        extensions: new Map(),
      };

      // Create calendar platform
      window.CalendarSuite = createCalendarPlatform();

      // Add autoloader styles
      addStyle(autoloaderStyles, "autoloader-styles");

      // Register core utilities
      window.CalendarSuite.registerUtility("addStyle", addStyle);
      window.CalendarSuite.registerUtility("generateUID", generateUID);
      window.CalendarSuite.registerUtility("delay", delay);

      console.log("🌐 Calendar platform initialized");

      // Start loading extensions
      const results = await loadCalendarSuite();

      // Final status report
      const successCount = results.successful.length;
      const failedCount = results.failed.length;
      const totalCount = AUTOLOADER_CONFIG.extensions.length;

      if (successCount === totalCount) {
        console.log(
          `🎉 Calendar Suite fully loaded! All ${totalCount} extensions successful.`
        );
      } else if (successCount > 0) {
        console.log(
          `⚠️ Calendar Suite partially loaded: ${successCount}/${totalCount} extensions successful.`
        );
      } else {
        console.error(
          `💥 Calendar Suite failed to load: 0/${totalCount} extensions successful.`
        );
      }

      // Store results for potential debugging
      window._calendarLoadResults = results;
    } catch (error) {
      console.error("🚨 Calendar Suite Autoloader failed completely:", error);

      // Attempt basic cleanup
      try {
        unloadAllExtensions();
      } catch (cleanupError) {
        console.error("🚨 Cleanup also failed:", cleanupError);
      }
    }
  },

  onunload: () => {
    console.log("🧹 Calendar Suite Autoloader unloading...");

    try {
      unloadAllExtensions();

      // Final cleanup
      delete window.CalendarSuite;
      delete window._calendarRegistry;
      delete window._calendarLoadResults;

      console.log("✅ Calendar Suite Autoloader unloaded successfully");
    } catch (error) {
      console.error("❌ Error during autoloader unload:", error);
    }
  },
};
