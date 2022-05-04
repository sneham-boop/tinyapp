// ** Setup ** //
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// Static resources path
app.use(express.static("public"));

// Test databases
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Middlewares
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// ** Helper functions ** //
// Function implementation for generateRandomString()
// Returns a randomly generated string of length strLen
const generateID = () => {
  let id = "";
  let strLen = 6;
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < strLen; i++) {
    const randIndex = Math.floor(Math.random() * chars.length);
    id = id.concat(chars[randIndex]);
  }
  return id;
};

// Function implementation for findUser()
// Returns user if user email is found.
const findUser = (email) => {
  const user_ids = Object.keys(users);
  const id = user_ids.find((user_id) => users[user_id].email === email);
  const user = users[id];
  return user;
};

// ** Routes ** //

// Show all existing URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
    title: "TinyApp",
  };
  res.render("urls_index", templateVars);
});

// Route to show page for new URL addition
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    title: "New URL - TinyApp",
  };
  res.render("urls_new", templateVars);
});

// Show URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
    title: "URL Info - TinyApp",
  };
  res.render("urls_show", templateVars);
});

// Route to add a new URL
app.post("/urls", (req, res) => {
  const shortURL = generateID();
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect("/urls");
});

// Redirect shortURL link to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete long URL row
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    title: "User login - TinyApp",
  };
  res.render("urls_login", templateVars);
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email);

  if (!user) res.status(403).send("User does not exist.");

  if (user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Password incorrect.");
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Register page new user
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    title: "Register User - TinyApp",
  };
  res.render("urls_register", templateVars);
});

// Accept new user registration data
app.post("/register", (req, res) => {
  const id = generateID();
  const { email, password } = req.body;
  const user = findUser(email);

  if (email === "" || password === "")
    res.status(400).send("Enter a valid email and/or password.");

  if (user) {
    res.status(400).send("This user already exists. Enter a new email.");
  } else {
    // Add user
    users[id] = {
      id,
      email,
      password,
    };
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
