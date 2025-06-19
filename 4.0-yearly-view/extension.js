// ===================================================================
// 🗓️ YEARLY VIEW EXTENSION 2.0 - WITH INTEGRATED CSS HANDLER
// Features: Real ClojureScript component + Dynamic Tag CSS
// ===================================================================

// ===================================================================
// 🎨 INTEGRATED CALENDAR TAG CSS HANDLER
// ===================================================================

class CalendarTagCSSHandler {
  constructor() {
    this.styleElement = null;
    this.configPageTitle = "roam/ext/calendar suite/config";
    this.currentConfig = {};
    this.debugMode = true; // Enable debugging for troubleshooting
    console.log("🎨 [CSS Handler] Constructor called - handler created");
  }

  async loadConfiguration() {
    try {
      console.log("🎨 [CSS Handler] loadConfiguration() called");
      console.log("🎨 [CSS Handler] Config page title:", this.configPageTitle);

      const configFromPage = await this.loadConfigFromPage();
      console.log(
        "🎨 [CSS Handler] loadConfigFromPage returned:",
        configFromPage
      );

      if (configFromPage && Object.keys(configFromPage).length > 0) {
        this.currentConfig = configFromPage;
        console.log(
          `🎨 [CSS Handler] ✅ Loaded ${
            Object.keys(configFromPage).length
          } tag configurations:`,
          configFromPage
        );
        return this.currentConfig;
      }

      console.log(
        "🎨 [CSS Handler] ⚠️ No tag configuration found in Calendar Suite config page"
      );
      return {};
    } catch (error) {
      console.error(
        "🎨 [CSS Handler] ❌ Failed to load tag configuration:",
        error
      );
      return {};
    }
  }

  async loadConfigFromPage() {
    try {
      console.log("🎨 [CSS Handler] loadConfigFromPage() called");

      // Verify the config page exists
      const pageQuery = `[:find ?page :where [?page :node/title "${this.configPageTitle}"]]`;
      console.log("🎨 [CSS Handler] Running page query:", pageQuery);
      const pageResults = window.roamAlphaAPI.q(pageQuery);
      console.log("🎨 [CSS Handler] Page query results:", pageResults);

      if (!pageResults || pageResults.length === 0) {
        console.log(
          `🎨 [CSS Handler] ❌ Config page [[${this.configPageTitle}]] not found`
        );
        return {};
      }

      console.log(
        `🎨 [CSS Handler] ✅ Found config page [[${this.configPageTitle}]]`
      );

      // Look for the "Yearly config:" section
      const yearlyConfigQuery = `[:find ?uid ?string :where 
                                [?page :node/title "${this.configPageTitle}"] 
                                [?block :block/page ?page] 
                                [?block :block/uid ?uid]
                                [?block :block/string ?string]
                                [(clojure.string/includes? ?string "Yearly config:")]]`;

      console.log(
        "🎨 [CSS Handler] Running yearly config query:",
        yearlyConfigQuery
      );
      const yearlyResults = window.roamAlphaAPI.q(yearlyConfigQuery);
      console.log(
        "🎨 [CSS Handler] Yearly config query results:",
        yearlyResults
      );

      if (!yearlyResults || yearlyResults.length === 0) {
        console.log(
          "🎨 [CSS Handler] ❌ 'Yearly config:' section not found in config page"
        );
        return {};
      }

      const yearlyConfigUid = yearlyResults[0][0];
      console.log(
        `🎨 [CSS Handler] ✅ Found 'Yearly config:' section with UID: ${yearlyConfigUid}`
      );

      // Get all child blocks of the "Yearly config:" block
      const childQuery = `[:find ?childString :where 
                          [?parent :block/uid "${yearlyConfigUid}"] 
                          [?child :block/parents ?parent]
                          [?child :block/string ?childString]]`;

      console.log("🎨 [CSS Handler] Running child query:", childQuery);
      const childResults = window.roamAlphaAPI.q(childQuery);
      console.log("🎨 [CSS Handler] Child query results:", childResults);

      if (!childResults || childResults.length === 0) {
        console.log(
          "🎨 [CSS Handler] ❌ No child blocks found under 'Yearly config:'"
        );
        return {};
      }

      console.log(
        `🎨 [CSS Handler] ✅ Found ${childResults.length} config entries to parse`
      );

      const config = {};

      // Parse each config line: "yv1:: Family Birthdays,c41d69,ffe6f0,🎂"
      childResults.forEach(([configLine], index) => {
        console.log(
          `🎨 [CSS Handler] Parsing line ${index + 1}: "${configLine}"`
        );
        const parsed = this.parseConfigLine(configLine);
        console.log(`🎨 [CSS Handler] Parsed result:`, parsed);
        if (parsed) {
          config[parsed.tag] = parsed.config;
          console.log(
            `🎨 [CSS Handler] ✅ Added to config: ${parsed.tag}`,
            parsed.config
          );
        }
      });

      console.log(`🎨 [CSS Handler] ✅ Final parsed config:`, config);
      return config;
    } catch (error) {
      console.error(
        "🎨 [CSS Handler] ❌ Error loading config from page:",
        error
      );
      return {};
    }
  }

