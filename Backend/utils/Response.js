/**
 * Response utility: standardizes JSON responses from the API.
 * - success(...) builds a successful response with optional data and message.
 * - error(...) builds an error response with an error message and status code.
 *
 * Response shape:
 * {
 *   time: ISO timestamp,
 *   data: any | null,
 *   message: string | null,
 *   success: boolean,
 *   statusCode: number
 * }
 */
class Response {
  constructor({ data = null, message = null, success = true, statusCode = 200 }) {
    this.time = new Date().toISOString();
    this.data = data;
    this.message = message;
    this.success = success;
    this.statusCode = statusCode;
  }

  /**
   * Build a successful response.
   * @param {*} data - Payload to return to the client.
   * @param {String} message - Human-friendly message.
   * @param {Number} statusCode - HTTP status code (default 200).
   */
  static success(data, message = "Request successful", statusCode = 200) {
    return new Response({
      data,
      message,
      success: true,
      statusCode
    });
  }

  /**
   * Build an error response.
   * @param {String} message - Error message to return.
   * @param {Number} statusCode - HTTP status code (default 500).
   */
  static error(message = "Something went wrong", statusCode = 500) {
    return new Response({
      data: null,
      message,
      success: false,
      statusCode
    });
  }
}

export default Response;
  