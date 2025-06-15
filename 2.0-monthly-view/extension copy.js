// ===================================================================
// 📅 MONTHLY VIEW EXTENSION v2.0 - Professional Rebuild (Monday Weeks)
// Auto-detects monthly pages and offers to populate with numbered week calendars
// Built on Calendar Foundation + Calendar Utilities architecture
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log("📅 Monthly View Extension v2.0 loading...");

    // 🔧 VERIFY DEPENDENCIES
    if (!window.CalendarSuite) {
      console.error(
        "❌ Calendar Foundation not found! Please load Calendar Foundation first."
      );
      return;
    }

    if (!window.CalendarUtilities) {
      console.error(
        "❌ Calendar Utilities not found! Please load Calendar Utilities first."
      );
      return;
    }

    // 🌳 INITIALIZE EXTENSION
    initializeMonthlyView();

    console.log("✅ Monthly View Extension v2.0 loaded!");
  },

  onunload: () => {
    console.log("📅 Monthly View Extension v2.0 unloading...");

    // Clean up any floating buttons
    removeMonthlyButton();

    // The Calendar Foundation will handle automatic cleanup
    console.log("✅ Monthly View Extension v2.0 unloaded!");
  },
};

// ===================================================================
// 🌳 1.0 CONFIGURATION MANAGEMENT - Professional Settings
// ===================================================================

async function initializeMonthlyView() {
  try {
    // 📋 Initialize configuration with new naming convention
    await initializeConfig();

    // 🌺 Set up page detection
    setupPageDetection();

    // 🔍 Initial check for current page
    checkCurrentPage();

    // 🎯 Register with Calendar Foundation
    registerWithPlatform();
  } catch (error) {
    console.error("❌ Error initializing Monthly View:", error);
  }
}

async function initializeConfig() {
  try {
    // 🔧 Check if config exists with new naming convention
    const configExists = window.CalendarUtilities.RoamUtils.pageExists(
      "roam/ext/monthly view/config"
    );

    if (!configExists) {
      console.log("📋 Creating default Monthly View config...");
      await createDefaultConfig();
    } else {
      console.log("📋 Monthly View config found");
    }
  } catch (error) {
    console.error("❌ Error initializing config:", error);
  }
}

async function createDefaultConfig() {
  try {
    // 📝 Create config page with sections using utility
    await window.CalendarUtilities.ConfigUtils.createDefaultConfig(
      "roam/ext/monthly view/config",
      ["colors::", "settings::"]
    );

    // ⏱️ Wait for page creation
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 🏗️ Get the page UID
    const pageUid = window.CalendarUtilities.RoamUtils.getPageUid(
      "roam/ext/monthly view/config"
    );
    if (!pageUid) throw new Error("Could not find created config page");

    // 🌈 Add default color configuration
    await addDefaultColors(pageUid);

    // ⚙️ Add default settings
    await addDefaultSettings(pageUid);

    console.log("✅ Default config created successfully");
  } catch (error) {
    console.error("❌ Error creating default config:", error);
  }
}

