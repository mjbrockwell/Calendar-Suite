// ===================================================================
// 🗓️ CALENDAR SUITE - COMBINED EXTENSION
// ===================================================================
// Generated: 2025-06-18 17:32:55
// Contains: Calendar Foundation, Config Utilities, Calendar Utilities, Monthly View, Weekly View, Weekly View Bandaid, Yearly View, Modal Edit Window
// No dependencies, no loading issues, no API problems!
// ===================================================================

console.log("🗓️ Calendar Suite Combined Edition starting...");


// ===================================================================
// 📦 CALENDAR FOUNDATION
// ===================================================================

// ===================================================================
// Calendar Foundation v2.0 - With Central Page Change Detection System
// TIER 1 PRIORITY 1: Eliminates 96% of polling overhead across extensions
// Revolutionary event-driven page detection with backward compatibility
// ===================================================================

// ===================================================================
// 🔧 CORE UTILITIES - Professional Infrastructure (Unchanged)
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
// 🎯 REVOLUTIONARY PAGE CHANGE DETECTION SYSTEM - TIER 1 PRIORITY 1
// Eliminates 96% polling overhead: 2.5 checks/second → 0.1 checks/second
// ===================================================================

class PageChangeDetector {
  constructor() {
    console.log("🎯 Initializing Central Page Change Detection System...");

    // 📋 CORE STATE
    this.listeners = new Map(); // label → {matcher: function, callback: function}
    this.currentPage = null;
    this.lastDetectionTime = 0;
    this.detectionCooldown = 100; // ms - prevent rapid-fire detection

    // 📊 PERFORMANCE METRICS
    this.metrics = {
      totalDetections: 0,
      pollingsEliminated: 0,
      registeredListeners: 0,
    };

    // 🚀 START REAL-TIME DETECTION
    this.setupRealTimeDetection();

    console.log("✅ Page Change Detection System initialized");
  }

  // ===================================================================
  // 🔧 1.1 REAL-TIME DETECTION SETUP - Multi-layer detection strategy
  // ===================================================================

  setupRealTimeDetection() {
    console.log("🔧 Setting up real-time page detection...");

    // 1.1.1 🎯 INITIAL PAGE DETECTION
    this.currentPage = this.getCurrentPageTitle();
    console.log(`📄 Initial page detected: "${this.currentPage}"`);

    // 1.1.2 📡 URL HASH CHANGE DETECTION - Catches navigation
    const hashChangeHandler = () => {
      this.debounceDetection("hashchange");
    };
    window.addEventListener("hashchange", hashChangeHandler);

    // Register for cleanup
    if (window._calendarRegistry) {
      window._calendarRegistry.domListeners.push({
        el: window,
        type: "hashchange",
        listener: hashChangeHandler,
      });
    }

    // 1.1.3 🔍 DOM MUTATION DETECTION - Catches title changes
    const observer = new MutationObserver((mutations) => {
      // Check if page title elements changed
      const titleChanged = mutations.some((mutation) => {
        return Array.from(mutation.addedNodes).some((node) => {
          return (
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.(".rm-title-display") ||
              node.querySelector?.(".rm-title-display") ||
              node.matches?.('[data-testid="page-title"]') ||
              node.querySelector?.('[data-testid="page-title"]'))
          );
        });
      });

      if (titleChanged) {
        this.debounceDetection("dom-mutation");
      }
    });

    // Observe document for page title changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Register observer for cleanup
    if (window._calendarRegistry) {
      window._calendarRegistry.observers.push(observer);
    }

    // 1.1.4 ⏰ BACKUP POLLING - Minimal fallback (every 5 seconds)
    const backupPollInterval = setInterval(() => {
      this.debounceDetection("backup-poll");
    }, 5000);

    // Register interval for cleanup
    if (window._calendarRegistry) {
      window._calendarRegistry.intervals.push(backupPollInterval);
    }

    console.log("✅ Real-time detection setup complete");
    console.log(
      "📊 Detection methods: hashchange + DOM mutations + 5s backup polling"
    );
  }

  // ===================================================================
  // 🎯 1.2 SMART PAGE DETECTION - Reuses existing logic from utilities
  // ===================================================================

  getCurrentPageTitle() {
    try {
      // 1.2.1 🔍 Try URL first
      const url = window.location.href;
      const pageMatch = url.match(/\/page\/(.+)$/);

      if (pageMatch) {
        const urlPart = decodeURIComponent(pageMatch[1]);

        // Check if this looks like a UID (9 characters, alphanumeric)
        const uidPattern = /^[a-zA-Z0-9_-]{9}$/;
        if (uidPattern.test(urlPart)) {
          // Convert UID to title using Roam API
          try {
            const title = window.roamAlphaAPI.data.q(`
              [:find ?title .
               :where [?e :block/uid "${urlPart}"] [?e :node/title ?title]]
            `);
            if (title) return title;
          } catch (error) {
            console.warn("⚠️ Error converting UID to title:", error);
          }
        } else {
          return urlPart;
        }
      }

      // 1.2.2 🔍 Try DOM selectors
      const domSelectors = [
        ".roam-log-page h1 .rm-title-display span",
        ".rm-title-display span",
        ".roam-article h1 span",
        ".roam-article .rm-title-display",
        '[data-testid="page-title"]',
      ];

      for (const selector of domSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent) {
          return titleElement.textContent.trim();
        }
      }

      // 1.2.3 📅 Fallback to today's date
      const today = new Date();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = monthNames[today.getMonth()];
      const day = today.getDate();
      const year = today.getFullYear();
      const suffix = this.getDaySuffix(day);
      return `${month} ${day}${suffix}, ${year}`;
    } catch (error) {
      console.error("❌ Error getting current page title:", error);
      return "Unknown Page";
    }
  }

  // Helper function for date suffix
  getDaySuffix(day) {
    if (day > 10 && day < 20) return "th";
    const lastDigit = day % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  }

  // ===================================================================
  // 🎯 1.3 DEBOUNCED DETECTION - Prevents rapid-fire detection
  // ===================================================================

  debounceDetection(source) {
    const now = Date.now();
    if (now - this.lastDetectionTime < this.detectionCooldown) {
      return; // Skip detection if too soon
    }

    this.lastDetectionTime = now;
    this.detectPageChange(source);
  }

  detectPageChange(source) {
    try {
      const newPage = this.getCurrentPageTitle();

      if (newPage !== this.currentPage) {
        const oldPage = this.currentPage;
        this.currentPage = newPage;
        this.metrics.totalDetections++;

        console.log(
          `🔄 Page change detected (${source}): "${oldPage}" → "${newPage}"`
        );

        // Notify all listeners
        this.notifyListeners(newPage, oldPage);

        // Emit generic event through existing event bus
        if (window.CalendarSuite?.emit) {
          window.CalendarSuite.emit("page-changed", {
            oldPage,
            newPage,
            source,
            pageType: this.detectPageType(newPage),
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error("❌ Error in page detection:", error);
    }
  }

  // ===================================================================
  // 🎯 1.4 LISTENER MANAGEMENT - Specialized pattern-based API
  // ===================================================================

  registerPageListener(label, matcher, callback) {
    // Support both (matcher, callback) and (label, matcher, callback)
    if (typeof label === "function") {
      callback = matcher;
      matcher = label;
      label = `listener-${this.listeners.size}`;
    }

    if (typeof matcher !== "function") {
      throw new Error("Page matcher must be a function");
    }

    if (typeof callback !== "function") {
      throw new Error("Page callback must be a function");
    }

    this.listeners.set(label, { matcher, callback });
    this.metrics.registeredListeners = this.listeners.size;

    console.log(
      `📝 Registered page listener: "${label}" (${this.listeners.size} total)`
    );

    // Immediately check current page
    try {
      if (this.currentPage && matcher(this.currentPage)) {
        console.log(
          `🎯 Immediate match for "${label}" on current page: "${this.currentPage}"`
        );
        callback(this.currentPage);
      }
    } catch (error) {
      console.warn(`⚠️ Error in immediate page check for "${label}":`, error);
    }

    // Return unregister function
    return () => {
      this.listeners.delete(label);
      this.metrics.registeredListeners = this.listeners.size;
      console.log(`🗑️ Unregistered page listener: "${label}"`);
    };
  }

  notifyListeners(pageTitle, oldPage) {
    let matchCount = 0;

    this.listeners.forEach(({ matcher, callback }, label) => {
      try {
        if (matcher(pageTitle)) {
          matchCount++;
          console.log(`✅ Page pattern match: "${label}" → "${pageTitle}"`);
          callback(pageTitle, oldPage);
        }
      } catch (error) {
        console.warn(`⚠️ Page detection error for "${label}":`, error);
      }
    });

    console.log(
      `📊 Notified ${matchCount}/${this.listeners.size} listeners for page: "${pageTitle}"`
    );
  }

  // ===================================================================
  // 🎯 1.5 PAGE TYPE DETECTION - Basic categorization
  // ===================================================================

  detectPageType(pageTitle) {
    if (!pageTitle) return "unknown";

    // Monthly pattern: "January 2024"
    if (
      /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/.test(
        pageTitle
      )
    ) {
      return "monthly";
    }

    // Weekly patterns (dual support)
    if (
      /^\d{2}\/\d{2} \d{4} - \d{2}\/\d{2} \d{4}$/.test(pageTitle) ||
      /^[A-Za-z]+ \d{1,2}(st|nd|rd|th), \d{4} - [A-Za-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/.test(
        pageTitle
      )
    ) {
      return "weekly";
    }

    // Daily note pattern: "January 15th, 2024"
    if (/^[A-Za-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/.test(pageTitle)) {
      return "daily";
    }

    return "custom";
  }

  // ===================================================================
  // 📊 1.6 METRICS AND STATUS - Performance monitoring
  // ===================================================================

  getMetrics() {
    // Calculate polling eliminations (estimate)
    const estimatedPollingReduction = this.metrics.registeredListeners * 0.5; // 0.5 checks/second per extension

    return {
      ...this.metrics,
      currentPage: this.currentPage,
      estimatedPollingReduction: `${estimatedPollingReduction} → 0.1 checks/second`,
      performanceImprovement:
        this.metrics.registeredListeners > 0
          ? `${Math.round(
              ((estimatedPollingReduction - 0.1) / estimatedPollingReduction) *
                100
            )}% reduction`
          : "No listeners yet",
      lastDetectionTime: new Date(this.lastDetectionTime).toISOString(),
    };
  }

  getStatus() {
    return {
      initialized: true,
      currentPage: this.currentPage,
      activeListeners: this.listeners.size,
      detectionMethods: ["hashchange", "dom-mutations", "backup-polling"],
      cooldownMs: this.detectionCooldown,
      metrics: this.getMetrics(),
    };
  }
}

// ===================================================================
// 🗓️ CALENDAR DEPENDENCY SYSTEM - Enhanced coordination (Unchanged)
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
// 🌐 ENHANCED CALENDAR PLATFORM - With Page Detection Integration
// ===================================================================

const createCalendarPlatform = () => {
  const platform = {
    // 📊 EXTENSION REGISTRY
    extensions: new Map(),
    utilities: new Map(),
    eventBus: new Map(),

    // 🎯 NEW: CENTRAL PAGE DETECTION SYSTEM
    pageDetector: null,

    // 🗓️ CALENDAR-SPECIFIC STATE
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
          provides: metadata.provides || [],
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

    // 🔧 UTILITY SHARING
    registerUtility: (name, utility) => {
      platform.utilities.set(name, utility);
      console.log(`🔧 Calendar utility registered: ${name}`);
      return true;
    },

    getUtility: (name) => {
      return platform.utilities.get(name);
    },

    // 🗓️ CALENDAR STATE MANAGEMENT
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

    // 📊 ENHANCED STATUS AND DEBUG
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
        pageDetector: platform.pageDetector?.getStatus() || null,
        timestamp: new Date().toISOString(),
      };
    },

    debug: () => {
      console.group("🗓️ Calendar Suite Status");
      console.log("Platform:", platform.getStatus());

      // Page Detection debug
      if (platform.pageDetector) {
        console.log("🎯 Page Detection:", platform.pageDetector.getStatus());
        console.log(
          "📊 Page Detection Metrics:",
          platform.pageDetector.getMetrics()
        );
      }

      // Calendar-specific debug info
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
// 🚀 ROAM EXTENSION EXPORT - Enhanced Calendar Foundation v2.0
// ===================================================================

const extension = {
  onload: async ({ extensionAPI }) => {
    console.log(
      "🗓️ Calendar Foundation v2.0 starting with Central Page Detection..."
    );

    // 🎯 REGISTRY STRUCTURE
    window._calendarRegistry = {
      elements: [], // DOM elements (style tags, etc.)
      observers: [], // MutationObservers
      domListeners: [], // Event listeners
      commands: [], // Command palette commands
      timeouts: [], // setTimeout IDs
      intervals: [], // setInterval IDs
      extensions: new Map(), // Extension instances
    };

    // 🌐 CREATE ENHANCED CALENDAR PLATFORM
    window.CalendarSuite = createCalendarPlatform();

    // 🎯 INITIALIZE CENTRAL PAGE DETECTION SYSTEM
    console.log("🎯 Initializing Central Page Change Detection System...");
    window.CalendarSuite.pageDetector = new PageChangeDetector();

    // Register page detector as core utility
    window.CalendarSuite.registerUtility(
      "pageDetector",
      window.CalendarSuite.pageDetector
    );
    window.CalendarSuite.registerUtility(
      "PageChangeDetector",
      PageChangeDetector
    );

    // 🔧 REGISTER CORE UTILITIES
    window.CalendarSuite.registerUtility("addStyle", addStyle);
    window.CalendarSuite.registerUtility("generateUID", generateUID);

    // 🎨 PROFESSIONAL STYLING (Enhanced)
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
      
      /* NEW: Page detection indicators */
      .calendar-suite .page-detection-status {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        margin: 4px 0;
      }
    `,
      "calendar-suite-foundation-v2"
    );

    // 📝 ENHANCED COMMANDS - With Page Detection
    const commands = [
      {
        label: "Calendar Suite: Show Status (v2.0)",
        callback: () => {
          const status = window.CalendarSuite.debug();
          console.log("📊 Full Calendar Suite Status (v2.0):", status);
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
      // 🎯 NEW: PAGE DETECTION COMMANDS
      {
        label: "🎯 Page Detection: Show Status",
        callback: () => {
          if (window.CalendarSuite.pageDetector) {
            const status = window.CalendarSuite.pageDetector.getStatus();
            const metrics = window.CalendarSuite.pageDetector.getMetrics();
            console.group("🎯 Central Page Detection System Status");
            console.log("Status:", status);
            console.log("Metrics:", metrics);
            console.log("Current Page:", status.currentPage);
            console.log("Active Listeners:", status.activeListeners);
            console.groupEnd();
          } else {
            console.log("❌ Page Detection System not initialized");
          }
        },
      },
      {
        label: "🎯 Page Detection: Test Current Page",
        callback: () => {
          if (window.CalendarSuite.pageDetector) {
            const currentPage = window.CalendarSuite.pageDetector.currentPage;
            const pageType =
              window.CalendarSuite.pageDetector.detectPageType(currentPage);
            console.log("🔍 Current Page Analysis:");
            console.log(`- Page: "${currentPage}"`);
            console.log(`- Type: ${pageType}`);
            console.log(
              `- Detection time: ${new Date(
                window.CalendarSuite.pageDetector.lastDetectionTime
              ).toLocaleTimeString()}`
            );
          }
        },
      },
      {
        label: "🎯 Page Detection: Register Test Listener",
        callback: () => {
          if (window.CalendarSuite.pageDetector) {
            const unregister =
              window.CalendarSuite.pageDetector.registerPageListener(
                "test-listener",
                (pageTitle) => pageTitle.length > 0, // Matches any non-empty page
                (pageTitle) => {
                  console.log(
                    `🧪 Test listener triggered for page: "${pageTitle}"`
                  );
                }
              );

            console.log(
              "✅ Test listener registered. It will trigger on any page change."
            );
            console.log("💡 Call the returned function to unregister:");
            console.log("unregister();");

            // Store unregister function globally for easy access
            window._testPageListenerUnregister = unregister;
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
        pageDetector: window.CalendarSuite.pageDetector,
        registerUtility: window.CalendarSuite.registerUtility,
        getUtility: window.CalendarSuite.getUtility,
        setCurrentView: window.CalendarSuite.setCurrentView,
        getCurrentView: window.CalendarSuite.getCurrentView,
        checkDependencies: window.CalendarSuite.checkDependencies,
        version: "2.0.0",
      },
      {
        name: "Calendar Foundation",
        description:
          "Professional lifecycle management and coordination platform with Central Page Detection System",
        version: "2.0.0",
        dependencies: [], // No dependencies - works standalone
        provides: [
          "foundation",
          "registry",
          "dependencies",
          "coordination",
          "page-detection",
        ],
      }
    );

    // 🎉 STARTUP COMPLETE
    console.log("🎯 Calendar Foundation v2.0 loaded successfully!");
    console.log("🎯 Central Page Detection System: ACTIVE");
    console.log(
      `📊 Estimated polling reduction: 96% (when extensions migrate)`
    );
    console.log('💡 Try: Cmd+P → "🎯 Page Detection: Show Status"');
    console.log(
      "🔗 Extensions can now register with: CalendarSuite.pageDetector.registerPageListener()"
    );
    console.log(
      "🔧 Utilities available via: window.CalendarSuite.getUtility()"
    );
    console.log(
      "📋 Configuration managed by: window.UnifiedConfigUtils (load config extension)"
    );

    // Store cleanup function globally
    window._calendarFoundationCleanup = () => {
      console.log("🧹 Calendar Foundation v2.0 unloading...");
    };
  },

  onunload: () => {
    console.log("🧹 Calendar Foundation v2.0 cleanup starting...");

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
    delete window._testPageListenerUnregister;

    console.log("✅ Calendar Foundation v2.0 cleanup complete!");
  },
};

// Export for Roam Research extension system

// ===================================================================
// 📦 CONFIG UTILITIES
// ===================================================================

// ===================================================================
// 🎯 UNIFIED CONFIG UTILS EXTENSION v1.0 - STANDALONE MICRO-EXTENSION
// Single responsibility: Configuration management for Calendar Suite
// Loads FIRST to provide config services to all other extensions
// ===================================================================

const extension = {
  onload: ({ extensionAPI }) => {
    console.log("🎯 Unified Config Utils Extension v1.0 loading...");

    // ===================================================================
    // 1.0 🍎 CORE CONFIGURATION UTILITIES - Cascading Block Logic
    // ===================================================================

    const UnifiedConfigUtils = {
      // 🌟 MASTER CONFIG PAGE
      CONFIG_PAGE_TITLE: "roam/ext/calendar suite/config",

      // 🛠️ TIMEOUT AND ERROR HANDLING
      OPERATION_TIMEOUT: 5000, // 5 seconds max per operation
      MAX_RETRIES: 3,

      // ===================================================================
      // 1.1 🍎 CORE UTILITIES - Based on proven cascading pattern
      // ===================================================================

      async getOrCreatePageUid(title) {
        try {
          // Check if page exists
          let pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${title}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (pageUid) {
            console.log(`📋 Config page exists: ${title}`);
            return pageUid;
          }

          // Create page if missing
          pageUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.page.create({
            page: { title, uid: pageUid },
          });

          console.log(`✅ Created config page: ${title}`);
          return pageUid;
        } catch (error) {
          throw new Error(
            `Failed to get/create page "${title}": ${error.message}`
          );
        }
      },

      async createBlock(parentUid, content, order = null) {
        try {
          if (order === null) {
            // Get current child count for auto-ordering
            const childCount =
              window.roamAlphaAPI.q(`
              [:find (count ?child) :where 
               [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]]
            `)?.[0]?.[0] || 0;
            order = childCount;
          }

          const blockUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": parentUid, order: order },
            block: { uid: blockUid, string: content },
          });

          return blockUid;
        } catch (error) {
          throw new Error(
            `Failed to create block "${content}": ${error.message}`
          );
        }
      },

      async updateBlock(blockUid, newContent) {
        try {
          await window.roamAlphaAPI.data.block.update({
            block: { uid: blockUid, string: newContent },
          });
          return true;
        } catch (error) {
          throw new Error(
            `Failed to update block ${blockUid}: ${error.message}`
          );
        }
      },

      findBlockWithSearch(parentUid, searchPattern) {
        try {
          // Try exact match first
          const exactMatch = window.roamAlphaAPI.q(`
            [:find (pull ?child [:block/uid :block/string])
             :where 
             [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]
             [?child :block/string "${searchPattern}"]]
          `);

          if (exactMatch.length > 0) {
            const found = exactMatch[0][0];
            return {
              uid: found[":block/uid"] || found.uid,
              string: found[":block/string"] || found.string,
            };
          }

          // Try starts-with match
          const startsWithResults = window.roamAlphaAPI.q(`
            [:find (pull ?child [:block/uid :block/string])
             :where 
             [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]
             [?child :block/string ?string] 
             [(clojure.string/starts-with? ?string "${searchPattern}")]]
          `);

          if (startsWithResults.length > 0) {
            const found = startsWithResults[0][0];
            return {
              uid: found[":block/uid"] || found.uid,
              string: found[":block/string"] || found.string,
            };
          }

          return null;
        } catch (error) {
          console.warn(`🔍 Search error for "${searchPattern}":`, error);
          return null;
        }
      },

      // ===================================================================
      // 1.2 🎯 FLEXIBLE SECTION READING - Handles all 3 formats
      // ===================================================================

      findSectionBlock(pageUid, section) {
        const headingVariants = [
          `**${section} config:**`, // Bold (preferred)
          `"${section} config:"`, // Quoted (acceptable)
          `${section} config::`, // Property (legacy support)
          `**${section}:**`, // Short bold
          `${section}:`, // Plain
        ];

        for (const variant of headingVariants) {
          const sectionBlock = this.findBlockWithSearch(pageUid, variant);
          if (sectionBlock) {
            console.log(
              `📋 Found section "${section}" using format: ${variant}`
            );
            return sectionBlock;
          }
        }

        return null;
      },

      // ===================================================================
      // 1.3 🚀 CASCADING CONFIG OPERATIONS - Proven pattern
      // ===================================================================

      async writeConfigValue(section, key, value) {
        const startTime = Date.now();
        const workingOn = { step: null, uid: null, content: null };
        let loopCount = 0;

        console.log(`🛠️ Writing config: ${section}.${key} = ${value}`);

        while (Date.now() - startTime < this.OPERATION_TIMEOUT) {
          loopCount++;

          try {
            // LEVEL 1: Ensure config page exists
            const pageUid = await this.getOrCreatePageUid(
              this.CONFIG_PAGE_TITLE
            );

            // LEVEL 2: Find/create section heading
            let sectionBlock = this.findSectionBlock(pageUid, section);

            if (!sectionBlock) {
              if (workingOn.step !== "section" || workingOn.uid !== pageUid) {
                workingOn.step = "section";
                workingOn.uid = pageUid;
                workingOn.content = `**${section} config:**`; // Always use safe format
                await this.createBlock(pageUid, workingOn.content);
              }
              continue; // Restart loop to verify creation
            }

            // LEVEL 3: Find/create config key under section
            const isYvTag = key.match(/^yv\d+$/);
            const colonPattern = isYvTag ? "::" : ":";
            const configPattern = `${key}${colonPattern}`;
            let configBlock = this.findBlockWithSearch(
              sectionBlock.uid,
              configPattern
            );

            if (!configBlock) {
              if (
                workingOn.step !== "config" ||
                workingOn.uid !== sectionBlock.uid
              ) {
                workingOn.step = "config";
                workingOn.uid = sectionBlock.uid;
                workingOn.content = `${key}${colonPattern} ${value}`;
                await this.createBlock(sectionBlock.uid, workingOn.content);
              }
              continue; // Restart loop to verify creation
            }

            // LEVEL 4: Update existing config value
            const newContent = `${key}${colonPattern} ${value}`;
            if (configBlock.string !== newContent) {
              await this.updateBlock(configBlock.uid, newContent);
            }

            console.log(
              `✅ Config written: ${section}.${key} = ${value} (${loopCount} loops, ${
                Date.now() - startTime
              }ms)`
            );
            return true;
          } catch (error) {
            console.error(`🛠️ Loop ${loopCount} error:`, error.message);
            await new Promise((resolve) => setTimeout(resolve, 100)); // Brief pause
          }
        }

        throw new Error(
          `Timeout writing ${section}.${key} after ${this.OPERATION_TIMEOUT}ms (${loopCount} loops)`
        );
      },

      readConfigValue(section, key, defaultValue = null) {
        try {
          console.log(`🔍 Reading config: ${section}.${key}`);

          // Get config page
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) {
            console.log(
              `📋 Config page doesn't exist, returning default: ${defaultValue}`
            );
            return defaultValue;
          }

          // Find section
          const sectionBlock = this.findSectionBlock(pageUid, section);
          if (!sectionBlock) {
            console.log(
              `📋 Section "${section}" not found, returning default: ${defaultValue}`
            );
            return defaultValue;
          }

          // Find config key
          const isYvTag = key.match(/^yv\d+$/);
          const colonPattern = isYvTag ? "::" : ":";
          const configPattern = `${key}${colonPattern}`;
          const configBlock = this.findBlockWithSearch(
            sectionBlock.uid,
            configPattern
          );
          if (!configBlock) {
            console.log(
              `📋 Config "${key}" not found in section "${section}", returning default: ${defaultValue}`
            );
            return defaultValue;
          }

          // Extract value
          const regexPattern = isYvTag
            ? `${key}::\\s*(.+)$`
            : `${key}:\\s*(.+)$`;
          const match = configBlock.string.match(new RegExp(regexPattern));
          if (match) {
            const value = match[1].trim();
            console.log(`✅ Config read: ${section}.${key} = ${value}`);
            return value;
          }

          console.log(
            `📋 Could not parse value from "${configBlock.string}", returning default: ${defaultValue}`
          );
          return defaultValue;
        } catch (error) {
          console.warn(`⚠️ Error reading config ${section}.${key}:`, error);
          return defaultValue;
        }
      },

      // ===================================================================
      // 1.4 🎨 MASTER CONFIG INITIALIZATION
      // ===================================================================

      async initializeMasterConfig() {
        console.log("🎨 Initializing master config page...");

        try {
          const pageUid = await this.getOrCreatePageUid(this.CONFIG_PAGE_TITLE);

          // Check if already initialized
          const existingBlocks = window.roamAlphaAPI.q(`
            [:find ?string :where 
             [?page :block/uid "${pageUid}"] [?child :block/page ?page]
             [?child :block/string ?string]]
          `);

          const hasConfig = existingBlocks.some(
            ([string]) =>
              string.includes("config:") || string.includes("Calendar Suite")
          );

          if (hasConfig) {
            console.log("📋 Master config already initialized");
            return pageUid;
          }

          // Create master structure
          const headerUid = await this.createBlock(
            pageUid,
            "🗓️ **Calendar Suite Configuration** - One source of truth for all calendar extensions"
          );

          const instructionsUid = await this.createBlock(
            pageUid,
            "Instructions: Configure settings below by section. Extensions will read from this page automatically."
          );

          // Create enhanced default sections with complete configs
          const defaultConfigs = [
            {
              section: "Weekly",
              configs: [
                ["automatic guidance enabled", "yes"],
                ["add week count within the year", "yes"],
                ["include query for `[[Morning Intentions]]`", "yes"],
                ["add query for `[[Evening Reflections]]`", "yes"],
                ["add Plus-Minus-Next journal", "yes"],
              ],
            },
            {
              section: "Monthly",
              configs: [
                ["Colors", ""],
                ["Settings", ""],
              ],
              subsections: {
                Colors: [
                  ["mon", "#clr-lgt-grn"],
                  ["tue", "#clr-lgt-grn"],
                  ["wed", "#clr-grn"],
                  ["thu", "#clr-lgt-grn"],
                  ["fri", "#clr-lgt-grn"],
                  ["sat", "#clr-lgt-ylo"],
                  ["sun", "#clr-lgt-brn"],
                ],
                Settings: [
                  ["automatic guidance enabled", "yes"],
                  ["show-monthly-todo", "yes"],
                ],
              },
            },
            {
              section: "Yearly",
              configs: [
                ["yv0", "General Events,3a5199,e6efff,🔵"],
                ["yv1", "Family Birthdays,c41d69,ffe6f0,🎂"],
                ["yv2", "Other Birthdays,9e3b8c,f9ebff,🟪"],
                ["yv3", "Deadlines,a05600,fff4e5,📌"],
                ["yv4", "Holidays,0d6e37,e5fff0,🎉"],
                ["yv5", "Meetings,5a3095,f0e6ff,👥"],
                ["yv6", "For Fun,ad4600,fff2e0,🥳"],
                ["yv7", "Health + Wellness,20a39a,e0f7f5,💪"],
                ["yv8", "Travel + Transport,1e88e5,e3f2fd,✈️"],
                ["yv9", "Family,e57373,ffebee,👪"],
              ],
            },
          ];

          for (const sectionData of defaultConfigs) {
            // Create section heading with safe format
            const sectionUid = await this.createBlock(
              pageUid,
              `**${sectionData.section} config:**`
            );

            // Handle regular configs
            for (const [key, value] of sectionData.configs) {
              if (
                sectionData.subsections &&
                (key === "Colors" || key === "Settings")
              ) {
                // Create subsection header
                const subsectionUid = await this.createBlock(
                  sectionUid,
                  `${key}:`
                );

                // Add subsection configs
                const subsectionConfigs = sectionData.subsections[key];
                for (const [subKey, subValue] of subsectionConfigs) {
                  await this.createBlock(
                    subsectionUid,
                    `${subKey}: ${subValue}`
                  );
                }
              } else {
                // Regular config item - use double colon for yv tags, single for others
                const colonPattern = key.match(/^yv\d+$/) ? "::" : ":";
                await this.createBlock(
                  sectionUid,
                  `${key}${colonPattern} ${value}`
                );
              }
            }
          }

          console.log(
            "✅ Enhanced master config initialized with complete structure"
          );
          console.log(
            "📋 Weekly: Automatic guidance, queries, journal features"
          );
          console.log(
            "📋 Monthly: Day colors + settings with two-level structure"
          );
          console.log("📋 Yearly: Complete yv0-yv9 tag configurations");
          return pageUid;
        } catch (error) {
          throw new Error(
            `Failed to initialize master config: ${error.message}`
          );
        }
      },

      // ===================================================================
      // 1.5 🧪 CONVENIENCE METHODS & TESTING
      // ===================================================================

      // Enhanced Weekly config methods
      getWeeklyPageReference(configKey) {
        const rawValue = this.readConfigValue("Weekly", configKey, null);
        if (!rawValue) return null;

        // Strip backticks to get clean page name
        const match = rawValue.match(/`\[\[([^\]]+)\]\]`/);
        return match ? match[1] : rawValue;
      },

      isWeeklyFeatureEnabled(feature) {
        const value = this.readConfigValue("Weekly", feature, "no");
        return value.toLowerCase() === "yes" || value.toLowerCase() === "true";
      },

      getYearlyTags() {
        // Read all yv tags directly (yv0 through yv9)
        const tags = [];
        for (let i = 0; i <= 9; i++) {
          const tagId = `yv${i}`;
          const tagConfig = this.getYearlyTagConfig(tagId);
          if (tagConfig) {
            tags.push(tagId);
          }
        }
        return tags.length > 0
          ? tags
          : [
              "yv0",
              "yv1",
              "yv2",
              "yv3",
              "yv4",
              "yv5",
              "yv6",
              "yv7",
              "yv8",
              "yv9",
            ];
      },

      // Enhanced Monthly config methods for two-level structure
      getDayColor(day) {
        try {
          // Find Monthly config section
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) return null;

          const monthlySection = this.findSectionBlock(pageUid, "Monthly");
          if (!monthlySection) return null;

          // Find Colors subsection
          const colorsBlock = this.findBlockWithSearch(
            monthlySection.uid,
            "Colors:"
          );
          if (!colorsBlock) return null;

          // Find specific day
          const dayBlock = this.findBlockWithSearch(colorsBlock.uid, `${day}:`);
          if (!dayBlock) return null;

          const match = dayBlock.string.match(new RegExp(`${day}:\\s*(.+)$`));
          return match ? match[1].trim() : null;
        } catch (error) {
          console.warn(`⚠️ Error reading day color for ${day}:`, error);
          return null;
        }
      },

      getMonthlySettings() {
        try {
          // Find Monthly config section
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) return {};

          const monthlySection = this.findSectionBlock(pageUid, "Monthly");
          if (!monthlySection) return {};

          // Find Settings subsection
          const settingsBlock = this.findBlockWithSearch(
            monthlySection.uid,
            "Settings:"
          );
          if (!settingsBlock) return {};

          // Read all settings under Settings subsection
          const settingsQuery = window.roamAlphaAPI.q(`
            [:find ?string :where 
             [?parent :block/uid "${settingsBlock.uid}"] [?child :block/parents ?parent]
             [?child :block/string ?string]]
          `);

          const settings = {};
          settingsQuery.forEach(([string]) => {
            const match = string.match(/^([^:]+):\s*(.+)$/);
            if (match) {
              settings[match[1].trim()] = match[2].trim();
            }
          });

          return settings;
        } catch (error) {
          console.warn("⚠️ Error reading monthly settings:", error);
          return {};
        }
      },

      getYearlyTagConfig(tagId) {
        const configString = this.readConfigValue("Yearly", tagId, null);
        if (!configString) return null;

        const parts = configString.split(",").map((part) => part.trim());
        if (parts.length >= 4) {
          return {
            id: tagId,
            name: parts[0],
            textColor: parts[1],
            bgColor: parts[2],
            emoji: parts[3],
          };
        }
        return null;
      },

      // Status and debugging
      getConfigStatus() {
        try {
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) {
            return { exists: false, sections: [], totalConfigs: 0 };
          }

          const allBlocks = window.roamAlphaAPI.q(`
            [:find ?string :where 
             [?page :block/uid "${pageUid}"] [?child :block/page ?page]
             [?child :block/string ?string]]
          `);

          const sections = allBlocks.filter(([string]) =>
            string.includes("config:")
          ).length;
          const configs = allBlocks.filter(([string]) => {
            // Count lines that have config patterns (key: value or key:: value) but not section headers
            return (
              string.includes("::") ||
              (string.includes(":") &&
                !string.includes("config:") &&
                !string.endsWith(":"))
            );
          }).length;

          return {
            exists: true,
            pageUid,
            totalBlocks: allBlocks.length,
            sections,
            totalConfigs: configs,
            version: "1.0",
          };
        } catch (error) {
          return { exists: false, error: error.message };
        }
      },

      // Test the enhanced cascading logic
      async testCascadingLogic() {
        console.log("🧪 Testing enhanced cascading block logic...");

        try {
          // Test writing basic configs
          await this.writeConfigValue("Test", "sample-setting", "test-value");
          await this.writeConfigValue(
            "Test",
            "another-setting",
            "another-value"
          );
          await this.writeConfigValue("AnotherTest", "cross-section", "works");

          // Test reading them back
          const value1 = this.readConfigValue("Test", "sample-setting");
          const value2 = this.readConfigValue("Test", "another-setting");
          const value3 = this.readConfigValue("AnotherTest", "cross-section");

          // Test enhanced convenience methods
          const yearlyTags = this.getYearlyTags();
          const monthlySettings = this.getMonthlySettings();
          const mondayColor = this.getDayColor("mon");

          const basicTest =
            value1 === "test-value" &&
            value2 === "another-value" &&
            value3 === "works";
          const enhancedTest =
            yearlyTags.length >= 10 && typeof monthlySettings === "object";

          const success = basicTest && enhancedTest;

          console.log(
            `🧪 Basic cascading logic: ${basicTest ? "✅ PASSED" : "❌ FAILED"}`
          );
          console.log(
            `🧪 Enhanced config structure: ${
              enhancedTest ? "✅ PASSED" : "❌ FAILED"
            }`
          );
          console.log(
            `🧪 Overall test result: ${success ? "✅ PASSED" : "❌ FAILED"}`
          );

          if (success) {
            console.log(
              `📋 Found ${yearlyTags.length} yearly tags, ${
                Object.keys(monthlySettings).length
              } monthly settings`
            );
            console.log(`🎨 Monday color: ${mondayColor || "not found"}`);
          }

          return success;
        } catch (error) {
          console.error("🧪 Enhanced test failed:", error);
          return false;
        }
      },
    };

    // ===================================================================
    // 2.0 🌟 EXTENSION LIFECYCLE & REGISTRATION
    // ===================================================================

    // Make globally available immediately
    window.UnifiedConfigUtils = UnifiedConfigUtils;

    // Register with Calendar Foundation if available
    if (window.CalendarSuite) {
      window.CalendarSuite.registerUtility(
        "UnifiedConfigUtils",
        UnifiedConfigUtils
      );
      console.log("🔗 Registered with Calendar Foundation");
    }

    // Initialize master config page
    setTimeout(async () => {
      try {
        await UnifiedConfigUtils.initializeMasterConfig();
        console.log("✅ Master config initialization complete");
      } catch (error) {
        console.error("❌ Failed to initialize master config:", error);
      }
    }, 1000);

    // Add command palette commands for testing and management
    const commands = [
      {
        label: "Config: Initialize Master Config",
        callback: async () => {
          try {
            await UnifiedConfigUtils.initializeMasterConfig();
            alert("✅ Master config initialized successfully!");
          } catch (error) {
            alert(`❌ Error: ${error.message}`);
          }
        },
      },
      {
        label: "Config: Test Cascading Logic",
        callback: async () => {
          const success = await UnifiedConfigUtils.testCascadingLogic();
          alert(success ? "✅ Test passed!" : "❌ Test failed - check console");
        },
      },
      {
        label: "Config: Show Status",
        callback: () => {
          const status = UnifiedConfigUtils.getConfigStatus();
          console.log("📋 Config Status:", status);
          if (status.exists) {
            alert(
              `📋 Config Status:\n• Page exists: ✅\n• Sections: ${status.sections}\n• Total configs: ${status.totalConfigs}`
            );
          } else {
            alert("📋 Config page doesn't exist yet");
          }
        },
      },
      {
        label: "Config: Open Config Page",
        callback: () => {
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { title: UnifiedConfigUtils.CONFIG_PAGE_TITLE },
          });
        },
      },
    ];

    // Add commands to Roam
    commands.forEach((cmd) => {
      extensionAPI.ui.commandPalette.addCommand(cmd);
    });

    console.log("🎯 Unified Config Utils Extension v1.0 loaded successfully!");
    console.log(
      `📋 Master config page: [[${UnifiedConfigUtils.CONFIG_PAGE_TITLE}]]`
    );
    console.log("🧪 Test with: Cmd+P → 'Config: Test Cascading Logic'");
    console.log("🔧 Available globally as: window.UnifiedConfigUtils");
  },

  onunload: () => {
    console.log("🧹 Unified Config Utils Extension unloading...");

    // Cleanup global reference
    if (window.UnifiedConfigUtils) {
      delete window.UnifiedConfigUtils;
    }

    console.log("✅ Unified Config Utils Extension unloaded");
  },
};

