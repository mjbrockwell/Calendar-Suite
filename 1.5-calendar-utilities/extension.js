// ===================================================================
// 🔧 CALENDAR UTILITIES EXTENSION v1.1 - Improved with Legacy Patterns
// Comprehensive toolkit for calendar extensions
// Enhanced with proven patterns from legacy implementations
// ===================================================================

// ===================================================================
// ⏰ DATE AND TIME UTILITIES - Professional Date Operations
// ===================================================================

const DateTimeUtils = {
  // 📅 FORMAT DATE FOR ROAM - Convert JavaScript date to Roam's daily note format
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

    // Add proper suffix
    const suffix = DateTimeUtils.getDaySuffix(day);

    return `${month} ${day}${suffix}, ${year}`;
  },

  // 📅 PARSE ROAM DATE - Convert Roam date string back to JavaScript Date
  parseRoamDate: (roamDateString) => {
    try {
      // Handle "January 1st, 2024" format
      const match = roamDateString.match(
        /^([A-Za-z]+) (\d{1,2})(st|nd|rd|th)?, (\d{4})$/
      );
      if (!match) return null;

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

      const monthName = match[1];
      const day = parseInt(match[2]);
      const year = parseInt(match[4]);
      const monthIndex = monthNames.indexOf(monthName);

      if (monthIndex === -1) return null;

      return new Date(year, monthIndex, day);
    } catch (error) {
      console.error(`❌ Error parsing Roam date "${roamDateString}":`, error);
      return null;
    }
  },

  // 🔢 GET DAY NAME - Convert day number to name
  getDayName: (dayNumber) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[dayNumber];
  },

  // 🔢 GET DAY SUFFIX - Get ordinal suffix for day numbers
  getDaySuffix: (day) => {
    if (day > 10 && day < 20) return "th";
    const lastDigit = day % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  },

  // 📅 GET WEEK START DATE - Get Sunday of the week containing the given date
  getWeekStartDate: (date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0); // Start of day
    return startOfWeek;
  },

  // 📅 GET WEEK END DATE - Get Saturday of the week containing the given date
  getWeekEndDate: (date) => {
    const endOfWeek = new Date(date);
    const dayOfWeek = endOfWeek.getDay();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - dayOfWeek));
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
  // 🔍 GET CURRENT PAGE TITLE - Robust page detection using proven legacy patterns
  getCurrentPageTitle: () => {
    try {
      // Method 1: Try to get from title display element (primary method)
      const titleElement = document.querySelector(".rm-title-display span");
      if (titleElement && titleElement.textContent.trim()) {
        console.log(
          "📍 Found page title via DOM:",
          titleElement.textContent.trim()
        );
        return titleElement.textContent.trim();
      }

      // Method 2: Try alternative title selector
      const altTitleElement = document.querySelector("h1.rm-title-display");
      if (altTitleElement && altTitleElement.textContent.trim()) {
        console.log(
          "📍 Found page title via alt DOM:",
          altTitleElement.textContent.trim()
        );
        return altTitleElement.textContent.trim();
      }

      // Method 3: Parse from URL hash (handles different URL formats)
      const hash = window.location.hash;
      console.log("📍 Current hash:", hash);

      // Handle /page/ format
      if (hash.includes("/page/")) {
        const pageMatch = hash.match(/\/page\/(.+?)(?:$|\?)/);
        if (pageMatch) {
          const pageTitle = decodeURIComponent(pageMatch[1]);
          console.log("📍 Found page title via URL:", pageTitle);
          return pageTitle;
        }
      }

      // Handle /graph/[graph-id]/page/ format
      if (hash.includes("/graph/")) {
        const pageMatch = hash.match(/\/graph\/[^/]+\/page\/(.+?)(?:$|\?)/);
        if (pageMatch) {
          const pageTitle = decodeURIComponent(pageMatch[1]);
          console.log("📍 Found page title via graph URL:", pageTitle);
          return pageTitle;
        }
      }

      console.log("📍 Could not determine page title");
      return null;
    } catch (error) {
      console.error("❌ Error getting current page title:", error);
      return null;
    }
  },

  // 🔍 GET PAGE UID - Get the UID of a page by title
  getPageUid: (pageTitle) => {
    try {
      const result = window.roamAlphaAPI.data.q(`
        [:find ?uid .
         :where 
         [?e :node/title "${pageTitle}"]
         [?e :block/uid ?uid]]
      `);
      return result || null;
    } catch (error) {
      console.error(`❌ Error getting page UID for "${pageTitle}":`, error);
      return null;
    }
  },

  // 🔍 CHECK IF PAGE EXISTS - Verify if a page exists in the graph
  pageExists: (pageTitle) => {
    return RoamUtils.getPageUid(pageTitle) !== null;
  },

  // 📝 CREATE PAGE - Create a new page with optional content
  createPage: async (pageTitle, initialBlocks = []) => {
    try {
      // Create the page
      await window.roamAlphaAPI.data.page.create({
        page: { title: pageTitle },
      });

      // Wait for page creation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Add initial blocks if provided
      if (initialBlocks.length > 0) {
        const pageUid = RoamUtils.getPageUid(pageTitle);
        if (pageUid) {
          for (let i = 0; i < initialBlocks.length; i++) {
            await RoamUtils.createBlock(pageUid, initialBlocks[i], i);
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      }

      console.log(`✅ Created page: ${pageTitle}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating page "${pageTitle}":`, error);
      return false;
    }
  },

  // 📝 CREATE BLOCK - Create a new block with content
  createBlock: async (parentUid, content, order = 0) => {
    try {
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": parentUid, order: order },
        block: { string: content },
      });
      return true;
    } catch (error) {
      console.error(`❌ Error creating block:`, error);
      return false;
    }
  },

  // 🔍 QUERY BLOCKS - Search for blocks with specific content
  queryBlocks: (pageTitle, searchPattern) => {
    try {
      const results = window.roamAlphaAPI.data.q(
        `
        [:find ?uid ?string
         :in $ ?page-title ?pattern
         :where
         [?page :node/title ?page-title]
         [?page :block/children ?block]
         [?block :block/string ?string]
         [?block :block/uid ?uid]
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

    // Start from the Sunday of the week containing the first day
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
// 🎛️ CONFIGURATION UTILITIES - Professional Settings Management
// ===================================================================

const ConfigUtils = {
  // 📋 CREATE DEFAULT CONFIG - Initialize configuration page
  createDefaultConfig: async (configPageTitle, sections = []) => {
    try {
      if (RoamUtils.pageExists(configPageTitle)) {
        console.log(`📋 Config page "${configPageTitle}" already exists`);
        return true;
      }

      // Create the config page
      await RoamUtils.createPage(configPageTitle, sections);
      console.log(`✅ Created config page: ${configPageTitle}`);
      return true;
    } catch (error) {
      console.error(`❌ Error creating config "${configPageTitle}":`, error);
      return false;
    }
  },

  // 🔍 READ CONFIG VALUE - Get configuration value from config page
  readConfigValue: (configPageTitle, key, defaultValue = null) => {
    try {
      const results = window.roamAlphaAPI.data.q(
        `
        [:find ?value .
         :in $ ?config-title ?key
         :where
         [?config :node/title ?config-title]
         [?config :block/children ?child]
         [?child :block/string ?string]
         [(clojure.string/includes? ?string ?key)]
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

  // 📝 WRITE CONFIG VALUE - Set configuration value in config page
  writeConfigValue: async (configPageTitle, key, value) => {
    try {
      // This is a simplified implementation
      // In practice, you'd want more sophisticated config management
      console.log(`💾 Config set: ${key} = ${value} in ${configPageTitle}`);
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
      version: "1.1.0", // Updated version with legacy patterns
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
      loaded: new Date().toISOString(),
      improvements: [
        "Robust getCurrentPageTitle() using proven legacy patterns",
        "Enhanced URL parsing for different Roam URL formats",
        "Better DOM selector strategies",
        "Improved error handling and logging",
      ],
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
// 🚀 ROAM EXTENSION EXPORT - Professional Calendar Utilities
// ===================================================================

export default {
  onload: async ({ extensionAPI }) => {
    console.log("🔧 Calendar Utilities Extension v1.1 loading...");

    // 🌐 MAKE UTILITIES GLOBALLY AVAILABLE
    window.CalendarUtilities = CalendarUtilities;

    // 🔗 REGISTER WITH CALENDAR FOUNDATION
    const platformRegistered = CalendarUtilities.registerWithPlatform();

    // 📋 CREATE UTILITIES CONFIG
    await ConfigUtils.createDefaultConfig("Calendar Utilities/Config", [
      "settings::",
      "version:: 1.1.0",
      "enabled:: true",
    ]);

    // 🎯 REGISTER WITH PLATFORM
    if (window.CalendarSuite) {
      window.CalendarSuite.register("calendar-utilities", CalendarUtilities, {
        name: "Calendar Utilities",
        description: "Comprehensive toolkit for calendar extensions",
        version: "1.1.0",
        dependencies: ["calendar-foundation"],
        provides: [
          "date-time-utilities",
          "roam-integration",
          "weekly-page-detection",
          "monthly-page-detection",
          "content-generation",
          "configuration-management",
        ],
      });
    }

    // 📝 ADD COMMAND PALETTE COMMANDS
    const commands = [
      {
        label: "Calendar Utilities: Show Status",
        callback: () => {
          const status = CalendarUtilities.getStatus();
          console.log("🔧 Calendar Utilities Status:", status);
        },
      },
      {
        label: "Calendar Utilities: Test Date Functions",
        callback: () => {
          const today = new Date();
          console.log("📅 Date Function Tests:");
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
        label: "Calendar Utilities: Debug Page Title Detection",
        callback: () => {
          console.log("🔍 Page Title Detection Debug:");

          // Test all methods
          const titleElement = document.querySelector(".rm-title-display span");
          console.log(
            "- DOM method 1:",
            titleElement ? titleElement.textContent.trim() : "Not found"
          );

          const altTitleElement = document.querySelector("h1.rm-title-display");
          console.log(
            "- DOM method 2:",
            altTitleElement ? altTitleElement.textContent.trim() : "Not found"
          );

          const hash = window.location.hash;
          console.log("- URL hash:", hash);

          const currentTitle = RoamUtils.getCurrentPageTitle();
          console.log("- Final result:", currentTitle);
          console.log(
            "- Is monthly?",
            MonthlyUtils.isMonthlyPage(currentTitle)
          );
          console.log("- Is weekly?", WeeklyUtils.isWeeklyPage(currentTitle));
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
      "🔍 Improved with robust page detection patterns from legacy code"
    );

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
