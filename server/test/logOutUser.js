const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../dist/models/user");
const bcrypt = require("bcrypt");

chai.use(chaiHttp);

describe("log out user", () => {
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

  it("should return 200 OK if the token is valid", async () => {
    const response = await request(app)
      .delete("/logout")
      .query({ token: currentUser.body.data.token });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body).to.have.property("data").to.be.empty;
  });

  it("should return 400 Bad Request if no token is provided", async () => {
    const response = await request(app).delete("/logout");

    expect(response).to.have.status(400);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body)
      .to.have.property("message")
      .to.be.equal("Token is required");
  });

  it("should return 401 Unauthorized if the token is invalid", async () => {
    const response = await request(app)
      .delete("/logout")
      .query({ token: "invalid-token" });

    expect(response).to.have.status(401);
    expect(response.body).to.have.property("success").to.be.false;
    expect(response.body)
      .to.have.property("message")
      .to.be.equal("Unauthorized, please provide a valid token");
  });
});
