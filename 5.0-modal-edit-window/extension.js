// ===================================================================
// 🎯 ROAM CALENDAR SUITE - USER SETUP MODAL EXTENSION v2.1
// ===================================================================
// Extension 5: Event Type Configuration Modal
//
// 🌟 THE CROWN JEWEL - Complete user customization interface!
// ✨ NOW WITH: Simple Button Manager v3.1 Integration
//
// ✨ BUILT ON MODERN INFRASTRUCTURE:
// - 🎯 Calendar Foundation v2.0 (Central page detection + auto cleanup)
// - 🔧 Calendar Utilities v1.2 (Professional Roam operations)
// - 📋 UnifiedConfigUtils (Tag configuration management)
// - 🎨 Simple Button Extension Manager v3.1 (Professional button styling)
//
// Features:
// - 🎨 Beautiful modal for editing all 10 event types (#yv0 - #yv9)
// - 🖱️ Click-to-edit names, colors, and emojis
// - 💾 Save changes directly to config page
// - 🎯 Professional compound button with Calendar Suite styling
// - 🧹 Automatic resource cleanup
// ===================================================================

console.log(
  "🎨 Loading User Setup Modal Extension v2.1 (Simple Button Manager Integration)..."
);

// ===================================================================
// 🔧 DEPENDENCY VERIFICATION
// ===================================================================

/**
 * Verify all required dependencies are available
 */
function checkRequiredDependencies() {
  const missing = [];
  const warnings = [];

  // Required dependencies
  if (!window.CalendarSuite) missing.push("Calendar Foundation v2.0");
  if (!window.CalendarUtilities) missing.push("Calendar Utilities v1.2");
  if (!window.UnifiedConfigUtils) missing.push("UnifiedConfigUtils");
  if (!window.roamAlphaAPI) missing.push("Roam Alpha API");

  // Optional but recommended dependencies
  if (!window.SimpleExtensionButtonManager) {
    warnings.push("Simple Button Extension Manager v3.1 (will use fallback)");
  }

  if (missing.length > 0) {
    const error = `❌ Missing required dependencies: ${missing.join(", ")}`;
    console.error(error);
    throw new Error(error);
  }

  if (warnings.length > 0) {
    console.warn(`⚠️ Optional dependencies missing: ${warnings.join(", ")}`);
  }

  // Check specific components
  if (!window.CalendarSuite.pageDetector) {
    throw new Error("❌ Calendar Foundation page detector not available");
  }

  console.log("✅ All required dependencies verified");
  if (warnings.length === 0) {
    console.log(
      "✅ All optional dependencies available - using Simple Button Manager"
    );
  }

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
      <strong>Usage example:</strong> <code>[📆]([[January 1st, 2025]]) #yv0 Team meeting at 2pm</code>
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

  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(table);
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);

  return modal;
}

// ===================================================================
// 🎯 SIMPLE BUTTON MANAGER INTEGRATION
// ===================================================================

// 🎯 CALENDAR SUITE STYLING: Pale sky blue with deep navy accents
const calendarButtonStyle = {
  background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", // Pale sky blue gradient
  border: "1.5px solid #1e3a8a", // Deep navy border
  color: "#1e3a8a", // Deep navy text
  fontWeight: "600",
  padding: "10px 16px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)", // Soft blue shadow
};

/**
 * Extract the modal opening logic into its own function
 */
