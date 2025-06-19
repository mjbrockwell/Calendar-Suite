// ===================================================================
// 🗓️ YEARLY VIEW EXTENSION 2.0 - PRODUCTION READY
// Features: Real ClojureScript component + Dynamic Calendar Tag CSS
// ===================================================================

// ===================================================================
// 🎨 CALENDAR TAG CSS HANDLER
// ===================================================================

class CalendarTagCSSHandler {
  constructor() {
    this.styleElement = null;
    this.configPageTitle = "roam/ext/calendar suite/config";
    this.currentConfig = {};
    this.mutationObserver = null;
  }

  async loadConfiguration() {
    try {
      const configFromPage = await this.loadConfigFromPage();
      if (configFromPage && Object.keys(configFromPage).length > 0) {
        this.currentConfig = configFromPage;
        return this.currentConfig;
      }
      return {};
    } catch (error) {
      console.error("❌ Failed to load calendar tag configuration:", error);
      return {};
    }
  }

  async loadConfigFromPage() {
    try {
      // Verify the config page exists
      const pageQuery = `[:find ?page :where [?page :node/title "${this.configPageTitle}"]]`;
      const pageResults = window.roamAlphaAPI.q(pageQuery);

      if (!pageResults || pageResults.length === 0) {
        return {};
      }

      // Look for the "Yearly config:" section
      const yearlyConfigQuery = `[:find ?uid ?string :where 
                                [?page :node/title "${this.configPageTitle}"] 
                                [?block :block/page ?page] 
                                [?block :block/uid ?uid]
                                [?block :block/string ?string]
                                [(clojure.string/includes? ?string "Yearly config:")]]`;

      const yearlyResults = window.roamAlphaAPI.q(yearlyConfigQuery);
      if (!yearlyResults || yearlyResults.length === 0) {
        return {};
      }

      const yearlyConfigUid = yearlyResults[0][0];

      // Get all child blocks of the "Yearly config:" section
      const childQuery = `[:find ?childString :where 
                          [?parent :block/uid "${yearlyConfigUid}"] 
                          [?child :block/parents ?parent]
                          [?child :block/string ?childString]]`;

      const childResults = window.roamAlphaAPI.q(childQuery);
      if (!childResults || childResults.length === 0) {
        return {};
      }

      const config = {};

      // Parse each config line: "yv1:: Family Birthdays,c41d69,ffe6f0,🎂"
      childResults.forEach(([configLine]) => {
        const parsed = this.parseConfigLine(configLine);
        if (parsed) {
          config[parsed.tag] = parsed.config;
        }
      });

      return config;
    } catch (error) {
      console.error("❌ Error loading config from Calendar Suite page:", error);
      return {};
    }
  }

  parseConfigLine(configLine) {
    try {
      // Expected format: "yv1:: Family Birthdays,c41d69,ffe6f0,🎂"
      const match = configLine.match(
        /^([a-z0-9]+)::\s*([^,]+),([a-fA-F0-9]{6}),([a-fA-F0-9]{6}),(.+)$/
      );

      if (!match) {
        return null;
      }

      const [, tag, label, primaryColor, secondaryColor, emoji] = match;

      return {
        tag: tag.toLowerCase(),
        config: {
          label: label.trim(),
          emoji: emoji.trim(),
          primaryColor: `#${primaryColor}`,
          secondaryColor: `#${secondaryColor}`,
          enabled: true,
        },
      };
    } catch (error) {
      console.error(`❌ Error parsing calendar tag config line:`, error);
      return null;
    }
  }

  cleanup() {
    // Remove CSS
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    // Remove mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Remove deadline event listeners
    const allTags = document.querySelectorAll("span.rm-page-ref--tag");
    allTags.forEach((tagElement) => {
      if (tagElement._deadlineHoverHandler) {
        tagElement.removeEventListener(
          "mouseenter",
          tagElement._deadlineHoverHandler
        );
        delete tagElement._deadlineHoverHandler;
      }
    });
  }

