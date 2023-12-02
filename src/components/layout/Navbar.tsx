import { buttonVariants } from "../ui/button"
import MaxWidthWrapper from "./MaxWidthWrapper"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { auth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
    const { userId } = auth()

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all" >
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link href='/' className="flex z-40 font-semibold">
                        <span>Clerk.io</span>
                    </Link>

                    {/* todo: add mobile nav */}

                    <div className="hidden items-center space-x-4 sm:flex">
                        <Link href='/pricing' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                            Pricing
                        </Link>

                        <Link href='/dashboard' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                            Dashboard
                        </Link>

                        <div>
                            {userId ? (
                                <UserButton afterSignOutUrl="/"/>
                            ) : (
                                <Link href='/sign-in' className={buttonVariants({ size: 'sm' })}>
                                    Sign in <ArrowRight className="ml-1.5 h-5 w-5" />
                                </Link>
                            )}
                        </div>

                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}


export default Navbar