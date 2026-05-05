import connectDB from "@/lib/db";
import Category from "@/models/Category";

function serializeCategory(category) {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
  };
}

export async function getCategories() {
  await connectDB();

  const categories = await Category.find({ deletedAt: null }).sort({
    name: 1,
  });

  return categories.map(serializeCategory);
}
