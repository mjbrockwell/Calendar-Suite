// 🩹 UNIFIED WEEKLY VIEW BANDAID EXTENSION
// Backwards-compatible enhancement for David Vargas's Weekly View extension
// Provides navigation, auto-backlinking, and hashtag enhancement when original fails
// For use as extension.js

console.log("🩹 Unified Weekly View Bandaid Extension Loading...");

// ===================================================================
// 🔧 SHARED CONFIGURATION & STATE
// ===================================================================

const BANDAID_CONFIG = {
  // General settings
  monitorInterval: 1000,
  quickCheckInterval: 500,
  maxRetries: 20,

  // Feature toggles
  navigationEnabled: true,
  backlinkEnabled: true,
  hashtagEnhancerEnabled: true,

  // Element IDs
  navigationButtonId: "bandaid-weekly-nav",
  backlinkButtonId: "bandaid-weekly-backlink",
  originalButtonId: "roamjs-weekly-mode-nav",

  // CSS classes
  hashtagClassName: "weekly-hashtag-pill",

  // Patterns
  weeklyPagePattern: /\d{1,2}\/\d{1,2}\s+\d{4}\s*-\s*\d{1,2}\/\d{1,2}\s+\d{4}/,
  weeklyTitlePattern:
    /(\d{1,2})\/(\d{1,2})\s+(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\s+(\d{4})/,
};

// Global state
const BANDAID_STATE = {
  currentUrl: "",
  isMonitoring: false,
  retryCount: 0,
  lastPageTitle: "",
  cssInjected: false,
};

// ===================================================================
// 🛠️ SHARED UTILITIES
// ===================================================================

const BandaidUtils = {
  // Date utilities
  addWeeks: (date, weeks) => {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
  },

  subWeeks: (date, weeks) => {
    const result = new Date(date);
    result.setDate(result.getDate() - weeks * 7);
    return result;
  },

  formatDate: (date, format) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return format
      .replace(/yyyy/g, year)
      .replace(/MM/g, month)
      .replace(/dd/g, day);
  },

  getOrdinalSuffix: (day) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  },

  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  shortMonthNames: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

  formatDailyNoteTitle: (date) => {
    const month = BandaidUtils.monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const ordinal = BandaidUtils.getOrdinalSuffix(day);

    return `${month} ${day}${ordinal}, ${year}`;
  },

  // DOM utilities
  getPageTitle: () => {
    const selectors = [
      ".roam-article h1.rm-title-display",
      ".rm-title-display",
      'h1[data-testid="page-title"]',
      ".roam-article h1",
      "h1.rm-page-title",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || "";
      }
    }
    return "";
  },

  isWeeklyNotePage: (title) => {
    if (!title) return false;
    return BANDAID_CONFIG.weeklyPagePattern.test(title);
  },

  parseWeeklyNote: (title) => {
    const match = title.match(BANDAID_CONFIG.weeklyTitlePattern);
    if (!match) return null;

    const [, startMonth, startDay, startYear, endMonth, endDay, endYear] =
      match;

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

    return { startDate, endDate, format: "MM/dd/yyyy", originalTitle: title };
  },

  generateDailyTitles: (weekData) => {
    const { startDate, endDate } = weekData;
    const dailyTitles = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dailyTitles.push(BandaidUtils.formatDailyNoteTitle(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyTitles;
  },

  // Navigation utilities
  navigateToPage: (pageName) => {
    console.log(`🧭 Navigating to: ${pageName}`);

    try {
      if (window.roamAlphaAPI?.ui?.mainWindow?.openPage) {
        window.roamAlphaAPI.ui.mainWindow.openPage({
          page: { title: pageName },
        });
      } else if (window.location.hash.includes("/page/")) {
        const encodedTitle = encodeURIComponent(pageName);
        window.location.hash = `#/app/graph/page/${encodedTitle}`;
      } else {
        const link = document.createElement("a");
        link.href = `#/app/graph/page/${encodeURIComponent(pageName)}`;
        link.click();
      }
    } catch (e) {
      console.error("Navigation error:", e);
    }
  },

  // Roam API utilities
  getPageUid: (title) => {
    try {
      const result = window.roamAlphaAPI.q(`
                [:find ?title ?uid
                 :where [?page :node/title ?title]
                        [?page :block/uid ?uid]
                        [(= ?title "${title}")]]
            `);
      return result?.[0]?.[1];
    } catch (e) {
      console.error("Query error:", e);
      return null;
    }
  },

  createPage: async (title) => {
    try {
      const uid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.page.create({
        page: { title: title, uid: uid },
      });
      console.log(`✅ Page created: ${title}`);
      return uid;
    } catch (error) {
      console.error(`❌ Failed to create page "${title}":`, error);
      throw error;
    }
  },

  createBlock: async (parentUid, content, order = "last") => {
    try {
      const uid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": parentUid, order: order },
        block: { string: content, uid: uid },
      });
      console.log(`✅ Block created in ${parentUid}: "${content}"`);
      return uid;
    } catch (error) {
      console.error(`❌ Failed to create block in "${parentUid}":`, error);
      throw error;
    }
  },

  // Delay utility
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// ===================================================================
// 🎨 CSS STYLES INJECTION
// ===================================================================

