import { AppRouter } from "@/trpc"
import { inferRouterOutputs } from "@trpc/server"

type RouterOutput = inferRouterOutputs<AppRouter>

type Messages = RouterOutput["getFileMessages"]["messages"]

type OmitText = Omit<Messages[number], "text">

export type ExtendedMessage = OmitText & { 
    text: string | JSX.Element
}

