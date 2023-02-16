const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { User } = require("../dist/models/user");

chai.use(chaiHttp);

describe("user registration", () => {
  const { request, expect } = chai;
  const data = Object.freeze({
    email: "test@example.com",
    password: "password",
    fullname: "Test User",
  });

  after(async () => {
    await User.destroy({ where: { email: data.email } });
  });

  it("should successfully register a new user", async () => {
    await User.destroy({ where: { email: data.email } });
    const response = await request(app).post("/register").send(data);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body).to.have.property("data").to.be.empty;
  });

  it("should return error if email is already in use", async () => {
    const response = await request(app).post("/register").send(data);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body).to.have.property("errors");
  });

  it("should return error if email is not valid", async () => {
    const response = await request(app)
      .post("/register")
      .send({
        ...data,
        email: "wrong-email",
      });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body).to.have.property("errors");
    expect(response.body.errors).to.be.an("array");
    expect(response.body.errors[0]).to.deep.include({
      message: "Email must be valid",
    });
  });
});
