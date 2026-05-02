import { BaseController } from "./BaseController.js";
import authService from "../service/auth.service.js";
import { emailRegex, passwordRegex } from "../config/app.js";

class AuthController extends BaseController {
  async signup(req, res) {
    try {
      const { fullname, email, password } = req.body;
      if (fullname.length < 3) return this.sendError(res, "Fullname must be at least 3 letters long", 403);
      if (!email.length) return this.sendError(res, "Enter Email", 403);
      if (!emailRegex.test(email)) return this.sendError(res, "Email is invalid", 403);
      if (!passwordRegex.test(password)) {
        return this.sendError(res, "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter", 403);
      }

      const result = await authService.signup(req.body);
      return this.sendSuccess(res, { ...result, message: "User registered successfully. OTP sent to email for verification." });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async signin(req, res) {
    try {
      // Pass req so the service can extract ip & user-agent for the session
      const result = await authService.signin(req.body, req);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async verifyOtp(req, res) {
    try {
      const result = await authService.verifyOtp(req.body);
      return this.sendSuccess(res, { ...result, message: "OTP verified successfully" });
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.changePassword(userId, req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.body);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async googleAuth(req, res) {
    try {
      const { access_token } = req.body;
      // Pass req so the service can extract ip & user-agent for the session
      const result = await authService.googleAuth(access_token, req);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, "Failed to authenticate you with google. Try with some other google account");
    }
  }

  async logout(req, res) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) return this.sendError(res, "No access token provided", 401);

      const result = await authService.logout(token);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) return this.sendError(res, "No refresh token provided", 401);

      const result = await authService.refreshToken(refresh_token, req);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.sendError(res, error.message, 401);
    }
  }
}

export default new AuthController();
