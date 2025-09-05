# Focus Time Tracker Enhanced

A comprehensive productivity extension for Visual Studio Code that helps you maintain focus, track coding sessions, and build healthy work habits through the Pomodoro Technique and advanced analytics.

## Features

### Core Focus Management

- **Smart Pomodoro Sessions**: Customizable focus sessions (default 25 minutes) with automatic break reminders
- **Intelligent Break System**: Smart break suggestions with healthy activities and flexible timing
- **Real-time Status Tracking**: Live session timer in your status bar with visual indicators

### Advanced Analytics & Insights

- **Live Dashboard**: Beautiful, real-time dashboard with progress visualization and session metrics
- **Comprehensive Statistics**: Track daily, weekly, and total focus time with detailed completion rates
- **Streak Tracking**: Build and maintain focus streaks with visual progress indicators
- **Achievement System**: Unlock achievements for consistent focus habits and milestones

### Motivation & Wellness

- **Motivational Messages**: Optional inspirational notifications during focus sessions
- **Break Activity Suggestions**: Curated list of healthy break activities for physical and mental wellness
- **Goal Setting**: Set and track daily focus time goals with progress visualization
- **Sound Notifications**: Audio feedback for session starts, completions, and breaks

### Customization Options

- **Flexible Session Duration**: Adjust focus and break periods to match your workflow
- **Sound Controls**: Enable/disable audio notifications with multiple playback methods
- **Motivation Settings**: Control frequency and type of motivational messages
- **Auto-Break Options**: Configure automatic break suggestions after completed sessions

## Installation

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Focus Time Tracker Enhanced"
4. Click Install
5. The extension will activate automatically and show a status bar item

## Getting Started

### Quick Start

1. Click the "Ready" status bar item to start your first focus session
2. Work focused for the duration (default: 25 minutes)
3. Take the suggested break when prompted
4. Repeat to build your focus habit

### Using the Dashboard

- **Command Palette**: `Focus Time: Show Live Dashboard`
- **Status Bar**: Click during an active session
- View real-time progress, achievements, and statistics

### Viewing Statistics

- **Command Palette**: `Focus Time: Show Advanced Statistics`
- Track your focus journey with detailed analytics
- Monitor streaks, completion rates, and productivity trends

## Commands

All commands are available through the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- `Focus Time: Toggle Focus Session` - Start or stop a focus session
- `Focus Time: Show Live Dashboard` - Open the real-time productivity dashboard
- `Focus Time: Show Advanced Statistics` - View detailed analytics and progress
- `Focus Time: Take Quick Break` - Get a quick break activity suggestion
- `Focus Time: Show Motivational Message` - Display an inspirational message
- `Focus Time: Open Settings` - Access extension configuration
- `Focus Time: Reset All Statistics` - Clear all tracking data (with confirmation)

## Configuration

Access settings via `File > Preferences > Settings` and search for "Focus Time Tracker":

### Session Settings

- `focusTimeTracker.sessionDuration` (default: 25) - Focus session length in minutes (5-120)
- `focusTimeTracker.breakDuration` (default: 5) - Break duration in minutes (1-30)
- `focusTimeTracker.dailyGoal` (default: 120) - Daily focus time goal in minutes (30-480)

### Audio & Notifications

- `focusTimeTracker.soundEnabled` (default: true) - Enable audio notifications
- `focusTimeTracker.soundMethod` (default: "auto") - Audio playback method (system/webview/auto)

### Motivation Features

- `focusTimeTracker.enableMotivation` (default: true) - Show motivational messages during sessions
- `focusTimeTracker.motivationInterval` (default: 10) - Minutes between motivational messages (5-60)
- `focusTimeTracker.autoBreak` (default: true) - Automatically suggest breaks after sessions

## Usage Tips

### Building Effective Focus Habits

1. **Start Small**: Begin with shorter sessions (15-20 minutes) if 25 minutes feels overwhelming
2. **Consistency Over Perfection**: Regular short sessions are better than occasional long ones
3. **Honor Your Breaks**: Taking breaks prevents burnout and maintains long-term productivity
4. **Track Your Progress**: Use the dashboard to identify your most productive patterns

### Break Activities

The extension suggests various healthy break activities:

- Physical movement and stretching
- Eye rest exercises (20-20-20 rule)
- Hydration reminders
- Mindfulness and breathing exercises
- Brief social connections

### Maximizing Productivity

- **Environment Setup**: Minimize distractions before starting sessions
- **Task Planning**: Know what you'll work on before starting the timer
- **Session Goals**: Set specific, achievable goals for each focus period
- **Regular Reviews**: Use statistics to understand your focus patterns

## Troubleshooting

### Audio Issues

- **No Sound**: Check `soundEnabled` setting and system volume
- **Linux Users**: Ensure audio players (aplay, paplay, or similar) are installed
- **Alternative**: Try changing `soundMethod` to "webview" in settings

### Performance

- The extension uses minimal resources and runs efficiently in the background
- Dashboard updates automatically every 30 seconds when open
- Session data is stored locally in VS Code's storage

### Data Management

- **Session History**: Automatically maintains last 1000 sessions
- **Statistics Reset**: Use "Reset All Statistics" command if needed
- **Data Persistence**: Session data survives VS Code restarts

## Privacy & Data

- All data is stored locally in VS Code's extension storage
- No data is transmitted to external servers
- Session history and statistics remain private to your installation

## Contributing

We welcome contributions to improve Focus Time Tracker Enhanced:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup

```bash
git clone https://github.com/yourusername/focus-time-tracker.git
cd focus-time-tracker
npm install
npm run compile
```

## Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/yourusername/focus-time-tracker/issues)
- **Documentation**: Comprehensive guides available in the repository wiki
- **Community**: Join discussions and share productivity tips

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by the Pomodoro Technique by Francesco Cirillo
- Built with the VS Code Extension API
- Icons and design elements from various open-source contributors

---

**Focus Time Tracker Enhanced** - Transform your coding productivity, one focused session at a time.