  parseConfigLine(configLine) {
    try {
      console.log(
        `🎨 [CSS Handler] parseConfigLine called with: "${configLine}"`
      );

      // Expected format: "yv1:: Family Birthdays,c41d69,ffe6f0,🎂"
      const match = configLine.match(
        /^([a-z0-9]+)::\s*([^,]+),([a-fA-F0-9]{6}),([a-fA-F0-9]{6}),(.+)$/
      );

      console.log(`🎨 [CSS Handler] Regex match result:`, match);

      if (!match) {
        console.log(
          `🎨 [CSS Handler] ⚠️ Could not parse config line: "${configLine}"`
        );
        console.log(
          `🎨 [CSS Handler] Expected format: "tag:: Label,color1,color2,emoji"`
        );
        return null;
      }

      const [fullMatch, tag, label, primaryColor, secondaryColor, emoji] =
        match;
      console.log(`🎨 [CSS Handler] Extracted parts:`, {
        fullMatch,
        tag,
        label,
        primaryColor,
        secondaryColor,
        emoji,
      });

      const parsed = {
        tag: tag.toLowerCase(),
        config: {
          label: label.trim(),
          emoji: emoji.trim(),
          primaryColor: `#${primaryColor}`,
          secondaryColor: `#${secondaryColor}`,
          enabled: true,
        },
      };

      console.log(`🎨 [CSS Handler] ✅ Successfully parsed:`, parsed);
      return parsed;
    } catch (error) {
      console.error(
        `🎨 [CSS Handler] ❌ Error parsing config line "${configLine}":`,
        error
      );
      return null;
    }
  }

  generateCSS() {
    const enabledTags = Object.entries(this.currentConfig).filter(
      ([tag, config]) => config.enabled
    );

    if (enabledTags.length === 0) {
      return "";
    }

    const tagSelectors = enabledTags.map(
      ([tag]) => `span.rm-page-ref--tag[data-tag="${tag}"]`
    );
    const beforeSelectors = enabledTags.map(
      ([tag]) => `span.rm-page-ref--tag[data-tag="${tag}"]::before`
    );
    const afterSelectors = enabledTags.map(
      ([tag]) => `span.rm-page-ref--tag[data-tag="${tag}"]:hover::after`
    );

    let css = `
/* ===================================================================
 * 🎯 YEARLY VIEW - DYNAMIC CALENDAR TAG CSS
 * Generated: ${new Date().toISOString()}
 * Source: [[${this.configPageTitle}]]
 * Tags: ${enabledTags.map(([tag]) => tag).join(", ")}
 * ===================================================================*/

/* Base styling for all calendar tags - hide original text */
${tagSelectors.join(",\n")} {
  font-size: 0 !important;
  position: relative;
  display: inline-block;
  margin: 0 4px;
  vertical-align: middle;
}

/* Badge hover effect */
${tagSelectors.map((selector) => selector + ":hover::before").join(",\n")} {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

/* Emoji replacement styling with circular badge */
${beforeSelectors.join(",\n")} {
  font-size: 14px !important;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid;
  box-sizing: border-box;
  line-height: 1;
  transition: all 0.2s ease;
}

/* Hover tooltip styling */
${afterSelectors.join(",\n")} {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px !important;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.1);
}

`;

    // Individual tag rules with circular badge styling (swapped colors)
    enabledTags.forEach(([tag, config]) => {
      css += `
/* ${config.label} (${tag}) - Circular Badge */
span.rm-page-ref--tag[data-tag="${tag}"]::before {
  content: "${config.emoji}";
  background-color: ${config.secondaryColor};
  border-color: ${config.primaryColor};
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

span.rm-page-ref--tag[data-tag="${tag}"]:hover::after {
  content: "${config.label} (#${tag})";
  background: ${config.secondaryColor};
  color: ${config.primaryColor};
  border-color: ${config.primaryColor};
}
`;
    });

    return css;
  }

