import http from "node:http";
import fs from "node:fs";

// Port for the server to listen on
const port = 5000;

// Function to load users from 'users.json' file
function loadUsers() {
  if (fs.existsSync("users.json")) {
    const data = fs.readFileSync("users.json");
    return JSON.parse(data);
  }
  return [];
}

// Function to save users to 'users.json' file
function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 4));
}

// Function to load blogs from 'blogs.json' file
function loadBlogs() {
  if (fs.existsSync("blogs.json")) {
    const data = fs.readFileSync("blogs.json");
    return JSON.parse(data);
  }
  return [];
}

// Function to save blogs to 'blogs.json' file
function saveBlogs(blogs) {
  fs.writeFileSync("blogs.json", JSON.stringify(blogs, null, 4));
}

// Create the server
const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Middleware to set the response content type to JSON
  res.setHeader("Content-Type", "application/json");

  // Handle POST /register for user registration
  if (url === "/register" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const { username, password, fullName, age, email, gender } = JSON.parse(body);

        if (!username || username.length < 3) {
          res.writeHead(400);
          return res.end(
            JSON.stringify({
              error: "Username must be at least 3 characters long.",
            })
          );
        }
        if (!password || password.length < 5) {
          res.writeHead(400);
          return res.end(
            JSON.stringify({
              error: "Password must be at least 5 characters long.",
            })
          );
        }
        if (fullName && fullName.length < 10) {
          res.writeHead(400);
          return res.end(
            JSON.stringify({
              error: "Full name must be at least 10 characters long if provided.",
            })
          );
        }
        if (age < 10) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: "Age must be at least 10." }));
        }
        if (!email || !email.includes("@")) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: "Invalid email address." }));
        }
        if (gender && !["male", "female"].includes(gender.toLowerCase())) {
          res.writeHead(400);
          return res.end(
            JSON.stringify({
              error: "Gender must be either 'male' or 'female'.",
            })
          );
        }

        const users = loadUsers();

        if (users.some((user) => user.username === username)) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: "Username already exists." }));
        }

        const newUser = { username, password, fullName, age, email, gender };

        users.push(newUser);

        saveUsers(users);

        res.writeHead(201);
        return res.end(
          JSON.stringify({ message: "User registered successfully!" })
        );
      } catch (error) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: "Invalid JSON data" }));
      }
    });
  }

  // Handle POST /blogs to create a new blog post
  else if (url === "/blogs" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const { title, content, author } = JSON.parse(body);

      if (!title || !content || !author) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: "Title, content, and author are required." })
        );
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

      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          message: "Blog post created successfully!",
          blog: newBlog,
        })
      );
    });
  }

  // Handle GET /blogs to fetch all blogs
  else if (url === "/blogs" && method === "GET") {
    const blogs = loadBlogs();
    res.statusCode = 200;
    return res.end(JSON.stringify(blogs));
  }

  // Handle GET /blogs/:id to fetch a specific blog by ID
  else if (url.startsWith("/blogs/") && method === "GET") {
    const id = parseInt(url.split("/")[2], 10);
    const blogs = loadBlogs();
    const blog = blogs.find((b) => b.id === id);

    if (!blog) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Blog post not found." }));
    }

    res.statusCode = 200;
    return res.end(JSON.stringify(blog));
  }

  // Handle PUT /blogs/:id to update a specific blog post by ID
  else if (url.startsWith("/blogs/") && method === "PUT") {
    const id = parseInt(url.split("/")[2], 10);
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const { title, content, author } = JSON.parse(body);

      if (!title && !content && !author) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: "At least one of title, content, or author must be provided." })
        );
      }

      const blogs = loadBlogs();
      const blogIndex = blogs.findIndex((b) => b.id === id);

      if (blogIndex === -1) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: "Blog post not found." }));
      }

      const updatedBlog = { ...blogs[blogIndex], title, content, author, updatedAt: new Date().toISOString() };
      blogs[blogIndex] = updatedBlog;
      saveBlogs(blogs);

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          message: "Blog post updated successfully!",
          blog: updatedBlog,
        })
      );
    });
  }

  // Handle DELETE /blogs/:id to delete a specific blog post by ID
  else if (url.startsWith("/blogs/") && method === "DELETE") {
    const id = parseInt(url.split("/")[2], 10);
    const blogs = loadBlogs();
    const blogIndex = blogs.findIndex((b) => b.id === id);

    if (blogIndex === -1) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Blog post not found." }));
    }

    blogs.splice(blogIndex, 1);
    saveBlogs(blogs);

    res.statusCode = 200;
    return res.end(JSON.stringify({ message: "Blog post deleted successfully." }));
  }

  // If no route matches
  else {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: "Not Found" }));
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
