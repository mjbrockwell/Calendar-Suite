// =================================================================
// YEARLY VIEW EXTENSION - COMPLETE CALENDAR DEPLOYMENT
// Roam Depot Extension for yearly calendar component deployment
// =================================================================

// Extension metadata and configuration
const extension = {
  extensionID: "calendar-suite-yearly-view",
  name: "Yearly View - Calendar Suite",
  description: "Deploy interactive yearly calendar component to Roam graphs",
  authors: ["Calendar Suite"],
  version: "1.0.0",
};

let extensionAPI = null;

// =================================================================
// EXTENSION LIFECYCLE FUNCTIONS
// =================================================================

function onload({ extensionAPI: api }) {
  console.log("🚀 Loading Yearly View Extension - Calendar Suite");

  extensionAPI = api;

  // Check dependencies
  if (!window.RoamExtensionSuite) {
    console.log(
      "⚠️ RoamExtensionSuite not found - Yearly View requires the Extension Suite to be loaded first"
    );
    return;
  }

  // Make main function globally accessible for debugging
  window.deployYearlyViewSystem = deployYearlyViewSystem;
  window.checkForYearPage = checkForYearPage;

  // Add command to run the yearly view deployment
  extensionAPI.ui.commandPalette.addCommand({
    label: "Deploy Yearly View Calendar",
    callback: () => {
      console.log(
        "🎯 User triggered yearly view deployment from command palette"
      );
      deployYearlyViewSystem();
    },
  });

  // Start year page detection system
  console.log("🔍 Starting year page detection system...");
  setTimeout(() => {
    setupYearPageDetection();
  }, 1000);

  // Auto-deploy component (optional - you can remove this if you want manual triggering only)
  console.log("🔧 Auto-deploying yearly view component on extension load...");
  setTimeout(() => {
    deployYearlyViewSystem();
  }, 1500);

  console.log("✅ Yearly View Extension loaded successfully");
  console.log(
    "🧪 Debug: You can now run deployYearlyViewSystem() from console"
  );
}

function onunload() {
  console.log("🔄 Unloading Yearly View Extension");

  // Cleanup global functions
  delete window.deployYearlyViewSystem;
  delete window.checkForYearPage;

  // Clear any detection intervals
  if (window.yearPageDetectionInterval) {
    clearInterval(window.yearPageDetectionInterval);
    delete window.yearPageDetectionInterval;
  }

  console.log("🧹 Yearly View Extension cleanup completed");
}

// =================================================================
// MAIN DEPLOYMENT FUNCTION
// =================================================================

