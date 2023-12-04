"use client";
import { useToast } from '@/components/ui/use-toast';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { trpc } from '@/app/_trpc/client';
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';


interface BillingFormProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

export default function BillingForm({ subscriptionPlan }: BillingFormProps) {
    const { toast } = useToast();

    console.log(subscriptionPlan);

    const {mutate: createStripeSession, isLoading} = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            if(url) {
                window.location.href = url
            }

            if(!url) {
                toast({
                    title: 'Somthing went wrong',
                    description: 'Please try again later',
                    variant: 'destructive',
                })
            }
        }
    })

    return (
        <MaxWidthWrapper className='max-w-5xl'>
            <form className='mt-12' onSubmit={(e) => {
                e.preventDefault()
                createStripeSession()
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>
                            You are currently on the <strong>{subscriptionPlan?.isSubscribed ? 'Pro' : 'Free'}</strong> plan
                        </CardDescription>
                    </CardHeader>

                    <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>
                        <Button type='submit'>
                            {isLoading && <Loader2 className='mr-4 h-4 w-4 animate-spin' />}
                            {subscriptionPlan?.isSubscribed ? 'Manage Subscription' : 'Upgrade To Pro'} 
                        </Button>

                        {subscriptionPlan.isSubscribed && (
                            <p className='rounded-full text-xs font-medium'>
                                {subscriptionPlan.isCanceled ? "Your plan will be canceled on " : "Your plan will renews on "}
                                {format(subscriptionPlan.stripeCurrentPeriodEnd!, 'dd.MM.yyyy')}
                            </p>
                        )}
                        
                    </CardFooter>
                </Card>

            </form>
        </MaxWidthWrapper>
    )
}