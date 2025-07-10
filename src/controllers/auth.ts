import { AuthService } from "../services/auth";
import { LoginRequest, RefreshRequest } from "../types/auth";
import { AppContext } from "../types/hono";

export class AuthController {
  static async login(c: AppContext) {
    try {
      const body = (await c.req.json()) as LoginRequest;

      if (!body.email || !body.password) {
        return c.json(
          {
            error: "Email y contraseña son requeridos",
          },
          400
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return c.json(
          {
            error: "Formato de email inválido",
          },
          400
        );
      }

      const authService = new AuthService({
        DB: c.env.DB,
        KV_SESSIONS: c.env.KV_SESSIONS,
        JWT_SECRET: c.env.JWT_SECRET,
        JWT_REFRESH_SECRET: c.env.JWT_REFRESH_SECRET,
      });

      const result = await authService.login(body.email, body.password);

      if (!result) {
        return c.json(
          {
            error: "Credenciales inválidas",
          },
          401
        );
      }

      return c.json({
        message: "Login exitoso",
        data: result,
      });
    } catch (error) {
      console.error("Error en login:", error);
      return c.json(
        {
          error: "Error interno del servidor",
        },
        500
      );
    }
  }

  static async refresh(c: AppContext) {
    try {
      const body = (await c.req.json()) as RefreshRequest;

      if (!body.refreshToken) {
        return c.json(
          {
            error: "Refresh token es requerido",
          },
          400
        );
      }

      const authService = new AuthService({
        DB: c.env.DB,
        KV_SESSIONS: c.env.KV_SESSIONS,
        JWT_SECRET: c.env.JWT_SECRET,
        JWT_REFRESH_SECRET: c.env.JWT_REFRESH_SECRET,
      });

      const result = await authService.refreshAccessToken(body.refreshToken);

      if (!result) {
        return c.json(
          {
            error: "Refresh token inválido o expirado",
          },
          401
        );
      }

      return c.json({
        message: "Token renovado exitosamente",
        data: result,
      });
    } catch (error) {
      console.error("Error en refresh:", error);
      return c.json(
        {
          error: "Error interno del servidor",
        },
        500
      );
    }
  }

  static async logout(c: AppContext) {
    try {
      const body = (await c.req.json()) as RefreshRequest;

      if (!body.refreshToken) {
        return c.json(
          {
            error: "Refresh token es requerido",
          },
          400
        );
      }

      const authService = new AuthService({
        DB: c.env.DB,
        KV_SESSIONS: c.env.KV_SESSIONS,
        JWT_SECRET: c.env.JWT_SECRET,
        JWT_REFRESH_SECRET: c.env.JWT_REFRESH_SECRET,
      });

      const success = await authService.logout(body.refreshToken);

      if (!success) {
        return c.json(
          {
            error: "Refresh token inválido",
          },
          400
        );
      }

      return c.json({
        message: "Logout exitoso",
      });
    } catch (error) {
      console.error("Error en logout:", error);
      return c.json(
        {
          error: "Error interno del servidor",
        },
        500
      );
    }
  }

  static async me(c: AppContext) {
    try {
      // Ahora TypeScript sabe que 'user' es de tipo AuthenticatedUser
      const user = c.get("user");

      if (!user) {
        return c.json(
          {
            error: "Usuario no autenticado",
          },
          401
        );
      }

      return c.json({
        message: "Usuario autenticado",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Error en me:", error);
      return c.json(
        {
          error: "Error interno del servidor",
        },
        500
      );
    }
  }
}
