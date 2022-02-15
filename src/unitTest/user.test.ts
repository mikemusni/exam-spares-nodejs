import request from "supertest";
import app from "../appConfigs";

describe("User", () => {
    test("Login", async () => {
        const payload = {
            username: "",
            password: ""
        }
        const response = await request(app)
        .post("/user/login")
        .send(payload)
        .set("Content-type", "application/json")
        .expect(200);

        expect(response.body.status).toBeFalsy();
        expect(response.body.system).toBe("failed");
        expect(response.body.response.length).toBe(2);
    });
});