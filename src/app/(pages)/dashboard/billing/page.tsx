import { getUserSubscriptionPlan } from '@/lib/stripe';
import BillingForm from './components/BillingForm';

export default async function BillingPage() {
    const subscriptionPlan = await getUserSubscriptionPlan();


    return (
        <>
            <BillingForm subscriptionPlan={subscriptionPlan}/>
        </>
    )
}