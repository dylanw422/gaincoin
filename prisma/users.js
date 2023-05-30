import prisma from "./prisma";

export const getUser = async (twitter) => {
    const user = await prisma.users.findUnique({
        where: { twitter }
    })
    return user
}

export const getUserWithCode = async (referralCode) => {
    const user = await prisma.users.findUnique({
        where: { referralCode }
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

export const getLeaderboard = async () => {
    const users = await prisma.users.groupBy({
        by: ['referrer'],
        _count: { referrer: true },
        orderBy: {
            _count: {
                referrer: 'desc'
            }
        },
    })
    return users
}

export const createUser = async (address, points, referralCode, twitter, referrer) => {
    const user = await prisma.users.create({
      data: {
        address,
        points,
        referralCode,
        twitter,
        referrer
      }
    });
  
    // Check if the user has a referrer
    if (referrer) {
      const referrerUser = await prisma.users.findUnique({
        where: {
          referralCode: referrer
        }
      });
  
      // If the referrer user exists, update their points
      if (referrerUser) {
        const updatedPoints = referrerUser.points + 10000;
        await prisma.users.update({
          where: {
            referralCode: referrer
          },
          data: {
            points: updatedPoints
          }
        });
      }
    }
  
    return user;
  };