async function addDefaultColors(pageUid) {
  try {
    // 🎨 Default day colors (matching legacy)
    const defaultColors = {
      mon: "#clr-lgt-grn",
      tue: "#clr-lgt-grn",
      wed: "#clr-grn",
      thu: "#clr-lgt-grn",
      fri: "#clr-lgt-grn",
      sat: "#clr-lgt-ylo",
      sun: "#clr-lgt-brn",
    };

    // 🔍 Find colors section UID
    const colorsUid = await findConfigSectionUid(pageUid, "colors::");
    if (!colorsUid) return;

    // 📝 Add color blocks
    let order = 0;
    for (const [day, color] of Object.entries(defaultColors)) {
      await window.CalendarUtilities.RoamUtils.createBlock(
        colorsUid,
        `${day}:: ${color}`,
        order++
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.error("❌ Error adding default colors:", error);
  }
}

async function addDefaultSettings(pageUid) {
  try {
    // ⚙️ Default settings (matching legacy)
    const defaultSettings = {
      "auto-detect": "yes",
      "show-monthly-todo": "yes",
    };

    // 🔍 Find settings section UID
    const settingsUid = await findConfigSectionUid(pageUid, "settings::");
    if (!settingsUid) return;

    // 📝 Add setting blocks
    let order = 0;
    for (const [setting, value] of Object.entries(defaultSettings)) {
      await window.CalendarUtilities.RoamUtils.createBlock(
        settingsUid,
        `${setting}:: ${value}`,
        order++
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.error("❌ Error adding default settings:", error);
  }
}

async function findConfigSectionUid(pageUid, sectionTitle) {
  try {
    const result = window.roamAlphaAPI.data.q(
      `
      [:find ?uid .
       :in $ ?parent-uid ?section-title
       :where
       [?parent :block/uid ?parent-uid]
       [?parent :block/children ?child]
       [?child :block/string ?section-title]
       [?child :block/uid ?uid]]
    `,
      pageUid,
      sectionTitle
    );

    return result || null;
  } catch (error) {
    console.error(`❌ Error finding section ${sectionTitle}:`, error);
    return null;
  }
}

// ===================================================================
// 🌺 2.0 PAGE DETECTION AND MONITORING - Smart Detection
// ===================================================================

function setupPageDetection() {
  // 👀 Watch for page changes using Calendar Foundation
  const observer = new MutationObserver((mutations) => {
    // 🕐 Debounce page changes
    clearTimeout(window.monthlyViewTimeout);
    window.monthlyViewTimeout = setTimeout(() => {
      checkCurrentPage();
    }, 500);
  });

  // 🎯 Observe changes to the page title area
  const titleElement =
    document.querySelector(".rm-title-display") || document.body;
  observer.observe(titleElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // 📝 Register observer with Calendar Foundation for automatic cleanup
  if (window._calendarRegistry) {
    window._calendarRegistry.observers.push(observer);
  }

  // 🔄 Also listen for popstate events (back/forward navigation)
  const handlePopstate = () => {
    setTimeout(checkCurrentPage, 300);
  };

  window.addEventListener("popstate", handlePopstate);

  // 📝 Register listener with Calendar Foundation for automatic cleanup
  if (window._calendarRegistry) {
    window._calendarRegistry.domListeners.push({
      el: window,
      type: "popstate",
      listener: handlePopstate,
    });
  }
}

async function checkCurrentPage() {
  try {
    // 🔍 Get current page title using improved utilities (now with robust legacy patterns)
    const pageTitle = window.CalendarUtilities.RoamUtils.getCurrentPageTitle();

    if (!pageTitle) {
      console.log("📍 No page title found, removing button");
      removeMonthlyButton();
      return;
    }

    console.log(`📍 Checking page: "${pageTitle}"`);

    // 📅 Check if this is a monthly page using utilities
    if (window.CalendarUtilities.MonthlyUtils.isMonthlyPage(pageTitle)) {
      console.log("📅 Monthly page detected!");

      // 📋 Load configuration
      const config = await loadConfig();

      // ✅ Check if auto-detect is enabled
      if (config.settings["auto-detect"] === "yes") {
        // 🔍 Check if page already has week content
        const hasWeekContent = await checkForExistingWeekContent(pageTitle);

        if (!hasWeekContent) {
          console.log("📅 Showing monthly calendar button");
          showMonthlyButton(pageTitle, config);
        } else {
          console.log(
            "📄 Monthly page already has week content, removing button"
          );
          removeMonthlyButton();
        }
      } else {
        console.log("🔕 Auto-detect disabled, removing button");
        removeMonthlyButton();
      }
    } else {
      console.log("📍 Not a monthly page, removing button");
      removeMonthlyButton();
    }
  } catch (error) {
    console.error("❌ Error checking current page:", error);
  }
}

async function loadConfig() {
  try {
    // 🎨 Default colors
    const defaultColors = {
      mon: "#clr-lgt-grn",
      tue: "#clr-lgt-grn",
      wed: "#clr-grn",
      thu: "#clr-lgt-grn",
      fri: "#clr-lgt-grn",
      sat: "#clr-lgt-ylo",
      sun: "#clr-lgt-brn",
    };

    // ⚙️ Default settings
    const defaultSettings = {
      "auto-detect": "yes",
      "show-monthly-todo": "yes",
    };

    const colors = {};
    const settings = {};

    // 🔍 Load colors individually using utilities
    for (const day of Object.keys(defaultColors)) {
      try {
        const colorValue = window.CalendarUtilities.ConfigUtils.readConfigValue(
          "roam/ext/monthly view/config",
          `${day}::`,
          defaultColors[day]
        );
        colors[day] = colorValue;
      } catch (e) {
        console.log(`Using default color for ${day}:`, e.message);
        colors[day] = defaultColors[day];
      }
    }

    // ⚙️ Load settings individually using utilities
    for (const setting of Object.keys(defaultSettings)) {
      try {
        const settingValue =
          window.CalendarUtilities.ConfigUtils.readConfigValue(
            "roam/ext/monthly view/config",
            `${setting}::`,
            defaultSettings[setting]
          );
        settings[setting] = settingValue;
      } catch (e) {
        console.log(`Using default setting for ${setting}:`, e.message);
        settings[setting] = defaultSettings[setting];
      }
    }

    console.log("📋 Config loaded:", { colors, settings });
    return { colors, settings };
  } catch (error) {
    console.error("❌ Error loading config:", error);
    // 🔄 Return defaults if loading fails
    return {
      colors: {
        mon: "#clr-lgt-grn",
        tue: "#clr-lgt-grn",
        wed: "#clr-grn",
        thu: "#clr-lgt-grn",
        fri: "#clr-lgt-grn",
        sat: "#clr-lgt-ylo",
        sun: "#clr-lgt-brn",
      },
      settings: {
        "auto-detect": "yes",
        "show-monthly-todo": "yes",
      },
    };
  }
}

async function checkForExistingWeekContent(monthlyTitle) {
  try {
    // 🔧 FIXED: Use proven legacy pattern - simple page emptiness check
    const pageUid = window.CalendarUtilities.RoamUtils.getPageUid(monthlyTitle);
    if (!pageUid) {
      console.log(`📄 Page "${monthlyTitle}" doesn't exist - no content`);
      return false; // Page doesn't exist = no content
    }

    // Check if page has any child blocks at all
    const hasChildren = window.roamAlphaAPI.data.q(
      `
      [:find ?child .
       :in $ ?page-uid
       :where
       [?page :block/uid ?page-uid]
       [?page :block/children ?child]]
    `,
      pageUid
    );

    const hasContent = !!hasChildren;
    console.log(`📄 Page "${monthlyTitle}" has content:`, hasContent);
    return hasContent;
  } catch (error) {
    console.error("❌ Error checking for existing content:", error);
    return false;
  }
}

// ===================================================================
// 🦜 3.0 UI BUTTON MANAGEMENT - Professional Interface
// ===================================================================

function showMonthlyButton(pageTitle, config) {
  // 🧹 Remove existing button first
  removeMonthlyButton();

  // 🎨 Create button element
  const button = document.createElement("div");
  button.id = "monthly-view-button";

  // 💎 Button styles (matching legacy styling)
  const buttonStyles = `
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  `;

  button.style.cssText = buttonStyles;

  // 📅 Button content
  button.innerHTML = `
    <span style="font-size: 16px;">📅</span>
    <div>
      <div style="font-weight: 600;">Add monthly view?</div>
      <div style="font-size: 12px; opacity: 0.9;">Click to populate with weekly calendar (Monday weeks)</div>
    </div>
  `;

  // 🎯 Add click handler
  button.addEventListener("click", () =>
    handleMonthlyButtonClick(pageTitle, config)
  );

  // 🌐 Add hover effects
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  });

  // 📝 Add to page
  document.body.appendChild(button);

  // 📝 Register with Calendar Foundation for automatic cleanup
  if (window._calendarRegistry) {
    window._calendarRegistry.elements.push(button);
  }

  console.log("🦜 Monthly calendar button displayed");
}

function removeMonthlyButton() {
  const existingButton = document.getElementById("monthly-view-button");
  if (existingButton) {
    existingButton.remove();
    console.log("🦜 Monthly calendar button removed");
  }
}

// ===================================================================
// 🦝 4.0 CONTENT GENERATION - Smart Monthly Calendar Creation (Monday Weeks)
// ===================================================================

async function handleMonthlyButtonClick(pageTitle, config) {
  const button = document.getElementById("monthly-view-button");
  if (!button) return;

  try {
    console.log(`🚀 Creating monthly calendar for: ${pageTitle}`);

    // 🔄 Show processing state
    button.style.background =
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    button.innerHTML = `
      <span style="font-size: 16px;">⏳</span>
      <div>
        <div style="font-weight: 600;">Creating calendar...</div>
        <div style="font-size: 12px; opacity: 0.9;">Generating Monday-based weeks</div>
      </div>
    `;

    // 📅 Generate the monthly calendar content
    await createMonthlyCalendar(pageTitle, config);

    // ✅ Show success state
    button.style.background =
      "linear-gradient(135deg, #059669 0%, #047857 100%)";
    button.innerHTML = `
      <span style="font-size: 16px;">✅</span>
      <div>
        <div style="font-weight: 600;">Calendar created!</div>
        <div style="font-size: 12px; opacity: 0.9;">Monday-week view is ready</div>
      </div>
    `;

    // 🕐 Remove button after success
    setTimeout(() => {
      removeMonthlyButton();
      console.log(`🚀 Monthly calendar creation complete!`);
    }, 2000);
  } catch (error) {
    console.error("❌ Error creating monthly calendar:", error);

    // 💥 Show error state
    button.style.background =
      "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
    button.innerHTML = `
      <span style="font-size: 16px;">❌</span>
      <div>
        <div style="font-weight: 600;">Creation failed</div>
        <div style="font-size: 12px; opacity: 0.9;">${error.message}</div>
      </div>
    `;

    // 🕐 Remove button after error display
    setTimeout(() => {
      removeMonthlyButton();
    }, 4000);
  }
}

// ===================================================================
// 📅 MONDAY-WEEK CALCULATION UTILITIES
// ===================================================================

function getMondayWeeksInMonth(year, monthIndex) {
  // 📅 Get the first day of the month
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  // 🌅 Find the Monday of the week containing the first day
  const firstMonday = getWeekStartMonday(firstDay);

  // 🌅 Generate all Mondays for weeks that intersect this month
  const weeks = [];
  let currentMonday = new Date(firstMonday);
  let weekNumber = 1;

  // 🔄 Continue until we've covered the entire month
  while (currentMonday <= lastDay) {
    // 📊 Calculate week end (Sunday)
    const weekEnd = new Date(currentMonday);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // 🎯 Only include weeks that intersect with this month
    if (weekEnd >= firstDay && currentMonday <= lastDay) {
      // 📝 Generate week title (date range format: MM/dd yyyy - MM/dd yyyy)
      const startDateStr = formatDateForWeekTitle(currentMonday);
      const endDateStr = formatDateForWeekTitle(weekEnd);
      const weekTitle = `${startDateStr} - ${endDateStr}`;

      weeks.push({
        weekNumber,
        weekTitle,
        startDate: new Date(currentMonday),
        endDate: new Date(weekEnd),
      });

      weekNumber++;
    } else if (currentMonday > lastDay) {
      break;
    }

    // 📅 Move to next Monday
    currentMonday.setDate(currentMonday.getDate() + 7);
  }

  return weeks;
}

function formatDateForWeekTitle(date) {
  // 📅 Format as MM/dd yyyy (e.g., "06/30 2025")
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day} ${year}`;
}

function getWeekStartMonday(date) {
  // 📅 Clone the date to avoid modifying the original
  const result = new Date(date);

  // 🔢 Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = result.getDay();

  // 🎯 Calculate how many days to subtract to get to Monday
  // Sunday (0) -> subtract 6 days
  // Monday (1) -> subtract 0 days
  // Tuesday (2) -> subtract 1 day
  // etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // 📅 Move to the Monday
  result.setDate(result.getDate() - daysToSubtract);

  return result;
}

async function createMonthlyCalendar(monthlyTitle, config) {
  try {
    // 🔍 Parse the monthly title
    const parsed =
      window.CalendarUtilities.MonthlyUtils.parseMonthlyTitle(monthlyTitle);
    if (!parsed) {
      throw new Error("Invalid monthly page title");
    }

    console.log(
      `📅 Generating Monday-week calendar for ${parsed.monthName} ${parsed.year}`
    );

    // 🏗️ Get the monthly page UID
    const pageUid = window.CalendarUtilities.RoamUtils.getPageUid(monthlyTitle);
    if (!pageUid) {
      throw new Error("Could not find monthly page");
    }

    // 📅 Add previous/next month navigation
    await addMonthNavigation(pageUid, parsed);

    // 📋 Add monthly todo section right after navigation (if enabled)
    let currentOrder = 2; // Start after nav blocks
    if (config.settings["show-monthly-todo"] === "yes") {
      console.log("📋 Adding monthly todo section...");
      await addMonthlyTodoSection(pageUid, currentOrder, parsed);
      currentOrder++; // Move order forward for weeks
    }

    // 📅 Get all Monday-based weeks in this month
    const weeks = getMondayWeeksInMonth(parsed.year, parsed.monthIndex);

    console.log(`📊 Found ${weeks.length} Monday-based weeks in month`);

    // 📝 Generate each week as separate blocks (header + children)
    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];

      console.log(`📝 Creating week ${week.weekNumber}: ${week.weekTitle}`);

      // 🌸 Create week header block with ONLY "Week n:" in bold
      const weekHeader = `**Week ${week.weekNumber}:** (#[[${week.weekTitle}]]) #.rm-g`;
      await window.CalendarUtilities.RoamUtils.createBlock(
        pageUid,
        weekHeader,
        currentOrder
      );

      // ⏱️ Wait for header creation
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 🔍 Get the UID of the week header block we just created
      const weekHeaderUid = window.roamAlphaAPI.data.q(
        `
        [:find ?uid .
         :in $ ?page-uid ?header-text
         :where
         [?page :block/uid ?page-uid]
         [?page :block/children ?block]
         [?block :block/string ?header-text]
         [?block :block/uid ?uid]]
      `,
        pageUid,
        weekHeader
      );

      if (weekHeaderUid) {
        // 📅 Generate and create individual day blocks as children
        await createMondayDayBlocks(weekHeaderUid, week, config, parsed);
      }

      currentOrder++;
    }

    console.log("✅ Monday-week calendar created successfully");
  } catch (error) {
    console.error("❌ Error creating Monday-week calendar:", error);
    throw error;
  }
}

async function createMondayDayBlocks(weekHeaderUid, week, config, monthInfo) {
  try {
    // 🗓️ Generate individual day blocks for Monday-based week
    const currentDate = new Date(week.startDate); // This is already a Monday

    // 📅 Monday-first day mapping
    const dayMapping = {
      0: "mon", // Monday = 0 in our system
      1: "tue", // Tuesday = 1
      2: "wed", // Wednesday = 2
      3: "thu", // Thursday = 3
      4: "fri", // Friday = 4
      5: "sat", // Saturday = 5
      6: "sun", // Sunday = 6
    };

    const dayAbbrevMapping = {
      0: "Mo", // Monday = 0
      1: "Tu", // Tuesday = 1
      2: "We", // Wednesday = 2
      3: "Th", // Thursday = 3
      4: "Fr", // Friday = 4
      5: "Sa", // Saturday = 5
      6: "Su", // Sunday = 6
    };

    let dayOrder = 0;

    // 🔄 Iterate through 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      // 📝 Only include days that fall within the current month
      if (currentDate.getMonth() === monthInfo.monthIndex) {
        const dayOfWeek = i; // Direct index since we start on Monday
        const dayAbbrev = dayAbbrevMapping[dayOfWeek];
        const dayNumber = currentDate.getDate();
        const dayKey = dayMapping[dayOfWeek];
        const color = config.colors[dayKey] || "#clr-lgt-grn";
        const dateStr =
          window.CalendarUtilities.DateTimeUtils.formatDateForRoam(currentDate);

        // Format: (day) (day-abbrev) -#color [📆]([[date]])
        const dayBlock = `${dayNumber} (${dayAbbrev}) -${color} [📆]([[${dateStr}]])`;

        // Create individual day block as child of week header
        await window.CalendarUtilities.RoamUtils.createBlock(
          weekHeaderUid,
          dayBlock,
          dayOrder
        );
        dayOrder++;

        // ⏱️ Small delay between day blocks
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`📅 Created ${dayOrder} day blocks for Monday-week`);
  } catch (error) {
    console.error("❌ Error creating Monday day blocks:", error);
  }
}

async function addMonthNavigation(pageUid, monthInfo) {
  try {
    // 📅 Calculate previous and next months
    const prevMonth = new Date(monthInfo.year, monthInfo.monthIndex - 1, 1);
    const nextMonth = new Date(monthInfo.year, monthInfo.monthIndex + 1, 1);

    const prevMonthTitle =
      window.CalendarUtilities.MonthlyUtils.generateMonthlyTitle(prevMonth);
    const nextMonthTitle =
      window.CalendarUtilities.MonthlyUtils.generateMonthlyTitle(nextMonth);

    // 📝 Create navigation blocks with text instead of arrows
    const prevNavBlock = `Last month: [[${prevMonthTitle}]]`;
    const nextNavBlock = `Next month: [[${nextMonthTitle}]]`;

    // Add previous month navigation
    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      prevNavBlock,
      0
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Add next month navigation
    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      nextNavBlock,
      1
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("📅 Added month navigation");
  } catch (error) {
    console.error("❌ Error adding month navigation:", error);
  }
}

async function addMonthlyTodoSection(pageUid, order, monthInfo) {
  try {
    console.log(`📋 Creating simple monthly todo at order ${order}`);

    // 📋 Create simple monthly todo block exactly like legacy
    const todoBlock = `#lin-abv #lin-blw {{[[TODO]]}}  Monthly Tasks Completed for ${monthInfo.monthName}`;

    // Create single todo block
    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      todoBlock,
      order
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`📋 Created legacy-style todo: ${todoBlock}`);
    console.log("✅ Monthly todo section added successfully");
  } catch (error) {
    console.error("❌ Error adding monthly todo section:", error);
  }
}

