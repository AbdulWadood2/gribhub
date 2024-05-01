const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const http = require("http"); // Import http module
const { initializeSocket } = require("./utils/sockets"); // Import initializeSocket function

// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swaggerConfig.js");
const { SwaggerTheme } = require("swagger-themes");
const theme = new SwaggerTheme();
const options = {
  explorer: true,
  customCss: theme.getBuffer("dark"),
};

/* routes */
const adminRouter = require("./Route/admin_routes");
const userRouter = require("./Route/user_routes");
const paymentMethodRouter = require("./Route/paymentMethod_route.js");
const supportRouter = require("./Route/support_routes.js");
const propertyRouter = require("./Route/property_routes.js");
const termConditionRouter = require("./Route/termCondition_routes.js");
const chatRouter = require("./Route/chat_routes.js");
const reviewRouter = require("./Route/review_routes.js");

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));
app.enable("trust proxy");
app.use(
  cors({
    origin: true, // Allow access from any origin
    credentials: true,
  })
);
app.options("*", cors());

app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* routes */
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/paymentMethod", paymentMethodRouter);
app.use("/api/v1/support", supportRouter);
app.use("/api/v1/property", propertyRouter);
app.use("/api/v1/termCondition", termConditionRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/review", reviewRouter);

const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controller/error_Controller");
app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

app.use((err, req, res, next) => {
  return next(new AppError(err, 404));
});

const DB = process.env.mongo_uri;
const port = 9000;

const server = http.createServer(app); // Create HTTP server

// Pass the HTTP server instance to initializeSocket function
initializeSocket(server);

const connectDB = async () => {
  try {
    console.log("DB Connecting ...");
    const response = await mongoose.connect(DB);
    if (response) {
      console.log("MongoDB connect successfully");

      server.listen(port, () => { // Start the server using server.listen
        console.log(`App run with url: http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.log("error white connect to DB ==>  ", error);
  }
};
connectDB();
