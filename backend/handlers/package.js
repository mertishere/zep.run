const { fail, ok } = require("../helpers/returns");
const { prisma } = require("../utils/db/prisma_connection");
const { PACKAGE_NAME_REGEXP } = require("../utils/constants/regexp");

const getPackage = async ({
  filter = {
    id: null,
    name: null,
  },
}) => {
  await prisma.$connect();
  const where = {};
  if (filter.id) where.id = filter.id;
  if (filter.name) where.name = filter.name;

  const c = await prisma.zpackage
    .findUnique({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        releases: {
          select: {
            id: true,
            root_file: true,
            zig_version: true,
            hash: true,
            url: true,
            release: true,
          },
        },
      },
    })
    .catch(async (err) => {
      console.error(err);
      await prisma.$disconnect();
      return null;
    });

  if (c == null) return fail();

  await prisma.$disconnect();
  return ok(c);
};

const getPackages = async ({
  filter = { userId: null, query: null },
  take = 10 * 3,
  skip = 0,
}) => {
  await prisma.$connect();
  const where = {};
  if (filter.userId) where.userId = filter.userId;
  if (filter.query) {
    where.OR = [
      { name: { contains: filter.query, mode: "insensitive" } },
      { description: { contains: filter.query, mode: "insensitive" } },
      { tags: { contains: filter.query, mode: "insensitive" } }, // if tags is String[]
      {
        user: {
          username: { contains: filter.query, mode: "insensitive" },
        },
      },
    ];
  }

  const c = await prisma.zpackage
    .findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        releases: {
          select: {
            release: true,
          },
        },
      },
      take: take > 30 ? 30 : isNaN(take) ? 30 : take,
      skip: isNaN(skip) ? 0 : skip,
    })
    .catch(async (err) => {
      console.log(err);
      await prisma.$disconnect();
      return null;
    });

  if (c == null) return fail();

  await prisma.$disconnect();
  return ok(c);
};

const fs = require("fs");
const path = require("path");
const getLocalPackage = async ({ name }) => {
  const folderName = "static/packages/";
  const p = path.join(folderName, `${name}.json`);
  var object = JSON.parse(fs.readFileSync(p, "utf8"));
  return ok(object);
};

const getLocalPackages = async ({}) => {
  const folderName = "static/packages/";
  const fileNames = fs.readdirSync(folderName).map((fileName) => {
    return path.join(folderName, fileName);
  });
  const files = [];
  for (let fileName of fileNames) {
    var object = JSON.parse(fs.readFileSync(fileName, "utf8"));
    files.push(object);
  }

  return ok(files);
};

const countPackages = async () => {
  await prisma.$connect();
  const c = await prisma.zpackage.count({}).catch(async (err) => {
    await prisma.$disconnect();
    return null;
  });

  if (c == null) return fail();
  await prisma.$disconnect();
  return ok(c);
};

const postPackage = async ({ userId, package }) => {
  if (!PACKAGE_NAME_REGEXP.test(package.name)) return fail();
  await prisma.$connect();

  const c = await prisma.zpackage
    .create({
      data: {
        userId,
        name: package.name,
        description: package.description,
        docs: package.docs,
        tags: package.tags,
      },
    })
    .catch(async (err) => {
      await prisma.$disconnect();
      return null;
    });
  if (c == null) return fail();

  await prisma.$disconnect();
  return ok(c);
};

const patchPackage = async ({ id, userId, package }) => {
  if (!PACKAGE_NAME_REGEXP.test(package.name)) return fail();
  await prisma.$connect();

  await prisma.zpackage
    .update({
      where: {
        userId,
        id,
      },
      data: {
        name: package.name,
        description: package.description,
        docs: package.docs,
        tags: package.tags,
      },
    })
    .catch(async (err) => {
      await prisma.$disconnect();
      return null;
    });

  if (c == null) return fail();
  await prisma.$disconnect();
  return ok();
};

const deletePackage = async ({ id, userId }) => {
  await prisma.$connect();

  await prisma.zpackage
    .delete({
      where: {
        id,
        userId,
      },
    })
    .catch(async (err) => {
      await prisma.$disconnect();
      return null;
    });

  if (c == null) return fail();

  await prisma.$disconnect();
  return ok();
};

module.exports = {
  getPackage,
  getPackages,
  getLocalPackage,
  getLocalPackages,
  countPackages,
  postPackage,
  patchPackage,
  deletePackage,
};
