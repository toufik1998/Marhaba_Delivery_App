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

describe("Reset Password", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should return status 400 if password is not allowed to be empty ", async () => {
    const req = {
      body: {
        new_password: "",
        repeat_password: "test",
        old_password: "1234",
      },
    };

    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"new_password" is not allowed to be empty',
    });
  });

  it("should return status 400 if repeat_password is Invalid ", async () => {
    const req = {
      body: {
        new_password: "12343553",
        repeat_password: "",
        old_password: "1345666666",
      },
    };

    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"repeat_password" must be [ref:new_password]',
    });
  });

  it("should return status 400 if old_password is Invalid ", async () => {
    const req = {
      body: {
        new_password: "12343553",
        repeat_password: "12343553",
        old_password: "",
      },
    };

    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"old_password" is not allowed to be empty',
    });
  });

  it("should return status 400 if user not found to decoded token ", async () => {
    const req = {
      body: {
        new_password: "12343553",
        repeat_password: "12343553",
        old_password: "12343553",
      },
    };

    await jest
      .spyOn(jwtToken, "decoded")
      .mockResolvedValueOnce("ljmlskdjgmkljrmeljtmlfjkmlsqjgml");
    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "user not found !!!",
    });
  });

  it("should return status 400 if user not found ", async () => {
    const req = {
      body: {
        new_password: "12343553",
        repeat_password: "12343553",
        old_password: "12343553",
      },
    };

    await jest.spyOn(jwtToken, "decoded").mockResolvedValue({
      user: {
        _id: "1234",
        email: "toufik@gmail.com",
      },
    });
    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce(null);
    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "user not found",
    });
  });

  it("should return status 400 if old password is wrong ", async () => {
    const req = {
      body: {
        new_password: "12343553",
        repeat_password: "12343553",
        old_password: "12343553",
      },
    };

    await jest.spyOn(jwtToken, "decoded").mockResolvedValue({
      user: {
        _id: "1234",
        email: "toufik@gmail.com",
      },
    });
    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce({
      _id: "1234",
      email: "toufik@gmail.com",
    });
    await jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "old password is wrong",
    });
  });

  it("should return status 201 if password updated ", async () => {
    const req = {
      body: {
        new_password: "12343553",
        repeat_password: "12343553",
        old_password: "12343553",
      },
    };

    await jest.spyOn(jwtToken, "decoded").mockResolvedValue({
      user: {
        _id: "1234",
        email: "toufik@gmail.com",
      },
    });
    await jest.spyOn(userModel, "findUserbyEmail").mockResolvedValueOnce({
      _id: "1234",
      email: "toufik@gmail.com",
    });
    await jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    await auth.resetpassword(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "password updated",
    });
  });
});
