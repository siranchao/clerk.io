'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Dropzone, { FileRejection } from "react-dropzone"
import { Cloud, File, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useUploadThing } from "@/lib/uploadthing"
import { useToast } from "@/components/ui/use-toast"
import { trpc } from "@/app/_trpc/client"

interface UploadButtonProps {
    isSubscribed?: boolean
}

export function UploadButton({ isSubscribed }: UploadButtonProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false)


    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(visible) => !visible && setIsOpen(visible)}
            >
                <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                    <Button>
                        Upload PDF
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <UploadZone isSubscribed={isSubscribed}/>
                </DialogContent>
            </Dialog>

        </>
    )
}


const UploadZone = ({ isSubscribed }: { isSubscribed?: boolean }) => {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)

    const { startUpload } = useUploadThing("pdfUploader")
    const { toast } = useToast()

    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`)
        },
        retry: true,
        retryDelay: 500
    })

    const startUploadProgress = () => {
        setUploadProgress(0)
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if(prev >= 95) {
                    clearInterval(interval)
                    return prev
                }
                return prev + 5
            })
        }, 500)
        return interval
    }

    return (
        <Dropzone 
            accept={{'application/pdf': ['.pdf']}}
            maxSize={isSubscribed ? 1048576 * 16 : 1048576 * 4} 
            multiple={false} 
            onDropAccepted={async (acceptedFiles) => {
                setIsUploading(true)
                const progressInterval = startUploadProgress()

                //handle file uploading
                const res = await startUpload(acceptedFiles)
                if(!res) {
                    //throw a toast
                    return toast({
                        title: "Something went wrong",
                        description: "Please try again later",
                        variant: "destructive"
                    })
                }
                //handle upload response
                const [fileResponse] = res
                const key = fileResponse?.key
                if(!key) {
                    return toast({
                        title: "Something went wrong",
                        description: "Please try again later",
                        variant: "destructive"
                    })
                }

                clearInterval(progressInterval)
                setUploadProgress(100)
                startPolling({ key })
            }}
            onDropRejected={(fileRejections: FileRejection[]) => {
                if(fileRejections[0].errors[0].code === "file-too-large") {
                    toast({
                        title: "File is too large",
                        description: isSubscribed ? "Pro user allows up to 16MB file size" : "Free user allows up to 4MB file size",
                        variant: "destructive"
                    })
                }
                else if(fileRejections[0].errors[0].code === "file-invalid-type") {
                    if(fileRejections[0].errors[0].code === "file-invalid-type") {
                        toast({
                            title: "Invalid file type",
                            description: "Only PDF files are allowed",
                            variant: "destructive"
                        })
                    }
                }
                else {
                    toast({
                        title: "Unable to upload file",
                        description: "Please try again later",
                        variant: "destructive"
                    })
                }
            }}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div {...getRootProps()} className="border h-64 m-4 border-dashed border-gray-300 rounded-lg">
                    <div className="flex items-center justify-center h-full w-full">
                        <label 
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center rounded-lg w-full h-full cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                                <p className="mb-2 text-sm text-zinc-700">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-zinc-500">{isSubscribed ? "PDF file up to 25 pages with max size of 16MB" : "PDF file up to 5 pages with max size of 4MB"}</p>
                            </div>

                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                    <div className="px-3 py-2 h-full grid place-items-center">
                                        <File className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="px-3 py-2 h-full text-sm truncate">
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}

                            {isUploading && (
                                <div className="w-full mt-4 max-w-xs mx-auto">
                                    <Progress 
                                        value={uploadProgress} 
                                        className="h-1 w-full bg-zinc-200" 
                                        indicatorColor={ uploadProgress === 100 ? "bg-green-500" : "" }
                                    /> 
                                    {uploadProgress === 100 && (
                                        <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                                            <Loader2 className="h-3 w-3 animate-spin"/>
                                            Redirecting...
                                        </div>
                                    )}          
                                </div>
                            )}

                            <input type="file" id="dropzone-file" className="hidden" {...getInputProps()} />
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}
