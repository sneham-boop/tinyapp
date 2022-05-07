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

// Function implementation for findUserByEmail()
// Returns user if user email is found in user database.
const findUserByEmail = (email, database) => {
  if (email === null || database === null) return undefined;

  const user_ids = Object.keys(database);
  const id = user_ids.find((user_id) => database[user_id].email === email);
  const user = database[id];
  return user;
};

// Function implementation for findURLs()
// Returns URLs for user.
const urlsForUser = (user, database) => {

  if (!user) return undefined;

  const { id } = user;

  let urls = {};
  for (const shortURL in database) {
    const urlData = database[shortURL];
    if (urlData.userID === id) {
      urls[shortURL] = database[shortURL];
    }
  }

  return urls;
};

module.exports = {
  findUserByEmail,
  generateID,
  urlsForUser,
};