const injectCSS = () => {
  if (BANDAID_STATE.cssInjected) return;

  const style = document.createElement("style");
  style.id = "bandaid-weekly-styles";
  style.textContent = `
        /* Weekly Navigation Button Styles */
        #${BANDAID_CONFIG.navigationButtonId} {
            display: flex;
            justify-content: space-between;
            margin: 16px 0;
            gap: 12px;
            padding: 8px 0;
            border-top: 1px solid #e0e5e9;
            border-bottom: 1px solid #e0e5e9;
        }
        
        .bandaid-nav-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .bandaid-nav-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .bandaid-nav-button:active {
            transform: translateY(0);
        }
        
        /* Backlink Button Styles */
        #${BANDAID_CONFIG.backlinkButtonId} {
            background: #f0fdf4;
            color: #166534;
            border: 1.5px solid #22c55e;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            margin: 12px 0;
            display: block;
            transition: all 0.2s ease;
        }
        
        #${BANDAID_CONFIG.backlinkButtonId}:hover {
            background: #dcfce7;
            border-color: #16a34a;
        }
        
        #${BANDAID_CONFIG.backlinkButtonId}:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        /* Weekly Hashtag Pills */
        .${BANDAID_CONFIG.hashtagClassName} {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            color: #475569 !important;
            text-decoration: none !important;
            padding: 8px 17px;
            border-radius: 20px;
            display: inline-block;
            font-size: 15px;
            font-weight: 600 !important;
            box-shadow: 0 2px 8px rgba(148, 163, 184, 0.15);
            transition: all 0.2s ease;
            margin: 2px 4px 2px 0;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            animation: slideInFromLeft 0.3s ease-out;
        }
        
        .${BANDAID_CONFIG.hashtagClassName}:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(148, 163, 184, 0.25);
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-color: #cbd5e1;
            font-weight: 600 !important;
        }
        
        .${BANDAID_CONFIG.hashtagClassName}:active {
            transform: translateY(0px);
            box-shadow: 0 1px 4px rgba(102, 126, 234, 0.3);
        }
        
        .${BANDAID_CONFIG.hashtagClassName}.current-week {
            background: linear-gradient(135deg, #fef7f7 0%, #fef2f2 100%);
            color: #7f1d1d !important;
            box-shadow: 0 2px 8px rgba(248, 113, 113, 0.2);
            border-color: #fecaca;
            animation: subtle-pulse 3s infinite;
        }
        
        @keyframes subtle-pulse {
            0%, 100% { box-shadow: 0 2px 8px rgba(248, 113, 113, 0.2); }
            50% { box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3); }
        }
        
        @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @media (max-width: 768px) {
            .${BANDAID_CONFIG.hashtagClassName} {
                padding: 4px 10px;
                font-size: 12px;
                margin: 1px 2px 1px 0;
            }
        }
    `;

  document.head.appendChild(style);
  BANDAID_STATE.cssInjected = true;
  console.log("🎨 Bandaid CSS styles injected");
};

// ===================================================================
// 🧭 NAVIGATION BANDAID MODULE
// ===================================================================