  generateAndInjectCSS() {
    try {
      console.log("🎨 [CSS Handler] generateAndInjectCSS() called");
      console.log("🎨 [CSS Handler] Current config:", this.currentConfig);

      // Remove existing style if present
      if (this.styleElement) {
        console.log("🎨 [CSS Handler] Removing existing style element");
        this.styleElement.remove();
      }

      // Generate new CSS
      console.log("🎨 [CSS Handler] Generating CSS...");
      const css = this.generateCSS();
      console.log(
        "🎨 [CSS Handler] Generated CSS length:",
        css ? css.length : 0
      );
      console.log(
        "🎨 [CSS Handler] Generated CSS preview:",
        css ? css.slice(0, 500) + "..." : "NO CSS"
      );

      if (!css) {
        console.log("🎨 [CSS Handler] ⚠️ No CSS generated, skipping injection");
        return false;
      }

      // Inject new CSS
      console.log("🎨 [CSS Handler] Creating and injecting style element...");
      this.styleElement = document.createElement("style");
      this.styleElement.id = "yearly-view-calendar-tag-css";
      this.styleElement.textContent = css;
      document.head.appendChild(this.styleElement);

      console.log("🎨 [CSS Handler] Style element created:", this.styleElement);
      console.log(
        "🎨 [CSS Handler] Style element in DOM:",
        document.getElementById("yearly-view-calendar-tag-css")
      );

      // Register for cleanup
      if (window._calendarRegistry) {
        window._calendarRegistry.elements.push(this.styleElement);
        console.log("🎨 [CSS Handler] Registered with calendar registry");
      } else {
        console.log("🎨 [CSS Handler] ⚠️ Calendar registry not found");
      }

      const tagCount = Object.keys(this.currentConfig).length;
      console.log(
        `🎨 [CSS Handler] ✅ Calendar tag CSS applied with ${tagCount} tags`
      );
      return true;
    } catch (error) {
      console.error(
        "🎨 [CSS Handler] ❌ Error injecting calendar tag CSS:",
        error
      );
      return false;
    }
  }

  async initialize() {
    try {
      console.log("🎨 [CSS Handler] initialize() called");
      console.log(
        "🎨 [CSS Handler] Starting Calendar Tag CSS Handler initialization..."
      );

      // Load configuration from Calendar Suite config page
      console.log("🎨 [CSS Handler] Loading configuration...");
      await this.loadConfiguration();
      console.log(
        "🎨 [CSS Handler] Configuration loaded, current config:",
        this.currentConfig
      );

      // Generate and inject CSS
      console.log("🎨 [CSS Handler] Generating and injecting CSS...");
      const success = this.generateAndInjectCSS();
      console.log("🎨 [CSS Handler] CSS injection result:", success);

      if (success) {
        console.log(
          "🎨 [CSS Handler] ✅ Calendar Tag CSS Handler initialized successfully"
        );
        return true;
      } else {
        console.log(
          "🎨 [CSS Handler] ⚠️ CSS Handler initialized but no CSS was generated"
        );
        return false;
      }
    } catch (error) {
      console.error(
        "🎨 [CSS Handler] ❌ Failed to initialize Calendar Tag CSS Handler:",
        error
      );
      console.error("🎨 [CSS Handler] Error stack:", error.stack);
      return false;
    }
  }
}

