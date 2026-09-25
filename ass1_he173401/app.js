const express = require("express");
const PORT = 3000;

const app = express();

const articleRouter = require("./routes/articleRouter");

app.use(express.json());
app.use("/articles", articleRouter);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});