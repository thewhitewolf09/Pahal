import express from "express";
import cors from "cors";
import routes from "./src/routes/index.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import "./src/cronJobs/addMonthlyFees.js";
import "./src/cronJobs/feeReminder.js"

const app = express();

config();


// MONGO DB connection
await mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Mongodb Connection Successfull");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.use(rateLimiter);
app.use("/api", routes);

app.get("/", (_req, res) => {
  return res
    .status(200)
    .json({
      resultMessage: "Project is successfully working",
      resultCode: "00004",
    })
    .end();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Content-Security-Policy-Report-Only", "default-src: https:");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT POST PATCH DELETE GET");
    return res.status(200).json({});
  }
  next();
});

const port = process.env.PORT || 8080;
// Server Listening
app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server is running on ${port}`);
});

export default app;
