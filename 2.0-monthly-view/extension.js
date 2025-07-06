// ===================================================================
// 📅 MONTHLY VIEW EXTENSION v3.0 - COMPLETE FUNCTIONALITY PRESERVED
// Uses centralized button system BUT keeps all original functionality
// All fallbacks, state management, and integrations maintained
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log("📅 Monthly View Extension v3.0 loading...");
    setTimeout(() => {
      initializeMonthlyView();
    }, 500);
  },

  onunload: () => {
    console.log("📅 Monthly View Extension v3.0 unloading...");
    cleanupMonthlyView();
    console.log("✅ Monthly View Extension v3.0 unloaded!");
  },
};

// ===================================================================
// 🎯 DUAL BUTTON SYSTEM - Centralized + Manual Fallback
// ===================================================================

let buttonManager = null;
let manualButton = null;

async function initializeMonthlyView() {
  try {
    console.log("🔧 Initializing Monthly View...");

    // TRY centralized system first
    try {
      buttonManager = new window.SimpleExtensionButtonManager("MonthlyView");
      await buttonManager.initialize();

      // Register with centralized system using sky blue calendar styling
      await buttonManager.registerButton({
        id: "monthly-calendar",
        sections: [
          {
            type: "icon",
            content: "📅",
            tooltip: "Monthly Calendar",
            style: {
              background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
              border: "1px solid #1e3a8a",
              color: "#1e3a8a",
            },
          },
          {
            type: "main",
            content: "Add Monthly View",
            onClick: handleCentralizedButtonClick,
            style: {
              background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
              border: "1px solid #1e3a8a",
              color: "#1e3a8a",
              fontWeight: "600",
            },
          },
        ],
        showOn: ["isEmptyMonthlyPage"],
        stack: "top-right",
        priority: true,
      });

      console.log(
        "✅ Using centralized button system with sky blue calendar styling"
      );
    } catch (error) {
      console.warn(
        "⚠️ Centralized button system not available, using manual fallback:",
        error
      );
      setupManualSystem();
    }

    // ALWAYS set up page detection (central + manual fallback)
    setupPageDetection();

    setTimeout(() => {
      checkCurrentPage();
    }, 100);

    console.log("✅ Monthly View Extension v3.0 loaded successfully!");
    console.log(
      "🎯 Page detection: " +
        (window.CalendarSuite?.pageDetector
          ? "Central system + manual fallback"
          : "Manual fallback only")
    );
  } catch (error) {
    console.error("❌ Error initializing Monthly View:", error);
  }
}

function cleanupMonthlyView() {
  // Clean up centralized button system
  if (buttonManager) {
    buttonManager.cleanup();
    buttonManager = null;
  }

  // Clean up manual button
  removeMonthlyButton();

  // Clean up page detection
  if (window.monthlyViewPageListenerUnregister) {
    window.monthlyViewPageListenerUnregister();
  }

  // Clean up observers and listeners from registry
  if (window._calendarRegistry) {
    window._calendarRegistry.observers.forEach((observer) =>
      observer.disconnect()
    );
    window._calendarRegistry.domListeners.forEach(({ el, type, listener }) => {
      el.removeEventListener(type, listener);
    });
  }
}

// ===================================================================
// 🔄 MANUAL SYSTEM FALLBACK (Preserved exactly from original)
// ===================================================================

function setupManualSystem() {
  console.log("📍 Setting up manual button system as fallback...");
  // This will be handled by page detection -> showMonthlyButton
}

// ===================================================================
// 🎯 PAGE DETECTION - Central system first, manual fallback preserved
// ===================================================================

function setupPageDetection() {
  console.log("👁️ Setting up page detection...");

  if (window.CalendarSuite?.pageDetector?.registerPageListener) {
    console.log("🎯 Using Central Page Detection system...");

    try {
      const unregisterPageListener =
        window.CalendarSuite.pageDetector.registerPageListener(
          (pageTitle) => isMonthlyPage(pageTitle),
          async (pageTitle) => {
            console.log(
              `📅 Monthly page detected via Central System: "${pageTitle}"`
            );
            await handleMonthlyPageDetected(pageTitle);
          }
        );

      window.monthlyViewPageListenerUnregister = unregisterPageListener;
      console.log("✅ Registered with Central Page Detection");
    } catch (error) {
      console.error("❌ Error with central page detection:", error);
      setupManualPageDetection();
    }
  } else {
    console.log(
      "📍 Central page detection not available, using manual fallback..."
    );
    setupManualPageDetection();
  }

  // ALWAYS set up manual fallback as backup
  setupManualPageDetection();
}

