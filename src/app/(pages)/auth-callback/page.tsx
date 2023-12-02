"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "@/app/_trpc/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AuthCallback() {
    const router = useRouter()
    const params = useSearchParams()
    const origin = params.get("origin")
    const { toast } = useToast()

    //query from trpc client
    trpc.authCallback.useQuery(undefined, {
        onSuccess: (data) => {
            if(data.success) {
                //user is synced to db
                router.refresh()
                router.push(origin ? `/${origin}` : "/dashboard")
            }
        },
        onError: (error) => {
            //handle error
            if(error.data?.code === "UNAUTHORIZED") {
                toast({
                    title: "Failed to sync user data", 
                    description: "Please try again later",
                    variant: "destructive"
                })
                router.push("/")
            }
        },
        retry: 5,
        retryDelay: 1000
    })

    return (
        <div className="w-full mt-24 flex justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                <h3 className="font-semibold text-xl">Setting up your account...</h3>
                <p>It may take a few moments</p>
            </div>
        </div>
    )
}
