import prisma from "./prisma";

export const getUser = async (twitter) => {
    const user = await prisma.users.findUnique({
        where: { twitter }
    })
    return user
}

export const getAllUser = async () => {
    const users = await prisma.users.findMany({
        orderBy: [
            {
                points: 'desc'
            }
        ]
    })
    return users
}

export const createUser = async ( address, points, referralCode, twitter ) => {
    const user = await prisma.users.create({
        data: {
            address,
            points,
            referralCode,
            twitter
        }
    })
    return user
}