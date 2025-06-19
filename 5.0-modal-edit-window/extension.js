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
export default extension;
