const { PrismaClient } = require("./generated/prisma/client")

const prisma = new PrismaClient();

module.exports = prisma;    // needs to be checked