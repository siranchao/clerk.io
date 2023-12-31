import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation"
import { db } from "@/db"
import { PdfRender } from "./components/pdf/PdfRender"
import { ChatWrapper } from "./components/chat/ChatWrapper"

interface PageProps {
    params: {
        fileId: string
    }
}

export default async function FilePage({ params }: PageProps) {
    const { fileId } = params
    const { userId } = auth()

    //ensure user is logged in
    if(!userId) {
        redirect(`/auth-callback?origin=dashboard/${fileId}`)
    }

    //fetch file from db
    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: userId
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
                            <PdfRender url={file.url}/>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
                        <ChatWrapper fileId={file.id} />
                    </div>
                </div>
            </div>
        </>
    )
}