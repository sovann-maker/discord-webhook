"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Function to get git commits for a specific date
const getGitCommitsForDate = async (date) => {
  try {
    // Format date for git log (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Git command to get commits for specific date
    const gitCommand = `git log --since="${formattedDate} 00:00:00" --until="${formattedDate} 23:59:59" --pretty=format:"%H|%an|%ad|%s" --date=format:"%H:%M:%S"`;

    const { stdout, stderr } = await execAsync(gitCommand);

    if (stderr) {
      console.log("Git stderr:", stderr);
    }

    if (!stdout.trim()) {
      return {
        date: formattedDate,
        commits: [],
        summary: "No commits found for this date",
      };
    }

    // Parse git log output
    const commits = stdout
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

    // Generate summary
    const summary = generateSummary(commits);

    return {
      date: formattedDate,
      commits,
      summary,
    };
  } catch (error) {
    console.error("Error getting git commits:", error);
    throw new Error(`Failed to get git commits: ${error.message}`);
  }
};

// Function to generate a summary from commits
const generateSummary = (commits) => {
  if (commits.length === 0) {
    return "No commits found for this date";
  }

  if (commits.length === 1) {
    return commits[0].message;
  }

  // Group commits by type (feat, fix, docs, etc.)
  const commitTypes = {
    feat: [],
    fix: [],
    docs: [],
    style: [],
    refactor: [],
    test: [],
    chore: [],
    other: [],
  };

  commits.forEach((commit) => {
    const message = commit.message.toLowerCase();
    if (message.startsWith("feat:")) commitTypes.feat.push(commit);
    else if (message.startsWith("fix:")) commitTypes.fix.push(commit);
    else if (message.startsWith("docs:")) commitTypes.docs.push(commit);
    else if (message.startsWith("style:")) commitTypes.style.push(commit);
    else if (message.startsWith("refactor:")) commitTypes.refactor.push(commit);
    else if (message.startsWith("test:")) commitTypes.test.push(commit);
    else if (message.startsWith("chore:")) commitTypes.chore.push(commit);
    else commitTypes.other.push(commit);
  });

  // Build summary
  const summaryParts = [];
  if (commitTypes.feat.length > 0)
    summaryParts.push(`${commitTypes.feat.length} new features`);
  if (commitTypes.fix.length > 0)
    summaryParts.push(`${commitTypes.fix.length} bug fixes`);
  if (commitTypes.docs.length > 0)
    summaryParts.push(`${commitTypes.docs.length} documentation updates`);
  if (commitTypes.refactor.length > 0)
    summaryParts.push(`${commitTypes.refactor.length} refactoring tasks`);
  if (commitTypes.test.length > 0)
    summaryParts.push(`${commitTypes.test.length} test updates`);
  if (commitTypes.other.length > 0)
    summaryParts.push(`${commitTypes.other.length} other changes`);

  return summaryParts.join(", ") || `${commits.length} commits completed`;
};

// Function to create Discord embed for git report
const createGitReportEmbed = (reportData) => {
  const { date, commits, summary } = reportData;

  const embed = {
    title: `📊 Daily Development Report - ${date}`,
    color: commits.length > 0 ? 0x00ff00 : 0xff6b6b, // Green if commits, red if none
    description: summary,
    fields: [],
    footer: {
      text: `Total commits: ${commits.length}`,
    },
    timestamp: new Date().toISOString(),
  };

  if (commits.length > 0) {
    // Add commit details
    commits.forEach((commit, index) => {
      embed.fields.push({
        name: `Commit ${index + 1} (${commit.time})`,
        value: `\`${commit.hash}\` - ${commit.message}`,
        inline: false,
      });
    });
  } else {
    embed.fields.push({
      name: "No Activity",
      value: "No commits were made on this date.",
      inline: false,
    });
  }

  return embed;
};

export const generateDailyReport = async (prevState, formData) => {
  try {
    const rawFormEntries = Object.fromEntries(formData);
    const reportDate =
      rawFormEntries?.date || new Date().toISOString().split("T")[0];

    console.log("Generating report for date:", reportDate);

    // Get git commits for the date
    const reportData = await getGitCommitsForDate(reportDate);

    // Create Discord embed
    const embed = createGitReportEmbed(reportData);

    // Send to Discord
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Daily Dev Report Bot",
        avatar_url: "https://i.imgur.com/mDKlggm.png",
        content: `📈 **Daily Development Report Generated**`,
        embeds: [embed],
      }),
    });

    return {
      success: true,
      message: `Daily report for ${reportData.date} sent successfully! Found ${reportData.commits.length} commits.`,
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
