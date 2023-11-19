'use client'
import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"


export function UploadButton() {
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
                    example dialog
                </DialogContent>
            </Dialog>

        </>
    )
}