async function deployYearlyViewSystem() {
  console.log("🚀 STARTING Yearly View System Deployment");
  console.log(
    "📋 This will deploy: ClojureScript component + current year page setup"
  );

  const results = {
    success: false,
    steps: {
      clojureScriptComponent: { status: "pending" },
      currentYearSetup: { status: "pending" },
    },
    componentBlockUid: null,
    currentYear: new Date().getFullYear(),
  };

  try {
    // =============================================================
    // STEP 1: Deploy ClojureScript Component & Harvest UID ✅
    // =============================================================
    console.log(
      "\n🧩 STEP 1: Deploying ClojureScript yearly view component..."
    );

    try {
      const componentResult = await deployYearlyViewComponent();
      if (componentResult.success && componentResult.componentBlockUid) {
        results.componentBlockUid = componentResult.componentBlockUid;
        results.steps.clojureScriptComponent = {
          status: "success",
          componentBlockUid: componentResult.componentBlockUid,
          renderString: componentResult.renderString,
        };
        console.log(
          "✅ Yearly view component deployed, UID harvested:",
          componentResult.componentBlockUid
        );
      } else {
        throw new Error("Component deployment succeeded but no UID harvested");
      }
    } catch (error) {
      results.steps.clojureScriptComponent = {
        status: "error",
        error: error.message,
      };
      console.log(
        "❌ ClojureScript component deployment failed:",
        error.message
      );
      throw new Error("Cannot proceed without component UID");
    }

    // =============================================================
    // STEP 2: Setup Current Year Page ✅
    // =============================================================
    console.log(
      `\n📅 STEP 2: Setting up yearly view on [[${results.currentYear}]] page...`
    );

    try {
      const yearSetupResult = await setupYearlyViewOnPage(
        results.currentYear,
        results.componentBlockUid
      );
      results.steps.currentYearSetup = {
        status: yearSetupResult.success ? "success" : "error",
        message: yearSetupResult.message,
        pageCreated: yearSetupResult.pageCreated,
        blockAdded: yearSetupResult.blockAdded,
      };

      if (yearSetupResult.success) {
        console.log(
          `✅ Yearly view setup completed on [[${results.currentYear}]]`
        );
      } else {
        console.log(
          `⚠️ Year page setup completed with issues: ${yearSetupResult.message}`
        );
      }
    } catch (error) {
      results.steps.currentYearSetup = {
        status: "error",
        error: error.message,
      };
      console.log("❌ Year page setup failed:", error.message);
    }

    // =============================================================
    // FINAL SUCCESS EVALUATION ✅
    // =============================================================
    const criticalStepsSuccess =
      results.steps.clojureScriptComponent.status === "success";
    results.success = criticalStepsSuccess;

    if (results.success) {
      console.log("\n🎉 YEARLY VIEW DEPLOYMENT COMPLETE!");
      console.log("✅ Interactive yearly calendar is ready");
      console.log(`📅 Visit [[${results.currentYear}]] to see your calendar`);
      console.log(
        `🔍 Year page detection is active - visit any [[YYYY]] page for prompts`
      );
      console.log(`📝 Component UID: ${results.componentBlockUid}`);
    } else {
      console.log("\n⚠️ YEARLY VIEW DEPLOYMENT COMPLETED WITH ISSUES");
      console.log(
        "❌ Critical components failed - please check error messages above"
      );
    }

    return results;
  } catch (error) {
    console.log("\n💥 YEARLY VIEW DEPLOYMENT FAILED:", error.message);
    results.success = false;
    results.error = error.message;
    return results;
  }
}

// =================================================================
// COMPONENT 1: CLOJURESCRIPT COMPONENT DEPLOYER
// =================================================================

