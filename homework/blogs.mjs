import http from 'node:http';
import fs from 'node:fs';

// Port for the server to listen on
const port = 5000;

// Function to load blogs from 'blogs.json' file
function loadBlogs() {
    if (fs.existsSync('blogs.json')) {
        const data = fs.readFileSync('blogs.json');
        return JSON.parse(data);
    }
    return [];
}

// Function to save blogs to 'blogs.json' file
function saveBlogs(blogs) {
    fs.writeFileSync('blogs.json', JSON.stringify(blogs, null, 4));
}

// Create the server
const server = http.createServer((req, res) => {
    const { method, url } = req;

    // Middleware to set the response content type to JSON
    res.setHeader('Content-Type', 'application/json');

    // POST /blogs to create a new blog post
    if (url === '/blogs' && method === 'POST') {
        let body = '';

        // Collect the request body
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { title, content, author } = JSON.parse(body);

            // Validation for required fields
            if (!title || !content || !author) {
                return res.statusCode = 400, res.end(JSON.stringify({ error: 'Title, content, and author are required.' }));
            }

            const blogs = loadBlogs();
            const newBlog = {
                id: blogs.length > 0 ? blogs[blogs.length - 1].id + 1 : 1, // Create a new unique ID
                title,
                content,
                author,
                createdAt: new Date().toISOString()
            };

            blogs.push(newBlog);
            saveBlogs(blogs);

            res.statusCode = 201;
            return res.end(JSON.stringify({ message: 'Blog post created successfully!', blog: newBlog }));
        });
    }

    // GET /blogs to fetch all blogs
    else if (url === '/blogs' && method === 'GET') {
        const blogs = loadBlogs();
        res.statusCode = 200;
        return res.end(JSON.stringify(blogs));
    }

    // GET /blogs/:id to fetch a specific blog by ID
    else if (url.startsWith('/blogs/') && method === 'GET') {
        const id = parseInt(url.split('/')[2], 10);
        const blogs = loadBlogs();
        const blog = blogs.find(b => b.id === id);

        if (!blog) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Blog post not found.' }));
        }

        res.statusCode = 200;
        return res.end(JSON.stringify(blog));
    }

    // PUT /blogs/:id to update a specific blog post by ID
    else if (url.startsWith('/blogs/') && method === 'PUT') {
        const id = parseInt(url.split('/')[2], 10);
        let body = '';

        // Collect the request body
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const { title, content, author } = JSON.parse(body);

            if (!title && !content && !author) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'At least one of title, content, or author must be provided.' }));
            }

            const blogs = loadBlogs();
            const blogIndex = blogs.findIndex(b => b.id === id);

            if (blogIndex === -1) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Blog post not found.' }));
            }

            // Update the blog post
            const updatedBlog = { ...blogs[blogIndex], title, content, author, updatedAt: new Date().toISOString() };
            blogs[blogIndex] = updatedBlog;
            saveBlogs(blogs);

            res.statusCode = 200;
            return res.end(JSON.stringify({ message: 'Blog post updated successfully!', blog: updatedBlog }));
        });
    }

    // DELETE /blogs/:id to delete a specific blog post by ID
    else if (url.startsWith('/blogs/') && method === 'DELETE') {
        const id = parseInt(url.split('/')[2], 10);
        const blogs = loadBlogs();
        const blogIndex = blogs.findIndex(b => b.id === id);

        if (blogIndex === -1) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Blog post not found.' }));
        }

        // Remove the blog post
        blogs.splice(blogIndex, 1);
        saveBlogs(blogs);

        res.statusCode = 200;
        return res.end(JSON.stringify({ message: 'Blog post deleted successfully.' }));
    }

    // If no route matches
    else {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start the server
server.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
