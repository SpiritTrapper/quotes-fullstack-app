const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../dist");

chai.use(chaiHttp);

describe("get info about company", () => {
  const { request, expect } = chai;
  it("should get info", async () => {
    const response = await request(app).get("/info");

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("success").to.be.true;
    expect(response.body.data)
      .to.have.property("info")
      .equal("Some information about the <b>company</b>.");
  });
});
