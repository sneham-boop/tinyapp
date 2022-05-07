const { assert } = require("chai");
const { findUserByEmail, urlsForUser } = require("../helpers");

const testUsers = {
  RhJsk8: {
    id: "RhJsk8",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  hjfg45: {
    id: "hjfg45",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testUrlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "RhJsk8",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "hjfg45",
  },
};

describe("#findUserByEmail", function () {
  it("returns a user with valid email", function () {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "RhJsk8";
    assert.strictEqual(user.id, expectedUserID);
  });

  it("returns undefined with an invalid email", function () {
    const user = findUserByEmail("user5@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });

  it('returns a value of type "object"', function () {
    const user = findUserByEmail("user@example.com", testUsers);
    assert.strictEqual(typeof user, "object");
  });

  it("returns undefined for an null database", function () {
    const user = findUserByEmail("user5@example.com", null);
    assert.strictEqual(user, undefined);
  });

  it("returns undefined for an null email", function () {
    const user = findUserByEmail(null, testUsers);
    assert.strictEqual(user, undefined);
  });
});

describe("#urlsForUser", function () {
  it("returns a url owned by user id", function () {
    const user = testUsers.RhJsk8;
    const expectedLongURL = ["http://www.lighthouselabs.ca"];
    const urls = urlsForUser(user,testUrlDatabase);
    let longURL = [];
    for(const url in urls) {
      longURL.push(urls[url].longURL);
    }
    assert.deepEqual(longURL, expectedLongURL);
  });

  it("returns undefined for an invalid user id", function () {
    const user = testUsers.RhJsk9;
    const urls = urlsForUser(user,testUrlDatabase);
    assert.strictEqual(urls, undefined);
  });
});
