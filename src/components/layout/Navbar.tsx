import { buttonVariants } from "../ui/button"
import MaxWidthWrapper from "./MaxWidthWrapper"
import Link from "next/link"
import { ArrowRight, Menu } from "lucide-react"
import { auth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Navbar = async () => {
    const { userId } = auth()

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all" >
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link href='/' className="flex z-40 font-semibold">
                        <span>Clerk.io</span>
                    </Link>

                    {/* Mobile nav menu */}
                    <div className="items-center space-x-4 flex sm:hidden">
                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Menu className='h-6 w-6 cursor-pointer mx-2'/>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className='bg-white' align='end'>
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href='/'>Home</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href='/pricing'>Pricing</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href='/dashboard'>Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    {userId && (
                                        <>
                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                <Link href='/dashboard/billing'>Billing</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

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

                    {/* Desktop nav menu */}
                    <div className="hidden items-center space-x-4 sm:flex">
                        <Link href='/pricing' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                            Pricing
                        </Link>

                        <Link href='/dashboard' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                            Dashboard
                        </Link>

                        {userId && (
                            <Link href='/dashboard/billing' className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                                Billing
                            </Link>
                        )}

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