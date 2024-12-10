const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const YAML = require("yamljs");
const path = require("path");
const swaggerUI = require("swagger-ui-express");

const http = require("http");
const { initSocket } = require("./sockets/socket.js");

const verifyAuth = require("./middlewares/verifyAuth.js");
const verifyAdmin = require("./middlewares/verifyAdmin.js");
const verifyOwnership = require("./middlewares/verifyOwnership.js");
const createAdmin = require("./features/admin/createAdmin.controller.js");
const urlInvited = require("./features/urls/urlInvited.routes.js");
const auth = require("./features/auth/auth.routes.js");
const urlRedirect = require("./features/urls/urlRedirect.routes.js");
const adminRoute = require("./features/admin/admin.routes.js");
const user = require("./features/users/user.routes.js");
const deleteAccountRoutes = require("./features/users/deleteAccount.routes.js");

dotenv.config();

app.use(express.json());
app.use(cors());

// *** SWAGGER IMPLEMENTATION *****************************************************
const openApiDocument = path.resolve(__dirname, "openApi/output.yaml");

// const openApiDocument = path.resolve(__dirname, openapiPath);
const swaggerDocument = YAML.load(openApiDocument);
console.log("swaggerDocument ==== ", swaggerDocument);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// *** BD CONECTION ***************************************************************
const port = process.env.PORT || 5000;
const mongoDB = process.env.MONGO_URI;

mongoose
  .connect(mongoDB)
  .then(() => {
    console.log("mongoose connected");
    const server = http.createServer(app);

    initSocket(server);

    server.listen(port, () => {
      console.log("Server running on port " + port);
    });
    // createAdmin executed after conexion is set *********************************
    createAdmin().then(() => {
      console.log("Script de creación de administrador ejecutado");
    });
  })
  .catch(() => {
    console.error;
  });

// Public Routes ******************************************************************
app.use("/api/invited", urlInvited);
app.use("/api", auth);
app.use("/", urlRedirect); // Redirection URL

// Private Routes *****************************************************************
app.use("/api/user", verifyAuth, verifyOwnership, user); // Users
app.use("/api/admin-user", verifyAuth, verifyAdmin, user);
app.use("/api/admin", verifyAdmin, adminRoute); // Admin

// Account deletion through github workflow ***************************************
app.use("/delete-account", deleteAccountRoutes);