const NavigationBandaid = {
  createNavigationButtons: (weekData) => {
    if (!BANDAID_CONFIG.navigationEnabled) return false;

    const { startDate, endDate, format } = weekData;

    // Calculate previous and next week dates
    const prevWeekStart = BandaidUtils.subWeeks(startDate, 1);
    const prevWeekEnd = BandaidUtils.subWeeks(endDate, 1);
    const nextWeekStart = BandaidUtils.addWeeks(startDate, 1);
    const nextWeekEnd = BandaidUtils.addWeeks(endDate, 1);

    // Generate page titles
    const prevTitle = `${BandaidUtils.formatDate(
      prevWeekStart,
      format
    )} - ${BandaidUtils.formatDate(prevWeekEnd, format)}`;
    const nextTitle = `${BandaidUtils.formatDate(
      nextWeekStart,
      format
    )} - ${BandaidUtils.formatDate(nextWeekEnd, format)}`;

    // Find where to place buttons
    const header = document.querySelector(
      ".roam-article h1.rm-title-display, .rm-title-display"
    );
    if (!header) return false;

    const headerContainer = header.parentElement;
    if (!headerContainer) return false;

    // Remove existing bandaid buttons
    const existingBandaid = document.getElementById(
      BANDAID_CONFIG.navigationButtonId
    );
    if (existingBandaid) {
      existingBandaid.remove();
    }

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.id = BANDAID_CONFIG.navigationButtonId;

    // Create buttons
    const createButton = (text, title, position) => {
      const button = document.createElement("button");
      button.textContent = text;
      button.title = `Navigate to ${title}`;
      button.className = "bandaid-nav-button";
      button.style.cssText =
        position === "left" ? "margin-right: auto;" : "margin-left: auto;";

      button.addEventListener("click", () => {
        BandaidUtils.navigateToPage(title);
      });

      return button;
    };

    const prevButton = createButton("← Last Week", prevTitle, "left");
    const nextButton = createButton("Next Week →", nextTitle, "right");

    buttonContainer.appendChild(prevButton);
    buttonContainer.appendChild(nextButton);

    // Insert after header
    headerContainer.insertBefore(buttonContainer, header.nextSibling);

    console.log("🩹 Navigation buttons created successfully!");
    return true;
  },

  checkAndCreateButtons: () => {
    const title = BandaidUtils.getPageTitle();

    if (!title || !BandaidUtils.isWeeklyNotePage(title)) {
      return "not-weekly";
    }

    // Check if original buttons already exist
    const originalButtons = document.getElementById(
      BANDAID_CONFIG.originalButtonId
    );
    if (originalButtons && originalButtons.children.length > 0) {
      console.log("📍 Original navigation buttons found, skipping bandaid");
      return "original-exists";
    }

    // Check if our bandaid buttons already exist
    const bandaidButtons = document.getElementById(
      BANDAID_CONFIG.navigationButtonId
    );
    if (bandaidButtons) {
      return "bandaid-exists";
    }

    // Try to parse the weekly note
    const weekData = BandaidUtils.parseWeeklyNote(title);
    if (!weekData) {
      console.log(`❓ Could not parse weekly note format: ${title}`);
      return "parse-failed";
    }

    // Create buttons
    const success = NavigationBandaid.createNavigationButtons(weekData);
    return success ? "created" : "failed";
  },
};

// ===================================================================
// 🔗 BACKLINK BANDAID MODULE
// ===================================================================

