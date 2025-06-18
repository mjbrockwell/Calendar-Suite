// =================================================================
// 🎯 YEARLY VIEW EXTENSION 2.0 - CLEAN FOUNDATION ARCHITECTURE
// Modern Calendar Suite extension showcasing unified architecture
// Dependencies: UnifiedConfigUtils + CalendarUtilities (REQUIRED)
// =================================================================

const extension = {
  extensionID: "calendar-suite-yearly-view-v2",
  name: "Yearly View 2.0",
  description: "Modern yearly calendar with unified config integration",
  authors: ["Calendar Suite"],
  version: "2.0.0",
};

let extensionAPI = null;

// =================================================================
// 🔥 MODERN EXTENSION LIFECYCLE - FAIL FAST ARCHITECTURE
// =================================================================

function onload({ extensionAPI: api }) {
  console.log("🎯 Loading Yearly View 2.0 - Modern Architecture");

  extensionAPI = api;

  // 🚨 DEPENDENCY CHECK - FAIL FAST (no fallbacks!)
  if (!window.UnifiedConfigUtils) {
    throw new Error(
      "❌ Yearly View 2.0 requires UnifiedConfigUtils - please load Calendar Suite dependencies first"
    );
  }

  if (!window.CalendarUtilities) {
    throw new Error(
      "❌ Yearly View 2.0 requires CalendarUtilities - please load Calendar Suite dependencies first"
    );
  }

  console.log(
    "✅ Dependencies verified - UnifiedConfigUtils + CalendarUtilities available"
  );

  // 🔗 REGISTER WITH CALENDAR FOUNDATION
  if (window.CalendarSuite) {
    window.CalendarSuite.register("yearly-view-v2", {
      name: "Yearly View 2.0",
      description: "Modern yearly calendar component",
      version: "2.0.0",
      dependencies: ["unified-config-utils", "calendar-utilities"],
      provides: ["yearly-calendar-component", "year-page-detection"],
    });
    console.log("🔗 Registered with Calendar Foundation");
  }

  // 🌟 MODERN DEPLOYMENT
  setupModernYearlyView();

  console.log(
    "✅ Yearly View 2.0 loaded successfully - modern architecture active!"
  );
}

function onunload() {
  console.log("🧹 Unloading Yearly View 2.0");

  // Clean up year page detection
  if (window.yearPageDetectionInterval) {
    clearInterval(window.yearPageDetectionInterval);
    delete window.yearPageDetectionInterval;
  }

  // Unregister from platform
  if (window.CalendarSuite) {
    window.CalendarSuite.unregister("yearly-view-v2");
  }

  console.log("✅ Yearly View 2.0 unloaded cleanly");
}

// =================================================================
// 🎨 MODERN SETUP SYSTEM - CLEAN & FAST
// =================================================================

async function setupModernYearlyView() {
  console.log("🎨 Setting up modern yearly view system...");

  try {
    // 1. ENSURE CONFIG SYSTEM IS READY
    console.log("📋 Initializing unified config system...");
    await window.UnifiedConfigUtils.initializeMasterConfig();

    // 2. DEPLOY COMPONENT USING CALENDAR UTILITIES
    console.log("🧩 Deploying ClojureScript component...");
    const componentResult = await deployModernComponent();

    if (!componentResult.success) {
      throw new Error(`Component deployment failed: ${componentResult.error}`);
    }

    // 3. SETUP CURRENT YEAR PAGE
    const currentYear = new Date().getFullYear();
    console.log(`📅 Setting up yearly view on [[${currentYear}]]...`);

    await setupYearPage(currentYear, componentResult.componentBlockUid);

    // 4. START PAGE DETECTION SYSTEM
    console.log("🔍 Starting modern page detection...");
    setupModernPageDetection();

    // 5. ADD COMMAND PALETTE INTEGRATION
    setupCommandPalette();

    console.log("🎉 Modern yearly view system ready!");
    console.log(`📅 Visit [[${currentYear}]] to see your calendar`);
  } catch (error) {
    console.error("❌ Failed to setup yearly view:", error);
    throw error;
  }
}

// =================================================================
// 🧩 MODERN COMPONENT DEPLOYMENT - USING CALENDAR UTILITIES
// =================================================================

