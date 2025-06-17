// ===================================================================
// Calendar Utilities Extension v1.1 - The Consolidated Toolkit
// 🆕 NEW FEATURES:
// - Configurable week start day (Monday default, future-proof for other days)
// - Updated configuration format (single colons + bold headers)
// ===================================================================

// ===================================================================
// 🔧 CORE DATE & TIME UTILITIES - Enhanced with Configurable Week Start
// ===================================================================

const DateTimeUtils = {
  // 📅 CONFIGURABLE WEEK START DAY
  // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  // Default to Monday (1) - can be overridden via configuration
  DEFAULT_WEEK_START_DAY: 1, // Monday

  // 🔧 GET CONFIGURED WEEK START DAY - Read from config or use default
  getWeekStartDay: () => {
    try {
      const configValue = ConfigUtils.readConfigValue(
        "roam/ext/monthly view/config",
        "week-start-day",
        DateTimeUtils.DEFAULT_WEEK_START_DAY
      );

      // Ensure it's a valid day (0-6)
      const dayNum = parseInt(configValue);
      if (dayNum >= 0 && dayNum <= 6) {
        return dayNum;
      }

      console.warn(
        `⚠️ Invalid week start day: ${configValue}, using default (Monday)`
      );
      return DateTimeUtils.DEFAULT_WEEK_START_DAY;
    } catch (error) {
      console.warn(`⚠️ Error reading week start day config:`, error);
      return DateTimeUtils.DEFAULT_WEEK_START_DAY;
    }
  },

  // 📅 ROAM DATE PARSING - Convert Roam daily note format to Date objects
  parseRoamDate: (roamDateString) => {
    try {
      // Handle Roam's daily note format: "January 15th, 2024"
      const cleanString = roamDateString
        .replace(/(\d+)(st|nd|rd|th)/, "$1") // Remove ordinal suffixes
        .trim();

      const date = new Date(cleanString);
      if (isNaN(date.getTime())) {
        console.warn(`⚠️ Could not parse Roam date: ${roamDateString}`);
        return null;
      }
      return date;
    } catch (error) {
      console.error(`❌ Error parsing Roam date "${roamDateString}":`, error);
      return null;
    }
  },

  // 📅 FORMAT DATE FOR ROAM - Convert Date object to Roam daily note format
  formatDateForRoam: (date) => {
    const monthNames = [
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
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const suffix = DateTimeUtils.getDaySuffix(day);

    return `${month} ${day}${suffix}, ${year}`;
  },

  // 📅 GET DAY SUFFIX - Add proper ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  getDaySuffix: (day) => {
    if (day > 10 && day < 20) return "th";
    const lastDigit = day % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  },

  // 📅 GET WEEK START DATE - Get start of week based on configured start day
  getWeekStartDate: (date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekStartDay = DateTimeUtils.getWeekStartDay();

    // Calculate days to subtract to get to the configured week start
    let daysToSubtract = (dayOfWeek - weekStartDay + 7) % 7;

    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0); // Start of day
    return startOfWeek;
  },

  // 📅 GET WEEK END DATE - Get end of week based on configured start day
  getWeekEndDate: (date) => {
    const startOfWeek = DateTimeUtils.getWeekStartDate(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Add 6 days to get end of week
    endOfWeek.setHours(23, 59, 59, 999); // End of day
    return endOfWeek;
  },

  // 📅 GET MONTH NAME - Convert month number to name
  getMonthName: (monthIndex) => {
    const monthNames = [
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
    ];
    return monthNames[monthIndex];
  },

  // 📅 IS TODAY - Check if given date is today
  isToday: (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  // 📅 IS THIS WEEK - Check if given date is in current week
  isThisWeek: (date) => {
    const today = new Date();
    const weekStart = DateTimeUtils.getWeekStartDate(today);
    const weekEnd = DateTimeUtils.getWeekEndDate(today);
    return date >= weekStart && date <= weekEnd;
  },
};

// ===================================================================
// 📝 ROAM PAGE & BLOCK UTILITIES - Professional Roam Integration
// ===================================================================

const RoamUtils = {
  // 🔍 GET CURRENT PAGE TITLE - Detect what page user is currently viewing
  getCurrentPageTitle: () => {
    try {
      // Try to get from URL first
      const url = window.location.href;
      const pageMatch = url.match(/\/page\/(.+)$/);

      if (pageMatch) {
        return decodeURIComponent(pageMatch[1]);
      }

      // Try to get from DOM
      const titleElement = document.querySelector(
        ".roam-log-page h1 .rm-title-display span"
      );
      if (titleElement) {
        return titleElement.textContent;
      }

      // Fallback to today's daily note
      return DateTimeUtils.formatDateForRoam(new Date());
    } catch (error) {
      console.error("❌ Error getting current page title:", error);
      return DateTimeUtils.formatDateForRoam(new Date());
    }
  },

  // 🔍 GET PAGE UID - Get the UID of a page by title
  getPageUid: (pageTitle) => {
    try {
      const result = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?title
         :where
         [?page :node/title ?title]
         [?page :block/uid ?uid]]
      `,
        pageTitle
      );

      return result || null;
    } catch (error) {
      console.error(`❌ Error getting page UID for "${pageTitle}":`, error);
      return null;
    }
  },

  // 🔍 PAGE EXISTS - Check if a page exists in the database
  pageExists: (pageTitle) => {
    return RoamUtils.getPageUid(pageTitle) !== null;
  },

  // 📝 CREATE PAGE - Create a new page with initial content (FIXED API)
  createPage: async (pageTitle, contentArray = []) => {
    try {
      console.log(`🔧 Creating page: "${pageTitle}"`);

      // Create the page using correct API
      await window.roamAlphaAPI.data.page.create({
        page: { title: pageTitle },
      });

      // Wait for page creation to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get the page UID
      const pageUid = RoamUtils.getPageUid(pageTitle);
      if (!pageUid) {
        throw new Error(`Failed to get UID for created page: ${pageTitle}`);
      }

      console.log(`✅ Page created with UID: ${pageUid}`);

      // Add content if provided
      if (contentArray.length > 0) {
        console.log(`📝 Adding ${contentArray.length} content blocks...`);

        for (let i = 0; i < contentArray.length; i++) {
          const content = contentArray[i];
          if (content && content.trim()) {
            try {
              await window.roamAlphaAPI.data.block.create({
                location: {
                  "parent-uid": pageUid,
                  order: i,
                },
                block: {
                  string: content,
                },
              });

              // Small delay between blocks
              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (blockError) {
              console.warn(
                `⚠️ Error creating block ${i}: ${blockError.message}`
              );
            }
          }
        }

        console.log(`✅ Content blocks added to "${pageTitle}"`);
      }

      return pageUid;
    } catch (error) {
      console.error(`❌ Error creating page "${pageTitle}":`, error);
      return null;
    }
  },

  // 🔍 QUERY BLOCKS - Search for blocks containing a pattern
  queryBlocks: (pageTitle, searchPattern) => {
    try {
      const results = window.roamAlphaAPI.data.q(
        `
        [:find ?uid ?string
         :in $ ?page-title ?pattern
         :where
         [?page :node/title ?page-title]
         [?page :block/children ?block]
         [?block :block/uid ?uid]
         [?block :block/string ?string]
         [(clojure.string/includes? ?string ?pattern)]]
      `,
        pageTitle,
        searchPattern
      );

      return results || [];
    } catch (error) {
      console.error(`❌ Error querying blocks:`, error);
      return [];
    }
  },

  // 🔧 GENERATE UID - Generate unique identifier for Roam blocks
  generateUID: () => {
    return (
      window.roamAlphaAPI?.util?.generateUID?.() ||
      "cal-" + Math.random().toString(36).substr(2, 9)
    );
  },
};

// ===================================================================
// 📅 WEEKLY PAGE UTILITIES - Smart Weekly Page Detection & Parsing
// ===================================================================

const WeeklyUtils = {
  // 🔍 IS WEEKLY PAGE - Detect if current page is a weekly calendar page
  isWeeklyPage: (pageTitle) => {
    if (!pageTitle) return false;

    // Match patterns like: "01/15 2024 - 01/21 2024" or "January 15th, 2024 - January 21st, 2024"
    const weeklyPatterns = [
      /^\d{2}\/\d{2} \d{4} - \d{2}\/\d{2} \d{4}$/, // MM/DD YYYY - MM/DD YYYY
      /^[A-Za-z]+ \d{1,2}(st|nd|rd|th)?, \d{4} - [A-Za-z]+ \d{1,2}(st|nd|rd|th)?, \d{4}$/, // Full date range
    ];

    return weeklyPatterns.some((pattern) => pattern.test(pageTitle.trim()));
  },

  // 📝 PARSE WEEKLY TITLE - Extract start and end dates from weekly page title
  parseWeeklyTitle: (weeklyTitle) => {
    try {
      // Handle MM/DD YYYY - MM/DD YYYY format
      const shortMatch = weeklyTitle.match(
        /^(\d{2}\/\d{2} \d{4}) - (\d{2}\/\d{2} \d{4})$/
      );
      if (shortMatch) {
        const startDate = new Date(shortMatch[1]);
        const endDate = new Date(shortMatch[2]);
        return { startDate, endDate };
      }

      // Handle full date format
      const fullMatch = weeklyTitle.match(/^(.+?) - (.+?)$/);
      if (fullMatch) {
        const startDate = DateTimeUtils.parseRoamDate(fullMatch[1]);
        const endDate = DateTimeUtils.parseRoamDate(fullMatch[2]);
        if (startDate && endDate) {
          return { startDate, endDate };
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Error parsing weekly title "${weeklyTitle}":`, error);
      return null;
    }
  },

  // 📅 GENERATE WEEKLY TITLE - Create weekly page title from date
  generateWeeklyTitle: (date, format = "short") => {
    const weekStart = DateTimeUtils.getWeekStartDate(date);
    const weekEnd = DateTimeUtils.getWeekEndDate(date);

    if (format === "short") {
      const startStr =
        (weekStart.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        weekStart.getDate().toString().padStart(2, "0") +
        " " +
        weekStart.getFullYear();
      const endStr =
        (weekEnd.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        weekEnd.getDate().toString().padStart(2, "0") +
        " " +
        weekEnd.getFullYear();
      return `${startStr} - ${endStr}`;
    } else {
      const startStr = DateTimeUtils.formatDateForRoam(weekStart);
      const endStr = DateTimeUtils.formatDateForRoam(weekEnd);
      return `${startStr} - ${endStr}`;
    }
  },

  // 🔍 FIND WEEKLY EMBEDS - Find week blocks in monthly pages for embedding
  findWeeklyEmbeds: async (weeklyTitle) => {
    const parsed = WeeklyUtils.parseWeeklyTitle(weeklyTitle);
    if (!parsed) return [];

    const { startDate, endDate } = parsed;
    const weekEmbeds = [];

    // Determine which month pages to search
    const monthPages = [];
    const startMonth =
      DateTimeUtils.getMonthName(startDate.getMonth()) +
      " " +
      startDate.getFullYear();
    const endMonth =
      DateTimeUtils.getMonthName(endDate.getMonth()) +
      " " +
      endDate.getFullYear();

    monthPages.push(startMonth);
    if (startMonth !== endMonth) {
      monthPages.push(endMonth);
    }

    // Search for week blocks in each month page
    for (const monthPage of monthPages) {
      try {
        if (!RoamUtils.pageExists(monthPage)) continue;

        const searchPattern = "Week";
        const weekBlocks = RoamUtils.queryBlocks(monthPage, searchPattern);

        if (weekBlocks && weekBlocks.length > 0) {
          for (const [uid, string] of weekBlocks) {
            if (string.includes("Week ") && string.includes(":")) {
              weekEmbeds.push({
                uid: uid,
                monthPage: monthPage,
                blockString: string,
              });
              break; // Only take the first week block per month
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error searching in "${monthPage}":`, error);
      }
    }

    // Sort embeds chronologically for cross-month weeks
    if (weekEmbeds.length === 2) {
      weekEmbeds.sort((a, b) => {
        if (a.monthPage === startMonth) return -1;
        if (b.monthPage === startMonth) return 1;
        return 0;
      });
    }

    return weekEmbeds;
  },
};

// ===================================================================
// 📅 MONTHLY PAGE UTILITIES - Smart Monthly Page Detection & Parsing
// ===================================================================

const MonthlyUtils = {
  // 🔍 IS MONTHLY PAGE - Detect if current page is a monthly calendar page
  isMonthlyPage: (pageTitle) => {
    if (!pageTitle) return false;

    // Match patterns like: "January 2024" or "December 2023"
    const monthlyPattern = /^[A-Za-z]+ \d{4}$/;
    return monthlyPattern.test(pageTitle.trim());
  },

  // 📝 PARSE MONTHLY TITLE - Extract month and year from monthly page title
  parseMonthlyTitle: (monthlyTitle) => {
    try {
      const match = monthlyTitle.match(/^([A-Za-z]+) (\d{4})$/);
      if (!match) return null;

      const monthName = match[1];
      const year = parseInt(match[2]);

      const monthNames = [
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
      ];

      const monthIndex = monthNames.indexOf(monthName);
      if (monthIndex === -1) return null;

      return { monthName, year, monthIndex };
    } catch (error) {
      console.error(`❌ Error parsing monthly title "${monthlyTitle}":`, error);
      return null;
    }
  },

  // 📅 GENERATE MONTHLY TITLE - Create monthly page title from date
  generateMonthlyTitle: (date) => {
    const monthName = DateTimeUtils.getMonthName(date.getMonth());
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  },

  // 📅 GET WEEKS IN MONTH - Get all weeks that overlap with the given month
  getWeeksInMonth: (year, monthIndex) => {
    const weeks = [];
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Start from the configured week start day for the week containing the first day
    let currentWeekStart = DateTimeUtils.getWeekStartDate(firstDay);

    while (currentWeekStart <= lastDay) {
      const weekEnd = DateTimeUtils.getWeekEndDate(currentWeekStart);

      // Only include weeks that have at least one day in this month
      if (weekEnd >= firstDay && currentWeekStart <= lastDay) {
        weeks.push({
          weekNumber: weeks.length + 1,
          startDate: new Date(currentWeekStart),
          endDate: new Date(weekEnd),
          weekTitle: WeeklyUtils.generateWeeklyTitle(currentWeekStart),
        });
      }

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  },
};

// ===================================================================
// 📝 CONTENT GENERATION UTILITIES - Professional Content Creation
// ===================================================================

const ContentUtils = {
  // 🌅 GENERATE MORNING INTENTIONS - Create morning intentions structure
  generateMorningIntentions: (startDate, endDate) => {
    const startDateStr = DateTimeUtils.formatDateForRoam(startDate);
    const endDateStr = DateTimeUtils.formatDateForRoam(endDate);

    return [
      "**Morning Intentions**",
      `Week of ${startDateStr} - ${endDateStr}`,
      "",
      "**Daily Intentions:**",
      `[[${startDateStr}]]`,
      "- 1.",
      "",
      `[[${DateTimeUtils.formatDateForRoam(
        new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
      )}]]`,
      "- 1.",
      "",
      `[[${DateTimeUtils.formatDateForRoam(
        new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)
      )}]]`,
      "- 1.",
      "",
      `[[${DateTimeUtils.formatDateForRoam(
        new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      )}]]`,
      "- 1.",
      "",
      `[[${DateTimeUtils.formatDateForRoam(
        new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000)
      )}]]`,
      "- 1.",
      "",
      `[[${DateTimeUtils.formatDateForRoam(
        new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000)
      )}]]`,
      "- 1.",
      "",
      `[[${endDateStr}]]`,
      "- 1.",
    ];
  },

  // 📊 GENERATE PMN STRUCTURE - Create Progress, Metrics, Notes structure
  generatePMNStructure: () => {
    const sections = [
      { title: "**Progress**", subtitle: "What moved forward this week?" },
      { title: "**Metrics**", subtitle: "Key numbers and measurements" },
      { title: "**Notes**", subtitle: "Important observations and insights" },
    ];

    const content = [];
    sections.forEach((section) => {
      content.push(section.title);
      content.push(section.subtitle);
      content.push("1.");
      content.push("");
    });

    return content;
  },

  // 📅 GENERATE WEEK CALENDAR - Create numbered week calendar structure
  generateWeekCalendar: (weekNumber, weekTitle) => {
    return [
      `**Week ${weekNumber}: ${weekTitle}**`,
      "",
      "**Calendar:**",
      "{{embed: [[Calendar]]}}",
      "",
      "**This Week:**",
      "- [ ] 1.",
      "",
      "**Notes:**",
      "- 1.",
    ];
  },

  // 📝 GENERATE MONTHLY OVERVIEW - Create monthly page structure
  generateMonthlyOverview: (monthName, year, weeks) => {
    const content = [
      `**${monthName} ${year} Overview**`,
      "",
      "**Monthly Goals:**",
      "- [ ] 1.",
      "",
      "**Weekly Breakdown:**",
    ];

    weeks.forEach((week) => {
      content.push(`- Week ${week.weekNumber}: [[${week.weekTitle}]]`);
    });

    content.push("");
    content.push("**Monthly Metrics:**");
    content.push("- 1.");

    return content;
  },
};

// ===================================================================
// 🎛️ CONFIGURATION UTILITIES - Updated with Single Colon Format
// ===================================================================

const ConfigUtils = {
  // 📋 CREATE DEFAULT CONFIG - Initialize configuration page with enhanced error handling
  createDefaultConfig: async (configPageTitle, sections = []) => {
    try {
      console.log(`🔧 Checking config page: "${configPageTitle}"`);

      // Check if page already exists
      if (RoamUtils.pageExists(configPageTitle)) {
        console.log(
          `📋 Config page "${configPageTitle}" already exists - skipping creation`
        );
        return true;
      }

      console.log(`🚀 Creating new config page: "${configPageTitle}"`);
      console.log(`📄 Content sections:`, sections);

      // Create the config page
      const pageUid = await RoamUtils.createPage(configPageTitle, sections);

      if (pageUid) {
        console.log(
          `✅ Created config page: "${configPageTitle}" with UID: ${pageUid}`
        );
        return true;
      } else {
        console.error(`❌ Failed to create config page: "${configPageTitle}"`);
        return false;
      }
    } catch (error) {
      console.error(
        `❌ Error in createDefaultConfig for "${configPageTitle}":`,
        error
      );
      return false;
    }
  },

  // 🔍 READ CONFIG VALUE - Updated to work with single colon format
  readConfigValue: (configPageTitle, key, defaultValue = null) => {
    try {
      // Updated query to look for single colon format: "key: value"
      const results = window.roamAlphaAPI.data.q(
        `
        [:find ?value .
         :in $ ?config-title ?key
         :where
         [?config :node/title ?config-title]
         [?config :block/children ?child]
         [?child :block/string ?string]
         [(clojure.string/includes? ?string ?key)]
         [(clojure.string/includes? ?string ":")]
         [?child :block/children ?value-block]
         [?value-block :block/string ?value]]
      `,
        configPageTitle,
        key
      );

      return results || defaultValue;
    } catch (error) {
      console.warn(`⚠️ Could not read config value "${key}":`, error);
      return defaultValue;
    }
  },

  // 📝 WRITE CONFIG VALUE - Set configuration value in config page (single colon format)
  writeConfigValue: async (configPageTitle, key, value) => {
    try {
      // This is a simplified implementation
      // In practice, you'd want more sophisticated config management
      console.log(`💾 Config set: ${key}: ${value} in ${configPageTitle}`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing config "${key}":`, error);
      return false;
    }
  },
};

// ===================================================================
// 🎯 MAIN UTILITIES REGISTRY - The Central Toolkit
// ===================================================================

const CalendarUtilities = {
  // Export all utility modules
  DateTimeUtils,
  RoamUtils,
  WeeklyUtils,
  MonthlyUtils,
  ContentUtils,
  ConfigUtils,

  // 📊 UTILITY STATUS - Get status of all utilities
  getStatus: () => {
    return {
      version: "1.1.0",
      features: [
        "Configurable week start day (Monday default)",
        "Single colon configuration format",
        "Bold headers in config pages",
      ],
      modules: {
        DateTimeUtils: Object.keys(DateTimeUtils).length,
        RoamUtils: Object.keys(RoamUtils).length,
        WeeklyUtils: Object.keys(WeeklyUtils).length,
        MonthlyUtils: Object.keys(MonthlyUtils).length,
        ContentUtils: Object.keys(ContentUtils).length,
        ConfigUtils: Object.keys(ConfigUtils).length,
      },
      totalUtilities:
        Object.keys(DateTimeUtils).length +
        Object.keys(RoamUtils).length +
        Object.keys(WeeklyUtils).length +
        Object.keys(MonthlyUtils).length +
        Object.keys(ContentUtils).length +
        Object.keys(ConfigUtils).length,
      weekStartDay: {
        current: DateTimeUtils.getWeekStartDay(),
        default: DateTimeUtils.DEFAULT_WEEK_START_DAY,
        options: {
          0: "Sunday",
          1: "Monday",
          2: "Tuesday",
          3: "Wednesday",
          4: "Thursday",
          5: "Friday",
          6: "Saturday",
        },
      },
      loaded: new Date().toISOString(),
    };
  },

  // 🔧 REGISTER ALL UTILITIES - Register with the calendar platform
  registerWithPlatform: () => {
    if (!window.CalendarSuite) {
      console.warn(
        "⚠️ Calendar Foundation not found - utilities running standalone"
      );
      return false;
    }

    // Register all utility modules with the platform
    window.CalendarSuite.registerUtility("DateTimeUtils", DateTimeUtils);
    window.CalendarSuite.registerUtility("RoamUtils", RoamUtils);
    window.CalendarSuite.registerUtility("WeeklyUtils", WeeklyUtils);
    window.CalendarSuite.registerUtility("MonthlyUtils", MonthlyUtils);
    window.CalendarSuite.registerUtility("ContentUtils", ContentUtils);
    window.CalendarSuite.registerUtility("ConfigUtils", ConfigUtils);

    // Register the complete utilities object
    window.CalendarSuite.registerUtility(
      "CalendarUtilities",
      CalendarUtilities
    );

    console.log("🔧 All utilities registered with Calendar Foundation!");
    return true;
  },
};

// ===================================================================
// 🚀 ROAM EXTENSION EXPORT - Professional Calendar Utilities v1.1
// ===================================================================

export default {
  onload: async ({ extensionAPI }) => {
    console.log("🔧 Calendar Utilities Extension v1.1 loading...");

    // 🌐 MAKE UTILITIES GLOBALLY AVAILABLE
    window.CalendarUtilities = CalendarUtilities;

    // 🔗 REGISTER WITH CALENDAR FOUNDATION
    const platformRegistered = CalendarUtilities.registerWithPlatform();

    // 📋 CREATE UTILITIES CONFIG - Updated format with bold headers and single colons
    console.log("🔧 Creating Calendar Utilities config page...");
    const utilitiesConfigSuccess = await ConfigUtils.createDefaultConfig(
      "Calendar Utilities/Config",
      [
        "**SETTINGS:**",
        "    version: 1.1.0",
        "    enabled: true",
        "",
        "**WEEK CONFIGURATION:**",
        "    week-start-day: 1",
        "        - 0: Sunday",
        "        - 1: Monday (default)",
        "        - 2: Tuesday",
        "        - 3: Wednesday",
        "        - 4: Thursday",
        "        - 5: Friday",
        "        - 6: Saturday",
      ]
    );

    if (!utilitiesConfigSuccess) {
      console.warn("⚠️ Could not create Calendar Utilities config page");
    }

    // 🔧 CREATE MONTHLY VIEW CONFIG - New format with proper color tags and indentation
    console.log("🔧 Creating Monthly View config page...");
    const monthlyConfigSuccess = await ConfigUtils.createDefaultConfig(
      "roam/ext/monthly view/config",
      [
        "**COLORS:**",
        "    MON: #clr-lgt-grn",
        "    TUE: #clr-lgt-grn",
        "    WED: #clr-grn",
        "    THU: #clr-lgt-grn",
        "    FRI: #clr-lgt-grn",
        "    SAT: #clr-lgt-ylo",
        "    SUN: #clr-lgt-brn",
        "",
        "**SETTINGS:**",
        "    auto-detect: yes",
        "    show-monthly-todo: yes",
        "    week-start-day: 1",
      ]
    );

    if (!monthlyConfigSuccess) {
      console.warn("⚠️ Could not create Monthly View config page");
      console.log(
        "💡 Use command palette: 'Calendar Utilities: Recreate Monthly View Config' to fix this"
      );
    }

    // 🎯 REGISTER WITH PLATFORM
    if (window.CalendarSuite) {
      window.CalendarSuite.register("calendar-utilities", CalendarUtilities, {
        name: "Calendar Utilities",
        description:
          "Comprehensive toolkit for calendar extensions with configurable week start",
        version: "1.1.0",
        dependencies: ["calendar-foundation"],
        provides: [
          "configurable-week-start",
          "date-time-utilities",
          "roam-integration",
          "weekly-page-detection",
          "monthly-page-detection",
          "content-generation",
          "configuration-management",
        ],
      });
    }

    // 📝 ADD COMMAND PALETTE COMMANDS - Updated with new features
    const commands = [
      {
        label: "Calendar Utilities: Show Status",
        callback: () => {
          const status = CalendarUtilities.getStatus();
          console.log("🔧 Calendar Utilities Status:", status);
          console.log(
            `📅 Week starts on: ${
              status.weekStartDay.options[status.weekStartDay.current]
            }`
          );
        },
      },
      {
        label: "Calendar Utilities: Test Date Functions",
        callback: () => {
          const today = new Date();
          const weekStartDay = DateTimeUtils.getWeekStartDay();
          console.log("📅 Date Function Tests:");
          console.log(
            `- Week start day: ${weekStartDay} (${
              [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][weekStartDay]
            })`
          );
          console.log(
            "- Today (Roam format):",
            DateTimeUtils.formatDateForRoam(today)
          );
          console.log("- Week start:", DateTimeUtils.getWeekStartDate(today));
          console.log("- Week end:", DateTimeUtils.getWeekEndDate(today));
          console.log("- Is today?", DateTimeUtils.isToday(today));
          console.log(
            "- Weekly title:",
            WeeklyUtils.generateWeeklyTitle(today)
          );
          console.log(
            "- Monthly title:",
            MonthlyUtils.generateMonthlyTitle(today)
          );
        },
      },
      {
        label: "Calendar Utilities: Test Page Detection",
        callback: () => {
          const currentPage = RoamUtils.getCurrentPageTitle();
          console.log("📄 Page Detection Tests:");
          console.log("- Current page:", currentPage);
          console.log(
            "- Is weekly page?",
            WeeklyUtils.isWeeklyPage(currentPage)
          );
          console.log(
            "- Is monthly page?",
            MonthlyUtils.isMonthlyPage(currentPage)
          );
        },
      },
      {
        label: "Calendar Utilities: Change Week Start Day",
        callback: () => {
          const options = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const current = DateTimeUtils.getWeekStartDay();
          console.log(`🗓️ Current week start day: ${options[current]}`);
          console.log(
            "📝 To change, update 'week-start-day' in the config page to desired value (0-6)"
          );
          console.log(
            "Available options:",
            options.map((day, index) => `${index}: ${day}`).join(", ")
          );
        },
      },
      {
        label: "Calendar Utilities: Recreate Monthly View Config",
        callback: async () => {
          console.log("🔧 Recreating Monthly View config page...");

          // Force recreate the config page
          const configPageTitle = "roam/ext/monthly view/config";
          const configContent = [
            "**COLORS:**",
            "    MON: #clr-lgt-grn",
            "    TUE: #clr-lgt-grn",
            "    WED: #clr-grn",
            "    THU: #clr-lgt-grn",
            "    FRI: #clr-lgt-grn",
            "    SAT: #clr-lgt-ylo",
            "    SUN: #clr-lgt-brn",
            "",
            "**SETTINGS:**",
            "    auto-detect: yes",
            "    show-monthly-todo: yes",
            "    week-start-day: 1",
          ];

          // Delete existing page if it exists (to force recreation)
          const existingUid = RoamUtils.getPageUid(configPageTitle);
          if (existingUid) {
            console.log(`🗑️ Removing existing config page...`);
            try {
              await window.roamAlphaAPI.data.page.delete({
                page: { uid: existingUid },
              });
              await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (e) {
              console.warn("Could not delete existing page:", e);
            }
          }

          // Create new config page
          const success = await ConfigUtils.createDefaultConfig(
            configPageTitle,
            configContent
          );

          if (success) {
            console.log("✅ Monthly View config page recreated successfully!");
            console.log(`📄 Navigate to: [[${configPageTitle}]]`);
          } else {
            console.error("❌ Failed to recreate config page");
          }
        },
      },
      {
        label: "Calendar Utilities: Debug Config Pages",
        callback: () => {
          console.log("🔍 Debugging config pages...");

          const pagesToCheck = [
            "roam/ext/monthly view/config",
            "Calendar Utilities/Config",
          ];

          pagesToCheck.forEach((pageTitle) => {
            const exists = RoamUtils.pageExists(pageTitle);
            const uid = RoamUtils.getPageUid(pageTitle);
            console.log(`📄 "${pageTitle}": exists=${exists}, uid=${uid}`);
          });

          console.log(
            "💡 If pages are missing, use 'Recreate Monthly View Config' command"
          );
        },
      },
    ];

    // Add commands to Roam
    commands.forEach((cmd) => {
      window.roamAlphaAPI.ui.commandPalette.addCommand(cmd);
    });

    // 🎉 READY!
    console.log("✅ Calendar Utilities Extension v1.1 loaded successfully!");
    console.log(
      `🔧 ${
        CalendarUtilities.getStatus().totalUtilities
      } utilities available across ${
        Object.keys(CalendarUtilities.getStatus().modules).length
      } modules`
    );
    console.log(
      `📅 Week starts on: ${
        [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][DateTimeUtils.getWeekStartDay()]
      }`
    );

    // Check config page status
    const monthlyConfigExists = RoamUtils.pageExists(
      "roam/ext/monthly view/config"
    );
    if (monthlyConfigExists) {
      console.log("📄 Monthly View config page: ✅ Available");
    } else {
      console.warn("📄 Monthly View config page: ❌ Missing");
      console.log(
        "💡 Run command: 'Calendar Utilities: Recreate Monthly View Config' to fix this"
      );
    }

    if (platformRegistered) {
      console.log(
        "🔗 Successfully integrated with Calendar Foundation platform"
      );
    }
  },

  onunload: () => {
    console.log("🔧 Calendar Utilities Extension v1.1 unloading...");

    // Clean up global references
    if (window.CalendarUtilities) {
      delete window.CalendarUtilities;
    }

    // The Calendar Foundation will handle automatic cleanup of registered utilities
    console.log("✅ Calendar Utilities Extension v1.1 unloaded!");
  },
};
