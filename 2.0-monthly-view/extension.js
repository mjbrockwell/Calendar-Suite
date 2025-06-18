// ===================================================================
// 📅 MONTHLY VIEW EXTENSION v2.2 - CLEAN & SIMPLE
// No dependencies, no debugging, just works!
// Central event listener integration + inline utilities
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log("📅 Monthly View Extension v2.2 loading...");
    setTimeout(() => {
      initializeMonthlyView();
    }, 500);
  },

  onunload: () => {
    console.log("📅 Monthly View Extension v2.2 unloading...");
    removeMonthlyButton();
    if (window.monthlyViewPageListenerUnregister) {
      window.monthlyViewPageListenerUnregister();
    }
    console.log("✅ Monthly View Extension v2.2 unloaded!");
  },
};

// ===================================================================
// 🔧 INLINE UTILITIES - Everything we need, nothing we don't
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
// 🚀 MAIN INITIALIZATION
// ===================================================================

async function initializeMonthlyView() {
  try {
    console.log("🔧 Initializing Monthly View...");

    setupPageDetection();

    setTimeout(() => {
      checkCurrentPage();
    }, 100);

    console.log("✅ Monthly View Extension v2.2 loaded successfully!");
    console.log(
      "🎯 Central event listener integration: " +
        (window.CalendarSuite?.pageDetector
          ? "ACTIVE (96% polling reduction)"
          : "Manual fallback")
    );
  } catch (error) {
    console.error("❌ Error initializing Monthly View:", error);
  }
}

// ===================================================================
// 🎯 PAGE DETECTION - Central system first, manual fallback
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
      console.log(
        "✅ Registered with Central Page Detection - NO MORE POLLING!"
      );
      return;
    } catch (error) {
      console.error("❌ Error with central page detection:", error);
    }
  }

  console.log("📍 Using manual page detection fallback...");
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

    console.log(`📍 Checking page: "${pageTitle}"`);

    if (isMonthlyPage(pageTitle)) {
      console.log("📅 Monthly page detected!");
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
      console.log("📅 Showing monthly calendar button");
      showMonthlyButton(pageTitle, config);
    } else {
      console.log("📄 Monthly page already has content, removing button");
      removeMonthlyButton();
    }
  } catch (error) {
    console.error("❌ Error handling monthly page:", error);
  }
}

async function checkForExistingWeekContent(monthlyTitle) {
  try {
    const pageUid = getPageUid(monthlyTitle);
    if (!pageUid) {
      console.log(`📄 Page "${monthlyTitle}" doesn't exist - no content`);
      return false;
    }

    // Check if page has any child blocks
    const children = window.roamAlphaAPI.data.q(
      `[:find (pull ?child [:block/string]) :in $ ?page-uid :where [?page :block/uid ?page-uid] [?page :block/children ?child]]`,
      pageUid
    );

    console.log(
      `📄 Page "${monthlyTitle}" has ${children ? children.length : 0} blocks:`,
      children
    );

    // If no children, definitely no content
    if (!children || children.length === 0) {
      console.log(`📄 No blocks found - page is empty`);
      return false;
    }

    // Check if any blocks contain week-related content
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

// ===================================================================
// 🦜 UI MANAGEMENT
// ===================================================================

function showMonthlyButton(pageTitle, config) {
  removeMonthlyButton();

  const button = document.createElement("div");
  button.id = "monthly-view-button";

  button.style.cssText = `
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

  button.innerHTML = `
    <span style="font-size: 16px;">📅</span>
    <div>
      <div style="font-weight: 600;">Add monthly view?</div>
      <div style="font-size: 12px; opacity: 0.9;">Click to populate with weekly calendar (Monday weeks)</div>
    </div>
  `;

  button.addEventListener("click", () =>
    handleMonthlyButtonClick(pageTitle, config)
  );

  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  });

  document.body.appendChild(button);

  if (window._calendarRegistry) {
    window._calendarRegistry.elements.push(button);
  }
}

function removeMonthlyButton() {
  const existingButton = document.getElementById("monthly-view-button");
  if (existingButton) {
    existingButton.remove();
  }
}

// ===================================================================
// 🚀 CALENDAR CREATION
// ===================================================================

async function handleMonthlyButtonClick(pageTitle, config) {
  const button = document.getElementById("monthly-view-button");
  if (!button) return;

  try {
    console.log(`🚀 Creating monthly calendar for: ${pageTitle}`);

    button.style.background =
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    button.innerHTML = `
      <span style="font-size: 16px;">⏳</span>
      <div>
        <div style="font-weight: 600;">Creating calendar...</div>
        <div style="font-size: 12px; opacity: 0.9;">Generating Monday-based weeks</div>
      </div>
    `;

    await createMonthlyCalendar(pageTitle, config);

    button.style.background =
      "linear-gradient(135deg, #059669 0%, #047857 100%)";
    button.innerHTML = `
      <span style="font-size: 16px;">✅</span>
      <div>
        <div style="font-weight: 600;">Calendar created!</div>
        <div style="font-size: 12px; opacity: 0.9;">Monday-week view is ready</div>
      </div>
    `;

    setTimeout(() => {
      removeMonthlyButton();
      console.log(`🚀 Monthly calendar creation complete!`);
    }, 2000);
  } catch (error) {
    console.error("❌ Error creating monthly calendar:", error);

    button.style.background =
      "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
    button.innerHTML = `
      <span style="font-size: 16px;">❌</span>
      <div>
        <div style="font-weight: 600;">Creation failed</div>
        <div style="font-size: 12px; opacity: 0.9;">Check console for details</div>
      </div>
    `;

    setTimeout(() => {
      removeMonthlyButton();
    }, 4000);
  }
}

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
