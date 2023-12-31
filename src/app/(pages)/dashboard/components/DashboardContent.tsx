'use client'
import { UploadButton } from "./UploadButton"
import { trpc } from "@/app/_trpc/client"
import { Ghost, Plus, MessageSquare, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Skeleton from "react-loading-skeleton"
import Link from "next/link"
import { format } from "date-fns"
import { useState } from "react"

interface DashboardContentProps {
    isSubscribed?: boolean
}

export function DashboardContent({ isSubscribed }: DashboardContentProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    //fetch user's file data using trpc query
    const utils = trpc.useUtils()
    const { data: files, isLoading } = trpc.getUserFiles.useQuery()
    const { mutate: deleteFile } = trpc.deleteFile.useMutation({
        onMutate: ( { id } ) => {
            //trigger this callback once the mutation is called
            setIsDeleting(id)
        },
        onSuccess: () => {
            //invalidate user files query once mutation is successful
            utils.getUserFiles.invalidate()
        },
        onSettled: () => {
            //reset isDeleting state once mutation is settled
            setIsDeleting(null)
        }
    })

    return (
        <main className="mx-auto max-w-7xl md:p-10">
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
                <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>

                <UploadButton isSubscribed={isSubscribed}/>
            </div>

            {/* display all user files */}
            { files && files.length > 0 ? (
                <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 xl:grid-cols-3">
                    {files.map((file) => (
                        <li key={file.id} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg">
                            <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
                                <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"/>
                                    <div className="flex-1 truncate">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="truncate text-lg font-medium text-zinc-900">{file.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* File Details section */}
                            <div className="px-4 mt-4 flex flex-row items-center justify-between py-2 text-xs text-zinc-500">
                                <div className="flex-1 flex items-center justify-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    {format(new Date(file.createdAt), "dd MMM yyyy")}
                                </div>

                                <div className="flex-1 flex items-center justify-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    {file.uploadStatus === "SUCCESS" ? "Ready" : "Pending"}
                                </div>

                                <div className="flex-1 flex justify-center">
                                    <Button size="sm" className="w-1/2 flex flex-row items-center gap-2" variant="destructive" onClick={() => deleteFile({ id: file.id })}>
                                        {isDeleting === file.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                        </li>
                    ))}
                </ul>
            ) : isLoading ? (
                <Skeleton height={100} count={4} className="my-4" />
            ) : (
                <div className="mt-16 flex flex-col items-center gap-2">
                    <Ghost className="h-8 w-8 text-zinc-800"/>
                    <h3 className="font-semibold text-xl">You have no files available yet</h3>
                    <p>Let&apos;s upload your first PDF.</p>
                </div>
            ) }

        </main>
    )
}
