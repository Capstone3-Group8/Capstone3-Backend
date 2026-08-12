const express = require("express");
const router = express.Router();
const { Category } = require("../models");
const { requireAuth } = require("../middleware/auth");
//route for getting all the categories
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user.id },
      order: [["id", "ASC"]]
    });
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

//route for getting a category by its Id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const foundCategory = await Category.findByPk(id);

    if (!foundCategory) {
      return res.status(404).json({ msg: "Category not found." });
    }
    return res.status(200).json(foundCategory);
  } catch (error) {
    next(error);
  }
});

//route for posting a category
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, type, budget } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ msg: "name and type are needed!" });
    }
    const newCategory = await Category.create({
      user_id: req.user.id,
      name,
      type,
      budget,
    });
    return res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

//route for updating the category
router.patch("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundCategory = await Category.findByPk(id);

    if (!foundCategory) {
      return res.status(404).json({ msg: "Category not found." });
    }

    const updates = {};
    for (const key of ["name", "type", "budget"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updatedCategory = await foundCategory.update(updates);
    return res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

//route for deleting the category by its Id.
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundCategory = await Category.findByPk(id);

    if (!foundCategory) {
      return res.status(404).json({ msg: "Category not found." });
    }
    await foundCategory.destroy();
    return res.status(200).json({ msg: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
