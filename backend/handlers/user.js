const { fail, ok } = require("../helpers/returns");
const { prisma } = require("../utils/db/prisma_connection");
const { USRENAME_REGEXP, EMAIL_REGEXP } = require("../utils/constants/regexp");
const bcrypt = require("bcrypt");

const getUser = async ({
  filter = {
    id: null,
    email: null,
    username: null,
  },
}) => {
  const where = {};
  if (filter.id) where.id = filter.id;
  if (filter.email) where.email = filter.email;
  if (filter.username) where.username = filter.username;
  const user = await prisma.user
    .findUnique({
      where,
    })
    .catch((err) => {
      return null;
    });
  if (user == null) return fail();

  return ok(user);
};

const getUsers = async ({
  filter = {
    query: null,
  },
  take = 10,
  skip = 0,
}) => {
  const where = {};
  if (filter.query) {
    where.OR = [{ username: { contains: filter.query, mode: "insensitive" } }];
  }

  const user = await prisma.user
    .findMany({
      where,
      take: take > 10 ? 10 : isNaN(take) ? 10 : take,
      skip: isNaN(skip) ? 0 : skip,
    })
    .catch((err) => {
      return null;
    });
  if (user == null) return fail();

  return ok(user);
};

const countUsers = async () => {
  await prisma.$connect();
  const c = await prisma.user.count({}).catch(async (err) => {
    await prisma.$disconnect();
    return null;
  });
  if (c == null) return fail();

  await prisma.$disconnect();
  return ok(c);
};

const postUser = async ({ user }) => {
  if (!EMAIL_REGEXP.test(user.email)) return fail();
  if (!USRENAME_REGEXP.test(user.username)) return fail();
  const hashed_password = await bcrypt.hash(user.password, 10);

  const c = await prisma.user
    .create({
      data: {
        username: user.username,
        email: user.email,
        password: hashed_password,
      },
    })
    .catch((err) => {
      return null;
    });
  if (c == null) return fail();
  return ok(c);
};

const patchUser = async ({ id, user }) => {
  if (!USRENAME_REGEXP.test(user.username)) return fail();

  const c = await prisma.user
    .update({
      where: {
        id,
      },
      data: {
        username: user.username,
      },
    })
    .catch((err) => {
      return null;
    });
  if (c == null) return fail();
  return ok();
};

const patchPassword = async ({ id, password }) => {
  const hashed_password = await bcrypt.hash(password, 10);

  const c = await prisma.user
    .update({
      where: {
        id,
      },
      data: {
        password: hashed_password,
      },
    })
    .catch((err) => {
      return null;
    });
  if (c == null) return fail();
  return ok();
};

const deleteUser = async ({ id }) => {
  const c = await prisma.user
    .create({
      data: {
        id,
      },
    })
    .catch((err) => {
      return null;
    });
  if (c == null) return fail();
  return ok();
};

module.exports = {
  getUser,
  getUsers,
  countUsers,
  postUser,
  patchUser,
  patchPassword,
  deleteUser,
};
