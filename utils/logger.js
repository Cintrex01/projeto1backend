const fs = require("fs");
const path = require("path");

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "../logs");
    this.createLogDirectory();
  }

  createLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, error = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (error) {
      logMessage += `\nError: ${error.message}`;
      if (error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }

    return logMessage + "\n";
  }

  writeToFile(filename, message) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, message);
  }

  info(message) {
    const logMessage = this.formatMessage("INFO", message);
    console.log(logMessage.trim());
    this.writeToFile("info.log", logMessage);
  }

  error(message, error = null) {
    const logMessage = this.formatMessage("ERROR", message, error);
    console.error(logMessage.trim());
    this.writeToFile("error.log", logMessage);
  }

  warn(message) {
    const logMessage = this.formatMessage("WARN", message);
    console.warn(logMessage.trim());
    this.writeToFile("warn.log", logMessage);
  }
}

module.exports = new Logger();
