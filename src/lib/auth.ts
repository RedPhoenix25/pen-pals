import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import UserModel from './models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await UserModel.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-ins, upsert the user in our DB
      if (account?.provider === 'google') {
        await dbConnect();
        await UserModel.findOneAndUpdate(
          { email: user.email! },
          {
            $setOnInsert: { name: user.name, email: user.email, image: user.image, provider: 'google' },
          },
          { upsert: true, new: true }
        );
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On first sign-in, persist the DB _id into the token
      if (user) {
        await dbConnect();
        const dbUser = await UserModel.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.image = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        await dbConnect();
        const dbUser = await UserModel.findById(token.id);
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.name = dbUser.name;
          session.user.image = dbUser.image as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
