// Authentication and token management service
// Handles token refresh, storage, and cleanup

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

class AuthService {
  private accessTokenKey = "accessToken";

  /**
   * Store access token in memory and user info in localStorage
   */
  setUser(user: AuthUser, accessToken: string): void {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem("id", user._id);
    localStorage.setItem("name", user.name);
    localStorage.setItem("email", user.email);
  }

  /**
   * Get current access token (can be expired)
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  /**
   * Get current user from localStorage
   */
  getUser(): AuthUser | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is logged in (has tokens and user info)
   */
  isLoggedIn(): boolean {
    return !!this.getUser() && !!this.getAccessToken();
  }

  /**
   * Update access token (called after refresh)
   */
  updateAccessToken(newAccessToken: string): void {
    localStorage.setItem(this.accessTokenKey, newAccessToken);
  }

  /**
   * Clear all auth data on logout
   */
  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
  }
}

export default new AuthService();
