const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../dist/models/user");
const bcrypt = require("bcrypt");

chai.use(chaiHttp);

describe("get author information", () => {
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

  it(
    "should return random author information",
    async () => {
      const response = await request(app)
        .get("/author")
        .query({ token: currentUser.body.data.token });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property("success").to.be.true;
      expect(response.body.data).to.have.property("authorId");
      expect(response.body.data).to.have.property("name");
    }
  ).timeout(6000);

  it("should handle errors correctly", async () => {
    const res = await request(app)
      .get("/author")
      .query({ token: "invalid-token" });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property("success").to.be.false;
    expect(res.body.data)
      .to.have.property("message")
      .to.equal("Unauthorized, please provide a valid token");
  });
});
