import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { db } from "../../config/db.js";

export const authConfig = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY,
  };

  // Estrategia para verificar el token
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        const { rows } = await db.query("SELECT * FROM usuarios WHERE id = $1", [jwt_payload.id]);

        if (rows.length === 0) {
          return done(null, false);
        }

        return done(null, rows[0]);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};