async function deployModernComponent() {
  console.log("🧩 Deploying modern ClojureScript component...");

  try {
    // Use CalendarUtilities for robust page operations
    const { RoamUtils } = window.CalendarUtilities;

    // 1. CREATE COMPONENT HIERARCHY
    const parentBlockUid = await RoamUtils.createNestedStructure(
      "roam/render",
      [
        "**Components added by Extensions:**",
        "**Calendar Suite Extensions:**",
        "**Yearly View 2.0**",
      ]
    );

    if (!parentBlockUid) {
      throw new Error("Failed to create component hierarchy");
    }

    // 2. CREATE/UPDATE COMPONENT BLOCK
    const clojureScriptComponent = generateModernClojureScript();
    const codeBlockContent = `\`\`\`clojure\n${clojureScriptComponent}\n\`\`\``;

    // Check for existing component
    const existingComponentUid = await RoamUtils.findChildBlockByContent(
      parentBlockUid,
      "yearly-view-v2.core"
    );

    let componentBlockUid;

    if (existingComponentUid) {
      // Update existing
      await RoamUtils.updateBlock(existingComponentUid, codeBlockContent);
      componentBlockUid = existingComponentUid;
      console.log("♻️ Updated existing component");
    } else {
      // Create new
      componentBlockUid = await RoamUtils.createChildBlock(
        parentBlockUid,
        codeBlockContent
      );
      console.log("✨ Created new component");
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // Let Roam process

    return {
      success: true,
      componentBlockUid,
      renderString: `{{roam/render: ((${componentBlockUid}))}}`,
      message: "Modern component deployed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// =================================================================
// 📅 MODERN YEAR PAGE SETUP - USING UNIFIED CONFIG
// =================================================================

async function setupYearPage(year, componentBlockUid) {
  console.log(`📅 Setting up yearly view on [[${year}]]...`);

  try {
    const { RoamUtils } = window.CalendarUtilities;
    const yearPageTitle = year.toString();

    // 1. ENSURE YEAR PAGE EXISTS
    let yearPageUid = await RoamUtils.getPageUid(yearPageTitle);

    if (!yearPageUid) {
      yearPageUid = await RoamUtils.createPage(yearPageTitle);
      console.log(`✨ Created year page: [[${yearPageTitle}]]`);
    }

    // 2. CHECK IF YEARLY VIEW ALREADY EXISTS
    const existingView = await RoamUtils.findChildBlockByContent(
      yearPageUid,
      "📅 Interactive Yearly Calendar"
    );

    if (existingView) {
      console.log("📋 Yearly view already exists on this page");
      return { success: true, alreadyExists: true };
    }

    // 3. ADD YEARLY VIEW BLOCKS
    const parentBlockUid = await RoamUtils.createChildBlock(
      yearPageUid,
      "📅 **Yearly Calendar** - Interactive calendar with all your tagged events"
    );

    await RoamUtils.createChildBlock(
      parentBlockUid,
      `{{roam/render: ((${componentBlockUid}))}}`
    );

    console.log(`✅ Yearly view added to [[${yearPageTitle}]]`);
    return { success: true, added: true };
  } catch (error) {
    console.error(`❌ Error setting up year page:`, error);
    return { success: false, error: error.message };
  }
}

// =================================================================
// 🔍 MODERN PAGE DETECTION - USING CALENDAR UTILITIES
// =================================================================

function setupModernPageDetection() {
  console.log("🔍 Setting up modern page detection...");

  const { RoamUtils } = window.CalendarUtilities;
  let lastDetectedPage = null;
  let lastPromptTime = 0;
  const PROMPT_COOLDOWN = 30000; // 30 seconds

  function detectYearPage() {
    try {
      const currentPage = RoamUtils.getCurrentPageTitle();

      if (!currentPage || currentPage === lastDetectedPage) {
        return;
      }

      lastDetectedPage = currentPage;

      // Check if it's a year page (4 digits)
      const yearMatch = currentPage.match(/^(\d{4})$/);
      if (!yearMatch) return;

      const year = parseInt(yearMatch[1]);
      if (year < 1900 || year > 2100) return;

      console.log(`🎯 Detected year page: [[${year}]]`);

      // Check cooldown
      const now = Date.now();
      if (now - lastPromptTime < PROMPT_COOLDOWN) return;

      promptForYearlyView(year);
    } catch (error) {
      console.warn("⚠️ Error in page detection:", error);
    }
  }

  // Set up detection interval
  if (window.yearPageDetectionInterval) {
    clearInterval(window.yearPageDetectionInterval);
  }

  window.yearPageDetectionInterval = setInterval(detectYearPage, 2000);
  console.log("✅ Modern page detection active");
}

async function promptForYearlyView(year) {
  try {
    const { RoamUtils } = window.CalendarUtilities;

    // Check if page already has yearly view
    const yearPageUid = await RoamUtils.getPageUid(year.toString());
    if (!yearPageUid) return;

    const hasYearlyView = await RoamUtils.findChildBlockByContent(
      yearPageUid,
      "📅 Interactive Yearly Calendar"
    );

    if (hasYearlyView) {
      console.log(`✅ Yearly view already exists on [[${year}]]`);
      return;
    }

    // Prompt user
    const userWants = confirm(
      `🗓️ Add interactive yearly calendar to [[${year}]]?\n\n` +
        `This will show all your tagged events from month pages like [[January ${year}]], [[February ${year}]], etc.\n\n` +
        `Click OK to add, Cancel to skip.`
    );

    if (userWants) {
      await deployYearlyViewToYear(year);
    }
  } catch (error) {
    console.error("Error in yearly view prompt:", error);
  }
}

async function deployYearlyViewToYear(year) {
  try {
    // Get existing component UID
    const componentUid = await findExistingComponentUid();

    if (!componentUid) {
      alert("❌ Component not found. Please run the main deployment first.");
      return;
    }

    // Add to year page
    const result = await setupYearPage(year, componentUid);

    if (result.success) {
      alert(`🎉 Yearly calendar added to [[${year}]]!\n\nRefresh to see it.`);
      if (confirm("Refresh page now?")) {
        window.location.reload();
      }
    } else {
      alert(`❌ Failed to add yearly calendar: ${result.error}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
}

async function findExistingComponentUid() {
  try {
    const { RoamUtils } = window.CalendarUtilities;

    const renderPageUid = await RoamUtils.getPageUid("roam/render");
    if (!renderPageUid) return null;

    return await RoamUtils.findChildBlockByContent(
      renderPageUid,
      "yearly-view-v2.core"
    );
  } catch (error) {
    console.warn("Error finding component:", error);
    return null;
  }
}

// =================================================================
// 🎛️ COMMAND PALETTE INTEGRATION
// =================================================================

function setupCommandPalette() {
  const commands = [
    {
      label: "Yearly View: Deploy to Current Year",
      callback: async () => {
        const currentYear = new Date().getFullYear();
        await deployYearlyViewToYear(currentYear);
      },
    },
    {
      label: "Yearly View: Test Config System",
      callback: () => {
        console.log("🧪 Testing Yearly View config system...");

        // Test unified config reading
        const yearlyTags = window.UnifiedConfigUtils.getYearlyTags();
        console.log("📋 Available yearly tags:", yearlyTags);

        yearlyTags.slice(0, 3).forEach((tagId) => {
          const config = window.UnifiedConfigUtils.getYearlyTagConfig(tagId);
          console.log(`🏷️ ${tagId}:`, config);
        });

        alert(
          `✅ Config test complete!\n\nFound ${yearlyTags.length} yearly tags.\nCheck console for details.`
        );
      },
    },
    {
      label: "Yearly View: Open Config Page",
      callback: () => {
        const { RoamUtils } = window.CalendarUtilities;
        RoamUtils.navigateToPage(window.UnifiedConfigUtils.CONFIG_PAGE_TITLE);
      },
    },
  ];

  // Add commands to Roam
  commands.forEach((cmd) => {
    extensionAPI.ui.commandPalette.addCommand(cmd);
  });

  console.log("🎛️ Command palette integration ready");
}

// =================================================================
// 🎨 MODERN CLOJURESCRIPT COMPONENT - USING UNIFIED CONFIG
// =================================================================

function generateModernClojureScript() {
  return `;; =================================================================
;; 🎯 YEARLY VIEW 2.0 - FABERGE EGG PRESERVATION + MODERN CONFIG
;; SURGICAL RETROFIT: Keep ALL original functionality, only modernize config/utilities
;; Original ClojureScript preserved with precision - only config system updated
;; =================================================================

;; 1.0 🌲 Namespace declaration with required dependencies
(ns yearly-view-v2.core
  (:require
   [reagent.core :as r]
   [clojure.string :as str]
   [roam.datascript :as rd]))

;; =================================================================
;; 🔧 MODERN CONFIG SYSTEM - SURGICAL INTEGRATION ONLY
;; =================================================================

(defn get-unified-config []
  "Gets UnifiedConfigUtils - fail fast if missing"
  (if-let [config-utils (.-UnifiedConfigUtils js/window)]
    config-utils
    (throw (js/Error. "UnifiedConfigUtils not available - Calendar Suite dependency missing"))))

(defn load-config-from-unified-system []
  "Loads tag configuration from unified config system - SURGICAL REPLACEMENT of old config loading"
  (try
    (let [config-utils (get-unified-config)
          yearly-tags (.getYearlyTags config-utils)]
      (js/console.log "📋 Loading from unified config, found tags:" yearly-tags)
      
      (->> yearly-tags
           (map (fn [tag-id]
                  (let [tag-config (.getYearlyTagConfig config-utils tag-id)]
                    (when tag-config
                      {:id tag-id
                       :name (.-name tag-config)
                       :text-color (.-textColor tag-config) 
                       :bg-color (.-bgColor tag-config)
                       :emoji (.-emoji tag-config)}))))
           (filter identity)
           (vec)))
    (catch :default e
      (js/console.error "❌ Error loading unified config:" e)
      ;; Minimal fallback to keep system working
      [{:id "yv0" :name "General Events" :text-color "3a5199" :bg-color "e6efff" :emoji "🔵"}
       {:id "yv1" :name "Family Birthdays" :text-color "c41d69" :bg-color "ffe6f0" :emoji "🎂"}])))

;; =================================================================
;; 🎯 PAGE DETECTION - PRESERVED EXACTLY, with minor utility integration
;; =================================================================

(defn get-current-page-title []
  "Gets the current page title using DOM - PRESERVED EXACTLY from original"
  (try
    ;; Method 1: Get from page title in DOM
    (let [title-element (.querySelector js/document ".rm-title-display")
          page-from-dom (when title-element (.-textContent title-element))]
      (js/console.log "🔍 Page title element:" title-element)
      (js/console.log "🔍 Page from DOM:" page-from-dom)
      
      ;; Method 2: Get from URL hash as fallback
      (let [url-hash (.-hash js/location)
            page-from-url (when (and url-hash (str/includes? url-hash "/app/"))
                           (let [parts (str/split url-hash #"/")
                                 page-part (when (> (count parts) 2) (nth parts 2))]
                             (when page-part (js/decodeURIComponent page-part))))]
        
        ;; Return the first valid result
        (or page-from-dom page-from-url)))
    (catch :default e
      (js/console.warn "❌ Error in DOM page detection:" e)
      nil)))

(defn get-current-page-year []
  "Detects if we're on a year page like [[2024]] and returns that year - PRESERVED EXACTLY"
  (try
    (let [current-page-title (get-current-page-title)
          year-match (when current-page-title 
                      (re-find #"^(\d{4})$" current-page-title))]
      (if year-match
        (do
          (js/console.log "🎯 Detected year page:" (second year-match))
          (js/parseInt (second year-match)))
        (do
          (js/console.log "📅 Not on year page, using current year")
          (.getFullYear (js/Date.)))))
    (catch :default e
      (js/console.warn "Error detecting page year:" e)
      (.getFullYear (js/Date.)))))

;; =================================================================
;; 🔍 ROAM DATA QUERY FUNCTIONS - PRESERVED EXACTLY from original
;; =================================================================

(defn page-exists? [page-title]
  "Checks if a page with the given title exists in the graph - PRESERVED EXACTLY"
  (try
    (let [result (rd/q '[:find ?e .
                         :in $ ?title
                         :where [?e :node/title ?title]]
                       page-title)]
      (boolean result))
    (catch :default e
      (js/console.error "Error checking if page exists:" page-title e)
      false)))

(defn find-tagged-blocks [block tag]
  "Recursively finds all blocks tagged with a specific tag - PRESERVED EXACTLY"
  (if-not block []
    (let [current-match (if (and (:block/string block) 
                                (str/includes? (:block/string block) (str "#" tag)))
                          [[(:block/string block) (:block/uid block) tag]] 
                          [])
          child-matches (mapcat #(find-tagged-blocks % tag) (:block/children block))]
      (concat current-match child-matches))))

(defn get-month-events [month year active-tags]
  "Gets all tagged events from a specific month page - PRESERVED EXACTLY"
  (let [month-names ["January" "February" "March" "April" "May" "June" 
                     "July" "August" "September" "October" "November" "December"]
        month-name (get month-names (dec month))
        page-title (str month-name " " year)]
    
    (js/console.log "DEBUG: Querying page:" page-title "for tags:" active-tags)
    
    (if-not (page-exists? page-title)
      (do
        (js/console.log "DEBUG: Page does not exist:" page-title)
        [])
      (try
        (let [page-data (rd/pull '[:node/title 
                                  {:block/children 
                                   [:block/string 
                                    :block/uid 
                                    {:block/children 
                                     [:block/string 
                                      :block/uid 
                                      {:block/children 
                                       [:block/string 
                                        :block/uid
                                        {:block/children ...}]}]}]}] 
                                [:node/title page-title])
              all-events (atom [])]
          
          (doseq [tag active-tags]
            (let [tagged-blocks (find-tagged-blocks page-data tag)]
              (when (> (count tagged-blocks) 0)
                (js/console.log "DEBUG: Found" (count tagged-blocks) "blocks for tag #" tag "in" page-title))
              (swap! all-events concat tagged-blocks)))
          
          @all-events)
        (catch :default e
          (js/console.error "Error querying month events for" page-title ":" e)
          [])))))

;; =================================================================
;; 🌸 SORTING AND TEXT EXTRACTION FUNCTIONS - PRESERVED EXACTLY
;; =================================================================

(defn extract-day-number [event-string]
  "Extracts day number from event string: '7 (We) - text' → 7 - PRESERVED EXACTLY"
  (try
    (when-let [match (re-find #"^(\d+)\s+\(" event-string)]
      (js/parseInt (second match)))
    (catch :default e
      (js/console.warn "Could not extract day number from:" event-string)
      999)))

(defn extract-clean-event-text [event-string]
  "Extracts clean display text from messy Roam event string - PRESERVED EXACTLY"
  (try
    (let [day-match (re-find #"^(\d+\s+\([A-Za-z]{2}\))" event-string)
          day-part (if day-match (second day-match) "")]
      
      (let [after-hashtag (if-let [hashtag-match (re-find #"#yv\d+\s+(.+)$" event-string)]
                           (second hashtag-match)
                           (if-let [generic-hashtag (re-find #"#\w+\s+(.+)$" event-string)]
                             (second generic-hashtag)
                             (if-let [dash-match (re-find #"\s-\s(.+)$" event-string)]
                               (str/replace (second dash-match) #"#.*$" "")
                               event-string)))]
        
        (let [cleaned-text (-> after-hashtag
                              (str/replace #"\[📅\].*?\]\)" "")
                              (str/replace #"\[\[.*?\]\]" "")
                              (str/replace #"#\w+" "")
                              (str/trim))
              
              final-result (if (and (not (empty? day-part)) (not (empty? cleaned-text)))
                            (str day-part " - " cleaned-text)
                            (str/replace event-string #"#.*$" ""))]
          final-result)))
    (catch :default e
      (js/console.error "Error extracting clean text from:" event-string e)
      (str/replace event-string #"\s+#.*$" ""))))

(defn sort-events-chronologically [events]
  "Sorts events by day number extracted from event string - PRESERVED EXACTLY"
  (sort-by (fn [[event-string _ _]]
             (extract-day-number event-string))
           events))

;; =================================================================
;; 🦜 HELPER FUNCTIONS - PRESERVED EXACTLY
;; =================================================================

(defn get-tag-config [tag-id tag-configs]
  "Gets tag configuration by ID - PRESERVED EXACTLY"
  (first (filter #(= tag-id (:id %)) tag-configs)))

(defn get-month-name [month-num]
  "Gets month name by number (1-12) - PRESERVED EXACTLY"
  (let [month-names ["January" "February" "March" "April" "May" "June" 
                     "July" "August" "September" "October" "November" "December"]]
    (get month-names (dec month-num))))

;; =================================================================
;; 🚀 NAVIGATION FUNCTIONS - PRESERVED EXACTLY with page existence checks
;; =================================================================

(defn navigate-to-year [year]
  "Navigates to the specified year page - PRESERVED EXACTLY"
  (let [year-page (str year)]
    (js/console.log (str "🎯 Checking year page: [[" year-page "]]"))
    (try
      ;; Check if page exists first
      (if (page-exists? year-page)
        (do
          (js/console.log (str "✅ Year page exists, navigating to: [[" year-page "]]"))
          (.. js/window -roamAlphaAPI -ui -mainWindow (openPage #js {:page #js {:title year-page}})))
        ;; Show warning if page doesn't exist
        (js/alert (str "⚠️ Page [[" year-page "]] does not exist yet.\n\nPlease create the page first, then try again.")))
      (catch :default e
        (js/console.error "Error navigating to year page:" e)
        (js/alert (str "❌ Could not navigate to year page: " year-page "\n\nError: " (str e)))))))

(defn navigate-to-month [month year]
  "Navigates to the specified month page - PRESERVED EXACTLY"
  (let [page-title (str (get-month-name month) " " year)]
    (js/console.log (str "📅 Checking month page: " page-title))
    (try
      ;; Check if page exists first
      (if (page-exists? page-title)
        (do
          (js/console.log (str "✅ Month page exists, navigating to: " page-title))
          (.. js/window -roamAlphaAPI -ui -mainWindow (openPage #js {:page #js {:title page-title}})))
        ;; Show warning if page doesn't exist
        (js/alert (str "⚠️ Page [[" page-title "]] does not exist yet.\n\nPlease create the page first, then try again.")))
      (catch :default e
        (js/console.error "Error navigating to month:" e)
        (js/alert (str "❌ Could not navigate to page: " page-title "\n\nError: " (str e)))))))

(defn navigate-to-month-sidebar [month year]
  "Opens the specified month page in Roam sidebar - PRESERVED EXACTLY"
  (let [page-title (str (get-month-name month) " " year)]
    (js/console.log (str "📂 Checking month page for sidebar: " page-title))
    (try
      ;; Check if page exists first
      (if (page-exists? page-title)
        (let [page-uid (rd/q '[:find ?uid .
                               :in $ ?title
                               :where 
                               [?e :node/title ?title]
                               [?e :block/uid ?uid]]
                             page-title)]
          (if page-uid
            (do
              (js/console.log (str "✅ Opening in sidebar: " page-title " (UID: " page-uid ")"))
              (.. js/window -roamAlphaAPI -ui -rightSidebar 
                  (addWindow #js {:window #js {:type "outline" :block-uid page-uid}})))
            (do
              (js/console.warn (str "⚠️ Page exists but UID not found for: " page-title))
              (js/alert (str "⚠️ Could not open [[" page-title "]] in sidebar.\n\nThe page exists but there was an issue accessing it.")))))
        ;; Show warning if page doesn't exist
        (js/alert (str "⚠️ Page [[" page-title "]] does not exist yet.\n\nPlease create the page first, then try again.")))
      (catch :default e
        (js/console.error "Error opening month in sidebar:" e)
        (js/alert (str "❌ Could not open in sidebar: " page-title "\n\nError: " (str e)))))))

(defn navigate-to-config-page []
  "Navigates to the config page - UPDATED to use unified config page"
  (let [config-page-title (.-CONFIG_PAGE_TITLE (get-unified-config))]
    (js/console.log (str "🛠️ Checking config page: [[" config-page-title "]]"))
    (try
      ;; Check if page exists first
      (if (page-exists? config-page-title)
        (do
          (js/console.log (str "✅ Config page exists, navigating to: [[" config-page-title "]]"))
          (.. js/window -roamAlphaAPI -ui -mainWindow (openPage #js {:page #js {:title config-page-title}})))
        ;; Show warning if page doesn't exist
        (js/alert (str "⚠️ Page [[" config-page-title "]] does not exist yet.\n\nPlease create the page first, then try again.")))
      (catch :default e
        (js/console.error "Error navigating to config page:" e)
        (js/alert (str "❌ Could not navigate to config page: " config-page-title "\n\nError: " (str e)))))))

(defn navigate-to-event [event-uid open-in-sidebar?]
  "Navigates to the specific event block in Roam - PRESERVED EXACTLY"
  (js/console.log (str "🎯 Navigating to event block: " event-uid 
                      (if open-in-sidebar? " (in sidebar)" " (in main window)")))
  (try
    (if open-in-sidebar?
      ;; Open in right sidebar
      (.. js/window -roamAlphaAPI -ui -rightSidebar 
          (addWindow #js {:window #js {:type "block" :block-uid event-uid}}))
      ;; Open in main window (default behavior)
      (.. js/window -roamAlphaAPI -ui -mainWindow (openBlock #js {:block #js {:uid event-uid}})))
    (catch :default e
      (js/console.error "Error navigating to event:" e)
      (js/alert (str "❌ Could not navigate to event block: " event-uid "\n\nError: " (str e))))))

;; =================================================================
;; 🦜 UI COMPONENTS - PRESERVED EXACTLY (Faberge Egg!)
;; =================================================================

(defn refresh-button [on-click is-refreshing last-refresh-time]
  "Renders a refresh button with activity indicator - PRESERVED EXACTLY"
  [:div.refresh-button-container {:style {:display "flex"
                                         :align-items "center"
                                         :justify-content "center"
                                         :margin-bottom "15px"}}
   [:button.refresh-button {:style {:border "none"
                                   :background "#4c6ef5"
                                   :color "white"
                                   :padding "8px 16px"
                                   :border-radius "4px"
                                   :cursor (if is-refreshing "wait" "pointer")
                                   :display "flex"
                                   :align-items "center"
                                   :opacity (if is-refreshing 0.7 1)
                                   :transition "all 0.2s ease"
                                   :margin-right "15px"}
                           :disabled is-refreshing
                           :on-click on-click}
    [:span {:style {:margin-right "5px"}}
     (if is-refreshing "Refreshing..." "Refresh Events")]
    [:span {:style {:font-size "16px"
                   :transform (if is-refreshing "rotate(360deg)" "rotate(0deg)")
                   :transition "transform 0.5s ease"}}
     "↻"]]
    
   (when last-refresh-time
     [:span {:style {:font-size "12px"
                    :color "#888"}}
      "Last updated: " 
      (.toLocaleTimeString last-refresh-time)])])

(defn filter-toggle [tag checked on-change]
  "Renders a toggle control for filters - PRESERVED EXACTLY (scaled down 30%)"
  [:label.toggle-control {:style {:display "flex"
                                 :align-items "center"
                                 :margin-right "12px"  ; was 18px, now 12px (-33%)
                                 :margin-bottom "7px"  ; was 10px, now 7px (-30%)
                                 :cursor "pointer"}}
   [:input {:type "checkbox"
           :checked checked
           :on-change on-change
           :style {:margin-right "7px"    ; was 10px, now 7px (-30%)
                   :transform "scale(0.85)"}}]  ; Scale down checkbox by 15%
   
   [:div {:style {:padding "2px 7px"        ; was 3px 10px, now 2px 7px (-30%)
                 :border-radius "4px"       ; was 6px, now 4px (-33%)
                 :background-color (str "#" (:bg-color tag))
                 :color (str "#" (:text-color tag))
                 :border (str "1px solid #" (:text-color tag))  ; was 1.5px, now 1px
                 :box-shadow "0 1px 2px rgba(0,0,0,0.1)"       ; was 0 2px 4px, reduced
                 :font-weight "500"
                 :font-size "0.8em"         ; was default, now 0.8em (-20%)
                 :transition "all 0.15s ease"}}
    (:name tag)]])

(defn year-control [year]
  "Renders year navigation controls - PRESERVED EXACTLY with page navigation"
  [:div.year-control {:style {:display "flex"
                             :justify-content "center"
                             :align-items "center"
                             :margin-bottom "15px"}}
   [:button.prev-button {:style {:border "none"
                                :background "#f0f0f0"
                                :padding "5px 15px"
                                :border-radius "4px"
                                :margin-right "10px"
                                :cursor "pointer"
                                :transition "background 0.2s"}
                        :on-mouse-over #(set! (.. % -target -style -background) "#e0e0e0")
                        :on-mouse-out #(set! (.. % -target -style -background) "#f0f0f0")
                        :on-click #(navigate-to-year (dec year))} 
    "← " (dec year)]
   [:span.year-display {:style {:font-size "1.4em"
                               :font-weight "bold"
                               :margin "0 15px"
                               :color "#345980"}} 
    year]
   [:button.next-button {:style {:border "none"
                                :background "#f0f0f0"
                                :padding "5px 15px"
                                :border-radius "4px"
                                :margin-left "10px"
                                :cursor "pointer"
                                :transition "background 0.2s"}
                        :on-mouse-over #(set! (.. % -target -style -background) "#e0e0e0")
                        :on-mouse-out #(set! (.. % -target -style -background) "#f0f0f0")
                        :on-click #(navigate-to-year (inc year))} 
    (inc year) " →"]])

(defn collapsible-help [show-help]
  "Renders a sleek collapsible help section with settings button - PRESERVED EXACTLY"
  [:div.help-section {:style {:text-align "center"
                             :margin "10px auto 15px"
                             :max-width "90%"}}
   ;; Button container for help and settings
   [:div.button-container {:style {:display "flex"
                                  :justify-content "center"
                                  :align-items "center"
                                  :gap "10px"}}
    ;; Help toggle button
    [:button.help-toggle {:style {:background "transparent"
                                 :border "1px solid #a9c4e2"
                                 :color "#345980"
                                 :padding "6px 12px"
                                 :border-radius "15px"
                                 :cursor "pointer"
                                 :font-size "0.85em"
                                 :transition "all 0.2s ease"
                                 :display "flex"
                                 :align-items "center"
                                 :justify-content "center"}
                         :on-mouse-over #(do
                                         (set! (.. % -target -style -background) "#f9fcff")
                                         (set! (.. % -target -style -borderColor) "#88b4e0"))
                         :on-mouse-out #(do
                                        (set! (.. % -target -style -background) "transparent")
                                        (set! (.. % -target -style -borderColor) "#a9c4e2"))
                         :on-click #(swap! show-help not)}
     [:span {:style {:margin-right "5px" :font-size "14px"}} 
      (if @show-help "🔽" "🔗")]
     (if @show-help "Hide Navigation Help" "Show Navigation Help")]
    
    ;; Settings button
    [:button.settings-button {:style {:background "transparent"
                                     :border "1px solid #d4af37"
                                     :color "#b8860b"
                                     :padding "6px 12px"
                                     :border-radius "15px"
                                     :cursor "pointer"
                                     :font-size "0.85em"
                                     :transition "all 0.2s ease"
                                     :display "flex"
                                     :align-items "center"
                                     :justify-content "center"}
                              :on-mouse-over #(do
                                              (set! (.. % -target -style -background) "#fefcf0")
                                              (set! (.. % -target -style -borderColor) "#daa520"))
                              :on-mouse-out #(do
                                             (set! (.. % -target -style -background) "transparent")
                                             (set! (.. % -target -style -borderColor) "#d4af37"))
                              :on-click #(navigate-to-config-page)}
     [:span {:style {:margin-right "5px" :font-size "14px"}} "🛠️"]
     "Jump to Settings Page"]]
   
   ;; Collapsible help content
   (when @show-help
     [:div.help-content {:style {:margin-top "10px"
                                :padding "12px 20px"
                                :background "#f9fcff"
                                :border "1px solid #a9c4e2"
                                :border-radius "10px"
                                :color "#345980"
                                :font-size "0.9em"
                                :box-shadow "0 2px 6px rgba(0,0,0,0.08)"
                                :animation "slideDown 0.3s ease"}}
      [:div {:style {:font-weight "500" :margin-bottom "8px"}} 
       "🖱️ Interactive Calendar Navigation"]
      [:div {:style {:font-size "0.85em" :line-height "1.4" :text-align "left"}}
       "• " [:strong "Click year buttons"] " to navigate to year pages like [[2024]] or [[2026]]"
       [:br]
       "• " [:strong "Click"] " any month panel to navigate to that month's page"
       [:br]
       "• " [:strong "Click ➡️ button"] " in month header to open in the " [:em "right sidebar"]
       [:br]
       "• " [:strong "Click"] " any event to jump directly to that block" 
       [:br]
       "• " [:strong "Shift+Click"] " any event to open in the " [:em "right sidebar"]
       [:br] 
       "• Use the category toggles above to filter which events are shown"]])])

(defn event-item [event-string event-uid tag-id tag-configs]
  "Renders a single event item with shift-click sidebar support - PRESERVED EXACTLY"
  (let [tag-config (get-tag-config tag-id tag-configs)
        text-color (str "#" (or (:text-color tag-config) "444"))
        bg-color (str "#" (or (:bg-color tag-config) "f5f5f5"))
        emoji (or (:emoji tag-config) "•")
        clean-text (extract-clean-event-text event-string)]
    
    [:div.event-item {:key event-uid
                      :style {:margin-bottom "4px"
                             :padding "4px 8px"
                             :border (str "2px solid " text-color)
                             :border-radius "4px"
                             :background-color bg-color
                             :color text-color
                             :font-weight "500"
                             :box-shadow "0 1px 3px rgba(0,0,0,0.1)"
                             :font-size "0.85em"
                             :line-height "1.2"
                             :cursor "pointer"
                             :transition "all 0.15s ease"
                             :user-select "none"}
                      
                      ;; Click handler with shift-click sidebar support
                      :on-click (fn [e]
                                 (.stopPropagation e)  ; Prevent month panel click
                                 (let [open-in-sidebar? (.-shiftKey e)]
                                   (navigate-to-event event-uid open-in-sidebar?)))
                      
                      :on-mouse-over (fn [e]
                                      (let [target (.-currentTarget e)]
                                        (set! (.. target -style -transform) "translateX(3px)")
                                        (set! (.. target -style -boxShadow) "0 3px 6px rgba(0,0,0,0.2)")
                                        (set! (.. target -style -filter) "brightness(1.05)")))
                      
                      :on-mouse-out (fn [e]
                                     (let [target (.-currentTarget e)]
                                       (set! (.. target -style -transform) "none")
                                       (set! (.. target -style -boxShadow) "0 1px 3px rgba(0,0,0,0.1)")
                                       (set! (.. target -style -filter) "none")))}
     [:span {:style {:margin-right "4px"}} emoji]
     clean-text]))

(defn month-panel [month-name month-num year events tag-configs]
  "Renders month panel with click navigation + sidebar button - PRESERVED EXACTLY"
  (let [current-month (inc (.getMonth (js/Date.)))
        is-current-month? (= month-num current-month)]
    [:div.month-panel {:style {:border "1px solid #c0d5e8"                    
                              :border-radius "12px"                           
                              :padding "12px"                                 
                              :margin "5px"                                   
                              :background (if is-current-month? "#e1eeff" "#f0f7fc")  
                              :width "280px"                                  
                              :min-width "280px"
                              :height "350px"                                 
                              :max-height "350px"                             
                              :display "flex"
                              :flex-direction "column"
                              :flex-shrink "0"
                              :box-shadow "0 2px 5px rgba(0,0,0,0.08)"        
                              :transition "all 0.2s ease"
                              :overflow "hidden"
                              :cursor "pointer"
                              :user-select "none"}
                      
                      ;; Month panel click - opens in main window
                      :on-click #(navigate-to-month month-num year)
                      
                      :on-mouse-over (fn [e] 
                                      (let [target (.-currentTarget e)]
                                        (set! (.. target -style -background) "#d4e4f7")
                                        (set! (.. target -style -boxShadow) "0 4px 8px rgba(0,0,0,0.15)")
                                        (set! (.. target -style -border) "1px solid #88b4e0")
                                        (set! (.. target -style -transform) "translateY(-2px)")))
                      
                      :on-mouse-out (fn [e]
                                     (let [target (.-currentTarget e)]
                                       (set! (.. target -style -background) (if is-current-month? "#e1eeff" "#f0f7fc"))
                                       (set! (.. target -style -boxShadow) "0 2px 5px rgba(0,0,0,0.08)")
                                       (set! (.. target -style -border) "1px solid #c0d5e8")
                                       (set! (.. target -style -transform) "none")))}
     
     ;; Month header with sidebar button
     [:div.month-header {:style {:font-weight "bold"
                                :border-bottom "1px solid #d1e1f0"
                                :padding-bottom "6px"
                                :margin-bottom "10px"
                                :text-align "center"
                                :flex-shrink "0"
                                :font-size "1.1em"
                                :color "#345980"
                                :display "flex"
                                :justify-content "space-between"
                                :align-items "center"}}
      [:span month-name]
      
      ;; Sidebar button - ➡️ emoji
      [:button.sidebar-button {:style {:background "transparent"
                                      :border "none"
                                      :font-size "16px"
                                      :cursor "pointer"
                                      :padding "2px 4px"
                                      :border-radius "3px"
                                      :transition "background 0.2s"
                                      :opacity "0.7"}
                              :title "Open in sidebar"
                              :on-click (fn [e]
                                         (.stopPropagation e)  ; Don't trigger month panel click
                                         (navigate-to-month-sidebar month-num year))
                              :on-mouse-over #(do
                                               (set! (.. % -target -style -background) "rgba(255,255,255,0.3)")
                                               (set! (.. % -target -style -opacity) "1"))
                              :on-mouse-out #(do
                                              (set! (.. % -target -style -background) "transparent")
                                              (set! (.. % -target -style -opacity) "0.7"))}
       "➡️"]]
     
     ;; Scrollable events container
     [:div.month-content {:style {:flex "1 1 auto"
                                 :overflow-y "auto"
                                 :padding-right "4px"
                                 :scrollbar-width "thin"
                                 :scrollbar-color "#aaa #f0f0f0"}}
      (if (seq events)
        (let [sorted-events (sort-events-chronologically events)]
          (for [[event-string event-uid tag-id] sorted-events]
            ^{:key event-uid}
            [event-item event-string event-uid tag-id tag-configs]))
        [:div {:style {:color "#999" :font-style "italic" :text-align "center" 
                      :padding "15px 5px" :font-size "0.85em"
                      :pointer-events "none"}}
         "No events"])]]))

;; =================================================================
;; 🌲 MAIN COMPONENT - PRESERVED EXACTLY with only config loading updated
;; =================================================================

(defn yearly-view [{:keys [block-uid]}]
  "Main component - PRESERVED EXACTLY except config loading modernized"
  (let [tag-configs (r/atom [])
        config-status (r/atom "Loading...")
        current-year (r/atom (get-current-page-year))
        events-by-month (r/atom {})  
        events-status (r/atom "Loading events...")
        debug-info (r/atom [])
        loading-progress (r/atom 0)
        is-refreshing (r/atom false)
        last-refresh-time (r/atom nil)
        active-categories (r/atom #{})
        show-help (r/atom false)]
    
    ;; Helper function to load events for a specific month - PRESERVED EXACTLY
    (defn load-month-events [month year active-tag-ids]
      (try
        (let [events (get-month-events month year active-tag-ids)]
          (swap! events-by-month assoc month events)
          (swap! loading-progress inc)
          (when (> (count events) 0)
            (swap! debug-info conj (str (get-month-name month) ": " (count events) " events")))
          events)
        (catch :default e
          (js/console.error "Error loading events for month" month ":" e)
          (swap! debug-info conj (str (get-month-name month) ": Error loading"))
          [])))
    
    ;; Function to load all months for the current year - PRESERVED EXACTLY
    (defn load-all-months []
      (reset! is-refreshing true)
      (reset! loading-progress 0)
      (reset! events-by-month {})
      (reset! debug-info [])
      
      (let [active-tag-ids (if (seq @active-categories)
                            (vec @active-categories)
                            (map :id @tag-configs))]  ; Use all tags if none selected
        ;; Load all months 1-12 for current year
        (doseq [month (range 1 13)]
          (load-month-events month @current-year active-tag-ids))
        
        ;; Calculate totals and update state
        (let [total-events (reduce + (map count (vals @events-by-month)))
              months-with-events (count (filter #(> (count (val %)) 0) @events-by-month))]
          
          (reset! events-status 
                  (if (> total-events 0)
                    (str "✓ Found " total-events " events across " months-with-events " months")
                    (str "⚠ No events found in any month pages for " @current-year)))
          
          (reset! is-refreshing false)
          (reset! last-refresh-time (js/Date.)))))
    
    ;; Page sync function - PRESERVED EXACTLY
    (defn sync-with-current-page []
      (let [detected-year (get-current-page-year)]
        (when (not= detected-year @current-year)
          (js/console.log "🔄 Page changed, syncing year:" detected-year)
          (reset! current-year detected-year)
          (load-all-months))))
    
    (r/create-class
     {:component-did-mount
      (fn []
        ;; Load config - ONLY THIS PART MODERNIZED
        (try
          (let [loaded-config (load-config-from-unified-system)]
            (reset! tag-configs loaded-config)
            (reset! config-status 
                    (str "✅ Unified config loaded (" (count loaded-config) " tags)")))
          (catch :default e
            (js/console.error "Error loading unified config:" e)
            (reset! tag-configs [{:id "yv0" :name "Events" :text-color "3a5199" :bg-color "e6efff" :emoji "🔵"}])
            (reset! config-status "❌ Error loading config, using minimal fallback")))
        
        ;; Initialize active categories based on config - PRESERVED EXACTLY
        (reset! active-categories 
                (into #{} (map :id @tag-configs)))
        
        ;; Load events for all 12 months - PRESERVED EXACTLY
        (load-all-months)
        
        ;; Set up page change listener - PRESERVED EXACTLY
        (js/setInterval sync-with-current-page 2000)  ; Check every 2 seconds
        
        ;; Add custom scrollbar CSS - PRESERVED EXACTLY
        (let [style-el (.createElement js/document "style")
              css-rules "
                .month-content::-webkit-scrollbar {
                  width: 6px;
                }
                .month-content::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 3px;
                }
                .month-content::-webkit-scrollbar-thumb {
                  background-color: #bbb;
                  border-radius: 3px;
                  border: 1px solid #f1f1f1;
                }
                .month-content::-webkit-scrollbar-thumb:hover {
                  background-color: #888;
                }
                @keyframes slideDown {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              "]
          (set! (.-textContent style-el) css-rules)
          (set! (.-id style-el) "interactive-calendar-scrollbar-styles")
          
          (when-not (.getElementById js/document "interactive-calendar-scrollbar-styles")
            (.appendChild (.-head js/document) style-el))))
      
      :component-will-unmount
      (fn []
        (when-let [style-el (.getElementById js/document "interactive-calendar-scrollbar-styles")]
          (.remove style-el)))
      
      :reagent-render
      (fn []
        [:div.yearly-view-container {:style {:font-family "sans-serif"
                                            :max-width "1200px"
                                            :margin "20px auto"
                                            :padding "20px"}}
         
         ;; Title with dynamic year - PRESERVED EXACTLY
         [:h3 {:style {:text-align "center" :margin-top "0" :margin-bottom "15px" :color "#345980"}}
          "📅 Interactive Yearly Calendar " [:span {:style {:color "#888"}} @current-year]]
         
         ;; Year navigation controls - PRESERVED EXACTLY
         [year-control @current-year]
         
         ;; Refresh button with last update time - PRESERVED EXACTLY
         [refresh-button load-all-months @is-refreshing @last-refresh-time]
         
         ;; SCALED-DOWN FILTER CONTROLS - PRESERVED EXACTLY
         [:div.filter-controls {:style {:display "flex"
                                       :flex-wrap "wrap"
                                       :justify-content "center"
                                       :margin "14px 0 21px"        ; was 20px 0 30px, now reduced by 30%
                                       :padding "10px"              ; was 15px, now 10px (-33%)
                                       :background "#f9f4eb"
                                       :border-radius "6px"         ; was 8px, now 6px (-25%)
                                       :border "1px solid #e5d9c3"
                                       :box-shadow "0 1px 3px rgba(0,0,0,0.05)"}}  ; reduced shadow
          
          ;; Show tag toggles using dynamic config - PRESERVED EXACTLY
          (for [tag @tag-configs]
            ^{:key (:id tag)}
            [filter-toggle 
             tag
             (contains? @active-categories (:id tag))
             #(do
                (swap! active-categories 
                       (fn [cats] 
                         (if (contains? cats (:id tag))
                           (disj cats (:id tag))
                           (conj cats (:id tag)))))
                (load-all-months))])]
         
         ;; Status display - PRESERVED EXACTLY
         [:div.status-display {:style {:text-align "center"
                                      :margin "15px auto 20px"
                                      :padding "10px 20px"
                                      :max-width "90%"
                                      :background "#e8f5e8"
                                      :border "1px solid #c3e6c3"
                                      :border-radius "6px"
                                      :color "#2e7d32"
                                      :font-size "0.9em"}}
          @events-status]
         
         ;; COLLAPSIBLE HELP SECTION - PRESERVED EXACTLY
         [collapsible-help show-help]
         
         ;; FULL 12-MONTH INTERACTIVE GRID LAYOUT (3×4) - PRESERVED EXACTLY
         [:div.twelve-month-grid {:style {:display "grid"
                                         :grid-template-columns "repeat(3, 1fr)"
                                         :grid-template-rows "repeat(4, auto)"
                                         :gap "15px"
                                         :margin-bottom "20px"
                                         :justify-items "center"
                                         :max-width "1000px"
                                         :margin-left "auto"
                                         :margin-right "auto"}}
          
          ;; Generate all 12 months with filtered events and sidebar buttons - PRESERVED EXACTLY
          (for [month (range 1 13)]
            (let [month-name (get-month-name month)
                  all-month-events (get @events-by-month month [])
                  ;; Apply active category filtering
                  filtered-events (if (seq @active-categories)
                                   (filter (fn [[_ _ tag-id]] 
                                            (contains? @active-categories tag-id)) 
                                          all-month-events)
                                   all-month-events)]
              ^{:key month}
              [month-panel month-name month @current-year filtered-events @tag-configs]))]
         
         ;; Enhanced summary with interaction stats - PRESERVED EXACTLY
         [:div.summary-panel {:style {:text-align "center" :margin-top "25px" 
                                     :font-size "0.9em" :color "#666"
                                     :background "#f9f9f9" :padding "15px" 
                                     :border-radius "8px"
                                     :box-shadow "0 1px 3px rgba(0,0,0,0.1)"}}
          (let [monthly-counts (for [month (range 1 13)]
                                 (count (get @events-by-month month [])))
                total-events (reduce + monthly-counts)
                months-with-events (count (filter pos? monthly-counts))
                active-count (count @active-categories)]
            [:div 
             [:div {:style {:font-weight "500" :margin-bottom "8px"}} 
              "📊 Calendar Summary"]
             [:div {:style {:font-size "0.85em" :line-height "1.4"}}
              "Year: " [:strong @current-year] " • "
              "Active Categories: " [:strong active-count "/" (count @tag-configs)] " • "
              "Total Events: " [:strong total-events] " • "
              "Months with Events: " [:strong months-with-events "/12"]
              
              (when @last-refresh-time
                [:div {:style {:margin-top "8px" :font-style "italic" :color "#888"}}
                 "Last refreshed: " (.toLocaleString @last-refresh-time)])]])]])})))

;; =================================================================
;; 🌲 Main export function - PRESERVED EXACTLY
;; =================================================================

(defn main [{:keys [block-uid]}]
  "Main export function"
  [yearly-view {:block-uid block-uid}])

;; 📝 FABERGE EGG PRESERVATION SUCCESS:
;; ✅ ALL original UI components preserved exactly
;; ✅ ALL original styling and animations intact  
;; ✅ ALL original interactions (hover, click, shift-click) preserved
;; ✅ ALL original 12-month grid layout preserved
;; ✅ ALL original event processing and sorting preserved
;; ✅ ALL original navigation functions preserved
;; ✅ ONLY config loading surgically modernized to use UnifiedConfigUtils
;; ✅ ONLY settings navigation updated to use unified config page
;; 🎯 Perfect surgical retrofit - all beauty preserved!`;
}

// =================================================================
// 🌟 EXTENSION EXPORT & AUTO-EXECUTION
// =================================================================

// Export for Roam Depot
window.RoamLazy = window.RoamLazy || {};
window.RoamLazy.YearlyViewV2 = {
  onload,
  onunload,
  extension,
};

// Auto-execution for development
console.log("🎯 Yearly View 2.0 Extension loaded - checking dependencies...");

function autoExecuteModernExtension() {
  if (
    window.UnifiedConfigUtils &&
    window.CalendarUtilities &&
    window.roamAlphaAPI
  ) {
    console.log(
      "✅ All dependencies ready - auto-executing Yearly View 2.0..."
    );

    // Call onload with mock API
    onload({
      extensionAPI: {
        ui: {
          commandPalette: {
            addCommand: (cmd) => {
              console.log("✅ Auto-registered command:", cmd.label);
              window[`yearlyViewV2Command_${cmd.label.replace(/\s+/g, "_")}`] =
                cmd.callback;
            },
          },
        },
      },
    });

    console.log(
      "🎉 Yearly View 2.0 auto-execution complete - modern architecture active!"
    );
  } else {
    const missing = [];
    if (!window.UnifiedConfigUtils) missing.push("UnifiedConfigUtils");
    if (!window.CalendarUtilities) missing.push("CalendarUtilities");
    if (!window.roamAlphaAPI) missing.push("roamAlphaAPI");

    console.log(
      `⏳ Missing dependencies: ${missing.join(", ")} - retrying in 1 second...`
    );
    setTimeout(autoExecuteModernExtension, 1000);
  }
}

// Start auto-execution
setTimeout(autoExecuteModernExtension, 500);
