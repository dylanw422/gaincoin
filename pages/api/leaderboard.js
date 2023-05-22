import { getLeaderboard } from "prisma/users";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const leaderboard = await getLeaderboard()
            return res.status(200).json(leaderboard)
        }
    } catch (error) {
        console.log(error)
    }
}