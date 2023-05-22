import { getUserWithCode } from 'prisma/users'
import { getServerSession } from "next-auth"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    try {
        switch (req.method) {
            case 'GET': {
                if (req.query.referralCode) {
                    const user = await getUserWithCode(req.query.referralCode)
                    return res.status(200).json(user)
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ ...error, message: error.message })
    }
}