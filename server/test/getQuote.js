const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../dist/models/user");
const { Author } = require("../dist/models/author");
const { Quote } = require("../dist/models/quote");
const bcrypt = require("bcrypt");

chai.use(chaiHttp);

describe("get random quote", () => {
  let currentUser;
  const { request, expect } = chai;
  const id = uuidv4();
  const authorId = uuidv4();

  before(async () => {
    await User.create({
      id,
      email: "test@example.com",
      password: await bcrypt.hash("password", 10),
      fullname: "Test User",
    });

    await Author.create({
      id: authorId,
      name: "Luke Skywalker",
    });

    await Quote.create({
      id,
      authorId,
      text: "Teach me, Obi Van",
    });

    currentUser = await request(app).post("/login").send({
      email: "test@example.com",
      password: "password",
    });
  });

  after(async () => {
    await User.destroy({ where: { id } });
    await Author.destroy({ where: { id: authorId } });
    await Quote.destroy({ where: { id } });
  });

  it("should return a random quote from the author", async () => {
    const response = await request(app).get("/quote").query({
      token: currentUser.body.data.token,
      authorId,
    });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body.data).to.have.property("authorId");
    expect(response.body.data).to.have.property("quoteId");
    expect(response.body.data).to.have.property("quote");
  }).timeout(6000);

  it("should return an error if the token is invalid", async () => {
    const response = await request(app).get("/quote").query({
      token: "invalid-token",
      authorId,
    });

    expect(response).to.have.status(401);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body.data)
      .to.have.property("message")
      .to.equal("Unauthorized, please provide a valid token");
  });

  it("should return an error if the authorId is not provided", async () => {
    const response = await request(app)
      .get("/quote")
      .query({ token: currentUser.body.data.token });

    expect(response).to.have.status(400);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body)
      .to.have.property("message")
      .to.equal("Provide author id");
  });
});
