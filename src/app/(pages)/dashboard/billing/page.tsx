import { getUserSubscriptionPlan } from '@/lib/stripe';
import BillingForm from './components/BillingForm';
import MaxWidthWrapper from '@/components/layout/MaxWidthWrapper';

export default async function BillingPage() {
    const subscriptionPlan = await getUserSubscriptionPlan();

    return (
        <MaxWidthWrapper className='max-w-5xl'>
            <BillingForm subscriptionPlan={subscriptionPlan}/>
        </MaxWidthWrapper>
    )
}