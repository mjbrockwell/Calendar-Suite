// 📅 Calendar Suite Auto-Loader
// Clean autoloader that loads all Calendar Suite extensions automatically

const CALENDAR_EXTENSIONS = [
  {
    id: "foundation",
    name: "Calendar Foundation",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1-calendar-foundation/extension.js",
    description: "Core calendar infrastructure",
    critical: true,
    exportPattern: "standard",
  },
  {
    id: "config",
    name: "Config Utilities",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1.2-config-utilities/extension.js",
    description: "Configuration management",
    critical: true,
    exportPattern: "standard",
  },
  {
    id: "utilities",
    name: "Calendar Utilities",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1.5-calendar-utilities/extension.js",
    description: "Shared calendar functions",
    critical: true,
    exportPattern: "standard",
  },
  {
    id: "monthly",
    name: "Monthly View",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/2.0-monthly-view/extension.js",
    description: "Monthly calendar display",
    critical: false,
    exportPattern: "standard",
  },
  {
    id: "weekly",
    name: "Weekly View",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/3.0-weekly-view/extension.js",
    description: "Weekly calendar display",
    critical: false,
    exportPattern: "standard",
  },
  {
    id: "bandaid",
    name: "Weekly Bandaid",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/3.5-weekly-bandaid/extension.js",
    description: "Weekly view enhancements",
    critical: false,
    exportPattern: "self-executing",
  },
  {
    id: "yearly",
    name: "Yearly View",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/4.0-yearly-view/extension.js",
    description: "Yearly calendar display",
    critical: false,
    exportPattern: "standard",
  },
  {
    id: "modal",
    name: "Modal Edit Window",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/5.0-modal-edit-window/extension.js",
    description: "Event editing interface",
    critical: false,
    exportPattern: "unknown",
  },
];

// Global state
let loadedExtensions = new Map();
let installLog = [];

// Create mock extension API with CORRECT structure
function createMockExtensionAPI(extId) {
  return {
    settings: {
      get: (key) => localStorage.getItem(`cal-${extId}-${key}`),
      set: (key, value) => localStorage.setItem(`cal-${extId}-${key}`, value),
      panel: {
        create: (config) => ({ id: Date.now(), config }),
      },
    },
    // CRITICAL: ui namespace required - this was the main bug!
    ui: {
      commandPalette: {
        // CRITICAL: under ui, not root
        addCommand: (command) => {
          console.log(`📋 Command added: ${command.label}`);
          return { id: Date.now(), ...command };
        },
        removeCommand: (commandId) => {
          console.log(`📋 Command removed: ${commandId}`);
          return true;
        },
      },
      createButton: (config) => ({ id: Date.now(), ...config }),
      showNotification: (message, type = "info") => {
        console.log(`🔔 Notification: ${message} (${type})`);
        return true;
      },
    },
  };
}

// Logging utility
function logMessage(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  installLog.push({ timestamp, message, type });
  console.log(`[${timestamp}] ${message}`);
}

