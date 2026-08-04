const express = require("express");
const router = express.Router();

const adminUserController = require("../controllers/adminUserController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
    getUsersSchema,
    getUserByIdSchema,
    updateUserRoleSchema,
    createUserSchema,
    deleteUserSchema
} = require("../validations/adminUserValidation");

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(createUserSchema),
    adminUserController.createUser
);

router.get(
    "/",
    protect,
    authorize("admin"),
    validate(getUsersSchema),
    adminUserController.getAllUsers
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    validate(getUserByIdSchema),
    adminUserController.getUserById
);

router.patch(
    "/:id/role",
    protect,
    authorize("admin"),
    validate(updateUserRoleSchema),
    adminUserController.updateUserRole
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    validate(deleteUserSchema),
    adminUserController.deleteUser
);

module.exports = router;
