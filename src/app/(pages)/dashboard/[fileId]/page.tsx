import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"
import { db } from "@/db"
import { PdfRender } from "./components/PdfRender"
import { ChatWrapper } from "./components/ChatWrapper"

interface PageProps {
    params: {
        fileId: string
    }
}

export default async function FilePage({ params }: PageProps) {
    const { fileId } = params
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    //ensure user is logged in
    if(!user || !user.id) {
        redirect(`/auth-callback?origin=dashboard/${fileId}`)
    }

    //fetch file from db
    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: user.id
        }
    })

    if(!file) {
        notFound()
    }

    return (
        <>
            <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
                <div className="mx-auto w-full max-w-7xl grow lg:flex xl:px-2">
                    {/* Left side */}
                    <div className="flex-1 xl:flex">
                        <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                            <PdfRender />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
                        <ChatWrapper />
                    </div>
                </div>
            </div>
        </>
    )
}