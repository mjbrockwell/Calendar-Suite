// ===================================================================
// 📅 WEEKLY VIEW EXTENSION v2.1 - Professional Calendar Suite
// ===================================================================
// Auto-detects weekly calendar pages and offers to populate with monthly calendar embeds
// Rewritten to use Calendar Utilities foundation with redesigned configuration

// Wrap everything in an IIFE to avoid global variable conflicts
(function () {
  "use strict";

  // Extension-scoped variables
  let weeklyViewConfig = null;
  let weeklyViewObserver = null;
  let weeklyViewTimeout = null;

  // ===================================================================
  // 🌳 CONFIGURATION MANAGEMENT - Redesigned Structure
  // ===================================================================

  async function initializeConfig() {
    try {
      const configExists = await checkConfigExists();

      if (!configExists) {
        console.log("📋 Creating default Weekly View config...");
        await createDefaultConfig();
      } else {
        console.log("📋 Weekly View config found");
      }
    } catch (error) {
      console.error("❌ Error initializing config:", error);
    }
  }

  function checkConfigExists() {
    return new Promise((resolve) => {
      try {
        const result = window.roamAlphaAPI.data.q(`
          [:find ?uid .
           :where 
           [?e :node/title "roam/ext/weekly view/config"]
           [?e :block/uid ?uid]]
        `);
        resolve(!!result);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async function createDefaultConfig() {
    try {
      // Create the config page using RoamUtils
      await CalendarUtilities.RoamUtils.createPage(
        "roam/ext/weekly view/config"
      );

      // Wait for page creation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Get the page UID
      const pageUid = window.roamAlphaAPI.data.q(`
        [:find ?uid .
         :where 
         [?e :node/title "roam/ext/weekly view/config"]
         [?e :block/uid ?uid]]
      `);

      if (!pageUid) throw new Error("Could not find created config page");

      // Create the main Settings section (bold)
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: 0 },
        block: { string: "**Settings:**" },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get settings block UID
      const settingsUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid
         :where 
         [?page :block/uid ?page-uid]
         [?settings :block/parents ?page]
         [?settings :block/string "**Settings:**"]
         [?settings :block/uid ?uid]]
      `,
        pageUid
      );

      // Add all settings in the correct order
      if (settingsUid) {
        const settingsBlocks = [
          "automatic guidance enabled: yes",
          "add week count within the year: yes",
          "include query for `[[Morning Intentions]]`: yes",
          "add query for `[[Evening Reflections]]`: yes",
          "add Plus-Minus-Next journal: yes",
        ];

        for (let i = 0; i < settingsBlocks.length; i++) {
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": settingsUid, order: i },
            block: { string: settingsBlocks[i] },
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log("✅ Weekly View config created successfully!");
    } catch (error) {
      console.error("❌ Error creating config:", error);
      throw error;
    }
  }

  async function loadConfig() {
    try {
      // Use ConfigUtils to read configuration with new setting names
      const configPageTitle = "roam/ext/weekly view/config";

      const config = {
        settings: {
          "automatic guidance enabled":
            CalendarUtilities.ConfigUtils.readConfigValue(
              configPageTitle,
              "automatic guidance enabled",
              "yes"
            ),
          "add week count within the year":
            CalendarUtilities.ConfigUtils.readConfigValue(
              configPageTitle,
              "add week count within the year",
              "yes"
            ),
          "include query for `[[Morning Intentions]]`":
            CalendarUtilities.ConfigUtils.readConfigValue(
              configPageTitle,
              "include query for `[[Morning Intentions]]`",
              "yes"
            ),
          "add query for `[[Evening Reflections]]`":
            CalendarUtilities.ConfigUtils.readConfigValue(
              configPageTitle,
              "add query for `[[Evening Reflections]]`",
              "yes"
            ),
          "add Plus-Minus-Next journal":
            CalendarUtilities.ConfigUtils.readConfigValue(
              configPageTitle,
              "add Plus-Minus-Next journal",
              "yes"
            ),
        },
      };

      console.log("📋 Loaded Weekly View config:", config);
      return config;
    } catch (error) {
      console.error("❌ Error loading config:", error);
      // Return default config on error
      return {
        settings: {
          "automatic guidance enabled": "yes",
          "add week count within the year": "yes",
          "include query for `[[Morning Intentions]]`": "yes",
          "add query for `[[Evening Reflections]]`": "yes",
          "add Plus-Minus-Next journal": "yes",
        },
      };
    }
  }

  // ===================================================================
  // 🗓️ PAGE DETECTION - Using new utilities
  // ===================================================================

  function getCurrentPageTitle() {
    return CalendarUtilities.RoamUtils.getCurrentPageTitle();
  }

  function isWeeklyPage(pageTitle) {
    return CalendarUtilities.WeeklyUtils.isWeeklyPage(pageTitle);
  }

  function parseWeeklyTitle(weeklyTitle) {
    // Use WeeklyUtils to parse the weekly title
    return CalendarUtilities.WeeklyUtils.parseWeeklyTitle(weeklyTitle);
  }

  function getRequiredMonthlyPages(weeklyTitle) {
    const parsed = parseWeeklyTitle(weeklyTitle);
    if (!parsed) return [];

    const { startDate, endDate } = parsed;
    const requiredPages = [];

    // Start month
    const startMonth =
      CalendarUtilities.DateTimeUtils.getMonthName(startDate.getMonth()) +
      " " +
      startDate.getFullYear();
    requiredPages.push(startMonth);

    // End month (if different)
    const endMonth =
      CalendarUtilities.DateTimeUtils.getMonthName(endDate.getMonth()) +
      " " +
      endDate.getFullYear();
    if (endMonth !== startMonth) {
      requiredPages.push(endMonth);
    }

    return requiredPages;
  }

  // ===================================================================
  // 🔍 DEPENDENCY CHECKING - Preserved legacy logic
  // ===================================================================

  async function checkMonthlyPageIsPopulated(monthlyPageTitle, weeklyTitle) {
    try {
      // Check if monthly page exists
      if (!CalendarUtilities.RoamUtils.pageExists(monthlyPageTitle)) {
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
          message: `Click to CREATE: ${pageName}`,
        });
      } else if (!status.populated) {
        // Page exists but is incomplete
        let message;
        switch (status.reason) {
          case "empty-page":
            message = `${pageName} page empty - navigate to populate?`;
            break;
          case "missing-week-block":
            message = `${pageName} incomplete - navigate to add week?`;
            break;
          case "incomplete-structure":
            message = `${pageName} structure incomplete - navigate to fix?`;
            break;
          default:
            message = `${pageName} incomplete - navigate to complete?`;
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
  // 👁️ PAGE CHANGE DETECTION - Updated for new config structure
  // ===================================================================

  function setupPageDetection() {
    // Clean up existing observer
    if (weeklyViewObserver) {
      weeklyViewObserver.disconnect();
    }

    // Create new observer for page changes
    weeklyViewObserver = new MutationObserver((mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.tagName) {
              if (
                node.classList?.contains("roam-article") ||
                node.classList?.contains("rm-title-display") ||
                node.querySelector?.(".rm-title-display")
              ) {
                shouldCheck = true;
              }
            }
          });
        }
      });

      if (shouldCheck) {
        // Debounce the check
        if (weeklyViewTimeout) clearTimeout(weeklyViewTimeout);
        weeklyViewTimeout = setTimeout(() => {
          console.log("📅 Page change detected, checking current page...");
          checkCurrentPage();
        }, 500);
      }
    });

    // Start observing
    weeklyViewObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("👁️ Weekly View page detection setup complete");
  }

  async function checkCurrentPage() {
    try {
      const config = await loadConfig();

      // Only proceed if automatic guidance is enabled
      if (config.settings["automatic guidance enabled"] !== "yes") {
        console.log("📅 Automatic guidance disabled, removing button");
        removeWeeklyButton();
        return;
      }

      const pageTitle = getCurrentPageTitle();
      console.log(`📅 checkCurrentPage called - Page: "${pageTitle}"`);

      if (isWeeklyPage(pageTitle)) {
        console.log(`📅 Detected weekly page: "${pageTitle}"`);

        // Check if we already have a button in progress
        const existingButton = document.getElementById("weekly-view-button");
        if (existingButton) {
          const buttonState = existingButton.dataset.state;
          console.log(`📅 Button already exists in state: ${buttonState}`);

          // Don't interfere if button is in creating or navigating state
          if (buttonState === "creating" || buttonState === "navigating") {
            console.log(
              `📅 Button is in ${buttonState} state, not disrupting workflow`
            );
            return;
          }
        }

        // Check for embed blocks instead of empty page
        const alreadyHasEmbeds = await hasEmbedBlocks(pageTitle);

        if (!alreadyHasEmbeds) {
          console.log(
            `📅 Weekly page doesn't have embeds, checking dependencies...`
          );
          const pageIssues = await getMissingMonthlyPages(pageTitle);

          if (pageIssues.length === 0) {
            console.log("✅ All dependencies met, showing ready button");
            showWeeklyButton(pageTitle, "ready", config);
          } else {
            console.log("⚠️ Page issues found, showing warning button");
            showWeeklyButton(pageTitle, "warning", config, pageIssues);
          }
        } else {
          console.log("📄 Weekly page already has embeds, removing button");
          removeWeeklyButton();
        }
      } else {
        console.log("📍 Not a weekly page, removing button");
        removeWeeklyButton();
      }
    } catch (error) {
      console.error("Error checking current page:", error);
    }
  }

  // ===================================================================
  // 🦜 UI BUTTON MANAGEMENT - Preserved legacy interface
  // ===================================================================

  function showWeeklyButton(pageTitle, state, config, pageIssues = []) {
    // Remove existing button first
    removeWeeklyButton();

    const isWarning = state === "warning";
    const firstIssue = pageIssues[0];

    // Create button element
    const button = document.createElement("div");
    button.id = "weekly-view-button";

    // Button styles - preserved from legacy
    const baseStyles = `
      position: fixed;
      top: 60px;
      right: 20px;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transition: all 0.2s ease;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 360px;
    `;

    const readyBackground = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    const warningBackground =
      "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)";

    button.style.cssText =
      baseStyles +
      `background: ${isWarning ? warningBackground : readyBackground};`;

    // Store button state for multi-step process
    button.dataset.state = state;
    button.dataset.missingPage = firstIssue ? firstIssue.page : "";
    button.dataset.issueReason = firstIssue ? firstIssue.reason : "";
    button.dataset.weeklyTitle = pageTitle;

    // Initial content
    const icon = isWarning ? "⚠️" : "📅";
    const iconStyle = isWarning
      ? "font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);"
      : "font-size: 16px;";

    let title, subtitle;
    if (isWarning && firstIssue) {
      if (firstIssue.reason === "missing") {
        title = "Missing monthly page";
        subtitle = firstIssue.message;
      } else {
        title = "Monthly page incomplete";
        subtitle = firstIssue.message;
      }
    } else {
      title = "Add weekly view?";
      subtitle = "Embed monthly calendars";
    }

    button.innerHTML = `
      <span style="${iconStyle}">${icon}</span>
      <div>
        <div style="font-weight: 600;">${title}</div>
        <div style="font-size: 12px; opacity: 0.9;">${subtitle}</div>
      </div>
    `;

    // Add hover effects
    button.addEventListener("mouseenter", () => {
      if (isWarning) {
        button.style.background =
          "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      }
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = isWarning ? warningBackground : readyBackground;
      button.style.transform = "translateY(0px)";
      button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    });

    // Add click handler - preserved multi-step workflow
    button.addEventListener("click", () => {
      console.log(
        `📅 Button clicked - State: ${button.dataset.state}, Issue: ${button.dataset.issueReason}`
      );

      if (button.dataset.state === "warning") {
        if (button.dataset.issueReason === "missing") {
          // Step 1: Create the page
          handleCreatePageSimple(button);
        } else {
          // Navigate to existing but incomplete page
          handleNavigateToIncompletePageSimple(button);
        }
      } else if (button.dataset.state === "navigating") {
        // Step 2: Navigate to the page
        handleNavigateToPageSimple(button);
      } else if (button.dataset.state === "ready") {
        // Phase 3: Create weekly content!
        console.log("🚀 Phase 3: Creating weekly content!");
        createWeeklyContent(button);
      }
    });

    // Add to page
    document.body.appendChild(button);
    console.log(`📅 Weekly button shown - State: ${state}`);
  }

  function removeWeeklyButton() {
    const existingButton = document.getElementById("weekly-view-button");
    if (existingButton) {
      existingButton.remove();
      console.log("📅 Weekly button removed");
    }
  }

  // ===================================================================
  // 🎯 CLICK HANDLERS - Preserved legacy workflow
  // ===================================================================

  async function handleCreatePageSimple(button) {
    const missingPage = button.dataset.missingPage;
    console.log(`🏗️ Creating missing page: "${missingPage}"`);

    try {
      // Update button to show creating state
      button.dataset.state = "creating";
      button.style.background =
        "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">⏳</span>
        <div>
          <div style="font-weight: 600;">Creating page...</div>
          <div style="font-size: 12px; opacity: 0.9;">Please wait</div>
        </div>
      `;

      // Create the monthly page using RoamUtils
      await CalendarUtilities.RoamUtils.createPage(missingPage);

      // Wait a moment for creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update button to navigation state
      button.dataset.state = "navigating";
      button.style.background =
        "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">🧭</span>
        <div>
          <div style="font-weight: 600;">Page created!</div>
          <div style="font-size: 12px; opacity: 0.9;">Click to navigate → ${missingPage}</div>
        </div>
      `;

      console.log(`✅ Page "${missingPage}" created successfully`);
    } catch (error) {
      console.error(`❌ Error creating page "${missingPage}":`, error);

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Creation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Try manually</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 3000);
    }
  }

  async function handleNavigateToIncompletePageSimple(button) {
    const incompletePage = button.dataset.missingPage;
    console.log(`🧭 Navigating to incomplete page: "${incompletePage}"`);

    try {
      // Navigate using Roam API
      await window.roamAlphaAPI.ui.mainWindow.openPage({
        page: { title: incompletePage },
      });

      // Update button to show navigation success
      button.style.background =
        "linear-gradient(135deg, #059669 0%, #047857 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Navigated!</div>
          <div style="font-size: 12px; opacity: 0.9;">Complete the monthly page</div>
        </div>
      `;

      // Remove button after navigation
      setTimeout(() => {
        removeWeeklyButton();
      }, 2000);

      console.log(`✅ Navigated to "${incompletePage}"`);
    } catch (error) {
      console.error(`❌ Error navigating to "${incompletePage}":`, error);

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Navigation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Try manually</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 3000);
    }
  }

  async function handleNavigateToPageSimple(button) {
    const targetPage = button.dataset.missingPage;
    console.log(`🧭 Navigating to page: "${targetPage}"`);

    try {
      // Navigate using Roam API
      await window.roamAlphaAPI.ui.mainWindow.openPage({
        page: { title: targetPage },
      });

      // Update button to show success
      button.style.background =
        "linear-gradient(135deg, #059669 0%, #047857 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Navigated!</div>
          <div style="font-size: 12px; opacity: 0.9;">Complete the page setup</div>
        </div>
      `;

      // Remove button after navigation
      setTimeout(() => {
        removeWeeklyButton();
      }, 2000);

      console.log(`✅ Navigated to "${targetPage}"`);
    } catch (error) {
      console.error(`❌ Error navigating to "${targetPage}":`, error);

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Navigation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Try manually</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 3000);
    }
  }

  // ===================================================================
  // 🚀 WEEKLY CONTENT CREATION - Enhanced with redesigned features
  // ===================================================================

  async function createWeeklyContent(button) {
    const weeklyTitle = button.dataset.weeklyTitle;

    try {
      // Update button to show creation in progress
      button.dataset.state = "creating";
      button.style.background =
        "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">⚙️</span>
        <div>
          <div style="font-weight: 600;">Creating content...</div>
          <div style="font-size: 12px; opacity: 0.9;">Building weekly view</div>
        </div>
      `;

      console.log(`🚀 Creating weekly content for: "${weeklyTitle}"`);

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
      const config = await loadConfig();
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

      // Update button to show success
      button.style.background =
        "linear-gradient(135deg, #059669 0%, #047857 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Content created!</div>
          <div style="font-size: 12px; opacity: 0.9;">Weekly view is ready</div>
        </div>
      `;

      // Remove button after success
      setTimeout(() => {
        removeWeeklyButton();
        console.log(`🚀 Weekly content creation complete!`);
      }, 2000);
    } catch (error) {
      console.error("❌ Error creating weekly content:", error);

      // Show error state
      button.style.background =
        "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Creation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">${error.message}</div>
        </div>
      `;

      // Remove button after error display
      setTimeout(() => {
        removeWeeklyButton();
      }, 4000);
    }
  }

  // ===================================================================
  // 🆕 FEATURE FUNCTIONS - Redesigned & New Features
  // ===================================================================

  async function addWeekCountInYearLine(pageUid, order, weeklyTitle) {
    try {
      const parsed = parseWeeklyTitle(weeklyTitle);
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
      const parsed = parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error(
          "Could not parse weekly title for morning intentions query"
        );
      }

      const { startDate, endDate } = parsed;

      // Format dates exactly as shown in screenshot: "June 16th, 2025"
      const startDateFormatted = formatDateWithOrdinal(startDate);
      const endDateFormatted = formatDateWithOrdinal(endDate);

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

  // 🆕 NEW FEATURE: Evening Reflections Query
  async function addEveningReflectionsQuery(pageUid, order, weeklyTitle) {
    try {
      const parsed = parseWeeklyTitle(weeklyTitle);
      if (!parsed) {
        throw new Error(
          "Could not parse weekly title for evening reflections query"
        );
      }

      const { startDate, endDate } = parsed;

      // Format dates exactly like morning intentions
      const startDateFormatted = formatDateWithOrdinal(startDate);
      const endDateFormatted = formatDateWithOrdinal(endDate);

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

  // 🆕 NEW FEATURE: Plus-Minus-Next Journal
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
  function formatDateWithOrdinal(date) {
    const monthName = CalendarUtilities.DateTimeUtils.getMonthName(
      date.getMonth()
    );
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
  // 🔍 EMBED DISCOVERY - Preserved legacy logic
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
      const parsed = parseWeeklyTitle(weeklyTitle);
      if (parsed) {
        const { startDate, endDate } = parsed;
        const startMonth =
          CalendarUtilities.DateTimeUtils.getMonthName(startDate.getMonth()) +
          " " +
          startDate.getFullYear();
        const endMonth =
          CalendarUtilities.DateTimeUtils.getMonthName(endDate.getMonth()) +
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
    console.log("🧹 Weekly View Extension cleanup...");

    // Stop observing page changes
    if (weeklyViewObserver) {
      weeklyViewObserver.disconnect();
      weeklyViewObserver = null;
    }

    // Clear timeout
    if (weeklyViewTimeout) {
      clearTimeout(weeklyViewTimeout);
      weeklyViewTimeout = null;
    }

    // Remove any existing button
    removeWeeklyButton();

    // Clear config cache
    weeklyViewConfig = null;

    console.log("✅ Weekly View Extension cleanup complete");
  }

  // ===================================================================
  // 🚀 EXTENSION EXPORT - Professional Calendar Suite Integration
  // ===================================================================

  const WeeklyViewExtension = {
    onload: async ({ extensionAPI }) => {
      console.log("📅 Weekly View Extension v2.1 loading...");

      // Wait for Calendar Utilities to be available
      let attempts = 0;
      while (!window.CalendarUtilities && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.CalendarUtilities) {
        console.error(
          "❌ Calendar Utilities not found! Weekly View Extension requires Calendar Utilities."
        );
        return;
      }

      console.log(
        "🔧 Calendar Utilities found, proceeding with Weekly View Extension setup..."
      );

      // Initialize configuration
      await initializeConfig();

      // Set up page change detection
      setupPageDetection();

      // Initial check for current page
      await checkCurrentPage();

      // 🎯 REGISTER WITH CALENDAR SUITE
      if (window.CalendarSuite) {
        window.CalendarSuite.register(
          "weekly-view",
          {
            checkCurrentPage,
            createWeeklyContent,
            isWeeklyPage,
            parseWeeklyTitle,
            getRequiredMonthlyPages,
            version: "2.1.0",
          },
          {
            name: "Weekly View",
            description:
              "Auto-detects weekly calendar pages and offers to populate with monthly calendar embeds",
            version: "2.1.0",
            dependencies: ["calendar-foundation", "calendar-utilities"],
            provides: [
              "weekly-view-creation",
              "weekly-page-detection",
              "monthly-dependency-checking",
              "morning-intentions-query",
              "evening-reflections-query",
              "plus-minus-next-journal",
            ],
          }
        );

        console.log("🔗 Weekly View Extension registered with Calendar Suite");
      }

      console.log("✅ Weekly View Extension v2.1 loaded successfully!");
    },

    onunload: () => {
      cleanup();
      console.log("👋 Weekly View Extension v2.1 unloaded");
    },
  };

  // Export to global scope for Roam
  window.WeeklyViewExtension = WeeklyViewExtension;

  return WeeklyViewExtension;
})();

// Export the extension for Roam
export default window.WeeklyViewExtension;