function setupManualPageDetection() {
  const observer = new MutationObserver(() => {
    clearTimeout(window.monthlyViewTimeout);
    window.monthlyViewTimeout = setTimeout(() => {
      checkCurrentPage();
    }, 500);
  });

  const titleElement =
    document.querySelector(".rm-title-display") || document.body;
  observer.observe(titleElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  if (window._calendarRegistry) {
    window._calendarRegistry.observers.push(observer);
  }

  const handlePopstate = () => {
    setTimeout(checkCurrentPage, 300);
  };

  window.addEventListener("popstate", handlePopstate);

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
    const pageTitle = getCurrentPageTitle();

    if (!pageTitle) {
      removeMonthlyButton();
      return;
    }

    if (isMonthlyPage(pageTitle)) {
      await handleMonthlyPageDetected(pageTitle);
    } else {
      removeMonthlyButton();
    }
  } catch (error) {
    console.error("❌ Error in page check:", error);
  }
}

async function handleMonthlyPageDetected(pageTitle) {
  try {
    const config = {
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

    const hasWeekContent = await checkForExistingWeekContent(pageTitle);

    if (!hasWeekContent) {
      // Only show manual button if centralized system isn't working
      if (!buttonManager) {
        console.log("📅 Showing manual monthly calendar button");
        showMonthlyButton(pageTitle, config);
      }
    } else {
      console.log(
        "📄 Monthly page already has content, removing manual button"
      );
      removeMonthlyButton();
    }
  } catch (error) {
    console.error("❌ Error handling monthly page:", error);
  }
}

// ===================================================================
// 🎯 BUTTON CLICK HANDLERS - Both centralized and manual
// ===================================================================

async function handleCentralizedButtonClick(context) {
  const { currentPage } = context;
  const pageTitle = currentPage.title;

  await executeCalendarCreation(pageTitle);
}

async function handleManualButtonClick(pageTitle, config) {
  await executeCalendarCreation(pageTitle);
}

async function executeCalendarCreation(pageTitle) {
  try {
    console.log(`🚀 Creating monthly calendar for: ${pageTitle}`);

    const config = {
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

    // Update manual button state if it exists
    updateManualButtonState("loading");

    await createMonthlyCalendar(pageTitle, config);

    // Success state
    updateManualButtonState("success");

    // Auto-remove after 2 seconds
    setTimeout(() => {
      removeMonthlyButton();
    }, 2000);

    console.log("✅ Monthly calendar created successfully!");
  } catch (error) {
    console.error("❌ Error creating monthly calendar:", error);
    updateManualButtonState("error");

    setTimeout(() => {
      removeMonthlyButton();
    }, 4000);
  }
}

// ===================================================================
// 🦜 MANUAL UI MANAGEMENT (Preserved exactly with sky blue styling)
// ===================================================================

function showMonthlyButton(pageTitle, config) {
  removeMonthlyButton();

  const button = document.createElement("div");
  button.id = "monthly-view-button";

  // 🎨 SKY BLUE CALENDAR STYLING (matches centralized system)
  button.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    color: #1e3a8a;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    cursor: pointer;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    transition: all 0.2s ease;
    border: 1.5px solid #1e3a8a;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 360px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  `;

  button.innerHTML = `
    <span style="font-size: 16px;">📅</span>
    <div>
      <div style="font-weight: 600;">Add monthly view?</div>
      <div style="font-size: 12px; opacity: 0.9;">Click to populate with weekly calendar (Monday weeks)</div>
    </div>
  `;

  button.addEventListener("click", () =>
    handleManualButtonClick(pageTitle, config)
  );

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.3)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.2)";
  });

  document.body.appendChild(button);
  manualButton = button;

  if (window._calendarRegistry) {
    window._calendarRegistry.elements.push(button);
  }
}

function removeMonthlyButton() {
  const existingButton = document.getElementById("monthly-view-button");
  if (existingButton) {
    existingButton.remove();
  }
  manualButton = null;
}

