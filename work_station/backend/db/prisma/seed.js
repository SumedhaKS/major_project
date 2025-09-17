const bcrypt = require("bcrypt");
const { PrismaClient } = require("../generated/prisma/client")
const prisma = new PrismaClient();


async function main() {
    const alice = await prisma.user.upsert({
        where: {
            username: "alice@alice.com"
        },
        update: {},
        create: {
            username: "alice@alice.com",
            password: await bcrypt.hash("alice", 10),
            role: "staff"
        },
    })
    const dummmyPatient1 = await prisma.patient.upsert({
        where: {
            id: 1
        },
        update: {},
        create: {
            patientId: "PT000001",
            name:"dummyPatient1",
            age:100,
            gender:"Male",
            phone: "1111111111"
        },
    })
    console.log(alice);
    console.log(dummmyPatient1);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
