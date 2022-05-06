// ** Setup ** //
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");


app.set("view engine", "ejs");

// Static resources path
app.use(express.static("public"));

// Test databases for urls and registered users
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
  yb6ik8: {
    longURL: "http://www.snehakm.com",
    userID: "9sm5xK",
  },
  "4r5T6y": {
    longURL: "https://github.com/",
    userID: "b2xVn2",
  },
  "4ry76y": {
    longURL: "https://www.snehakm.com/",
    userID: "b2xVn2",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk",
  },
  "9sm5xK": {
    id: "9sm5xK",
    email: "bob@bob.com",
    hashedPassword: "bob",
  },
  b2xVn2: {
    id: "b2xVn2",
    email: "sneha@sneha.com",
    hashedPassword: "sneha",
  },
};

// Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

// Function implementation for findURLs()
// Returns URLs for user.
const urlsForUser = (user) => {
  const { id } = user;

  let urls = {};
  for (const shortURL in urlDatabase) {
    const urlData = urlDatabase[shortURL];
    if (urlData.userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }

  return urls;
};

// ** Routes ** //

// Show all existing URLs
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  let message = "";
  let urls = urlDatabase;

  if (!user)
    message =
      "Please log into your account or register to edit or delete your URL's.";

  // Show filtered URL's
  if (user) urls = urlsForUser(user);

  const templateVars = {
    user,
    urls,
    message,
    title: "TinyApp",
  };
  res.render("urls_index", templateVars);
});

// Route to show page for new URL addition
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    title: "New URL - TinyApp",
  };
  if (!templateVars.user)
    return res
      .status(403)
      .send("<h1>You must log in to create a new URL.</h1>");

  res.render("urls_new", templateVars);
});

// Show URL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id],
    title: "URL Info - TinyApp",
  };

  res.render("urls_show", templateVars);
});

// Route to add a new URL
app.post("/urls", (req, res) => {
  const shortURL = generateID();
  urlDatabase[shortURL] = {
    longURL: req.body["longURL"],
    userID: req.session.user_id,
  };

  res.redirect("/urls");
});

// Redirect shortURL link to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  // Valid shortURL?
  if (!urlDatabase[shortURL])
    return res.status(400).send("Page does not exist!");

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Delete long URL row
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;

  if (!userID)
    return res.status(403).send("<h1>You must log in to delete this URL.</h1>");

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;

  if (!userID)
    return res.status(403).send("<h1>You must log in to edit this URL.</h1>");

  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID: req.session.user_id,
  };
  res.redirect("/urls");
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    title: "User login - TinyApp",
  };

  if (templateVars.user) return res.redirect("/urls");

  res.render("urls_login", templateVars);
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email);

  if (!user)
    return res
      .status(403)
      .send("<h1>This user does not exist. Please log in as a different user.</h1>");

  const checkPassword = bcrypt.compareSync(password, user.hashedPassword);
  if (!checkPassword)
    return res.status(403).send("<h1>This password is incorrect.</h1>");

  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Register page new user
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    title: "Register User - TinyApp",
  };

  if (templateVars.user) return res.redirect("/urls");

  res.render("urls_register", templateVars);
});

// Accept new user registration data
app.post("/register", (req, res) => {
  const id = generateID();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = findUser(email);

  if (email === "" || password === "")
    res.status(400).send("<h1>Enter a valid email and/or password.</h1>");

  if (user) {
    res
      .status(400)
      .send("<h1>This user already exists. Enter a new email.</h1>");
  } else {
    // Add user
    users[id] = {
      id,
      email,
      hashedPassword,
    };

    req.session.user_id = users[id].id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
