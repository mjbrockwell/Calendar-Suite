// ===================================================================
// 📅 WEEKLY VIEW EXTENSION v5.0 - BUTTON MANAGER INTEGRATION
// ===================================================================
// 🚀 MAJOR REWRITE: Integrated with Simple Button Manager v3.2+
// ✅ Centralized button management • ✅ Automatic page detection
// 🎨 Calendar Suite styling • 🧹 Simplified architecture
// 🔥 BREAKING CHANGE: Removed multi-step button workflow (simplified)

// Wrap everything in an IIFE to avoid global variable conflicts
(function () {
  "use strict";

  // ===================================================================
  // 🎯 EXTENSION CONFIGURATION
  // ===================================================================

  const EXTENSION_CONFIG = {
    id: "weekly-view",
    version: "5.0.0",
    name: "Weekly View",
    description:
      "Creates weekly calendar views with monthly calendar embeds (Button Manager Integration)",

    // 🔧 DEPENDENCIES - Required for operation
    dependencies: [
      "simple-button-manager",
      "calendar-foundation",
      "calendar-utilities",
      "unified-config-utils",
    ],

    // 📋 CONFIG DEFAULTS - Managed by unified config system
    configDefaults: {
      "automatic guidance enabled": "yes",
      "add week count within the year": "yes",
      "include query for `[[Morning Intentions]]`": "yes",
      "add query for `[[Evening Reflections]]`": "yes",
      "add Plus-Minus-Next journal": "yes",
    },
  };

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

  // ===================================================================
  // 🏗️ EXTENSION STATE
  // ===================================================================

  let extensionState = {
    initialized: false,
    buttonManager: null,
    config: null,
    dependencies: null,
  };

  // ===================================================================
  // 📋 CONFIG MANAGEMENT
  // ===================================================================

  function getExtensionConfig() {
    try {
      if (!extensionState.config && window.UnifiedConfigUtils) {
        const config = {
          settings: {},
        };

        // Read all config values using UnifiedConfigUtils
        for (const [key, defaultValue] of Object.entries(
          EXTENSION_CONFIG.configDefaults
        )) {
          config.settings[key] = window.UnifiedConfigUtils.readConfigValue(
            "Weekly View",
            key,
            defaultValue
          );
        }

        extensionState.config = config;
      }

      return (
        extensionState.config || {
          settings: { ...EXTENSION_CONFIG.configDefaults },
        }
      );
    } catch (error) {
      console.error("❌ Error reading config, using defaults:", error);
      return {
        settings: { ...EXTENSION_CONFIG.configDefaults },
      };
    }
  }

  async function initializeConfig() {
    try {
      console.log("📋 Initializing Weekly View config in unified system...");

      // Initialize config using dependency-injected UnifiedConfigUtils
      const configUtils = extensionState.dependencies.unifiedConfigUtils;

      for (const [key, value] of Object.entries(
        EXTENSION_CONFIG.configDefaults
      )) {
        await configUtils.writeConfigValue("Weekly View", key, value);
      }

      console.log("✅ Weekly View config initialized successfully!");
    } catch (error) {
      console.error("❌ Error initializing Weekly View config:", error);
      throw error;
    }
  }

  // ===================================================================
  // 🚀 WEEKLY CONTENT CREATION - Simplified Single-Step Process
  // ===================================================================

  async function createWeeklyContent(weeklyTitle) {
    try {
      console.log(`🚀 Creating weekly content for: "${weeklyTitle}"`);

      // Check if page already has embeds
      const alreadyHasEmbeds = await hasEmbedBlocks(weeklyTitle);
      if (alreadyHasEmbeds) {
        console.log("📄 Weekly page already has embeds, skipping creation");
        alert(
          "📄 This weekly page already has embed blocks. No action needed!"
        );
        return;
      }

      // Check dependencies
      const pageIssues = await getMissingMonthlyPages(weeklyTitle);
      if (pageIssues.length > 0) {
        const issue = pageIssues[0];
        console.log("⚠️ Missing dependencies:", pageIssues);

        if (issue.reason === "missing") {
          const createPage = confirm(
            `📅 Missing monthly page: "${issue.page}"\n\nWould you like to create it first?`
          );
          if (createPage) {
            await extensionState.dependencies.calendarUtilities.RoamUtils.createPage(
              issue.page
            );
            alert(
              `✅ Created "${issue.page}". Please run this again to complete the weekly view.`
            );
          }
        } else {
          const navigate = confirm(
            `📅 Monthly page "${issue.page}" needs completion.\n\nWould you like to navigate there to complete it?`
          );
          if (navigate) {
            await window.roamAlphaAPI.ui.mainWindow.openPage({
              page: { title: issue.page },
            });
          }
        }
        return;
      }

      // Get the page UID
      const pageUid = window.roamAlphaAPI.data.q(`
        [:find ?uid .
         :where 
         [?e :node/title "${weeklyTitle}"]
         [?e :block/uid ?uid]]
      `);

      if (!pageUid) {
        throw new Error(`Could not find page UID for "${weeklyTitle}"`);
      }

      // Load config for enabled features
      const config = getExtensionConfig();
      let order = 0;

      // 1. Add week count within the year (if enabled)
      if (config.settings["add week count within the year"] === "yes") {
        await addWeekCountInYearLine(pageUid, order, weeklyTitle);
        order++;
      }

      // 2. Add morning intentions query (if enabled)
      if (
        config.settings["include query for `[[Morning Intentions]]`"] === "yes"
      ) {
        await addMorningIntentionsQuery(pageUid, order, weeklyTitle);
        order++;
      }

      // Add divider before embeds
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: "---" },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      order++;

      // Find week blocks from monthly pages
      const weekEmbeds = await findWeekBlocksForWeekly(weeklyTitle);

      if (weekEmbeds.length === 0) {
        throw new Error("No week blocks found in monthly pages");
      }

      // Add embeds in order
      for (const embed of weekEmbeds) {
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: order },
          block: { string: `{{embed-path: ((${embed.uid}))}}` },
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
        order++;

        console.log(
          `✅ Added embed for ${embed.monthPage}: {{embed-path: ((${embed.uid}))}}`
        );
      }

      // Add divider after embeds
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: "---" },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      order++;

      // 3. Add evening reflections query (if enabled) - AFTER EMBEDS
      if (
        config.settings["add query for `[[Evening Reflections]]`"] === "yes"
      ) {
        await addEveningReflectionsQuery(pageUid, order, weeklyTitle);
        order++;
      }

      // 4. Add Plus-Minus-Next journal (if enabled) - LAST
      if (config.settings["add Plus-Minus-Next journal"] === "yes") {
        await addPlusMinusNextJournal(pageUid, order, weeklyTitle);
        order++;
      }

      // Show success message
      alert(
        `🚀 Weekly view created successfully!\n\n✅ Added ${weekEmbeds.length} monthly calendar embeds\n✅ Configured with your preferences`
      );

      // Emit success event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:content-creation-success", {
          pageTitle: weeklyTitle,
          features: {
            weekCount:
              config.settings["add week count within the year"] === "yes",
            morningIntentions:
              config.settings["include query for `[[Morning Intentions]]`"] ===
              "yes",
            eveningReflections:
              config.settings["add query for `[[Evening Reflections]]`"] ===
              "yes",
            plusMinusNext:
              config.settings["add Plus-Minus-Next journal"] === "yes",
            embedCount: weekEmbeds.length,
          },
        });
      }

      console.log(`🚀 Weekly content creation complete!`);
    } catch (error) {
      console.error("❌ Error creating weekly content:", error);

      // Show user-friendly error message
      alert(
        `❌ Error creating weekly content:\n\n${error.message}\n\nCheck the console for details.`
      );

      // Emit error event
      if (CalendarSuite?.emit) {
        CalendarSuite.emit("weekly-view:content-creation-error", {
          pageTitle: weeklyTitle,
          error: error,
        });
      }
    }
  }

  // ===================================================================
  // 🔍 DEPENDENCY CHECKING - Enhanced with Calendar Utilities v1.2
  // ===================================================================

  async function checkMonthlyPageIsPopulated(monthlyPageTitle, weeklyTitle) {
    try {
      const roamUtils = extensionState.dependencies.calendarUtilities.RoamUtils;

      // Check if monthly page exists
      if (!roamUtils.pageExists(monthlyPageTitle)) {
        console.log(`📄 Monthly page "${monthlyPageTitle}" does not exist`);
        return { exists: false, populated: false, reason: "not-found" };
      }

      // Parse weekly title to get the date pattern we're looking for
      const weeklyDateRange = weeklyTitle; // e.g., "07/28 2025 - 08/03 2025"
      const searchPattern = `(#[[${weeklyDateRange}]])`;

      console.log(
        `🔍 Checking if "${monthlyPageTitle}" contains pattern: ${searchPattern}`
      );

      // Search for blocks containing the weekly date pattern
      const weekBlocks = window.roamAlphaAPI.data.q(
        `
        [:find ?uid ?string
         :in $ ?page-title ?pattern
         :where
         [?page :node/title ?page-title]
         [?block :block/page ?page]
         [?block :block/uid ?uid]
         [?block :block/string ?string]
         [(clojure.string/includes? ?string ?pattern)]]
      `,
        monthlyPageTitle,
        searchPattern
      );

      if (weekBlocks && weekBlocks.length > 0) {
        // Found the pattern, check if it's a proper week block
        for (const [uid, string] of weekBlocks) {
          if (string.includes("Week ") && string.includes(":")) {
            console.log(
              `✅ Monthly page "${monthlyPageTitle}" is properly populated with week block`
            );
            return { exists: true, populated: true, reason: "complete" };
          }
        }
      }

      // Page exists but either has no blocks or doesn't contain our week block
      const hasAnyBlocks = window.roamAlphaAPI.data.q(
        `
        [:find ?child .
         :in $ ?page-title
         :where
         [?page :node/title ?page-title]
         [?page :block/children ?child]]
      `,
        monthlyPageTitle
      );

      if (!hasAnyBlocks) {
        console.log(
          `📄 Monthly page "${monthlyPageTitle}" exists but is completely empty`
        );
        return { exists: true, populated: false, reason: "empty-page" };
      } else {
        console.log(
          `📄 Monthly page "${monthlyPageTitle}" exists but doesn't contain our week block`
        );
        return { exists: true, populated: false, reason: "missing-week-block" };
      }
    } catch (error) {
      console.error(
        `Error checking monthly page population "${monthlyPageTitle}":`,
        error
      );
      return { exists: false, populated: false, reason: "error" };
    }
  }

  function getRequiredMonthlyPages(weeklyTitle) {
    const calendarUtils = extensionState.dependencies.calendarUtilities;
    const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
    if (!parsed) return [];

    const { startDate, endDate } = parsed;
    const requiredPages = [];

    // Start month
    const startMonth =
      calendarUtils.DateTimeUtils.getMonthName(startDate.getMonth()) +
      " " +
      startDate.getFullYear();
    requiredPages.push(startMonth);

    // End month (if different)
    const endMonth =
      calendarUtils.DateTimeUtils.getMonthName(endDate.getMonth()) +
      " " +
      endDate.getFullYear();
    if (endMonth !== startMonth) {
      requiredPages.push(endMonth);
    }

    return requiredPages;
  }

  async function getMissingMonthlyPages(weeklyTitle) {
    const requiredPages = getRequiredMonthlyPages(weeklyTitle);
    const missingPages = [];
    const incompletePages = [];

    for (const pageName of requiredPages) {
      const status = await checkMonthlyPageIsPopulated(pageName, weeklyTitle);

      if (!status.exists) {
        // Page doesn't exist at all
        missingPages.push({
          page: pageName,
          reason: "missing",
          message: `Missing: ${pageName}`,
        });
      } else if (!status.populated) {
        // Page exists but is incomplete
        let message;
        switch (status.reason) {
          case "empty-page":
            message = `${pageName} page empty`;
            break;
          case "missing-week-block":
            message = `${pageName} incomplete`;
            break;
          case "incomplete-structure":
            message = `${pageName} structure incomplete`;
            break;
          default:
            message = `${pageName} incomplete`;
        }

        incompletePages.push({
          page: pageName,
          reason: "incomplete",
          message: message,
        });
      }
    }

    // Combine missing and incomplete pages, prioritizing missing pages
    const allIssues = [...missingPages, ...incompletePages];

    console.log(`📅 Page issues for "${weeklyTitle}":`, {
      missing: missingPages.length,
      incomplete: incompletePages.length,
      total: allIssues.length,
    });

    return allIssues;
  }

  async function hasEmbedBlocks(pageTitle) {
    try {
      const embedBlocks = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-title
         :where
         [?page :node/title ?page-title]
         [?block :block/page ?page]
         [?block :block/string ?string]
         [?block :block/uid ?uid]
         [(clojure.string/includes? ?string "{{embed")]]
      `,
        pageTitle
      );

      const hasEmbeds = embedBlocks && embedBlocks.length > 0;
      console.log(`📄 Page "${pageTitle}" has embed blocks: ${hasEmbeds}`);
      return hasEmbeds;
    } catch (error) {
      console.error(`Error checking embed blocks for "${pageTitle}":`, error);
      return false;
    }
  }

  // ===================================================================
  // 🆕 FEATURE FUNCTIONS - Using Injected Dependencies
  // ===================================================================

  async function addWeekCountInYearLine(pageUid, order, weeklyTitle) {
    try {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error("Could not parse weekly title for week count");
      }

      const { startDate } = parsed;
      const year = startDate.getFullYear();

      // Calculate week number: find first Monday of the year
      const firstMonday = getFirstMondayOfYear(year);
      const weekNumber =
        Math.floor(
          (startDate.getTime() - firstMonday.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        ) + 1;

      const weekCountText = `**This is the ${getOrdinal(
        weekNumber
      )} full week of ${year}**`;

      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: weekCountText },
      });

      console.log(`✅ Added week count line: "${weekCountText}"`);
    } catch (error) {
      console.error("❌ Error adding week count line:", error);
      throw error;
    }
  }

  async function addMorningIntentionsQuery(pageUid, order, weeklyTitle) {
    try {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error(
          "Could not parse weekly title for morning intentions query"
        );
      }

      const { startDate, endDate } = parsed;

      // Format dates exactly as shown in screenshot: "June 16th, 2025"
      const startDateFormatted = formatDateWithOrdinal(
        startDate,
        calendarUtils
      );
      const endDateFormatted = formatDateWithOrdinal(endDate, calendarUtils);

      // Create the exact syntax from the screenshot
      const morningIntentionsText = "**Morning intentions this week:**";
      const queryText = `{{[[query]]: {and: [[Morning Intentions]] {between: [[${startDateFormatted}]] [[${endDateFormatted}]]}}}}`;

      // Create main block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: morningIntentionsText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the main block UID
      const mainBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?text
         :where 
         [?page :block/uid ?page-uid]
         [?block :block/parents ?page]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        morningIntentionsText
      );

      if (!mainBlockUid) {
        throw new Error("Could not find morning intentions main block UID");
      }

      // Add query as child block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": mainBlockUid, order: 0 },
        block: { string: queryText },
      });

      console.log(
        `✅ Added morning intentions query: "${morningIntentionsText}"`
      );
    } catch (error) {
      console.error("❌ Error adding morning intentions query:", error);
      throw error;
    }
  }

  async function addEveningReflectionsQuery(pageUid, order, weeklyTitle) {
    try {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error(
          "Could not parse weekly title for evening reflections query"
        );
      }

      const { startDate, endDate } = parsed;

      // Format dates exactly like morning intentions
      const startDateFormatted = formatDateWithOrdinal(
        startDate,
        calendarUtils
      );
      const endDateFormatted = formatDateWithOrdinal(endDate, calendarUtils);

      // Create the exact syntax - same as morning but for evening
      const eveningReflectionsText = "**Evening reflections this week:**";
      const queryText = `{{[[query]]: {and: [[Evening Reflections]] {between: [[${startDateFormatted}]] [[${endDateFormatted}]]}}}}`;

      // Create main block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: eveningReflectionsText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the main block UID
      const mainBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?text
         :where 
         [?page :block/uid ?page-uid]
         [?block :block/parents ?page]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        eveningReflectionsText
      );

      if (!mainBlockUid) {
        throw new Error("Could not find evening reflections main block UID");
      }

      // Add query as child block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": mainBlockUid, order: 0 },
        block: { string: queryText },
      });

      console.log(
        `✅ Added evening reflections query: "${eveningReflectionsText}"`
      );
    } catch (error) {
      console.error("❌ Error adding evening reflections query:", error);
      throw error;
    }
  }

  async function addPlusMinusNextJournal(pageUid, order, weeklyTitle) {
    try {
      // Create the exact structure as shown in the image
      const summaryText = "**Summary (end-of-week [[P.M.N.]]):**";

      // Create main summary block
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: order },
        block: { string: summaryText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the summary block UID
      const summaryBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?text
         :where 
         [?page :block/uid ?page-uid]
         [?block :block/parents ?page]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        summaryText
      );

      if (!summaryBlockUid) {
        throw new Error("Could not find summary block UID");
      }

      // Add the Plus-Minus-Next structure with the exact instruction text
      const pmnText =
        "Plus-Minus-Next ((hit ctrl-shift-v, then select h, for horizontal view))";

      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": summaryBlockUid, order: 0 },
        block: { string: pmnText },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the PMN block UID
      const pmnBlockUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?parent-uid ?text
         :where 
         [?parent :block/uid ?parent-uid]
         [?block :block/parents ?parent]
         [?block :block/string ?text]
         [?block :block/uid ?uid]]
      `,
        summaryBlockUid,
        pmnText
      );

      if (!pmnBlockUid) {
        throw new Error("Could not find PMN block UID");
      }

      // Add PLUS, MINUS, and NEXT sections
      const sections = ["PLUS", "MINUS", "NEXT"];

      for (let i = 0; i < sections.length; i++) {
        const sectionText = sections[i];

        // Create section header
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pmnBlockUid, order: i },
          block: { string: sectionText },
        });
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the section block UID
        const sectionUid = window.roamAlphaAPI.data.q(
          `
          [:find ?uid .
           :in $ ?parent-uid ?section-text
           :where 
           [?parent :block/uid ?parent-uid]
           [?section :block/parents ?parent]
           [?section :block/string ?section-text]
           [?section :block/uid ?uid]]
        `,
          pmnBlockUid,
          sectionText
        );

        if (sectionUid) {
          // Add the "1." starter item under each section
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": sectionUid, order: 0 },
            block: { string: "1." },
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(`✅ Added Plus-Minus-Next journal structure`);
    } catch (error) {
      console.error("❌ Error adding Plus-Minus-Next journal:", error);
      throw error;
    }
  }

  // ===================================================================
  // 🔧 HELPER FUNCTIONS
  // ===================================================================

  // Helper function to format date with ordinal (June 16th, 2025)
  function formatDateWithOrdinal(date, calendarUtils) {
    const monthName = calendarUtils.DateTimeUtils.getMonthName(date.getMonth());
    const day = date.getDate();
    const year = date.getFullYear();
    const ordinalDay = getOrdinal(day);
    return `${monthName} ${ordinalDay}, ${year}`;
  }

  // Helper function to get first Monday of the year
  function getFirstMondayOfYear(year) {
    const jan1 = new Date(year, 0, 1); // January 1st of the year
    const dayOfWeek = jan1.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate days to add to get to first Monday
    let daysToMonday;
    if (dayOfWeek === 0) {
      // Sunday
      daysToMonday = 1;
    } else if (dayOfWeek === 1) {
      // Monday
      daysToMonday = 0;
    } else {
      // Tuesday through Saturday
      daysToMonday = 8 - dayOfWeek;
    }

    const firstMonday = new Date(year, 0, 1 + daysToMonday);
    return firstMonday;
  }

  function getOrdinal(number) {
    const suffix = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return number + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  }

  // ===================================================================
  // 🔍 EMBED DISCOVERY - Enhanced with Calendar Utilities
  // ===================================================================

  async function findWeekBlocksForWeekly(weeklyTitle) {
    const requiredMonthlyPages = getRequiredMonthlyPages(weeklyTitle);
    const weekEmbeds = [];

    console.log(
      `🔍 Searching for week blocks in monthly pages:`,
      requiredMonthlyPages
    );

    // Format the weekly title for exact matching
    const weeklyDateRange = weeklyTitle; // e.g., "07/28 2025 - 08/03 2025"
    const searchPattern = `(#[[${weeklyDateRange}]])`;

    console.log(`🔍 Searching for pattern: ${searchPattern}`);

    for (const monthPage of requiredMonthlyPages) {
      console.log(`🔍 Searching in monthly page: "${monthPage}"`);

      try {
        // Search for blocks containing the exact weekly date pattern
        const weekBlocks = window.roamAlphaAPI.data.q(
          `
          [:find ?uid ?string
           :in $ ?page-title ?pattern
           :where
           [?page :node/title ?page-title]
           [?block :block/page ?page]
           [?block :block/uid ?uid]
           [?block :block/string ?string]
           [(clojure.string/includes? ?string ?pattern)]]
        `,
          monthPage,
          searchPattern
        );

        console.log(`📋 Query results for "${monthPage}":`, weekBlocks);

        if (weekBlocks && weekBlocks.length > 0) {
          // Find the week block (should contain "Week N:" at the start)
          for (const [uid, string] of weekBlocks) {
            if (string.includes("Week ") && string.includes(":")) {
              weekEmbeds.push({
                uid: uid,
                monthPage: monthPage,
                blockString: string,
              });
              console.log(
                `✅ Found week block in "${monthPage}": ${string.substring(
                  0,
                  50
                )}...`
              );
              break; // Only take the first week block per month
            }
          }
        } else {
          console.log(
            `⚠️ No week blocks found in "${monthPage}" for pattern: ${searchPattern}`
          );
        }
      } catch (error) {
        console.error(`❌ Error searching in "${monthPage}":`, error);
      }
    }

    // Sort embeds: if cross-month, put start month first, then end month (chronological order)
    if (weekEmbeds.length === 2) {
      const calendarUtils = extensionState.dependencies.calendarUtilities;
      const parsed = calendarUtils.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
      if (parsed) {
        const { startDate, endDate } = parsed;
        const startMonth =
          calendarUtils.DateTimeUtils.getMonthName(startDate.getMonth()) +
          " " +
          startDate.getFullYear();
        const endMonth =
          calendarUtils.DateTimeUtils.getMonthName(endDate.getMonth()) +
          " " +
          endDate.getFullYear();

        // Sort: start month (begin) first, then end month (chronological order)
        weekEmbeds.sort((a, b) => {
          if (a.monthPage === startMonth) return -1;
          if (b.monthPage === startMonth) return 1;
          return 0;
        });

        console.log(
          `🔄 Sorted cross-month embeds chronologically: start month (${startMonth}) first, then end month (${endMonth})`
        );
      }
    }

    return weekEmbeds;
  }

  // ===================================================================
  // 🧹 CLEANUP FUNCTIONS
  // ===================================================================

  function cleanup() {
    console.log("🧹 Weekly View Extension v5.0 cleanup...");

    // Cleanup button manager
    if (extensionState.buttonManager) {
      extensionState.buttonManager.cleanup();
    }

    // Clear extension state
    extensionState = {
      initialized: false,
      buttonManager: null,
      config: null,
      dependencies: null,
    };

    // Emit cleanup event
    if (CalendarSuite?.emit) {
      CalendarSuite.emit("weekly-view:cleanup", {
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ Weekly View Extension v5.0 cleanup complete");
  }

  // ===================================================================
  // 🚀 EXTENSION EXPORT - Button Manager Integration
  // ===================================================================

  const WeeklyViewExtension = {
    onload: async ({ extensionAPI }) => {
      console.log(
        "📅 Weekly View Extension v5.0 loading (Button Manager Integration)..."
      );

      try {
        // 🔒 DEPENDENCY CHECK - Simple Button Manager required
        if (!window.SimpleExtensionButtonManager) {
          console.error(
            "❌ Weekly View Extension requires Simple Button Manager v3.2+ - please install first!"
          );
          alert(
            "❌ Weekly View Extension requires Simple Button Manager v3.2+.\n\nPlease install Simple Button Manager first, then reload."
          );
          return;
        }

        // 🔒 DEPENDENCY CHECK - Calendar Foundation v2.0+ required
        if (!window.CalendarSuite) {
          console.error(
            "❌ Weekly View Extension requires Calendar Foundation v2.0+ - please install first!"
          );
          alert(
            "❌ Weekly View Extension requires Calendar Foundation v2.0+.\n\nPlease install Calendar Foundation v2.0+ first, then reload."
          );
          return;
        }

        console.log("🔧 Dependencies satisfied, proceeding with setup...");

        // 🎯 INITIALIZE BUTTON MANAGER
        extensionState.buttonManager = new window.SimpleExtensionButtonManager(
          "WeeklyView"
        );
        await extensionState.buttonManager.initialize();
        console.log("✅ Button manager initialized");

        // 🔌 SETUP DEPENDENCIES
        extensionState.dependencies = {
          calendarUtilities: window.CalendarUtilities,
          unifiedConfigUtils: window.UnifiedConfigUtils,
        };

        // Verify dependencies
        if (!extensionState.dependencies.calendarUtilities) {
          throw new Error("Calendar Utilities not available");
        }
        if (!extensionState.dependencies.unifiedConfigUtils) {
          throw new Error("Unified Config Utils not available");
        }

        console.log(
          "✅ Dependencies verified:",
          Object.keys(extensionState.dependencies)
        );

        // 📋 INITIALIZE CONFIG SYSTEM
        await initializeConfig();
        console.log("✅ Config system initialized");

        // 🚀 REGISTER WEEKLY VIEW BUTTON with Calendar Suite styling
        await extensionState.buttonManager.registerButton({
          id: "create-weekly-view",
          text: "📅 Create Weekly View",
          onClick: async () => {
            console.log("📅 Weekly View button clicked!");

            // Get current page title (should be a weekly page due to condition)
            const currentPageTitle =
              extensionState.dependencies.calendarUtilities.WeeklyUtils.getCurrentPageTitle?.() ||
              document.querySelector(".roam-article h1")?.textContent?.trim();

            if (!currentPageTitle) {
              alert("❌ Could not determine current page title");
              return;
            }

            // Verify it's actually a weekly page
            if (
              !extensionState.dependencies.calendarUtilities.WeeklyUtils.isWeeklyPage(
                currentPageTitle
              )
            ) {
              alert("❌ This doesn't appear to be a weekly page");
              return;
            }

            // Create weekly content
            await createWeeklyContent(currentPageTitle);
          },
          showOn: ["isWeeklyPage"], // Only show on weekly pages
          stack: "top-right",
          style: calendarButtonStyle, // Apply Calendar Suite styling
        });

        console.log(
          "✅ Weekly View button registered with Calendar Suite styling"
        );

        // Mark as initialized
        extensionState.initialized = true;

        console.log("✅ Weekly View Extension v5.0 loaded successfully!");
        console.log(
          "🚀 Simplified: Single-step workflow • Button Manager integration • Calendar Suite styling"
        );

        // 🎯 EMIT LOAD SUCCESS EVENT
        if (CalendarSuite?.emit) {
          CalendarSuite.emit("weekly-view:loaded", {
            version: EXTENSION_CONFIG.version,
            features: [
              "simplified-workflow",
              "button-manager-integration",
              "calendar-suite-styling",
            ],
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("❌ Error loading Weekly View Extension:", error);

        // Clean up on error
        cleanup();

        alert(`❌ Weekly View Extension failed to load: ${error.message}`);

        // 🎯 EMIT LOAD ERROR EVENT
        if (CalendarSuite?.emit) {
          CalendarSuite.emit("weekly-view:load-error", {
            error: error,
            timestamp: new Date().toISOString(),
          });
        }
      }
    },

    onunload: () => {
      console.log("👋 Weekly View Extension v5.0 unloading...");

      try {
        // 🎯 EMIT UNLOAD EVENT
        if (CalendarSuite?.emit) {
          CalendarSuite.emit("weekly-view:unloading", {
            timestamp: new Date().toISOString(),
          });
        }

        // 🧹 CLEANUP
        cleanup();

        console.log("✅ Weekly View Extension v5.0 unloaded successfully!");
      } catch (error) {
        console.error("❌ Error during Weekly View Extension unload:", error);
      }
    },
  };

  // 🌐 Export to global scope for Roam
  window.WeeklyViewExtension = WeeklyViewExtension;

  return WeeklyViewExtension;
})();

// 📦 Export the extension for Roam
export default window.WeeklyViewExtension;
