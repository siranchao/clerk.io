import { createContext, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean,
}

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    message: "",
    handleInputChange: () => {},
    isLoading: false,
});


interface Props {
    fileId: string
    children: React.ReactNode
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const utils = trpc.useUtils();

    const { toast } = useToast();

    const backupMessage = useRef<string>("");

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({message}: {message: string}) => {
            const res = await fetch('/api/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileId, message }),
            })

            if(!res.ok) {
                throw new Error('Failed to send message');
            }

            return res.body;
        },
        onMutate: async({ message }) => {
           //implement optimistic update 
           backupMessage.current = message;
           setMessage("");

           //1. cancel outgoing request
           await utils.getFileMessages.cancel();

           //2. snapshot previous message
           const prevMessage = utils.getFileMessages.getInfiniteData()

           //3. optimistic update: insert new message right away
           utils.getFileMessages.setInfiniteData({
               fileId,
               limit: INFINITE_QUERY_LIMIT,
           }, (oldData: any) => {
               if(!oldData) {
                return {
                    pages: [],
                    pageParams: []
                }
               }
               //clone old data
               let newPages = [...oldData.pages]
               let latestPage = newPages[0]!
               latestPage.messages = [
                   {
                    createdAt: new Date().toISOString(),
                    id: crypto.randomUUID(),
                    text: message,
                    isUserMessage: true
                   },
                   ...latestPage.messages
               ]

               newPages[0] = latestPage

               return {
                ...oldData,
                pages: newPages
               }
           })

           setIsLoading(true);

           return {
            prevMessage: prevMessage?.pages.flatMap(page => page.messages) ?? []
           }
        },
        onSuccess: async(stream) => {
            setIsLoading(false);
            if(!stream) {
                return toast({
                    title: "Something went wrong",
                    description: "Please refresh page and try again",
                    variant: "destructive",
                })
            }

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let finshed = false;
            
            //accumulated messages response
            let accResponse = "";

            while(!finshed) {
                const {value, done} = await reader.read();
                finshed = done;

                const chuckValue = decoder.decode(value);
                accResponse += chuckValue;

                //append chunk to the actual message
                utils.getFileMessages.setInfiniteData({
                    fileId,
                    limit: INFINITE_QUERY_LIMIT,
                }, (old) => {
                    if(!old) {
                        return {
                            pages: [],
                            pageParams: []
                        }
                    }
                    let isAIResponseCreated = old.pages.some(page => {
                        return page.messages.some(message => {
                            return message.id === "ai-response"
                        })
                    })

                    let updatedPages = old.pages.map(page => {
                        if(page === old.pages[0]) {
                            let updatedMessage;

                            if(!isAIResponseCreated) {
                                updatedMessage = [
                                    {
                                        createdAt: new Date().toISOString(),
                                        id: "ai-response",
                                        text: accResponse,
                                        isUserMessage: false
                                    },
                                    ...page.messages
                                ]
                            } 
                            else {
                                updatedMessage = page.messages.map(message => {
                                    if(message.id === "ai-response") {
                                        return {
                                            ...message,
                                            text: accResponse
                                        }
                                    }
                                    return message
                                })
                            }

                            return {
                                ...page,
                                messages: updatedMessage
                            }
                        }
                        return page
                    })

                    return {...old, pages: updatedPages}
                })
            }
        },
        onError: (err, newMessage, context) => {
            setMessage(backupMessage.current)
            utils.getFileMessages.setData(
                {fileId},
                {messages: context?.prevMessage ?? []} 
            )
        },
        onSettled: async() => {
            setIsLoading(false);
            //refresh messages
            await utils.getFileMessages.invalidate({ fileId })
        }
    })

    const addMessage = () => {
        sendMessage({ message })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }


    return (
        <ChatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading,
        }}>
            {children}
        </ChatContext.Provider>
    )

}