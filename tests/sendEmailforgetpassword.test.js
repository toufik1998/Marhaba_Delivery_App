const auth = require("../controllers/authController");
jest.mock("../models/userModel");
const userModel = require("../models/userModel");
const jwtToken = require("../helpers/jwtToken");
const mailer = require("../helpers/mailer");

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("test parti send email for forget password ", () => {
  it("should return status 400 if email is not allowed to be empty", async () => {
    const req = {
      body: {
        email: "",
      },
    };
    
    await auth.sendEmailforgetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"email" is not allowed to be empty',
    });
  });

  it("should status 400 if invalid email format", async () => {
    const req = {
      body: {
        email: "toufik@gmail.c12om",
      },
    };

    auth.sendEmailforgetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"email" must be a valid email',
    });
  });

  it("should status 400 if user not found", async () => {
    const req = {
      body: {
        email: "testing@gmail.com",
      },
    };

    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce(null);
    await auth.sendEmailforgetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "user not found",
    });
  });

  it("should status 200 if please check your email", async () => {
    const req = {
      body: {
        email: "toufik@gmail.com",
      },
    };

    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce({
      _id: "1234",
      email: "toufik@gmail.com",
      password: "toufik",
    });

    await jest.spyOn(jwtToken, "generateToken").mockResolvedValueOnce({
      _id: "1234",
      email: "toufik@gmail.com",
      password: "toufik",
    });

    await jest
      .spyOn(mailer, "sendEmail")
      .mockResolvedValueOnce(
        "username",
        "toufik@gmail.com",
        "DFG34543",
        "Activation Email"
      );

    await auth.sendEmailforgetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "please check your email",
    });
  });
});
