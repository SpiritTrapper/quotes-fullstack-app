const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { User } = require("../dist/models/user");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

chai.use(chaiHttp);

describe("creating a quote", () => {
  let currentUser;
  const { request, expect } = chai;
  const id = uuidv4();

  before(async () => {
    await User.create({
      id,
      email: "test@example.com",
      password: await bcrypt.hash("password", 10),
      fullname: "Test User",
    });

    currentUser = await request(app).post("/login").send({
      email: "test@example.com",
      password: "password",
    });
  });

  after(async () => {
    await User.destroy({ where: { id } });
  });

  it("should create a new quote and author successfully", async () => {
    const response = await request(app).post("/create").send({
      name: "John Doe",
      quote: "Life is too short to waste time.",
      token: currentUser.body.data.token,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body).to.have.property("data").to.be.empty;
  });

  it("should return an error if token is invalid", async () => {
    const response = await request(app).post("/create").send({
      name: "John Doe",
      quote: "Life is too short to waste time.",
      token: "invalidToken",
    });

    expect(response.status).to.equal(401);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body.data)
      .to.have.property("message")
      .equal("Unauthorized, please provide a valid token");
  });
});