async function openConfigurationModal() {
  try {
    console.log("🎨 Opening event type configuration modal...");
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
}

/**
 * Setup Simple Button Manager integration
 */
async function setupSimpleButtonIntegration() {
  try {
    console.log("🎨 Initializing Simple Button Manager integration...");

    // Initialize Simple Button Manager
    const buttonManager = new window.SimpleExtensionButtonManager(
      "EventTypeConfig"
    );
    await buttonManager.initialize();

    // Register the event types compound button with Calendar Suite styling
    const buttonResult = await buttonManager.registerButton({
      id: "event-types-config",

      // Compound button with professional appearance
      sections: [
        {
          type: "icon",
          content: "🎨",
          tooltip: "Event Type Configuration",
          style: {
            ...calendarButtonStyle,
            borderRight: "1px solid #1e3a8a",
            borderTopRightRadius: "0",
            borderBottomRightRadius: "0",
            padding: "8px 12px",
            minWidth: "40px",
          },
          onClick: async () => {
            await openConfigurationModal();
          },
        },
        {
          type: "main",
          content: "Event Types",
          tooltip: "Configure all 10 event types (#yv0 - #yv9)",
          style: {
            ...calendarButtonStyle,
            border: "1.5px solid #1e3a8a",
            borderLeft: "none",
            borderTopLeftRadius: "0",
            borderBottomLeftRadius: "0",
            borderTopRightRadius: "0",
            borderBottomRightRadius: "0",
            padding: "8px 16px",
            flex: "1",
          },
          onClick: async () => {
            await openConfigurationModal();
          },
        },
      ],

      // Show on monthly pages and config page
      showOn: ["isMonthlyPage", "isConfigPage"],

      // Position in top-left stack
      stack: "top-left",

      // High priority to appear first
      priority: true,
    });

    if (buttonResult.success) {
      console.log(
        "✅ Event Types compound button registered with Simple Button Manager"
      );

      // Register button manager for cleanup with existing registry system
      dispatchToRegistry({
        customCleanups: [
          () => {
            console.log("🧹 Cleaning up Simple Button Manager integration");
            buttonManager.cleanup();
          },
        ],
      });

      return true;
    } else {
      throw new Error("Failed to register button with Simple Button Manager");
    }
  } catch (error) {
    console.error(
      "❌ Error setting up Simple Button Manager integration:",
      error
    );

    // Fallback to original floating button if Simple Button Manager fails
    console.log("🔄 Falling back to original floating button system");
    return setupFallbackButton();
  }
}

/**
 * Setup custom page conditions for Simple Button Manager
 */
function setupCustomPageConditions() {
  // Extend ButtonConditions if needed for config page detection
  if (window.ButtonConditions) {
    // Add custom config page condition
    window.ButtonConditions.isConfigPage = () => {
      const pageTitle = window.getCurrentPageTitle?.() || document.title;
      return pageTitle === "roam/ext/calendar suite/config";
    };

    console.log(
      "✅ Custom page conditions registered for Simple Button Manager"
    );
  }
}

/**
 * Fallback button system (original floating button for compatibility)
 */
function setupFallbackButton() {
  console.log("⚠️ Using fallback floating button system");

  let currentButton = null;

  // Function to show button on correct pages
  const showButton = () => {
    if (!currentButton) {
      currentButton = createFallbackFloatingButton();

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
        const monthPattern =
          /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
        return monthPattern.test(pageTitle);
      },
      () => {
        console.log(
          "🎨 Month page detected - showing event types button (fallback)"
        );
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
        console.log(
          "🎨 Config page detected - showing event types button (fallback)"
        );
        showButton();
      }
    );

  // Register listener for ALL other pages to hide button
  const otherPageUnregister =
    window.CalendarSuite.pageDetector.registerPageListener(
      "other-pages",
      (pageTitle) => {
        const monthPattern =
          /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
        const isMonthPage = monthPattern.test(pageTitle);
        const isConfigPage = pageTitle === "roam/ext/calendar suite/config";

        return !isMonthPage && !isConfigPage;
      },
      () => {
        console.log(
          "🎨 Non-calendar page detected - hiding event types button (fallback)"
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

  return true;
}

/**
 * Create fallback floating button with Calendar Suite styling
 */
function createFallbackFloatingButton() {
  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "calendar-setup-button";
  buttonContainer.title = "Click here to configure event types";

  // Create compound-style button with Calendar Suite styling
  const iconSection = document.createElement("div");
  iconSection.style.cssText = `
    ${Object.entries(calendarButtonStyle)
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`
      )
      .join("; ")};
    border-right: 1px solid #1e3a8a;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 200ms ease;
    font-size: 16px;
  `;
  iconSection.textContent = "🎨";

  const textSection = document.createElement("div");
  textSection.style.cssText = `
    ${Object.entries(calendarButtonStyle)
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`
      )
      .join("; ")};
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 200ms ease;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  textSection.textContent = "Event Types";

  // Container styling
  buttonContainer.style.cssText = `
    position: absolute;
    top: 10px;
    left: 20px;
    display: flex;
    align-items: center;
    z-index: 9999;
    transition: all 0.2s ease;
  `;

  // Hover effects
  const addHoverEffect = (element) => {
    element.addEventListener("mouseenter", () => {
      element.style.transform = "translateY(-1px)";
      element.style.opacity = "0.9";
    });
    element.addEventListener("mouseleave", () => {
      element.style.transform = "translateY(0)";
      element.style.opacity = "1";
    });
  };

  addHoverEffect(iconSection);
  addHoverEffect(textSection);

  // Click handlers
  const clickHandler = async () => {
    await openConfigurationModal();
  };

  iconSection.addEventListener("click", clickHandler);
  textSection.addEventListener("click", clickHandler);

  // Assemble button
  buttonContainer.appendChild(iconSection);
  buttonContainer.appendChild(textSection);

  return buttonContainer;
}

/**
 * Setup central page detection using Simple Button Manager or fallback
 */
function setupCentralPageDetection() {
  console.log("🎯 Setting up button display system...");

  // Setup custom page conditions first
  setupCustomPageConditions();

  // Try Simple Button Manager integration, fallback if needed
  if (window.SimpleExtensionButtonManager) {
    console.log(
      "✅ Simple Button Manager available - using professional compound button"
    );
    setupSimpleButtonIntegration();
  } else {
    console.log(
      "⚠️ Simple Button Manager not available - using fallback button"
    );
    setupFallbackButton();
  }

  console.log("✅ Button display system setup complete");
  return true;
}

// ===================================================================
// 🎯 COMMAND PALETTE INTEGRATION
// ===================================================================

/**
 * Setup command palette commands
 */
function setupCommandPalette() {
  const commands = [
    {
      label: "🎨 Event Types: Open Configuration Modal",
      callback: async () => {
        await openConfigurationModal();
      },
    },
    {
      label: "🎨 Event Types: Show Current Configuration",
      callback: async () => {
        try {
          const tagConfigs = await loadTagConfigurations();

          let configText = "🎨 Current Event Type Configuration:\n\n";
          Object.entries(tagConfigs).forEach(([tagId, config]) => {
            configText += `#${tagId}: ${config.emoji} ${config.name} (Text: ${config.textColor}, Background: ${config.backgroundColor})\n`;
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

// ===================================================================
// 🧹 RESOURCE CLEANUP MANAGEMENT
// ===================================================================

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
    console.group(
      "🎨 User Setup Modal Extension v2.1 - Simple Button Manager Integration"
    );
    console.log("🚀 Loading crown jewel with professional button styling...");

    try {
      // Step 1: Verify all dependencies (including Simple Button Manager)
      checkRequiredDependencies();

      // Step 2: Setup central page detection (now uses Simple Button Manager when available)
      setupCentralPageDetection();

      // Step 3: Setup command palette (unchanged)
      setupCommandPalette();

      console.log("");
      console.log("🎉 User Setup Modal Extension v2.1 loaded successfully!");
      console.log("🎯 Features:");
      console.log("  - ✨ NEW: Simple Button Manager v3.1 integration");
      console.log(
        "  - 🎨 NEW: Calendar Suite styling (pale sky blue with deep navy)"
      );
      console.log("  - 🔧 NEW: Professional compound button design");
      console.log("  - 🎯 Zero-polling page detection via Calendar Foundation");
      console.log("  - 🧹 Automatic resource cleanup");
      console.log("  - 🎨 Beautiful modal interface for tag customization");
      console.log("  - 📍 Smart fallback for compatibility");
      console.log("");
      console.log("📍 Usage:");
      console.log("  - Navigate to any month page (e.g., 'January 2025')");
      console.log("  - Navigate to 'roam/ext/calendar suite/config'");
      console.log("  - Click the '🎨 Event Types' compound button in top-left");
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
    console.log("🎨 User Setup Modal Extension v2.1 unloading...");

    // Calendar Foundation will handle all cleanup automatically via registry
    // Simple Button Manager cleanup is also registered in the registry

    console.log(
      "✅ User Setup Modal Extension v2.1 unloaded (auto-cleanup complete)"
    );
  },
};

// Export for Roam
export default extension;
