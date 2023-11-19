import { router, publicProcedure, privateProcedure } from './trpc';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod';


export const appRouter = router({
  authCallback: publicProcedure.query(async() => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if(!user || !user.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    //check if user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id
      }
    })

    if(!dbUser) {
      //create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email ? user.email : "n/a",
        }
      })
    }


    return { success: true }
  }),
  getUserFiles: privateProcedure.query(async({ ctx }) => {
    const { userId } = ctx;
    
    return await db.file.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }),
  deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(async({ ctx, input }) => {
    const { userId } = ctx;

    const file = await db.file.findFirst({
      where: {
        id: input.id,
        userId: userId
      }
    })

    if(!file) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    await db.file.delete({
      where: {
        id: file.id
      }
    })

    return { success: true }
  })
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter; 