async function deployYearlyViewComponent() {
  console.log("   🧩 Deploying yearly view ClojureScript component...");

  try {
    // =============================================================
    // STEP 1: Define the COMPLETE ClojureScript Component ✅
    // =============================================================
    const clojureScriptComponent = `;; 1.0 🌳 YEARLY VIEW CALENDAR - STEP 4.2: PAGE NAVIGATION + COMPACT HELP + SETTINGS BUTTON
;; Based on working Step 4.1 + PAGE-BASED NAVIGATION + COLLAPSIBLE HELP + NEW SETTINGS NAVIGATION
;; Goal: Navigate to actual year pages + sleek compact help system + settings page access

;; 1.1 🌲 Namespace declaration with required dependencies
(ns yearly-view.core
  (:require
   [reagent.core :as r]
   [clojure.string :as str]
   [roam.datascript :as rd]))

;; 2.0 🍎 DEFAULT TAG CONFIGURATIONS (unchanged)
(def default-tag-configs
  "Default tag configurations - used as fallback when config page unavailable"
  [{:id "yv0" :name "General Events" :text-color "3a5199" :bg-color "e6efff" :emoji "🔵"}
   {:id "yv1" :name "Family Birthdays" :text-color "c41d69" :bg-color "ffe6f0" :emoji "🎂"}
   {:id "yv2" :name "Other Birthdays" :text-color "9e3b8c" :bg-color "f9ebff" :emoji "🟪"}
   {:id "yv3" :name "Deadlines" :text-color "a05600" :bg-color "fff4e5" :emoji "📌"}
   {:id "yv4" :name "Holidays" :text-color "0d6e37" :bg-color "e5fff0" :emoji "🎉"}
   {:id "yv5" :name "Meetings" :text-color "5a3095" :bg-color "f0e6ff" :emoji "👥"}
   {:id "yv6" :name "For Fun" :text-color "ad4600" :bg-color "fff2e0" :emoji "🥳"}])

;; 2.1 🦊 CONFIG PAGE READING FUNCTIONS (proven working from Step 3.2)
(defn config-page-exists? []
  "Checks if the config page exists"
  (try
    (let [result (rd/q '[:find ?e .
                        :in $ ?title
                        :where [?e :node/title ?title]]
                      "roam/yearly calendar config")]
      (boolean result))
    (catch :default e
      (js/console.warn "Error checking config page:" e)
      false)))

(defn parse-tag-from-config-page [config-page-id]
  "Parses all tag configurations from the config page"
  (try
    (let [page-data (rd/pull '[:node/title {:block/children [:block/string :block/uid {:block/children [:block/string]}]}] config-page-id)
          tag-blocks (:block/children page-data)]
      
      (->> tag-blocks
           (filter #(re-find #"^yv\d+\s*-" (:block/string %)))
           (map (fn [tag-block]
                  (let [tag-string (:block/string tag-block)
                        [_ tag-id tag-name] (re-find #"^(yv\d+)\s*-\s*(.+)" tag-string)
                        prop-blocks (:block/children tag-block)
                        properties (reduce (fn [acc prop-block]
                                          (let [prop-string (:block/string prop-block)]
                                            (when-let [[_ prop-key prop-value] (re-find #"^([^:]+)::\s*(.+)" prop-string)]
                                              (let [key-keyword (keyword (str/trim prop-key))
                                                    parsed-value (case key-keyword
                                                                  :default-active (= "true" (str/lower-case (str/trim prop-value)))
                                                                  (str/trim prop-value))]
                                                (assoc acc key-keyword parsed-value)))))
                                        {} prop-blocks)]
                    (when (and tag-id tag-name)
                      (merge {:id tag-id :name tag-name} properties)))))
           (filter identity)
           (vec)))
    (catch :default e
      (js/console.error "Error parsing config:" e)
      [])))

(defn load-config-from-page []
  "Loads tag configuration from the config page"
  (try
    (if-not (config-page-exists?)
      (do
        (js/console.log "Config page not found, using defaults")
        default-tag-configs)
      (let [config-page-id (rd/q '[:find ?e .
                                  :in $ ?title
                                  :where [?e :node/title ?title]]
                                "roam/yearly calendar config")
            parsed-tags (when config-page-id
                         (parse-tag-from-config-page config-page-id))]
        (if (seq parsed-tags)
          parsed-tags
          (do
            (js/console.log "No valid tags parsed, using defaults")
            default-tag-configs))))
    (catch :default e
      (js/console.error "Error loading config from page:" e)
      default-tag-configs)))

;; 2.2 🎯 PAGE-BASED YEAR DETECTION - NEW!
(defn get-current-page-title []
  "Gets the current page title using DOM - much simpler and more reliable!"
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
  "Detects if we're on a year page like [[2024]] and returns that year"
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

;; 2.3 🦊 ROAM DATA QUERY FUNCTIONS (proven working from Step 3.2)
(defn page-exists? [page-title]
  "Checks if a page with the given title exists in the graph"
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
  "Recursively finds all blocks tagged with a specific tag"
  (if-not block []
    (let [current-match (if (and (:block/string block) 
                                (str/includes? (:block/string block) (str "#" tag)))
                          [[(:block/string block) (:block/uid block) tag]] 
                          [])
          child-matches (mapcat #(find-tagged-blocks % tag) (:block/children block))]
      (concat current-match child-matches))))

(defn get-month-events [month year active-tags]
  "Gets all tagged events from a specific month page - works for any month"
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

;; 3.0 🌸 SORTING AND TEXT EXTRACTION FUNCTIONS (proven working from Step 3.2)
(defn extract-day-number [event-string]
  "Extracts day number from event string: '7 (We) - text' → 7"
  (try
    (when-let [match (re-find #"^(\d+)\s+\(" event-string)]
      (js/parseInt (second match)))
    (catch :default e
      (js/console.warn "Could not extract day number from:" event-string)
      999)))

(defn extract-clean-event-text [event-string]
  "Extracts clean display text from messy Roam event string"
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
  "Sorts events by day number extracted from event string"
  (sort-by (fn [[event-string _ _]]
             (extract-day-number event-string))
           events))

;; 3.1 🦜 HELPER FUNCTIONS FOR UI
(defn get-tag-config [tag-id tag-configs]
  "Gets tag configuration by ID"
  (first (filter #(= tag-id (:id %)) tag-configs)))

(defn get-month-name [month-num]
  "Gets month name by number (1-12)"
  (let [month-names ["January" "February" "March" "April" "May" "June" 
                     "July" "August" "September" "October" "November" "December"]]
    (get month-names (dec month-num))))

;; 4.0 🚀 PAGE-BASED NAVIGATION FUNCTIONS - UPGRADED WITH PAGE EXISTENCE CHECKS!
(defn navigate-to-year [year]
  "Navigates to the specified year page - with existence check!"
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
  "Navigates to the specified month page - with existence check!"
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
  "Opens the specified month page in Roam sidebar - with existence check!"
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
  "Navigates to the config page - with existence check!"
  (let [config-page-title "roam/ext/yearly view/config"]
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
  "Navigates to the specific event block in Roam - main window or sidebar"
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

;; 4.1 🦜 UI COMPONENTS (from working Step 3.2)
(defn refresh-button [on-click is-refreshing last-refresh-time]
  "Renders a refresh button with activity indicator"
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

;; 4.2 🦜 SCALED-DOWN FILTER TOGGLE - REDUCED BY 30%
(defn filter-toggle [tag checked on-change]
  "Renders a toggle control for filters with styled label - 30% smaller"
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

;; 4.3 🚀 UPGRADED YEAR CONTROL WITH PAGE NAVIGATION
(defn year-control [year]
  "Renders year navigation controls - NOW WITH PAGE NAVIGATION!"
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

;; 4.4 ✨ COLLAPSIBLE HELP COMPONENT WITH SETTINGS BUTTON - UPDATED!
(defn collapsible-help [show-help]
  "Renders a sleek collapsible help section with settings button"
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
    
    ;; Settings button - NEW!
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

;; 4.5 🦜 EVENT ITEM WITH SHIFT-CLICK NAVIGATION
(defn event-item [event-string event-uid tag-id tag-configs]
  "Renders a single event item with shift-click sidebar support"
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

;; 4.6 🦜 MONTH PANEL WITH SIDEBAR BUTTON
(defn month-panel [month-name month-num year events tag-configs]
  "Renders month panel with click navigation + sidebar button"
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

;; 5.0 🌲 MAIN COMPONENT - UPGRADED WITH PAGE NAVIGATION & COMPACT HELP & SETTINGS
(defn yearly-view [{:keys [block-uid]}]
  "Main component - PAGE-BASED NAVIGATION + COLLAPSIBLE HELP SYSTEM + SETTINGS BUTTON!"
  (let [tag-configs (r/atom default-tag-configs)
        config-status (r/atom "Loading...")
        current-year (r/atom (get-current-page-year))  ; 🎯 DETECTS PAGE YEAR!
        events-by-month (r/atom {})  
        events-status (r/atom "Loading events...")
        debug-info (r/atom [])
        loading-progress (r/atom 0)
        is-refreshing (r/atom false)
        last-refresh-time (r/atom nil)
        active-categories (r/atom #{})
        show-help (r/atom false)]  ; 🆕 HELP STATE!
    
    ;; Helper function to load events for a specific month
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
    
    ;; Function to load all months for the current year
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
    
    ;; 🎯 PAGE SYNC: Watch for page changes and update year
    (defn sync-with-current-page []
      (let [detected-year (get-current-page-year)]
        (when (not= detected-year @current-year)
          (js/console.log "🔄 Page changed, syncing year:" detected-year)
          (reset! current-year detected-year)
          (load-all-months))))
    
    (r/create-class
     {:component-did-mount
      (fn []
        ;; Load config first
        (try
          (let [loaded-config (load-config-from-page)]
            (reset! tag-configs loaded-config)
            (reset! config-status 
                    (if (config-page-exists?)
                      (str "✓ Config loaded from page (" (count loaded-config) " tags)")
                      "⚠ Using default config (page not found)")))
          (catch :default e
            (js/console.error "Error loading config:" e)
            (reset! tag-configs default-tag-configs)
            (reset! config-status "❌ Error loading config, using defaults")))
        
        ;; Initialize active categories based on config defaults
        (reset! active-categories 
                (into #{} (map :id (filter :default-active @tag-configs))))
        
        ;; Load events for all 12 months
        (load-all-months)
        
        ;; 🎯 Set up page change listener
        (js/setInterval sync-with-current-page 2000)  ; Check every 2 seconds
        
        ;; Add custom scrollbar CSS
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
         
         ;; Title with dynamic year
         [:h3 {:style {:text-align "center" :margin-top "0" :margin-bottom "15px" :color "#345980"}}
          "📅 Interactive Yearly Calendar " [:span {:style {:color "#888"}} @current-year]]
         
         ;; 🚀 UPGRADED Year navigation controls with PAGE NAVIGATION
         [year-control @current-year]
         
         ;; Refresh button with last update time
         [refresh-button load-all-months @is-refreshing @last-refresh-time]
         
         ;; SCALED-DOWN FILTER CONTROLS - Reduced by 30%
         [:div.filter-controls {:style {:display "flex"
                                       :flex-wrap "wrap"
                                       :justify-content "center"
                                       :margin "14px 0 21px"        ; was 20px 0 30px, now reduced by 30%
                                       :padding "10px"              ; was 15px, now 10px (-33%)
                                       :background "#f9f4eb"
                                       :border-radius "6px"         ; was 8px, now 6px (-25%)
                                       :border "1px solid #e5d9c3"
                                       :box-shadow "0 1px 3px rgba(0,0,0,0.05)"}}  ; reduced shadow
          
          ;; Show tag toggles using dynamic config - all scaled down
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
         
         ;; Status display
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
         
         ;; ✨ UPDATED COLLAPSIBLE HELP SECTION WITH SETTINGS BUTTON!
         [collapsible-help show-help]
         
         ;; FULL 12-MONTH INTERACTIVE GRID LAYOUT (3×4)
         [:div.twelve-month-grid {:style {:display "grid"
                                         :grid-template-columns "repeat(3, 1fr)"
                                         :grid-template-rows "repeat(4, auto)"
                                         :gap "15px"
                                         :margin-bottom "20px"
                                         :justify-items "center"
                                         :max-width "1000px"
                                         :margin-left "auto"
                                         :margin-right "auto"}}
          
          ;; Generate all 12 months with filtered events and sidebar buttons
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
         
         ;; Enhanced summary with interaction stats
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

;; 6.0 🌲 Main export function
(defn main [{:keys [block-uid]}]
  "Main export function"
  [yearly-view {:block-uid block-uid}])

;; 📝 STEP 4.2+ SUCCESS CRITERIA - PAGE NAVIGATION + COMPACT HELP + SETTINGS BUTTON:
;; 
;; 🎯 PAGE-BASED NAVIGATION WITH WARNINGS (preserved):
;; - Year detection: Automatically detects if on [[2024]] page and shows 2024 calendar
;; - Year navigation: Click year buttons → navigate to [[2023]], [[2026]] etc WITH existence checks
;; - Page sync: Automatically updates calendar when navigating between year pages
;; - Month navigation: All month clicks check for page existence first
;; - Sidebar navigation: Sidebar buttons also check for page existence
;; - User-friendly warnings: Clear popups when pages don't exist yet
;;
;; ✨ COLLAPSIBLE HELP SYSTEM (preserved):
;; - Compact toggle button with icon (🔗/🔽)
;; - Smooth slideDown animation for help content
;; - Much smaller footprint - only shows when needed
;; - Clean, professional appearance with hover effects
;;
;; 🛠️ NEW: SETTINGS BUTTON FUNCTIONALITY:
;; - Added "🛠️ Jump to Settings Page" button next to help button
;; - Navigates to [[roam/ext/yearly view/config]] page
;; - Uses same existence check pattern as other navigation
;; - Shows warning popup if settings page doesn't exist yet
;; - Golden color scheme to distinguish from help button
;; - Consistent styling and hover effects
;;
;; ✅ PRESERVED FEATURES:
;; - All previous navigation (month panels, events, sidebar buttons)
;; - Scaled-down filter bar (30% smaller)
;; - Event filtering and categorization
;; - Roam datascript integration
;; - Configuration system
;;
;; 🎉 RESULT: A complete calendar system with easy access to both help and settings!`;

    // =============================================================
    // STEP 2: Create Hierarchy in [[roam/render]] ✅
    // =============================================================
    const platform = window.RoamExtensionSuite;
    if (!platform) {
      throw new Error(
        "RoamExtensionSuite not found - please ensure extension suite is loaded"
      );
    }

    const cascadeToBlock = platform.getUtility("cascadeToBlock");
    if (!cascadeToBlock) {
      throw new Error("cascadeToBlock utility not found");
    }

    const parentBlockUid = await cascadeToBlock(
      "roam/render",
      [
        "**Components added by Extensions:**",
        "**Added by Calendar Suite:**",
        "**Yearly View**",
      ],
      true // createPage = true
    );

    if (!parentBlockUid) {
      throw new Error("Failed to create hierarchy in [[roam/render]]");
    }

    // =============================================================
    // STEP 3: Check for Existing Component ✅
    // =============================================================
    const existingChildren = roamAlphaAPI.data.q(`
          [:find ?uid ?string
           :where 
           [?parent :block/uid "${parentBlockUid}"]
           [?parent :block/children ?child]
           [?child :block/uid ?uid]
           [?child :block/string ?string]]
        `);

    // =============================================================
    // STEP 4: Create/Update Component Block ✅
    // =============================================================
    const codeBlockContent = `\`\`\`clojure
${clojureScriptComponent}
\`\`\``;

    if (existingChildren.length > 0) {
      // Update existing block
      const existingBlockUid = existingChildren[0][0];
      await roamAlphaAPI.data.block.update({
        block: {
          uid: existingBlockUid,
          string: codeBlockContent,
        },
      });
    } else {
      // Create new block
      await roamAlphaAPI.data.block.create({
        location: {
          "parent-uid": parentBlockUid,
          order: 0,
        },
        block: {
          string: codeBlockContent,
        },
      });
    }

    // =============================================================
    // STEP 5: Harvest Component Block UID ✅
    // =============================================================
    // Wait for Roam to process the block creation/update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Query for the component block UID
    const componentBlocks = roamAlphaAPI.data.q(`
          [:find ?uid ?string
           :where 
           [?parent :block/uid "${parentBlockUid}"]
           [?parent :block/children ?child]
           [?child :block/uid ?uid]
           [?child :block/string ?string]]
        `);

    // Find the block that contains our clojure code
    const componentBlock = componentBlocks.find(
      ([uid, text]) =>
        text.includes("```clojure") && text.includes("yearly-view.core")
    );

    let componentBlockUid = null;
    if (componentBlock) {
      componentBlockUid = componentBlock[0];
    } else {
      throw new Error("Could not locate component block UID");
    }

    return {
      success: true,
      parentBlockUid,
      componentBlockUid,
      renderString: `{{roam/render: ((${componentBlockUid}))}}`,
      message: "Yearly View Component deployed successfully!",
    };
  } catch (error) {
    throw new Error(`Component deployment failed: ${error.message}`);
  }
}

