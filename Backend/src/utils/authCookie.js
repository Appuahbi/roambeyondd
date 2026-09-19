const JWT_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000;

const isProduction = () => process.env.NODE_ENV === "production";

const AUTH_COOKIE_NAME = "token";

const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: isProduction() ? "none" : "lax",
        maxAge: JWT_EXPIRE_MS,
        path: "/"
    });
};

const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: isProduction() ? "none" : "lax",
        path: "/"
    });
};

module.exports = {
    AUTH_COOKIE_NAME,
    setAuthCookie,
    clearAuthCookie
};