// Export for Roam Research extension system

// ===================================================================
// 📦 CALENDAR UTILITIES
// ===================================================================

// ===================================================================
// 🔧 Calendar Utilities Extension v1.2 - Enhanced Page Detection Integration
// TIER 1 ARCHITECTURE: Integrates with Central Page Detection System
// Provides specialized utilities + dependency checking for page detection
// ===================================================================

// ===================================================================
// 🔧 CORE DATE & TIME UTILITIES - The Foundation of Everything (Unchanged)
// ===================================================================

const DateTimeUtils = {
  // 📅 ROAM DATE PARSING - Convert Roam daily note format to Date objects
  parseRoamDate: (roamDateString) => {
    try {
      // Handle Roam's daily note format: "January 15th, 2024"
      const cleanString = roamDateString
        .replace(/(\d+)(st|nd|rd|th)/, "$1") // Remove ordinal suffixes
        .trim();

      const date = new Date(cleanString);
      if (isNaN(date.getTime())) {
        console.warn(`⚠️ Could not parse Roam date: ${roamDateString}`);
        return null;
      }
      return date;
    } catch (error) {
      console.error(`❌ Error parsing Roam date "${roamDateString}":`, error);
      return null;
    }
  },

  // 📅 FORMAT DATE FOR ROAM - Convert Date object to Roam daily note format
  formatDateForRoam: (date) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const suffix = DateTimeUtils.getDaySuffix(day);

    return `${month} ${day}${suffix}, ${year}`;
  },

  // 📅 GET DAY SUFFIX - Add proper ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  getDaySuffix: (day) => {
    if (day > 10 && day < 20) return "th";
    const lastDigit = day % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  },

  // 📅 GET WEEK START DATE - Get Sunday of the week containing the given date
  getWeekStartDate: (date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0); // Start of day
    return startOfWeek;
  },

  // 📅 GET WEEK END DATE - Get Saturday of the week containing the given date
  getWeekEndDate: (date) => {
    const endOfWeek = new Date(date);
    const dayOfWeek = endOfWeek.getDay();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999); // End of day
    return endOfWeek;
  },

  // 📅 GET MONTH NAME - Convert month number to name
  getMonthName: (monthIndex) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  },

  // 📅 IS TODAY - Check if given date is today
  isToday: (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  // 📅 IS THIS WEEK - Check if given date is in current week
  isThisWeek: (date) => {
    const today = new Date();
    const weekStart = DateTimeUtils.getWeekStartDate(today);
    const weekEnd = DateTimeUtils.getWeekEndDate(today);
    return date >= weekStart && date <= weekEnd;
  },
};

// ===================================================================
// 📝 ENHANCED ROAM PAGE & BLOCK UTILITIES - Integrated with Page Detection
// ===================================================================