// =================================================================
// COMPONENT 2: YEAR PAGE SETUP
// =================================================================

async function setupYearlyViewOnPage(year, componentBlockUid) {
  console.log(`   📅 Setting up yearly view on [[${year}]] page...`);

  if (!componentBlockUid) {
    throw new Error("No component UID provided for year page setup");
  }

  try {
    let pageCreated = false;
    let blockAdded = false;

    // =============================================================
    // STEP 1: Ensure Year Page Exists ✅
    // =============================================================
    const yearPageTitle = year.toString();
    let yearPageQuery = roamAlphaAPI.data.q(`
          [:find ?uid
           :where 
           [?page :node/title "${yearPageTitle}"]
           [?page :block/uid ?uid]]
        `);

    let yearPageUid;
    if (!yearPageQuery || yearPageQuery.length === 0) {
      // Create year page if it doesn't exist
      console.log(`   📝 Creating [[${yearPageTitle}]] page...`);
      await roamAlphaAPI.data.page.create({
        page: { title: yearPageTitle },
      });

      pageCreated = true;

      // Wait for page creation and re-query
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newPageQuery = roamAlphaAPI.data.q(`
              [:find ?uid
               :where 
               [?page :node/title "${yearPageTitle}"]
               [?page :block/uid ?uid]]
            `);
      yearPageUid = newPageQuery[0][0];
    } else {
      yearPageUid = yearPageQuery[0][0];
    }

    console.log(`   ✅ Year page UID: ${yearPageUid}`);

    // =============================================================
    // STEP 2: Check if Yearly View Already Exists ✅
    // =============================================================
    const pageChildren = roamAlphaAPI.data.q(`
          [:find ?uid ?string
           :where 
           [?parent :block/uid "${yearPageUid}"]
           [?parent :block/children ?child]
           [?child :block/uid ?uid]
           [?child :block/string ?string]]
        `);

    const existingYearlyView = pageChildren.find(([uid, text]) =>
      text.includes("Yearly view nested below:")
    );

    if (existingYearlyView) {
      console.log("   ⚠️ Yearly view already exists on this page, skipping...");
      return {
        success: true,
        pageCreated,
        blockAdded: false,
        message: "Yearly view already exists on page",
      };
    }

    // =============================================================
    // STEP 3: Add Yearly View Blocks ✅
    // =============================================================
    console.log("   📝 Adding yearly view blocks...");

    // Create parent block
    const parentBlockResult = await roamAlphaAPI.data.block.create({
      location: {
        "parent-uid": yearPageUid,
        order: 0,
      },
      block: {
        string: "Yearly view nested below:",
      },
    });

    const parentBlockUid = parentBlockResult[":block/uid"];

    // Create child block with roam/render
    await roamAlphaAPI.data.block.create({
      location: {
        "parent-uid": parentBlockUid,
        order: 0,
      },
      block: {
        string: `{{roam/render: ((${componentBlockUid}))}}`,
      },
    });

    blockAdded = true;

    return {
      success: true,
      pageCreated,
      blockAdded,
      message: `Yearly view successfully added to [[${yearPageTitle}]]`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      pageCreated: false,
      blockAdded: false,
    };
  }
}

