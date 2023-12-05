import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation"
import { db } from "@/db"
import { DashboardContent } from "./components/DashboardContent"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";


export default async function Dashboard() {
    const { userId } = auth()

    //ensure user is logged in
    if(!userId) {
        redirect("/auth-callback?origin=dashboard")
    }
    
    const dbUser = await db.user.findFirst({
        where: {
            id: userId
        }
    })

    //ensure user is synced in db
    if(!dbUser) {
        redirect("/auth-callback?origin=dashboard")
    }

    const subscriptionPlan = await getUserSubscriptionPlan();

    return (
        <MaxWidthWrapper>
            <DashboardContent isSubscribed={subscriptionPlan?.isSubscribed}/>
        </MaxWidthWrapper>
    )
}