const { fail, ok } = require("../helpers/returns");
const { prisma } = require("../utils/db/prisma_connection");
const { RELEASE_REGEXP } = require("../utils/constants/regexp");
const { deleteFile } = require("../utils/buckets/bucket");

const getRelease = async ({ packageName, release }) => {
  await prisma.$connect();

  const c = await prisma.release
    .findUnique({
      where: {
        package: {
          name: packageName,
        },
        release,
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

const getReleases = async ({
  filter = { userId: null, packageId: null, packageName: null },
  take = 10,
  skip = 0,
}) => {
  await prisma.$connect();
  const where = {};
  if (filter.userId) where.userId = filter.userId;
  if (filter.packageId) where.packageId = filter.packageId;
  if (filter.packageName) where.package = { name: filter.packageName };

  const c = await prisma.release
    .findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      take: take > 10 ? 10 : isNaN(take) ? 10 : take,
      skip: isNaN(skip) ? 0 : skip,
    })
    .catch(async (err) => {
      await prisma.$disconnect();
      return null;
    });
  if (c == null) return fail();
  await prisma.$disconnect();
  return ok(c);
};

const postRelease = async ({ userId, packageId, release }) => {
  if (!RELEASE_REGEXP.test(release.release)) return fail("Invalid Release");
  await prisma.$connect();

  const c = await prisma.release
    .create({
      data: {
        userId,
        packageId,
        zig_version: release.zig_version,
        release: release.release,
        root_file: release.root_file,
        hash: release.hash,
        url: release.url,
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

const patchRelease = async ({ id, userId, release }) => {
  // if (!RELEASE_REGEXP.test(release)) return fail()
  await prisma.$connect();

  const c = await prisma.release
    .update({
      where: {
        userId,
        id,
      },
      data: {
        zig_version: release.zig_version,
        release: release.release,
        root_file: release.root_file,
        hash: release.hash,
        url: release.url,
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

const deleteRelease = async ({ id, userId, packageId }) => {
  await prisma.$connect();

  const c = await prisma.release
    .delete({
      where: {
        id,
        userId,
        packageId,
      },
      select: {
        hash: true,
        package: {
          select: {
            name: true,
          },
        },
        release: true,
      },
    })
    .catch(async (err) => {
      await prisma.$disconnect();
      return null;
    });
  if (c == null) return fail();

  const parsed = await deleteFile(
    `packages/${userId}`,
    `${c.package.name}-${c.release}.tar.zstd`,
  );

  await prisma.$disconnect();
  return ok(c);
};

module.exports = {
  getRelease,
  getReleases,
  postRelease,
  patchRelease,
  deleteRelease,
};
