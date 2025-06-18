// ===================================================================
// Calendar Foundation - Professional Architecture & Coordination
// Manages lifecycle, dependencies, and communication for calendar suite
// TRIMMED VERSION - Config management now handled by UnifiedConfigUtils
// ===================================================================

// ===================================================================
// 🔧 CORE UTILITIES - Professional Infrastructure
// ===================================================================

// Professional addStyle utility - Simple but bulletproof
const addStyle = (content, id) => {
  if (id && document.getElementById(id)) {
    return document.getElementById(id);
  }

  const style = document.createElement("style");
  style.textContent = content;
  if (id) style.id = id;

  document.head.appendChild(style);

  // 📡 REGISTER FOR AUTOMATIC CLEANUP
  if (window._calendarRegistry) {
    window._calendarRegistry.elements.push(style);
  }

  return style;
};

// Generate unique ID
const generateUID = () => {
  return (
    window.roamAlphaAPI?.util?.generateUID?.() ||
    "cal-" + Math.random().toString(36).substr(2, 9)
  );
};

// ===================================================================
// 🗓️ CALENDAR DEPENDENCY SYSTEM - Revolutionary Cross-Extension Coordination
// ===================================================================

const createDependencyManager = () => {
  const dependencies = new Map(); // dependent -> [dependencies...]
  const dependents = new Map(); // dependency -> [dependents...]
  const resolutionCallbacks = new Map(); // dependency -> [callbacks...]

  return {
    // 📋 REGISTER DEPENDENCIES
    registerDependency: (dependent, dependency, metadata = {}) => {
      // Track dependency relationship
      const deps = dependencies.get(dependent) || [];
      if (!deps.includes(dependency)) {
        deps.push(dependency);
        dependencies.set(dependent, deps);
      }

      // Track reverse relationship
      const reverseDeps = dependents.get(dependency) || [];
      if (!reverseDeps.includes(dependent)) {
        reverseDeps.push(dependent);
        dependents.set(dependency, reverseDeps);
      }

      console.log(`🔗 Dependency registered: ${dependent} → ${dependency}`);
      return true;
    },

    // 🔍 CHECK DEPENDENCY STATUS
    checkDependency: async (dependency, context = {}) => {
      const callbacks = resolutionCallbacks.get(dependency) || [];

      // Try each registered checker until one succeeds
      for (const callback of callbacks) {
        try {
          const result = await callback(context);
          if (result.satisfied) {
            return result;
          }
        } catch (error) {
          console.warn(`Dependency check failed for ${dependency}:`, error);
        }
      }

      // Default: dependency not satisfied
      return {
        satisfied: false,
        issues: [`Dependency "${dependency}" not satisfied`],
        suggestions: [
          `Ensure ${dependency} extension is loaded and configured`,
        ],
      };
    },

    // 📞 REGISTER DEPENDENCY CHECKER
    registerChecker: (dependency, checkerCallback) => {
      const callbacks = resolutionCallbacks.get(dependency) || [];
      callbacks.push(checkerCallback);
      resolutionCallbacks.set(dependency, callbacks);

      console.log(`🔧 Dependency checker registered for: ${dependency}`);
      return () => {
        // Return unregister function
        const currentCallbacks = resolutionCallbacks.get(dependency) || [];
        const index = currentCallbacks.indexOf(checkerCallback);
        if (index > -1) {
          currentCallbacks.splice(index, 1);
          resolutionCallbacks.set(dependency, currentCallbacks);
        }
      };
    },

    // 🎯 GET ALL DEPENDENCIES FOR EXTENSION
    getDependencies: (extensionId) => {
      return dependencies.get(extensionId) || [];
    },

    // 📊 GET STATUS
    getStatus: () => {
      return {
        dependencies: Object.fromEntries(dependencies),
        dependents: Object.fromEntries(dependents),
        checkers: Array.from(resolutionCallbacks.keys()),
        timestamp: new Date().toISOString(),
      };
    },
  };
};

// ===================================================================
// 🌐 GLOBAL CALENDAR PLATFORM - Professional Extension Coordination
// ===================================================================

