"use client"
import { trpc } from "@/app/_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query"
import { Loader2, MessagesSquare } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import Message from "./Message"
import { ExtendedMessage } from "@/types/message"
import { useContext, useRef, useEffect } from "react"
import { ChatContext } from "./ChatContext"
import { useIntersection } from "@mantine/hooks";

interface MessagesProps {
    fileId: string
}

export function Messages({ fileId }: MessagesProps) {
    const {isLoading: isChatLoading} = useContext(ChatContext)

    const {data, isLoading, fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({ 
        fileId, 
        limit: INFINITE_QUERY_LIMIT
    }, {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true
    })

    const messages = data?.pages.flatMap(page => page.messages)

    const loadingMessage: ExtendedMessage = {
        createdAt: new Date().toISOString(),
        id: "loading-message",
        isUserMessage: false,
        text: (
            <span className="flex h-full items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin"/>
            </span>
        )
    }

    const combinedMessages = [
        ...(isChatLoading ? [loadingMessage] : []),
        ...(messages ?? [])
    ]

    //monitor intersection on scrolling for initial query
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const {ref, entry} = useIntersection({
        root: lastMessageRef.current,
        threshold: 1
    })

    useEffect(() => {
        if(entry?.isIntersecting) {
            fetchNextPage()
        }
    }, [entry, fetchNextPage])


    return (
        <>
            <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
                {combinedMessages && combinedMessages.length > 0 ? (
                    combinedMessages.map((msg, index) => {
                        const isNextMessageSamePerson = combinedMessages[index - 1]?.isUserMessage === combinedMessages[index]?.isUserMessage
                        // Last Message
                        if(index === combinedMessages.length - 1) {
                            return <Message 
                                    ref={ref}
                                    message={msg}
                                    isNextMessageSamePerson={isNextMessageSamePerson} 
                                    key={msg.id}
                                    />
                        }
                        else {
                            return <Message 
                                    message={msg}
                                    isNextMessageSamePerson={isNextMessageSamePerson} 
                                    key={msg.id}
                                    />
                        }
                    })
                ) : isLoading ? (
                    <div className="w-full flex flex-col gap-2">
                        <Skeleton className="h-16"/>
                        <Skeleton className="h-16"/>
                        <Skeleton className="h-16"/>
                        <Skeleton className="h-16"/>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <MessagesSquare className="h-8 w-8 text-blue-500"/>
                        <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
                        <p className="text-zinc-500 text-sm">Ask anything about this file.</p>
                    </div>
                )}
            </div>
        </>
    )
}