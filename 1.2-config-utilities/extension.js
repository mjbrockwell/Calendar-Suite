// ===================================================================
// 🎯 UNIFIED CONFIG UTILS EXTENSION v1.0 - STANDALONE MICRO-EXTENSION
// Single responsibility: Configuration management for Calendar Suite
// Loads FIRST to provide config services to all other extensions
// ===================================================================

const extension = {
  onload: ({ extensionAPI }) => {
    console.log("🎯 Unified Config Utils Extension v1.0 loading...");

    // ===================================================================
    // 1.0 🍎 CORE CONFIGURATION UTILITIES - Cascading Block Logic
    // ===================================================================

    const UnifiedConfigUtils = {
      // 🌟 MASTER CONFIG PAGE
      CONFIG_PAGE_TITLE: "roam/ext/calendar suite/config",

      // 🛠️ TIMEOUT AND ERROR HANDLING
      OPERATION_TIMEOUT: 5000, // 5 seconds max per operation
      MAX_RETRIES: 3,

      // ===================================================================
      // 1.1 🍎 CORE UTILITIES - Based on proven cascading pattern
      // ===================================================================

      async getOrCreatePageUid(title) {
        try {
          // Check if page exists
          let pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${title}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (pageUid) {
            console.log(`📋 Config page exists: ${title}`);
            return pageUid;
          }

          // Create page if missing
          pageUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.page.create({
            page: { title, uid: pageUid },
          });

          console.log(`✅ Created config page: ${title}`);
          return pageUid;
        } catch (error) {
          throw new Error(
            `Failed to get/create page "${title}": ${error.message}`
          );
        }
      },

      async createBlock(parentUid, content, order = null) {
        try {
          if (order === null) {
            // Get current child count for auto-ordering
            const childCount =
              window.roamAlphaAPI.q(`
              [:find (count ?child) :where 
               [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]]
            `)?.[0]?.[0] || 0;
            order = childCount;
          }

          const blockUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": parentUid, order: order },
            block: { uid: blockUid, string: content },
          });

          return blockUid;
        } catch (error) {
          throw new Error(
            `Failed to create block "${content}": ${error.message}`
          );
        }
      },

      async updateBlock(blockUid, newContent) {
        try {
          await window.roamAlphaAPI.data.block.update({
            block: { uid: blockUid, string: newContent },
          });
          return true;
        } catch (error) {
          throw new Error(
            `Failed to update block ${blockUid}: ${error.message}`
          );
        }
      },

      findBlockWithSearch(parentUid, searchPattern) {
        try {
          // Try exact match first
          const exactMatch = window.roamAlphaAPI.q(`
            [:find (pull ?child [:block/uid :block/string])
             :where 
             [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]
             [?child :block/string "${searchPattern}"]]
          `);

          if (exactMatch.length > 0) {
            const found = exactMatch[0][0];
            return {
              uid: found[":block/uid"] || found.uid,
              string: found[":block/string"] || found.string,
            };
          }

          // Try starts-with match
          const startsWithResults = window.roamAlphaAPI.q(`
            [:find (pull ?child [:block/uid :block/string])
             :where 
             [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]
             [?child :block/string ?string] 
             [(clojure.string/starts-with? ?string "${searchPattern}")]]
          `);

          if (startsWithResults.length > 0) {
            const found = startsWithResults[0][0];
            return {
              uid: found[":block/uid"] || found.uid,
              string: found[":block/string"] || found.string,
            };
          }

          return null;
        } catch (error) {
          console.warn(`🔍 Search error for "${searchPattern}":`, error);
          return null;
        }
      },

      // ===================================================================
      // 1.2 🎯 FLEXIBLE SECTION READING - Handles all 3 formats
      // ===================================================================

      findSectionBlock(pageUid, section) {
        const headingVariants = [
          `**${section} config:**`, // Bold (preferred)
          `"${section} config:"`, // Quoted (acceptable)
          `${section} config::`, // Property (legacy support)
          `**${section}:**`, // Short bold
          `${section}:`, // Plain
        ];

        for (const variant of headingVariants) {
          const sectionBlock = this.findBlockWithSearch(pageUid, variant);
          if (sectionBlock) {
            console.log(
              `📋 Found section "${section}" using format: ${variant}`
            );
            return sectionBlock;
          }
        }

        return null;
      },

      // ===================================================================
      // 1.3 🚀 CASCADING CONFIG OPERATIONS - Proven pattern
      // ===================================================================

      async writeConfigValue(section, key, value) {
        const startTime = Date.now();
        const workingOn = { step: null, uid: null, content: null };
        let loopCount = 0;

        console.log(`🛠️ Writing config: ${section}.${key} = ${value}`);

        while (Date.now() - startTime < this.OPERATION_TIMEOUT) {
          loopCount++;

          try {
            // LEVEL 1: Ensure config page exists
            const pageUid = await this.getOrCreatePageUid(
              this.CONFIG_PAGE_TITLE
            );

            // LEVEL 2: Find/create section heading
            let sectionBlock = this.findSectionBlock(pageUid, section);

            if (!sectionBlock) {
              if (workingOn.step !== "section" || workingOn.uid !== pageUid) {
                workingOn.step = "section";
                workingOn.uid = pageUid;
                workingOn.content = `**${section} config:**`; // Always use safe format
                await this.createBlock(pageUid, workingOn.content);
              }
              continue; // Restart loop to verify creation
            }

            // LEVEL 3: Find/create config key under section
            const isYvTag = key.match(/^yv\d+$/);
            const colonPattern = isYvTag ? "::" : ":";
            const configPattern = `${key}${colonPattern}`;
            let configBlock = this.findBlockWithSearch(
              sectionBlock.uid,
              configPattern
            );

            if (!configBlock) {
              if (
                workingOn.step !== "config" ||
                workingOn.uid !== sectionBlock.uid
              ) {
                workingOn.step = "config";
                workingOn.uid = sectionBlock.uid;
                workingOn.content = `${key}${colonPattern} ${value}`;
                await this.createBlock(sectionBlock.uid, workingOn.content);
              }
              continue; // Restart loop to verify creation
            }

            // LEVEL 4: Update existing config value
            const newContent = `${key}${colonPattern} ${value}`;
            if (configBlock.string !== newContent) {
              await this.updateBlock(configBlock.uid, newContent);
            }

            console.log(
              `✅ Config written: ${section}.${key} = ${value} (${loopCount} loops, ${
                Date.now() - startTime
              }ms)`
            );
            return true;
          } catch (error) {
            console.error(`🛠️ Loop ${loopCount} error:`, error.message);
            await new Promise((resolve) => setTimeout(resolve, 100)); // Brief pause
          }
        }

        throw new Error(
          `Timeout writing ${section}.${key} after ${this.OPERATION_TIMEOUT}ms (${loopCount} loops)`
        );
      },

      readConfigValue(section, key, defaultValue = null) {
        try {
          console.log(`🔍 Reading config: ${section}.${key}`);

          // Get config page
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) {
            console.log(
              `📋 Config page doesn't exist, returning default: ${defaultValue}`
            );
            return defaultValue;
          }

          // Find section
          const sectionBlock = this.findSectionBlock(pageUid, section);
          if (!sectionBlock) {
            console.log(
              `📋 Section "${section}" not found, returning default: ${defaultValue}`
            );
            return defaultValue;
          }

          // Find config key
          const isYvTag = key.match(/^yv\d+$/);
          const colonPattern = isYvTag ? "::" : ":";
          const configPattern = `${key}${colonPattern}`;
          const configBlock = this.findBlockWithSearch(
            sectionBlock.uid,
            configPattern
          );
          if (!configBlock) {
            console.log(
              `📋 Config "${key}" not found in section "${section}", returning default: ${defaultValue}`
            );
            return defaultValue;
          }

          // Extract value
          const regexPattern = isYvTag
            ? `${key}::\\s*(.+)$`
            : `${key}:\\s*(.+)$`;
          const match = configBlock.string.match(new RegExp(regexPattern));
          if (match) {
            const value = match[1].trim();
            console.log(`✅ Config read: ${section}.${key} = ${value}`);
            return value;
          }

          console.log(
            `📋 Could not parse value from "${configBlock.string}", returning default: ${defaultValue}`
          );
          return defaultValue;
        } catch (error) {
          console.warn(`⚠️ Error reading config ${section}.${key}:`, error);
          return defaultValue;
        }
      },

      // ===================================================================
      // 1.4 🎨 MASTER CONFIG INITIALIZATION
      // ===================================================================

      async initializeMasterConfig() {
        console.log("🎨 Initializing master config page...");

        try {
          const pageUid = await this.getOrCreatePageUid(this.CONFIG_PAGE_TITLE);

          // Check if already initialized
          const existingBlocks = window.roamAlphaAPI.q(`
            [:find ?string :where 
             [?page :block/uid "${pageUid}"] [?child :block/page ?page]
             [?child :block/string ?string]]
          `);

          const hasConfig = existingBlocks.some(
            ([string]) =>
              string.includes("config:") || string.includes("Calendar Suite")
          );

          if (hasConfig) {
            console.log("📋 Master config already initialized");
            return pageUid;
          }

          // Create master structure
          const headerUid = await this.createBlock(
            pageUid,
            "🗓️ **Calendar Suite Configuration** - One source of truth for all calendar extensions"
          );

          const instructionsUid = await this.createBlock(
            pageUid,
            "Instructions: Configure settings below by section. Extensions will read from this page automatically."
          );

          // Create enhanced default sections with complete configs
          const defaultConfigs = [
            {
              section: "Weekly",
              configs: [
                ["automatic guidance enabled", "yes"],
                ["add week count within the year", "yes"],
                ["include query for `[[Morning Intentions]]`", "yes"],
                ["add query for `[[Evening Reflections]]`", "yes"],
                ["add Plus-Minus-Next journal", "yes"],
              ],
            },
            {
              section: "Monthly",
              configs: [
                ["Colors", ""],
                ["Settings", ""],
              ],
              subsections: {
                Colors: [
                  ["mon", "#clr-lgt-grn"],
                  ["tue", "#clr-lgt-grn"],
                  ["wed", "#clr-grn"],
                  ["thu", "#clr-lgt-grn"],
                  ["fri", "#clr-lgt-grn"],
                  ["sat", "#clr-lgt-ylo"],
                  ["sun", "#clr-lgt-brn"],
                ],
                Settings: [
                  ["automatic guidance enabled", "yes"],
                  ["show-monthly-todo", "yes"],
                ],
              },
            },
            {
              section: "Yearly",
              configs: [
                ["yv0", "General Events,3a5199,e6efff,🔵"],
                ["yv1", "Family Birthdays,c41d69,ffe6f0,🎂"],
                ["yv2", "Other Birthdays,9e3b8c,f9ebff,🟪"],
                ["yv3", "Deadlines,a05600,fff4e5,📌"],
                ["yv4", "Holidays,0d6e37,e5fff0,🎉"],
                ["yv5", "Meetings,5a3095,f0e6ff,👥"],
                ["yv6", "For Fun,ad4600,fff2e0,🥳"],
                ["yv7", "Health + Wellness,20a39a,e0f7f5,💪"],
                ["yv8", "Travel + Transport,1e88e5,e3f2fd,✈️"],
                ["yv9", "Family,e57373,ffebee,👪"],
              ],
            },
          ];

          for (const sectionData of defaultConfigs) {
            // Create section heading with safe format
            const sectionUid = await this.createBlock(
              pageUid,
              `**${sectionData.section} config:**`
            );

            // Handle regular configs
            for (const [key, value] of sectionData.configs) {
              if (
                sectionData.subsections &&
                (key === "Colors" || key === "Settings")
              ) {
                // Create subsection header
                const subsectionUid = await this.createBlock(
                  sectionUid,
                  `${key}:`
                );

                // Add subsection configs
                const subsectionConfigs = sectionData.subsections[key];
                for (const [subKey, subValue] of subsectionConfigs) {
                  await this.createBlock(
                    subsectionUid,
                    `${subKey}: ${subValue}`
                  );
                }
              } else {
                // Regular config item - use double colon for yv tags, single for others
                const colonPattern = key.match(/^yv\d+$/) ? "::" : ":";
                await this.createBlock(
                  sectionUid,
                  `${key}${colonPattern} ${value}`
                );
              }
            }
          }

          console.log(
            "✅ Enhanced master config initialized with complete structure"
          );
          console.log(
            "📋 Weekly: Automatic guidance, queries, journal features"
          );
          console.log(
            "📋 Monthly: Day colors + settings with two-level structure"
          );
          console.log("📋 Yearly: Complete yv0-yv9 tag configurations");
          return pageUid;
        } catch (error) {
          throw new Error(
            `Failed to initialize master config: ${error.message}`
          );
        }
      },

      // ===================================================================
      // 1.5 🧪 CONVENIENCE METHODS & TESTING
      // ===================================================================

      // Enhanced Weekly config methods
      getWeeklyPageReference(configKey) {
        const rawValue = this.readConfigValue("Weekly", configKey, null);
        if (!rawValue) return null;

        // Strip backticks to get clean page name
        const match = rawValue.match(/`\[\[([^\]]+)\]\]`/);
        return match ? match[1] : rawValue;
      },

      isWeeklyFeatureEnabled(feature) {
        const value = this.readConfigValue("Weekly", feature, "no");
        return value.toLowerCase() === "yes" || value.toLowerCase() === "true";
      },

      getYearlyTags() {
        // Read all yv tags directly (yv0 through yv9)
        const tags = [];
        for (let i = 0; i <= 9; i++) {
          const tagId = `yv${i}`;
          const tagConfig = this.getYearlyTagConfig(tagId);
          if (tagConfig) {
            tags.push(tagId);
          }
        }
        return tags.length > 0
          ? tags
          : [
              "yv0",
              "yv1",
              "yv2",
              "yv3",
              "yv4",
              "yv5",
              "yv6",
              "yv7",
              "yv8",
              "yv9",
            ];
      },

      // Enhanced Monthly config methods for two-level structure
      getDayColor(day) {
        try {
          // Find Monthly config section
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) return null;

          const monthlySection = this.findSectionBlock(pageUid, "Monthly");
          if (!monthlySection) return null;

          // Find Colors subsection
          const colorsBlock = this.findBlockWithSearch(
            monthlySection.uid,
            "Colors:"
          );
          if (!colorsBlock) return null;

          // Find specific day
          const dayBlock = this.findBlockWithSearch(colorsBlock.uid, `${day}:`);
          if (!dayBlock) return null;

          const match = dayBlock.string.match(new RegExp(`${day}:\\s*(.+)$`));
          return match ? match[1].trim() : null;
        } catch (error) {
          console.warn(`⚠️ Error reading day color for ${day}:`, error);
          return null;
        }
      },

      getMonthlySettings() {
        try {
          // Find Monthly config section
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) return {};

          const monthlySection = this.findSectionBlock(pageUid, "Monthly");
          if (!monthlySection) return {};

          // Find Settings subsection
          const settingsBlock = this.findBlockWithSearch(
            monthlySection.uid,
            "Settings:"
          );
          if (!settingsBlock) return {};

          // Read all settings under Settings subsection
          const settingsQuery = window.roamAlphaAPI.q(`
            [:find ?string :where 
             [?parent :block/uid "${settingsBlock.uid}"] [?child :block/parents ?parent]
             [?child :block/string ?string]]
          `);

          const settings = {};
          settingsQuery.forEach(([string]) => {
            const match = string.match(/^([^:]+):\s*(.+)$/);
            if (match) {
              settings[match[1].trim()] = match[2].trim();
            }
          });

          return settings;
        } catch (error) {
          console.warn("⚠️ Error reading monthly settings:", error);
          return {};
        }
      },

      getYearlyTagConfig(tagId) {
        const configString = this.readConfigValue("Yearly", tagId, null);
        if (!configString) return null;

        const parts = configString.split(",").map((part) => part.trim());
        if (parts.length >= 4) {
          return {
            id: tagId,
            name: parts[0],
            textColor: parts[1],
            bgColor: parts[2],
            emoji: parts[3],
          };
        }
        return null;
      },

      // Status and debugging
      getConfigStatus() {
        try {
          const pageUid = window.roamAlphaAPI.q(`
            [:find ?uid :where [?e :node/title "${this.CONFIG_PAGE_TITLE}"] [?e :block/uid ?uid]]
          `)?.[0]?.[0];

          if (!pageUid) {
            return { exists: false, sections: [], totalConfigs: 0 };
          }

          const allBlocks = window.roamAlphaAPI.q(`
            [:find ?string :where 
             [?page :block/uid "${pageUid}"] [?child :block/page ?page]
             [?child :block/string ?string]]
          `);

          const sections = allBlocks.filter(([string]) =>
            string.includes("config:")
          ).length;
          const configs = allBlocks.filter(([string]) => {
            // Count lines that have config patterns (key: value or key:: value) but not section headers
            return (
              string.includes("::") ||
              (string.includes(":") &&
                !string.includes("config:") &&
                !string.endsWith(":"))
            );
          }).length;

          return {
            exists: true,
            pageUid,
            totalBlocks: allBlocks.length,
            sections,
            totalConfigs: configs,
            version: "1.0",
          };
        } catch (error) {
          return { exists: false, error: error.message };
        }
      },

      // Test the enhanced cascading logic
      async testCascadingLogic() {
        console.log("🧪 Testing enhanced cascading block logic...");

        try {
          // Test writing basic configs
          await this.writeConfigValue("Test", "sample-setting", "test-value");
          await this.writeConfigValue(
            "Test",
            "another-setting",
            "another-value"
          );
          await this.writeConfigValue("AnotherTest", "cross-section", "works");

          // Test reading them back
          const value1 = this.readConfigValue("Test", "sample-setting");
          const value2 = this.readConfigValue("Test", "another-setting");
          const value3 = this.readConfigValue("AnotherTest", "cross-section");

          // Test enhanced convenience methods
          const yearlyTags = this.getYearlyTags();
          const monthlySettings = this.getMonthlySettings();
          const mondayColor = this.getDayColor("mon");

          const basicTest =
            value1 === "test-value" &&
            value2 === "another-value" &&
            value3 === "works";
          const enhancedTest =
            yearlyTags.length >= 10 && typeof monthlySettings === "object";

          const success = basicTest && enhancedTest;

          console.log(
            `🧪 Basic cascading logic: ${basicTest ? "✅ PASSED" : "❌ FAILED"}`
          );
          console.log(
            `🧪 Enhanced config structure: ${
              enhancedTest ? "✅ PASSED" : "❌ FAILED"
            }`
          );
          console.log(
            `🧪 Overall test result: ${success ? "✅ PASSED" : "❌ FAILED"}`
          );

          if (success) {
            console.log(
              `📋 Found ${yearlyTags.length} yearly tags, ${
                Object.keys(monthlySettings).length
              } monthly settings`
            );
            console.log(`🎨 Monday color: ${mondayColor || "not found"}`);
          }

          return success;
        } catch (error) {
          console.error("🧪 Enhanced test failed:", error);
          return false;
        }
      },
    };

    // ===================================================================
    // 2.0 🌟 EXTENSION LIFECYCLE & REGISTRATION
    // ===================================================================

    // Make globally available immediately
    window.UnifiedConfigUtils = UnifiedConfigUtils;

    // Register with Calendar Foundation if available
    if (window.CalendarSuite) {
      window.CalendarSuite.registerUtility(
        "UnifiedConfigUtils",
        UnifiedConfigUtils
      );
      console.log("🔗 Registered with Calendar Foundation");
    }

    // Initialize master config page
    setTimeout(async () => {
      try {
        await UnifiedConfigUtils.initializeMasterConfig();
        console.log("✅ Master config initialization complete");
      } catch (error) {
        console.error("❌ Failed to initialize master config:", error);
      }
    }, 1000);

    // Add command palette commands for testing and management
    const commands = [
      {
        label: "Config: Initialize Master Config",
        callback: async () => {
          try {
            await UnifiedConfigUtils.initializeMasterConfig();
            alert("✅ Master config initialized successfully!");
          } catch (error) {
            alert(`❌ Error: ${error.message}`);
          }
        },
      },
      {
        label: "Config: Test Cascading Logic",
        callback: async () => {
          const success = await UnifiedConfigUtils.testCascadingLogic();
          alert(success ? "✅ Test passed!" : "❌ Test failed - check console");
        },
      },
      {
        label: "Config: Show Status",
        callback: () => {
          const status = UnifiedConfigUtils.getConfigStatus();
          console.log("📋 Config Status:", status);
          if (status.exists) {
            alert(
              `📋 Config Status:\n• Page exists: ✅\n• Sections: ${status.sections}\n• Total configs: ${status.totalConfigs}`
            );
          } else {
            alert("📋 Config page doesn't exist yet");
          }
        },
      },
      {
        label: "Config: Open Config Page",
        callback: () => {
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { title: UnifiedConfigUtils.CONFIG_PAGE_TITLE },
          });
        },
      },
    ];

    // Add commands to Roam
    commands.forEach((cmd) => {
      extensionAPI.ui.commandPalette.addCommand(cmd);
    });

    console.log("🎯 Unified Config Utils Extension v1.0 loaded successfully!");
    console.log(
      `📋 Master config page: [[${UnifiedConfigUtils.CONFIG_PAGE_TITLE}]]`
    );
    console.log("🧪 Test with: Cmd+P → 'Config: Test Cascading Logic'");
    console.log("🔧 Available globally as: window.UnifiedConfigUtils");
  },

  onunload: () => {
    console.log("🧹 Unified Config Utils Extension unloading...");

    // Cleanup global reference
    if (window.UnifiedConfigUtils) {
      delete window.UnifiedConfigUtils;
    }

    console.log("✅ Unified Config Utils Extension unloaded");
  },
};

// Export for Roam Research extension system
export default extension;
