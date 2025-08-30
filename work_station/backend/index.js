const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const mainRouter = require("./routes/index")

app.use(express.json())
app.use(cors())
app.use('/api/v1/', mainRouter)


app.listen(PORT , ()=> console.log(`Server running on port: ${PORT}`))