// ===================================================================
// 🌐 5.0 PLATFORM REGISTRATION - Professional Integration
// ===================================================================

function registerWithPlatform() {
  try {
    // 🎯 Register with Calendar Foundation
    window.CalendarSuite.register(
      "monthly-view-v2",
      {
        // 🔧 Extension API
        checkCurrentPage,
        loadConfig,
        createMonthlyCalendar,
        showMonthlyButton,
        removeMonthlyButton,
        getMondayWeeksInMonth,
        version: "2.0.0",
      },
      {
        // 📋 Extension metadata
        name: "Monthly View v2.0 (Monday Weeks)",
        description:
          "Auto-detects monthly pages and populates with Monday-based weekly calendars",
        version: "2.0.0",
        dependencies: ["calendar-foundation", "calendar-utilities"],
        provides: [
          "monday-week-detection",
          "monday-weekly-calendar-generation",
          "monthly-todo-management",
        ],
        configPage: "roam/ext/monthly view/config",
      }
    );

    // 📝 Add command palette commands
    const commands = [
      {
        label: "Monthly View: Force Check Current Page",
        callback: () => {
          console.log("🔍 Manually checking current page...");
          checkCurrentPage();
        },
      },
      {
        label: "Monthly View: Show Config",
        callback: () => {
          const configPage = "roam/ext/monthly view/config";
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { title: configPage },
          });
        },
      },
      {
        label: "Monthly View: Reload Config",
        callback: async () => {
          console.log("🔄 Reloading configuration...");
          const config = await loadConfig();
          console.log("📋 Config reloaded:", config);
        },
      },
    ];

    // 📝 Register commands
    commands.forEach((cmd) => {
      window.roamAlphaAPI.ui.commandPalette.addCommand(cmd);
      if (window._calendarRegistry) {
        window._calendarRegistry.commands.push(cmd.label);
      }
    });

    console.log(
      "🌐 Monthly View v2.0 (Monday Weeks) registered with Calendar Foundation"
    );
  } catch (error) {
    console.error("❌ Error registering with platform:", error);
  }
}
