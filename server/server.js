// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());

app.get("/", function (req, res) {
    res.send("Hello Phreddit (for the last time)!");
});

app.listen(port, () => {console.log("Server listening on port 8000...");});
