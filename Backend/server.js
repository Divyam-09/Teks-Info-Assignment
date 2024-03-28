require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UserModel = require("./models/user");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
const PORT = process.env.PORT || 3000;
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        req.user = decoded;
        next();
      }
    });
  }
};

app.get("/dashboard", verifyUser, async (req, res) => {
  try {
    const users = await UserModel.find({}, "name email mobile");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/register", upload.single("profileImage"), async (req, res) => {
  const { name, email, password, mobile } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  // Mobile and Email Validation checks
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ error: "Mobile number is invalid" });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobilePattern = /^\d{10}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (!mobilePattern.test(mobile)) {
    return res
      .status(400)
      .json({ error: "Mobile number should be 10 digits long" });
  }

  try {
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      profileImage,
      verificationToken,
    });

    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

    console.log(verificationToken + "here");

    const mailOptions = {
      from: "pinkyanu877@gmail.com",
      to: email,
      subject: "Request Email Verification",
      text: `Click the following link to verify your email: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ err: "Failed to send verification token" });
      } else {
        console.log("Email sent:" + info.response);
        return res.json({
          message: "User registered successfully. Please verify your email",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/verify-email", async (req, res) => {
  const verificationToken = req.query.token;
  try {
    const user = await UserModel.findOne({
      verificationToken: verificationToken,
    });

    if (user) {
      return res
        .status(404)
        .json({ message: "Email Verified. You can log in your account" });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            { email: user.email, role: user.role },
            "jwt-secret-key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token);
          return res.json({ Status: "Success", role: user.role });
        } else {
          return res.json("Incorrect password");
        }
      });
    } else {
      return res.json("No record found");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
