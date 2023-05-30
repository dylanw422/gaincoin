import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
export const authOptions = {
  callbacks: {
    async jwt({ token, account, profile, user }) {
        if (profile) {
            token['userProfile'] = {
                followersCount: profile.followers_count,
                twitterHandle: profile.screen_name,
                tweetsCount: profile.statuses_count,
                likesCount: profile.favourites_count,
                userID: profile.id,
                createdAt: profile.created_at
            }
        }
        if (account) {
            token['credentials'] = {
                authToken: account.oauth_token,
                authSecret: account.oauth_token_secret,
            }
        }
        return token
    },
    async session({ session, token, user }) {
        let userData = token.userProfile
        session.twitter = userData
        session.token = token
        return session
    }
  },
  providers: [
    TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        authorization: { params: { scope: ['users.read', 'tweet.read'] }}
    })
  ],

}
export default NextAuth(authOptions)