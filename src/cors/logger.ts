import winston from "winston";

// Define the logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to logs
    winston.format.printf(({ timestamp, level, message, section }) => {
      return `${timestamp} [${level.toUpperCase()}] [${section || 'No Section'}]: ${message}\n\n`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs.log' }) // Log to file
  ]
});
// If you want to log to console as well, you can uncomment the line below
logger.add(new winston.transports.Console());

export default logger