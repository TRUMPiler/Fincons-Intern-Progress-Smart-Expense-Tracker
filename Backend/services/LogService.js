import Log from "../models/Logs.js";

class LogService {
  /**
   * Create an audit log entry for user actions.
   * Stores action description and metadata for compliance and debugging.
   * @async
   * @param {string} userId - The ID of the user performing the action
   * @param {string} action - Description of the action performed
   * @param {Object} meta - Additional metadata object with action details (optional)
   * @returns {Promise<Object|null>} The created log entry, or null if creation fails
   * @throws Catches and logs errors without throwing
   */
  async CreateLog(userId, action, meta = {}) {
    try {
      const entry = new Log({ userId, action, meta });
      await entry.save();
      return entry;
    } catch (err) {
      console.error("Failed to create log", err);
    
      return null;
    }
  }
}

export default new LogService();
