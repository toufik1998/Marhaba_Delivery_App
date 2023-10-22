const auth = require("../controllers/authController");
const userModel = require("../models/userModel");
const userRole = require("../models/roleModel");
const bcrypt = require("bcryptjs");
const jwtToken = require("../helpers/jwtToken");

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe("test parti Register ", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return status 400 if username is not allowed to be empty", async () => {
    const req = {
      body: {
        username: "",
        role: "client",
        email: "test@gmail.com",
        password: "test123",
        repeat_password: "test123",
      },
    };
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"username" is not allowed to be empty',
    });
  });

  it("should return status 400 if email is not allowed to be empty", async () => {
    const req = {
      body: {
        username: "test",
        role: "client",
        email: "",
        password: "test123",
        repeat_password: "test123",
      },
    };
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"email" is not allowed to be empty',
    });
  });

  it("should return status 400 if invalid email format", async () => {
    const req = {
      body: {
        username: "test",
        role: "client",
        email: "test@gmail.comss",
        password: "test123",
        repeat_password: "test123",
      },
    };
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"email" must be a valid email',
    });
  });

  it("should return status 400 if role is not allowed to be empty or invalid role", async () => {
    const req = {
      body: {
        username: "test",
        role: "dev",
        email: "test@gmail.com",
        password: "test123",
        repeat_password: "test123",
      },
    };
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "role must be one of [client, manager, livreur]",
    });
  });

  it("should return status 400 if password is not allowed to be empty", async () => {
    const req = {
      body: {
        username: "test",
        role: "manager",
        email: "test@gmail.com",
        password: "",
        repeat_password: "",
      },
    };
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"password" is not allowed to be empty',
    });
  });

  it("should return status 400 if invalid repeat_password must be password", async () => {
    const req = {
      body: {
        username: "test",
        role: "manager",
        email: "test@gmail.com",
        password: "test",
        repeat_password: "jjjj",
      },
    };
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: '"repeat_password" must be [ref:password]',
    });
  });

  it("should return status 400 if user already existed", async () => {
    const req = {
      body: {
        username: "test",
        role: "manager",
        email: "toufik@gmail.com",
        password: "toufik",
        repeat_password: "toufik",
      },
    };
    await jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    await jest.spyOn(userRole, "getRole").mockResolvedValueOnce({
      _id: "123",
      role: "manager",
    });

    await jest.spyOn(userModel, "createUser").mockResolvedValueOnce({
      name: "MongoServerError",
      code: 11000,
      keyValue: { email: "toufik@gmail.com" },
      keyPattern: { email: 1 },
      message:
        'E11000 duplicate key error collection: AlloMedia.users index: email_1 dup key: { email: "toufik@gmail.com" }',
    });
    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "email already exists",
    });
  });

  it("should return status 201 if success registe ", async () => {
    const req = {
      body: {
        username: "test",
        role: "manager",
        email: "toufik@gmail.com",
        password: "toufik",
        repeat_password: "toufik",
      },
    };
    await jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    await jest.spyOn(userRole, "getRole").mockResolvedValueOnce({
      _id: "123",
      role: "manager",
    });

    await jest.spyOn(userModel, "createUser").mockResolvedValueOnce({
      _id: "123",
      username: "toufik",
      email: "toufik@gmail.com",
      password: "toufik",
      role: {
        _id: "123",
        role: "manager",
      },
    });

    await jest.spyOn(jwtToken, "generateToken").mockResolvedValueOnce({
      _id: "123",
      username: "test",
      email: "toufik@gmail.com",
      password: "123",
      role: "123",
    });

    await auth.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "please verify your email",
    });
  });
});