const BacklinkBandaid = {
  processDailyPage: async (dailyTitle, weeklyTitle) => {
    console.log(`📝 Processing daily page: ${dailyTitle}`);

    let pageUid = BandaidUtils.getPageUid(dailyTitle);

    // Create page if it doesn't exist
    if (!pageUid) {
      console.log(`📄 Creating new daily page: ${dailyTitle}`);
      try {
        pageUid = await BandaidUtils.createPage(dailyTitle);
        if (!pageUid) {
          console.error(`❌ Failed to create page: ${dailyTitle}`);
          return false;
        }

        // Create the hashtag block as the first block
        console.log(`🔗 Adding hashtag block to new page: ${dailyTitle}`);
        const blockUid = await BandaidUtils.createBlock(
          pageUid,
          `#[[${weeklyTitle}]]`
        );
        if (!blockUid) {
          console.error(`❌ Failed to create hashtag block in: ${dailyTitle}`);
          return false;
        }
        console.log(
          `✅ Successfully created page and hashtag for: ${dailyTitle}`
        );
        return true;
      } catch (e) {
        console.error(`❌ Error creating page ${dailyTitle}:`, e);
        return false;
      }
    }

    // Page exists - check if hashtag already exists ANYWHERE on the page
    console.log(`🔍 Checking if hashtag already exists on: ${dailyTitle}`);
    const expectedHashtag = `#[[${weeklyTitle}]]`;

    try {
      // Query all blocks on the page to see if hashtag exists anywhere
      const allBlocks = window.roamAlphaAPI.q(`
                [:find ?string
                 :where [?page :block/uid "${pageUid}"]
                        [?page :block/children ?child]
                        [?child :block/string ?string]]
            `);

      // Check if any block contains our hashtag
      const hashtagExists = allBlocks.some(
        ([content]) => content && content.includes(expectedHashtag)
      );

      if (hashtagExists) {
        console.log(`✅ Hashtag already exists on ${dailyTitle} - skipping`);
        return true;
      }

      // Hashtag doesn't exist anywhere - add it as a new block at the top
      console.log(`➕ Adding hashtag block at top of: ${dailyTitle}`);
      const blockUid = await BandaidUtils.createBlock(
        pageUid,
        expectedHashtag,
        0
      );
      if (!blockUid) {
        console.error(`❌ Failed to create hashtag block in: ${dailyTitle}`);
        return false;
      }
      console.log(`✅ Successfully added hashtag to: ${dailyTitle}`);
      return true;
    } catch (e) {
      console.error(`❌ Error processing ${dailyTitle}:`, e);
      return false;
    }
  },

  processWeeklyBacklinks: async (weeklyTitle) => {
    console.log(`🔗 Starting auto-backlink process for: ${weeklyTitle}`);

    const weekData = BandaidUtils.parseWeeklyNote(weeklyTitle);
    if (!weekData) {
      console.error("❌ Could not parse weekly title format");
      return false;
    }

    const dailyTitles = BandaidUtils.generateDailyTitles(weekData);
    console.log(
      `📅 Generated ${dailyTitles.length} daily titles:`,
      dailyTitles
    );

    let successCount = 0;

    for (const dailyTitle of dailyTitles) {
      const success = await BacklinkBandaid.processDailyPage(
        dailyTitle,
        weeklyTitle
      );
      if (success) successCount++;

      // Short delay between operations
      await BandaidUtils.delay(200);
    }

    console.log(
      `✅ Auto-backlink complete: ${successCount}/${dailyTitles.length} daily pages processed`
    );
    return true;
  },

  checkIfBacklinksNeeded: async (weeklyTitle) => {
    const weekData = BandaidUtils.parseWeeklyNote(weeklyTitle);
    if (!weekData) return false;

    const dailyTitles = BandaidUtils.generateDailyTitles(weekData);
    const expectedHashtag = `#[[${weeklyTitle}]]`;

    for (const dailyTitle of dailyTitles) {
      const pageUid = BandaidUtils.getPageUid(dailyTitle);

      if (!pageUid) {
        return true; // Page doesn't exist, so we need to create it
      }

      try {
        // Query all blocks on the page to see if hashtag exists anywhere
        const allBlocks = window.roamAlphaAPI.q(`
                    [:find ?string
                     :where [?page :block/uid "${pageUid}"]
                            [?page :block/children ?child]
                            [?child :block/string ?string]]
                `);

        // Check if any block contains our hashtag
        const hashtagExists = allBlocks.some(
          ([content]) => content && content.includes(expectedHashtag)
        );

        if (!hashtagExists) {
          return true; // This daily note is missing the hashtag
        }
      } catch (e) {
        console.error(`Error checking ${dailyTitle}:`, e);
        return true; // If we can't check, assume we need the button
      }
    }

    return false; // All daily notes already have the hashtag
  },

  createBacklinkButton: async () => {
    if (!BANDAID_CONFIG.backlinkEnabled) return "disabled";

    const title = BandaidUtils.getPageTitle();

    if (!title || !BandaidUtils.isWeeklyNotePage(title)) {
      return "not-weekly";
    }

    // Check if button already exists
    const existingButton = document.getElementById(
      BANDAID_CONFIG.backlinkButtonId
    );
    if (existingButton) {
      return "already-exists";
    }

    // Check if any daily notes are missing hashtags
    console.log("🔍 Checking if any daily notes need hashtags...");
    const needsButton = await BacklinkBandaid.checkIfBacklinksNeeded(title);

    if (!needsButton) {
      console.log(
        "✅ All daily notes already have hashtags - button not needed"
      );
      return "not-needed";
    }

    console.log("➕ Some daily notes missing hashtags - showing button");

    // Find where to place button
    const header = document.querySelector(
      ".roam-article h1.rm-title-display, .rm-title-display"
    );
    if (!header) return "no-header";

    const headerContainer = header.parentElement;
    if (!headerContainer) return "no-container";

    // Create button
    const button = document.createElement("button");
    button.id = BANDAID_CONFIG.backlinkButtonId;
    button.textContent = "🔗 Auto-backlink to Daily Notes?";
    button.title = "Create bidirectional links to all daily notes in this week";

    // Click handler
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "🔄 Processing...";

      try {
        const success = await BacklinkBandaid.processWeeklyBacklinks(title);

        if (success) {
          button.textContent = "✅ Complete!";
          button.style.background = "#f0fdf4";
          button.style.borderColor = "#16a34a";
          button.style.color = "#14532d";

          // Return to weekly view after brief delay
          setTimeout(() => {
            BandaidUtils.navigateToPage(title);
          }, 1500);
        } else {
          button.textContent = "❌ Error - Check Console";
          button.style.background = "#fef2f2";
          button.style.borderColor = "#dc2626";
          button.style.color = "#991b1b";
        }
      } catch (e) {
        console.error("Backlink process error:", e);
        button.textContent = "❌ Error - Check Console";
        button.style.background = "#fef2f2";
        button.style.borderColor = "#dc2626";
        button.style.color = "#991b1b";
      }

      // Reset button after delay
      setTimeout(() => {
        button.remove();
      }, 3000);
    });

    // Insert after header
    headerContainer.insertBefore(button, header.nextSibling);

    console.log("🔗 Auto-backlink button created");
    return "created";
  },
};