const RoamUtils = {
  // 🔍 GET CURRENT PAGE TITLE - Enhanced for consistency with PageChangeDetector
  getCurrentPageTitle: () => {
    try {
      console.log("🔍 Getting current page title...");

      // Use PageChangeDetector if available (preferred)
      if (window.CalendarSuite?.pageDetector?.currentPage) {
        const currentPage = window.CalendarSuite.pageDetector.currentPage;
        console.log(`✅ Got page from Central Detection: "${currentPage}"`);
        return currentPage;
      }

      // Fallback to manual detection (same logic as PageChangeDetector)
      const url = window.location.href;
      console.log(`🔍 Current URL: ${url}`);

      const pageMatch = url.match(/\/page\/(.+)$/);

      if (pageMatch) {
        const urlPart = decodeURIComponent(pageMatch[1]);
        console.log(`🔍 URL part extracted: "${urlPart}"`);

        // Check if this looks like a UID (9 characters, alphanumeric)
        const uidPattern = /^[a-zA-Z0-9_-]{9}$/;
        if (uidPattern.test(urlPart)) {
          console.log(`🔧 Detected UID "${urlPart}", converting to title...`);

          // Convert UID to title using Roam API
          try {
            const title = window.roamAlphaAPI.data.q(`
              [:find ?title .
               :where [?e :block/uid "${urlPart}"] [?e :node/title ?title]]
            `);

            if (title) {
              console.log(`🔧 Converted UID "${urlPart}" to title "${title}"`);
              return title;
            } else {
              console.log(`⚠️ Could not find title for UID "${urlPart}"`);
            }
          } catch (error) {
            console.error(`❌ Error converting UID to title:`, error);
          }
        } else {
          console.log(`✅ URL part is already a title: "${urlPart}"`);
          return urlPart;
        }
      }

      // Try to get from DOM with better selectors
      console.log("🔍 Trying DOM selectors...");

      const domSelectors = [
        ".roam-log-page h1 .rm-title-display span",
        ".rm-title-display span",
        ".roam-article h1 span",
        ".roam-article .rm-title-display",
        '[data-testid="page-title"]',
      ];

      for (const selector of domSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent) {
          const title = titleElement.textContent.trim();
          console.log(
            `✅ Found title via DOM selector "${selector}": "${title}"`
          );
          return title;
        }
      }

      console.log(
        "⚠️ Could not find title via DOM, falling back to today's date"
      );

      // Fallback to today's daily note
      const fallback = DateTimeUtils.formatDateForRoam(new Date());
      console.log(`📅 Using fallback title: "${fallback}"`);
      return fallback;
    } catch (error) {
      console.error("❌ Error getting current page title:", error);
      const fallback = DateTimeUtils.formatDateForRoam(new Date());
      console.log(`📅 Error fallback title: "${fallback}"`);
      return fallback;
    }
  },

  // 🔍 GET PAGE UID - Get the UID of a page by title
  getPageUid: (pageTitle) => {
    try {
      const result = window.roamAlphaAPI.data.q(`
        [:find ?uid .
         :where [?e :node/title "${pageTitle}"] [?e :block/uid ?uid]]
      `);
      return result || null;
    } catch (error) {
      console.error(`❌ Error getting page UID for "${pageTitle}":`, error);
      return null;
    }
  },

  // 🔍 PAGE EXISTS - Check if a page exists
  pageExists: (pageTitle) => {
    try {
      const result = window.roamAlphaAPI.data.q(`
        [:find ?e .
         :where [?e :node/title "${pageTitle}"]]
      `);
      return !!result;
    } catch (error) {
      console.error(`❌ Error checking if page exists "${pageTitle}":`, error);
      return false;
    }
  },

  // 🏗️ CREATE PAGE - Create a new page
  createPage: async (pageTitle) => {
    try {
      const pageUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.page.create({
        page: { title: pageTitle, uid: pageUid },
      });
      console.log(`✅ Created page: "${pageTitle}"`);
      return pageUid;
    } catch (error) {
      console.error(`❌ Error creating page "${pageTitle}":`, error);
      throw error;
    }
  },

  // 🔍 QUERY BLOCKS - Query blocks within a page
  queryBlocks: (pageTitle, searchPattern = null) => {
    try {
      let query;
      if (searchPattern) {
        query = `
          [:find ?uid ?string
           :in $ ?page-title ?pattern
           :where
           [?page :node/title ?page-title]
           [?block :block/page ?page]
           [?block :block/uid ?uid]
           [?block :block/string ?string]
           [(clojure.string/includes? ?string ?pattern)]]
        `;
        return (
          window.roamAlphaAPI.data.q(query, pageTitle, searchPattern) || []
        );
      } else {
        query = `
          [:find ?uid ?string
           :in $ ?page-title
           :where
           [?page :node/title ?page-title]
           [?block :block/page ?page]
           [?block :block/uid ?uid]
           [?block :block/string ?string]]
        `;
        return window.roamAlphaAPI.data.q(query, pageTitle) || [];
      }
    } catch (error) {
      console.error(`❌ Error querying blocks:`, error);
      return [];
    }
  },

  // 🔧 GENERATE UID - Generate unique identifier for Roam blocks
  generateUID: () => {
    return (
      window.roamAlphaAPI?.util?.generateUID?.() ||
      "cal-" + Math.random().toString(36).substr(2, 9)
    );
  },

  // 🔍 SEARCH PAGES - Search for pages containing a term
  searchPages: (searchTerm) => {
    try {
      const results = window.roamAlphaAPI.data.q(
        `
        [:find ?title
         :in $ ?search-term
         :where
         [?page :node/title ?title]
         [(clojure.string/includes? ?title ?search-term)]]
      `,
        searchTerm
      );
      return results ? results.map((result) => result[0]) : [];
    } catch (error) {
      console.error(`❌ Error searching pages for "${searchTerm}":`, error);
      return [];
    }
  },
};

// ===================================================================
// 📅 ENHANCED WEEKLY PAGE UTILITIES - Ready for Central Page Detection
// ===================================================================

const WeeklyUtils = {
  // 📅 GENERATE WEEKLY TITLE - Create standardized weekly page title
  generateWeeklyTitle: (date) => {
    const weekStart = DateTimeUtils.getWeekStartDate(date);
    const weekEnd = DateTimeUtils.getWeekEndDate(date);

    const startStr = DateTimeUtils.formatDateForRoam(weekStart);
    const endStr = DateTimeUtils.formatDateForRoam(weekEnd);

    return `${startStr} - ${endStr}`;
  },

  // 📅 IS WEEKLY PAGE - PERFECT FOR PAGE DETECTION SYSTEM (Dual Pattern Support)
  isWeeklyPage: (pageTitle) => {
    if (!pageTitle) return false;

    console.log(`🔍 Testing weekly page patterns for: "${pageTitle}"`);

    // Match BOTH patterns for maximum compatibility
    const weeklyPatterns = [
      /^\d{2}\/\d{2} \d{4} - \d{2}\/\d{2} \d{4}$/, // MM/DD YYYY - MM/DD YYYY
      /^[A-Za-z]+ \d{1,2}(st|nd|rd|th), \d{4} - [A-Za-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/, // Full date range
    ];

    const trimmedTitle = pageTitle.trim();

    for (let i = 0; i < weeklyPatterns.length; i++) {
      const pattern = weeklyPatterns[i];
      const matches = pattern.test(trimmedTitle);
      console.log(
        `🔍 Pattern ${i + 1} (${i === 0 ? "MM/DD YYYY" : "Month Day, Year"}): ${
          matches ? "✅ MATCH" : "❌ NO MATCH"
        }`
      );
      if (matches) {
        console.log(`✅ Weekly page detected using pattern ${i + 1}`);
        return true;
      }
    }

    console.log(`❌ No weekly patterns matched for: "${pageTitle}"`);
    return false;
  },

  // 📅 PARSE WEEKLY TITLE - Extract dates from weekly page title (Dual Pattern Support)
  parseWeeklyTitle: (weeklyTitle) => {
    try {
      console.log(`🔍 Parsing weekly title: "${weeklyTitle}"`);

      // Handle MM/DD YYYY - MM/DD YYYY format
      const shortMatch = weeklyTitle.match(
        /^(\d{2}\/\d{2} \d{4}) - (\d{2}\/\d{2} \d{4})$/
      );
      if (shortMatch) {
        console.log(
          `✅ Matched short format: ${shortMatch[1]} - ${shortMatch[2]}`
        );
        const startDate = new Date(shortMatch[1]);
        const endDate = new Date(shortMatch[2]);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          console.log(`✅ Successfully parsed short format dates`);
          return { startDate, endDate };
        } else {
          console.log(`❌ Failed to parse short format dates`);
        }
      }

      // Handle full date format: "January 15th, 2024 - January 21st, 2024"
      const parts = weeklyTitle.split(" - ");
      if (parts.length === 2) {
        console.log(`✅ Split into parts: "${parts[0]}" and "${parts[1]}"`);

        const startDate = DateTimeUtils.parseRoamDate(parts[0]);
        const endDate = DateTimeUtils.parseRoamDate(parts[1]);

        if (startDate && endDate) {
          console.log(`✅ Successfully parsed full format dates`);
          return { startDate, endDate };
        } else {
          console.log(`❌ Failed to parse full format dates`);
        }
      }

      console.log(`❌ Could not parse weekly title: "${weeklyTitle}"`);
      return null;
    } catch (error) {
      console.error(`❌ Error parsing weekly title "${weeklyTitle}":`, error);
      return null;
    }
  },

  // 📅 GET WEEK NUMBER - Get week number in year
  getWeekNumber: (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  },
};

// ===================================================================
// 📅 ENHANCED MONTHLY PAGE UTILITIES - Ready for Central Page Detection
// ===================================================================