const createCalendarPlatform = () => {
  const platform = {
    // 📊 EXTENSION REGISTRY
    extensions: new Map(),
    utilities: new Map(),
    eventBus: new Map(),

    // 🗓️ CALENDAR-SPECIFIC STATE (Config management removed - handled by UnifiedConfigUtils)
    calendarState: {
      currentView: null, // "monthly" | "weekly" | "yearly"
      currentPeriod: null, // "January 2024" | "01/15 2024 - 01/21 2024"
      viewInstances: new Map(), // Active view instances
    },

    // 🔗 DEPENDENCY MANAGER
    dependencies: createDependencyManager(),

    // 🎯 EXTENSION MANAGEMENT
    register: (id, api, metadata = {}) => {
      platform.extensions.set(id, {
        id,
        api,
        metadata: {
          name: metadata.name || id,
          version: metadata.version || "1.0.0",
          dependencies: metadata.dependencies || [],
          provides: metadata.provides || [], // What this extension provides for others
          loaded: Date.now(),
          ...metadata,
        },
      });

      // 🔗 REGISTER DEPENDENCIES
      if (metadata.dependencies && metadata.dependencies.length > 0) {
        metadata.dependencies.forEach((dep) => {
          platform.dependencies.registerDependency(id, dep, metadata);
        });
      }

      console.log(`✅ Calendar extension registered: ${id}`);

      // Notify other extensions
      platform.emit("extension:loaded", { id, api, metadata });

      document.body.dispatchEvent(
        new CustomEvent(`calendar:${id}:loaded`, {
          detail: { id, api, metadata },
        })
      );

      return true;
    },

    get: (id) => {
      const ext = platform.extensions.get(id);
      return ext ? ext.api : null;
    },

    has: (id) => {
      return platform.extensions.has(id);
    },

    // 🔧 UTILITY SHARING (Simplified - no complex registry sync)
    registerUtility: (name, utility) => {
      platform.utilities.set(name, utility);
      console.log(`🔧 Calendar utility registered: ${name}`);
      return true;
    },

    getUtility: (name) => {
      return platform.utilities.get(name);
    },

    // 🗓️ CALENDAR STATE MANAGEMENT (Config removed - use UnifiedConfigUtils instead)
    setCurrentView: (viewType, period) => {
      const oldView = platform.calendarState.currentView;
      const oldPeriod = platform.calendarState.currentPeriod;

      platform.calendarState.currentView = viewType;
      platform.calendarState.currentPeriod = period;

      console.log(
        `📅 Calendar state changed: ${oldView}(${oldPeriod}) → ${viewType}(${period})`
      );

      // Notify extensions of state change
      platform.emit("calendar:stateChange", {
        oldView,
        oldPeriod,
        newView: viewType,
        newPeriod: period,
      });
    },

    getCurrentView: () => {
      return {
        view: platform.calendarState.currentView,
        period: platform.calendarState.currentPeriod,
      };
    },

    // 📡 EVENT BUS
    emit: (event, data) => {
      const listeners = platform.eventBus.get(event) || [];
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.warn(`Event listener error for ${event}:`, e);
        }
      });
      return listeners.length;
    },

    on: (event, callback) => {
      const listeners = platform.eventBus.get(event) || [];
      listeners.push(callback);
      platform.eventBus.set(event, listeners);
      return () => {
        const currentListeners = platform.eventBus.get(event) || [];
        const index = currentListeners.indexOf(callback);
        if (index > -1) {
          currentListeners.splice(index, 1);
          platform.eventBus.set(event, currentListeners);
        }
      };
    },

    // 🔍 DEPENDENCY CHECKING
    checkDependencies: async (extensionId, context = {}) => {
      const deps = platform.dependencies.getDependencies(extensionId);
      const results = [];

      for (const dep of deps) {
        const result = await platform.dependencies.checkDependency(
          dep,
          context
        );
        results.push({
          dependency: dep,
          ...result,
        });
      }

      return {
        allSatisfied: results.every((r) => r.satisfied),
        results: results,
        issues: results.flatMap((r) => r.issues || []),
        suggestions: results.flatMap((r) => r.suggestions || []),
      };
    },

    // 📊 STATUS AND DEBUG (Simplified - config info removed)
    getStatus: () => {
      return {
        extensions: Array.from(platform.extensions.keys()),
        utilities: Array.from(platform.utilities.keys()),
        events: Array.from(platform.eventBus.keys()),
        loadedCount: platform.extensions.size,
        calendarState: {
          currentView: platform.calendarState.currentView,
          currentPeriod: platform.calendarState.currentPeriod,
          viewInstances: Array.from(
            platform.calendarState.viewInstances.keys()
          ),
        },
        dependencies: platform.dependencies.getStatus(),
        timestamp: new Date().toISOString(),
      };
    },

    debug: () => {
      console.group("🗓️ Calendar Suite Status");
      console.log("Platform:", platform.getStatus());

      // Calendar-specific debug info (config removed)
      const calendarState = platform.calendarState;
      console.log("Current View:", calendarState.currentView);
      console.log("Current Period:", calendarState.currentPeriod);

      // Dependency debug
      console.log("Dependencies:", platform.dependencies.getStatus());

      // UnifiedConfigUtils integration check
      if (window.UnifiedConfigUtils) {
        console.log("✅ UnifiedConfigUtils available for configuration");
        const configStatus = window.UnifiedConfigUtils.getConfigStatus();
        console.log("Config Status:", configStatus);
      } else {
        console.log(
          "⚠️ UnifiedConfigUtils not found - load config extension first"
        );
      }

      console.groupEnd();
      return platform.getStatus();
    },
  };

  return platform;
};