  async reload() {
    // Clean up existing setup
    this.cleanup();

    // Reinitialize everything
    return await this.initialize();
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

    // Identify deadline tags for special behavior
    const deadlineTags = enabledTags.filter(([tag, config]) =>
      /deadline/i.test(config.label)
    );

    let css = `
/* ===================================================================
 * 🎯 YEARLY VIEW - DYNAMIC CALENDAR TAG CSS
 * Generated: ${new Date().toISOString()}
 * Source: [[${this.configPageTitle}]]
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

    // Individual tag rules with circular badge styling
    enabledTags.forEach(([tag, config]) => {
      const isDeadline = /deadline/i.test(config.label);

      css += `
/* ${config.label} (${tag}) */
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

      // Add special class for deadline tags
      if (isDeadline) {
        css += `
span.rm-page-ref--tag[data-tag="${tag}"] {
  position: relative;
}
span.rm-page-ref--tag[data-tag="${tag}"]:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
span.rm-page-ref--tag[data-tag="${tag}"].deadline-tag:hover::after {
  content: attr(data-deadline-tooltip);
}
`;
      }
    });

    return css;
  }

  generateAndInjectCSS() {
    try {
      // Remove existing style if present
      if (this.styleElement) {
        this.styleElement.remove();
      }

      // Generate new CSS
      const css = this.generateCSS();

      if (!css) {
        return false;
      }

      // Inject new CSS
      this.styleElement = document.createElement("style");
      this.styleElement.id = "yearly-view-calendar-tag-css";
      this.styleElement.textContent = css;
      document.head.appendChild(this.styleElement);

      // Register for cleanup
      if (window._calendarRegistry) {
        window._calendarRegistry.elements.push(this.styleElement);
      }

      // Setup deadline countdown functionality
      this.setupDeadlineCountdown();

      const tagCount = Object.keys(this.currentConfig).length;
      console.log(`✅ Calendar tag CSS applied with ${tagCount} tags`);
      return true;
    } catch (error) {
      console.error("❌ Error injecting calendar tag CSS:", error);
      return false;
    }
  }

  // ===================================================================
  // 🎯 DEADLINE COUNTDOWN EASTER EGG
  // ===================================================================

  setupDeadlineCountdown() {
    // Find all deadline tags and add event listeners
    const deadlineTags = Object.entries(this.currentConfig)
      .filter(([tag, config]) => /deadline/i.test(config.label))
      .map(([tag]) => tag);

    deadlineTags.forEach((tag) => {
      const tagElements = document.querySelectorAll(
        `span.rm-page-ref--tag[data-tag="${tag}"]`
      );
      tagElements.forEach((tagElement) => {
        // Remove existing listener to prevent duplicates
        tagElement.removeEventListener(
          "mouseenter",
          tagElement._deadlineHoverHandler
        );

        // Create and store the handler
        tagElement._deadlineHoverHandler = () =>
          this.handleDeadlineHover(tagElement, tag);
        tagElement.addEventListener(
          "mouseenter",
          tagElement._deadlineHoverHandler
        );
      });
    });
  }

  handleDeadlineHover(tagElement, tag) {
    try {
      // Find the containing block
      const blockElement = tagElement.closest(".rm-block");
      if (!blockElement) return;

      // Get the block text content
      const blockText =
        blockElement.textContent || blockElement.innerText || "";

      // Look for date pattern: [[Month Day, Year]]
      const dateMatch = blockText.match(
        /\[\[([A-Za-z]+)\s+(\d{1,2}(?:st|nd|rd|th)?),\s+(\d{4})\]\]/
      );
      if (!dateMatch) return;

      const [, monthStr, dayStr, yearStr] = dateMatch;

      // Parse the date
      const targetDate = this.parseRoamDate(monthStr, dayStr, yearStr);
      if (!targetDate) return;

      // Calculate days remaining
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day

      const timeDiff = targetDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Create enhanced tooltip
      const config = this.currentConfig[tag];
      let tooltipText = `${config.label} (#${tag})`;

      if (daysDiff > 0) {
        tooltipText += ` • ${daysDiff} day${
          daysDiff === 1 ? "" : "s"
        } remaining`;
      } else if (daysDiff === 0) {
        tooltipText += ` • Due today!`;
      } else {
        const overdueDays = Math.abs(daysDiff);
        tooltipText += ` • ${overdueDays} day${
          overdueDays === 1 ? "" : "s"
        } overdue`;
      }

      // Update the tooltip
      tagElement.setAttribute("data-deadline-tooltip", tooltipText);
      tagElement.classList.add("deadline-tag");
    } catch (error) {
      // Graceful failure - just do nothing
      console.debug("Deadline countdown failed gracefully:", error);
    }
  }

  parseRoamDate(monthStr, dayStr, yearStr) {
    try {
      // Parse month name to number
      const months = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        sept: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };

      const monthIndex = months[monthStr.toLowerCase()];
      if (monthIndex === undefined) return null;

      // Parse day (remove ordinal suffix)
      const day = parseInt(dayStr.replace(/(?:st|nd|rd|th)$/, ""), 10);
      if (isNaN(day) || day < 1 || day > 31) return null;

      // Parse year
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) return null;

      // Create date object
      const date = new Date(year, monthIndex, day);

      // Validate the date
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== monthIndex ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    } catch (error) {
      return null;
    }
  }

  async initialize() {
    try {
      // Load configuration from Calendar Suite config page
      await this.loadConfiguration();

      // Generate and inject CSS
      const success = this.generateAndInjectCSS();

      if (success) {
        // Setup mutation observer for dynamically added tags
        this.setupDynamicTagWatcher();
        console.log(
          "✅ Dynamic calendar tag CSS initialized with deadline countdown"
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to initialize calendar tag CSS:", error);
      return false;
    }
  }

  setupDynamicTagWatcher() {
    // Watch for new tags being added to the page
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node contains deadline tags
            const deadlineTagElements = node.querySelectorAll
              ? node.querySelectorAll("span.rm-page-ref--tag")
              : [];

            deadlineTagElements.forEach((tagElement) => {
              const tag = tagElement.getAttribute("data-tag");
              if (
                tag &&
                this.currentConfig[tag] &&
                /deadline/i.test(this.currentConfig[tag].label)
              ) {
                tagElement.addEventListener("mouseenter", () =>
                  this.handleDeadlineHover(tagElement, tag)
                );
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Store observer for cleanup
    this.mutationObserver = observer;

    // Register observer for cleanup
    if (window._calendarRegistry) {
      if (!window._calendarRegistry.observers) {
        window._calendarRegistry.observers = [];
      }
      window._calendarRegistry.observers.push(observer);
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
// 🏷️ TAG CONFIGURATION LOADING
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
// 🎛️ COMMAND PALETTE
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
    {
      label: "Calendar Tags: Reload Styling",
      callback: async () => {
        if (window._yearlyViewCSSHandler) {
          const success = await window._yearlyViewCSSHandler.reload();
          alert(
            success
              ? "✅ Calendar tag styling reloaded with deadline countdown!"
              : "⚠️ CSS reloaded but some features may not be active"
          );
        } else {
          alert("❌ CSS Handler not initialized.");
        }
      },
    },
    {
      label: "Calendar Tags: Show Config Status",
      callback: () => {
        if (window._yearlyViewCSSHandler) {
          const tagCount = Object.keys(
            window._yearlyViewCSSHandler.currentConfig
          ).length;
          const deadlineCount = Object.entries(
            window._yearlyViewCSSHandler.currentConfig
          ).filter(([tag, config]) => /deadline/i.test(config.label)).length;
          const hasCSS = !!window._yearlyViewCSSHandler.styleElement;

          alert(
            `📊 Calendar Tag Status:\n\n${tagCount} tags configured\n${deadlineCount} deadline tags with countdown\nCSS ${
              hasCSS ? "active" : "inactive"
            }\n\nSource: [[${window._yearlyViewCSSHandler.configPageTitle}]]`
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
// 🚀 MAIN EXTENSION OBJECT
// ===================================================================

const extension = {
  onload: async () => {
    console.log("🗓️ Yearly View Extension 2.0 - Production Ready loading...");

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

      // Step 6: Initialize Calendar Tag CSS Handler
      let cssHandlerSuccess = false;
      try {
        window._yearlyViewCSSHandler = new CalendarTagCSSHandler();
        cssHandlerSuccess = await window._yearlyViewCSSHandler.initialize();
      } catch (cssError) {
        console.warn("⚠️ CSS Handler initialization failed:", cssError.message);
      }

      // Step 7: Setup commands
      const commands = setupCommands();

      console.log("✅ Yearly View Extension 2.0 loaded successfully!");
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
    if (window._yearlyViewCSSHandler) {
      window._yearlyViewCSSHandler.cleanup();
    }

    // Clean up global references
    delete window._yearlyViewCSSHandler;

    console.log("✅ Extension unloaded");
  },
};

export default extension;
