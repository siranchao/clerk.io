import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Expand, Loader2 } from "lucide-react"
import SimpleBar from "simplebar-react"
import { useResizeDetector } from 'react-resize-detector';
import { useToast } from '@/components/ui/use-toast';
import { Document, Page } from 'react-pdf';

interface PdfFullscreenProps {
    url: string
}

export function PdfFullscreen({ url }: PdfFullscreenProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [numPages, setNumPages] = useState<number | null>(null);
    const {width, ref} = useResizeDetector()

    const { toast } = useToast()

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(visible) => !visible && setIsOpen(visible)}
        >
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                <Button aria-label="Open fullscreen" variant="ghost" className="gap-1.5">
                    <Expand className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-7xl x-full">
                <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)] mt-6'>
                    <div ref={ref}>
                            <Document 
                                loading={<Loading />} 
                                file={url} 
                                className="max-h-full"
                                onLoadError={() => {
                                    toast({
                                    title: 'Error loading PDF',
                                    description: 'Please try again',
                                    variant: 'destructive', 
                                    })
                                }}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            >
                                {new Array(numPages).fill(0).map((_, index) => (
                                    <Page 
                                        key={index} 
                                        width={width ? width : 1} 
                                        pageNumber={index + 1}
                                    />
                                ))}
                            </Document>
                        </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    )
}

const Loading = () => (
    <div className='flex justify-center'>
        <Loader2 className='my-24 h-6 w-6 animate-spin'/>
    </div>
)