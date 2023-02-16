const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { User } = require("../dist/models/user");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

chai.use(chaiHttp);

describe("user authentication", () => {
  const { request, expect } = chai;
  const id = uuidv4();

  before(async () => {
    await User.create({
      id,
      email: "test@example.com",
      password: await bcrypt.hash("password", 10),
      fullname: "Test User",
    });
  });

  after(async () => {
    await User.destroy({ where: { id } });
  });

  it("should return success on valid login", async () => {
    const response = await request(app).post("/login").send({
      email: "test@example.com",
      password: "password",
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body).to.have.property("data").to.have.property("token");
  });

  it("should return error on invalid login", async () => {
    const response = await request(app).post("/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body)
      .to.have.property("message")
      .equal("Password is incorrect");
  });
});
