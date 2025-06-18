// ===================================================================
// 📅 MONTHLY VIEW EXTENSION v2.1.1 - Clean Unified Config + FIXED Color Keys
// Auto-detects monthly pages and offers to populate with numbered week calendars
// Built on Calendar Foundation + Unified Config architecture
// FIXED: Uses flat config keys (color-mon, color-tue) instead of hierarchical (colors.mon)
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📅 Monthly View Extension v2.1.1 loading (Fixed Color Keys)..."
    );

    // 🔧 VERIFY DEPENDENCIES - Hard requirements (no fallbacks!)
    if (!window.CalendarSuite) {
      throw new Error(
        "❌ Calendar Foundation required! Please load Calendar Foundation first."
      );
    }

    if (!window.CalendarUtilities) {
      throw new Error(
        "❌ Calendar Utilities required! Please load Calendar Utilities first."
      );
    }

    if (!window.UnifiedConfigUtils) {
      throw new Error(
        "❌ Unified Config Utils required! Please load Unified Config Utils first."
      );
    }

    // 🌳 INITIALIZE EXTENSION
    initializeMonthlyView();

    console.log("✅ Monthly View Extension v2.1.1 loaded (Fixed Color Keys)!");
  },

  onunload: () => {
    console.log("📅 Monthly View Extension v2.1.1 unloading...");

    // Clean up any floating buttons
    removeMonthlyButton();

    // The Calendar Foundation will handle automatic cleanup
    console.log("✅ Monthly View Extension v2.1.1 unloaded!");
  },
};

// ===================================================================
// 🌳 1.0 INITIALIZATION - Clean Modern Setup
// ===================================================================

async function initializeMonthlyView() {
  try {
    // 📋 Initialize unified configuration
    await initializeUnifiedConfig();

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

async function initializeUnifiedConfig() {
  try {
    console.log("📋 Initializing MonthlyView unified config...");

    // 🎨 Set up default colors in unified config (FIXED: Use flat keys)
    const defaultColors = {
      mon: "#clr-lgt-grn",
      tue: "#clr-lgt-grn",
      wed: "#clr-grn",
      thu: "#clr-lgt-grn",
      fri: "#clr-lgt-grn",
      sat: "#clr-lgt-ylo",
      sun: "#clr-lgt-brn",
    };

    // ⚙️ Set up default settings in unified config
    const defaultSettings = {
      "auto-detect": "yes",
      "show-monthly-todo": "yes",
    };

    // 🏗️ Initialize MonthlyView section with defaults (FIXED: Use flat keys like "color-mon")
    for (const [day, color] of Object.entries(defaultColors)) {
      const existing = window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        `color-${day}`,
        null
      );
      if (!existing) {
        await window.CalendarUtilities.ConfigUtils.writeToSection(
          "MonthlyView",
          `color-${day}`,
          color
        );
      }
    }

    for (const [setting, value] of Object.entries(defaultSettings)) {
      const existing = window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        `setting-${setting}`,
        null
      );
      if (!existing) {
        await window.CalendarUtilities.ConfigUtils.writeToSection(
          "MonthlyView",
          `setting-${setting}`,
          value
        );
      }
    }

    console.log("✅ MonthlyView unified config initialized with flat keys");
  } catch (error) {
    console.error("❌ Error initializing unified config:", error);
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
    // 🔍 Get current page title
    const pageTitle = window.CalendarUtilities.RoamUtils.getCurrentPageTitle();

    if (!pageTitle) {
      console.log("📍 No page title found, removing button");
      removeMonthlyButton();
      return;
    }

    console.log(`📍 Checking page: "${pageTitle}"`);

    // 📅 Check if this is a monthly page
    if (window.CalendarUtilities.MonthlyUtils.isMonthlyPage(pageTitle)) {
      console.log("📅 Monthly page detected!");

      // 📋 Load configuration from unified config
      const config = await loadUnifiedConfig();

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

async function loadUnifiedConfig() {
  try {
    // 🎨 Load colors from unified config (FIXED: Use flat keys)
    const colors = {
      mon: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-mon",
        "#clr-lgt-grn"
      ),
      tue: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-tue",
        "#clr-lgt-grn"
      ),
      wed: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-wed",
        "#clr-grn"
      ),
      thu: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-thu",
        "#clr-lgt-grn"
      ),
      fri: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-fri",
        "#clr-lgt-grn"
      ),
      sat: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-sat",
        "#clr-lgt-ylo"
      ),
      sun: window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "color-sun",
        "#clr-lgt-brn"
      ),
    };

    // ⚙️ Load settings from unified config (FIXED: Use flat keys)
    const settings = {
      "auto-detect": window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "setting-auto-detect",
        "yes"
      ),
      "show-monthly-todo": window.CalendarUtilities.ConfigUtils.readFromSection(
        "MonthlyView",
        "setting-show-monthly-todo",
        "yes"
      ),
    };

    console.log("📋 Unified config loaded with flat keys:", {
      colors,
      settings,
    });
    return { colors, settings };
  } catch (error) {
    console.error("❌ Error loading unified config:", error);
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
      settings: { "auto-detect": "yes", "show-monthly-todo": "yes" },
    };
  }
}