// =================================================================
// COMPONENT 3: YEAR PAGE DETECTION SYSTEM
// =================================================================

function setupYearPageDetection() {
  console.log("🔍 Setting up year page detection system...");

  let lastDetectedPage = null;
  let lastPromptTime = 0;
  const PROMPT_COOLDOWN = 30000; // 30 seconds between prompts

  function checkForYearPage() {
    try {
      // Get current page title
      const titleElement = document.querySelector(".rm-title-display");
      const currentPageTitle = titleElement
        ? titleElement.textContent.trim()
        : null;

      if (!currentPageTitle || currentPageTitle === lastDetectedPage) {
        return;
      }

      lastDetectedPage = currentPageTitle;

      // Check if it's a year page (4 digits between 1000-9999)
      const yearMatch = currentPageTitle.match(/^(\d{4})$/);
      if (!yearMatch) {
        return;
      }

      const year = parseInt(yearMatch[1]);
      if (year < 1000 || year > 9999) {
        return;
      }

      console.log(`🎯 Detected year page: [[${year}]]`);

      // Check cooldown
      const now = Date.now();
      if (now - lastPromptTime < PROMPT_COOLDOWN) {
        console.log("⏰ Prompt cooldown active, skipping...");
        return;
      }

      // Check if yearly view already exists on this page
      checkAndPromptForYearlyView(year);
    } catch (error) {
      console.warn("Error in year page detection:", error);
    }
  }

  async function checkAndPromptForYearlyView(year) {
    try {
      // Check if page has yearly view already
      const yearPageQuery = roamAlphaAPI.data.q(`
            [:find ?uid
             :where 
             [?page :node/title "${year}"]
             [?page :block/uid ?uid]]
          `);

      if (!yearPageQuery || yearPageQuery.length === 0) {
        console.log(`📝 Year page [[${year}]] doesn't exist yet`);
        return;
      }

      const yearPageUid = yearPageQuery[0][0];
      const pageChildren = roamAlphaAPI.data.q(`
            [:find ?uid ?string
             :where 
             [?parent :block/uid "${yearPageUid}"]
             [?parent :block/children ?child]
             [?child :block/uid ?uid]
             [?child :block/string ?string]]
          `);

      const hasYearlyView = pageChildren.some(([uid, text]) =>
        text.includes("Yearly view nested below:")
      );

      if (hasYearlyView) {
        console.log(`✅ Yearly view already exists on [[${year}]]`);
        return;
      }

      // Prompt user
      lastPromptTime = Date.now();
      const userWantsYearlyView = confirm(
        `🗓️ Would you like to add the interactive yearly calendar to this [[${year}]] page?\n\n` +
          `This will add a comprehensive yearly view showing all your tagged events ` +
          `from month pages like [[January ${year}]], [[February ${year}]], etc.\n\n` +
          `Click OK to add it, or Cancel to skip.`
      );

      if (userWantsYearlyView) {
        console.log(`🎯 User requested yearly view for [[${year}]]`);
        await deployYearlyViewToSpecificYear(year);
      } else {
        console.log(`❌ User declined yearly view for [[${year}]]`);
      }
    } catch (error) {
      console.error("Error checking/prompting for yearly view:", error);
    }
  }

  // Set up interval to check every 2 seconds
  if (window.yearPageDetectionInterval) {
    clearInterval(window.yearPageDetectionInterval);
  }

  window.yearPageDetectionInterval = setInterval(checkForYearPage, 2000);
  console.log("✅ Year page detection system active");
}

