"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Constants
const GIT_LOG_FORMAT = "%H|%an|%ad|%s";
const COMMITS_PER_EMBED = 10;
const MAX_EMBEDS_PER_MESSAGE = 10;
const DISCORD_FIELD_VALUE_LIMIT = 1024;

// Utility functions
const formatDate = (date) => new Date(date).toISOString().split("T")[0];

const parseGitLogOutput = (stdout) => {
  if (!stdout.trim()) return [];

  return stdout
    .trim()
    .split("\n")
    .map((line) => {
      const [hash, author, time, message] = line.split("|");
      return {
        hash: hash.substring(0, 8), // Short hash
        author,
        time,
        message: message.trim(),
      };
    });
};

const buildGitCommand = (
  startDate,
  endDate,
  repoPath,
  dateFormat = "%H:%M:%S"
) => {
  const since = `${startDate} 00:00:00`;
  const until = `${endDate} 23:59:59`;
  const command = `git log --since="${since}" --until="${until}" --pretty=format:"${GIT_LOG_FORMAT}" --date=format:"${dateFormat}"`;

  // Clean the path and handle Windows paths properly
  if (!repoPath) return command;
  
  // Remove any existing quotes and clean the path
  const cleanPath = repoPath.replace(/['"]/g, '').trim();
  
  // For Windows paths, use proper escaping
  const escapedPath = cleanPath.replace(/\\/g, '\\\\');
  
  return `cd "${escapedPath}" && ${command}`;
};

// Function to get git commits from multiple repositories
const getGitCommitsFromMultipleRepos = async (
  startDate,
  endDate,
  repoPaths = [],
  isDateRange = false,
  author = null
) => {
  try {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const dateFormat = isDateRange ? "%Y-%m-%d %H:%M:%S" : "%H:%M:%S";

    let allCommits = [];
    const repoResults = [];

    for (const repoPath of repoPaths) {
      // Clean the path by removing quotes and trimming
      const cleanRepoPath = repoPath.replace(/['"]/g, '').trim();
      if (!cleanRepoPath) continue;

      try {
        let gitCommand = buildGitCommand(
          formattedStartDate,
          formattedEndDate,
          cleanRepoPath,
          dateFormat
        );

        // Add author filter if specified
        if (author && author.trim()) {
          gitCommand = gitCommand.replace(
            "git log",
            `git log --author="${author.trim()}"`
          );
        }

        const { stdout, stderr } = await execAsync(gitCommand);

        if (stderr) {
          console.log(`Git stderr for ${cleanRepoPath}:`, stderr);
        }

        const commits = parseGitLogOutput(stdout);

        // Add repository info to each commit
        const commitsWithRepo = commits.map((commit) => ({
          ...commit,
          repository: cleanRepoPath,
          repoName: cleanRepoPath
            .split(/[\\\/]/)
            .pop(), // Get folder name
        }));

        allCommits = [...allCommits, ...commitsWithRepo];

        repoResults.push({
          path: cleanRepoPath,
          name: cleanRepoPath
            .split(/[\\\/]/)
            .pop(),
          commitCount: commits.length,
          success: true,
        });

        console.log(`✅ Processed ${cleanRepoPath}: ${commits.length} commits`);
      } catch (error) {
        console.error(`❌ Error processing ${cleanRepoPath}:`, error);
        repoResults.push({
          path: cleanRepoPath,
          name: cleanRepoPath
            .split(/[\\\/]/)
            .pop(),
          commitCount: 0,
          success: false,
          error: error.message,
        });
      }
    }

    // Sort commits by time (newest first)
    allCommits.sort((a, b) => {
      const timeA = a.time.includes(" ") ? a.time.split(" ")[1] : a.time;
      const timeB = b.time.includes(" ") ? b.time.split(" ")[1] : b.time;
      return timeB.localeCompare(timeA);
    });

    const summary = generateSummary(allCommits);

    const baseResult = {
      commits: allCommits,
      summary,
      repositories: repoResults,
      totalRepos: repoPaths.length,
      successfulRepos: repoResults.filter((r) => r.success).length,
    };

    if (isDateRange) {
      return {
        ...baseResult,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        isDateRange: true,
      };
    } else {
      return {
        ...baseResult,
        date: formattedStartDate,
      };
    }
  } catch (error) {
    console.error("Error getting git commits from multiple repos:", error);
    throw new Error(`Failed to get git commits: ${error.message}`);
  }
};

// Function to get git commits (unified for both single date and date range)
const getGitCommits = async (
  startDate,
  endDate,
  repoPath = null,
  isDateRange = false,
  author = null
) => {
  // If repoPath is an array or contains multiple paths, use multi-repo function
  if (
    Array.isArray(repoPath) ||
    (typeof repoPath === "string" && repoPath.includes(","))
  ) {
    const paths = Array.isArray(repoPath)
      ? repoPath.map(p => p.replace(/['"]/g, '').trim())
      : repoPath
          .split(",")
          .map((p) => p.replace(/['"]/g, '').trim())
          .filter((p) => p.length > 0);
    return getGitCommitsFromMultipleRepos(
      startDate,
      endDate,
      paths,
      isDateRange,
      author
    );
  }

  try {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Use different date format for date range vs single date
    const dateFormat = isDateRange ? "%Y-%m-%d %H:%M:%S" : "%H:%M:%S";
    let gitCommand = buildGitCommand(
      formattedStartDate,
      formattedEndDate,
      repoPath,
      dateFormat
    );

    // Add author filter if specified
    if (author && author.trim()) {
      gitCommand = gitCommand.replace(
        "git log",
        `git log --author="${author.trim()}"`
      );
    }

    const { stdout, stderr } = await execAsync(gitCommand);

    if (stderr) {
      console.log("Git stderr:", stderr);
    }

    const commits = parseGitLogOutput(stdout);
    const summary = generateSummary(commits);

    const baseResult = {
      commits,
      summary,
    };

    if (isDateRange) {
      return {
        ...baseResult,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        isDateRange: true,
      };
    } else {
      return {
        ...baseResult,
        date: formattedStartDate,
      };
    }
  } catch (error) {
    console.error("Error getting git commits:", error);
    throw new Error(`Failed to get git commits: ${error.message}`);
  }
};

// Wrapper functions for backward compatibility
const getGitCommitsForDate = (date, repoPath = null, author = null) =>
  getGitCommits(date, date, repoPath, false, author);

const getGitCommitsForDateRange = (
  startDate,
  endDate,
  repoPath = null,
  author = null
) => getGitCommits(startDate, endDate, repoPath, true, author);

// Utility functions
const truncateForDiscord = (text, maxLength = DISCORD_FIELD_VALUE_LIMIT) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

const categorizeCommit = (message) => {
  const lowerMessage = message.toLowerCase();
  const commitTypes = {
    feat: "feat:",
    fix: "fix:",
    docs: "docs:",
    style: "style:",
    refactor: "refactor:",
    test: "test:",
    chore: "chore:",
  };

  for (const [type, prefix] of Object.entries(commitTypes)) {
    if (lowerMessage.startsWith(prefix)) return type;
  }
  return "other";
};

const generateSummary = (commits) => {
  if (commits.length === 0) return "No commits found for this date";
  if (commits.length === 1) return commits[0].message;

  // Group commits by type
  const commitTypes = commits.reduce((acc, commit) => {
    const type = categorizeCommit(commit.message);
    if (!acc[type]) acc[type] = [];
    acc[type].push(commit);
    return acc;
  }, {});

  // Build summary
  const summaryParts = [];
  const typeLabels = {
    feat: "new features",
    fix: "bug fixes",
    docs: "documentation updates",
    refactor: "refactoring tasks",
    test: "test updates",
    other: "other changes",
  };

  Object.entries(commitTypes).forEach(([type, commits]) => {
    if (commits.length > 0 && typeLabels[type]) {
      summaryParts.push(`${commits.length} ${typeLabels[type]}`);
    }
  });

  return summaryParts.join(", ") || `${commits.length} commits completed`;
};

// Discord embed creation utilities
const createEmbedBase = (
  title,
  color,
  summary,
  commits,
  isDateRange,
  page = 0,
  totalPages = 1
) => ({
  title: page === 0 ? title : `${title} (Page ${page + 1}/${totalPages})`,
  color,
  description: page === 0 ? summary : `Page ${page + 1} of ${totalPages}`,
  fields: [],
  footer: {
    text: `Total commits: ${commits.length} | Page ${page + 1}/${totalPages}`,
  },
  timestamp: new Date().toISOString(),
});

const createCommitField = (commit, globalIndex) => {
  const timeStr = commit.time.includes(" ")
    ? commit.time.split(" ")[1]
    : commit.time;

  // Add repository info if available
  const repoInfo = commit.repoName ? ` (${commit.repoName})` : "";

  return {
    name: `📝 ${timeStr}${repoInfo}`,
    value: `**${commit.message}**\n\`${commit.hash}\` by **${commit.author}**`,
    inline: false,
  };
};

const createGitReportEmbeds = (reportData) => {
  const { date, startDate, endDate, commits, summary, isDateRange } =
    reportData;

  // Determine title based on report type
  const title = isDateRange
    ? `📊 Development Report - ${startDate} to ${endDate}`
    : `📊 Daily Development Report - ${date}`;

  if (commits.length === 0) {
    // No commits - single embed
    return [
      createEmbedBase(
        title,
        0xff6b6b, // Red for no commits
        summary,
        commits,
        isDateRange
      ),
    ];
  }

  // Group commits by date for better organization
  const commitsByDate = commits.reduce((acc, commit) => {
    const commitDate = commit.time.includes(" ")
      ? commit.time.split(" ")[0]
      : date;
    if (!acc[commitDate]) {
      acc[commitDate] = [];
    }
    acc[commitDate].push(commit);
    return acc;
  }, {});

  // Create embeds with date-based organization
  const embeds = [];
  let currentEmbed = createEmbedBase(
    title,
    0x00ff00,
    summary,
    commits,
    isDateRange
  );
  let fieldCount = 0;

  for (const [commitDate, dateCommits] of Object.entries(commitsByDate)) {
    // Add date header
    const dateField = {
      name: `📅 **${commitDate}**`,
      value: `*${dateCommits.length} commit${
        dateCommits.length > 1 ? "s" : ""
      } on this date*`,
      inline: false,
    };

    // Check if adding this date would exceed Discord's field limit
    if (fieldCount + 1 + dateCommits.length > 25) {
      embeds.push(currentEmbed);
      currentEmbed = createEmbedBase(
        `${title} (Continued)`,
        0x00ff00,
        `Continued from previous page`,
        commits,
        isDateRange
      );
      fieldCount = 0;
    }

    currentEmbed.fields.push(dateField);
    fieldCount++;

    // Add commits for this date
    dateCommits.forEach((commit) => {
      if (fieldCount >= 25) {
        embeds.push(currentEmbed);
        currentEmbed = createEmbedBase(
          `${title} (Continued)`,
          0x00ff00,
          `Continued from previous page`,
          commits,
          isDateRange
        );
        fieldCount = 0;
      }

      currentEmbed.fields.push(createCommitField(commit));
      fieldCount++;
    });
  }

  // Add the last embed if it has fields
  if (currentEmbed.fields.length > 0) {
    embeds.push(currentEmbed);
  }

  return embeds;
};

// Discord sending utilities
const sendDiscordMessage = async (
  embeds,
  isFirstBatch = false,
  totalEmbeds = 1
) => {
  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Daily Dev Report Bot",
      avatar_url: "https://i.imgur.com/mDKlggm.png",
      content: isFirstBatch
        ? `📈 **Daily Development Report Generated** (${totalEmbeds} page${
            totalEmbeds > 1 ? "s" : ""
          })`
        : null,
      embeds,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Discord API error (${response.status}):`, errorText);
    throw new Error(`Discord API error: ${response.status} - ${errorText}`);
  }

  return response;
};

const sendEmbedsToDiscord = async (embeds) => {
  const totalEmbeds = embeds.length;
  let sentPages = 0;

  for (let i = 0; i < totalEmbeds; i += MAX_EMBEDS_PER_MESSAGE) {
    const embedBatch = embeds.slice(i, i + MAX_EMBEDS_PER_MESSAGE);
    const isFirstBatch = i === 0;
    const batchNumber = Math.floor(i / MAX_EMBEDS_PER_MESSAGE) + 1;
    const totalBatches = Math.ceil(totalEmbeds / MAX_EMBEDS_PER_MESSAGE);

    try {
      await sendDiscordMessage(embedBatch, isFirstBatch, totalEmbeds);
      sentPages += embedBatch.length;
      console.log(`Sent page batch ${batchNumber}/${totalBatches}`);

      // Add delay between messages to avoid rate limiting
      if (i + MAX_EMBEDS_PER_MESSAGE < totalEmbeds) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to send embed batch ${batchNumber}:`, error);
      throw new Error(`Failed to send to Discord: ${error.message}`);
    }
  }

  return sentPages;
};

const generateSuccessMessage = (reportData, author = null) => {
  const totalPages = Math.ceil(reportData.commits.length / COMMITS_PER_EMBED);
  const pageText =
    totalPages > 1
      ? ` across ${totalPages} page${totalPages > 1 ? "s" : ""}`
      : "";

  const authorText = author ? ` for author "${author}"` : "";

  // Add repository information
  let repoText = "";
  if (reportData.repositories && reportData.repositories.length > 0) {
    const successfulRepos = reportData.repositories.filter((r) => r.success);
    if (successfulRepos.length > 1) {
      repoText = ` from ${successfulRepos.length} repositories`;
    } else if (successfulRepos.length === 1) {
      repoText = ` from repository "${successfulRepos[0].name}"`;
    }
  }

  if (reportData.isDateRange) {
    return `Date range report from ${reportData.startDate} to ${reportData.endDate}${authorText}${repoText} sent successfully! Found ${reportData.commits.length} commits${pageText}.`;
  } else {
    return `Daily report for ${reportData.date}${authorText}${repoText} sent successfully! Found ${reportData.commits.length} commits${pageText}.`;
  }
};

export const generateDailyReport = async (prevState, formData) => {
  try {
    const rawFormEntries = Object.fromEntries(formData);
    const reportType = rawFormEntries?.reportType || "single";
    const repoPath = rawFormEntries?.repoPath || null;
    const author = rawFormEntries?.author || null;

    // Clean repository paths if they exist
    let cleanRepoPath = null;
    if (repoPath) {
      if (typeof repoPath === 'string' && repoPath.includes(',')) {
        // Multiple paths separated by commas
        cleanRepoPath = repoPath
          .split(',')
          .map(p => p.replace(/['"]/g, '').trim())
          .filter(p => p.length > 0);
      } else if (Array.isArray(repoPath)) {
        // Already an array
        cleanRepoPath = repoPath.map(p => p.replace(/['"]/g, '').trim()).filter(p => p.length > 0);
      } else if (typeof repoPath === 'string') {
        // Single path
        cleanRepoPath = repoPath.replace(/['"]/g, '').trim();
      }
    }

    // Simulate processing time for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log(`Processing ${reportType} report...`);
    if (author) {
      console.log(`Filtering by author: ${author}`);
    }

    // Get report data based on type
    const reportData =
      reportType === "single"
        ? await getGitCommitsForDate(
            rawFormEntries?.date || formatDate(new Date()),
            cleanRepoPath,
            author
          )
        : await getGitCommitsForDateRange(
            rawFormEntries?.startDate || formatDate(new Date()),
            rawFormEntries?.endDate || formatDate(new Date()),
            cleanRepoPath,
            author
          );

    if (cleanRepoPath) {
      console.log("Using repository path:", cleanRepoPath);
    }

    const totalPages = Math.ceil(reportData.commits.length / COMMITS_PER_EMBED);
    console.log(
      `Found ${reportData.commits.length} commits, creating ${totalPages} embed pages...`
    );

    // Create and send Discord embeds
    const embeds = createGitReportEmbeds(reportData);
    await sendEmbedsToDiscord(embeds);

    return {
      success: true,
      message: generateSuccessMessage(reportData, author),
      reportData,
    };
  } catch (err) {
    console.log(err.message);
    return {
      success: false,
      message: `Failed to generate report: ${err.message}`,
    };
  }
};
