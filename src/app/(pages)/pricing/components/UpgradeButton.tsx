"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { trpc } from "@/app/_trpc/client"

export default function UpgradeButton() {

    const {mutate: createStripeSession} = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            window.location.href = url ?? "/dashboard/billing"
        }
    })

    return (
        <Button className="w-full" onClick={() => createStripeSession()}>
            Upgrade Now <ArrowRight className="h-5 w-5 ml-1.5" />
        </Button>
    )
}