async function deployYearlyViewToSpecificYear(year) {
  console.log(`🚀 Deploying yearly view to [[${year}]]...`);

  try {
    // First ensure we have the component
    let componentBlockUid = await findExistingComponentUid();

    if (!componentBlockUid) {
      console.log("📦 Component not found, deploying first...");
      const componentResult = await deployYearlyViewComponent();
      componentBlockUid = componentResult.componentBlockUid;
    }

    // Then add to the specific year page
    const yearSetupResult = await setupYearlyViewOnPage(
      year,
      componentBlockUid
    );

    if (yearSetupResult.success) {
      alert(
        `🎉 Yearly calendar successfully added to [[${year}]]!\n\nRefresh the page to see your interactive calendar.`
      );

      // Optional: Refresh the page to show the component
      if (
        confirm("Would you like to refresh the page now to see the calendar?")
      ) {
        window.location.reload();
      }
    } else {
      alert(
        `❌ Failed to add yearly calendar to [[${year}]]:\n${yearSetupResult.message}`
      );
    }
  } catch (error) {
    console.error("Error deploying yearly view:", error);
    alert(`❌ Error deploying yearly calendar:\n${error.message}`);
  }
}

async function findExistingComponentUid() {
  try {
    // Try to find existing component
    const renderPageQuery = roamAlphaAPI.data.q(`
          [:find ?uid
           :where 
           [?page :node/title "roam/render"]
           [?page :block/uid ?uid]]
        `);

    if (!renderPageQuery || renderPageQuery.length === 0) {
      return null;
    }

    // Look for the component in the hierarchy
    const platform = window.RoamExtensionSuite;
    if (!platform) return null;

    const findNestedDataValuesExact = platform.getUtility(
      "findNestedDataValuesExact"
    );
    if (!findNestedDataValuesExact) return null;

    const renderPageUid = renderPageQuery[0][0];
    const hierarchyData = findNestedDataValuesExact(
      renderPageUid,
      "Components added by Extensions"
    );

    if (!hierarchyData) return null;

    // Search for yearly view component block
    // This is a simplified search - in practice you'd traverse the hierarchy
    const componentBlocks = roamAlphaAPI.data.q(`
          [:find ?uid ?string
           :where 
           [?b :block/uid ?uid]
           [?b :block/string ?string]
           [(clojure.string/includes? ?string "yearly-view.core")]]
        `);

    if (componentBlocks && componentBlocks.length > 0) {
      return componentBlocks[0][0];
    }

    return null;
  } catch (error) {
    console.warn("Error finding existing component:", error);
    return null;
  }
}

// =================================================================
// EXTENSION EXPORT
// =================================================================

// Export for Roam Depot
window.RoamLazy = window.RoamLazy || {};
window.RoamLazy.YearlyViewExtension = {
  onload,
  onunload,
  extension,
};

// =================================================================
// AUTO-EXECUTION (since Roam isn't calling onload automatically)
// =================================================================

console.log("🚀 Yearly View Extension loaded - checking for auto-execution...");

// Wait for dependencies and auto-execute
function autoExecuteExtension() {
  if (window.RoamExtensionSuite && window.roamAlphaAPI) {
    console.log(
      "✅ Dependencies ready - auto-executing yearly view extension..."
    );

    // Call onload manually with mock API
    onload({
      extensionAPI: {
        ui: {
          commandPalette: {
            addCommand: (cmd) => {
              console.log("✅ Auto-registered command:", cmd.label);
              window.autoYearlyViewCommand = cmd.callback;
            },
          },
        },
      },
    });

    console.log("🎉 Yearly View Extension auto-execution complete!");
  } else {
    console.log("⏳ Dependencies not ready, retrying in 1 second...");
    setTimeout(autoExecuteExtension, 1000);
  }
}

// Start auto-execution after a brief delay
setTimeout(autoExecuteExtension, 500);
