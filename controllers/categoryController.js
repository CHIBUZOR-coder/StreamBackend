const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//Create Category
exports.createCategory = async (req, res) => {
  const { tittle, display } = req.body;

  try {
    // Check if category already exists

    if (!tittle) {
      res
        .status(400)
        .json({ success: false, message: "tittle, feild must not be empty" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { tittle: tittle },
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    //creating new category
    const category = await prisma.category.create({
      data: { tittle, display },
    });
    res.status(201);
    return res.json({
      success: true,
      message: "cartegory created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the category",
    });
  }
};

//Get Category
exports.getCategory = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    if (!categories) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to retrive categories" });
    }

    res.status(200);
    return res.json({
      success: true,
      message: "Category retrived successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error retrieving categories:", error.message);
    return res.status(400).json({
      success: false,
      message: "An error occurred while retreiving  categories",
    });
  }
};

//Delete Category
exports.deleteCategory = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required",
    });
  }

  try {
    let category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "category does not exist" });
    }

    // await prisma.category.delete({ where: { id: id } });

    const deletedcategory = await prisma.category.delete({
      where: { id: category.id },
    });

    return res.status(200).json({
      success: true,
      message: "Category Deleted successfully",
      data: deletedcategory,
    });
  } catch (error) {
    console.error("Error deleting category", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

//Update Category
exports.updateCategory = async (req, res) => {
  const { tittle, id } = req.body;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category does not exisit" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: category.id },
      data: req.body,
    });
    if (!updatedCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to Update Category" });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error Updating Category", error.message);

    return res.status(400).json({ success: false, message: error.message });
  }
};
