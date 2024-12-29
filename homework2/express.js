import express from "express";
import bodyParser from "body-parser";
import router from "./Routes/route.js";

const app = express();

app.use(bodyParser.json());

app.use("/api", router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
