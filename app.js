// Step 1: imports + notifier
const http = require("http");
const fs = require("fs");
const path = require("path");
const notifier = require("./notifier");

// Step 2: simple in-memory subscribers list
let subscribers = [];

// Step 3: when a new thought is posted, notify subscribers (terminal)
notifier.on("newThought", (thought) => {
  console.log("📢 Notifying subscribers...");
  subscribers.forEach((sub) => {
    console.log(`🔔 Hey ${sub}, new thought posted: "${thought}"`);
  });
});

// Step 4: create server and handle routes
const server = http.createServer((req, res) => {
  // Serve homepage
  if (req.url === "/" && req.method === "GET") {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.statusCode = 500;
        return res.end("Error loading page");
      }
      res.setHeader("Content-Type", "text/html");
      res.end(data);
    });
  }

  // Subscribe via GET /subscribe?name=YourName
  else if (req.url.startsWith("/subscribe") && req.method === "GET") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get("name");
    if (name) {
      // avoid duplicate subscribers (optional)
      if (!subscribers.includes(name)) subscribers.push(name);
      res.end(`✅ ${name} subscribed successfully!`);
    } else {
      res.end("❌ Please provide ?name=yourName");
    }
  }

  // Post a thought via POST /thought (form sends x-www-form-urlencoded)
  else if (req.url === "/thought" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const thought = params.get("thought");
      if (thought) {
        console.log(`📝 New thought posted: "${thought}"`);
        notifier.emit("newThought", thought); // trigger notifications
        res.end(`✅ Thought received: "${thought}"`);
      } else {
        res.end("❌ Please send a thought!");
      }
    });
  }

  // Unknown route
  else {
    res.statusCode = 404;
    res.end("404 Not Found");
  }
});

// Step 5: run server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// o/p is 🚀 Server running at http://localhost:3000
// 📝 New thought posted: ""keep going!""
// 📢 Notifying subscribers...
// 📝 New thought posted: ""keep going!""
// 📢 Notifying subscribers...