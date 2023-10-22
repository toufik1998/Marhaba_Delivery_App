const auth = require("../controllers/authController");
const userModel = require("../models/userModel");
const jwtToken = require("../helpers/jwtToken");
const mailer = require("../helpers/mailer");
const bcrypt = require("bcryptjs");
jest.mock("../models/userModel");

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("test parti login ", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return status 400 if email is not allowed to be empty", async () => {
    const req = {
      body: {
        email: "",
        password: "toufik",
      },
    };
    await auth.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"email" is not allowed to be empty',
    });
  });

  it("should return status 400 if password is not allowed to be empty", async () => {
    const req = {
      body: {
        email: "toufik@gmail.com",
        password: "",
      },
    };
    await auth.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message:
        "Invalid password format. It should be alphanumeric and between 3 to 30 characters",
    });
  });

  it("should return status 400 if invalid email format", async () => {
    const req = {
      body: {
        email: "toufik@gmail.cokm",
        password: "toufik",
      },
    };
    await auth.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"email" must be a valid email',
    });
  });

  it("should return status 400 if email not found", async () => {
    const req = {
      body: {
        email: "toufik@gmail.com",
        password: "deaoudi",
      },
    };

    await jest.spyOn(userModel, "createUser").mockResolvedValue(null);

    await auth.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "email or password is wrong",
    });
  });

  it("should return status 400 if password is not correct", async () => {
    const req = {
      body: {
        email: "toufik@gmail.com",
        password: "deaoudi",
      },
    };

    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce({
      email: "toufik@gmail.com",
      password: "toufik",
    });

    await jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);

    await auth.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "email or password is wrong !!!",
    });
  });

  it("should return status 400 if not verify email", async () => {
    const req = {
      body: {
        email: "toufik@gmail.com",
        password: "toufik",
      },
    };

    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce({
      email: "toufik@gmail.com",
      password: "toufik",
    });

    await jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

    await jest.spyOn(jwtToken, "generateToken").mockResolvedValueOnce({
      _id: "123",
      username: "test",
      email: "toufik@gmail.com",
      password: "123",
      role: "123",
    });

    await jest.spyOn(mailer, "sendEmail").mockResolvedValueOnce({
      username: "toufik",
      email: "toufik@gmail.com",
      token: "DHD435TGFDGR6546TGFDG",
      subject: "Activation Email",
    });

    await auth.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "please verify your email",
    });
  });
});
