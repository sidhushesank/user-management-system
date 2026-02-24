const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  adminLogin
} = require("../controllers/userController");

// IMPORTANT: Specific routes must come BEFORE dynamic routes

// ADMIN LOGIN ROUTE (PUT THIS FIRST)
router.post("/admin-login", adminLogin);

// Normal CRUD routes
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;