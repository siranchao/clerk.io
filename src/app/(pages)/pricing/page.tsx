import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper'
import UpgradeButton from './components/UpgradeButton'
import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PLANS } from '@/config/stripe'
import { cn } from '@/lib/utils'
import { auth } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  HelpCircle,
  Minus,
} from 'lucide-react'
import Link from 'next/link'
import { getUserSubscriptionPlan } from '@/lib/stripe'



export default async function Pricing() {
    const { userId } = auth()
    const subscriptionPlan = await getUserSubscriptionPlan()

    const pricingItems = [
        {
          plan: 'Free',
          tagline: 'For small side projects.',
          quota: 10,
          features: [
            {
              text: '5 pages per PDF',
              footnote:
                'The maximum amount of pages per PDF-file.',
            },
            {
              text: '4MB file size limit',
              footnote:
                'The maximum file size of a single PDF file.',
            },
            {
              text: 'Mobile-friendly interface',
            },
            {
              text: 'Higher-quality responses',
              footnote:
                'Better algorithmic responses for enhanced content quality',
              negative: true,
            },
            {
              text: 'Priority support',
              negative: true,
            },
          ],
        },
        {
          plan: 'Pro',
          tagline: 'For larger projects with higher needs.',
          quota: PLANS.find((p) => p.slug === 'pro')!.quota,
          features: [
            {
              text: '25 pages per PDF',
              footnote:
                'The maximum amount of pages per PDF-file.',
            },
            {
              text: '16MB file size limit',
              footnote:
                'The maximum file size of a single PDF file.',
            },
            {
              text: 'Mobile-friendly interface',
            },
            {
              text: 'Higher-quality responses',
              footnote:
                'Better algorithmic responses for enhanced content quality',
            },
            {
              text: 'Priority support',
            },
          ],
        },
    ]
    
    return (
        <>
            <MaxWidthWrapper className='mb-8 mt-24 text-center max-w-5xl'>
                <div className='mx-auto mb-10 sm:max-w-lg'>
                    <h1 className='text-6xl font-bold sm:text-7xl'>
                    Pricing
                    </h1>
                    <p className='mt-5 text-gray-600 sm:text-lg'>
                        Clerk.io is a free platform. You can always stay with the Free Plan or upgrade to our Pro Plan to experience more robust features.
                    </p>
                </div>
        
                <div className='pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2'>
                    <TooltipProvider>
                    {pricingItems.map(
                        ({ plan, tagline, quota, features }) => {
                        const price =
                            PLANS.find(
                            (p) => p.slug === plan.toLowerCase()
                            )?.price.amount || 0
        
                        return (
                            <div
                            key={plan}
                            className={cn(
                                'relative rounded-2xl bg-white shadow-lg',
                                {
                                'border-2 border-blue-600 shadow-blue-200':
                                    plan === 'Pro',
                                'border border-gray-200':
                                    plan !== 'Pro',
                                }
                            )}>
                            {plan === 'Pro' && (
                                <div className='absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white'>
                                {subscriptionPlan?.isSubscribed ? 'Subscribed' : "Upgrade Now"}
                                </div>
                            )}
        
                            <div className='p-5'>
                                <h3 className='my-3 text-center font-display text-3xl font-bold'>
                                {plan}
                                </h3>
                                <p className='text-gray-500'>
                                {tagline}
                                </p>
                                <p className='my-5 font-display text-6xl font-semibold'>
                                ${price}
                                </p>
                                <p className='text-gray-500'>
                                per month
                                </p>
                            </div>
        
                            <div className='flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50'>
                                <div className='flex items-center space-x-1'>
                                <p>
                                    {quota.toLocaleString()} PDFs/mo
                                    included
                                </p>
        
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger className='cursor-default ml-1.5'>
                                    <HelpCircle className='h-4 w-4 text-zinc-500 cursor-pointer' />
                                    </TooltipTrigger>
                                    <TooltipContent className='w-80 p-2'>
                                    How many PDFs you can upload per
                                    month.
                                    </TooltipContent>
                                </Tooltip>
                                </div>
                            </div>
        
                            <ul className='my-10 space-y-5 px-8'>
                                {features.map(
                                ({ text, footnote, negative }) => (
                                    <li
                                    key={text}
                                    className='flex space-x-5'>
                                    <div className='flex-shrink-0'>
                                        {negative ? (
                                        <Minus className='h-6 w-6 text-gray-300' />
                                        ) : (
                                        <Check className='h-6 w-6 text-blue-500' />
                                        )}
                                    </div>
                                    {footnote ? (
                                        <div className='flex items-center space-x-1'>
                                        <p
                                            className={cn(
                                            'text-gray-600',
                                            {
                                                'text-gray-400':
                                                negative,
                                            }
                                            )}>
                                            {text}
                                        </p>
                                        <Tooltip
                                            delayDuration={300}>
                                            <TooltipTrigger className='cursor-default ml-1.5'>
                                            <HelpCircle className='h-4 w-4 text-zinc-500 cursor-pointer' />
                                            </TooltipTrigger>
                                            <TooltipContent className='w-80 p-2'>
                                            {footnote}
                                            </TooltipContent>
                                        </Tooltip>
                                        </div>
                                    ) : (
                                        <p
                                        className={cn(
                                            'text-gray-600',
                                            {
                                            'text-gray-400':
                                                negative,
                                            }
                                        )}>
                                        {text}
                                        </p>
                                    )}
                                    </li>
                                )
                                )}
                            </ul>
                            <div className='border-t border-gray-200' />
                            <div className='p-5'>
                                {plan === 'Free' ? (
                                <Link
                                    href={
                                    !userId ? '/sign-in' : subscriptionPlan?.isSubscribed ? '/dashboard/billing' : '/dashboard'
                                    }
                                    className={buttonVariants({
                                    className: 'w-full',
                                    variant: 'secondary',
                                    })}>
                                    {!userId ? 'Sign up' : subscriptionPlan?.isSubscribed ? 'Change Plan' : 'Current Plan'}
                                    <ArrowRight className='h-5 w-5 ml-1.5' />
                                </Link>
                                ) : !userId ? (
                                    <Link
                                        href='/sign-in'
                                        className={buttonVariants({
                                        className: 'w-full',
                                        })}>
                                        Sign up
                                        <ArrowRight className='h-5 w-5 ml-1.5' />
                                    </Link>
                                ) : subscriptionPlan?.isSubscribed ? (
                                    <Link
                                        href='/dashboard'
                                        className={buttonVariants({
                                        className: 'w-full',
                                        variant: 'secondary',
                                        })}>
                                        Current Plan
                                        <ArrowRight className='h-5 w-5 ml-1.5' />
                                    </Link>
                                ) : <UpgradeButton />}
                            </div>
                        </div>
                    )
                    }
                )}
                </TooltipProvider>
            </div>
            </MaxWidthWrapper>
        </>
    )
}