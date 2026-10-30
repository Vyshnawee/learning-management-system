import Category from "../models/Category.js";

// GET /api/categories  (public)
export const getCategories = async (req, res) => {
     const categories = await Category.find().sort({ name: 1 });

     res.status(200).json({
          success: true,
          data: { categories },
     });
};
