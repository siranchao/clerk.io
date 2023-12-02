import { initTRPC } from '@trpc/server';
import { auth, currentUser } from "@clerk/nextjs";
import { TRPCError } from '@trpc/server';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();


//add custom middleware
const isAuth = t.middleware(async(opts) => {
    const { userId } = auth()
    const user = await currentUser()

    if(!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    //return to next handler with context info
    return opts.next({
        ctx: {
            userId: userId,
            user: user
        }
    })
})


/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);