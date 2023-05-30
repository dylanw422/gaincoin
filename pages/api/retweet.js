import { getServerSession } from "next-auth"
import { authOptions } from "./auth/[...nextauth]"
import Twit from "twit"

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)
    const twit = new Twit({
        consumer_key: process.env.TWITTER_CLIENT_ID,
        consumer_secret: process.env.TWITTER_CLIENT_SECRET,
        access_token: session.token.credentials.authToken,
        access_token_secret: session.token.credentials.authSecret
    })
    try {
        if (req.method === 'GET') {
            twit.post('statuses/retweet/:id', { id: '1660294888993488896' }, function (err, data, response) {
                if (data) {
                    return res.json(data)
                } else {
                    return res.status(200).send('Retweeted Successfully')
                }
            })
        }
    } catch (error) {
        return res.json(error)
    }
}