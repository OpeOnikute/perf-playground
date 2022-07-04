const express = require("express");

const app = express();

const port = process.env.PORT || 3000;

app.get("/", (req, res, next) => {
    res.send({ message: "hello" });
});

app.listen(port, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Listening on port ${port}`)
});