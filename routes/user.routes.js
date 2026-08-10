const express = require("express");
const router = express.Router();
const { User } = require("../models");

//route for getting all the users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

//route for getting a user by its Id
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundUser = await User.findByPk(id);

    if (!foundUser) {
      return res.status(404).json({ msg: "User not found." });
    }
    return res.status(200).json(foundUser);
  } catch (error) {
    next(error);
  }
});

//route for posting a user
router.post("/", async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username) {
      return res.status(400).json({ msg: "username is needed!" });
    }
    const newUser = await User.create({
      username,
      email,
    });
    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

//route for updating the user
router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundUser = await User.findByPk(id);

    if (!foundUser) {
      return res.status(404).json({ msg: "User not found." });
    }

    const updates = {};
    for (const key of ["username", "email"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updatedUser = await foundUser.update(updates);
    return res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

//route for deleting the user by its Id.
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundUser = await User.findByPk(id);

    if (!foundUser) {
      return res.status(404).json({ msg: "User not found." });
    }
    await foundUser.destroy();
    return res.status(200).json({ msg: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
