import { getUserWithCode } from 'prisma/users'

export default async function handler(req, res) {
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