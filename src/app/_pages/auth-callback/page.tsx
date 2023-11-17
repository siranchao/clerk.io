import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "@/app/_trpc/client"

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
            console.log(error)
        }
    })

    return (
        <>
            <h1>Auth Callback</h1>
        </>
    )
}