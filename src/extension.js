// extension.js - Enhanced Focus Time Tracker with Advanced Features
const vscode = require("vscode");
const path = require("path");
const { spawn } = require("child_process");

let focusSession = null;
let statusBarItem = null;
let breakReminder = null;
let motivationInterval = null;
let webviewPanel = null;
let soundEnabled = true;

// Motivational quotes for notifications
const motivationalQuotes = [
  "Great progress! Keep the momentum going! 🚀",
  "You're in the zone! Stay focused! 💪",
  "Excellent work! Your dedication shows! ⭐",
  "Keep pushing forward! You've got this! 🔥",
  "Amazing focus! You're unstoppable today! 🎯",
  "Outstanding effort! Success is within reach! 🏆",
  "Brilliant work! Your future self will thank you! ✨",
  "Incredible dedication! You're making it happen! 💎",
];

// Break activity suggestions
const breakActivities = [
  "🚶‍♀️ Take a 5-minute walk around your workspace",
  "💧 Drink a glass of water and stay hydrated",
  "👀 Practice the 20-20-20 rule: look 20 feet away for 20 seconds",
  "🧘‍♂️ Do some deep breathing exercises",
  "💪 Stretch your neck, shoulders, and wrists",
  "🌱 Water your plants or step outside for fresh air",
  "☕ Make a healthy snack or herbal tea",
  "📱 Send a quick message to someone you care about",
];

function activate(context) {
  console.log("Focus Time Tracker Enhanced is now active!");

  // Create enhanced status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(clock) 🎯 Ready";
  statusBarItem.tooltip = "Focus Time Tracker - Click to start";
  statusBarItem.command = "focusTimeTracker.toggleSession";
  statusBarItem.backgroundColor = new vscode.ThemeColor(
    "statusBarItem.prominentBackground"
  );
  statusBarItem.show();

  // Register all commands
  const commands = [
    vscode.commands.registerCommand(
      "focusTimeTracker.toggleSession",
      toggleFocusSession
    ),
    vscode.commands.registerCommand(
      "focusTimeTracker.showStats",
      showAdvancedStats
    ),
    vscode.commands.registerCommand(
      "focusTimeTracker.openSettings",
      openSettings
    ),
    vscode.commands.registerCommand(
      "focusTimeTracker.quickBreak",
      startQuickBreak
    ),
    vscode.commands.registerCommand(
      "focusTimeTracker.showMotivation",
      showMotivationalMessage
    ),
    vscode.commands.registerCommand("focusTimeTracker.resetStats", resetStats),
    vscode.commands.registerCommand(
      "focusTimeTracker.showDashboard",
      showLiveDashboard
    ),
  ];

  context.subscriptions.push(...commands, statusBarItem);
  loadSessionData();

  // Show welcome message for new users
  if (isFirstTime()) {
    showWelcomeMessage();
  }
}

function toggleFocusSession() {
  if (focusSession && focusSession.active) {
    stopFocusSession();
  } else {
    startFocusSession();
  }
}

function startFocusSession() {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const sessionDuration = config.get("sessionDuration", 25);
  const breakDuration = config.get("breakDuration", 5);
  const enableMotivation = config.get("enableMotivation", true);

  focusSession = {
    active: true,
    startTime: new Date(),
    duration: sessionDuration * 60 * 1000,
    breakDuration: breakDuration * 60 * 1000,
    sessionType: "focus",
  };

  updateStatusBar();
  scheduleBreakReminder();
  saveSessionData();

  // Show gorgeous start notification
  showGorgeousNotification(
    `🎯 Focus Session Started!`,
    `${sessionDuration} minutes of deep focus ahead. Let's make it count! 💪`,
    ["Show Dashboard", "Got it!"],
    (selection) => {
      if (selection === "Show Dashboard") {
        showLiveDashboard();
      }
    }
  );

  // Enable motivational messages during session
  if (enableMotivation) {
    startMotivationalMessages();
  }

  playSound("start");
}

function stopFocusSession(completed = true) {
  if (!focusSession) return;

  const endTime = new Date();
  const actualDuration = endTime - focusSession.startTime;
  const completionPercentage = Math.min(
    100,
    (actualDuration / focusSession.duration) * 100
  );

  // Save session to history
  saveSessionToHistory(
    focusSession.startTime,
    actualDuration,
    completionPercentage,
    focusSession.sessionType
  );

  // Clear timers
  clearBreakReminder();
  clearMotivationalMessages();

  const wasActive = focusSession.active;
  focusSession = null;
  updateStatusBar();

  if (completed && wasActive) {
    playSound("complete");
    showSessionCompleteNotification(actualDuration, completionPercentage);
  } else {
    playSound("stop");
    showGorgeousNotification(
      "⏹️ Session Stopped",
      `Focus time: ${Math.round(
        actualDuration / 60000
      )} minutes. Every minute counts! 🌟`,
      ["Show Stats", "OK"]
    );
  }
}

