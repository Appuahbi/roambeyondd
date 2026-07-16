const User = require("../models/User");
const jwt = require("jsonwebtoken");

const createTestUser = async (overrides = {}) => {
    const userData = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        phone: "9876543210",
        password: "Password1",
        role: "user",
        ...overrides
    };

    const user = await User.create(userData);
    return user;
};

const createTestAdmin = async (overrides = {}) => {
    return createTestUser({ role: "admin", ...overrides });
};

const getAuthToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

module.exports = {
    createTestUser,
    createTestAdmin,
    getAuthToken
};
