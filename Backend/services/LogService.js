import Log from "../models/Logs.js";

class LogService {
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
