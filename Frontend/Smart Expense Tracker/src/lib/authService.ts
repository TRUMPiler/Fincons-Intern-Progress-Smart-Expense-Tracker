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
private refreshTokenKey="refreshToken";
  /**
   * Store access token, refresh token, and user info in localStorage
   */
  setUser(user: AuthUser, accessToken: string, refreshToken?: string): void {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(this.accessTokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
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
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
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
   * Refresh token in HTTP-only cookie is handled by backend
   */
  async logout(): Promise<void> {
    console.log("🚪 LOGOUT CALLED - Clearing all auth data from localStorage");
    console.trace("   Stack trace:");
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Backend logout failed:", error);
    }
    
    console.log("✓ All auth data cleared");
  }
}

export default new AuthService();