function showSessionCompleteNotification(duration, completionPercentage) {
  const minutes = Math.round(duration / 60000);
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const autoBreak = config.get("autoBreak", true);

  let message = `🎉 Amazing! ${minutes} minutes of focused work completed!`;
  if (completionPercentage >= 100) {
    message += " Perfect session! 🏆";
  } else if (completionPercentage >= 80) {
    message += " Great effort! 🌟";
  }

  const buttons = autoBreak
    ? ["Take Smart Break", "Continue Working", "Show Stats"]
    : ["Take Break", "New Session", "Show Stats"];

  showGorgeousNotification(
    "🏆 Session Complete!",
    message,
    buttons,
    (selection) => {
      if (selection === "Take Smart Break" || selection === "Take Break") {
        startSmartBreak();
      } else if (selection === "New Session") {
        setTimeout(() => startFocusSession(), 1000);
      } else if (selection === "Continue Working") {
        setTimeout(() => startFocusSession(), 2000);
      } else if (selection === "Show Stats") {
        showAdvancedStats();
      }
    }
  );
}

function startSmartBreak() {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const breakDuration = config.get("breakDuration", 5);
  const randomActivity =
    breakActivities[Math.floor(Math.random() * breakActivities.length)];

  focusSession = {
    active: true,
    startTime: new Date(),
    duration: breakDuration * 60 * 1000,
    sessionType: "break",
  };

  updateStatusBar();
  playSound("break");

  showGorgeousNotification(
    "☕ Smart Break Time!",
    `Time for a ${breakDuration}-minute break!\n\n💡 Suggested activity:\n${randomActivity}`,
    ["Start Next Session", "Extend Break", "Got it!"],
    (selection) => {
      if (selection === "Start Next Session") {
        setTimeout(() => {
          stopFocusSession(false);
          startFocusSession();
        }, breakDuration * 60 * 1000);
      } else if (selection === "Extend Break") {
        extendBreak();
      }
    }
  );

  // Auto-complete break
  setTimeout(() => {
    if (focusSession && focusSession.sessionType === "break") {
      stopFocusSession(false);
      showBreakCompleteNotification();
    }
  }, breakDuration * 60 * 1000);
}

function extendBreak() {
  if (focusSession && focusSession.sessionType === "break") {
    focusSession.duration += 5 * 60 * 1000; // Add 5 more minutes
    showGorgeousNotification(
      "⏰ Break Extended",
      "Added 5 more minutes to your break. Enjoy! 😌",
      ["Thanks!"]
    );
  }
}

function showBreakCompleteNotification() {
  playSound("break_end");
  showGorgeousNotification(
    "⚡ Break Complete!",
    "You're refreshed and ready! Time to dive back into focused work! 🚀",
    ["Start Focus Session", "Not Yet"],
    (selection) => {
      if (selection === "Start Focus Session") {
        setTimeout(() => startFocusSession(), 1000);
      }
    }
  );
}

function startQuickBreak() {
  const randomActivity =
    breakActivities[Math.floor(Math.random() * breakActivities.length)];
  showGorgeousNotification(
    "⚡ Quick Break!",
    `Take a 2-minute micro-break:\n\n${randomActivity}`,
    ["Done!", "Another Suggestion"],
    (selection) => {
      if (selection === "Another Suggestion") {
        startQuickBreak();
      }
    }
  );
  playSound("notification");
}

function startMotivationalMessages() {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const motivationIntervalMinutes = config.get("motivationInterval", 10); // Every 10 minutes

  motivationInterval = setInterval(() => {
    if (
      focusSession &&
      focusSession.active &&
      focusSession.sessionType === "focus"
    ) {
      const randomQuote =
        motivationalQuotes[
          Math.floor(Math.random() * motivationalQuotes.length)
        ];
      showGorgeousNotification("🌟 Keep Going!", randomQuote, ["Thanks!"]);
      playSound("motivation");
    }
  }, motivationIntervalMinutes * 60 * 1000);
}

function clearMotivationalMessages() {
  if (motivationInterval) {
    clearInterval(motivationInterval);
    motivationInterval = null;
  }
}

function scheduleBreakReminder() {
  if (!focusSession || focusSession.sessionType !== "focus") return;

  const timeUntilBreak = focusSession.duration;

  breakReminder = setTimeout(() => {
    if (focusSession && focusSession.active) {
      stopFocusSession(true);
    }
  }, timeUntilBreak);
}

