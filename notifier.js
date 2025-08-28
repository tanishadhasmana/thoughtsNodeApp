// Step 1: create a single EventEmitter (our notification center)
const EventEmitter = require("events");

// Create Notifier class and an instance (singleton-style)
class Notifier extends EventEmitter {}
const notifier = new Notifier();

// Export the single notifier used across the app
module.exports = notifier;
