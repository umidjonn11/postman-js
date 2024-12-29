import express from "express"; 
// Correctly import all functions from controller.js (make sure to adjust the path based on your folder structure)
import { createUser, createBlog, getAllBlogs, getBlog, updateBlog, deleteBlog } from "../controller/controller.js"; 

const router = express.Router();

// Define routes and link to controller functions
router.post("/register", createUser); // User creation route
router.post("/blogs", createBlog); // Blog creation route
router.get("/blogs", getAllBlogs); // Get all blogs route
router.get("/blogs/:id", getBlog); // Get single blog by ID
router.put("/blogs/:id", updateBlog); // Update a blog by ID
router.delete("/blogs/:id", deleteBlog); // Delete a blog by ID

export default router;