function clearBreakReminder() {
  if (breakReminder) {
    clearTimeout(breakReminder);
    breakReminder = null;
  }
}

function updateStatusBar() {
  if (!statusBarItem) return;

  if (focusSession && focusSession.active) {
    const elapsed = new Date() - focusSession.startTime;
    const remaining = Math.max(0, focusSession.duration - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    const emoji = focusSession.sessionType === "focus" ? "🎯" : "☕";
    const type = focusSession.sessionType === "focus" ? "Focus" : "Break";

    statusBarItem.text = `$(clock) ${emoji} ${type}: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
    statusBarItem.tooltip = `Click to stop ${type.toLowerCase()} session`;
    statusBarItem.backgroundColor =
      focusSession.sessionType === "focus"
        ? new vscode.ThemeColor("statusBarItem.prominentBackground")
        : new vscode.ThemeColor("statusBarItem.warningBackground");

    // Update every second
    setTimeout(updateStatusBar, 1000);
  } else {
    statusBarItem.text = "$(clock) 🎯 Ready";
    statusBarItem.tooltip = "Focus Time Tracker - Click to start";
    statusBarItem.backgroundColor = undefined;
  }
}

function showLiveDashboard() {
  if (webviewPanel) {
    webviewPanel.reveal();
    return;
  }

  webviewPanel = vscode.window.createWebviewPanel(
    "focusDashboard",
    "🎯 Focus Dashboard",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  webviewPanel.onDidDispose(() => {
    webviewPanel = null;
  });

  updateDashboard();

  // Update dashboard every 5 seconds
  const dashboardInterval = setInterval(() => {
    if (webviewPanel) {
      updateDashboard();
    } else {
      clearInterval(dashboardInterval);
    }
  }, 5000);
}

function updateDashboard() {
  if (!webviewPanel) return;

  const stats = getAdvancedStats();
  webviewPanel.webview.html = generateAdvancedDashboardHTML(stats);
}

function showAdvancedStats() {
  const stats = getAdvancedStats();
  const panel = vscode.window.createWebviewPanel(
    "focusStats",
    "📊 Advanced Focus Statistics",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = generateAdvancedStatsHTML(stats);
}

function generateAdvancedDashboardHTML(stats) {
  const isActive = focusSession && focusSession.active;
  const currentSession = isActive
    ? {
        type: focusSession.sessionType,
        elapsed: new Date() - focusSession.startTime,
        total: focusSession.duration,
      }
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Focus Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', system-ui, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; min-height: 100vh;
            }
            .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { 
                background: rgba(255, 255, 255, 0.1); 
                backdrop-filter: blur(10px); 
                border-radius: 20px; 
                padding: 25px; 
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
            .card:hover { transform: translateY(-5px); }
            .card h2 { font-size: 1.5em; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
            .stat-number { font-size: 3em; font-weight: bold; text-align: center; margin: 15px 0; }
            .progress-ring { 
                width: 150px; height: 150px; 
                transform: rotate(-90deg); margin: 20px auto;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
            }
            .progress-ring circle { 
                fill: none; stroke-width: 8; 
                stroke-linecap: round;
                transition: stroke-dasharray 0.5s ease;
            }
            .progress-bg { stroke: rgba(255, 255, 255, 0.2); }
            .progress-bar { 
                stroke: #00f5ff; 
                stroke-dasharray: 0 440; 
                animation: glow 2s ease-in-out infinite alternate;
            }
            @keyframes glow {
                from { filter: drop-shadow(0 0 5px #00f5ff); }
                to { filter: drop-shadow(0 0 20px #00f5ff); }
            }
            .session-active { 
                background: linear-gradient(45deg, #ff6b6b, #feca57);
                animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            .achievement-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; }
            .achievement { 
                text-align: center; padding: 15px 10px; 
                background: rgba(255, 255, 255, 0.1); 
                border-radius: 15px; 
                transition: all 0.3s ease;
            }
            .achievement:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.05); }
            .achievement.earned { background: linear-gradient(45deg, #f093fb, #f5576c); }
            .footer { text-align: center; margin-top: 30px; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="dashboard">
            ${
              currentSession
                ? `
            <div class="card session-active">
                <h2>${currentSession.type === "focus" ? "🎯" : "☕"} Current ${
                    currentSession.type === "focus" ? "Focus" : "Break"
                  } Session</h2>
                <div class="stat-number">${Math.floor(
                  (currentSession.total - currentSession.elapsed) / 60000
                )}:${Math.floor(
                    ((currentSession.total - currentSession.elapsed) % 60000) /
                      1000
                  )
                    .toString()
                    .padStart(2, "0")}</div>
                <svg class="progress-ring" width="150" height="150">
                    <circle class="progress-bg" cx="75" cy="75" r="70"></circle>
                    <circle class="progress-bar" cx="75" cy="75" r="70" 
                            style="stroke-dasharray: ${
                              (currentSession.elapsed / currentSession.total) *
                              440
                            } 440"></circle>
                </svg>
                <div style="text-align: center; opacity: 0.9;">
                    ${Math.round(
                      (currentSession.elapsed / currentSession.total) * 100
                    )}% Complete
                </div>
            </div>
            `
                : `
            <div class="card">
                <h2>🚀 Ready to Focus</h2>
                <div style="text-align: center; font-size: 1.2em; margin: 30px 0;">
                    Click the status bar to start your next focus session!
                </div>
                <div style="text-align: center; opacity: 0.8;">
                    🎯 Stay consistent, stay amazing!
                </div>
            </div>
            `
            }

            <div class="card">
                <h2>📈 Today's Progress</h2>
                <div class="stat-number" style="color: #00f5ff;">${
                  stats.todayMinutes
                }m</div>
                <div style="text-align: center;">
                    Goal: ${stats.dailyGoal}m (${Math.round(
    (stats.todayMinutes / stats.dailyGoal) * 100
  )}%)
                </div>
                <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; margin: 15px 0; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, #00f5ff, #ff6b6b); width: ${Math.min(
                      100,
                      (stats.todayMinutes / stats.dailyGoal) * 100
                    )}%; transition: width 0.5s ease;"></div>
                </div>
            </div>

            <div class="card">
                <h2>🏆 Achievements</h2>
                <div class="achievement-grid">
                    <div class="achievement ${
                      stats.todayMinutes > 0 ? "earned" : ""
                    }">
                        <div style="font-size: 2em;">🎯</div>
                        <div style="font-size: 0.8em;">First Focus</div>
                    </div>
                    <div class="achievement ${
                      stats.todayMinutes >= 60 ? "earned" : ""
                    }">
                        <div style="font-size: 2em;">⏰</div>
                        <div style="font-size: 0.8em;">1 Hour</div>
                    </div>
                    <div class="achievement ${
                      stats.currentStreak >= 3 ? "earned" : ""
                    }">
                        <div style="font-size: 2em;">🔥</div>
                        <div style="font-size: 0.8em;">3 Day Streak</div>
                    </div>
                    <div class="achievement ${
                      stats.currentStreak >= 7 ? "earned" : ""
                    }">
                        <div style="font-size: 2em;">💎</div>
                        <div style="font-size: 0.8em;">Week Warrior</div>
                    </div>
                    <div class="achievement ${
                      stats.totalSessions >= 50 ? "earned" : ""
                    }">
                        <div style="font-size: 2em;">🏅</div>
                        <div style="font-size: 0.8em;">50 Sessions</div>
                    </div>
                    <div class="achievement ${
                      stats.totalSessions >= 100 ? "earned" : ""
                    }">
                        <div style="font-size: 2em;">👑</div>
                        <div style="font-size: 0.8em;">Century</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h2>📊 Quick Stats</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center;">
                    <div>
                        <div style="font-size: 2em; font-weight: bold;">${
                          stats.weeklyMinutes
                        }</div>
                        <div style="opacity: 0.8;">This Week</div>
                    </div>
                    <div>
                        <div style="font-size: 2em; font-weight: bold;">${
                          stats.currentStreak
                        }</div>
                        <div style="opacity: 0.8;">Day Streak</div>
                    </div>
                    <div>
                        <div style="font-size: 2em; font-weight: bold;">${
                          stats.totalSessions
                        }</div>
                        <div style="opacity: 0.8;">Total Sessions</div>
                    </div>
                    <div>
                        <div style="font-size: 2em; font-weight: bold;">${
                          stats.averageSession
                        }</div>
                        <div style="opacity: 0.8;">Avg Session</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>🌟 Keep up the amazing work! Every minute of focus counts! 🌟</p>
        </div>

        <script>
            // Auto-refresh every 30 seconds
            setTimeout(() => location.reload(), 30000);
        </script>
    </body>
    </html>`;
}

function generateAdvancedStatsHTML(stats) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Advanced Focus Statistics</title>
        <style>
            body { 
                font-family: 'Segoe UI', system-ui, sans-serif; 
                background: linear-gradient(135deg, #1e3c72, #2a5298);
                color: white; padding: 30px; margin: 0;
            }
            .header { text-align: center; margin-bottom: 40px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
            .stat-card { 
                background: rgba(255, 255, 255, 0.1); 
                backdrop-filter: blur(15px); 
                border-radius: 20px; 
                padding: 30px; 
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            .stat-number { font-size: 3.5em; font-weight: bold; text-align: center; margin: 20px 0; }
            .productivity-chart { 
                width: 100%; height: 200px; 
                background: rgba(255, 255, 255, 0.05); 
                border-radius: 15px; 
                margin: 20px 0; 
                position: relative;
                overflow: hidden;
            }
            .session-timeline { max-height: 400px; overflow-y: auto; }
            .session-item { 
                background: rgba(255, 255, 255, 0.1); 
                margin: 10px 0; padding: 15px; 
                border-radius: 10px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
            }
            .motivational-section {
                text-align: center;
                background: linear-gradient(45deg, #ff6b6b, #feca57);
                border-radius: 20px;
                padding: 30px;
                margin: 30px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Your Focus Journey</h1>
            <p style="opacity: 0.8; font-size: 1.2em;">Tracking your path to productivity excellence</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h2>🎯 Today's Focus</h2>
                <div class="stat-number" style="color: #00f5ff;">${
                  stats.todayMinutes
                }</div>
                <div style="text-align: center; font-size: 1.1em;">minutes of deep work</div>
                <div class="productivity-chart">
                    <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 80%; height: ${Math.min(
                      90,
                      (stats.todayMinutes / stats.dailyGoal) * 100
                    )}%; background: linear-gradient(to top, #00f5ff, #ff6b6b); border-radius: 10px 10px 0 0; transition: height 0.8s ease;"></div>
                </div>
                <div style="text-align: center; opacity: 0.9;">
                    ${Math.round(
                      (stats.todayMinutes / stats.dailyGoal) * 100
                    )}% of daily goal (${stats.dailyGoal}m)
                </div>
            </div>

            <div class="stat-card">
                <h2>🔥 Current Streak</h2>
                <div class="stat-number" style="color: #ff6b6b;">${
                  stats.currentStreak
                }</div>
                <div style="text-align: center; font-size: 1.1em;">consecutive days</div>
                <div style="text-align: center; margin-top: 20px; opacity: 0.9;">
                    Best streak: ${stats.longestStreak} days
                </div>
            </div>

            <div class="stat-card">
                <h2>📈 Weekly Progress</h2>
                <div class="stat-number" style="color: #feca57;">${
                  stats.weeklyMinutes
                }</div>
                <div style="text-align: center; font-size: 1.1em;">minutes this week</div>
                <div style="text-align: center; margin-top: 20px;">
                    <div style="opacity: 0.8;">Average per day: ${Math.round(
                      stats.weeklyMinutes / 7
                    )}m</div>
                </div>
            </div>

            <div class="stat-card">
                <h2>🏆 Total Achievement</h2>
                <div class="stat-number" style="color: #a8e6cf;">${
                  stats.totalSessions
                }</div>
                <div style="text-align: center; font-size: 1.1em;">completed sessions</div>
                <div style="text-align: center; margin-top: 20px; opacity: 0.9;">
                    Average session: ${stats.averageSession} minutes
                </div>
            </div>
        </div>

        <div class="motivational-section">
            <h2>🌟 Your Progress is Amazing!</h2>
            <p style="font-size: 1.3em; margin: 20px 0;">
                You've completed ${
                  stats.totalSessions
                } focus sessions and built a ${stats.currentStreak}-day streak. 
                ${
                  stats.todayMinutes > 0
                    ? "Keep the momentum going today!"
                    : "Ready to start today's first session?"
                }
            </p>
            <p style="opacity: 0.9;">
                ${stats.totalHours} total hours of focused work • 
                ${
                  Math.round(
                    (stats.totalSessions / Math.max(1, stats.totalDays)) * 10
                  ) / 10
                } sessions per day average
            </p>
        </div>

        <div class="stat-card">
            <h2>📅 Recent Sessions</h2>
            <div class="session-timeline">
                ${stats.recentSessions
                  .map(
                    (session) => `
                    <div class="session-item">
                        <div>
                            <div style="font-weight: bold;">${session.date}</div>
                            <div style="opacity: 0.8; font-size: 0.8em;">${session.completion}% complete</div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </body>
    </html>`;
}

function getAdvancedStats() {
  const sessions = getStoredSessions();
  const today = new Date().toDateString();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Calculate today's minutes
  const todayMinutes = sessions
    .filter(
      (s) =>
        new Date(s.startTime).toDateString() === today && s.type === "focus"
    )
    .reduce((sum, s) => sum + Math.round(s.duration / 60000), 0);

  // Calculate weekly minutes
  const weeklyMinutes = sessions
    .filter((s) => new Date(s.startTime) > oneWeekAgo && s.type === "focus")
    .reduce((sum, s) => sum + Math.round(s.duration / 60000), 0);

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  // Total sessions and average
  const focusSessions = sessions.filter((s) => s.type === "focus");
  const totalSessions = focusSessions.length;
  const totalMinutes = focusSessions.reduce(
    (sum, s) => sum + Math.round(s.duration / 60000),
    0
  );
  const averageSession =
    totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Recent sessions
  const recentSessions = focusSessions
    .slice(-10)
    .reverse()
    .map((session) => ({
      date: new Date(session.startTime).toLocaleDateString(),
      time: new Date(session.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: Math.round(session.duration / 60000),
      completion: Math.round(session.completion || 0),
    }));

  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const dailyGoal = config.get("dailyGoal", 120);

  return {
    todayMinutes,
    weeklyMinutes,
    currentStreak,
    longestStreak,
    totalSessions,
    averageSession,
    recentSessions,
    dailyGoal,
    totalHours: Math.round(totalMinutes / 60),
    totalDays: Math.max(
      1,
      Math.ceil(
        (Date.now() -
          new Date(focusSessions[0]?.startTime || Date.now()).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    ),
  };
}

function calculateStreaks(sessions) {
  const focusSessions = sessions.filter((s) => s.type === "focus");
  if (focusSessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Group sessions by date
  const sessionsByDate = {};
  focusSessions.forEach((session) => {
    const date = new Date(session.startTime).toDateString();
    if (!sessionsByDate[date]) {
      sessionsByDate[date] = [];
    }
    sessionsByDate[date].push(session);
  });

  const dates = Object.keys(sessionsByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak
  const today = new Date().toDateString();
  let checkDate = new Date();

  while (true) {
    const dateStr = checkDate.toDateString();
    if (sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0) {
      currentStreak++;
    } else {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak
  for (let i = 0; i < dates.length; i++) {
    tempStreak = 1;
    for (let j = i + 1; j < dates.length; j++) {
      const currentDate = new Date(dates[j]);
      const prevDate = new Date(dates[j - 1]);
      const diffTime = prevDate - currentDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        break;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return { currentStreak, longestStreak };
}

function showGorgeousNotification(
  title,
  message,
  buttons = ["OK"],
  callback = null
) {
  const options = {};
  if (buttons.length === 1) {
    vscode.window.showInformationMessage(title + "\n\n" + message);
  } else {
    vscode.window
      .showInformationMessage(title + "\n\n" + message, ...buttons)
      .then((selection) => {
        if (callback && selection) {
          callback(selection);
        }
      });
  }
}

function showMotivationalMessage() {
  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  showGorgeousNotification(
    "🌟 Motivation Boost!",
    randomQuote,
    ["Thanks!", "Another One!"],
    (selection) => {
      if (selection === "Another One!") {
        showMotivationalMessage();
      }
    }
  );
  playSound("motivation");
}

function openSettings() {
  vscode.commands.executeCommand(
    "workbench.action.openSettings",
    "focusTimeTracker"
  );
}

function resetStats() {
  vscode.window
    .showWarningMessage(
      "Are you sure you want to reset all statistics? This cannot be undone.",
      { modal: true },
      "Reset All Stats"
    )
    .then((selection) => {
      if (selection === "Reset All Stats") {
        const context = vscode.extensions.getExtension(
          "yourPublisher.focusTimeTracker"
        ).exports;
        if (context && context.globalState) {
          context.globalState.update("focusTimeTracker.sessions", []);
          context.globalState.update("focusTimeTracker.firstTime", undefined);
          showGorgeousNotification(
            "✨ Stats Reset!",
            "All statistics have been cleared. Ready for a fresh start! 🚀",
            ["New Session", "OK"],
            (selection) => {
              if (selection === "New Session") {
                startFocusSession();
              }
            }
          );
        }
      }
    });
}

function saveSessionToHistory(startTime, duration, completion, type) {
  const session = {
    startTime: startTime.toISOString(),
    duration: duration,
    completion: completion,
    type: type,
    endTime: new Date().toISOString(),
  };

  const sessions = getStoredSessions();
  sessions.push(session);

  // Keep only last 1000 sessions
  if (sessions.length > 1000) {
    sessions.splice(0, sessions.length - 1000);
  }

  const context = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.exports;
  if (context && context.globalState) {
    context.globalState.update("focusTimeTracker.sessions", sessions);
  }
}

function getStoredSessions() {
  const context = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.exports;
  if (context && context.globalState) {
    return context.globalState.get("focusTimeTracker.sessions", []);
  }
  return [];
}

function saveSessionData() {
  if (!focusSession) return;

  const context = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.exports;
  if (context && context.globalState) {
    context.globalState.update("focusTimeTracker.currentSession", {
      active: focusSession.active,
      startTime: focusSession.startTime.toISOString(),
      duration: focusSession.duration,
      sessionType: focusSession.sessionType,
    });
  }
}

function loadSessionData() {
  const context = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.exports;
  if (context && context.globalState) {
    const savedSession = context.globalState.get(
      "focusTimeTracker.currentSession"
    );
    if (savedSession && savedSession.active) {
      // Restore session if it was active and not too old
      const savedStartTime = new Date(savedSession.startTime);
      const now = new Date();
      const elapsed = now - savedStartTime;

      if (elapsed < savedSession.duration + 60000) {
        // Allow 1 minute grace period
        focusSession = {
          active: true,
          startTime: savedStartTime,
          duration: savedSession.duration,
          sessionType: savedSession.sessionType,
        };

        const remaining = savedSession.duration - elapsed;
        if (remaining > 0) {
          scheduleBreakReminder();
          updateStatusBar();
        } else {
          // Session should have ended, complete it
          stopFocusSession(true);
        }
      }
    }
  }
}

function isFirstTime() {
  const context = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.exports;
  if (context && context.globalState) {
    return !context.globalState.get("focusTimeTracker.firstTime", false);
  }
  return true;
}

function showWelcomeMessage() {
  showGorgeousNotification(
    "🎯 Welcome to Focus Time Tracker Enhanced!",
    "Your productivity companion is ready to help you achieve amazing focus!\n\n" +
      "✨ Features:\n" +
      "• Smart Pomodoro sessions with breaks\n" +
      "• Live dashboard with beautiful stats\n" +
      "• Motivational messages and achievements\n" +
      "• Streak tracking and goals\n\n" +
      "Click the status bar item to start your first session!",
    ["Start First Session", "Show Dashboard", "Got it!"],
    (selection) => {
      if (selection === "Start First Session") {
        startFocusSession();
      } else if (selection === "Show Dashboard") {
        showLiveDashboard();
      }
    }
  );

  const context = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.exports;
  if (context && context.globalState) {
    context.globalState.update("focusTimeTracker.firstTime", true);
  }
}

// Updated playSound function with actual audio playback
function playSound(type) {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const soundEnabled = config.get("soundEnabled", true);

  const soundMap = {
    start: "sounds/start.wav",
    complete: "sounds/complete.wav",
    break: "sounds/break.wav",
    break_end: "sounds/break_end.wav",
    stop: "sounds/stop.wav",
    notification: "sounds/notification.wav",
    motivation: "sounds/motivation.wav",
  };

  if (!soundEnabled || !soundMap[type]) return;

  try {
    // Get the extension path
    const extensionPath = vscode.extensions.getExtension(
      "yourPublisher.focusTimeTracker"
    )?.extensionPath;
    if (!extensionPath) return;

    const soundFilePath = path.join(extensionPath, soundMap[type]);

    // Play sound based on operating system
    if (process.platform === "win32") {
      // Windows - use powershell
      playWindowsSound(soundFilePath);
    } else if (process.platform === "darwin") {
      // macOS - use afplay
      playMacSound(soundFilePath);
    } else {
      // Linux - use aplay, paplay, or similar
      playLinuxSound(soundFilePath);
    }

    console.log(`Playing ${type} sound: ${soundFilePath}`);
  } catch (error) {
    console.error(`Error playing sound: ${error.message}`);
    // Fallback to system notification sound
    playSystemNotification();
  }
}

function playWindowsSound(soundFilePath) {
  // Method 1: Using PowerShell (recommended)
  const powershellCommand = `(New-Object Media.SoundPlayer "${soundFilePath}").PlaySync()`;
  spawn("powershell", ["-Command", powershellCommand], {
    detached: true,
    stdio: "ignore",
  });
}

function playMacSound(soundFilePath) {
  // macOS built-in audio player
  spawn("afplay", [soundFilePath], {
    detached: true,
    stdio: "ignore",
  });
}

function playLinuxSound(soundFilePath) {
  // Try multiple Linux audio players
  const players = ["aplay", "paplay", "play", "mpg123"];

  for (const player of players) {
    try {
      spawn(player, [soundFilePath], {
        detached: true,
        stdio: "ignore",
      });
      break; // If successful, stop trying other players
    } catch (error) {
      continue; // Try next player
    }
  }
}

function playSystemNotification() {
  // Fallback: trigger system notification sound
  vscode.window.showInformationMessage("🎯", { modal: false }).then(() => {
    // This briefly shows and hides a notification, triggering system sound
    setTimeout(() => {
      vscode.commands.executeCommand("workbench.action.closeMessages");
    }, 100);
  });
}

// Alternative Web Audio API approach using webview
function playWebAudioSound(type) {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const soundEnabled = config.get("soundEnabled", true);

  if (!soundEnabled) return;

  // Create a temporary webview just for playing sound
  const panel = vscode.window.createWebviewPanel(
    "soundPlayer",
    "Sound Player",
    { viewColumn: vscode.ViewColumn.Active, preserveFocus: true },
    { enableScripts: true }
  );

  const soundMap = {
    start: "sounds/start.wav",
    complete: "sounds/complete.wav",
    break: "sounds/break.wav",
    break_end: "sounds/break_end.wav",
    stop: "sounds/stop.wav",
    notification: "sounds/notification.wav",
    motivation: "sounds/motivation.wav",
  };

  const extensionUri = vscode.extensions.getExtension(
    "yourPublisher.focusTimeTracker"
  )?.extensionUri;
  if (!extensionUri || !soundMap[type]) {
    panel.dispose();
    return;
  }

  const soundUri = vscode.Uri.joinPath(extensionUri, soundMap[type]);
  const soundSrc = panel.webview.asWebviewUri(soundUri);

  panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sound Player</title>
        </head>
        <body>
            <audio id="audioPlayer" preload="auto">
                <source src="${soundSrc}" type="audio/wav">
            </audio>
            <script>
                const audio = document.getElementById('audioPlayer');
                audio.addEventListener('canplaythrough', () => {
                    audio.play().then(() => {
                        // Close the panel after playing
                        setTimeout(() => {
                            window.close();
                        }, audio.duration * 1000 + 500);
                    }).catch(err => {
                        console.error('Error playing audio:', err);
                        window.close();
                    });
                });
                
                audio.addEventListener('error', () => {
                    console.error('Error loading audio');
                    window.close();
                });
                
                audio.load();
            </script>
        </body>
        </html>
    `;

  // Auto-dispose the panel after a reasonable time
  setTimeout(() => {
    if (panel) {
      panel.dispose();
    }
  }, 5000);
}

// Enhanced playSound function with multiple fallback methods
function playSound(type) {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const soundEnabled = config.get("soundEnabled", true);
  const soundMethod = config.get("soundMethod", "system"); // "system", "webview", or "auto"

  if (!soundEnabled) return;

  try {
    if (soundMethod === "webview") {
      playWebAudioSound(type);
    } else if (soundMethod === "system" || soundMethod === "auto") {
      playSystemSound(type);
    }
  } catch (error) {
    console.error(`Sound playback failed: ${error.message}`);
    // Ultimate fallback
    playSystemNotification();
  }
}

function playSystemSound(type) {
  const config = vscode.workspace.getConfiguration("focusTimeTracker");
  const soundMap = {
    start: "sounds/start.wav",
    complete: "sounds/complete.wav",
    break: "sounds/break.wav",
    break_end: "sounds/break_end.wav",
    stop: "sounds/stop.wav",
    notification: "sounds/notification.wav",
    motivation: "sounds/motivation.wav",
  };

  if (!soundMap[type]) return;

  try {
    const extensionPath = vscode.extensions.getExtension(
      "yourPublisher.focusTimeTracker"
    )?.extensionPath;
    if (!extensionPath) return;

    const soundFilePath = path.join(extensionPath, soundMap[type]);

    // Check if file exists
    const fs = require("fs");
    if (!fs.existsSync(soundFilePath)) {
      console.warn(`Sound file not found: ${soundFilePath}`);
      playSystemNotification();
      return;
    }

    // Play sound based on platform
    if (process.platform === "win32") {
      playWindowsSound(soundFilePath);
    } else if (process.platform === "darwin") {
      playMacSound(soundFilePath);
    } else {
      playLinuxSound(soundFilePath);
    }

    console.log(`Playing ${type} sound: ${soundFilePath}`);
  } catch (error) {
    console.error(`Error playing sound: ${error.message}`);
    playSystemNotification();
  }
}

function deactivate() {
  if (focusSession && focusSession.active) {
    // Save current session state
    saveSessionData();
  }

  // Clean up timers
  clearBreakReminder();
  clearMotivationalMessages();

  if (statusBarItem) {
    statusBarItem.dispose();
  }

  if (webviewPanel) {
    webviewPanel.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};
