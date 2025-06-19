// ===================================================================
// 🗓️ CALENDAR SUITE AUTOLOADER - Single-File Extension Loader
// ===================================================================
// Version: 2.0 MVP
// Purpose: Load entire calendar suite from one GitHub Raw URL
// Architecture: Static configuration + Blob URL loading method

// ===================================================================
// 📋 CONFIGURATION - Static hardcoded extension list (dependency order)
// ===================================================================
const AUTOLOADER_CONFIG = {
  // Adaptive loading strategy
  loadingStrategy: {
    initialDelay: 250, // Start optimistic - fast loading
    dependencyRetryDelay: 600, // Longer delay for dependency retries
    maxRetries: 2, // How many times to retry failed extensions
    backoffMultiplier: 2.0, // Exponential backoff for retries
  },

  // Extensions in dependency order (numerical sequence)
  extensions: [
    {
      id: "calendar-foundation",
      name: "Calendar Foundation",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1-calendar-foundation/extension.js",
      critical: true,
      tier: 1, // Foundation tier - must load first
      loadDelay: 300, // Slightly longer for foundation
    },
    {
      id: "config-utilities",
      name: "Config Utilities",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1.2-config-utilities/extension.js",
      critical: true,
      tier: 2, // Configuration tier
      loadDelay: 250,
      dependsOn: ["calendar-foundation"],
    },
    {
      id: "calendar-utilities",
      name: "Calendar Utilities",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1.5-calendar-utilities/extension.js",
      critical: true,
      tier: 2, // Core utilities tier
      loadDelay: 250,
      dependsOn: ["calendar-foundation", "config-utilities"],
    },
    {
      id: "monthly-view",
      name: "Monthly View",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/2.0-monthly-view/extension.js",
      critical: false,
      tier: 3, // View tier
      loadDelay: 200,
      dependsOn: ["calendar-utilities"],
    },
    {
      id: "weekly-view",
      name: "Weekly View",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/3.0-weekly-view/extension.js",
      critical: false,
      tier: 3, // View tier
      loadDelay: 200,
      dependsOn: ["calendar-utilities"],
    },
    {
      id: "weekly-view-bandaid",
      name: "Weekly View Bandaid",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/3.5-weekly-view-bandaid/extension.js",
      critical: false,
      tier: 4, // Enhancement tier
      loadDelay: 200,
      dependsOn: ["weekly-view"],
    },
    {
      id: "yearly-view",
      name: "Yearly View",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/4.0-yearly-view/extension.js",
      critical: false,
      tier: 3, // View tier
      loadDelay: 200,
      dependsOn: ["calendar-utilities"],
    },
    {
      id: "modal-edit-window",
      name: "Modal Edit Window",
      file: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/5.0-modal-edit-window/extension.js",
      critical: false,
      tier: 4, // Feature tier
      loadDelay: 200,
      dependsOn: ["calendar-utilities"],
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
  console.log(`🔧 Creating mock API for ${config.name}...`);

  const mockAPI = {
    settings: {
      get: (key) => {
        const value = localStorage.getItem(`cal-${config.id}-${key}`);
        console.log(`📖 Settings get: ${key} = ${value}`);
        return value;
      },
      set: (key, value) => {
        console.log(`📝 Settings set: ${key} = ${value}`);
        localStorage.setItem(`cal-${config.id}-${key}`, value);
      },
      panel: {
        create: (panelConfig) => {
          console.log(
            `⚙️ Settings panel created for ${config.name}:`,
            panelConfig
          );
          return {
            id: generateUID(),
            config: panelConfig,
          };
        },
      },
    },
    commandPalette: {
      addCommand: (command) => {
        console.log(
          `🎯 Command added to palette for ${config.name}: ${
            command.label || command.name || command.id
          }`
        );
        // Track command for cleanup
        if (window._calendarRegistry) {
          window._calendarRegistry.commands.push(command);
        }
        return command;
      },
      removeCommand: (commandId) => {
        console.log(`🗑️ Command removed from palette: ${commandId}`);
      },
    },
    ui: {
      createButton: (buttonConfig) => {
        console.log(
          `🔘 UI button created: ${buttonConfig.label || buttonConfig.text}`
        );
        return { id: generateUID(), ...buttonConfig };
      },
      showNotification: (message, type = "info") => {
        console.log(`📢 Notification (${type}): ${message}`);
      },
    },
    platform: window.CalendarSuite,
    registry: window._calendarRegistry,
  };

  console.log(
    `✅ Mock API created for ${config.name} with keys:`,
    Object.keys(mockAPI)
  );
  console.log(
    `🎯 CommandPalette methods:`,
    Object.keys(mockAPI.commandPalette)
  );

  return mockAPI;
}

/**
 * Check if dependencies are loaded for an extension
 */
function checkDependencies(config) {
  if (!config.dependsOn || config.dependsOn.length === 0) {
    return { satisfied: true, missing: [] };
  }

  // Ensure CalendarSuite is available and has the required methods
  if (
    !window.CalendarSuite ||
    typeof window.CalendarSuite.isExtensionLoaded !== "function"
  ) {
    console.warn(`⚠️ CalendarSuite not ready for dependency checking`);
    return { satisfied: false, missing: config.dependsOn };
  }

  const missing = config.dependsOn.filter(
    (depId) => !window.CalendarSuite.isExtensionLoaded(depId)
  );

  return {
    satisfied: missing.length === 0,
    missing,
  };
}

/**
 * Determine if an error is likely dependency-related
 */
function isDependencyError(error) {
  const dependencyKeywords = [
    "is not defined",
    "Cannot read property",
    "Cannot read properties",
    "undefined is not a function",
    "not a function",
    "CalendarSuite",
    "registry",
    "foundation",
  ];

  return dependencyKeywords.some((keyword) =>
    error.message.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Load a single remote extension using blob URL method with dependency checking
 */
async function loadRemoteExtension(config, attempt = 1) {
  const url = config.file;

  console.log(`📍 Loading: ${config.name} (attempt ${attempt})`);
  console.log(`🔗 URL: ${url}`);

  // Check dependencies first (skip if no dependencies)
  if (config.dependsOn && config.dependsOn.length > 0) {
    const depCheck = checkDependencies(config);
    if (!depCheck.satisfied) {
      throw new Error(`Missing dependencies: ${depCheck.missing.join(", ")}`);
    }
  } else {
    console.log(`📦 ${config.name} has no dependencies - proceeding with load`);
  }

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
        console.log(`🔧 Creating extension API for ${config.name}...`);
        const extensionAPI = createMockAPI(config);

        console.log(`🔧 Executing onload for ${config.name}...`);

        // Debug: Verify API structure before calling extension
        console.log(`🔍 Final API verification for ${config.name}:`);
        console.log(`  - extensionAPI exists:`, !!extensionAPI);
        console.log(
          `  - commandPalette exists:`,
          !!extensionAPI.commandPalette
        );
        console.log(
          `  - addCommand exists:`,
          !!extensionAPI.commandPalette?.addCommand
        );
        console.log(
          `  - addCommand type:`,
          typeof extensionAPI.commandPalette?.addCommand
        );

        try {
          // Test the commandPalette before passing to extension
          if (
            extensionAPI.commandPalette &&
            extensionAPI.commandPalette.addCommand
          ) {
            console.log(`✅ Command palette API verified for ${config.name}`);
          } else {
            console.error(`❌ Command palette API missing for ${config.name}`);
          }

          await module.default.onload({ extensionAPI });
          console.log(`✅ ${config.name} onload completed successfully`);
        } catch (onloadError) {
          console.error(`❌ ${config.name} onload failed:`, onloadError);
          console.error(`🔍 Error details:`, {
            message: onloadError.message,
            stack: onloadError.stack?.split("\n").slice(0, 3).join("\n"),
          });
          throw new Error(`Extension onload failed: ${onloadError.message}`);
        }

        // Register with platform
        window.CalendarSuite.registerExtension(config.id, {
          name: config.name,
          module: module.default,
          config,
          loadedAt: new Date(),
          attempt,
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

        return { success: true, module, attempt };
      } else {
        throw new Error("Extension does not export valid onload function");
      }
    } finally {
      // Always cleanup blob URL to prevent memory leaks
      URL.revokeObjectURL(blobUrl);
    }
  } catch (error) {
    // Enhance error with context
    error.isDependencyError = isDependencyError(error);
    error.attempt = attempt;
    throw error;
  }
}

/**
 * Smart sequential loader with adaptive retry strategy
 */
async function loadCalendarSuite() {
  console.log("🗓️ Loading Calendar Suite with adaptive strategy...");
  console.log(`📊 Extensions to load: ${AUTOLOADER_CONFIG.extensions.length}`);

  const results = {
    successful: [],
    failed: [],
    retried: [],
    startTime: Date.now(),
  };

  const strategy = AUTOLOADER_CONFIG.loadingStrategy;
  const failedExtensions = []; // Track failures for retry

  // Phase 1: Initial loading pass (optimistic/fast)
  console.log("🚀 Phase 1: Fast loading pass...");

  for (const config of AUTOLOADER_CONFIG.extensions) {
    try {
      console.log(`🔄 Loading ${config.name}...`);

      const result = await loadRemoteExtension(config, 1);
      results.successful.push({ config, result });

      console.log(`✅ ${config.name} loaded successfully`);

      // Use configured delay
      const loadDelay = config.loadDelay || strategy.initialDelay;
      if (loadDelay > 0) {
        await delay(loadDelay);
      }
    } catch (error) {
      console.warn(
        `⚠️ ${config.name} failed on first attempt: ${error.message}`
      );

      failedExtensions.push({
        config,
        error,
        attempts: 1,
        nextDelay: error.isDependencyError
          ? strategy.dependencyRetryDelay
          : strategy.initialDelay * strategy.backoffMultiplier,
      });

      // Don't fail completely - continue to next extension
      if (config.critical) {
        console.warn(`🚨 Critical extension failed: ${config.name}`);
      }
    }
  }

  // Phase 2: Retry failed extensions with adaptive delays
  if (failedExtensions.length > 0) {
    console.log(
      `🔄 Phase 2: Retrying ${failedExtensions.length} failed extensions...`
    );

    let retryRound = 1;

    while (failedExtensions.length > 0 && retryRound <= strategy.maxRetries) {
      console.log(`🔄 Retry round ${retryRound}/${strategy.maxRetries}...`);

      const currentBatch = [...failedExtensions];
      failedExtensions.length = 0; // Clear for this round

      for (const failure of currentBatch) {
        const { config, attempts, nextDelay } = failure;
        const attempt = attempts + 1;

        try {
          console.log(
            `🔄 Retrying ${config.name} (attempt ${attempt}) with ${nextDelay}ms delay...`
          );

          // Wait before retry
          await delay(nextDelay);

          const result = await loadRemoteExtension(config, attempt);
          results.successful.push({ config, result });
          results.retried.push({ config, attempt, success: true });

          console.log(`✅ ${config.name} loaded successfully on retry!`);
        } catch (error) {
          console.warn(
            `⚠️ ${config.name} failed on attempt ${attempt}: ${error.message}`
          );

          // Decide whether to retry again
          if (attempt < strategy.maxRetries + 1) {
            // Queue for next retry round with exponential backoff
            failedExtensions.push({
              config,
              error,
              attempts: attempt,
              nextDelay: Math.min(nextDelay * strategy.backoffMultiplier, 2000), // Cap at 2 seconds
            });
          } else {
            // Final failure
            results.failed.push({ config, error, attempts: attempt });
            results.retried.push({ config, attempt, success: false });
          }
        }
      }

      retryRound++;
    }

    // Any remaining failures are final
    failedExtensions.forEach((failure) => {
      results.failed.push({
        config: failure.config,
        error: failure.error,
        attempts: failure.attempts,
      });
    });
  }

  // Calculate timing
  const totalTime = Date.now() - results.startTime;

  // Phase 3: Final status report
  console.groupCollapsed(`🎯 Calendar Suite Loading Complete (${totalTime}ms)`);

  const successCount = results.successful.length;
  const failedCount = results.failed.length;
  const totalCount = AUTOLOADER_CONFIG.extensions.length;
  const retriedCount = results.retried.length;

  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${failedCount}/${totalCount}`);
  if (retriedCount > 0) {
    console.log(`🔄 Retries attempted: ${retriedCount}`);
  }

  // Success details
  if (results.successful.length > 0) {
    console.groupCollapsed(`✅ Successfully loaded extensions:`);
    results.successful.forEach(({ config, result }) => {
      const timing = result.attempt > 1 ? ` (attempt ${result.attempt})` : "";
      console.log(`  ✓ ${config.name}${timing}`);
    });
    console.groupEnd();
  }

  // Failure details
  if (results.failed.length > 0) {
    console.groupCollapsed(`❌ Failed extensions:`);
    results.failed.forEach(({ config, error, attempts }) => {
      console.log(
        `  ✗ ${config.name}: ${error.message} (${attempts} attempts)`
      );
    });
    console.groupEnd();
  }

  // Dependency analysis
  if (results.failed.length > 0) {
    console.groupCollapsed(`🔍 Dependency Analysis:`);

    const dependencyFailures = results.failed.filter(
      (f) =>
        f.error.isDependencyError || f.error.message.includes("dependencies")
    );

    if (dependencyFailures.length > 0) {
      console.log(
        `⚠️ ${dependencyFailures.length} failure(s) appear dependency-related`
      );
      dependencyFailures.forEach((f) => {
        console.log(`  - ${f.config.name}: ${f.error.message}`);
      });
    }

    console.groupEnd();
  }

  console.log(`🌐 Platform status:`, window.CalendarSuite?.getStatus());
  console.groupEnd();

  // Overall success assessment
  const criticalExtensions = AUTOLOADER_CONFIG.extensions.filter(
    (e) => e.critical
  );
  const criticalFailures = results.failed.filter((f) => f.config.critical);

  if (successCount === totalCount) {
    console.log(
      `🎉 Calendar Suite fully loaded! All ${totalCount} extensions successful in ${totalTime}ms.`
    );
  } else if (criticalFailures.length === 0) {
    console.log(
      `✅ Calendar Suite core loaded! ${successCount}/${totalCount} extensions successful (all critical extensions loaded).`
    );
  } else {
    console.error(
      `⚠️ Calendar Suite partially loaded: ${criticalFailures.length} critical extension(s) failed.`
    );
  }

  return results;
}

// ===================================================================
// 🧹 CLEANUP SYSTEM
// ===================================================================

/**
 * Unload all extensions and clean up resources
 */
function unloadAllExtensions() {
  console.log("🧹 Starting cleanup process...");

  const registry = window._calendarRegistry;
  if (!registry) {
    console.log("🧹 No registry found - nothing to clean up");
    return;
  }

  // Unload all extensions
  if (registry.extensions && registry.extensions.size > 0) {
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
  } else {
    console.log(`📦 Unloading 0 extensions...`);
  }

  // Clean up DOM elements
  if (registry.elements && Array.isArray(registry.elements)) {
    registry.elements.forEach((element) => {
      try {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (error) {
        console.warn("⚠️ Error removing DOM element:", error);
      }
    });
  }

  // Clean up observers
  if (registry.observers && Array.isArray(registry.observers)) {
    registry.observers.forEach((observer) => {
      try {
        if (observer && typeof observer.disconnect === "function") {
          observer.disconnect();
        }
      } catch (error) {
        console.warn("⚠️ Error disconnecting observer:", error);
      }
    });
  }

  // Clean up timeouts and intervals
  if (registry.timeouts && Array.isArray(registry.timeouts)) {
    registry.timeouts.forEach((id) => clearTimeout(id));
  }
  if (registry.intervals && Array.isArray(registry.intervals)) {
    registry.intervals.forEach((id) => clearInterval(id));
  }

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

  // Clear platform safely
  if (window.CalendarSuite) {
    try {
      if (
        window.CalendarSuite.loadedExtensions &&
        typeof window.CalendarSuite.loadedExtensions.clear === "function"
      ) {
        window.CalendarSuite.loadedExtensions.clear();
      }
      if (
        window.CalendarSuite.utilities &&
        typeof window.CalendarSuite.utilities.clear === "function"
      ) {
        window.CalendarSuite.utilities.clear();
      }
    } catch (error) {
      console.warn("⚠️ Error clearing CalendarSuite:", error);
    }
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

      // Small delay to ensure everything is properly initialized
      console.log("⏳ Allowing platform initialization to complete...");
      await delay(100);

      // Verify platform is ready
      if (
        !window.CalendarSuite ||
        typeof window.CalendarSuite.isExtensionLoaded !== "function"
      ) {
        throw new Error("CalendarSuite platform failed to initialize properly");
      }

      console.log("✅ Platform verification complete");

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
