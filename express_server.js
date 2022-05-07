// **************************************************************************//
// Main server //
// **************************************************************************//

// ** Setup ** //
const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { findUserByEmail, urlsForUser, generateID } = require("./helpers");

const app = express();
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080
app.use(express.static("public"));

// ** Middleware ** //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 30 * 60 * 1000, // 30 minutes session
  })
);

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
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10),
  },
  "9sm5xK": {
    id: "9sm5xK",
    email: "bob@bob.com",
    hashedPassword: bcrypt.hashSync("bob", 10),
  },
  b2xVn2: {
    id: "b2xVn2",
    email: "sneha@sneha.com",
    hashedPassword: bcrypt.hashSync("sneha", 10),
  },
};

// ** Routes ** //

// Show all existing URLs
app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  let showURLs = true;
  let urls = {};

  if (!user) showURLs = false;

  // Show filtered URL's
  if (user) urls = urlsForUser(user, urlDatabase);
  const numberOfURLs = Object.keys(urls).length;

  const templateVars = {
    user,
    urls,
    showURLs,
    numberOfURLs,
    title: "TinyApp",
  };
  res.render("urls_index", templateVars);
});

// Route to show page for new URL addition
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
    title: "New URL - TinyApp",
  };

  if (!templateVars.user) {
    const message = {
      user: users[req.session.userID],
      text: "Please login before creating a new URL!",
      title: "User Login - TinyApp",
    };
    return res.status(403).render("urls_login", message);
  }

  res.render("urls_new", templateVars);
});

// Redirect user link to /urls for these routes
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/home", (req, res) => {
  res.redirect("/urls");
});

// Show URL page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.userID],
    title: "URL Info - TinyApp",
  };

  res.render("urls_show", templateVars);
});

// Route to add a new URL
app.post("/urls", (req, res) => {
  const shortURL = generateID();
  urlDatabase[shortURL] = {
    longURL: req.body["longURL"],
    userID: req.session.userID,
  };

  res.redirect(`/urls/${shortURL}`);
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
  const userID = req.session.userID;

  if (!userID) {
    const message = {
      user: undefined,
      text: "You must log in before deleting this URL!",
      title: "User Login - TinyApp",
    };
    return res.status(403).render("urls_login", message);
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;

  if (!userID) {
    const message = {
      user: undefined,
      text: "You must log in before editing this URL!",
      title: "User Login - TinyApp",
    };
    return res.status(403).render("urls_login", message);
  }

  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID: req.session.userID,
  };
  res.redirect("/urls");
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
    title: "User login - TinyApp",
    text: "",
  };

  if (templateVars.user) return res.redirect("/urls");

  res.render("urls_login", templateVars);
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  const message = {
    user: undefined,
    text: "",
    title: "User Login - TinyApp",
  };

  if (!user) {
    message.text =
      "This user does not exist. Please log in as a different user!";
    return res.status(403).render("urls_login", message);
  }

  const checkPassword = bcrypt.compareSync(password, user.hashedPassword);
  if (!checkPassword) {
    message.text = "Password is incorrect. Please try a different one!";
    return res.status(403).render("urls_login", message);
  }

  req.session.userID = user.id;
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
    user: users[req.session.userID],
    title: "Register User - TinyApp",
    text: "",
  };

  if (templateVars.user) return res.redirect("/urls");

  res.render("urls_register", templateVars);
});

// Accept new user registration data
app.post("/register", (req, res) => {
  const id = generateID();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = findUserByEmail(email, users);
  const message = {
    user: undefined,
    text: "",
    title: "Register User - TinyApp",
  };

  if (email === "" || password === "") {
    message.text = "Enter a valid email and/or password.";
    return res.status(400).render("urls_register", message);
  }

  if (user) {
    message.text = "This user already exists. Enter a new email.";
    return res.status(400).render("urls_register", message);
  }
  // Add user if info valid
  users[id] = {
    id,
    email,
    hashedPassword,
  };

  req.session.userID = users[id].id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});