// ===================================================================
// 🧪 DEPENDENCY VERIFICATION SYSTEM
// ===================================================================

function checkRequiredDependencies() {
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
  }

  return true;
}

// ===================================================================
// 🏷️ TAG CONFIGURATION LOADING (Enhanced)
// ===================================================================

async function loadYearlyTagConfiguration() {
  try {
    if (!window.UnifiedConfigUtils) {
      console.warn(
        "⚠️ UnifiedConfigUtils not available, tag configuration will be limited"
      );
      return {};
    }

    const yearlyTags = window.UnifiedConfigUtils.getYearlyTags();
    if (!yearlyTags || yearlyTags.length === 0) {
      return {};
    }

    const tagConfigs = {};
    for (const tagId of yearlyTags) {
      try {
        const tagConfig = window.UnifiedConfigUtils.getYearlyTagConfig(tagId);
        tagConfigs[tagId] = tagConfig;
      } catch (error) {
        console.error(`❌ Failed to load config for #${tagId}:`, error);
      }
    }

    window._yearlyViewTagConfigs = tagConfigs;
    return tagConfigs;
  } catch (error) {
    console.error("❌ Failed to load yearly tag configuration:", error);
    return {};
  }
}

// ===================================================================
// 🌐 EXTERNAL CLOJURESCRIPT COMPONENT FETCHING
// ===================================================================

