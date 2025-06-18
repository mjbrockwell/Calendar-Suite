// ===================================================================
// 🗓️ YEARLY VIEW EXTENSION 2.0 - STEP 4: SMART CALENDAR DEPLOYMENT
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
// 🏷️ TAG CONFIGURATION LOADING (NEW IN STEP 5)
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
// 🏗️ COMPONENT DEPLOYMENT INFRASTRUCTURE (FROM STEPS 1-3)
// ===================================================================

function getComponentUid() {
  // Return the UID of the deployed Hello World component
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

  const searchStrings = [
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

async function deployHelloWorldComponent() {
  console.log("🚀 Deploying Hello World component...");

  // Check for existing component first
  const existing = findExistingYearlyViewComponent();
  if (existing) {
    console.log("✅ Component already exists, skipping deployment");
    window._yearlyViewComponentUid = existing.uid;
    return { componentUid: existing.uid, renderString: existing.renderString };
  }

  const componentCode = `\`\`\`clojure
(ns yearlyview2.hello)

(defn main [{:keys [block-uid]} & args]
  [:div 
    {:style {:padding "20px"
             :border "2px dashed #4A90E2"
             :border-radius "8px"
             :background-color "#F8F9FA"
             :text-align "center"
             :margin "10px 0"}}
    [:h3 {:style {:color "#2E7D32" :margin "0 0 10px 0"}} 
     "🗓️ Yearly View 2.0 - Step 4"]
    [:p {:style {:color "#555" :margin "5px 0"}} 
     "Hello, World! I am the Yearly View 2.0 placeholder component"]
    [:p {:style {:color "#777" :font-size "14px" :margin "10px 0"}} 
     "✅ Smart calendar deployment now active!"]
    [:p {:style {:color "#777" :font-size "12px" :margin "5px 0"}} 
     "Visit year pages (like [[2024]], [[2025]]) to test deployment logic"]
    [:div {:style {:margin-top "15px" :font-size "12px" :color "#888"}}
     [:div "Component UID: " block-uid]
     [:div "Status: Ready for Step 5 (Tag Integration)"]]])
\`\`\``;

  try {
    // Get or create roam/render page with proper error checking
    let currentUid =
      window.CalendarUtilities.RoamUtils.getPageUid("roam/render");
    console.log("🔍 roam/render page UID:", currentUid);

    if (!currentUid) {
      console.log("📄 Creating roam/render page...");
      // Try to create the page
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

    console.log("✅ Component deployed successfully");
    window._yearlyViewComponentUid = componentUid;

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
// 🎯 ENHANCED PAGE DETECTION SYSTEM (UPDATED FOR STEP 4)
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
    // Register year page detection with UPDATED callback
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
        handleYearPageDetected // NEW: Use smart deployment callback
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
// 🏗️ CALENDAR FOUNDATION INTEGRATION (FROM STEPS 1-3)
// ===================================================================

function registerWithCalendarFoundation() {
  console.log("🏗️ Registering with Calendar Foundation...");

  try {
    const extensionConfig = {
      id: "yearly-view-v2",
      name: "Yearly View 2.0",
      version: "2.0.0-step5",
      dependencies: ["calendar-utilities", "unified-config"],
      status: "Step 5: Tag Configuration Integration",
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
// 🎛️ ENHANCED COMMAND PALETTE SYSTEM (UPDATED FOR STEP 4)
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
          console.log("Status: Step 4 - Smart deployment active");
          console.groupEnd();

          alert(
            `📋 Yearly View Component Info:\n\nUID: ${componentUid}\n\nRender String: ${renderString}\n\nStatus: Step 4 - Smart deployment active`
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
    // NEW COMMANDS FOR STEP 5
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
                .join(", ")}\n\nReady for Step 6 (Real Component).`
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
      "🗓️ Yearly View Extension 2.0 - Step 5: Tag Configuration Integration"
    );
    console.log("🚀 Loading extension with tag configuration support...");

    try {
      // Step 1: Verify all dependencies
      checkRequiredDependencies();

      // Step 2: Deploy or find Hello World component
      const componentResult = await deployHelloWorldComponent();

      // Step 3: Register with Calendar Foundation
      const foundationRegistered = registerWithCalendarFoundation();

      // Step 4: Setup page detection with smart deployment
      const pageDetectionSetup = setupCentralPageDetection();

      // NEW STEP 5: Load tag configuration
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
      console.log("🎉 Yearly View Extension 2.0 - Step 5 loaded successfully!");
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
      console.log("🚀 Step 5 Features Active:");
      console.log("• Tag configuration loading from UnifiedConfigUtils");
      console.log("• Console display of available yearly tags");
      console.log("• Tag data prepared for real component");
      console.log("• New commands: Show/Reload Tag Configuration");
      console.log("");
      console.log("🧪 Testing Instructions:");
      console.log("1. Use 'Yearly View: Show Tag Configuration' command");
      console.log("2. Use 'Yearly View: Reload Tag Configuration' command");
      console.log("3. Visit year pages (still works from Step 4)");
      console.log("4. Check console for tag configuration details");
      console.log("");
      console.log("📍 Next Baby Steps:");
      console.log("• Step 6: Real ClojureScript component replacement");
      console.log("• Full yearly calendar with tag integration");
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
    console.log("🗓️ Yearly View Extension 2.0 - Step 5: Unloading...");
    console.log(
      "✅ Extension unloaded (automatic cleanup handled by Calendar Foundation)"
    );
  },
};

// Export for Roam
export default extension;
