import { getUser, getAllUser, createUser } from "prisma/users"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    const points = session?.twitter.followersCount*10 + session?.twitter.tweetsCount*10 + session?.twitter.likesCount*10
    try {
        switch (req.method) {
            case 'GET': {
                if (req.query.twitter) {
                    const user = await getUser(req.query.twitter)
                    return res.status(200).json(user)
                } else {
                    const users = await getAllUser()
                    return res.status(200).json(users)
                }
            }
            case 'POST': {
                if (session) {
                  const existingUser = await getUser(session.twitter.twitterHandle);
                  if (existingUser) {
                    return res.status(400).json({
                      error: 'Twitter already used.'
                    });
                  }
              
                  try {
                    const { address, referralCode, referrer } = req.body;
                    const user = await createUser(address, points, referralCode, session.twitter.twitterHandle, referrer);
                    return res.json(user);
                  } catch (error) {
                    if (error.meta.target === 'users_address_key') {
                      return res.status(400).json({
                        error: 'Address already used.'
                      });
                    } else if (error.meta.target === 'users_referralCode_key') {
                      return res.status(400).json({
                        error: 'Bad Referral Code'
                      });
                    } else {
                      return res.status(400).json({
                        error: 'Twitter already used.'
                      });
                    }
                  }
                } else {
                  return res.status(401).json({
                    error: 'Not Authorized'
                  });
                }
              }
        }
    } catch (error) {
        return res.status(500).json({ ...error, message: error.message })
    }
}