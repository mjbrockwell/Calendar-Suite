// ===================================================================
// 🔧 DEBUG VERSION - YEARLY VIEW EXTENSION 2.0 - DEPLOYMENT DEBUGGING
// ===================================================================

// ===================================================================
// 🧪 DEPENDENCY VERIFICATION SYSTEM
// ===================================================================

function checkRequiredDependencies() {
  console.log("🔍 DEBUG: Checking required dependencies...");

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
    console.log(`✅ DEBUG: ${dep.name}: Available`);
  }

  return true;
}

// ===================================================================
// 🌐 EXTERNAL CLOJURESCRIPT ASSET FETCHING - DEBUGGED
// ===================================================================

async function fetchClojureScriptComponent() {
  console.log("🌐 DEBUG: Fetching real ClojureScript component from GitHub...");

  const GITHUB_URL =
    "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/4.0-yearly-view/yearly-view-component.cljs";

  try {
    console.log(`📥 DEBUG: Starting fetch from: ${GITHUB_URL}`);

    const response = await fetch(GITHUB_URL);
    console.log("🔍 DEBUG: Response status:", response.status);
    console.log("🔍 DEBUG: Response ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const clojureScriptCode = await response.text();
    console.log("🔍 DEBUG: Fetched content length:", clojureScriptCode.length);

    // Basic validation
    if (!clojureScriptCode || clojureScriptCode.length < 100) {
      throw new Error("Fetched content appears to be invalid or empty");
    }

    const containsNamespace = clojureScriptCode.includes("yearly-view-v2.core");
    if (!containsNamespace) {
      throw new Error(
        "Fetched content doesn't appear to be the yearly view component"
      );
    }

    console.log("✅ DEBUG: Successfully fetched ClojureScript component");
    const componentCode = `\`\`\`clojure\n${clojureScriptCode}\n\`\`\``;
    return componentCode;
  } catch (error) {
    console.error("❌ DEBUG: Failed to fetch ClojureScript component:", error);

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
    [:div {:style {:margin-top "15px" :padding "10px" :background "#fff" :border-radius "4px"}}
     [:p {:style {:font-size "12px" :color "#666" :margin "5px 0"}}
      "Troubleshooting:"]
     [:ul {:style {:text-align "left" :font-size "11px" :color "#666"}}
      [:li "Check internet connection"]
      [:li "Verify GitHub repository is public and accessible"]
      [:li "Check browser console for detailed error information"]
      [:li "Try refreshing the page"]]]])
\`\`\``;

    return fallbackComponent;
  }
}

// ===================================================================
// 🔧 ENHANCED HIERARCHY DEBUGGING FUNCTIONS
// ===================================================================