// ===================================================================
// 🎨 HASHTAG ENHANCER MODULE
// ===================================================================

const HashtagEnhancer = {
  transformDateRange: (dateText) => {
    const match = dateText.match(BANDAID_CONFIG.weeklyTitlePattern);
    if (!match) return null;

    const [, startMonth, startDay, startYear, endMonth, endDay, endYear] =
      match;

    try {
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

      const startDayName = BandaidUtils.dayNames[startDate.getDay()];
      const endDayName = BandaidUtils.dayNames[endDate.getDay()];
      const startMonthName = BandaidUtils.shortMonthNames[startDate.getMonth()];
      const endMonthName = BandaidUtils.shortMonthNames[endDate.getMonth()];

      // Different formats based on same month or different months
      if (startMonth === endMonth && startYear === endYear) {
        return `${startDayName} ${startMonthName} ${startDay} - ${endDayName} ${endDay}`;
      } else {
        return `${startDayName} ${startMonthName} ${startDay} - ${endDayName} ${endMonthName} ${endDay}`;
      }
    } catch (e) {
      console.error("Date transformation error:", e);
      return null;
    }
  },

  isCurrentWeek: (dateText) => {
    const match = dateText.match(BANDAID_CONFIG.weeklyTitlePattern);
    if (!match) return false;

    const [, startMonth, startDay, startYear] = match;
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const today = new Date();
    const todayTime = today.getTime();
    const startTime = startDate.getTime();
    const endTime = startTime + 6 * 24 * 60 * 60 * 1000; // 6 days later

    return todayTime >= startTime && todayTime <= endTime;
  },

  enhanceHashtag: (element) => {
    if (!BANDAID_CONFIG.hashtagEnhancerEnabled) return;

    // Skip if already enhanced
    if (element.classList.contains(BANDAID_CONFIG.hashtagClassName)) return;

    // Get the hashtag text
    let text = element.textContent || element.innerText || "";

    // Check if it matches weekly pattern
    if (!BANDAID_CONFIG.weeklyPagePattern.test(text)) return;

    console.log(`🎨 Enhancing hashtag: ${text}`);

    // Transform the display text
    const readableText = HashtagEnhancer.transformDateRange(text);
    if (!readableText) return;

    // Style the original element and change its text
    element.classList.add(BANDAID_CONFIG.hashtagClassName);
    element.textContent = `📅 ${readableText}`;
    element.title = `Weekly Note: ${text.replace("#[[", "").replace("]]", "")}`;

    // Add current week styling
    if (HashtagEnhancer.isCurrentWeek(text)) {
      element.classList.add("current-week");
      element.title += " (Current Week)";
    }

    console.log(`✅ Enhanced to: ${readableText}`);
  },

  enhanceAllHashtags: () => {
    if (!BANDAID_CONFIG.hashtagEnhancerEnabled) return;

    // Multiple selectors to catch different hashtag formats
    const selectors = [
      '.rm-page-ref[data-tag*=" - "][data-tag*="/"][data-tag*="2025"]',
      'a[href*=" - "][href*="/"][href*="2025"]',
      ".rm-page-ref:not(.weekly-hashtag-pill)",
      "a:not(.weekly-hashtag-pill)",
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const text = element.textContent || element.innerText || "";
        if (BANDAID_CONFIG.weeklyPagePattern.test(text)) {
          HashtagEnhancer.enhanceHashtag(element);
        }
      });
    });
  },
};

