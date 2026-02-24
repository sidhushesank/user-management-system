const User = require("../models/user");

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    const newUser = new User({
      name,
      email,
      password: password || "123456", // default password
      role: role || "user"
    });

    await newUser.save();
    res.status(201).json(newUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔐 ADMIN LOGIN WITH PASSWORD
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminUser = await User.findOne({
      email,
      role: "admin"
    });

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: "Admin not found"
      });
    }

    if (adminUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      message: "Admin login successful",
      user: adminUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};