function debugRoamRenderPageStructure() {
  console.group("🔍 DEBUG: Analyzing roam/render page structure");

  const renderPageUid =
    window.CalendarUtilities.RoamUtils.getPageUid("roam/render");
  console.log("📄 DEBUG: roam/render page UID:", renderPageUid);

  if (!renderPageUid) {
    console.log("❌ DEBUG: roam/render page does not exist");
    console.groupEnd();
    return { pageExists: false };
  }

  // Get all direct children of roam/render page
  const childrenQuery = `[:find ?childUid ?childString :where 
                          [?page :block/uid "${renderPageUid}"] 
                          [?child :block/parents ?page] 
                          [?child :block/uid ?childUid]
                          [?child :block/string ?childString]]`;

  const children = window.roamAlphaAPI.q(childrenQuery);
  console.log(`🔍 DEBUG: Found ${children.length} direct children:`, children);

  // Look for our target hierarchy
  let extensionsBlock = null;
  for (const [childUid, childString] of children) {
    console.log(`  - "${childString}" (${childUid})`);
    if (childString === "**Components added by Extensions:**") {
      extensionsBlock = { uid: childUid, string: childString };
      console.log("✅ DEBUG: Found Extensions block!");
    }
  }

  if (extensionsBlock) {
    // Check children of Extensions block
    const extensionsChildrenQuery = `[:find ?childUid ?childString :where 
                                      [?parent :block/uid "${extensionsBlock.uid}"] 
                                      [?child :block/parents ?parent] 
                                      [?child :block/uid ?childUid]
                                      [?child :block/string ?childString]]`;

    const extensionsChildren = window.roamAlphaAPI.q(extensionsChildrenQuery);
    console.log(
      `🔍 DEBUG: Extensions block has ${extensionsChildren.length} children:`,
      extensionsChildren
    );

    let calendarSuiteBlock = null;
    for (const [childUid, childString] of extensionsChildren) {
      console.log(`    - "${childString}" (${childUid})`);
      if (childString === "**Added by Calendar Suite extension:**") {
        calendarSuiteBlock = { uid: childUid, string: childString };
        console.log("✅ DEBUG: Found Calendar Suite block!");
      }
    }

    if (calendarSuiteBlock) {
      // Check children of Calendar Suite block
      const calendarSuiteChildrenQuery = `[:find ?childUid ?childString :where 
                                           [?parent :block/uid "${calendarSuiteBlock.uid}"] 
                                           [?child :block/parents ?parent] 
                                           [?child :block/uid ?childUid]
                                           [?child :block/string ?childString]]`;

      const calendarSuiteChildren = window.roamAlphaAPI.q(
        calendarSuiteChildrenQuery
      );
      console.log(
        `🔍 DEBUG: Calendar Suite block has ${calendarSuiteChildren.length} children:`,
        calendarSuiteChildren
      );

      let yearlyViewBlock = null;
      for (const [childUid, childString] of calendarSuiteChildren) {
        console.log(`      - "${childString}" (${childUid})`);
        if (childString === "**Yearly View 2.0:**") {
          yearlyViewBlock = { uid: childUid, string: childString };
          console.log("✅ DEBUG: Found Yearly View block!");
        }
      }

      if (yearlyViewBlock) {
        // Check for component block
        const componentQuery = `[:find ?childUid ?childString :where 
                                [?parent :block/uid "${yearlyViewBlock.uid}"] 
                                [?child :block/parents ?parent] 
                                [?child :block/uid ?childUid]
                                [?child :block/string ?childString]]`;

        const componentChildren = window.roamAlphaAPI.q(componentQuery);
        console.log(
          `🔍 DEBUG: Yearly View block has ${componentChildren.length} children:`,
          componentChildren
        );

        for (const [childUid, childString] of componentChildren) {
          const isClojureCode = childString.includes("```clojure");
          console.log(
            `        - ${
              isClojureCode ? "CLOJURE COMPONENT" : "OTHER"
            } (${childUid})`
          );
          console.log(`          Content length: ${childString.length}`);
          if (isClojureCode) {
            console.log(
              `          Contains namespace: ${childString.includes(
                "yearly-view-v2.core"
              )}`
            );
          }
        }
      }
    }
  }

  console.groupEnd();

  return {
    pageExists: true,
    extensionsBlock,
    totalChildren: children.length,
    hierarchyComplete: !!extensionsBlock,
  };
}