async function checkForExistingWeekContent(monthlyTitle) {
  try {
    // 📄 Simple page emptiness check
    const pageUid = window.CalendarUtilities.RoamUtils.getPageUid(monthlyTitle);
    if (!pageUid) {
      console.log(`📄 Page "${monthlyTitle}" doesn't exist - no content`);
      return false;
    }

    // Check if page has any child blocks
    const hasChildren = window.roamAlphaAPI.data.q(
      `[:find ?child . :in $ ?page-uid :where [?page :block/uid ?page-uid] [?page :block/children ?child]]`,
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

  // 💎 Button styles
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
    let currentOrder = 3; // Start after nav blocks (includes yearly view)
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
        `[:find ?uid . :in $ ?page-uid ?header-text :where [?page :block/uid ?page-uid] [?page :block/children ?block] [?block :block/string ?header-text] [?block :block/uid ?uid]]`,
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
      0: "mon",
      1: "tue",
      2: "wed",
      3: "thu",
      4: "fri",
      5: "sat",
      6: "sun",
    };
    const dayAbbrevMapping = {
      0: "Mo",
      1: "Tu",
      2: "We",
      3: "Th",
      4: "Fr",
      5: "Sa",
      6: "Su",
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

    // 📝 Create navigation blocks
    const prevNavBlock = `Last month: [[${prevMonthTitle}]]`;
    const nextNavBlock = `Next month: [[${nextMonthTitle}]]`;
    const yearNavBlock = `Yearly view: [[${monthInfo.year}]]`;

    // Add navigation
    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      prevNavBlock,
      0
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      nextNavBlock,
      1
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      yearNavBlock,
      2
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("📅 Added month navigation with yearly view");
  } catch (error) {
    console.error("❌ Error adding month navigation:", error);
  }
}

async function addMonthlyTodoSection(pageUid, order, monthInfo) {
  try {
    console.log(`📋 Creating monthly todo at order ${order}`);

    // 📋 Create monthly todo block
    const todoBlock = `#lin-abv #lin-blw {{[[TODO]]}}  Monthly Tasks Completed for ${monthInfo.monthName}`;

    // Create todo block
    await window.CalendarUtilities.RoamUtils.createBlock(
      pageUid,
      todoBlock,
      order
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`📋 Created todo: ${todoBlock}`);
    console.log("✅ Monthly todo section added successfully");
  } catch (error) {
    console.error("❌ Error adding monthly todo section:", error);
  }
}

// ===================================================================
// 🌐 5.0 PLATFORM REGISTRATION - Modern Integration
// ===================================================================

function registerWithPlatform() {
  try {
    // 🎯 Register with Calendar Foundation
    window.CalendarSuite.register(
      "monthly-view-v2.1",
      {
        // 🔧 Extension API
        checkCurrentPage,
        loadUnifiedConfig,
        createMonthlyCalendar,
        showMonthlyButton,
        removeMonthlyButton,
        getMondayWeeksInMonth,
        version: "2.1.1",
      },
      {
        // 📋 Extension metadata
        name: "Monthly View v2.1 (Clean Unified)",
        description:
          "Auto-detects monthly pages and populates with Monday-based weekly calendars using unified config",
        version: "2.1.0",
        dependencies: [
          "calendar-foundation",
          "calendar-utilities",
          "unified-config-utils",
        ],
        provides: [
          "monday-week-detection",
          "monday-weekly-calendar-generation",
          "monthly-todo-management",
          "unified-config-integration",
        ],
        configSection: "MonthlyView",
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
        label: "Monthly View: Show Unified Config",
        callback: () => {
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { title: "roam/js/unified-config" },
          });
        },
      },
      {
        label: "Monthly View: Reload Unified Config",
        callback: async () => {
          console.log("🔄 Reloading unified configuration...");
          const config = await loadUnifiedConfig();
          console.log("📋 Unified config reloaded:", config);
        },
      },
      {
        label: "Monthly View: Test Config Integration",
        callback: async () => {
          console.log("🧪 Testing unified config integration...");

          // Test read
          const mondayColor =
            window.CalendarUtilities.ConfigUtils.readFromSection(
              "MonthlyView",
              "colors.mon",
              "not-found"
            );
          console.log(`📖 Monday color: ${mondayColor}`);

          // Test write
          await window.CalendarUtilities.ConfigUtils.writeToSection(
            "MonthlyView",
            "test.timestamp",
            new Date().toISOString()
          );
          console.log("📝 Test write completed");

          // Show config status
          const configStatus =
            window.CalendarUtilities.ConfigUtils.getConfigStatus();
          console.log("🎯 Config system status:", configStatus);
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
      "🌐 Monthly View v2.1.1 (Fixed Color Keys) registered with Calendar Foundation"
    );
  } catch (error) {
    console.error("❌ Error registering with platform:", error);
  }
}
