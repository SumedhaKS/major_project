const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();


async function main() {
    const alice = await prisma.users.upsert({
        where: {
            username: "alice"
        },
        update: {},
        create: {
            username: "alice",
            password: await bcrypt.hash("alice", 10),
            role: "staff"
        },
    })
    console.log(alice)
}

main()
    .then(async ()=>{
        await prisma.$disconnect()
    }) 
    .catch(async (e)=>{
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