async function fetchClojureScriptComponent() {
  const GITHUB_URL =
    "https://raw.githubusercontent.com/mjbrockwell/Calendar-Suite/refs/heads/main/4.0-yearly-view/yearly-view-component.cljs";

  try {
    const response = await fetch(GITHUB_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const clojureScriptCode = await response.text();

    if (!clojureScriptCode || clojureScriptCode.length < 100) {
      throw new Error("Fetched content appears to be invalid or empty");
    }

    if (!clojureScriptCode.includes("yearly-view-v2.core")) {
      throw new Error(
        "Fetched content doesn't appear to be the yearly view component"
      );
    }

    return `\`\`\`clojure\n${clojureScriptCode}\n\`\`\``;
  } catch (error) {
    console.warn(
      "⚠️ Failed to fetch real component, using fallback:",
      error.message
    );

    // Return fallback component
    return `\`\`\`clojure
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
      "The extension is installed but the component could not be loaded."]]])
\`\`\``;
  }
}

// ===================================================================
// 🏗️ CASCADING BLOCK CREATION UTILITY
// ===================================================================

function findBlockWithExactSearch(parentUid, targetText) {
  try {
    const exactMatch = window.roamAlphaAPI.q(`
      [:find (pull ?child [:block/uid :block/string])
       :where 
       [?parent :block/uid "${parentUid}"] 
       [?child :block/parents ?parent]
       [?child :block/string "${targetText}"]]
    `);

    if (exactMatch && exactMatch.length > 0) {
      const found = exactMatch[0][0];
      return {
        uid: found[":block/uid"] || found.uid,
        string: found[":block/string"] || found.string,
      };
    }
    return null;
  } catch (error) {
    console.error(`❌ Search error for "${targetText}":`, error);
    return null;
  }
}

async function createHierarchyBlock(parentUid, content, order = null) {
  try {
    if (order === null) {
      const childCount =
        window.roamAlphaAPI.q(`
        [:find (count ?child) . :where 
        [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]]
      `)?.[0] || 0;
      order = childCount;
    }

    const blockUid = window.CalendarUtilities.RoamUtils.generateUID();

    await window.roamAlphaAPI.data.block.create({
      location: { "parent-uid": parentUid, order: order },
      block: { uid: blockUid, string: content },
    });

    return blockUid;
  } catch (error) {
    console.error(`❌ Create error for "${content}":`, error);
    throw error;
  }
}

async function createComponentHierarchyWithCascading(componentCode) {
  const startTime = Date.now();
  const TIMEOUT = 5000;
  const workingOn = { step: null, uid: null, content: null };

  const hierarchy = [
    "**Components added by Extensions:**",
    "**Added by Calendar Suite extension:**",
    "**Yearly View 2.0:**",
  ];

  // Get roam/render page UID
  let renderPageUid =
    window.CalendarUtilities.RoamUtils.getPageUid("roam/render");
  if (!renderPageUid) {
    renderPageUid = await window.CalendarUtilities.RoamUtils.createPage(
      "roam/render"
    );
  }

  while (Date.now() - startTime < TIMEOUT) {
    try {
      let currentParentUid = renderPageUid;
      let hierarchyComplete = true;

      // Check each level of the hierarchy
      for (let i = 0; i < hierarchy.length; i++) {
        const levelText = hierarchy[i];
        const levelName = `level-${i + 1}`;

        const existingBlock = findBlockWithExactSearch(
          currentParentUid,
          levelText
        );

        if (!existingBlock) {
          if (
            workingOn.step !== levelName ||
            workingOn.uid !== currentParentUid
          ) {
            workingOn.step = levelName;
            workingOn.uid = currentParentUid;
            workingOn.content = levelText;

            await createHierarchyBlock(currentParentUid, levelText, 0);
          }

          hierarchyComplete = false;
          break;
        } else {
          currentParentUid = existingBlock.uid;
        }
      }

      // If hierarchy is complete, handle component
      if (hierarchyComplete) {
        // Check if component already exists
        const existingComponent = window.roamAlphaAPI.q(`
          [:find ?childUid :where 
          [?parent :block/uid "${currentParentUid}"] 
          [?child :block/parents ?parent] 
          [?child :block/uid ?childUid]
          [?child :block/string ?string]
          [(clojure.string/includes? ?string "\`\`\`clojure")]]
        `);

        if (existingComponent && existingComponent.length > 0) {
          const componentUid = existingComponent[0][0];

          // Check if it needs updating (is it a placeholder?)
          const componentQuery = `[:find ?string . :where [?b :block/uid "${componentUid}"] [?b :block/string ?string]]`;
          const componentContent = window.roamAlphaAPI.q(componentQuery);

          if (componentContent && componentContent.includes("Hello, World!")) {
            await window.roamAlphaAPI.data.block.update({
              block: { uid: componentUid, string: componentCode },
            });
          }

          return componentUid;
        } else {
          // Create new component
          const componentUid = await createHierarchyBlock(
            currentParentUid,
            componentCode,
            0
          );
          return componentUid;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Cascading error:`, error.message);
    }
  }

  throw new Error(`Component deployment timeout after ${TIMEOUT}ms`);
}

// ===================================================================
// 🚀 MAIN COMPONENT DEPLOYMENT
// ===================================================================

async function deployYearlyViewComponent() {
  try {
    const componentCode = await fetchClojureScriptComponent();
    const componentUid = await createComponentHierarchyWithCascading(
      componentCode
    );

    window._yearlyViewComponentUid = componentUid;

    return {
      componentUid: componentUid,
      renderString: `{{roam/render: ((${componentUid}))}}`,
    };
  } catch (error) {
    console.error("❌ Component deployment failed:", error);
    throw error;
  }
}

function getComponentUid() {
  if (window._yearlyViewComponentUid) {
    return window._yearlyViewComponentUid;
  }
  throw new Error(
    "Component UID not found. Please ensure the extension loaded properly."
  );
}

// ===================================================================
// 🎯 SMART CALENDAR DEPLOYMENT FUNCTIONS
// ===================================================================

async function checkIfYearlyCalendarExists(pageTitle) {
  try {
    const query = `[:find ?uid ?string :where 
                    [?page :node/title "${pageTitle}"] 
                    [?block :block/page ?page] 
                    [?block :block/uid ?uid] 
                    [?block :block/string ?string] 
                    [(clojure.string/includes? ?string "Yearly view is below:")]]`;

    const results = window.roamAlphaAPI.q(query);
    return results && results.length > 0;
  } catch (error) {
    console.error("❌ Error checking for existing calendar:", error);
    return false;
  }
}

async function deployYearlyCalendarToPage(pageTitle) {
  try {
    let yearPageUid = window.CalendarUtilities.RoamUtils.getPageUid(pageTitle);
    if (!yearPageUid) {
      yearPageUid = await window.CalendarUtilities.RoamUtils.createPage(
        pageTitle
      );
    }

    const parentBlockUid = window.CalendarUtilities.RoamUtils.generateUID();
    await window.roamAlphaAPI.data.block.create({
      location: { "parent-uid": yearPageUid, order: 0 },
      block: { uid: parentBlockUid, string: "**Yearly view is below:**" },
    });

    const renderBlockUid = window.CalendarUtilities.RoamUtils.generateUID();
    const componentUid = getComponentUid();

    await window.roamAlphaAPI.data.block.create({
      location: { "parent-uid": parentBlockUid, order: 0 },
      block: {
        uid: renderBlockUid,
        string: `{{roam/render: ((${componentUid}))}}`,
      },
    });

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

  try {
    const calendarExists = await checkIfYearlyCalendarExists(pageTitle);

    if (calendarExists) {
      return; // Silent - calendar already exists
    }

    setTimeout(async () => {
      const shouldAdd = confirm(
        `🗓️ Add interactive yearly calendar to [[${year}]]?\n\n` +
          `This will create a 12-month grid view showing your tagged events.\n\n` +
          `Click OK to add calendar, or Cancel to skip.`
      );

      if (shouldAdd) {
        try {
          await deployYearlyCalendarToPage(pageTitle);
        } catch (deployError) {
          console.error("❌ Deployment failed:", deployError);
        }
      }
    }, 100);
  } catch (error) {
    console.error("❌ Error in year page detection:", error);
  }
}

// ===================================================================
// 🎯 PAGE DETECTION SYSTEM
// ===================================================================

function setupCentralPageDetection() {
  if (!window.CalendarSuite?.pageDetector?.registerPageListener) {
    console.warn(
      "⚠️ Calendar Foundation page detection not available, skipping..."
    );
    return false;
  }

  try {
    const unregisterYearListener =
      window.CalendarSuite.pageDetector.registerPageListener(
        "yearly-view-year-pages",
        (pageTitle) => {
          const yearMatch = /^\d{4}$/.test(pageTitle);
          if (yearMatch) {
            const year = parseInt(pageTitle);
            return year >= 1900 && year <= 2100;
          }
          return false;
        },
        handleYearPageDetected
      );

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

    return true;
  } catch (error) {
    console.error("❌ Failed to setup page detection:", error);
    return false;
  }
}

// ===================================================================
// 🏗️ CALENDAR FOUNDATION INTEGRATION
// ===================================================================

function registerWithCalendarFoundation() {
  try {
    const extensionConfig = {
      id: "yearly-view-v2",
      name: "Yearly View 2.0",
      version: "2.0.0-production",
      dependencies: ["calendar-utilities", "unified-config"],
      status: "Production Ready",
    };

    if (window.CalendarSuite?.registerExtension) {
      window.CalendarSuite.registerExtension(extensionConfig);
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
    }

    return true;
  } catch (error) {
    console.error("❌ Calendar Foundation registration failed:", error);
    return false;
  }
}

// ===================================================================
// 🎛️ ENHANCED COMMAND PALETTE WITH CSS COMMANDS
// ===================================================================

function setupCommands() {
  const commands = [
    {
      label: "Yearly View: Show Component Info",
      callback: () => {
        try {
          const componentUid = getComponentUid();
          const renderString = `{{roam/render: ((${componentUid}))}}`;

          alert(
            `📋 Yearly View Component Info:\n\nUID: ${componentUid}\n\nRender String: ${renderString}\n\nStatus: Production Ready`
          );
        } catch (error) {
          alert(`❌ Error getting component info: ${error.message}`);
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
      label: "Yearly View: Force Deploy to Current Page",
      callback: async () => {
        const currentPageUid =
          window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
        if (!currentPageUid) {
          alert("❌ No page currently open. Please navigate to a page first.");
          return;
        }

        const query = `[:find ?title :where [?page :block/uid "${currentPageUid}"] [?page :node/title ?title]]`;
        const result = window.roamAlphaAPI.q(query);
        const pageTitle = result?.[0]?.[0];

        if (!pageTitle) {
          alert("❌ Could not determine current page title.");
          return;
        }

        const confirm = window.confirm(
          `🚀 Force deploy yearly calendar to [[${pageTitle}]]?\n\nThis will add a calendar regardless of existing content.\n\nClick OK to proceed, Cancel to abort.`
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
    // ===================================================================
    // 🎨 CALENDAR TAG CSS COMMANDS
    // ===================================================================
    {
      label: "CSS DEBUG: Full Diagnostic",
      callback: async () => {
        console.group("🎨 [CSS DIAGNOSTIC] Full CSS Handler Diagnostic");

        console.log(
          "1. CSS Handler existence:",
          !!window._yearlyViewCSSHandler
        );
        if (window._yearlyViewCSSHandler) {
          console.log(
            "2. CSS Handler config page:",
            window._yearlyViewCSSHandler.configPageTitle
          );
          console.log(
            "3. Current config:",
            window._yearlyViewCSSHandler.currentConfig
          );
          console.log(
            "4. Style element:",
            window._yearlyViewCSSHandler.styleElement
          );
          console.log(
            "5. Style element in DOM:",
            document.getElementById("yearly-view-calendar-tag-css")
          );

          console.log("6. Testing configuration reload...");
          await window._yearlyViewCSSHandler.loadConfiguration();
          console.log(
            "7. Config after reload:",
            window._yearlyViewCSSHandler.currentConfig
          );

          console.log("8. Testing CSS generation...");
          const css = window._yearlyViewCSSHandler.generateCSS();
          console.log("9. Generated CSS length:", css ? css.length : 0);

          console.log("10. Testing CSS injection...");
          const injectResult =
            window._yearlyViewCSSHandler.generateAndInjectCSS();
          console.log("11. Injection result:", injectResult);
        }

        console.groupEnd();
        alert("🎨 Full CSS diagnostic complete - check console for details");
      },
    },
    {
      label: "Calendar Tags: Reload Tag Styling",
      callback: async () => {
        if (window._yearlyViewCSSHandler) {
          await window._yearlyViewCSSHandler.loadConfiguration();
          window._yearlyViewCSSHandler.generateAndInjectCSS();
          alert("✅ Calendar tag styling reloaded from config page!");
        } else {
          alert("❌ CSS Handler not initialized.");
        }
      },
    },
    {
      label: "Calendar Tags: Show Current Config",
      callback: () => {
        if (window._yearlyViewCSSHandler) {
          console.group("🎯 Calendar Tag Configuration");
          console.log(
            "Current Config:",
            window._yearlyViewCSSHandler.currentConfig
          );
          console.log(
            "Style Element:",
            window._yearlyViewCSSHandler.styleElement
          );
          console.log(
            "Config Source:",
            window._yearlyViewCSSHandler.configPageTitle
          );
          console.groupEnd();

          const tagCount = Object.keys(
            window._yearlyViewCSSHandler.currentConfig
          ).length;
          alert(
            `📊 Calendar tag config loaded to console.\n\n${tagCount} tags configured from [[${window._yearlyViewCSSHandler.configPageTitle}]]`
          );
        } else {
          alert("❌ CSS Handler not initialized.");
        }
      },
    },
    {
      label: "Calendar Tags: Toggle Debug Mode",
      callback: () => {
        if (window._yearlyViewCSSHandler) {
          window._yearlyViewCSSHandler.debugMode =
            !window._yearlyViewCSSHandler.debugMode;
          alert(
            `🔍 Debug mode ${
              window._yearlyViewCSSHandler.debugMode ? "enabled" : "disabled"
            } for CSS Handler`
          );
        } else {
          alert("❌ CSS Handler not initialized.");
        }
      },
    },
    {
      label: "Calendar Tags: Test CSS Injection",
      callback: () => {
        if (window._yearlyViewCSSHandler) {
          const success = window._yearlyViewCSSHandler.generateAndInjectCSS();
          alert(
            success
              ? "✅ CSS injection test successful!"
              : "❌ CSS injection test failed. Check console."
          );
        } else {
          alert("❌ CSS Handler not initialized.");
        }
      },
    },
  ];

  for (const cmd of commands) {
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: cmd.label,
      callback: cmd.callback,
    });
  }

  return commands;
}

// ===================================================================
// 🚀 MAIN EXTENSION OBJECT WITH INTEGRATED CSS HANDLER
// ===================================================================

const extension = {
  onload: async () => {
    console.log(
      "🗓️ Yearly View Extension 2.0 with Dynamic CSS - Production Ready loading..."
    );

    try {
      // Step 1: Verify dependencies
      checkRequiredDependencies();

      // Step 2: Deploy component
      const componentResult = await deployYearlyViewComponent();

      // Step 3: Register with Calendar Foundation
      const foundationRegistered = registerWithCalendarFoundation();

      // Step 4: Setup page detection
      const pageDetectionSetup = setupCentralPageDetection();

      // Step 5: Load tag configuration
      let tagConfigResult;
      try {
        const tagConfigs = await loadYearlyTagConfiguration();
        tagConfigResult = {
          success: true,
          tagCount: Object.keys(tagConfigs).length,
          tags: Object.keys(tagConfigs),
        };
      } catch (tagError) {
        console.warn("⚠️ Tag configuration loading failed:", tagError.message);
        tagConfigResult = {
          success: false,
          error: tagError.message,
        };
      }

      // Step 6: Initialize Calendar Tag CSS Handler (NEW)
      console.log("🎨 Initializing integrated calendar tag CSS handler...");
      let cssHandlerSuccess = false;
      try {
        console.log("🎨 Creating CSS Handler instance...");
        window._yearlyViewCSSHandler = new CalendarTagCSSHandler();
        console.log(
          "🎨 CSS Handler instance created:",
          window._yearlyViewCSSHandler
        );

        console.log("🎨 Calling CSS Handler initialize...");
        cssHandlerSuccess = await window._yearlyViewCSSHandler.initialize();
        console.log("🎨 CSS Handler initialize returned:", cssHandlerSuccess);

        if (cssHandlerSuccess) {
          console.log("🎨 ✅ CSS Handler initialized successfully");
        } else {
          console.log("🎨 ⚠️ CSS Handler initialization returned false");
        }
      } catch (cssError) {
        console.error(
          "🎨 ❌ CSS Handler initialization failed with error:",
          cssError
        );
        console.error("🎨 Error stack:", cssError.stack);
      }

      // Step 7: Setup commands (enhanced with CSS commands)
      const commands = setupCommands();

      console.log(
        "✅ Yearly View Extension 2.0 with Dynamic CSS loaded successfully!"
      );
      console.log(`🎯 Component UID: ${componentResult.componentUid}`);
      console.log(
        `🎯 Page Detection: ${pageDetectionSetup ? "Active" : "Fallback mode"}`
      );
      console.log(
        `🎯 Tag Configuration: ${
          tagConfigResult.success
            ? `${tagConfigResult.tagCount} tags loaded`
            : "Limited"
        }`
      );
      console.log(
        `🎨 Calendar Tag CSS: ${cssHandlerSuccess ? "Active" : "Fallback mode"}`
      );
      console.log(
        "🚀 Visit year pages like [[2024]], [[2025]] to deploy calendars"
      );
      console.log(
        "🎨 Calendar tags will display as circular badges with colors from your config"
      );
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
    console.log("🗓️ Yearly View Extension 2.0: Unloading...");

    // Clean up CSS handler
    if (
      window._yearlyViewCSSHandler &&
      window._yearlyViewCSSHandler.styleElement
    ) {
      window._yearlyViewCSSHandler.styleElement.remove();
      console.log("🗑️ Removed calendar tag CSS");
    }

    // Clean up global references
    delete window._yearlyViewCSSHandler;

    console.log("✅ Extension unloaded");
  },
};

export default extension;
