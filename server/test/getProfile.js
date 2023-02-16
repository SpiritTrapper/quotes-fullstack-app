const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../dist/models/user");
const bcrypt = require("bcrypt");

chai.use(chaiHttp);

describe("get profile information", () => {
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

  it("should return simple user information for the authenticated user", async () => {
    const response = await request(app)
      .get("/profile")
      .query({ token: currentUser.body.data.token });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body.data).to.have.property("fullname").to.equal("Test User");
    expect(response.body.data)
      .to.have.property("email")
      .to.equal("test@example.com");
  });

  it("should return error if the user is not found", async () => {
    const response = await request(app)
      .get("/profile")
      .query({ token: "invalidToken" });

    expect(response).to.have.status(401);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body.data)
      .to.have.property("message")
      .to.equal("Unauthorized, please provide a valid token");
  });
});