async function debugHierarchyCreation() {
  console.group("🔧 DEBUG: Testing hierarchy creation step by step");

  try {
    // Get roam/render page UID
    let renderPageUid =
      window.CalendarUtilities.RoamUtils.getPageUid("roam/render");
    console.log("📄 DEBUG: roam/render page UID:", renderPageUid);

    if (!renderPageUid) {
      console.log("📄 DEBUG: Creating roam/render page...");
      renderPageUid = await window.CalendarUtilities.RoamUtils.createPage(
        "roam/render"
      );
      console.log("✅ DEBUG: Created roam/render page UID:", renderPageUid);
    }

    // Define the exact hierarchy we want to create
    const hierarchy = [
      "**Components added by Extensions:**",
      "**Added by Calendar Suite extension:**",
      "**Yearly View 2.0:**",
    ];

    let currentParentUid = renderPageUid;

    // Build hierarchy step by step with detailed debugging
    for (let i = 0; i < hierarchy.length; i++) {
      const levelText = hierarchy[i];
      console.log(
        `🏗️ DEBUG: Processing hierarchy level ${i + 1}: "${levelText}"`
      );
      console.log(`🔍 DEBUG: Current parent UID: "${currentParentUid}"`);

      // Check for existing child with this text
      const findChildQuery = `[:find ?childUid ?childString :where 
                              [?parent :block/uid "${currentParentUid}"] 
                              [?child :block/parents ?parent] 
                              [?child :block/uid ?childUid]
                              [?child :block/string ?childString]]`;

      console.log(`🔍 DEBUG: Child search query: ${findChildQuery}`);

      const existingChildren = window.roamAlphaAPI.q(findChildQuery);
      console.log(
        `🔍 DEBUG: Found ${existingChildren.length} existing children:`,
        existingChildren
      );

      // Look for exact match
      let foundChild = null;
      for (const [childUid, childString] of existingChildren) {
        console.log(
          `🔍 DEBUG: Checking child "${childString}" vs expected "${levelText}"`
        );
        if (childString === levelText) {
          foundChild = childUid;
          console.log(`✅ DEBUG: Found matching child: ${childUid}`);
          break;
        }
      }

      if (foundChild) {
        currentParentUid = foundChild;
        console.log(
          `✅ DEBUG: Using existing level "${levelText}" with UID: ${currentParentUid}`
        );
      } else {
        // Create new block
        const newBlockUid = window.CalendarUtilities.RoamUtils.generateUID();
        console.log(
          `🆕 DEBUG: Creating new level "${levelText}" with UID: ${newBlockUid}`
        );
        console.log(`🔍 DEBUG: Parent UID for creation: ${currentParentUid}`);

        // Get current children count for proper ordering
        const childCountQuery = `[:find (count ?child) . :where 
                                [?parent :block/uid "${currentParentUid}"] 
                                [?child :block/parents ?parent]]`;
        const childCount = window.roamAlphaAPI.q(childCountQuery) || 0;
        console.log(`🔍 DEBUG: Current child count: ${childCount}`);

        const createParams = {
          location: {
            "parent-uid": currentParentUid,
            order: childCount, // Add to end
          },
          block: {
            uid: newBlockUid,
            string: levelText,
          },
        };
        console.log(`🔍 DEBUG: Create block params:`, createParams);

        console.log(`🚀 DEBUG: Attempting to create block...`);
        const createResult = await window.roamAlphaAPI.data.block.create(
          createParams
        );
        console.log(`✅ DEBUG: Block creation result:`, createResult);

        // Add small delay to ensure creation is complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify the block was created
        const verifyQuery = `[:find ?string . :where [?b :block/uid "${newBlockUid}"] [?b :block/string ?string]]`;
        const verifyResult = window.roamAlphaAPI.q(verifyQuery);
        console.log(`🔍 DEBUG: Verification result: "${verifyResult}"`);

        if (!verifyResult) {
          throw new Error(`Failed to verify creation of block ${newBlockUid}`);
        }

        currentParentUid = newBlockUid;
        console.log(
          `✅ DEBUG: Created and verified level "${levelText}" with UID: ${currentParentUid}`
        );
      }

      // Add small delay between hierarchy levels
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log(
      `✅ DEBUG: Hierarchy creation complete. Final parent UID: ${currentParentUid}`
    );
    console.groupEnd();
    return currentParentUid;
  } catch (error) {
    console.error(`❌ DEBUG: Error in hierarchy creation:`, error);
    console.groupEnd();
    throw error;
  }
}

// ===================================================================
// 🎛️ DEBUG COMMAND PALETTE SYSTEM
// ===================================================================

function setupDebugCommands() {
  console.log("🎛️ DEBUG: Setting up debug command palette...");

  const debugCommands = [
    {
      label: "DEBUG: Analyze roam/render Structure",
      callback: () => {
        const analysis = debugRoamRenderPageStructure();
        console.log("📋 DEBUG: Structure analysis complete");

        alert(
          `📋 roam/render Structure Analysis:\n\n` +
            `Page exists: ${analysis.pageExists}\n` +
            (analysis.pageExists
              ? `Total children: ${analysis.totalChildren}\n` +
                `Extensions block found: ${!!analysis.extensionsBlock}\n` +
                `Hierarchy complete: ${analysis.hierarchyComplete}\n\n` +
                `Check console for detailed structure information.`
              : `roam/render page needs to be created.`)
        );
      },
    },
    {
      label: "DEBUG: Test Hierarchy Creation",
      callback: async () => {
        try {
          console.log("🧪 DEBUG: Starting hierarchy creation test...");
          const finalParentUid = await debugHierarchyCreation();

          alert(
            `✅ Hierarchy Creation Test Complete!\n\n` +
              `Final parent UID: ${finalParentUid}\n\n` +
              `Check console for detailed step-by-step information.\n\n` +
              `Next step would be to create the component block under this UID.`
          );
        } catch (error) {
          console.error("❌ DEBUG: Hierarchy creation test failed:", error);
          alert(
            `❌ Hierarchy Creation Test Failed:\n\n${error.message}\n\nCheck console for detailed error information.`
          );
        }
      },
    },
    {
      label: "DEBUG: Force Create Component",
      callback: async () => {
        const confirm = window.confirm(
          "🔧 Force create component using debug logic?\n\n" +
            "This will use the enhanced debugging deployment function.\n\n" +
            "Click OK to proceed, Cancel to abort."
        );

        if (confirm) {
          try {
            console.log("🔧 DEBUG: Starting force component creation...");
            const result = await deployYearlyViewComponentWithDebug();
            console.log("✅ DEBUG: Force component creation result:", result);
          } catch (error) {
            console.error("❌ DEBUG: Force component creation failed:", error);
          }
        }
      },
    },
    {
      label: "DEBUG: Test API Calls",
      callback: async () => {
        console.group("🧪 DEBUG: Testing basic API calls");

        try {
          // Test basic query
          console.log("🔍 Testing basic query...");
          const testQuery = `[:find ?title :where [?page :node/title ?title] [(clojure.string/starts-with? ?title "roam/")]]`;
          const queryResult = window.roamAlphaAPI.q(testQuery);
          console.log("✅ Basic query works, found pages:", queryResult.length);

          // Test generateUID
          console.log("🔍 Testing UID generation...");
          const testUid = window.CalendarUtilities.RoamUtils.generateUID();
          console.log("✅ UID generation works:", testUid);

          // Test roam/render page access
          console.log("🔍 Testing roam/render page access...");
          const renderPageUid =
            window.CalendarUtilities.RoamUtils.getPageUid("roam/render");
          console.log("✅ roam/render page UID:", renderPageUid);

          // Test block creation capability
          console.log("🔍 Testing block creation capability...");
          if (renderPageUid) {
            console.log("✅ Ready for block creation operations");
          } else {
            console.log("⚠️ roam/render page needs to be created first");
          }

          alert(
            "🧪 API Test Results:\n\n" +
              `Basic queries: ✅ Working\n` +
              `UID generation: ✅ Working\n` +
              `roam/render access: ${
                renderPageUid ? "✅ Available" : "⚠️ Needs creation"
              }\n` +
              `Block creation: ${
                renderPageUid ? "✅ Ready" : "⚠️ Pending page creation"
              }\n\n` +
              `Check console for detailed test information.`
          );
        } catch (error) {
          console.error("❌ DEBUG: API test failed:", error);
          alert(
            `❌ API Test Failed:\n\n${error.message}\n\nCheck console for details.`
          );
        }

        console.groupEnd();
      },
    },
    {
      label: "DEBUG: Clear Component Cache",
      callback: () => {
        delete window._yearlyViewComponentUid;
        console.log("🔄 DEBUG: Cleared component UID cache");
        alert(
          "🔄 Component UID cache cleared.\n\nNext deployment will create a fresh component."
        );
      },
    },
  ];

  // Register debug commands
  for (const cmd of debugCommands) {
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: cmd.label,
      callback: cmd.callback,
    });
  }

  console.log(`✅ DEBUG: Added ${debugCommands.length} debug commands`);
  return debugCommands;
}

