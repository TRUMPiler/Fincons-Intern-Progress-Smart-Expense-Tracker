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
   * Store access token and user info in localStorage
   * Refresh token is automatically stored in HTTP-only cookie by backend
   */
  setUser(user: AuthUser, accessToken: string): void {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(this.accessTokenKey, accessToken);
    // refreshToken is no longer stored in localStorage - it's in an HTTP-only cookie
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
   * Get refresh token from HTTP-only cookie
   * (Not accessible from JS, but sent automatically with credentials: true)
   */
  getRefreshToken(): string | null {
    // Refresh token is in HTTP-only cookie - not accessible from JavaScript
    // It will be sent automatically by axios when withCredentials: true
    return null;
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
   * Refresh token HTTP-only cookie is cleared by backend
   */
  async logout(): Promise<void> {
    console.log("🚪 LOGOUT CALLED - Clearing all auth data from localStorage");
    console.trace("   Stack trace:");
    localStorage.removeItem(this.accessTokenKey);
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