// ===================================================================
// 🚀 ROAM EXTENSION EXPORT - Professional Calendar Foundation
// ===================================================================

const extension = {
  onload: async ({ extensionAPI }) => {
    console.log("🗓️ Calendar Foundation starting...");

    // 🎯 SIMPLIFIED REGISTRY STRUCTURE
    window._calendarRegistry = {
      elements: [], // DOM elements (style tags, etc.)
      observers: [], // MutationObservers
      domListeners: [], // Event listeners
      commands: [], // Command palette commands
      timeouts: [], // setTimeout IDs
      intervals: [], // setInterval IDs
      extensions: new Map(), // Extension instances
    };

    // 🌐 CREATE GLOBAL CALENDAR PLATFORM
    window.CalendarSuite = createCalendarPlatform();

    // 🔧 REGISTER CORE UTILITIES
    window.CalendarSuite.registerUtility("addStyle", addStyle);
    window.CalendarSuite.registerUtility("generateUID", generateUID);

    // 🎨 PROFESSIONAL STYLING
    const calendarStyles = addStyle(
      `
      /* Professional calendar suite styles */
      .calendar-suite {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.5;
      }
      
      .calendar-suite .calendar-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .calendar-suite .calendar-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
      
      .calendar-suite .calendar-button.warning {
        background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
      }
      
      .calendar-suite .calendar-button.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
      
      .calendar-suite .status-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #15b371;
        margin-right: 6px;
      }
      
      .calendar-suite .dependency-warning {
        background: rgba(234, 88, 12, 0.1);
        border: 1px solid rgba(234, 88, 12, 0.3);
        border-radius: 6px;
        padding: 12px;
        margin: 8px 0;
        font-size: 13px;
        color: #ea580c;
      }
      
      .calendar-suite .debug-panel {
        background: rgba(0, 0, 0, 0.05);
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        padding: 12px;
        margin: 8px 0;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 13px;
      }
    `,
      "calendar-suite-foundation"
    );

    // 📝 REGISTER COMMANDS (Enhanced with config integration)
    const commands = [
      {
        label: "Calendar Suite: Show Status",
        callback: () => {
          const status = window.CalendarSuite.debug();
          console.log("📊 Full Calendar Suite Status:", status);
        },
      },
      {
        label: "Calendar Suite: List Loaded Extensions",
        callback: () => {
          const extensions = window.CalendarSuite.getStatus().extensions;
          console.log("📦 Loaded Calendar Extensions:", extensions);
          if (extensions.length === 0) {
            console.log(
              "💡 No calendar extensions loaded yet. Load Monthly/Weekly views to see coordination!"
            );
          }
        },
      },
      {
        label: "Calendar Suite: Check Dependencies",
        callback: async () => {
          const extensions = window.CalendarSuite.getStatus().extensions;
          for (const extId of extensions) {
            const deps = await window.CalendarSuite.checkDependencies(extId);
            console.log(`🔍 Dependencies for ${extId}:`, deps);
          }
        },
      },
      {
        label: "Calendar Suite: Debug State",
        callback: () => {
          const state = window.CalendarSuite.getCurrentView();
          console.log("🗓️ Current Calendar State:", state);

          // Show config status if available
          if (window.UnifiedConfigUtils) {
            const configStatus = window.UnifiedConfigUtils.getConfigStatus();
            console.log("📋 Config Status:", configStatus);
          } else {
            console.log(
              "⚠️ UnifiedConfigUtils not loaded - no config info available"
            );
          }
        },
      },
      {
        label: "Calendar Suite: Open Config Page",
        callback: () => {
          if (window.UnifiedConfigUtils) {
            window.roamAlphaAPI.ui.mainWindow.openPage({
              page: { title: window.UnifiedConfigUtils.CONFIG_PAGE_TITLE },
            });
          } else {
            alert(
              "⚠️ UnifiedConfigUtils not loaded. Please load the config extension first."
            );
          }
        },
      },
    ];

    // Add commands to Roam
    commands.forEach((cmd) => {
      extensionAPI.ui.commandPalette.addCommand(cmd);
      window._calendarRegistry.commands.push(cmd.label);
    });

    // 🎯 REGISTER SELF
    window.CalendarSuite.register(
      "calendar-foundation",
      {
        addStyle,
        generateUID,
        registerUtility: window.CalendarSuite.registerUtility,
        getUtility: window.CalendarSuite.getUtility,
        setCurrentView: window.CalendarSuite.setCurrentView,
        getCurrentView: window.CalendarSuite.getCurrentView,
        checkDependencies: window.CalendarSuite.checkDependencies,
        version: "1.0.0",
      },
      {
        name: "Calendar Foundation",
        description:
          "Professional lifecycle management and coordination platform for calendar suite",
        version: "1.0.0",
        dependencies: [], // No dependencies - works standalone
        provides: ["foundation", "registry", "dependencies", "coordination"],
      }
    );

    // 🎉 STARTUP COMPLETE
    console.log("🎯 Calendar Foundation loaded successfully!");
    console.log('💡 Try: Cmd+P → "Calendar Suite: Show Status"');
    console.log(
      "🔗 Extensions can now register with: window.CalendarSuite.register()"
    );
    console.log(
      "🔧 Utilities available via: window.CalendarSuite.getUtility()"
    );
    console.log(
      "📋 Configuration managed by: window.UnifiedConfigUtils (load config extension)"
    );

    // Store cleanup function globally
    window._calendarFoundationCleanup = () => {
      console.log("🧹 Calendar Foundation unloading...");
    };
  },

  onunload: () => {
    console.log("🧹 Calendar Foundation cleanup starting...");

    const registry = window._calendarRegistry;
    if (registry) {
      // 🧹 AUTOMATIC CLEANUP - Comprehensive resource management
      registry.elements.forEach((el) => {
        try {
          el.remove();
        } catch (e) {
          console.warn("Cleanup warning:", e);
        }
      });

      registry.observers.forEach((obs) => {
        try {
          obs.disconnect();
        } catch (e) {
          console.warn("Cleanup warning:", e);
        }
      });

      registry.domListeners.forEach((listener) => {
        try {
          listener.el.removeEventListener(listener.type, listener.listener);
        } catch (e) {
          console.warn("Cleanup warning:", e);
        }
      });

      registry.timeouts.forEach((id) => {
        try {
          clearTimeout(id);
        } catch (e) {
          console.warn("Cleanup warning:", e);
        }
      });

      registry.intervals.forEach((id) => {
        try {
          clearInterval(id);
        } catch (e) {
          console.warn("Cleanup warning:", e);
        }
      });
    }

    // Run custom cleanup
    if (window._calendarFoundationCleanup) {
      try {
        window._calendarFoundationCleanup();
      } catch (e) {
        console.warn("Custom cleanup warning:", e);
      }
    }

    // Clean up globals
    delete window._calendarRegistry;
    delete window._calendarFoundationCleanup;
    delete window.CalendarSuite;

    console.log("✅ Calendar Foundation cleanup complete!");
  },
};

// Export for Roam Research extension system
export default extension;
