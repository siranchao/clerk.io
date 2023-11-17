"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "@/app/_trpc/client"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
    const router = useRouter()
    const params = useSearchParams()
    const origin = params.get("origin")

    //query from trpc client
    const { data, isLoading } = trpc.authCallback.useQuery(undefined, {
        onSuccess: (data) => {
            if(data.success) {
                //user is synced to db
                router.push(origin ? `/${origin}` : "/dashboard")
            }
        },
        onError: (error) => {
            //handle error
            if(error.data?.code === "UNAUTHORIZED") {
                router.push("/sign-in")
            }
        },
        retry: true,
        retryDelay: 500
    })

    return (
        <>
            <div className="w-full mt-24 flex justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                    <h3 className="font-semibold text-xl">Setting up your account...</h3>
                    <p>You will be redirected automatically</p>
                </div>
            </div>
        </>
    )
}