// ===================================================================
// 🔧 ENHANCED DEPLOYMENT FUNCTION WITH DEBUG
// ===================================================================

async function deployYearlyViewComponentWithDebug() {
  console.log(
    "🚀 DEBUG: Starting component deployment with enhanced debugging..."
  );

  try {
    // Fetch the real component from GitHub
    console.log("🌐 DEBUG: Fetching component from GitHub...");
    const componentCode = await fetchClojureScriptComponent();
    console.log(
      "✅ DEBUG: Component fetched successfully, length:",
      componentCode.length
    );

    // Create the hierarchy with debugging
    console.log("🏗️ DEBUG: Creating hierarchy...");
    const hierarchyParentUid = await debugHierarchyCreation();
    console.log(
      "✅ DEBUG: Hierarchy created, final parent UID:",
      hierarchyParentUid
    );

    // Create the component block under the hierarchy
    console.log("🎯 DEBUG: Creating component block...");
    const componentUid = window.CalendarUtilities.RoamUtils.generateUID();
    console.log("🔍 DEBUG: Generated component UID:", componentUid);

    const componentCreateParams = {
      location: { "parent-uid": hierarchyParentUid, order: 0 },
      block: { uid: componentUid, string: componentCode },
    };

    console.log("🔍 DEBUG: Component creation params:", {
      location: componentCreateParams.location,
      block: {
        uid: componentCreateParams.block.uid,
        stringLength: componentCreateParams.block.string.length,
      },
    });

    console.log("🚀 DEBUG: Creating component block...");
    const componentCreateResult = await window.roamAlphaAPI.data.block.create(
      componentCreateParams
    );
    console.log(
      "✅ DEBUG: Component block creation result:",
      componentCreateResult
    );

    // Add delay to ensure creation is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify the component was created properly
    const componentVerifyQuery = `[:find ?string . :where [?b :block/uid "${componentUid}"] [?b :block/string ?string]]`;
    const componentVerifyResult = window.roamAlphaAPI.q(componentVerifyQuery);
    console.log(
      "🔍 DEBUG: Component verification - content length:",
      componentVerifyResult ? componentVerifyResult.length : "null"
    );

    if (!componentVerifyResult) {
      throw new Error(
        `Failed to verify creation of component block ${componentUid}`
      );
    }

    console.log("✅ DEBUG: Real component deployed successfully!");
    window._yearlyViewComponentUid = componentUid;

    // Show success message
    setTimeout(() => {
      alert(
        "🎉 DEBUG: Real Yearly View Component Deployed!\n\n" +
          `Component UID: ${componentUid}\n\n` +
          "The full interactive calendar is now available.\n\n" +
          "Visit year pages like [[2024]] or [[2025]] to see the calendar in action!"
      );
    }, 500);

    return {
      componentUid: componentUid,
      renderString: `{{roam/render: ((${componentUid}))}}`,
    };
  } catch (error) {
    console.error("❌ DEBUG: Component deployment failed:", error);
    console.error("❌ DEBUG: Error stack:", error.stack);

    // Show detailed error to user
    setTimeout(() => {
      alert(
        `❌ DEBUG: Component Deployment Failed!\n\n` +
          `Error: ${error.message}\n\n` +
          `Check browser console for detailed debugging information.`
      );
    }, 500);

    throw error;
  }
}

