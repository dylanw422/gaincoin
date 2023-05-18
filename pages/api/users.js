import { getUser, getAllUser, createUser } from "prisma/users"

export default async function handler(req, res) {
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
                try {
                    const { address, points, referralCode, twitter } = req.body
                    const user = await createUser(address, points, referralCode, twitter)
                    return res.json(user)
                } catch (error) {
                    if (error.meta.target === 'users_address_key') {
                        res.status(400).send({
                            error: 'Address already used.'
                        })
                    } else if (error.meta.target === 'users_referralCode_key') {
                        res.status(400).send({
                            error: 'Bad Referral Code'
                        })
                    } else {
                        res.status(400).send({
                            error: 'Twitter already used.'
                        })
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ ...error, message: error.message })
    }
}