function updateManualButtonState(state) {
  const button = document.getElementById("monthly-view-button");
  if (!button) return;

  switch (state) {
    case "loading":
      button.style.background = "linear-gradient(135deg, #fef3c7, #fde68a)";
      button.style.borderColor = "#d97706";
      button.innerHTML = `
        <span style="font-size: 16px;">⏳</span>
        <div>
          <div style="font-weight: 600;">Creating calendar...</div>
          <div style="font-size: 12px; opacity: 0.9;">Generating Monday-based weeks</div>
        </div>
      `;
      break;
    case "success":
      button.style.background = "linear-gradient(135deg, #d1fae5, #a7f3d0)";
      button.style.borderColor = "#059669";
      button.innerHTML = `
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600;">Calendar created!</div>
          <div style="font-size: 12px; opacity: 0.9;">Monday-week view is ready</div>
        </div>
      `;
      break;
    case "error":
      button.style.background = "linear-gradient(135deg, #fee2e2, #fecaca)";
      button.style.borderColor = "#dc2626";
      button.innerHTML = `
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: 600;">Creation failed</div>
          <div style="font-size: 12px; opacity: 0.9;">Check console for details</div>
        </div>
      `;
      break;
  }
}

// ===================================================================
// 🔧 UTILITY FUNCTIONS (All preserved exactly)
// ===================================================================

function isMonthlyPage(pageTitle) {
  if (!pageTitle) return false;
  return /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/.test(
    pageTitle
  );
}

function getCurrentPageTitle() {
  try {
    const hash = window.location.hash;
    if (hash) {
      const match = hash.match(/#\/app\/[^\/]+\/page\/(.+)$/);
      if (match) {
        const encoded = match[1];
        if (encoded.length === 9 && !encoded.includes("-")) {
          return getPageTitleFromUid(encoded);
        }
        return decodeURIComponent(encoded);
      }
    }

    const titleElement = document.querySelector(".rm-title-display");
    return titleElement?.textContent?.trim() || null;
  } catch (error) {
    return null;
  }
}

function getPageTitleFromUid(uid) {
  try {
    const result = window.roamAlphaAPI.data.q(
      `[:find ?title . :in $ ?uid :where [?page :block/uid ?uid] [?page :node/title ?title]]`,
      uid
    );
    return result || null;
  } catch (error) {
    return null;
  }
}

function getPageUid(pageTitle) {
  try {
    const result = window.roamAlphaAPI.data.q(
      `[:find ?uid . :in $ ?title :where [?page :node/title ?title] [?page :block/uid ?uid]]`,
      pageTitle
    );
    return result || null;
  } catch (error) {
    return null;
  }
}

async function createBlock(pageUid, content, order) {
  try {
    const blockUid = window.roamAlphaAPI.util.generateUID();
    await window.roamAlphaAPI.createBlock({
      location: { "parent-uid": pageUid, order: order },
      block: { string: content, uid: blockUid },
    });
    return blockUid;
  } catch (error) {
    throw error;
  }
}

async function checkForExistingWeekContent(monthlyTitle) {
  try {
    const pageUid = getPageUid(monthlyTitle);
    if (!pageUid) {
      console.log(`📄 Page "${monthlyTitle}" doesn't exist - no content`);
      return false;
    }

    const children = window.roamAlphaAPI.data.q(
      `[:find (pull ?child [:block/string]) :in $ ?page-uid :where [?page :block/uid ?page-uid] [?page :block/children ?child]]`,
      pageUid
    );

    console.log(
      `📄 Page "${monthlyTitle}" has ${children ? children.length : 0} blocks:`,
      children
    );

    if (!children || children.length === 0) {
      console.log(`📄 No blocks found - page is empty`);
      return false;
    }

    const hasWeekContent = children.some((child) => {
      const blockText = child[0]?.string || "";
      return (
        blockText.includes("Week") ||
        blockText.includes("Monday") ||
        blockText.includes("TODO")
      );
    });

    console.log(`📄 Page has week-related content:`, hasWeekContent);
    return hasWeekContent;
  } catch (error) {
    console.error("❌ Error checking content:", error);
    return false;
  }
}

function formatDateForRoam(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatted = date.toLocaleDateString("en-US", options);

  return formatted.replace(/(\d+),/, (match, day) => {
    const num = parseInt(day);
    let suffix = "th";
    if (num % 10 === 1 && num !== 11) suffix = "st";
    else if (num % 10 === 2 && num !== 12) suffix = "nd";
    else if (num % 10 === 3 && num !== 13) suffix = "rd";
    return num + suffix + ",";
  });
}

function parseMonthlyTitle(monthlyTitle) {
  try {
    const match = monthlyTitle.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!match) return null;

    const monthName = match[1];
    const year = parseInt(match[2]);

    const monthIndex = [
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
    ].indexOf(monthName);

    if (monthIndex === -1) return null;

    return { monthName, year, monthIndex };
  } catch (error) {
    return null;
  }
}

