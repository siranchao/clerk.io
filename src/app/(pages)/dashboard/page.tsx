import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { DashboardContent } from "./components/DashboardContent"


export default async function Dashboard() {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    //ensure user is logged in
    if(!user || !user.id) {
        redirect("/auth-callback?origin=/dashboard")
    }
    
    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })

    //ensure user is synced in db
    if(!dbUser) {
        redirect("/auth-callback?origin=/dashboard")
    }

    return (
        <>
            <DashboardContent />
        </>
    )
}