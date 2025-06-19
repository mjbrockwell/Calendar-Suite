// ===================================================================
// 🗓️ CALENDAR SUITE MODAL INSTALLER - FIXED
// ===================================================================
// Simple, visual installer for Calendar Suite
// User installs ONE extension, gets a nice modal to load the rest!
// ===================================================================

console.log("🗓️ Calendar Suite Installer starting...");

// Extension definitions
const CALENDAR_EXTENSIONS = [
  {
    id: "foundation",
    name: "Calendar Foundation",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1-calendar-foundation/extension.js",
    description: "Core calendar infrastructure",
    critical: true,
  },
  {
    id: "config",
    name: "Config Utilities",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1.2-config-utilities/extension.js",
    description: "Configuration management",
    critical: true,
  },
  {
    id: "utilities",
    name: "Calendar Utilities",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/1.5-calendar-utilities/extension.js",
    description: "Shared calendar functions",
    critical: true,
  },
  {
    id: "monthly",
    name: "Monthly View",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/2.0-monthly-view/extension.js",
    description: "Monthly calendar display",
    critical: false,
  },
  {
    id: "weekly",
    name: "Weekly View",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/3.0-weekly-view/extension.js",
    description: "Weekly calendar display",
    critical: false,
  },
  {
    id: "bandaid",
    name: "Weekly Bandaid",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/3.5-weekly-bandaid/extension.js",
    description: "Weekly view enhancements",
    critical: false,
  },
  {
    id: "yearly",
    name: "Yearly View",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/4.0-yearly-view/extension.js",
    description: "Yearly calendar display",
    critical: false,
  },
  {
    id: "modal",
    name: "Modal Edit Window",
    url: "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/5.0-modal-edit-window/extension.js",
    description: "Event editing interface",
    critical: false,
  },
];

// Track loaded extensions
let loadedExtensions = new Map();
let installerModal = null;

// Create the installer modal
function createInstallerModal() {
  const modalHTML = `
        <div id="calendar-suite-installer" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
            <div style="padding: 20px; border-bottom: 1px solid #eee;">
                <h2 style="margin: 0; color: #333; display: flex; align-items: center;">
                    <span style="font-size: 24px; margin-right: 10px;">🗓️</span>
                    Calendar Suite Installer
                </h2>
                <p style="margin: 10px 0 0 0; color: #666;">
                    Install your calendar extensions one by one, or use Auto-Install!
                </p>
            </div>
            
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <button id="auto-install-btn" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                        transition: all 0.3s ease;
                    ">
                        🚀 Auto-Install All Extensions
                    </button>
                </div>
                
                <div style="text-align: center; margin: 20px 0; color: #999; position: relative;">
                    <span style="background: white; padding: 0 15px;">or install individually</span>
                    <hr style="position: absolute; top: 50%; left: 0; right: 0; margin: 0; border: none; border-top: 1px solid #eee; z-index: -1;">
                </div>
                
                <div style="display: grid; gap: 12px;">
                    ${CALENDAR_EXTENSIONS.map(
                      (ext) => `
                        <div data-id="${ext.id}" style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 12px;
                            border: 2px solid #e9ecef;
                            border-radius: 8px;
                            transition: all 0.2s;
                        ">
                            <div style="display: flex; align-items: center; flex: 1;">
                                <span class="status-icon" style="font-size: 20px; margin-right: 12px;">⭕</span>
                                <div>
                                    <div style="font-weight: 600; color: #333;">
                                        ${ext.name}
                                        ${
                                          ext.critical
                                            ? '<span style="background: #ff6b6b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">REQUIRED</span>'
                                            : ""
                                        }
                                    </div>
                                    <div style="color: #666; font-size: 12px;">
                                        ${ext.description}
                                    </div>
                                </div>
                            </div>
                            <button class="install-btn" data-id="${
                              ext.id
                            }" style="
                                background: #28a745;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                padding: 8px 12px;
                                font-size: 12px;
                                cursor: pointer;
                                transition: all 0.2s;
                            ">
                                Install
                            </button>
                        </div>
                    `
                    ).join("")}
                </div>
                
                <div id="install-log" style="
                    margin-top: 20px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 12px;
                    max-height: 150px;
                    overflow-y: auto;
                    display: none;
                ">
                </div>
            </div>
            
            <div style="padding: 20px; border-top: 1px solid #eee; text-align: right;">
                <button id="close-installer-btn" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                ">
                    Close
                </button>
            </div>
        </div>
        
        <div id="calendar-installer-backdrop" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        "></div>
    `;

  // Add to page
  const container = document.createElement("div");
  container.innerHTML = modalHTML;
  document.body.appendChild(container);

  // Add event listeners
  setupModalEventListeners();

  return container;
}

