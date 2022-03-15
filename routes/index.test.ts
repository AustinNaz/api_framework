import request from "supertest";
import app from "../utils/createTestServer"

describe("First Routes", () => {
  it("Get should work", async () => {
    await request(app).get('/').expect(200, "Welcome to the Framework!")
  })
})