// Install single extension
async function installExtension(extId) {
  const extension = CALENDAR_EXTENSIONS.find((ext) => ext.id === extId);
  if (!extension) {
    throw new Error(`Extension ${extId} not found`);
  }

  logMessage(`🔄 Installing ${extension.name}...`);

  try {
    // Fetch extension code
    logMessage(`📡 Fetching from GitHub: ${extension.name}`);
    const response = await fetch(extension.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const code = await response.text();
    logMessage(`📝 Code retrieved (${code.length} bytes)`);

    // Create blob URL to bypass MIME type restrictions
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    try {
      // Setup mock API with CORRECT structure
      const mockAPI = createMockExtensionAPI(extId);

      // CRITICAL: Debug pre-execution API structure
      console.log(`🔍 PRE-EXECUTION DEBUG for ${extension.name}:`);
      console.log(`  mockAPI exists:`, !!mockAPI);
      console.log(`  mockAPI.ui exists:`, !!mockAPI.ui);
      console.log(
        `  mockAPI.ui.commandPalette exists:`,
        !!mockAPI.ui.commandPalette
      );

      // Test addCommand function
      try {
        const testResult = mockAPI.ui.commandPalette.addCommand({
          label: "test",
        });
        console.log(`  ✅ addCommand test successful:`, testResult);
      } catch (testError) {
        console.log(`  ❌ addCommand test failed:`, testError);
      }

      // Make API globally available (multiple locations for compatibility)
      window.extensionAPI = mockAPI;
      window._extensionAPI = mockAPI;
      if (!window.roamExtensions) window.roamExtensions = {};
      window.roamExtensions.extensionAPI = mockAPI;

      // Import module
      logMessage(`⚡ Importing module: ${extension.name}`);
      const module = await import(blobUrl);

      // Handle different export patterns
      let executed = false;

      if (module.default?.onload) {
        logMessage(`🎯 Executing standard onload: ${extension.name}`);
        await module.default.onload({ extensionAPI: mockAPI });
        executed = true;
      } else if (module.onload) {
        logMessage(`🎯 Executing named onload: ${extension.name}`);
        await module.onload({ extensionAPI: mockAPI });
        executed = true;
      } else if (typeof module.default === "function") {
        logMessage(`🎯 Executing function export: ${extension.name}`);
        await module.default({ extensionAPI: mockAPI });
        executed = true;
      } else {
        // Self-executing extension (like Weekly Bandaid)
        logMessage(`🎯 Self-executing extension detected: ${extension.name}`);
        executed = true;
      }

      // Clean up global API references
      delete window.extensionAPI;
      delete window._extensionAPI;
      delete window.roamExtensions.extensionAPI;

      // Store for unload
      loadedExtensions.set(extId, {
        name: extension.name,
        module: module.default || module,
        executed,
      });

      logMessage(`✅ ${extension.name} installed successfully!`, "success");
    } finally {
      // Always clean up blob URL
      URL.revokeObjectURL(blobUrl);
    }
  } catch (error) {
    console.error(`❌ ${extension.name} failed:`, error);
    logMessage(`❌ ${extension.name} failed: ${error.message}`, "error");
    throw error; // Re-throw for caller handling
  }
}

// Create simple loading modal for auto-installation
function createSimpleLoadingModal() {
  const modalHTML = `
    <div id="calendar-simple-loading-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 8px;
        padding: 32px 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        text-align: center;
        min-width: 300px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 16px;
        ">Calendar Suite Loading</div>
        <div id="calendar-progress-counter" style="
          font-size: 24px;
          font-weight: 700;
          color: #845ec2;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        ">0/${CALENDAR_EXTENSIONS.length}</div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  return document.getElementById("calendar-simple-loading-modal");
}

// Update simple progress counter
function updateSimpleProgress(current, total) {
  const counter = document.getElementById("calendar-progress-counter");
  if (counter) {
    counter.textContent = `${current}/${total}`;
  }
}

// Close simple loading modal
function closeSimpleLoadingModal() {
  const modal = document.getElementById("calendar-simple-loading-modal");
  if (modal) {
    modal.remove();
  }
}

// Auto-install with simple UI
async function autoInstallAllSimple() {
  const modal = createSimpleLoadingModal();

  logMessage(
    "🚀 Starting auto-installation of all Calendar Suite extensions..."
  );

  let successCount = 0;
  let failureCount = 0;
  const totalCount = CALENDAR_EXTENSIONS.length;

  for (let i = 0; i < CALENDAR_EXTENSIONS.length; i++) {
    const extension = CALENDAR_EXTENSIONS[i];
    updateSimpleProgress(i, totalCount);

    try {
      await installExtension(extension.id);
      successCount++;
    } catch (error) {
      failureCount++;
      logMessage(`⚠️ Continuing despite ${extension.name} failure...`);
    }

    // Small delay to show progress
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Show final count
  updateSimpleProgress(successCount, totalCount);

  // Keep modal open for a moment to show completion
  setTimeout(() => {
    closeSimpleLoadingModal();

    // Show brief success message
    if (successCount === totalCount) {
      console.log(
        `🎉 Calendar Suite loaded successfully! (${successCount}/${totalCount})`
      );
    } else {
      console.log(
        `⚠️ Calendar Suite loaded with issues: ${successCount}/${totalCount} successful`
      );
    }
  }, 1500);

  // Final report to log
  if (successCount === totalCount) {
    logMessage(
      `🎉 Auto-installation complete! All ${successCount} extensions loaded.`,
      "success"
    );
  } else {
    logMessage(
      `⚠️ Auto-installation finished: ${successCount}/${totalCount} successful, ${failureCount} failed.`
    );
  }
}

// Main extension export
export default {
  onload: async ({ extensionAPI }) => {
    console.log("🚀 Calendar Suite Auto-Loader Loading...");

    // Reset state
    loadedExtensions.clear();
    installLog = [];

    console.log("✅ Calendar Suite Auto-Loader Ready!");

    // 🚀 AUTO-START: Automatically begin installation with simple UI
    console.log("🎬 Auto-starting Calendar Suite installation...");

    // Small delay to ensure everything is ready
    setTimeout(() => {
      autoInstallAllSimple(); // Use the simple, minimal UI
    }, 500);
  },

  onunload: () => {
    console.log("🔄 Calendar Suite Auto-Loader Unloading...");

    // Unload all installed extensions
    loadedExtensions.forEach((ext, id) => {
      try {
        if (ext.module?.onunload) {
          console.log(`🔄 Unloading ${ext.name}...`);
          ext.module.onunload();
        }
      } catch (error) {
        console.warn(`⚠️ Error unloading ${ext.name}:`, error);
      }
    });

    // Close any remaining modals
    closeSimpleLoadingModal();

    // Reset state
    loadedExtensions.clear();
    installLog = [];

    console.log("✅ Calendar Suite Auto-Loader Unloaded");
  },
};
