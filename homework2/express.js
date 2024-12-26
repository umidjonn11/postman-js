import express from "express";
import fs from "fs";

const app = express();
const port = 5000;

app.use(express.json());

function loadUsers() {
  if (fs.existsSync("users.json")) {
    const data = fs.readFileSync("users.json");
    return JSON.parse(data);
  }
  return [];
}

function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 4));
}

function loadBlogs() {
  if (fs.existsSync("blogs.json")) {
    const data = fs.readFileSync("blogs.json");
    return JSON.parse(data);
  }
  return [];
}

function saveBlogs(blogs) {
  fs.writeFileSync("blogs.json", JSON.stringify(blogs, null, 4));
}

// Register route (POST /register)
app.post("/register", (req, res) => {
  const { username, password, fullName, age, email, gender } = req.body;

  if (!username || username.length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters long." });
  }
  if (!password || password.length < 5) {
    return res
      .status(400)
      .json({ error: "Password must be at least 5 characters long." });
  }
  if (fullName && fullName.length < 10) {
    return res
      .status(400)
      .json({
        error: "Full name must be at least 10 characters long if provided.",
      });
  }
  if (age < 10) {
    return res.status(400).json({ error: "Age must be at least 10." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (gender && !["male", "female"].includes(gender.toLowerCase())) {
    return res
      .status(400)
      .json({ error: "Gender must be either 'male' or 'female'." });
  }

  const users = loadUsers();

  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ error: "Username already exists." });
  }

  const newUser = { username, password, fullName, age, email, gender };

  users.push(newUser);

  saveUsers(users);

  res.status(201).json({ message: "User registered successfully!" });
});

app.post("/blogs", (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res
      .status(400)
      .json({ error: "Title, content, and author are required." });
  }

  const blogs = loadBlogs();
  const newBlog = {
    id: blogs.length > 0 ? blogs[blogs.length - 1].id + 1 : 1,
    title,
    content,
    author,
    createdAt: new Date().toISOString(),
  };

  blogs.push(newBlog);
  saveBlogs(blogs);

  res.status(201).json({
    message: "Blog post created successfully!",
    blog: newBlog,
  });
});

app.get("/blogs", (req, res) => {
  const blogs = loadBlogs();
  res.status(200).json(blogs);
});

app.get("/blogs/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const blogs = loadBlogs();
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  res.status(200).json(blog);
});

app.put("/blogs/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, content, author } = req.body;

  if (!title && !content && !author) {
    return res
      .status(400)
      .json({
        error: "At least one of title, content, or author must be provided.",
      });
  }

  const blogs = loadBlogs();
  const blogIndex = blogs.findIndex((b) => b.id === id);

  if (blogIndex === -1) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  const updatedBlog = {
    ...blogs[blogIndex],
    title: title || blogs[blogIndex].title,
    content: content || blogs[blogIndex].content,
    author: author || blogs[blogIndex].author,
    updatedAt: new Date().toISOString(),
  };

  blogs[blogIndex] = updatedBlog;
  saveBlogs(blogs);

  res.status(200).json({
    message: "Blog post updated successfully!",
    blog: updatedBlog,
  });
});

app.delete("/blogs/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const blogs = loadBlogs();
  const blogIndex = blogs.findIndex((b) => b.id === id);

  if (blogIndex === -1) {
    return res.status(404).json({ error: "Blog post not found." });
  }

  blogs.splice(blogIndex, 1);
  saveBlogs(blogs);

  res.status(200).json({ message: "Blog post deleted successfully." });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