// ===================================================================
// 🎯 UNIFIED CONTROLLER
// ===================================================================

const BandaidController = {
  initialize: () => {
    console.log("🩹 Unified Weekly View Bandaid Extension Initialized!");

    // Inject CSS
    injectCSS();

    // Start monitoring
    BandaidController.startMonitoring();

    // Set up event listeners
    window.addEventListener("hashchange", () => {
      BANDAID_STATE.retryCount = 1; // Trigger immediate check
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        BANDAID_STATE.retryCount = 1; // Trigger check when tab becomes visible
      }
    });

    // Set up mutation observer for hashtag enhancement
    const observer = new MutationObserver((mutations) => {
      let shouldEnhance = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const hasHashtags =
                node.textContent &&
                BANDAID_CONFIG.weeklyPagePattern.test(node.textContent);
              if (hasHashtags) shouldEnhance = true;
            }
          });
        }
      });

      if (shouldEnhance) {
        setTimeout(HashtagEnhancer.enhanceAllHashtags, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  startMonitoring: () => {
    if (BANDAID_STATE.isMonitoring) return;

    BANDAID_STATE.isMonitoring = true;
    console.log("👀 Starting unified monitoring...");

    const monitor = async () => {
      const newUrl = window.location.href;
      const newTitle = BandaidUtils.getPageTitle();

      // Check if URL or title changed, or we're retrying
      if (
        newUrl !== BANDAID_STATE.currentUrl ||
        newTitle !== BANDAID_STATE.lastPageTitle ||
        BANDAID_STATE.retryCount > 0
      ) {
        BANDAID_STATE.currentUrl = newUrl;
        BANDAID_STATE.lastPageTitle = newTitle;

        // Always enhance hashtags first
        HashtagEnhancer.enhanceAllHashtags();

        // Only check navigation and backlink if we're on a weekly page
        if (BandaidUtils.isWeeklyNotePage(newTitle)) {
          // Check navigation buttons
          const navResult = NavigationBandaid.checkAndCreateButtons();

          // Check backlink button (but not too frequently)
          if (BANDAID_STATE.retryCount <= 1) {
            await BacklinkBandaid.createBacklinkButton();
          }

          // Determine if we should retry
          const shouldRetry = ![
            "created",
            "bandaid-exists",
            "original-exists",
            "not-weekly",
          ].includes(navResult);

          if (
            shouldRetry &&
            BANDAID_STATE.retryCount < BANDAID_CONFIG.maxRetries
          ) {
            BANDAID_STATE.retryCount++;
            setTimeout(monitor, BANDAID_CONFIG.quickCheckInterval);
          } else {
            BANDAID_STATE.retryCount = 0;
            setTimeout(monitor, BANDAID_CONFIG.monitorInterval);
          }
        } else {
          // Not a weekly page, just do regular monitoring
          BANDAID_STATE.retryCount = 0;
          setTimeout(monitor, BANDAID_CONFIG.monitorInterval);
        }
      } else {
        // Nothing changed, continue monitoring
        setTimeout(monitor, BANDAID_CONFIG.monitorInterval);
      }
    };

    monitor();
  },

  cleanup: () => {
    console.log("🧹 Cleaning up Weekly View Bandaid Extension...");

    // Remove CSS
    const style = document.getElementById("bandaid-weekly-styles");
    if (style) style.remove();

    // Remove buttons
    const navButtons = document.getElementById(
      BANDAID_CONFIG.navigationButtonId
    );
    if (navButtons) navButtons.remove();

    const backlinkButton = document.getElementById(
      BANDAID_CONFIG.backlinkButtonId
    );
    if (backlinkButton) backlinkButton.remove();

    // Reset state
    BANDAID_STATE.isMonitoring = false;
    BANDAID_STATE.cssInjected = false;

    console.log("✅ Cleanup complete");
  },
};

// ===================================================================
// 🚀 INITIALIZATION
// ===================================================================

// Wait for DOM to be ready and initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", BandaidController.initialize);
} else {
  BandaidController.initialize();
}

// Export for external access if needed
window.WeeklyViewBandaid = {
  config: BANDAID_CONFIG,
  state: BANDAID_STATE,
  utils: BandaidUtils,
  navigation: NavigationBandaid,
  backlink: BacklinkBandaid,
  hashtag: HashtagEnhancer,
  controller: BandaidController,
};

console.log("🩹 Unified Weekly View Bandaid Extension Loaded Successfully!");