function generateMonthlyTitle(date) {
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
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// ===================================================================
// 🚀 CALENDAR CREATION (All preserved exactly)
// ===================================================================

async function createMonthlyCalendar(monthlyTitle, config) {
  try {
    const parsed = parseMonthlyTitle(monthlyTitle);
    if (!parsed) {
      throw new Error("Invalid monthly page title");
    }

    console.log(
      `📅 Generating Monday-week calendar for ${parsed.monthName} ${parsed.year}`
    );

    const pageUid = getPageUid(monthlyTitle);
    if (!pageUid) {
      throw new Error("Could not find monthly page");
    }

    await addMonthNavigation(pageUid, parsed);

    let currentOrder = 3;
    if (config.settings["show-monthly-todo"] === "yes") {
      await addMonthlyTodoSection(pageUid, currentOrder, parsed);
      currentOrder++;
    }

    const weeks = getMondayWeeksInMonth(parsed.year, parsed.monthIndex);

    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];
      const weekHeader = `**Week ${week.weekNumber}:** (#[[${week.weekTitle}]]) #.rm-g`;

      await createBlock(pageUid, weekHeader, currentOrder);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const weekHeaderUid = window.roamAlphaAPI.data.q(
        `[:find ?uid . :in $ ?page-uid ?header-text :where [?page :block/uid ?page-uid] [?page :block/children ?block] [?block :block/string ?header-text] [?block :block/uid ?uid]]`,
        pageUid,
        weekHeader
      );

      if (weekHeaderUid) {
        await createMondayDayBlocks(weekHeaderUid, week, config, parsed);
      }
      currentOrder++;
    }

    console.log("✅ Monday-week calendar created successfully");
  } catch (error) {
    console.error("❌ Error creating calendar:", error);
    throw error;
  }
}

function getMondayWeeksInMonth(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstMonday = getWeekStartMonday(firstDay);

  const weeks = [];
  let currentMonday = new Date(firstMonday);
  let weekNumber = 1;

  while (currentMonday <= lastDay) {
    const weekEnd = new Date(currentMonday);
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekEnd >= firstDay && currentMonday <= lastDay) {
      const startDateStr = formatDateForWeekTitle(currentMonday);
      const endDateStr = formatDateForWeekTitle(weekEnd);
      weeks.push({
        weekNumber,
        weekTitle: `${startDateStr} - ${endDateStr}`,
        startDate: new Date(currentMonday),
        endDate: new Date(weekEnd),
      });
      weekNumber++;
    } else if (currentMonday > lastDay) {
      break;
    }
    currentMonday.setDate(currentMonday.getDate() + 7);
  }
  return weeks;
}

function formatDateForWeekTitle(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}/${day} ${date.getFullYear()}`;
}

function getWeekStartMonday(date) {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  result.setDate(result.getDate() - daysToSubtract);
  return result;
}

async function createMondayDayBlocks(weekHeaderUid, week, config, monthInfo) {
  const currentDate = new Date(week.startDate);
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

  for (let i = 0; i < 7; i++) {
    if (currentDate.getMonth() === monthInfo.monthIndex) {
      const dayKey = dayMapping[i];
      const color = config.colors[dayKey] || "#clr-lgt-grn";
      const dateStr = formatDateForRoam(currentDate);
      const dayBlock = `${currentDate.getDate()} (${
        dayAbbrevMapping[i]
      }) -${color} [📆]([[${dateStr}]])`;

      await createBlock(weekHeaderUid, dayBlock, dayOrder);
      dayOrder++;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

async function addMonthNavigation(pageUid, monthInfo) {
  const prevMonth = new Date(monthInfo.year, monthInfo.monthIndex - 1, 1);
  const nextMonth = new Date(monthInfo.year, monthInfo.monthIndex + 1, 1);
  const prevMonthTitle = generateMonthlyTitle(prevMonth);
  const nextMonthTitle = generateMonthlyTitle(nextMonth);

  await createBlock(pageUid, `Last month: [[${prevMonthTitle}]]`, 0);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await createBlock(pageUid, `Next month: [[${nextMonthTitle}]]`, 1);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await createBlock(pageUid, `Yearly view: [[${monthInfo.year}]]`, 2);
}

async function addMonthlyTodoSection(pageUid, order, monthInfo) {
  const todoBlock = `#lin-abv #lin-blw {{[[TODO]]}} Monthly Tasks Completed for ${monthInfo.monthName}`;
  await createBlock(pageUid, todoBlock, order);
}
