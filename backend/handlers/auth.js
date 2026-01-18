const { prisma } = require("../utils/db/prisma_connection");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const { fail, ok } = require("../helpers/returns");
const { getUser } = require("./user");

const createSession = async ({ id }) => {
  const secret = uuid.v4();

  const session = await prisma.session
    .create({
      data: {
        secret,
        userId: id,
      },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            id: true,
          },
        },
      },
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
  if (session == null) return fail("Creating session failed");
  return ok(session);
};

const getSession = async ({ secret, id, userId }) => {
  const session = await prisma.session
    .findUnique({
      where: {
        id,
        secret,
        userId,
      },
    })
    .catch(() => {
      return null;
    });
  if (session == null) return fail();
  return ok(session);
};

const deleteSessionById = async ({ id }) => {
  const c = await prisma.session
    .delete({
      where: {
        id,
      },
    })
    .catch(() => {
      return null;
    });
  if (c == null) return fail();

  return ok();
};

const authUser = async ({ email, password }) => {
  await prisma.$connect();
  const [user_success, user] = await getUser({
    filter: {
      email,
    },
  });
  if (!user_success) return fail("User not found");

  const bc = await bcrypt.compare(password, user.password);
  if (!bc) return fail("Invalid password");

  const [session_success, session, session_error] = await createSession({
    id: user.id,
  });
  if (!session_success) return fail("Server Error");

  await prisma.$disconnect();
  return ok(session);
};

const createVerification = async ({ email }) => {
  const c = await prisma.verify
    .create({
      data: {
        code,
        user: {
          email,
        },
      },
    })
    .catch(() => {
      return null;
    });
  if (c == null) return fail();
  return ok(c);
};

const verifyUser = async ({ email, code }) => {
  const verification = await prisma.verify
    .delete({
      where: {
        code,
        user: {
          email,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
      select: {
        created_at: true,
      },
    })
    .catch(() => {
      return null;
    });
  if (verification == null) return fail();

  if (
    new Date(verification.created_at).getTime() + 10 * 60 * 1000 <
    new Date().getTime()
  ) {
    return fail("Verification Code has expired.");
  }

  const c = await prisma.user
    .update({
      where: {
        id: verification.userId,
      },
      data: {
        verified: true,
      },
    })
    .catch(() => {
      return null;
    });
  if (c == null) return fail();

  return ok(c);
};

module.exports = {
  authUser,
  createSession,
  getSession,
  deleteSessionById,
  createVerification,
  verifyUser,
};