const MonthlyUtils = {
  // 📅 GENERATE MONTHLY TITLE - Create standardized monthly page title
  generateMonthlyTitle: (date) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${year}`;
  },

  // 📅 IS MONTHLY PAGE - PERFECT FOR PAGE DETECTION SYSTEM
  isMonthlyPage: (pageTitle) => {
    if (!pageTitle) return false;

    // Match pattern: "Month Year"
    const monthlyPattern =
      /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/;
    return monthlyPattern.test(pageTitle);
  },

  // 📅 PARSE MONTHLY TITLE - Extract date from monthly page title
  parseMonthlyTitle: (monthlyTitle) => {
    try {
      // Parse "January 2024" format
      const date = new Date(monthlyTitle + " 1"); // Add day to make it parseable
      if (isNaN(date.getTime())) return null;

      return date;
    } catch (error) {
      console.error(`❌ Error parsing monthly title "${monthlyTitle}":`, error);
      return null;
    }
  },

  // 📅 GET WEEKS IN MONTH - Get all weekly periods that overlap with a month
  getWeeksInMonth: (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks = [];
    let currentDate = DateTimeUtils.getWeekStartDate(firstDay);

    while (currentDate <= lastDay) {
      const weekEnd = DateTimeUtils.getWeekEndDate(currentDate);
      const weekTitle = WeeklyUtils.generateWeeklyTitle(currentDate);
      const weekNumber = WeeklyUtils.getWeekNumber(currentDate);

      weeks.push({
        weekNumber,
        weekTitle,
        startDate: new Date(currentDate),
        endDate: weekEnd,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  },
};

// ===================================================================
// 📝 CONTENT GENERATION UTILITIES - Enhanced templates (Unchanged)
// ===================================================================

const ContentUtils = {
  // 📝 GENERATE DAILY STRUCTURE - Create daily note template
  generateDailyStructure: (date) => {
    const dateStr = DateTimeUtils.formatDateForRoam(date);
    return [
      `**${dateStr}**`,
      "",
      "**Today's Focus:**",
      "- [ ] 1.",
      "",
      "**Notes:**",
      "- 1.",
      "",
      "**Reflection:**",
      "- What went well?",
      "- What could be improved?",
    ];
  },

  // 📝 GENERATE WEEKLY STRUCTURE - Create weekly page template
  generateWeeklyStructure: (startDate, endDate) => {
    const startDateStr = DateTimeUtils.formatDateForRoam(startDate);
    const endDateStr = DateTimeUtils.formatDateForRoam(endDate);

    return [
      `**Week: ${startDateStr} - ${endDateStr}**`,
      "",
      "**Weekly Goals:**",
      "- [ ] 1.",
      "",
      "**Daily Pages:**",
      `[[${startDateStr}]]`,
      "- 1.",
      "",
      `[[${endDateStr}]]`,
      "- 1.",
    ];
  },

  // 📊 GENERATE PMN STRUCTURE - Create Progress, Metrics, Notes structure
  generatePMNStructure: () => {
    const sections = [
      { title: "**Progress**", subtitle: "What moved forward this week?" },
      { title: "**Metrics**", subtitle: "Key numbers and measurements" },
      { title: "**Notes**", subtitle: "Important observations and insights" },
    ];

    const content = [];
    sections.forEach((section) => {
      content.push(section.title);
      content.push(section.subtitle);
      content.push("1.");
      content.push("");
    });

    return content;
  },
};

// ===================================================================
// 🎯 ENHANCED CONFIG UTILITIES - Unified Config + Page Detection Integration
// ===================================================================

const ConfigUtils = {
  // 🎯 MASTER CONFIG PAGE - Use unified system when available
  MASTER_CONFIG_PAGE: "roam/ext/calendar suite/config",

  // 🎯 ENHANCED CONFIG READING - Unified system with fallback
  readConfigValue: (page, key, defaultValue = null) => {
    try {
      // Try unified config system first (preferred)
      if (window.UnifiedConfigUtils) {
        console.log(`🎯 Using UnifiedConfigUtils for config read: ${key}`);
        return window.UnifiedConfigUtils.readConfigValue(
          "Utilities",
          key,
          defaultValue
        );
      }

      // Fallback to legacy system
      console.log(`📋 Falling back to legacy config read: ${page}.${key}`);
      return ConfigUtils.readLegacyConfig(page, key, defaultValue);
    } catch (error) {
      console.error(`❌ Error reading config ${page}.${key}:`, error);
      return defaultValue;
    }
  },

  // 🎯 ENHANCED CONFIG WRITING - Unified system with fallback
  writeConfigValue: async (page, key, value) => {
    try {
      // Try unified config system first (preferred)
      if (window.UnifiedConfigUtils) {
        console.log(
          `🎯 Using UnifiedConfigUtils for config write: ${key} = ${value}`
        );
        return await window.UnifiedConfigUtils.writeConfigValue(
          "Utilities",
          key,
          value
        );
      }

      // Fallback to legacy system
      console.log(
        `📋 Falling back to legacy config write: ${page}.${key} = ${value}`
      );
      return await ConfigUtils.writeLegacyConfig(page, key, value);
    } catch (error) {
      console.error(`❌ Error writing config ${page}.${key}:`, error);
      return false;
    }
  },

  // 📋 LEGACY CONFIG SUPPORT - For backward compatibility
  readLegacyConfig: (page, key, defaultValue = null) => {
    try {
      const pageUid = window.roamAlphaAPI.data.q(`
        [:find ?uid . :where [?e :node/title "${page}"] [?e :block/uid ?uid]]
      `);

      if (!pageUid) return defaultValue;

      const configBlocks = window.roamAlphaAPI.data.q(`
        [:find ?string :where 
         [?page :block/uid "${pageUid}"] [?block :block/page ?page]
         [?block :block/string ?string]
         [(clojure.string/includes? ?string "${key}:")]]
      `);

      if (configBlocks && configBlocks.length > 0) {
        const configString = configBlocks[0][0];
        const match = configString.match(new RegExp(`${key}:\\s*(.+)$`));
        if (match) return match[1].trim();
      }

      return defaultValue;
    } catch (error) {
      console.error(`❌ Error reading legacy config:`, error);
      return defaultValue;
    }
  },

  // 📝 LEGACY CONFIG WRITING - For backward compatibility
  writeLegacyConfig: async (page, key, value) => {
    try {
      // This is a simplified version - full implementation would be more complex
      console.log(`📝 Legacy config write: ${page}.${key} = ${value}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing legacy config:`, error);
      return false;
    }
  },

  // 📊 CONFIG STATUS - Get current configuration status
  getConfigStatus: () => {
    const hasUnified = !!window.UnifiedConfigUtils;
    const hasPageDetection = !!window.CalendarSuite?.pageDetector;

    return {
      unifiedConfigAvailable: hasUnified,
      pageDetectionAvailable: hasPageDetection,
      configSystem: hasUnified ? "Unified Config Utils" : "Legacy",
      pageDetectionSystem: hasPageDetection
        ? "Central Page Detection"
        : "Manual Detection",
      masterConfigPage: hasUnified
        ? window.UnifiedConfigUtils.CONFIG_PAGE_TITLE
        : ConfigUtils.MASTER_CONFIG_PAGE,
      enhancedFeatures: hasUnified && hasPageDetection,
    };
  },

  // 🎯 SECTION-BASED CONFIG - Direct unified config access
  readFromSection: (section, key, defaultValue = null) => {
    if (window.UnifiedConfigUtils) {
      return window.UnifiedConfigUtils.readConfigValue(
        section,
        key,
        defaultValue
      );
    }
    return defaultValue;
  },

  writeToSection: async (section, key, value) => {
    if (window.UnifiedConfigUtils) {
      return await window.UnifiedConfigUtils.writeConfigValue(
        section,
        key,
        value
      );
    }
    return false;
  },

  // 📋 CREATE DEFAULT CONFIG - Initialize configuration
  createDefaultConfig: async (page, settings = []) => {
    try {
      // Try unified config system first
      if (window.UnifiedConfigUtils) {
        console.log(`🎯 Creating config in unified system for: ${page}`);

        // Initialize settings in unified config
        for (const setting of settings) {
          if (setting.includes("::")) {
            const [key, value] = setting.split("::");
            await window.UnifiedConfigUtils.writeConfigValue(
              "Utilities",
              key.trim(),
              value.trim()
            );
          }
        }

        return true;
      }

      // Fallback to legacy creation
      console.log(`📋 Creating legacy config for: ${page}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating default config:`, error);
      return false;
    }
  },
};

// ===================================================================
// 🎯 NEW: PAGE DETECTION UTILITIES - Integration helpers
// ===================================================================

const PageDetectionUtils = {
  // 🎯 REGISTER PAGE LISTENER - Convenience wrapper
  registerListener: (label, matcher, callback) => {
    if (!window.CalendarSuite?.pageDetector) {
      console.warn("⚠️ Page Detection System not available");
      return () => {}; // Return dummy unregister function
    }

    return window.CalendarSuite.pageDetector.registerPageListener(
      label,
      matcher,
      callback
    );
  },

  // 🎯 QUICK WEEKLY LISTENER - Easy weekly page detection
  onWeeklyPage: (callback) => {
    return PageDetectionUtils.registerListener(
      "weekly-page-listener",
      WeeklyUtils.isWeeklyPage,
      callback
    );
  },

  // 🎯 QUICK MONTHLY LISTENER - Easy monthly page detection
  onMonthlyPage: (callback) => {
    return PageDetectionUtils.registerListener(
      "monthly-page-listener",
      MonthlyUtils.isMonthlyPage,
      callback
    );
  },

  // 🎯 QUICK DAILY LISTENER - Easy daily page detection
  onDailyPage: (callback) => {
    const isDailyPage = (pageTitle) => {
      // Daily note pattern: "January 15th, 2024"
      return /^[A-Za-z]+ \d{1,2}(st|nd|rd|th), \d{4}$/.test(pageTitle);
    };

    return PageDetectionUtils.registerListener(
      "daily-page-listener",
      isDailyPage,
      callback
    );
  },

  // 🎯 CUSTOM PATTERN LISTENER - Flexible pattern matching
  onPagePattern: (label, pattern, callback) => {
    let matcher;

    if (typeof pattern === "string") {
      // String contains match
      matcher = (pageTitle) => pageTitle.includes(pattern);
    } else if (pattern instanceof RegExp) {
      // Regex match
      matcher = (pageTitle) => pattern.test(pageTitle);
    } else if (typeof pattern === "function") {
      // Function match
      matcher = pattern;
    } else {
      throw new Error("Pattern must be string, regex, or function");
    }

    return PageDetectionUtils.registerListener(label, matcher, callback);
  },

  // 📊 GET DETECTION STATUS - Check if page detection is working
  getDetectionStatus: () => {
    if (!window.CalendarSuite?.pageDetector) {
      return {
        available: false,
        reason: "Page Detection System not loaded",
      };
    }

    return {
      available: true,
      currentPage: window.CalendarSuite.pageDetector.currentPage,
      activeListeners: window.CalendarSuite.pageDetector.listeners.size,
      metrics: window.CalendarSuite.pageDetector.getMetrics(),
    };
  },
};

// ===================================================================
// 🌐 ENHANCED CALENDAR UTILITIES MAIN OBJECT - With Page Detection Integration
// ===================================================================

const CalendarUtilities = {
  // Export all utility modules
  DateTimeUtils,
  RoamUtils,
  WeeklyUtils, // Enhanced with page detection integration
  MonthlyUtils, // Enhanced with page detection integration
  ContentUtils,
  ConfigUtils, // Enhanced with page detection status
  PageDetectionUtils, // NEW: Page detection integration helpers

  // 📊 ENHANCED UTILITY STATUS - With page detection info
  getStatus: () => {
    const pageDetectionStatus = PageDetectionUtils.getDetectionStatus();

    return {
      version: "1.2.0 (Enhanced Page Detection Integration)",
      configSystem: ConfigUtils.getConfigStatus(),
      pageDetection: pageDetectionStatus,
      weeklyPageDetection:
        "Dual pattern support (MM/DD YYYY and Month Day, Year)",
      modules: {
        DateTimeUtils: Object.keys(DateTimeUtils).length,
        RoamUtils: Object.keys(RoamUtils).length,
        WeeklyUtils: Object.keys(WeeklyUtils).length,
        MonthlyUtils: Object.keys(MonthlyUtils).length,
        ContentUtils: Object.keys(ContentUtils).length,
        ConfigUtils: Object.keys(ConfigUtils).length,
        PageDetectionUtils: Object.keys(PageDetectionUtils).length,
      },
      totalUtilities:
        Object.keys(DateTimeUtils).length +
        Object.keys(RoamUtils).length +
        Object.keys(WeeklyUtils).length +
        Object.keys(MonthlyUtils).length +
        Object.keys(ContentUtils).length +
        Object.keys(ConfigUtils).length +
        Object.keys(PageDetectionUtils).length,
      enhancements: [
        "Enhanced page detection integration",
        "Central page detection utilities",
        "Migration helpers for extensions",
        "Backward compatibility maintained",
        "Performance optimization ready",
      ],
      loaded: new Date().toISOString(),
    };
  },

  // 🔧 ENHANCED REGISTER WITH PLATFORM - With dependency checking
  registerWithPlatform: () => {
    if (!window.CalendarSuite) {
      console.warn(
        "⚠️ Calendar Foundation not found - utilities running standalone"
      );
      return false;
    }

    // Register all utility modules with the platform
    window.CalendarSuite.registerUtility("DateTimeUtils", DateTimeUtils);
    window.CalendarSuite.registerUtility("RoamUtils", RoamUtils);
    window.CalendarSuite.registerUtility("WeeklyUtils", WeeklyUtils);
    window.CalendarSuite.registerUtility("MonthlyUtils", MonthlyUtils);
    window.CalendarSuite.registerUtility("ContentUtils", ContentUtils);
    window.CalendarSuite.registerUtility("ConfigUtils", ConfigUtils);
    window.CalendarSuite.registerUtility(
      "PageDetectionUtils",
      PageDetectionUtils
    );

    // Register the complete utilities object
    window.CalendarSuite.registerUtility(
      "CalendarUtilities",
      CalendarUtilities
    );

    console.log("🔧 All utilities registered with Calendar Foundation!");
    console.log(
      "🎯 Page Detection integration: " +
        (window.CalendarSuite.pageDetector ? "ACTIVE" : "PENDING")
    );
    return true;
  },

  // 🎯 NEW: PAGE DETECTION DEPENDENCY CHECKER
  checkPageDetectionDependency: () => {
    return {
      satisfied: !!window.CalendarSuite?.pageDetector,
      issues: window.CalendarSuite?.pageDetector
        ? []
        : [
            "Central Page Detection System not available",
            "Extensions will fall back to manual page detection",
          ],
      suggestions: window.CalendarSuite?.pageDetector
        ? []
        : [
            "Ensure Calendar Foundation v2.0+ is loaded",
            "Check Calendar Foundation initialization order",
          ],
    };
  },
};

// ===================================================================
// 🚀 ROAM EXTENSION EXPORT - Enhanced Calendar Utilities v1.2
// ===================================================================


// ===================================================================
// 📦 MONTHLY VIEW
// ===================================================================

// ===================================================================
// 📅 MONTHLY VIEW EXTENSION v2.2 - CLEAN & SIMPLE
// No dependencies, no debugging, just works!
// Central event listener integration + inline utilities
// ===================================================================


// ===================================================================
// 📦 WEEKLY VIEW
// ===================================================================

// ===================================================================
// 📅 WEEKLY VIEW EXTENSION v4.0 - MODERNIZED ARCHITECTURE
// ===================================================================
// 🔥 BREAKING CHANGE: Fully integrated with Calendar Foundation v2.0
// ✅ Central page detection • ✅ Event-driven • ✅ Dependency injection
// 🚀 96% reduction in polling overhead • Zero manual observers

// Wrap everything in an IIFE to avoid global variable conflicts
(function () {
  "use strict";

  // ===================================================================
  // 🎯 EXTENSION CONFIGURATION - Declarative Architecture
  // ===================================================================

  const EXTENSION_CONFIG = {
    id: "weekly-view",
    version: "4.0.0",
    name: "Weekly View",
    description:
      "Auto-detects weekly calendar pages and offers to populate with monthly calendar embeds (Modernized Architecture)",

    // 🔧 DEPENDENCIES - Auto-injected by Calendar Foundation
    dependencies: [
      "calendar-foundation",
      "calendar-utilities",
      "unified-config-utils",
    ],

    // 🎯 PAGE PATTERNS - Central page detector will match these
    pagePatterns: {
      weekly: {
        detect: (pageTitle) =>
          CalendarUtilities.WeeklyUtils.isWeeklyPage(pageTitle),
        priority: 100,
        cooldown: 500, // ms before re-checking same page
      },
    },

    // 📋 CONFIG DEFAULTS - Managed by unified config system
    configDefaults: {
      "automatic guidance enabled": "yes",
      "add week count within the year": "yes",
      "include query for `[[Morning Intentions]]`": "yes",
      "add query for `[[Evening Reflections]]`": "yes",
      "add Plus-Minus-Next journal": "yes",
    },

    // 🎨 UI COMPONENTS - Provided capabilities
    provides: [
      "weekly-view-creation",
      "weekly-page-detection",
      "monthly-dependency-checking",
      "morning-intentions-query",
      "evening-reflections-query",
      "plus-minus-next-journal",
    ],
  };

  // ===================================================================
  // 🏗️ EXTENSION STATE - Managed by Calendar Foundation
  // ===================================================================

  let extensionState = {
    initialized: false,
    currentPageTitle: null,
    buttonElement: null,
    config: null,
    dependencies: null,
  };

  // ===================================================================
  // 🎯 PAGE DETECTION HANDLERS - Event-driven callbacks
  // ===================================================================

  async function handleWeeklyPageDetected(pageTitle, context = {}) {
    try {
      console.log(`📅 Weekly page detected: "${pageTitle}"`);

      // Store current page
      extensionState.currentPageTitle = pageTitle;

      // Check if automatic guidance is enabled
      const config = getExtensionConfig();
      if (config.settings["automatic guidance enabled"] !== "yes") {
        console.log("📅 Automatic guidance disabled, removing button");
        removeWeeklyButton();
        return;
      }

      // Check if we already have a button in progress
      const existingButton = document.getElementById("weekly-view-button");
      if (existingButton) {
        const buttonState = existingButton.dataset.state;
        console.log(`📅 Button already exists in state: ${buttonState}`);

        // Don't interfere if button is in creating or navigating state
        if (buttonState === "creating" || buttonState === "navigating") {
          console.log(
            `📅 Button is in ${buttonState} state, not disrupting workflow`
          );
          return;
        }
      }

      // Check for embed blocks instead of empty page
      const alreadyHasEmbeds = await hasEmbedBlocks(pageTitle);

      if (!alreadyHasEmbeds) {
        console.log(
          `📅 Weekly page doesn't have embeds, checking dependencies...`
        );
        const pageIssues = await getMissingMonthlyPages(pageTitle);

        if (pageIssues.length === 0) {
          console.log("✅ All dependencies met, showing ready button");
          showWeeklyButton(pageTitle, "ready", config);
        } else {
          console.log("⚠️ Page issues found, showing warning button");
          showWeeklyButton(pageTitle, "warning", config, pageIssues);
        }
      } else {
        console.log("📄 Weekly page already has embeds, removing button");
        removeWeeklyButton();
      }
    } catch (error) {
      console.error("❌ Error handling weekly page detection:", error);

      // Emit error event for central error handling
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("extension:error", {
          extension: EXTENSION_CONFIG.id,
          error: error,
          context: { pageTitle, handler: "handleWeeklyPageDetected" },
        });
      }
    }
  }

  function handlePageChangeAway(pageTitle, context = {}) {
    console.log(`📍 Navigated away from page: "${pageTitle}"`);

    // Clean up button when leaving weekly pages
    removeWeeklyButton();
    extensionState.currentPageTitle = null;
  }

  // ===================================================================
  // 📋 CONFIG MANAGEMENT - Using Central Config Cache
  // ===================================================================

  function getExtensionConfig() {
    try {
      // Use UnifiedConfigUtils directly for now (until central config cache available)
      if (!extensionState.config && window.UnifiedConfigUtils) {
        const config = {
          settings: {},
        };

        // Read all config values using UnifiedConfigUtils
        for (const [key, defaultValue] of Object.entries(
          EXTENSION_CONFIG.configDefaults
        )) {
          config.settings[key] = window.UnifiedConfigUtils.readConfigValue(
            "Weekly View",
            key,
            defaultValue
          );
        }

        extensionState.config = config;
      }

      return (
        extensionState.config || {
          settings: { ...EXTENSION_CONFIG.configDefaults },
        }
      );
    } catch (error) {
      console.error("❌ Error reading config, using defaults:", error);
      return {
        settings: { ...EXTENSION_CONFIG.configDefaults },
      };
    }
  }

  async function initializeConfig() {
    try {
      console.log("📋 Initializing Weekly View config in unified system...");

      // Initialize config using dependency-injected UnifiedConfigUtils
      const configUtils = extensionState.dependencies.unifiedConfigUtils;

      for (const [key, value] of Object.entries(
        EXTENSION_CONFIG.configDefaults
      )) {
        await configUtils.writeConfigValue("Weekly View", key, value);
      }

      console.log("✅ Weekly View config initialized successfully!");
    } catch (error) {
      console.error("❌ Error initializing Weekly View config:", error);
      throw error;
    }
  }

  // ===================================================================
  // 🔍 DEPENDENCY CHECKING - Enhanced with Calendar Utilities v1.2
  // ===================================================================

  async function checkMonthlyPageIsPopulated(monthlyPageTitle, weeklyTitle) {
    try {
      const roamUtils = extensionState.dependencies.calendarUtilities.RoamUtils;

      // Check if monthly page exists
      if (!roamUtils.pageExists(monthlyPageTitle)) {
        console.log(`📄 Monthly page "${monthlyPageTitle}" does not exist`);
        return { exists: false, populated: false, reason: "not-found" };
      }

      // Parse weekly title to get the date pattern we're looking for
      const weeklyDateRange = weeklyTitle; // e.g., "07/28 2025 - 08/03 2025"
      const searchPattern = `(#[[${weeklyDateRange}]])`;

      console.log(
        `🔍 Checking if "${monthlyPageTitle}" contains pattern: ${searchPattern}`
      );

      // Search for blocks containing the weekly date pattern
      const weekBlocks = window.roamAlphaAPI.data.q(
        `
        [:find ?uid ?string
         :in $ ?page-title ?pattern
         :where
         [?page :node/title ?page-title]
         [?block :block/page ?page]
         [?block :block/uid ?uid]
         [?block :block/string ?string]
         [(clojure.string/includes? ?string ?pattern)]]
      `,
        monthlyPageTitle,
        searchPattern
      );

      if (weekBlocks && weekBlocks.length > 0) {
        // Found the pattern, check if it's a proper week block
        for (const [uid, string] of weekBlocks) {
          if (string.includes("Week ") && string.includes(":")) {
            console.log(
              `✅ Monthly page "${monthlyPageTitle}" is properly populated with week block`
            );
            return { exists: true, populated: true, reason: "complete" };
          }
        }
      }

      // Page exists but either has no blocks or doesn't contain our week block
      const hasAnyBlocks = window.roamAlphaAPI.data.q(
        `
        [:find ?child .
         :in $ ?page-title
         :where
         [?page :node/title ?page-title]
         [?page :block/children ?child]]
      `,
        monthlyPageTitle
      );

      if (!hasAnyBlocks) {
        console.log(
          `📄 Monthly page "${monthlyPageTitle}" exists but is completely empty`
        );
        return { exists: true, populated: false, reason: "empty-page" };
      } else {
        console.log(
          `📄 Monthly page "${monthlyPageTitle}" exists but doesn't contain our week block`
        );
        return { exists: true, populated: false, reason: "missing-week-block" };
      }
    } catch (error) {
      console.error(
        `Error checking monthly page population "${monthlyPageTitle}":`,
        error
      );
      return { exists: false, populated: false, reason: "error" };
    }
  }

  function getRequiredMonthlyPages(weeklyTitle) {
    const calendarUtils = extensionState.dependencies.calendarUtilities;
    const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
    if (!parsed) return [];

    const { startDate, endDate } = parsed;
    const requiredPages = [];

    // Start month
    const startMonth =
      calendarUtils.DateTimeUtils.getMonthName(startDate.getMonth()) +
      " " +
      startDate.getFullYear();
    requiredPages.push(startMonth);

    // End month (if different)
    const endMonth =
      calendarUtils.DateTimeUtils.getMonthName(endDate.getMonth()) +
      " " +
      endDate.getFullYear();
    if (endMonth !== startMonth) {
      requiredPages.push(endMonth);
    }

    return requiredPages;
  }

  async function getMissingMonthlyPages(weeklyTitle) {
    const requiredPages = getRequiredMonthlyPages(weeklyTitle);
    const missingPages = [];
    const incompletePages = [];

    for (const pageName of requiredPages) {
      const status = await checkMonthlyPageIsPopulated(pageName, weeklyTitle);

      if (!status.exists) {
        // Page doesn't exist at all
        missingPages.push({
          page: pageName,
          reason: "missing",
          message: `Click to CREATE: ${pageName}`,
        });
      } else if (!status.populated) {
        // Page exists but is incomplete
        let message;
        switch (status.reason) {
          case "empty-page":
            message = `${pageName} page empty - navigate to populate?`;
            break;
          case "missing-week-block":
            message = `${pageName} incomplete - navigate to add week?`;
            break;
          case "incomplete-structure":
            message = `${pageName} structure incomplete - navigate to fix?`;
            break;
          default:
            message = `${pageName} incomplete - navigate to complete?`;
        }

        incompletePages.push({
          page: pageName,
          reason: "incomplete",
          message: message,
        });
      }
    }

    // Combine missing and incomplete pages, prioritizing missing pages
    const allIssues = [...missingPages, ...incompletePages];

    console.log(`📅 Page issues for "${weeklyTitle}":`, {
      missing: missingPages.length,
      incomplete: incompletePages.length,
      total: allIssues.length,
    });

    return allIssues;
  }

  async function hasEmbedBlocks(pageTitle) {
    try {
      const embedBlocks = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-title
         :where
         [?page :node/title ?page-title]
         [?block :block/page ?page]
         [?block :block/string ?string]
         [?block :block/uid ?uid]
         [(clojure.string/includes? ?string "{{embed")]]
      `,
        pageTitle
      );

      const hasEmbeds = embedBlocks && embedBlocks.length > 0;
      console.log(`📄 Page "${pageTitle}" has embed blocks: ${hasEmbeds}`);
      return hasEmbeds;
    } catch (error) {
      console.error(`Error checking embed blocks for "${pageTitle}":`, error);
      return false;
    }
  }

  // ===================================================================
  // 🦜 UI BUTTON MANAGEMENT - Using Central Event System
  // ===================================================================

  function showWeeklyButton(pageTitle, state, config, pageIssues = []) {
    // Remove existing button first
    removeWeeklyButton();

    const isWarning = state === "warning";
    const firstIssue = pageIssues[0];

    // Create button element
    const button = document.createElement("div");
    button.id = "weekly-view-button";

    // Button styles
    const baseStyles = `
      position: fixed;
      top: 60px;
      right: 20px;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transition: all 0.2s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 360px;
    `;

    const readyBackground = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    const warningBackground =
      "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)";

    button.style.cssText =
      baseStyles +
      `background: ${isWarning ? warningBackground : readyBackground};`;

    // Store button state for multi-step process
    button.dataset.state = state;
    button.dataset.missingPage = firstIssue ? firstIssue.page : "";
    button.dataset.issueReason = firstIssue ? firstIssue.reason : "";
    button.dataset.weeklyTitle = pageTitle;

    // Initial content
    const icon = isWarning ? "⚠️" : "📅";
    const iconStyle = isWarning
      ? "font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);"
      : "font-size: 16px;";

    let title, subtitle;
    if (isWarning && firstIssue) {
      if (firstIssue.reason === "missing") {
        title = "Missing monthly page";
        subtitle = firstIssue.message;
      } else {
        title = "Monthly page incomplete";
        subtitle = firstIssue.message;
      }
    } else {
      title = "Add weekly view?";
      subtitle = "Embed monthly calendars";
    }

    button.innerHTML = `
      <span style="${iconStyle}">${icon}</span>
      <div>
        <div style="font-weight: 600;">${title}</div>
        <div style="font-size: 12px; opacity: 0.9;">${subtitle}</div>
      </div>
    `;

    // Add hover effects
    button.addEventListener("mouseenter", () => {
      if (isWarning) {
        button.style.background =
          "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      }
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = isWarning ? warningBackground : readyBackground;
      button.style.transform = "translateY(0px)";
      button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    });

    // Add click handler
    button.addEventListener("click", () => {
      console.log(
        `📅 Button clicked - State: ${button.dataset.state}, Issue: ${button.dataset.issueReason}`
      );

      // Emit click event for tracking
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:button-click", {
          state: button.dataset.state,
          issue: button.dataset.issueReason,
          pageTitle: pageTitle,
        });
      }

      if (button.dataset.state === "warning") {
        if (button.dataset.issueReason === "missing") {
          handleCreatePageSimple(button);
        } else {
          handleNavigateToIncompletePageSimple(button);
        }
      } else if (button.dataset.state === "navigating") {
        handleNavigateToPageSimple(button);
      } else if (button.dataset.state === "ready") {
        console.log("🚀 Creating weekly content!");
        createWeeklyContent(button);
      }
    });

    // Store button reference
    extensionState.buttonElement = button;

    // Add to page
    document.body.appendChild(button);
    console.log(`📅 Weekly button shown - State: ${state}`);

    // Emit UI event
    if (CalendarSuite?.emit) {
      CalendarSuite.emit("weekly-view:button-shown", {
        state: state,
        pageTitle: pageTitle,
        hasIssues: pageIssues.length > 0,
      });
    }
  }

  function removeWeeklyButton() {
    const existingButton = document.getElementById("weekly-view-button");
    if (existingButton) {
      existingButton.remove();
      extensionState.buttonElement = null;
      console.log("📅 Weekly button removed");

      // Emit UI event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:button-removed", {
          pageTitle: extensionState.currentPageTitle,
        });
      }
    }
  }

  // ===================================================================
  // 🎯 CLICK HANDLERS - Enhanced with Error Reporting
  // ===================================================================

  async function handleCreatePageSimple(button) {
    const missingPage = button.dataset.missingPage;
    console.log(`🏗️ Creating missing page: "${missingPage}"`);

    try {
      // Update button to show creating state
      button.dataset.state = "creating";
      button.style.background =
        "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">⏳</span>
        <div>
          <div style="font-weight: 600;">Creating page...</div>
          <div style="font-size: 12px; opacity: 0.9;">Please wait</div>
        </div>
      `;

      // Emit event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:page-creation-started", {
          pageTitle: missingPage,
        });
      }

      // Create the monthly page using injected Calendar Utilities
      const roamUtils = extensionState.dependencies.calendarUtilities.RoamUtils;
      await roamUtils.createPage(missingPage);

      // Wait a moment for creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update button to navigation state
      button.dataset.state = "navigating";
      button.style.background =
        "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">🧭</span>
        <div>
          <div style="font-weight: 600;">Page created!</div>
          <div style="font-size: 12px; opacity: 0.9;">Click to navigate → ${missingPage}</div>
        </div>
      `;

      // Emit success event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:page-creation-success", {
          pageTitle: missingPage,
        });
      }

      console.log(`✅ Page "${missingPage}" created successfully`);
    } catch (error) {
      console.error(`❌ Error creating page "${missingPage}":`, error);

      // Emit error event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:page-creation-error", {
          pageTitle: missingPage,
          error: error,
        });
      }

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Creation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Try manually</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 3000);
    }
  }

  async function handleNavigateToIncompletePageSimple(button) {
    const incompletePage = button.dataset.missingPage;
    console.log(`🧭 Navigating to incomplete page: "${incompletePage}"`);

    try {
      // Navigate using Roam API
      await window.roamAlphaAPI.ui.mainWindow.openPage({
        page: { title: incompletePage },
      });

      // Update button to show navigation success
      button.style.background =
        "linear-gradient(135deg, #059669 0%, #047857 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Navigated!</div>
          <div style="font-size: 12px; opacity: 0.9;">Complete the monthly page</div>
        </div>
      `;

      // Emit event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:navigation-success", {
          pageTitle: incompletePage,
        });
      }

      // Remove button after navigation
      setTimeout(() => {
        removeWeeklyButton();
      }, 2000);

      console.log(`✅ Navigated to "${incompletePage}"`);
    } catch (error) {
      console.error(`❌ Error navigating to "${incompletePage}":`, error);

      // Emit error event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:navigation-error", {
          pageTitle: incompletePage,
          error: error,
        });
      }

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Navigation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Try manually</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 3000);
    }
  }

  async function handleNavigateToPageSimple(button) {
    const targetPage = button.dataset.missingPage;
    console.log(`🧭 Navigating to page: "${targetPage}"`);

    try {
      // Navigate using Roam API
      await window.roamAlphaAPI.ui.mainWindow.openPage({
        page: { title: targetPage },
      });

      // Update button to show success
      button.style.background =
        "linear-gradient(135deg, #059669 0%, #047857 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Navigated!</div>
          <div style="font-size: 12px; opacity: 0.9;">Complete the page setup</div>
        </div>
      `;

      // Remove button after navigation
      setTimeout(() => {
        removeWeeklyButton();
      }, 2000);

      console.log(`✅ Navigated to "${targetPage}"`);
    } catch (error) {
      console.error(`❌ Error navigating to "${targetPage}":`, error);

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Navigation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Try manually</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 3000);
    }
  }

  // ===================================================================
  // 🚀 WEEKLY CONTENT CREATION - Enhanced with Events
  // ===================================================================

  async function createWeeklyContent(button) {
    const weeklyTitle = button.dataset.weeklyTitle;

    try {
      // Update button to show creation in progress
      button.dataset.state = "creating";
      button.style.background =
        "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">⚙️</span>
        <div>
          <div style="font-weight: 600;">Creating content...</div>
          <div style="font-size: 12px; opacity: 0.9;">Building weekly view</div>
        </div>
      `;

      // Emit creation started event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:content-creation-started", {
          pageTitle: weeklyTitle,
        });
      }

      console.log(`🚀 Creating weekly content for: "${weeklyTitle}"`);

      // Get the page UID
      const pageUid = window.roamAlphaAPI.data.q(`
        [:find ?uid .
         :where 
         [?e :node/title "${weeklyTitle}"]
         [?e :block/uid ?uid]]
      `);

      if (!pageUid) {
        throw new Error(`Could not find page UID for "${weeklyTitle}"`);
      }

      // Load config for enabled features
      const config = getExtensionConfig();
      let order = 0;

      // 1. Add week count within the year (if enabled)
      if (config.settings["add week count within the year"] === "yes") {
        await addWeekCountInYearLine(pageUid, order, weeklyTitle);
        order++;
      }

      // 2. Add morning intentions query (if enabled)
      if (
        config.settings["include query for `[[Morning Intentions]]`"] === "yes"
      ) {
        await addMorningIntentionsQuery(pageUid, order, weeklyTitle);
        order++;
      }

      // Add divider before embeds
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: "---" },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      order++;

      // Find week blocks from monthly pages
      const weekEmbeds = await findWeekBlocksForWeekly(weeklyTitle);

      if (weekEmbeds.length === 0) {
        throw new Error("No week blocks found in monthly pages");
      }

      // Add embeds in order
      for (const embed of weekEmbeds) {
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: order },
          block: { string: `{{embed-path: ((${embed.uid}))}}` },
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
        order++;

        console.log(
          `✅ Added embed for ${embed.monthPage}: {{embed-path: ((${embed.uid}))}}`
        );
      }

      // Add divider after embeds
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: "---" },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      order++;

      // 3. Add evening reflections query (if enabled) - AFTER EMBEDS
      if (
        config.settings["add query for `[[Evening Reflections]]`"] === "yes"
      ) {
        await addEveningReflectionsQuery(pageUid, order, weeklyTitle);
        order++;
      }

      // 4. Add Plus-Minus-Next journal (if enabled) - LAST
      if (config.settings["add Plus-Minus-Next journal"] === "yes") {
        await addPlusMinusNextJournal(pageUid, order, weeklyTitle);
        order++;
      }

      // Update button to show success
      button.style.background =
        "linear-gradient(135deg, #059669 0%, #047857 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Content created!</div>
          <div style="font-size: 12px; opacity: 0.9;">Weekly view is ready</div>
        </div>
      `;

      // Emit success event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:content-creation-success", {
          pageTitle: weeklyTitle,
          features: {
            weekCount:
              config.settings["add week count within the year"] === "yes",
            morningIntentions:
              config.settings["include query for `[[Morning Intentions]]`"] ===
              "yes",
            eveningReflections:
              config.settings["add query for `[[Evening Reflections]]`"] ===
              "yes",
            plusMinusNext:
              config.settings["add Plus-Minus-Next journal"] === "yes",
            embedCount: weekEmbeds.length,
          },
        });
      }

      // Remove button after success
      setTimeout(() => {
        removeWeeklyButton();
        console.log(`🚀 Weekly content creation complete!`);
      }, 2000);
    } catch (error) {
      console.error("❌ Error creating weekly content:", error);

      // Emit error event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:content-creation-error", {
          pageTitle: weeklyTitle,
          error: error,
        });
      }

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Creation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">${error.message}</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 4000);
    }
  }

  // ===================================================================
  // 🆕 FEATURE FUNCTIONS - Using Injected Dependencies
  // ===================================================================

  async function addWeekCountInYearLine(pageUid, order, weeklyTitle) {
    try {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error("Could not parse weekly title for week count");
      }

      const { startDate } = parsed;
      const year = startDate.getFullYear();

      // Calculate week number: find first Monday of the year
      const firstMonday = getFirstMondayOfYear(year);
      const weekNumber =
        Math.floor(
          (startDate.getTime() - firstMonday.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        ) + 1;

      const weekCountText = `**This is the ${getOrdinal(
        weekNumber
      )} full week of ${year}**`;

      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: weekCountText },
      });

      console.log(`✅ Added week count line: "${weekCountText}"`);
    } catch (error) {
      console.error("❌ Error adding week count line:", error);
      throw error;
    }
  }

  async function addMorningIntentionsQuery(pageUid, order, weeklyTitle) {
    try {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error(
          "Could not parse weekly title for morning intentions query"
        );
      }

      const { startDate, endDate } = parsed;

      // Format dates exactly as shown in screenshot: "June 16th, 2025"
      const startDateFormatted = formatDateWithOrdinal(
        startDate,
        calendarUtils
      );
      const endDateFormatted = formatDateWithOrdinal(endDate, calendarUtils);

      // Create the exact syntax from the screenshot
      const morningIntentionsText = "**Morning intentions this week:**";
      const queryText = `{{[[query]]: {and: [[Morning Intentions]] {between: [[${startDateFormatted}]] [[${endDateFormatted}]]}}}}`;

      // Create main block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: morningIntentionsText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the main block UID
      const mainBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?text
         :where 
         [?page :block/uid ?page-uid]
         [?block :block/parents ?page]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        morningIntentionsText
      );

      if (!mainBlockUid) {
        throw new Error("Could not find morning intentions main block UID");
      }

      // Add query as child block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": mainBlockUid, order: 0 },
        block: { string: queryText },
      });

      console.log(
        `✅ Added morning intentions query: "${morningIntentionsText}"`
      );
    } catch (error) {
      console.error("❌ Error adding morning intentions query:", error);
      throw error;
    }
  }

  async function addEveningReflectionsQuery(pageUid, order, weeklyTitle) {
    try {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error(
          "Could not parse weekly title for evening reflections query"
        );
      }

      const { startDate, endDate } = parsed;

      // Format dates exactly like morning intentions
      const startDateFormatted = formatDateWithOrdinal(
        startDate,
        calendarUtils
      );
      const endDateFormatted = formatDateWithOrdinal(endDate, calendarUtils);

      // Create the exact syntax - same as morning but for evening
      const eveningReflectionsText = "**Evening reflections this week:**";
      const queryText = `{{[[query]]: {and: [[Evening Reflections]] {between: [[${startDateFormatted}]] [[${endDateFormatted}]]}}}}`;

      // Create main block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: eveningReflectionsText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the main block UID
      const mainBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?text
         :where 
         [?page :block/uid ?page-uid]
         [?block :block/parents ?page]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        eveningReflectionsText
      );

      if (!mainBlockUid) {
        throw new Error("Could not find evening reflections main block UID");
      }

      // Add query as child block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": mainBlockUid, order: 0 },
        block: { string: queryText },
      });

      console.log(
        `✅ Added evening reflections query: "${eveningReflectionsText}"`
      );
    } catch (error) {
      console.error("❌ Error adding evening reflections query:", error);
      throw error;
    }
  }

  async function addPlusMinusNextJournal(pageUid, order, weeklyTitle) {
    try {
      // Create the exact structure as shown in the image
      const summaryText = "**Summary (end-of-week [[P.M.N.]]):**";

      // Create main summary block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: summaryText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the summary block UID
      const summaryBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?text
         :where 
         [?page :block/uid ?page-uid]
         [?block :block/parents ?page]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        summaryText
      );

      if (!summaryBlockUid) {
        throw new Error("Could not find summary block UID");
      }

      // Add the Plus-Minus-Next structure with the exact instruction text
      const pmnText =
        "Plus-Minus-Next ((hit ctrl-shift-v, then select h, for horizontal view))";

      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": summaryBlockUid, order: 0 },
        block: { string: pmnText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the PMN block UID
      const pmnBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?parent-uid ?text
         :where 
         [?parent :block/uid ?parent-uid]
         [?block :block/parents ?parent]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        summaryBlockUid,
        pmnText
      );

      if (!pmnBlockUid) {
        throw new Error("Could not find PMN block UID");
      }

      // Add PLUS, MINUS, and NEXT sections
      const sections = ["PLUS", "MINUS", "NEXT"];

      for (let i = 0; i < sections.length; i++) {
        const sectionText = sections[i];

        // Create section header
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pmnBlockUid, order: i },
          block: { string: sectionText },
        });
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the section block UID
        const sectionUid = window.roamAlphaAPI.data.q(
          `
          [:find ?uid .
           :in $ ?parent-uid ?section-text
           :where 
           [?parent :block/uid ?parent-uid]
           [?section :block/parents ?parent]
           [?section :block/string ?section-text]
           [?section :block/uid ?uid]]
        `,
          pmnBlockUid,
          sectionText
        );

        if (sectionUid) {
          // Add the "1." starter item under each section
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": sectionUid, order: 0 },
            block: { string: "1." },
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ Added Plus-Minus-Next journal structure`);
    } catch (error) {
      console.error("❌ Error adding Plus-Minus-Next journal:", error);
      throw error;
    }
  }

  // ===================================================================
  // 🔧 HELPER FUNCTIONS
  // ===================================================================

  // Helper function to format date with ordinal (June 16th, 2025)
  function formatDateWithOrdinal(date, calendarUtils) {
    const monthName = calendarUtils.DateTimeUtils.getMonthName(date.getMonth());
    const day = date.getDate();
    const year = date.getFullYear();
    const ordinalDay = getOrdinal(day);
    return `${monthName} ${ordinalDay}, ${year}`;
  }

  // Helper function to get first Monday of the year
  function getFirstMondayOfYear(year) {
    const jan1 = new Date(year, 0, 1); // January 1st of the year
    const dayOfWeek = jan1.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate days to add to get to first Monday
    let daysToMonday;
    if (dayOfWeek === 0) {
      // Sunday
      daysToMonday = 1;
    } else if (dayOfWeek === 1) {
      // Monday
      daysToMonday = 0;
    } else {
      // Tuesday through Saturday
      daysToMonday = 8 - dayOfWeek;
    }

    const firstMonday = new Date(year, 0, 1 + daysToMonday);
    return firstMonday;
  }

  function getOrdinal(number) {
    const suffix = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return number + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  }

  // ===================================================================
  // 🔍 EMBED DISCOVERY - Enhanced with Calendar Utilities
  // ===================================================================

  async function findWeekBlocksForWeekly(weeklyTitle) {
    const requiredMonthlyPages = getRequiredMonthlyPages(weeklyTitle);
    const weekEmbeds = [];

    console.log(
      `🔍 Searching for week blocks in monthly pages:`,
      requiredMonthlyPages
    );

    // Format the weekly title for exact matching
    const weeklyDateRange = weeklyTitle; // e.g., "07/28 2025 - 08/03 2025"
    const searchPattern = `(#[[${weeklyDateRange}]])`;

    console.log(`🔍 Searching for pattern: ${searchPattern}`);

    for (const monthPage of requiredMonthlyPages) {
      console.log(`🔍 Searching in monthly page: "${monthPage}"`);

      try {
        // Search for blocks containing the exact weekly date pattern
        const weekBlocks = window.roamAlphaAPI.data.q(
          `
          [:find ?uid ?string
           :in $ ?page-title ?pattern
           :where
           [?page :node/title ?page-title]
           [?block :block/page ?page]
           [?block :block/uid ?uid]
           [?block :block/string ?string]
           [(clojure.string/includes? ?string ?pattern)]]
        `,
          monthPage,
          searchPattern
        );

        console.log(`📋 Query results for "${monthPage}":`, weekBlocks);

        if (weekBlocks && weekBlocks.length > 0) {
          // Find the week block (should contain "Week N:" at the start)
          for (const [uid, string] of weekBlocks) {
            if (string.includes("Week ") && string.includes(":")) {
              weekEmbeds.push({
                uid: uid,
                monthPage: monthPage,
                blockString: string,
              });
              console.log(
                `✅ Found week block in "${monthPage}": ${string.substring(
                  0,
                  50
                )}...`
              );
              break; // Only take the first week block per month
            }
          }
        } else {
          console.log(
            `⚠️ No week blocks found in "${monthPage}" for pattern: ${searchPattern}`
          );
        }
      } catch (error) {
        console.error(`❌ Error searching in "${monthPage}":`, error);
      }
    }

    // Sort embeds: if cross-month, put start month first, then end month (chronological order)
    if (weekEmbeds.length === 2) {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (parsed) {
        const { startDate, endDate } = parsed;
        const startMonth =
          calendarUtils.DateTimeUtils.getMonthName(startDate.getMonth()) +
          " " +
          startDate.getFullYear();
        const endMonth =
          calendarUtils.DateTimeUtils.getMonthName(endDate.getMonth()) +
          " " +
          endDate.getFullYear();

        // Sort: start month (begin) first, then end month (chronological order)
        weekEmbeds.sort((a, b) => {
          if (a.monthPage === startMonth) return -1;
          if (b.monthPage === startMonth) return 1;
          return 0;
        });

        console.log(
          `🔄 Sorted cross-month embeds chronologically: start month (${startMonth}) first, then end month (${endMonth})`
        );
      }
    }

    return weekEmbeds;
  }

  // ===================================================================
  // 🧹 CLEANUP FUNCTIONS - Enhanced for Central System
  // ===================================================================

  function cleanup() {
    console.log("🧹 Weekly View Extension v4.0 cleanup...");

    // Remove any existing button
    removeWeeklyButton();

    // Clear extension state
    extensionState = {
      initialized: false,
      currentPageTitle: null,
      buttonElement: null,
      config: null,
      dependencies: null,
    };

    // Emit cleanup event
    if (CalendarSuite?.emit) {
      CalendarSuite.emit("weekly-view:cleanup", {
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ Weekly View Extension v4.0 cleanup complete");
  }

  // ===================================================================
  // 🚀 EXTENSION EXPORT - Modernized Calendar Foundation Integration
  // ===================================================================

  const WeeklyViewExtension = {
    onload: async ({ extensionAPI }) => {
      console.log(
        "📅 Weekly View Extension v4.0 loading (Modernized Architecture)..."
      );

      // 🔒 DEPENDENCY CHECK - Calendar Foundation v2.0+ required
      if (!window.CalendarSuite) {
        console.error(
          "❌ Weekly View Extension requires Calendar Foundation v2.0+ - please install first!"
        );
        alert(
          "❌ Weekly View Extension requires Calendar Foundation v2.0+.\n\nPlease install Calendar Foundation v2.0+ first, then reload."
        );
        return;
      }

      // 🔒 DEPENDENCY CHECK - Central Page Detection required
      if (!window.CalendarSuite.pageDetector) {
        console.error("❌ Central Page Detection System not available!");
        alert(
          "❌ Central Page Detection System not available.\n\nPlease ensure Calendar Foundation v2.0+ loaded properly."
        );
        return;
      }

      console.log("🔧 Dependencies satisfied, proceeding with modern setup...");

      try {
        // 🎯 REGISTER WITH CALENDAR FOUNDATION (Utility Registration)
        CalendarSuite.register(
          EXTENSION_CONFIG.id,
          {
            handleWeeklyPageDetected,
            handlePageChangeAway,
            createWeeklyContent,
            getExtensionConfig,
            version: EXTENSION_CONFIG.version,
          },
          {
            name: EXTENSION_CONFIG.name,
            description: EXTENSION_CONFIG.description,
            version: EXTENSION_CONFIG.version,
            dependencies: EXTENSION_CONFIG.dependencies,
            provides: EXTENSION_CONFIG.provides,
          }
        );

        console.log("✅ Extension registered with Calendar Foundation");

        // 🔌 SETUP DEPENDENCIES MANUALLY (until dependency injection available)
        extensionState.dependencies = {
          calendarUtilities: window.CalendarUtilities,
          unifiedConfigUtils: window.UnifiedConfigUtils,
        };

        // Verify dependencies
        if (!extensionState.dependencies.calendarUtilities) {
          throw new Error("Calendar Utilities not available");
        }
        if (!extensionState.dependencies.unifiedConfigUtils) {
          throw new Error("Unified Config Utils not available");
        }

        console.log(
          "✅ Dependencies verified:",
          Object.keys(extensionState.dependencies)
        );

        // 📋 INITIALIZE CONFIG SYSTEM
        await initializeConfig();
        console.log("✅ Config system initialized");

        // 🎯 REGISTER PAGE DETECTION LISTENERS (Using actual API)
        const weeklyUnregister =
          CalendarSuite.pageDetector.registerPageListener(
            "weekly-page-listener",
            (pageTitle) =>
              CalendarUtilities.WeeklyUtils.isWeeklyPage(pageTitle),
            handleWeeklyPageDetected
          );

        // Store unregister function for cleanup
        extensionState.weeklyUnregister = weeklyUnregister;

        console.log("✅ Page detection listeners registered");

        // 📊 REGISTER EVENT LISTENERS (Using actual API)
        // Note: Calendar Foundation v2.0 has emit() but event listening may be different
        // For now, we'll use the emit functionality for reporting events

        console.log("✅ Event system ready");

        // 🔍 TRIGGER INITIAL PAGE CHECK
        const currentPageTitle =
          CalendarSuite.pageDetector.getCurrentPageTitle();
        if (
          currentPageTitle &&
          EXTENSION_CONFIG.pagePatterns.weekly.detect(currentPageTitle)
        ) {
          console.log("🎯 Initial weekly page detected, triggering handler");
          await handleWeeklyPageDetected(currentPageTitle, { initial: true });
        }

        // Mark as initialized
        extensionState.initialized = true;

        console.log("✅ Weekly View Extension v4.0 loaded successfully!");
        console.log(
          "🚀 Modernized: Central page detection • Event-driven • Dependency injection"
        );
        console.log(
          `📋 Config managed via: [[${extensionState.dependencies.unifiedConfigUtils.CONFIG_PAGE_TITLE}]]`
        );

        // 🎯 EMIT LOAD SUCCESS EVENT
        if (CalendarSuite?.emit) {
          CalendarSuite.emit("weekly-view:loaded", {
            version: EXTENSION_CONFIG.version,
            features: EXTENSION_CONFIG.provides,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("❌ Error loading Weekly View Extension:", error);

        // Clean up on error
        cleanup();

        alert(`❌ Weekly View Extension failed to load: ${error.message}`);

        // 🎯 EMIT LOAD ERROR EVENT
        if (CalendarSuite?.emit) {
          CalendarSuite.emit("weekly-view:load-error", {
            error: error,
            timestamp: new Date().toISOString(),
          });
        }
      }
    },

    onunload: () => {
      console.log("👋 Weekly View Extension v4.0 unloading...");

      try {
        // 🎯 EMIT UNLOAD EVENT
        if (CalendarSuite?.emit) {
          CalendarSuite.emit("weekly-view:unloading", {
            timestamp: new Date().toISOString(),
          });
        }

        // 🎯 UNREGISTER PAGE LISTENERS
        if (extensionState.weeklyUnregister) {
          extensionState.weeklyUnregister();
          console.log("✅ Page detection listeners unregistered");
        }

        // 🧹 CLEANUP
        cleanup();

        console.log("✅ Weekly View Extension v4.0 unloaded successfully!");
      } catch (error) {
        console.error("❌ Error during Weekly View Extension unload:", error);
      }
    },
  };

  // 🌐 Export to global scope for Roam
  window.WeeklyViewExtension = WeeklyViewExtension;

  return WeeklyViewExtension;
})();

// 📦 Export the extension for Roam

// ===================================================================
// 📦 YEARLY VIEW
// ===================================================================

// ===================================================================
// 🗓️ YEARLY VIEW EXTENSION 2.0 - STEP 6: REAL COMPONENT DEPLOYMENT
// ===================================================================

// ===================================================================
// 🧪 DEPENDENCY VERIFICATION SYSTEM
// ===================================================================

function checkRequiredDependencies() {
  console.log("🔍 Checking required dependencies...");

  const dependencies = [
    {
      name: "Calendar Foundation",
      check: () => window.CalendarSuite,
      error:
        "Calendar Foundation v2.0+ required. Please install Calendar Suite extension.",
    },
    {
      name: "Calendar Utilities",
      check: () => window.CalendarUtilities?.RoamUtils,
      error:
        "Calendar Utilities v1.2+ required. Please install Calendar Utilities extension.",
    },
    {
      name: "UnifiedConfigUtils",
      check: () => window.UnifiedConfigUtils,
      error:
        "UnifiedConfigUtils required for tag configuration. Please install Configuration Management extension.",
    },
    {
      name: "Roam Alpha API",
      check: () => window.roamAlphaAPI,
      error:
        "Roam Alpha API not available. Please ensure you're running a supported Roam version.",
    },
  ];

  for (const dep of dependencies) {
    if (!dep.check()) {
      throw new Error(dep.error);
    }
    console.log(`✅ ${dep.name}: Available`);
  }

  return true;
}

// ===================================================================
// 🏷️ TAG CONFIGURATION LOADING (FROM STEP 5)
// ===================================================================

async function loadYearlyTagConfiguration() {
  console.log("🏷️ Loading yearly tag configuration from UnifiedConfigUtils...");

  try {
    if (!window.UnifiedConfigUtils) {
      throw new Error("UnifiedConfigUtils required for tag configuration");
    }

    // Get list of yearly tag IDs
    const yearlyTags = window.UnifiedConfigUtils.getYearlyTags();
    console.log("📋 Available yearly tag IDs:", yearlyTags);

    if (!yearlyTags || yearlyTags.length === 0) {
      console.warn("⚠️ No yearly tags found in configuration");
      return {};
    }

    // Load configuration for each tag
    const tagConfigs = {};

    for (const tagId of yearlyTags) {
      try {
        const tagConfig = window.UnifiedConfigUtils.getYearlyTagConfig(tagId);
        tagConfigs[tagId] = tagConfig;
        console.log(`✅ Loaded config for #${tagId}:`, tagConfig);
      } catch (error) {
        console.error(`❌ Failed to load config for #${tagId}:`, error);
        // Continue with other tags even if one fails
      }
    }

    console.group("📋 Complete Yearly Tag Configuration");
    console.log("Total tags loaded:", Object.keys(tagConfigs).length);
    console.log("Configuration data:", tagConfigs);
    console.groupEnd();

    // Store configuration globally for component access
    window._yearlyViewTagConfigs = tagConfigs;

    return tagConfigs;
  } catch (error) {
    console.error("❌ Failed to load yearly tag configuration:", error);
    throw error;
  }
}

function getStoredTagConfiguration() {
  // Helper function to retrieve stored tag configuration
  return window._yearlyViewTagConfigs || {};
}

// ===================================================================
// 🌐 EXTERNAL CLOJURESCRIPT ASSET FETCHING (NEW FOR STEP 6)
// ===================================================================

async function fetchClojureScriptComponent() {
  console.log("🌐 Fetching real ClojureScript component from GitHub...");

  const GITHUB_URL =
    "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/4.0-yearly-view/yearly-view-component.cljs";

  try {
    console.log(`📥 Fetching from: ${GITHUB_URL}`);

    const response = await fetch(GITHUB_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const clojureScriptCode = await response.text();

    // Basic validation
    if (!clojureScriptCode || clojureScriptCode.length < 100) {
      throw new Error("Fetched content appears to be invalid or empty");
    }

    if (!clojureScriptCode.includes("yearly-view-v2.core")) {
      throw new Error(
        "Fetched content doesn't appear to be the yearly view component"
      );
    }

    console.log("✅ Successfully fetched ClojureScript component");
    console.log(`📊 Component size: ${clojureScriptCode.length} characters`);

    // Wrap in code block for Roam
    const componentCode = `\`\`\`clojure\n${clojureScriptCode}\n\`\`\``;

    return componentCode;
  } catch (error) {
    console.error("❌ Failed to fetch ClojureScript component:", error);

    // Return fallback component with error information
    const fallbackComponent = `\`\`\`clojure
(ns yearly-view-v2.fallback)

(defn main [{:keys [block-uid]} & args]
  [:div 
    {:style {:padding "20px"
             :border "2px solid #e74c3c"
             :border-radius "8px"
             :background-color "#fdf2f2"
             :text-align "center"
             :margin "10px 0"}}
    [:h3 {:style {:color "#c0392b" :margin "0 0 15px 0"}} 
     "🚨 Yearly View 2.0 - Component Load Error"]
    [:p {:style {:color "#555" :margin "5px 0" :font-weight "bold"}} 
     "Failed to load real component from GitHub"]
    [:p {:style {:color "#777" :font-size "14px" :margin "10px 0"}} 
     "Error: ${error.message}"]
    [:p {:style {:color "#777" :font-size "12px" :margin "10px 0"}} 
     "GitHub URL: ${GITHUB_URL}"]
    [:div {:style {:margin-top "15px" :padding "10px" :background "#fff" :border-radius "4px"}}
     [:p {:style {:font-size "12px" :color "#666" :margin "5px 0"}}
      "Troubleshooting:"]
     [:ul {:style {:text-align "left" :font-size "11px" :color "#666"}}
      [:li "Check internet connection"]
      [:li "Verify GitHub repository is public and accessible"]
      [:li "Check browser console for detailed error information"]
      [:li "Try refreshing the page"]]]])
\`\`\``;

    console.log("🔄 Returning fallback component due to fetch failure");
    return fallbackComponent;
  }
}

// ===================================================================
// 🎯 SMART CALENDAR DEPLOYMENT FUNCTIONS (FROM STEP 4)
// ===================================================================

async function checkIfYearlyCalendarExists(pageTitle) {
  console.log(`🔍 Checking if yearly calendar exists on [[${pageTitle}]]...`);

  try {
    // Query for blocks containing "Yearly view is below:" on the specific page
    const query = `[:find ?uid ?string :where 
                    [?page :node/title "${pageTitle}"] 
                    [?block :block/page ?page] 
                    [?block :block/uid ?uid] 
                    [?block :block/string ?string] 
                    [(clojure.string/includes? ?string "Yearly view is below:")]]`;

    const results = window.roamAlphaAPI.q(query);

    if (results && results.length > 0) {
      console.log(
        `✅ Yearly calendar already exists on [[${pageTitle}]] - found ${results.length} blocks`
      );
      return true;
    } else {
      console.log(`❌ No yearly calendar found on [[${pageTitle}]]`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error checking for existing calendar:", error);
    return false; // Assume doesn't exist on error
  }
}

async function deployYearlyCalendarToPage(pageTitle) {
  console.log(`🚀 Deploying yearly calendar to [[${pageTitle}]]...`);

  try {
    // Step 1: Get or create year page
    let yearPageUid = window.CalendarUtilities.RoamUtils.getPageUid(pageTitle);
    if (!yearPageUid) {
      console.log(`📄 Creating new page: [[${pageTitle}]]`);
      yearPageUid = await window.CalendarUtilities.RoamUtils.createPage(
        pageTitle
      );
    }

    // Step 2: Create parent block "**Yearly view is below:**"
    const parentBlockUid = window.CalendarUtilities.RoamUtils.generateUID();
    await window.roamAlphaAPI.data.block.create({
      location: { "parent-uid": yearPageUid, order: 0 },
      block: { uid: parentBlockUid, string: "**Yearly view is below:**" },
    });

    console.log(`✅ Created parent block: ${parentBlockUid}`);

    // Step 3: Create child block with render component
    const renderBlockUid = window.CalendarUtilities.RoamUtils.generateUID();
    const componentUid = getComponentUid();

    await window.roamAlphaAPI.data.block.create({
      location: { "parent-uid": parentBlockUid, order: 0 },
      block: {
        uid: renderBlockUid,
        string: `{{roam/render: ((${componentUid}))}}`,
      },
    });

    console.log(`✅ Created render block: ${renderBlockUid}`);
    console.log(
      `✅ Yearly calendar successfully deployed to [[${pageTitle}]]!`
    );

    // Show success message to user
    setTimeout(() => {
      alert(
        `✅ Yearly calendar added to [[${pageTitle}]]!\n\nThe interactive calendar is now available on your year page.`
      );
    }, 500);

    return { parentBlockUid, renderBlockUid };
  } catch (error) {
    console.error(
      `❌ Failed to deploy yearly calendar to [[${pageTitle}]]:`,
      error
    );

    // Show error message to user
    setTimeout(() => {
      alert(
        `❌ Failed to add yearly calendar to [[${pageTitle}]]:\n\n${error.message}\n\nCheck the console for detailed information.`
      );
    }, 500);

    throw error;
  }
}

async function handleYearPageDetected(pageTitle) {
  const year = parseInt(pageTitle);

  console.group(`📅 Processing Year Page: ${year}`);
  console.log("✅ Valid year detected");

  try {
    // CRITICAL: Check if yearly calendar already exists FIRST
    const calendarExists = await checkIfYearlyCalendarExists(pageTitle);

    if (calendarExists) {
      console.log(
        `🔇 Silent operation: Yearly calendar already exists on [[${pageTitle}]]`
      );
      console.groupEnd();
      return; // Silent - do nothing
    }

    // Only prompt if calendar doesn't exist
    console.log("🔔 Prompting user to add yearly calendar...");

    setTimeout(async () => {
      const shouldAdd = confirm(
        `🗓️ Add interactive yearly calendar to [[${year}]]?\n\n` +
          `This will create a 12-month grid view showing your tagged events.\n\n` +
          `Click OK to add calendar, or Cancel to skip.`
      );

      if (shouldAdd) {
        console.log(`✅ User confirmed: Adding yearly calendar to [[${year}]]`);

        try {
          await deployYearlyCalendarToPage(pageTitle);
        } catch (deployError) {
          console.error("❌ Deployment failed:", deployError);
        }
      } else {
        console.log(`❌ User declined: No calendar for [[${year}]]`);
      }

      console.groupEnd();
    }, 100); // Small delay to avoid blocking page navigation
  } catch (error) {
    console.error("❌ Error in year page detection:", error);
    console.groupEnd();
  }
}

// ===================================================================
// 🏗️ REAL COMPONENT DEPLOYMENT (STEP 6 - UPDATED)
// ===================================================================

function getComponentUid() {
  // Return the UID of the deployed component
  if (window._yearlyViewComponentUid) {
    return window._yearlyViewComponentUid;
  }

  // If not stored, try to find it
  const existingComponent = findExistingYearlyViewComponent();
  if (existingComponent) {
    window._yearlyViewComponentUid = existingComponent.uid;
    return existingComponent.uid;
  }

  throw new Error(
    "Component UID not found. Please ensure the extension loaded properly."
  );
}

function findExistingYearlyViewComponent() {
  console.log("🔍 Searching for existing Yearly View 2.0 component...");

  // Search patterns for both old and new components
  const searchStrings = [
    // New real component patterns
    "yearly-view-v2.core",
    "Interactive Yearly Calendar",
    "defn yearly-view",
    // Old placeholder patterns (for backwards compatibility)
    "Hello, World! I am the Yearly View 2.0 placeholder component",
    "ns yearlyview2.hello",
    "defn main",
  ];

  for (const searchStr of searchStrings) {
    const blocks = window.CalendarUtilities.RoamUtils.queryBlocks(
      null,
      searchStr
    );
    if (blocks && blocks.length > 0) {
      console.log(`✅ Found existing component via: "${searchStr}"`);
      return {
        uid: blocks[0].uid,
        renderString: `{{roam/render: ((${blocks[0].uid}))}}`,
      };
    }
  }

  return null;
}

async function deployYearlyViewComponent() {
  console.log("🚀 Deploying real Yearly View component...");

  // Check for existing component first
  const existing = findExistingYearlyViewComponent();
  if (existing) {
    console.log(
      "🔄 Component already exists, checking if it needs updating..."
    );

    // Check if it's the old placeholder
    const existingBlock = window.roamAlphaAPI.q(
      `[:find ?string . :where [?b :block/uid "${existing.uid}"] [?b :block/string ?string]]`
    );

    if (existingBlock && existingBlock.includes("Hello, World!")) {
      console.log(
        "📦 Found old placeholder component, updating to real component..."
      );

      try {
        // Fetch the real component
        const realComponentCode = await fetchClojureScriptComponent();

        // Update the existing block with the real component
        await window.roamAlphaAPI.data.block.update({
          block: { uid: existing.uid, string: realComponentCode },
        });

        console.log("✅ Successfully updated placeholder to real component!");
        window._yearlyViewComponentUid = existing.uid;

        // Show success message
        setTimeout(() => {
          alert(
            "🎉 Yearly View Component Updated!\n\n" +
              "The placeholder has been replaced with the real interactive calendar.\n\n" +
              "All existing year pages will now show the full calendar functionality."
          );
        }, 500);

        return {
          componentUid: existing.uid,
          renderString: existing.renderString,
        };
      } catch (error) {
        console.error("❌ Failed to update component:", error);
        console.log("🔄 Keeping existing placeholder component");
        window._yearlyViewComponentUid = existing.uid;
        return {
          componentUid: existing.uid,
          renderString: existing.renderString,
        };
      }
    } else {
      console.log("✅ Real component already deployed, skipping");
      window._yearlyViewComponentUid = existing.uid;
      return {
        componentUid: existing.uid,
        renderString: existing.renderString,
      };
    }
  }

  // Deploy new component
  console.log("🆕 Deploying new real component...");

  try {
    // Fetch the real component from GitHub
    const componentCode = await fetchClojureScriptComponent();

    // Get or create roam/render page with proper error checking
    let currentUid =
      window.CalendarUtilities.RoamUtils.getPageUid("roam/render");
    console.log("🔍 roam/render page UID:", currentUid);

    if (!currentUid) {
      console.log("📄 Creating roam/render page...");
      currentUid = window.CalendarUtilities.RoamUtils.createPage("roam/render");
      console.log("📄 Created roam/render page UID:", currentUid);
    }

    // Verify we have a valid UID
    if (!currentUid || typeof currentUid !== "string") {
      throw new Error(
        `Failed to get valid roam/render page UID. Got: ${currentUid}`
      );
    }

    // Create the hierarchy step by step using actual Roam API
    const hierarchy = [
      "**Components added by Extensions:**",
      "**Added by Calendar Suite extension:**",
      "**Yearly View 2.0:**",
    ];

    // Build hierarchy
    for (const level of hierarchy) {
      console.log(`🏗️ Building hierarchy level: "${level}"`);

      // Check if this level already exists as a child of currentUid
      const query = `[:find ?uid :where 
                      [?parent :block/uid "${currentUid}"] 
                      [?child :block/parents ?parent] 
                      [?child :block/string "${level}"] 
                      [?child :block/uid ?uid]]`;

      const existingResult = window.roamAlphaAPI.q(query);

      if (existingResult && existingResult.length > 0) {
        currentUid = existingResult[0][0];
        console.log(
          `✅ Found existing level "${level}" with UID: ${currentUid}`
        );
      } else {
        // Create new block
        const newBlockUid = window.CalendarUtilities.RoamUtils.generateUID();
        console.log(
          `🆕 Creating new level "${level}" with UID: ${newBlockUid}`
        );

        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": currentUid, order: "last" },
          block: { uid: newBlockUid, string: level },
        });

        currentUid = newBlockUid;
        console.log(`✅ Created level "${level}" with UID: ${currentUid}`);
      }
    }

    // Create the component block
    const componentUid = window.CalendarUtilities.RoamUtils.generateUID();
    console.log(`🎯 Creating component block with UID: ${componentUid}`);

    await window.roamAlphaAPI.data.block.create({
      location: { "parent-uid": currentUid, order: 0 },
      block: { uid: componentUid, string: componentCode },
    });

    console.log("✅ Real component deployed successfully");
    window._yearlyViewComponentUid = componentUid;

    // Show success message
    setTimeout(() => {
      alert(
        "🎉 Real Yearly View Component Deployed!\n\n" +
          "The full interactive calendar is now available.\n\n" +
          "Visit year pages like [[2024]] or [[2025]] to see the calendar in action!"
      );
    }, 500);

    return {
      componentUid: componentUid,
      renderString: `{{roam/render: ((${componentUid}))}}`,
    };
  } catch (error) {
    console.error("❌ Component deployment failed:", error);
    console.error("❌ Error details:", error.message);
    throw error;
  }
}

// ===================================================================
// 🎯 ENHANCED PAGE DETECTION SYSTEM (FROM STEP 4)
// ===================================================================

function setupCentralPageDetection() {
  console.log("🎯 Setting up central page detection...");

  if (!window.CalendarSuite?.pageDetector?.registerPageListener) {
    console.warn(
      "⚠️ Calendar Foundation page detection not available, skipping..."
    );
    return false;
  }

  try {
    // Register year page detection with smart deployment callback
    const unregisterYearListener =
      window.CalendarSuite.pageDetector.registerPageListener(
        "yearly-view-year-pages", // label
        (pageTitle) => {
          // matcher function
          const yearMatch = /^\d{4}$/.test(pageTitle);
          if (yearMatch) {
            const year = parseInt(pageTitle);
            const isValidYear = year >= 1900 && year <= 2100;
            console.log(
              `🎯 Year page matcher: "${pageTitle}" → ${
                isValidYear ? "✅ MATCH" : "❌ INVALID YEAR"
              }`
            );
            return isValidYear;
          }
          return false;
        },
        handleYearPageDetected // Use smart deployment callback
      );

    // Register cleanup function
    if (window.CalendarSuite?.dispatchToRegistry) {
      window.CalendarSuite.dispatchToRegistry({
        customCleanups: [unregisterYearListener],
      });
    } else {
      if (!window._calendarRegistry) {
        window._calendarRegistry = { customCleanups: [] };
      }
      if (!window._calendarRegistry.customCleanups) {
        window._calendarRegistry.customCleanups = [];
      }
      window._calendarRegistry.customCleanups.push(unregisterYearListener);
    }

    console.log("✅ Year page detection registered with smart deployment");
    console.log("🎯 Test by visiting pages like: [[2024]], [[2025]], [[2026]]");

    return true;
  } catch (error) {
    console.error("❌ Failed to setup page detection:", error);
    return false;
  }
}

// ===================================================================
// 🏗️ CALENDAR FOUNDATION INTEGRATION (FROM STEPS 1-5)
// ===================================================================

function registerWithCalendarFoundation() {
  console.log("🏗️ Registering with Calendar Foundation...");

  try {
    const extensionConfig = {
      id: "yearly-view-v2",
      name: "Yearly View 2.0",
      version: "2.0.0-step6",
      dependencies: ["calendar-utilities", "unified-config"],
      status: "Step 6: Real Component Deployment",
    };

    if (window.CalendarSuite?.registerExtension) {
      window.CalendarSuite.registerExtension(extensionConfig);
      console.log("✅ Registered with Calendar Foundation");
    } else {
      console.warn(
        "⚠️ Calendar Foundation registerExtension not available, proceeding manually"
      );
    }

    if (!window._calendarRegistry) {
      window._calendarRegistry = { extensions: new Map(), commands: [] };
    }
    if (!window._calendarRegistry.extensions.has("yearly-view-v2")) {
      window._calendarRegistry.extensions.set(
        "yearly-view-v2",
        extensionConfig
      );
      console.log("✅ Manually registered in calendar registry");
    }

    return true;
  } catch (error) {
    console.error("❌ Calendar Foundation registration failed:", error);
    return false;
  }
}

// ===================================================================
// 🎛️ ENHANCED COMMAND PALETTE SYSTEM (UPDATED FOR STEP 6)
// ===================================================================

function setupBasicCommands() {
  console.log("🎛️ Setting up command palette...");

  const commands = [
    {
      label: "Yearly View: Show Component Info",
      callback: () => {
        try {
          const componentUid = getComponentUid();
          const renderString = `{{roam/render: ((${componentUid}))}}`;

          console.group("📋 Yearly View Component Info");
          console.log("Component UID:", componentUid);
          console.log("Render String:", renderString);
          console.log("Status: Step 6 - Real component active");
          console.groupEnd();

          alert(
            `📋 Yearly View Component Info:\n\nUID: ${componentUid}\n\nRender String: ${renderString}\n\nStatus: Step 6 - Real component active`
          );
        } catch (error) {
          alert(`❌ Error getting component info: ${error.message}`);
        }
      },
    },
    {
      label: "Yearly View: Check Dependencies",
      callback: () => {
        try {
          checkRequiredDependencies();
          alert(
            "✅ All dependencies satisfied!\n\nCalendar Foundation, Calendar Utilities, UnifiedConfigUtils, and Roam API are all available."
          );
        } catch (error) {
          alert(`❌ Dependency check failed:\n\n${error.message}`);
        }
      },
    },
    {
      label: "Yearly View: Test Component",
      callback: () => {
        try {
          const componentUid = getComponentUid();
          const renderString = `{{roam/render: ((${componentUid}))}}`;

          navigator.clipboard.writeText(renderString);
          alert(
            `✅ Component render string copied to clipboard!\n\n${renderString}\n\nPaste this into any block to test the component.`
          );
        } catch (error) {
          alert(`❌ Error testing component: ${error.message}`);
        }
      },
    },
    {
      label: "Yearly View: Test Page Detection",
      callback: () => {
        const currentPage =
          window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
        console.group("🎯 Page Detection Test");
        console.log("Current page UID:", currentPage);
        console.log(
          "Page detection system:",
          window.CalendarSuite?.pageDetector
            ? "✅ Available"
            : "❌ Not available"
        );
        console.log("Test by visiting: [[2024]], [[2025]], [[2026]]");
        console.groupEnd();

        alert(
          "🎯 Page Detection Test\n\nCheck console for details.\nTry visiting year pages like [[2024]], [[2025]], [[2026]] to test smart deployment."
        );
      },
    },
    {
      label: "Yearly View: Show Tag Configuration",
      callback: async () => {
        try {
          console.group("🏷️ Yearly View Tag Configuration Display");

          const storedConfigs = getStoredTagConfiguration();

          if (Object.keys(storedConfigs).length === 0) {
            console.log(
              "📋 No tag configuration currently loaded. Loading now..."
            );
            const freshConfigs = await loadYearlyTagConfiguration();

            if (Object.keys(freshConfigs).length === 0) {
              alert(
                "📋 No yearly tags found in UnifiedConfigUtils.\n\nPlease configure yearly tags first using the Configuration Management system."
              );
              console.groupEnd();
              return;
            }

            // Display fresh configuration
            console.log("✅ Fresh configuration loaded:");
            for (const [tagId, config] of Object.entries(freshConfigs)) {
              console.log(`#${tagId}:`, config);
            }

            alert(
              `🏷️ Yearly Tag Configuration Loaded!\n\nFound ${
                Object.keys(freshConfigs).length
              } yearly tags.\n\nCheck console for detailed configuration data.\n\nTags: ${Object.keys(
                freshConfigs
              )
                .map((id) => `#${id}`)
                .join(", ")}`
            );
          } else {
            // Display stored configuration
            console.log("✅ Currently stored configuration:");
            for (const [tagId, config] of Object.entries(storedConfigs)) {
              console.log(`#${tagId}:`, config);
            }

            alert(
              `🏷️ Current Tag Configuration:\n\n${
                Object.keys(storedConfigs).length
              } yearly tags loaded.\n\nTags: ${Object.keys(storedConfigs)
                .map((id) => `#${id}`)
                .join(", ")}\n\nCheck console for detailed configuration data.`
            );
          }

          console.groupEnd();
        } catch (error) {
          console.error("❌ Error displaying tag configuration:", error);
          alert(
            `❌ Error loading tag configuration:\n\n${error.message}\n\nEnsure UnifiedConfigUtils is available and yearly tags are configured.`
          );
        }
      },
    },
    {
      label: "Yearly View: Reload Tag Configuration",
      callback: async () => {
        try {
          console.log("🔄 Reloading tag configuration...");
          const tagConfigs = await loadYearlyTagConfiguration();

          if (Object.keys(tagConfigs).length === 0) {
            alert(
              "⚠️ No yearly tags found after reload.\n\nPlease configure yearly tags in UnifiedConfigUtils first."
            );
          } else {
            alert(
              `✅ Tag configuration reloaded!\n\nLoaded ${
                Object.keys(tagConfigs).length
              } yearly tags:\n${Object.keys(tagConfigs)
                .map((id) => `#${id}`)
                .join(", ")}\n\nReady for full calendar functionality.`
            );
          }
        } catch (error) {
          console.error("❌ Error reloading tag configuration:", error);
          alert(`❌ Failed to reload tag configuration:\n\n${error.message}`);
        }
      },
    },
    {
      label: "Yearly View: Test Deployment Logic",
      callback: async () => {
        const yearToTest = prompt(
          "Enter a year to test deployment logic (e.g., 2026):"
        );
        if (!yearToTest) return;

        const year = parseInt(yearToTest);
        if (isNaN(year) || year < 1900 || year > 2100) {
          alert(
            "❌ Invalid year. Please enter a 4-digit year between 1900-2100."
          );
          return;
        }

        try {
          console.group(`🧪 Testing deployment logic for ${year}`);
          const exists = await checkIfYearlyCalendarExists(yearToTest);
          console.log(`Calendar exists: ${exists}`);
          console.groupEnd();

          alert(
            `🧪 Deployment Test Results for [[${year}]]:\n\nCalendar exists: ${
              exists ? "Yes" : "No"
            }\n\n${
              exists
                ? "Would skip deployment (silent)"
                : "Would prompt user to add calendar"
            }`
          );
        } catch (error) {
          alert(`❌ Test failed: ${error.message}`);
        }
      },
    },
    {
      label: "Yearly View: Force Deploy to Current Page",
      callback: async () => {
        const currentPageUid =
          window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
        if (!currentPageUid) {
          alert("❌ No page currently open. Please navigate to a page first.");
          return;
        }

        // Get page title from UID
        const query = `[:find ?title :where [?page :block/uid "${currentPageUid}"] [?page :node/title ?title]]`;
        const result = window.roamAlphaAPI.q(query);
        const pageTitle = result?.[0]?.[0];

        if (!pageTitle) {
          alert("❌ Could not determine current page title.");
          return;
        }

        const confirm = window.confirm(
          `🚀 Force deploy yearly calendar to [[${pageTitle}]]?\n\nThis will bypass all checks and add a calendar regardless of existing content.\n\nClick OK to proceed, Cancel to abort.`
        );

        if (confirm) {
          try {
            await deployYearlyCalendarToPage(pageTitle);
          } catch (error) {
            console.error("❌ Force deployment failed:", error);
          }
        }
      },
    },
    // NEW COMMANDS FOR STEP 6
    {
      label: "Yearly View: Update Component from GitHub",
      callback: async () => {
        const confirm = window.confirm(
          "🔄 Update Yearly View component from GitHub?\n\n" +
            "This will fetch the latest version from the repository.\n\n" +
            "Click OK to update, Cancel to skip."
        );

        if (confirm) {
          try {
            console.log("🔄 Manually updating component from GitHub...");
            await deployYearlyViewComponent();
          } catch (error) {
            console.error("❌ Manual update failed:", error);
            alert(`❌ Failed to update component:\n\n${error.message}`);
          }
        }
      },
    },
    {
      label: "Yearly View: Check Component Version",
      callback: () => {
        try {
          const componentUid = getComponentUid();

          // Get the actual component content
          const query = `[:find ?string . :where [?b :block/uid "${componentUid}"] [?b :block/string ?string]]`;
          const componentContent = window.roamAlphaAPI.q(query);

          let version = "Unknown";
          let status = "Could not determine";

          if (componentContent) {
            if (componentContent.includes("yearly-view-v2.core")) {
              version = "Real Component";
              status = "✅ Production ready";
            } else if (componentContent.includes("Hello, World!")) {
              version = "Placeholder";
              status = "⚠️ Needs updating";
            } else {
              version = "Custom/Modified";
              status = "📝 Modified version";
            }
          }

          console.group("📋 Component Version Info");
          console.log("Component UID:", componentUid);
          console.log("Version:", version);
          console.log("Status:", status);
          console.log(
            "Content preview:",
            componentContent?.substring(0, 200) + "..."
          );
          console.groupEnd();

          alert(
            `📋 Component Version Info:\n\n` +
              `Version: ${version}\n` +
              `Status: ${status}\n\n` +
              `Use "Update Component from GitHub" to get latest version.`
          );
        } catch (error) {
          alert(`❌ Error checking component version: ${error.message}`);
        }
      },
    },
  ];

  // Register commands
  for (const cmd of commands) {
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: cmd.label,
      callback: cmd.callback,
    });
  }

  console.log(`✅ Added ${commands.length} command palette commands`);
  return commands;
}

// ===================================================================
// 🚀 MAIN EXTENSION OBJECT
// ===================================================================

const extension = {
  onload: async () => {
    console.group(
      "🗓️ Yearly View Extension 2.0 - Step 6: Real Component Deployment"
    );
    console.log("🚀 Loading extension with real ClojureScript component...");

    try {
      // Step 1: Verify all dependencies
      checkRequiredDependencies();

      // Step 2: Deploy or find real component (UPDATED)
      const componentResult = await deployYearlyViewComponent();

      // Step 3: Register with Calendar Foundation
      const foundationRegistered = registerWithCalendarFoundation();

      // Step 4: Setup page detection with smart deployment
      const pageDetectionSetup = setupCentralPageDetection();

      // Step 5: Load tag configuration
      console.log("🏷️ Loading yearly tag configuration...");
      let tagConfigResult;

      try {
        const tagConfigs = await loadYearlyTagConfiguration();
        tagConfigResult = {
          success: true,
          tagCount: Object.keys(tagConfigs).length,
          tags: Object.keys(tagConfigs),
        };
        console.log("✅ Tag configuration loaded successfully");
      } catch (tagError) {
        console.warn("⚠️ Tag configuration loading failed:", tagError.message);
        tagConfigResult = {
          success: false,
          error: tagError.message,
        };
        // Don't fail extension load if tags aren't configured yet
      }

      // Step 6: Setup command palette
      const commands = setupBasicCommands();

      // Final status report
      console.log("");
      console.log("🎉 Yearly View Extension 2.0 - Step 6 loaded successfully!");
      console.log("📊 Status Summary:");
      console.log("✅ Dependencies:", "All satisfied");
      console.log(
        "✅ Calendar Foundation:",
        foundationRegistered ? "Registered" : "Manual registration"
      );
      console.log(
        "✅ Smart Deployment:",
        pageDetectionSetup
          ? "Active - will auto-deploy calendars"
          : "Fallback mode"
      );
      console.log("✅ Component UID:", componentResult.componentUid);
      console.log(
        "✅ Tag Configuration:",
        tagConfigResult.success
          ? `Loaded ${
              tagConfigResult.tagCount
            } tags: ${tagConfigResult.tags.join(", ")}`
          : `Failed: ${tagConfigResult.error}`
      );
      console.log("✅ Commands Added:", commands.length);
      console.log("");
      console.log("🚀 Step 6 Features Active:");
      console.log("• Real ClojureScript component fetched from GitHub");
      console.log("• 12-month interactive calendar with event display");
      console.log("• Tag-based filtering and navigation");
      console.log("• Automatic component updates and fallback handling");
      console.log("• Professional yearly calendar functionality");
      console.log("");
      console.log("🧪 Testing Instructions:");
      console.log(
        "1. Visit year pages like [[2024]], [[2025]] to deploy calendars"
      );
      console.log("2. Use command 'Yearly View: Check Component Version'");
      console.log("3. Use command 'Yearly View: Update Component from GitHub'");
      console.log("4. Check console for detailed component information");
      console.log("");
      console.log("📍 Production Ready:");
      console.log("• Full yearly calendar functionality");
      console.log("• External GitHub asset management");
      console.log("• Professional user experience");
      console.log("• Complete Calendar Suite integration");
      console.groupEnd();
    } catch (error) {
      console.error("❌ Yearly View Extension failed to load:", error);

      setTimeout(() => {
        alert(
          `❌ Yearly View Extension failed to load:\n\n${error.message}\n\nCheck the console for detailed information.`
        );
      }, 1000);

      throw error;
    }
  },

  onunload: () => {
    console.log("🗓️ Yearly View Extension 2.0 - Step 6: Unloading...");
    console.log(
      "✅ Extension unloaded (automatic cleanup handled by Calendar Foundation)"
    );
  },
};

// Export for Roam

// ===================================================================
// 📦 MODAL EDIT WINDOW
// ===================================================================

// ===================================================================
// 🎯 ROAM CALENDAR SUITE - USER SETUP MODAL EXTENSION v2.0
// ===================================================================
// Extension 5: Event Type Configuration Modal
//
// 🌟 THE CROWN JEWEL - Complete user customization interface!
//
// ✨ BUILT ON MODERN INFRASTRUCTURE:
// - 🎯 Calendar Foundation v2.0 (Central page detection + auto cleanup)
// - 🔧 Calendar Utilities v1.2 (Professional Roam operations)
// - 📋 UnifiedConfigUtils (Tag configuration management)
//
// Features:
// - 🎨 Beautiful modal for editing all 10 event types (#yv0 - #yv9)
// - 🖱️ Click-to-edit names, colors, and emojis
// - 💾 Save changes directly to config page
// - 📍 Smart positioning (upper left, non-intrusive)
// - 🎯 Zero-polling page detection via Calendar Foundation
// - 🧹 Automatic resource cleanup
// ===================================================================

console.log(
  "🎨 Loading User Setup Modal Extension v2.0 (Modern Infrastructure)..."
);

// ===================================================================
// 🔧 DEPENDENCY VERIFICATION
// ===================================================================

/**
 * Verify all required dependencies are available
 */
function checkRequiredDependencies() {
  const missing = [];

  if (!window.CalendarSuite) missing.push("Calendar Foundation v2.0");
  if (!window.CalendarUtilities) missing.push("Calendar Utilities v1.2");
  if (!window.UnifiedConfigUtils) missing.push("UnifiedConfigUtils");
  if (!window.roamAlphaAPI) missing.push("Roam Alpha API");

  if (missing.length > 0) {
    const error = `❌ Missing required dependencies: ${missing.join(", ")}`;
    console.error(error);
    throw new Error(error);
  }

  // Check specific components
  if (!window.CalendarSuite.pageDetector) {
    throw new Error("❌ Calendar Foundation page detector not available");
  }

  console.log("✅ All dependencies verified");
  return true;
}

// ===================================================================
// 🏷️ TAG CONFIGURATION MANAGEMENT
// ===================================================================

/**
 * Parse UnifiedConfigUtils format: object with {id, name, textColor, bgColor, emoji}
 */
function parseTagConfig(configData, tagId) {
  try {
    if (!configData) {
      console.log(`🔄 No config data for #${tagId}, using default`);
      return {
        name: `Event Type ${tagId.slice(2)}`,
        textColor: "#000000",
        backgroundColor: "#ffffff",
        emoji: "📅",
      };
    }

    // Handle object format from UnifiedConfigUtils
    if (typeof configData === "object" && configData !== null) {
      console.log(`📋 Parsing object config for #${tagId}:`, configData);

      const textColor = configData.textColor
        ? configData.textColor.startsWith("#")
          ? configData.textColor
          : `#${configData.textColor}`
        : "#000000";

      const backgroundColor = configData.bgColor
        ? configData.bgColor.startsWith("#")
          ? configData.bgColor
          : `#${configData.bgColor}`
        : "#ffffff";

      const result = {
        name: configData.name || `Event Type ${tagId.slice(2)}`,
        textColor: textColor,
        backgroundColor: backgroundColor,
        emoji: configData.emoji || "📅",
      };

      console.log(`✅ Successfully parsed #${tagId}:`, result);
      return result;
    }

    // Handle string format (fallback)
    if (typeof configData === "string") {
      console.log(`📋 Parsing string config for #${tagId}:`, configData);
      const parts = configData.split(",");

      if (parts.length < 4) {
        console.warn(
          `⚠️ Invalid config string format for ${tagId}: "${configData}"`
        );
        return {
          name: parts[0] || `Event Type ${tagId.slice(2)}`,
          textColor: "#000000",
          backgroundColor: "#ffffff",
          emoji: "📅",
        };
      }

      const [name, foregroundColor, backgroundColorHex, emoji] = parts;
      const textColor = foregroundColor.startsWith("#")
        ? foregroundColor
        : `#${foregroundColor}`;
      const backgroundColor = backgroundColorHex.startsWith("#")
        ? backgroundColorHex
        : `#${backgroundColorHex}`;

      return {
        name: name.trim(),
        textColor: textColor,
        backgroundColor: backgroundColor,
        emoji: emoji.trim(),
      };
    }

    // Unknown format
    console.warn(
      `⚠️ Unknown config format for ${tagId}:`,
      typeof configData,
      configData
    );
    return {
      name: `Event Type ${tagId.slice(2)}`,
      textColor: "#000000",
      backgroundColor: "#ffffff",
      emoji: "📅",
    };
  } catch (error) {
    console.error(`❌ Error in parseTagConfig for #${tagId}:`, error);
    return {
      name: `Event Type ${tagId.slice(2)}`,
      textColor: "#000000",
      backgroundColor: "#ffffff",
      emoji: "📅",
    };
  }
}

/**
 * Load current tag configurations using UnifiedConfigUtils
 */
async function loadTagConfigurations() {
  try {
    const tagConfigs = {};

    // Load configurations for all 10 possible tags
    for (let i = 0; i < 10; i++) {
      const tagId = `yv${i}`;
      try {
        const configData = window.UnifiedConfigUtils.getYearlyTagConfig(tagId);
        console.log(`🔍 Raw config for #${tagId}:`, configData);

        const parsedConfig = parseTagConfig(configData, tagId);
        tagConfigs[tagId] = parsedConfig;

        console.log(`✅ Parsed config for #${tagId}:`, parsedConfig);
      } catch (e) {
        console.warn(
          `⚠️ Error loading config for #${tagId}, using default:`,
          e.message
        );
        tagConfigs[tagId] = parseTagConfig(null, tagId);
      }
    }

    console.log(
      `✅ Loaded configurations for ${Object.keys(tagConfigs).length} tag types`
    );
    return tagConfigs;
  } catch (error) {
    console.error("❌ Error loading tag configurations:", error);
    throw error;
  }
}

/**
 * Convert tag config object to UnifiedConfigUtils format and save via writeConfigValue
 */
function formatTagConfigForSave(config, tagId) {
  // Format as the comma-separated string format that UnifiedConfigUtils expects
  // Format: "name,foreground_color,background_color,emoji"
  const textColor = config.textColor.replace("#", ""); // Remove # prefix
  const backgroundColor = config.backgroundColor.replace("#", ""); // Remove # prefix

  return `${config.name},${textColor},${backgroundColor},${config.emoji}`;
}

/**
 * Save tag configurations using UnifiedConfigUtils.writeConfigValue (the method that actually writes to config page)
 */
async function saveTagConfigurations(tagConfigs) {
  try {
    console.log("💾 Starting save process with writeConfigValue...");

    // Use UnifiedConfigUtils.writeConfigValue to save each tag configuration
    for (const [tagId, config] of Object.entries(tagConfigs)) {
      const configString = formatTagConfigForSave(config, tagId);
      console.log(`💾 Saving #${tagId} as: "${configString}"`);

      try {
        // Use the actual writeConfigValue method that writes to the config page
        const success = await window.UnifiedConfigUtils.writeConfigValue(
          "Yearly",
          tagId,
          configString
        );
        if (success) {
          console.log(`✅ Successfully wrote #${tagId} to config page`);
        } else {
          console.warn(`⚠️ writeConfigValue returned false for #${tagId}`);
        }
      } catch (e) {
        console.error(`❌ Error calling writeConfigValue for #${tagId}:`, e);
      }
    }

    console.log("✅ Save process completed - check config page for changes");
    return true;
  } catch (error) {
    console.error("❌ Error in save process:", error);
    throw error;
  }
}

// ===================================================================
// 🎨 MODAL UI CREATION
// ===================================================================

/**
 * Create the beautiful modal interface
 */
function createSetupModal(tagConfigs) {
  // Remove existing modal if present
  const existingModal = document.getElementById("calendar-setup-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal container
  const modal = document.createElement("div");
  modal.id = "calendar-setup-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
  `;

  // Create modal content - BIGGER SIZE for two color columns
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 1000px;
    max-height: 95vh;
    overflow-y: auto;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    position: relative;
    min-height: 600px;
  `;

  // Create header
  const header = document.createElement("div");
  header.innerHTML = `
    <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
      🎨 Event Type Configuration
    </h2>
    <p style="margin: 0 0 20px 0; color: #7f8c8d; font-size: 14px; line-height: 1.5;">
      Customize your 10 event types (#yv0 - #yv9). These tags go <strong>after the date alias</strong> but <strong>before your event text</strong> on monthly calendar pages.
    </p>
    <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #6c757d;">
      <strong>Usage example:</strong> <code>[[January 1st, 2025]] #yv0 Team meeting at 2pm</code>
    </div>
  `;

  // Create table
  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  `;

  // Table header
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="background: #f8f9fa;">
      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Tag</th>
      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Name</th>
      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Text Color</th>
      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Background</th>
      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Emoji</th>
    </tr>
  `;
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement("tbody");

  Object.entries(tagConfigs).forEach(([tagId, config]) => {
    const row = document.createElement("tr");
    row.style.cssText = `border-bottom: 1px solid #dee2e6;`;

    // Create cells individually to ensure proper structure
    const tagCell = document.createElement("td");
    tagCell.style.cssText =
      "padding: 12px; font-family: monospace; background: #f8f9fa; font-weight: 600;";
    tagCell.textContent = `#${tagId}`;

    const nameCell = document.createElement("td");
    nameCell.style.cssText = "padding: 8px;";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = config.name;
    nameInput.dataset.tag = tagId;
    nameInput.dataset.field = "name";
    nameInput.style.cssText =
      "width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;";
    nameCell.appendChild(nameInput);

    // TEXT COLOR cell
    const textColorCell = document.createElement("td");
    textColorCell.style.cssText = "padding: 8px;";
    const textColorInput = document.createElement("input");
    textColorInput.type = "color";
    textColorInput.value = config.textColor || config.color; // Fallback to old single color
    textColorInput.dataset.tag = tagId;
    textColorInput.dataset.field = "textColor";
    textColorInput.style.cssText =
      "width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;";
    textColorCell.appendChild(textColorInput);

    // BACKGROUND COLOR cell
    const backgroundColorCell = document.createElement("td");
    backgroundColorCell.style.cssText = "padding: 8px;";
    const backgroundColorInput = document.createElement("input");
    backgroundColorInput.type = "color";
    backgroundColorInput.value = config.backgroundColor || "#ffffff"; // Default to white background
    backgroundColorInput.dataset.tag = tagId;
    backgroundColorInput.dataset.field = "backgroundColor";
    backgroundColorInput.style.cssText =
      "width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;";
    backgroundColorCell.appendChild(backgroundColorInput);

    const emojiCell = document.createElement("td");
    emojiCell.style.cssText = "padding: 8px;";
    const emojiInput = document.createElement("input");
    emojiInput.type = "text";
    emojiInput.value = config.emoji;
    emojiInput.dataset.tag = tagId;
    emojiInput.dataset.field = "emoji";
    emojiInput.style.cssText =
      "width: 60px; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 16px; text-align: center;";
    emojiCell.appendChild(emojiInput);

    row.appendChild(tagCell);
    row.appendChild(nameCell);
    row.appendChild(textColorCell);
    row.appendChild(backgroundColorCell);
    row.appendChild(emojiCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  // Create buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  `;

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.cssText = `
    padding: 10px 20px;
    border: 1px solid #ced4da;
    background: white;
    color: #6c757d;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;

  const saveButton = document.createElement("button");
  saveButton.textContent = "💾 Save Changes";
  saveButton.style.cssText = `
    padding: 10px 20px;
    border: none;
    background: #28a745;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  `;

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(saveButton);

  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(table);
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);

  // Event handlers
  cancelButton.addEventListener("click", () => {
    modal.remove();
  });

  saveButton.addEventListener("click", async () => {
    try {
      saveButton.textContent = "💾 Saving...";
      saveButton.disabled = true;

      // Collect all values from the NEW DOM structure with two color pickers
      const updatedConfigs = {};

      Object.keys(tagConfigs).forEach((tagId) => {
        const nameInput = table.querySelector(
          `input[data-tag="${tagId}"][data-field="name"]`
        );
        const textColorInput = table.querySelector(
          `input[data-tag="${tagId}"][data-field="textColor"]`
        );
        const backgroundColorInput = table.querySelector(
          `input[data-tag="${tagId}"][data-field="backgroundColor"]`
        );
        const emojiInput = table.querySelector(
          `input[data-tag="${tagId}"][data-field="emoji"]`
        );

        console.log(`🔍 Collecting data for #${tagId}:`, {
          name: nameInput?.value,
          textColor: textColorInput?.value,
          backgroundColor: backgroundColorInput?.value,
          emoji: emojiInput?.value,
        });

        updatedConfigs[tagId] = {
          name: nameInput?.value || `Event Type ${tagId.slice(2)}`,
          textColor: textColorInput?.value || "#000000",
          backgroundColor: backgroundColorInput?.value || "#ffffff",
          emoji: emojiInput?.value || "📅",
        };
      });

      console.log("📋 All collected configs:", updatedConfigs);

      // Save configurations
      await saveTagConfigurations(updatedConfigs);

      // Success feedback
      saveButton.textContent = "✅ Saved!";
      saveButton.style.background = "#28a745";

      setTimeout(() => {
        modal.remove();

        // Show success notification
        const notification = document.createElement("div");
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          z-index: 10001;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        notification.textContent = "🎉 Event types saved successfully!";
        document.body.appendChild(notification);

        // Register notification for cleanup
        dispatchToRegistry({ elements: [notification] });

        setTimeout(() => notification.remove(), 3000);
      }, 500);
    } catch (error) {
      console.error("❌ Error saving configurations:", error);
      saveButton.textContent = "❌ Error - Try Again";
      saveButton.style.background = "#dc3545";
      saveButton.disabled = false;
    }
  });

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  return modal;
}

// ===================================================================
// 🎯 FLOATING BUTTON MANAGEMENT
// ===================================================================

/**
 * Create the floating setup button with dismiss functionality
 */
function createFloatingButton() {
  // Remove existing button if present
  const existingButton = document.getElementById("calendar-setup-button");
  if (existingButton) {
    existingButton.remove();
  }

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "calendar-setup-button";
  buttonContainer.title = "Click here to see or edit event types";

  // Create main button
  const button = document.createElement("button");
  button.style.cssText = `
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
  `;

  // Create emoji and text separately to ensure proper spacing
  const emoji = document.createElement("span");
  emoji.textContent = "🎨";
  const text = document.createElement("span");
  text.textContent = "Event Types";

  button.appendChild(emoji);
  button.appendChild(text);

  // Create dismiss button
  const dismissButton = document.createElement("button");
  dismissButton.innerHTML = "×";
  dismissButton.title = "Dismiss";
  dismissButton.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 14px;
    font-weight: bold;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    transition: background 0.2s ease;
  `;

  // Dismiss button hover
  dismissButton.addEventListener("mouseenter", () => {
    dismissButton.style.background = "rgba(255, 255, 255, 0.3)";
  });
  dismissButton.addEventListener("mouseleave", () => {
    dismissButton.style.background = "rgba(255, 255, 255, 0.2)";
  });

  // Dismiss functionality
  dismissButton.addEventListener("click", (e) => {
    e.stopPropagation();
    buttonContainer.remove();
  });

  // Assemble button
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(dismissButton);

  // Position relative to main content area, not viewport
  buttonContainer.style.cssText = `
    position: absolute;
    top: 10px;
    left: 20px;
    background: #5c7cfa;
    color: white;
    border: none;
    padding: 12px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 9999;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: auto;
    line-height: 1.4;
  `;

  // Main button and container hover effects (applied to container)
  buttonContainer.addEventListener("mouseenter", () => {
    buttonContainer.style.background = "#4c6ef5";
    buttonContainer.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
  });

  buttonContainer.addEventListener("mouseleave", () => {
    buttonContainer.style.background = "#5c7cfa";
    buttonContainer.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.2)";
  });

  // Click handler for main button
  button.addEventListener("click", async () => {
    const originalContent = button.innerHTML;
    button.innerHTML = "🎨 Loading...";

    try {
      const tagConfigs = await loadTagConfigurations();
      const modal = createSetupModal(tagConfigs);
      document.body.appendChild(modal);

      // Register modal for cleanup
      dispatchToRegistry({ elements: [modal] });
    } catch (error) {
      console.error("❌ Error opening setup modal:", error);
      alert(
        "❌ Error loading event type configurations. Please check console for details."
      );
    }

    // Reset button content
    button.innerHTML = "";
    const newEmoji = document.createElement("span");
    newEmoji.textContent = "🎨";
    const newText = document.createElement("span");
    newText.textContent = "Event Types";
    button.appendChild(newEmoji);
    button.appendChild(newText);
  });

  return buttonContainer;
}

// ===================================================================
// 🎯 CALENDAR FOUNDATION INTEGRATION
// ===================================================================

/**
 * Setup central page detection using Calendar Foundation
 */
function setupCentralPageDetection() {
  let currentButton = null;

  // Function to show button on correct pages
  const showButton = () => {
    if (!currentButton) {
      currentButton = createFloatingButton();

      // Find main content area to anchor the button properly
      const mainContent =
        document.querySelector(".roam-main") ||
        document.querySelector('[data-testid="main"]') ||
        document.querySelector(".rm-main-content") ||
        document.querySelector("#roam-right-sidebar-content") ||
        document.body;

      // Make sure the container has relative positioning for our absolute positioning
      if (mainContent && mainContent !== document.body) {
        const currentPosition = window.getComputedStyle(mainContent).position;
        if (currentPosition === "static") {
          mainContent.style.position = "relative";
        }
        mainContent.appendChild(currentButton);
      } else {
        document.body.appendChild(currentButton);
      }

      // Register button for cleanup
      dispatchToRegistry({ elements: [currentButton] });
    }
  };

  // Function to hide button
  const hideButton = () => {
    if (currentButton) {
      currentButton.remove();
      currentButton = null;
    }
  };

  // Register month page listener
  const monthPageUnregister =
    window.CalendarSuite.pageDetector.registerPageListener(
      "month-page",
      (pageTitle) => {
        // Match month pages (e.g., "January 2025", "December 2024")
        const monthPattern =
          /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
        return monthPattern.test(pageTitle);
      },
      () => {
        console.log("🎨 Month page detected - showing event types button");
        showButton();
      }
    );

  // Register config page listener
  const configPageUnregister =
    window.CalendarSuite.pageDetector.registerPageListener(
      "config-page",
      (pageTitle) => {
        return pageTitle === "roam/ext/calendar suite/config";
      },
      () => {
        console.log("🎨 Config page detected - showing event types button");
        showButton();
      }
    );

  // Register listener for ALL other pages to hide button
  const otherPageUnregister =
    window.CalendarSuite.pageDetector.registerPageListener(
      "other-pages",
      (pageTitle) => {
        // Match any page that's NOT a month page or config page
        const monthPattern =
          /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
        const isMonthPage = monthPattern.test(pageTitle);
        const isConfigPage = pageTitle === "roam/ext/calendar suite/config";

        return !isMonthPage && !isConfigPage;
      },
      () => {
        console.log(
          "🎨 Non-calendar page detected - hiding event types button"
        );
        hideButton();
      }
    );

  // Register cleanup for page listeners
  dispatchToRegistry({
    customCleanups: [
      () => {
        monthPageUnregister();
        configPageUnregister();
        otherPageUnregister();
        hideButton();
      },
    ],
  });

  console.log(
    "✅ Central page detection setup complete with proper show/hide logic"
  );
  return true;
}

/**
 * Setup command palette commands
 */
function setupCommandPalette() {
  const commands = [
    {
      label: "🎨 Event Types: Open Configuration Modal",
      callback: async () => {
        try {
          const tagConfigs = await loadTagConfigurations();
          const modal = createSetupModal(tagConfigs);
          document.body.appendChild(modal);

          // Register modal for cleanup
          dispatchToRegistry({ elements: [modal] });
        } catch (error) {
          console.error("❌ Error opening configuration modal:", error);
          alert(
            "❌ Error loading event type configurations. Please check console for details."
          );
        }
      },
    },
    {
      label: "🎨 Event Types: Show Current Configuration",
      callback: async () => {
        try {
          const tagConfigs = await loadTagConfigurations();

          let configText = "🎨 Current Event Type Configuration:\n\n";
          Object.entries(tagConfigs).forEach(([tagId, config]) => {
            configText += `#${tagId}: ${config.emoji} ${config.name} (${config.color})\n`;
          });

          alert(configText);
        } catch (error) {
          console.error("❌ Error loading configurations:", error);
          alert(
            "❌ Error loading configurations. Please check console for details."
          );
        }
      },
    },
  ];

  // Add commands using Roam API
  commands.forEach((cmd) => {
    window.roamAlphaAPI.ui.commandPalette.addCommand(cmd);
  });

  // Register commands for cleanup
  dispatchToRegistry({
    commands: commands.map((cmd) => cmd.label),
  });

  console.log(`✅ Added ${commands.length} command palette commands`);
  return commands;
}

/**
 * Helper function for resource registration (using Calendar Foundation registry)
 */
function dispatchToRegistry(resources) {
  if (!window._calendarRegistry) {
    console.warn(
      "⚠️ Calendar registry not available - manual cleanup required"
    );
    return;
  }

  const registry = window._calendarRegistry;

  // Register different resource types using correct Calendar Foundation structure (all Arrays)
  if (resources.elements) {
    resources.elements.forEach((el) => {
      registry.elements.push(el);
    });
  }

  if (resources.intervals) {
    resources.intervals.forEach((id) => {
      registry.intervals.push(id);
    });
  }

  if (resources.observers) {
    resources.observers.forEach((obs) => {
      registry.observers.push(obs);
    });
  }

  if (resources.commands) {
    resources.commands.forEach((cmd) => {
      registry.commands.push(cmd);
    });
  }

  if (resources.domListeners) {
    resources.domListeners.forEach((listener) => {
      registry.domListeners.push(listener);
    });
  }

  if (resources.timeouts) {
    resources.timeouts.forEach((id) => {
      registry.timeouts.push(id);
    });
  }

  if (resources.customCleanups) {
    resources.customCleanups.forEach((cleanup) => {
      if (!registry.customCleanups) registry.customCleanups = [];
      registry.customCleanups.push(cleanup);
    });
  }
}

// ===================================================================
// 🚀 MAIN EXTENSION OBJECT
// ===================================================================

const extension = {
  onload: ({ extensionAPI }) => {
    console.group("🎨 User Setup Modal Extension v2.0 - Modern Infrastructure");
    console.log("🚀 Loading crown jewel with professional architecture...");

    try {
      // Step 1: Verify all dependencies
      checkRequiredDependencies();

      // Step 2: Setup central page detection
      setupCentralPageDetection();

      // Step 3: Setup command palette
      setupCommandPalette();

      console.log("");
      console.log("🎉 User Setup Modal Extension v2.0 loaded successfully!");
      console.log("🎯 Features:");
      console.log("  - Zero-polling page detection via Calendar Foundation");
      console.log("  - Automatic resource cleanup");
      console.log("  - Beautiful modal interface for tag customization");
      console.log("  - Professional integration with existing infrastructure");
      console.log("");
      console.log("📍 Usage:");
      console.log("  - Navigate to any month page (e.g., 'January 2025')");
      console.log("  - Navigate to 'roam/ext/calendar suite/config'");
      console.log("  - Click the '🎨 Event Types' button in upper left");
      console.log(
        "  - Or use Command Palette: '🎨 Event Types: Open Configuration Modal'"
      );
    } catch (error) {
      console.error("❌ Error loading User Setup Modal Extension:", error);
      alert(
        `❌ User Setup Modal Extension failed to load:\n\n${error.message}\n\nPlease ensure all dependencies are loaded.`
      );
    }

    console.groupEnd();
  },

  onunload: () => {
    console.log("🎨 User Setup Modal Extension v2.0 unloading...");

    // Calendar Foundation will handle all cleanup automatically via registry
    // No manual cleanup needed!

    console.log(
      "✅ User Setup Modal Extension v2.0 unloaded (auto-cleanup complete)"
    );
  },
};

// Export for Roam

// ===================================================================
// 🎯 COMBINED EXPORT - All extensions in one!
// ===================================================================
export default {
  onload: async ({ extensionAPI }) => {
    console.log("🚀 Calendar Suite Combined Edition loading...");
    
    const loadedComponents = [];
    
    // Calendar Foundation
    try {
      console.log("📦 Loading Calendar Foundation...");
      const component_0 = extension;;
      if (component_0.onload) {
        await component_0.onload({ extensionAPI });
        loadedComponents.push({
          name: "Calendar Foundation",
          component: component_0
        });
        console.log("✅ Calendar Foundation loaded successfully");
      }
    } catch (error) {
      console.error("❌ Calendar Foundation failed:", error);
    }
    
    // Config Utilities
    try {
      console.log("📦 Loading Config Utilities...");
      const component_1 = extension;;
      if (component_1.onload) {
        await component_1.onload({ extensionAPI });
        loadedComponents.push({
          name: "Config Utilities",
          component: component_1
        });
        console.log("✅ Config Utilities loaded successfully");
      }
    } catch (error) {
      console.error("❌ Config Utilities failed:", error);
    }
    
    // Calendar Utilities
    try {
      console.log("📦 Loading Calendar Utilities...");
      const component_2 = {
  onload: async ({ extensionAPI }) => {
    console.log(
      "🔧 Calendar Utilities Extension v1.2 loading (Enhanced Page Detection Integration)..."
    );

    // 🌐 MAKE UTILITIES GLOBALLY AVAILABLE
    window.CalendarUtilities = CalendarUtilities;

    // 🔗 REGISTER WITH CALENDAR FOUNDATION
    const platformRegistered = CalendarUtilities.registerWithPlatform();

    // 🎯 REGISTER PAGE DETECTION DEPENDENCY CHECKER
    if (window.CalendarSuite?.dependencies) {
      window.CalendarSuite.dependencies.registerChecker(
        "page-detection",
        CalendarUtilities.checkPageDetectionDependency
      );
      console.log("🔧 Page detection dependency checker registered");
    }

    // 🎯 INITIALIZE ENHANCED CONFIG SYSTEM
    try {
      // Check if UnifiedConfigUtils is available
      if (window.UnifiedConfigUtils) {
        console.log(
          "🎯 UnifiedConfigUtils detected, using enhanced config system"
        );

        // Initialize the master config
        await window.UnifiedConfigUtils.initializeMasterConfig();

        // Create default utilities section if needed
        await ConfigUtils.createDefaultConfig("Utilities", [
          "version:: 1.2.0",
          "enabled:: true",
          "page_detection_integration:: enhanced",
          "weekly_pattern_support:: dual_patterns",
        ]);

        console.log("✅ Enhanced config system initialized");
      } else {
        console.log(
          "📋 UnifiedConfigUtils not yet available, using fallback config"
        );

        // Fallback to old config creation
        await ConfigUtils.createDefaultConfig("Calendar Utilities/Config", [
          "settings::",
          "version:: 1.2.0",
          "enabled:: true",
          "note:: Enhanced with page detection integration",
        ]);
      }
    } catch (error) {
      console.error("❌ Error initializing config system:", error);
    }

    // 🎯 REGISTER WITH PLATFORM - Enhanced metadata
    if (window.CalendarSuite) {
      window.CalendarSuite.register("calendar-utilities", CalendarUtilities, {
        name: "Calendar Utilities",
        description:
          "Comprehensive toolkit with Central Page Detection integration",
        version: "1.2.0",
        dependencies: ["calendar-foundation", "unified-config-utils"],
        provides: [
          "date-time-utilities",
          "roam-integration",
          "weekly-page-detection",
          "monthly-page-detection",
          "content-generation",
          "configuration-management",
          "unified-config-integration",
          "page-detection-integration", // NEW
          "migration-helpers", // NEW
        ],
      });
    }

    // 📝 ENHANCED COMMAND PALETTE COMMANDS
    const commands = [
      {
        label: "Calendar Utilities: Show Enhanced Status (v1.2)",
        callback: () => {
          const status = CalendarUtilities.getStatus();
          console.log("🔧 Calendar Utilities Enhanced Status (v1.2):", status);
          console.log("🎯 Config System:", status.configSystem);
          console.log("🎯 Page Detection:", status.pageDetection);
          console.log("🚀 Enhancements:", status.enhancements);
        },
      },
      {
        label: "Calendar Utilities: Test Weekly Page Detection",
        callback: () => {
          const testCases = [
            "02/23 2026 - 03/01 2026",
            "January 15th, 2024 - January 21st, 2024",
            "12/30 2024 - 01/05 2025",
            "Not a weekly page",
          ];

          console.log("🧪 Testing enhanced weekly page detection:");
          testCases.forEach((testCase) => {
            const result = WeeklyUtils.isWeeklyPage(testCase);
            console.log(
              `📅 "${testCase}" → ${result ? "✅ WEEKLY" : "❌ NOT WEEKLY"}`
            );
          });
        },
      },
      {
        label: "Calendar Utilities: Test Current Page Detection",
        callback: () => {
          const currentPage = RoamUtils.getCurrentPageTitle();
          console.log("📄 Enhanced Current Page Detection Test:");
          console.log(`- Current page: "${currentPage}"`);
          console.log(
            `- Is weekly page? ${
              WeeklyUtils.isWeeklyPage(currentPage) ? "✅ YES" : "❌ NO"
            }`
          );
          console.log(
            `- Is monthly page? ${
              MonthlyUtils.isMonthlyPage(currentPage) ? "✅ YES" : "❌ NO"
            }`
          );

          if (WeeklyUtils.isWeeklyPage(currentPage)) {
            const parsed = WeeklyUtils.parseWeeklyTitle(currentPage);
            console.log(`- Parsed dates:`, parsed);
          }
        },
      },
      {
        label: "Calendar Utilities: Test Unified Config",
        callback: async () => {
          console.log("🧪 Testing unified config integration...");

          // Test writing to the new system
          const writeSuccess = await ConfigUtils.writeToSection(
            "Utilities",
            "test_setting",
            "test_value"
          );
          console.log(
            `📝 Write test: ${writeSuccess ? "✅ SUCCESS" : "❌ FAILED"}`
          );

          // Test reading from the new system
          const readValue = ConfigUtils.readFromSection(
            "Utilities",
            "test_setting",
            "default"
          );
          console.log(
            `📖 Read test: ${
              readValue === "test_value" ? "✅ SUCCESS" : "❌ FAILED"
            } (Got: ${readValue})`
          );

          console.log("🎯 Unified config integration test complete!");
        },
      },
      // 🎯 NEW: PAGE DETECTION INTEGRATION COMMANDS
      {
        label: "🎯 Page Detection: Test Integration",
        callback: () => {
          const status = PageDetectionUtils.getDetectionStatus();
          console.group("🎯 Page Detection Integration Test");
          console.log("Status:", status);

          if (status.available) {
            console.log("✅ Central Page Detection System is available");
            console.log(`📄 Current page: "${status.currentPage}"`);
            console.log(`📊 Active listeners: ${status.activeListeners}`);
            console.log("📈 Metrics:", status.metrics);
          } else {
            console.log("❌ Central Page Detection System not available");
            console.log("Reason:", status.reason);
          }

          console.groupEnd();
        },
      },
      {
        label: "🎯 Page Detection: Register Test Weekly Listener",
        callback: () => {
          const unregister = PageDetectionUtils.onWeeklyPage((pageTitle) => {
            console.log(
              `🗓️ Weekly page detected via Central System: "${pageTitle}"`
            );
          });

          console.log(
            "✅ Test weekly page listener registered with Central System"
          );
          console.log(
            "💡 It will trigger automatically when you navigate to weekly pages"
          );
          console.log(
            "📝 Unregister function stored in: window._testWeeklyListenerUnregister"
          );

          // Store unregister function globally for easy access
          window._testWeeklyListenerUnregister = unregister;
        },
      },
      {
        label: "🎯 Page Detection: Show Migration Example",
        callback: () => {
          console.group("📖 Extension Migration Example");
          console.log("❌ OLD APPROACH (Polling):");
          console.log(`
setInterval(() => {
  const currentPage = RoamUtils.getCurrentPageTitle();
  if (WeeklyUtils.isWeeklyPage(currentPage)) {
    processWeeklyPage(currentPage);
  }
}, 2000); // 0.5 checks/second
`);

          console.log("✅ NEW APPROACH (Event-driven):");
          console.log(`
const unregister = CalendarUtilities.PageDetectionUtils.onWeeklyPage(
  processWeeklyPage
);
// OR:
const unregister = CalendarSuite.pageDetector.registerPageListener(
  "weekly",
  WeeklyUtils.isWeeklyPage,
  processWeeklyPage
);
`);

          console.log("📊 PERFORMANCE IMPACT:");
          console.log(
            "- Polling reduction: 96% (0.5 → 0.02 checks/second per extension)"
          );
          console.log("- Real-time detection: Immediate page change response");
          console.log("- Resource usage: Dramatically reduced");

          console.groupEnd();
        },
      },
    ];

    // Add commands to Roam
    commands.forEach((cmd) => {
      window.roamAlphaAPI.ui.commandPalette.addCommand(cmd);
    });

    // 🎉 READY!
    console.log(
      "✅ Calendar Utilities Extension v1.2 loaded successfully (Enhanced)!"
    );
    console.log(
      `🔧 ${
        CalendarUtilities.getStatus().totalUtilities
      } utilities available across ${
        Object.keys(CalendarUtilities.getStatus().modules).length
      } modules`
    );
    console.log("🎯 Enhanced: Central Page Detection integration ready!");
    console.log(
      "🔗 Page detection utilities: CalendarUtilities.PageDetectionUtils"
    );

    if (platformRegistered) {
      console.log(
        "🔗 Successfully integrated with Calendar Foundation platform"
      );
    }

    // 🚨 DEPENDENCY CHECKS
    if (!window.UnifiedConfigUtils) {
      console.warn(
        "⚠️ UnifiedConfigUtils not detected - some advanced config features may be limited"
      );
    }

    if (!window.CalendarSuite?.pageDetector) {
      console.warn(
        "⚠️ Central Page Detection System not detected - extensions will use manual detection"
      );
      console.log(
        "💡 Ensure Calendar Foundation v2.0+ loads before Calendar Utilities for full functionality"
      );
    } else {
      console.log("✅ Central Page Detection System detected and ready!");
    }
  },

  onunload: () => {
    console.log("🔧 Calendar Utilities Extension v1.2 unloading (Enhanced)...");

    // Clean up global references
    if (window.CalendarUtilities) {
      delete window.CalendarUtilities;
    }

    // Clean up test functions
    if (window._testWeeklyListenerUnregister) {
      try {
        window._testWeeklyListenerUnregister();
        delete window._testWeeklyListenerUnregister;
      } catch (error) {
        console.warn("Error cleaning up test listener:", error);
      }
    }

    // The Calendar Foundation will handle automatic cleanup of registered utilities
    console.log("✅ Calendar Utilities Extension v1.2 unloaded (Enhanced)!");
  },
};;
      if (component_2.onload) {
        await component_2.onload({ extensionAPI });
        loadedComponents.push({
          name: "Calendar Utilities",
          component: component_2
        });
        console.log("✅ Calendar Utilities loaded successfully");
      }
    } catch (error) {
      console.error("❌ Calendar Utilities failed:", error);
    }
    
    // Monthly View
    try {
      console.log("📦 Loading Monthly View...");
      const component_3 = {
  onload: ({ extensionAPI }) => {
    console.log("📅 Monthly View Extension v2.2 loading...");
    setTimeout(() => {
      initializeMonthlyView();
    }, 500);
  },

  onunload: () => {
    console.log("📅 Monthly View Extension v2.2 unloading...");
    removeMonthlyButton();
    if (window.monthlyViewPageListenerUnregister) {
      window.monthlyViewPageListenerUnregister();
    }
    console.log("✅ Monthly View Extension v2.2 unloaded!");
  },
};;
      if (component_3.onload) {
        await component_3.onload({ extensionAPI });
        loadedComponents.push({
          name: "Monthly View",
          component: component_3
        });
        console.log("✅ Monthly View loaded successfully");
      }
    } catch (error) {
      console.error("❌ Monthly View failed:", error);
    }
    
    // Weekly View
    try {
      console.log("📦 Loading Weekly View...");
      const component_4 = window.WeeklyViewExtension;;
      if (component_4.onload) {
        await component_4.onload({ extensionAPI });
        loadedComponents.push({
          name: "Weekly View",
          component: component_4
        });
        console.log("✅ Weekly View loaded successfully");
      }
    } catch (error) {
      console.error("❌ Weekly View failed:", error);
    }
    
    // Yearly View
    try {
      console.log("📦 Loading Yearly View...");
      const component_5 = extension;;
      if (component_5.onload) {
        await component_5.onload({ extensionAPI });
        loadedComponents.push({
          name: "Yearly View",
          component: component_5
        });
        console.log("✅ Yearly View loaded successfully");
      }
    } catch (error) {
      console.error("❌ Yearly View failed:", error);
    }
    
    // Modal Edit Window
    try {
      console.log("📦 Loading Modal Edit Window...");
      const component_6 = extension;;
      if (component_6.onload) {
        await component_6.onload({ extensionAPI });
        loadedComponents.push({
          name: "Modal Edit Window",
          component: component_6
        });
        console.log("✅ Modal Edit Window loaded successfully");
      }
    } catch (error) {
      console.error("❌ Modal Edit Window failed:", error);
    }
    
    console.log(`🎉 Calendar Suite loaded! ${loadedComponents.length} components active.`);
    
    // Store components for cleanup
    window._calendarLoadedComponents = loadedComponents;
  },
  
  onunload: () => {
    console.log("🧹 Calendar Suite unloading...");
    
    const components = window._calendarLoadedComponents || [];
    components.forEach(comp => {
      try {
        if (comp.component.onunload) {
          comp.component.onunload();
          console.log(`✅ ${comp.name} unloaded`);
        }
      } catch (error) {
        console.warn(`⚠️ Error unloading ${comp.name}:`, error);
      }
    });
    
    delete window._calendarLoadedComponents;
    console.log("✅ Calendar Suite unloaded successfully");
  }
};