// ===================================================================
// 🚀 DEBUG EXTENSION OBJECT
// ===================================================================

const debugExtension = {
  onload: async () => {
    console.group(
      "🔧 DEBUG: Yearly View Extension 2.0 - Deployment Debugging Mode"
    );
    console.log(
      "🚀 Loading extension in DEBUG mode for deployment troubleshooting..."
    );

    try {
      // Step 1: Verify all dependencies
      checkRequiredDependencies();

      // Step 2: Setup debug command palette
      const debugCommands = setupDebugCommands();

      // Step 3: Analyze current state
      console.log("🔍 DEBUG: Analyzing current roam/render structure...");
      const structureAnalysis = debugRoamRenderPageStructure();

      // Final status report
      console.log("");
      console.log("🔧 DEBUG Extension loaded successfully!");
      console.log("📊 Debug Status Summary:");
      console.log("✅ Dependencies:", "All satisfied");
      console.log("✅ Debug Commands Added:", debugCommands.length);
      console.log(
        "✅ Structure Analysis:",
        structureAnalysis.hierarchyComplete ? "Complete" : "Needs work"
      );
      console.log("");
      console.log("🧪 Debug Testing Instructions:");
      console.log(
        "1. Use 'DEBUG: Analyze roam/render Structure' to examine current state"
      );
      console.log(
        "2. Use 'DEBUG: Test Hierarchy Creation' to test hierarchy building"
      );
      console.log(
        "3. Use 'DEBUG: Force Create Component' to deploy with debugging"
      );
      console.log(
        "4. Use 'DEBUG: Test API Calls' to verify basic functionality"
      );
      console.log("");
      console.log("🔍 Focus Areas:");
      console.log("• Hierarchy creation and block relationships");
      console.log("• API call success and error handling");
      console.log("• Datalog query correctness");
      console.log("• Component deployment process");
      console.groupEnd();
    } catch (error) {
      console.error("❌ DEBUG: Extension failed to load:", error);
      console.groupEnd();
      throw error;
    }
  },

  onunload: () => {
    console.log(
      "🔧 DEBUG: Yearly View Extension 2.0 - Debug mode unloading..."
    );
    console.log("✅ DEBUG: Extension unloaded");
  },
};

// Export for Roam
export default debugExtension;
