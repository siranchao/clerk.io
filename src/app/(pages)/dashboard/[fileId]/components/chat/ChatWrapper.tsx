"use client"
import { Messages } from "./Messages"
import { ChatInput } from "./ChatInput"
import { trpc } from "@/app/_trpc/client"
import { Loader2, XCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ChatContextProvider } from "./ChatContext"

interface ChatWrapperProps {
    fileId: string
}

export function ChatWrapper( { fileId }: ChatWrapperProps ) {
    
    const {data, isLoading} = trpc.getFileUploadStatus.useQuery({ fileId }, {
        refetchInterval: (data) => {
            return data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500
        }
    })

    if(isLoading) {
        return (
            <div className="relative min-h-full bg-zinc-50 flex flex-col divide-y divide-zinc-200 justify-between gap-2">
                <div className="flex-1 flex flex-col justify-center items-center mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin"/>
                        <h3 className="font-semibold text-xl">Loading...</h3>
                        <p className="text-zinc-500 text-sm">
                            We&apos;re preparing your PDF file.
                        </p>
                    </div>
                </div>

                <ChatInput isDisabled={true} />
            </div>
        )
    }

    if(data?.status === "PROCESSING") {
        return (
            <div className="relative min-h-full bg-zinc-50 flex flex-col divide-y divide-zinc-200 justify-between gap-2">
                <div className="flex-1 flex flex-col justify-center items-center mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin"/>
                        <h3 className="font-semibold text-xl">Processing File...</h3>
                        <p className="text-zinc-500 text-sm">
                            It only takes a few moments.
                        </p>
                    </div>
                </div>

                <ChatInput isDisabled={true} />
            </div>
        )
    }

    if(data?.status === "FAILED") {
        return (
            <div className="relative min-h-full bg-zinc-50 flex flex-col divide-y divide-zinc-200 justify-between gap-2">
                <div className="flex-1 flex flex-col justify-center items-center mb-28">
                    <div className="flex flex-col items-center gap-2">
                        <XCircle className="h-8 w-8 text-red-500"/>
                        <h3 className="font-semibold text-xl">Exceed Page Limit</h3>
                        <p className="text-zinc-500 text-sm">
                            Your <span className="font-medium">Free Plan</span> supports up to 5 pages per PDF.
                        </p>
                        <Link href="/dashboard" className={buttonVariants({ 
                            variant: "secondary",
                            className: "mt-4"
                        })} >
                            <ChevronLeft className="h-3 w-3 mr-1.5"/>Back
                        </Link>
                    </div>
                </div>

                <ChatInput isDisabled={true} />
            </div>
        )
    }


    return (
        <ChatContextProvider fileId={fileId}>
            <div className="relative min-h-full bg-zinc-50 flex flex-col justify-between gap-2 divide-y divide-zinc-200">
                <div className="flex-1 justify-between flex flex-col mb-28">
                    <Messages fileId={fileId}/>
                </div>

                <ChatInput />
            </div>
        </ChatContextProvider>
    )
}