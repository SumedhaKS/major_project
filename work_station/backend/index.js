const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const mainRouter = require("./routes/index")
const path = require("path");

app.use(express.json())
app.use(cors())
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use('/api/v1/', mainRouter)


app.listen(PORT , ()=> console.log(`Server running on port: ${PORT}`))