// Setup event listeners for the modal
function setupModalEventListeners() {
  // Close button
  document
    .getElementById("close-installer-btn")
    .addEventListener("click", closeInstaller);

  // Backdrop click
  document
    .getElementById("calendar-installer-backdrop")
    .addEventListener("click", closeInstaller);

  // Auto install button
  document
    .getElementById("auto-install-btn")
    .addEventListener("click", autoInstallAll);

  // Individual install buttons
  document.querySelectorAll(".install-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const extId = e.target.getAttribute("data-id");
      installExtension(extId);
    });
  });

  // Hover effects
  const autoBtn = document.getElementById("auto-install-btn");
  autoBtn.addEventListener("mouseenter", () => {
    autoBtn.style.transform = "translateY(-2px)";
  });
  autoBtn.addEventListener("mouseleave", () => {
    autoBtn.style.transform = "translateY(0)";
  });
}

// Close the installer modal
function closeInstaller() {
  const installer = document.getElementById("calendar-suite-installer");
  if (installer) {
    installer.parentElement.remove();
  }
}

// Log function
function logMessage(message, type = "info") {
  const logDiv = document.getElementById("install-log");
  if (logDiv) {
    logDiv.style.display = "block";
    const timestamp = new Date().toLocaleTimeString();
    const color =
      type === "error" ? "#dc3545" : type === "success" ? "#28a745" : "#333";
    logDiv.innerHTML += `<div style="color: ${color};">[${timestamp}] ${message}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
  }
  console.log(`📦 Calendar Installer: ${message}`);
}

// Update extension status in the UI
function updateExtensionStatus(extId, status, message = "") {
  const item = document.querySelector(`[data-id="${extId}"]`);
  if (!item) return;

  const statusIcon = item.querySelector(".status-icon");
  const installBtn = item.querySelector(".install-btn");

  switch (status) {
    case "loading":
      statusIcon.textContent = "🔄";
      installBtn.textContent = "Loading...";
      installBtn.disabled = true;
      installBtn.style.background = "#ffc107";
      break;
    case "success":
      statusIcon.textContent = "✅";
      installBtn.textContent = "Installed";
      installBtn.disabled = true;
      installBtn.style.background = "#6c757d";
      item.style.borderColor = "#28a745";
      break;
    case "error":
      statusIcon.textContent = "❌";
      installBtn.textContent = "Retry";
      installBtn.disabled = false;
      installBtn.style.background = "#dc3545";
      item.style.borderColor = "#dc3545";
      break;
  }
}

// Install a single extension
async function installExtension(extId) {
  const extension = CALENDAR_EXTENSIONS.find((ext) => ext.id === extId);
  if (!extension) return;

  updateExtensionStatus(extId, "loading");
  logMessage(`Installing ${extension.name}...`);

  try {
    // Fetch the extension code
    const response = await fetch(extension.url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const code = await response.text();
    if (!code.trim()) {
      throw new Error("Empty extension file");
    }

    // Create blob URL and import
    const blob = new Blob([code], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    try {
      const module = await import(blobUrl);

      if (module.default?.onload) {
        // 🔧 FIXED: Create correct mock extension API structure
        const mockAPI = {
          settings: {
            get: (key) => localStorage.getItem(`cal-${extId}-${key}`),
            set: (key, value) =>
              localStorage.setItem(`cal-${extId}-${key}`, value),
            panel: {
              create: (config) => {
                console.log(
                  `⚙️ Settings panel created: ${JSON.stringify(config)}`
                );
                return { id: Date.now(), config };
              },
            },
          },
          ui: {
            // 🔧 FIXED: Move commandPalette under ui namespace
            commandPalette: {
              addCommand: (command) => {
                console.log(
                  `📋 Command added: ${
                    command.label || command.name || command.id || "unnamed"
                  }`
                );
                return { id: command.id || Date.now(), ...command };
              },
              removeCommand: (commandId) => {
                console.log(`📋 Command removed: ${commandId}`);
                return true;
              },
            },
            createButton: (config) => {
              console.log(
                `🔘 Button created: ${config.label || config.text || "unnamed"}`
              );
              return { id: Date.now(), ...config };
            },
            showNotification: (message, type = "info") => {
              console.log(`📢 Notification (${type}): ${message}`);
              return true;
            },
          },
        };

        // Make extensionAPI globally available (some extensions check global scope)
        window.extensionAPI = mockAPI;
        window._extensionAPI = mockAPI;

        // Also store it in common global locations extensions might check
        if (!window.roamExtensions) window.roamExtensions = {};
        window.roamExtensions.extensionAPI = mockAPI;

        console.log(
          `🌐 Made extensionAPI globally available for ${extension.name}`
        );

        // Debug: Extensive API validation
        console.log(`🔍 PRE-EXECUTION DEBUG for ${extension.name}:`);
        console.log(`  mockAPI exists:`, !!mockAPI);
        console.log(`  mockAPI.ui exists:`, !!mockAPI.ui);
        console.log(
          `  mockAPI.ui.commandPalette exists:`,
          !!mockAPI.ui.commandPalette
        );
        console.log(
          `  mockAPI.ui.commandPalette.addCommand exists:`,
          !!mockAPI.ui.commandPalette?.addCommand
        );

        // Test the addCommand function
        try {
          const testResult = mockAPI.ui.commandPalette.addCommand({
            label: "test",
          });
          console.log(`  ✅ addCommand test successful:`, testResult);
        } catch (testError) {
          console.log(`  ❌ addCommand test failed:`, testError);
        }

        // Log the exact parameter object being passed
        const extensionAPIParam = { extensionAPI: mockAPI };
        console.log(`  Parameter object:`, extensionAPIParam);
        console.log(
          `  extensionAPIParam.extensionAPI exists:`,
          !!extensionAPIParam.extensionAPI
        );
        console.log(
          `  extensionAPIParam.extensionAPI.ui exists:`,
          !!extensionAPIParam.extensionAPI?.ui
        );
        console.log(
          `  extensionAPIParam.extensionAPI.ui.commandPalette exists:`,
          !!extensionAPIParam.extensionAPI?.ui?.commandPalette
        );

        // Execute the extension with detailed error catching
        try {
          // Handle different export formats
          if (module.default?.onload) {
            await module.default.onload(extensionAPIParam);
          } else if (module.onload) {
            await module.onload(extensionAPIParam);
          } else if (module.default && typeof module.default === "function") {
            await module.default(extensionAPIParam);
          } else {
            // Extension might be self-executing (like Weekly Bandaid)
            console.log(`  ℹ️ ${extension.name} appears to be self-executing`);
          }
          console.log(`  ✅ ${extension.name} executed successfully`);
        } catch (onloadError) {
          console.log(`  ❌ ${extension.name} onload error:`, onloadError);
          console.log(`  Error message:`, onloadError.message);
          console.log(`  Error stack:`, onloadError.stack);
          throw onloadError;
        } finally {
          // Clean up global references after execution
          delete window.extensionAPI;
          delete window._extensionAPI;
          if (window.roamExtensions) {
            delete window.roamExtensions.extensionAPI;
          }
        }

        // Store for cleanup
        loadedExtensions.set(extId, {
          name: extension.name,
          module: module.default,
        });

        updateExtensionStatus(extId, "success");
        logMessage(`✅ ${extension.name} installed successfully!`, "success");
      } else {
        throw new Error("Invalid extension format");
      }
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (error) {
    updateExtensionStatus(extId, "error");
    logMessage(`❌ ${extension.name} failed: ${error.message}`, "error");
  }
}

// Auto-install all extensions in sequence
async function autoInstallAll() {
  const autoBtn = document.getElementById("auto-install-btn");
  autoBtn.textContent = "🔄 Installing...";
  autoBtn.disabled = true;

  logMessage("🚀 Starting auto-installation...");

  for (const extension of CALENDAR_EXTENSIONS) {
    await installExtension(extension.id);
    // Small delay between installations
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const successCount = loadedExtensions.size;
  const totalCount = CALENDAR_EXTENSIONS.length;

  if (successCount === totalCount) {
    logMessage(
      `🎉 Auto-installation complete! All ${successCount} extensions loaded.`,
      "success"
    );
    autoBtn.textContent = "✅ All Installed";
  } else {
    logMessage(
      `⚠️ Installation complete with issues. ${successCount}/${totalCount} extensions loaded.`,
      "error"
    );
    autoBtn.textContent = `⚠️ ${successCount}/${totalCount} Installed`;
    autoBtn.disabled = false;
  }
}

// Show installer modal
function showInstaller() {
  closeInstaller(); // Close any existing installer
  installerModal = createInstallerModal();
}

// Add installer button to Roam interface
function addInstallerButton() {
  // Don't add if already exists
  if (document.getElementById("calendar-installer-btn")) return;

  // Find Roam's top bar
  const topBar =
    document.querySelector(".roam-topbar") ||
    document.querySelector(".rm-topbar") ||
    document.querySelector('[data-testid="topbar"]');
  if (!topBar) {
    console.warn("⚠️ Could not find Roam's top bar to add installer button");
    return;
  }

  // Create installer button
  const installerBtn = document.createElement("button");
  installerBtn.id = "calendar-installer-btn";
  installerBtn.innerHTML = "🗓️ Calendar Suite";
  installerBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        margin: 0 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
    `;

  // Hover effects
  installerBtn.addEventListener("mouseenter", () => {
    installerBtn.style.transform = "translateY(-1px)";
    installerBtn.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
  });
  installerBtn.addEventListener("mouseleave", () => {
    installerBtn.style.transform = "translateY(0)";
    installerBtn.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
  });

  // Click to show installer
  installerBtn.addEventListener("click", showInstaller);

  // Add to top bar
  const container = document.createElement("div");
  container.appendChild(installerBtn);
  topBar.appendChild(container);

  console.log("✅ Calendar Suite installer button added to top bar");
}

// Main extension export
export default {
  onload: () => {
    console.log("🗓️ Calendar Suite Installer loaded!");

    // Add installer button to Roam interface
    addInstallerButton();

    // Show installer immediately for first-time users
    setTimeout(() => {
      if (loadedExtensions.size === 0) {
        showInstaller();
      }
    }, 2000);
  },

  onunload: () => {
    console.log("🧹 Calendar Suite Installer unloading...");

    // Unload all installed extensions
    loadedExtensions.forEach((ext, id) => {
      try {
        if (ext.module?.onunload) {
          ext.module.onunload();
          console.log(`✅ ${ext.name} unloaded`);
        }
      } catch (error) {
        console.warn(`⚠️ Error unloading ${ext.name}:`, error);
      }
    });

    // Clean up UI
    closeInstaller();
    const installerBtn = document.getElementById("calendar-installer-btn");
    if (installerBtn) {
      installerBtn.parentElement.remove();
    }

    loadedExtensions.clear();
    console.log("✅ Calendar Suite Installer unloaded");
  },
};
