import http from "node:http";
import fs from "node:fs";

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/register" && method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const { username, password, fullName, age, email, gender } =
          JSON.parse(body);

        if (!username || username.length < 3) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              error: "Username must be at least 3 characters long.",
            })
          );
        }
        if (!password || password.length < 5) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              error: "Password must be at least 5 characters long.",
            })
          );
        }
        if (fullName && fullName.length < 10) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              error:
                "Full name must be at least 10 characters long if provided.",
            })
          );
        }
        if (age < 10) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Age must be at least 10." }));
        }
        if (!email || !email.includes("@")) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid email address." }));
        }
        if (gender && !["male", "female"].includes(gender.toLowerCase())) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              error: "Gender must be either 'male' or 'female'.",
            })
          );
        }

        const users = loadUsers();

        if (users.some((user) => user.username === username)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Username already exists." }));
        }

        const newUser = { username, password, fullName, age, email, gender };

        users.push(newUser);

        saveUsers(users);

        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "User registered successfully!" })
        );
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid JSON data" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

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

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
