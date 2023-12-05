'use client'
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Loader2, ChevronDown, ChevronUp, Search, RotateCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Simplebar from 'simplebar-react'
import { PdfFullscreen } from './PdfFullscreen';
import { cn } from '@/lib/utils';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRenderProps {
    url: string
}

export function PdfRender({ url }: PdfRenderProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [renderedScale, setRenderedScale] = useState<number | null>(null);

    const isLoading = renderedScale !== scale

    const { toast } = useToast()

    const {width, ref} = useResizeDetector()

    const prevPage = () => {
        if(currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }
    const nextPage = () => {
        if(numPages && currentPage < numPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const rotate = () => {
        if(rotation === 0) {
            setRotation(90)
        } else if(rotation === 90) {
            setRotation(180)
        } else if(rotation === 180) {
            setRotation(270)
        } else if(rotation === 270) {
            setRotation(0)
        }
    }

    return (
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button 
                        aria-label='previous page' 
                        variant="ghost" onClick={prevPage} 
                        disabled={currentPage === 1}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>

                    <div className='flex items-center gap-1.5'>
                        <Select onValueChange={e => setCurrentPage(parseInt(e))}>
                            <SelectTrigger className="w-16">
                                <SelectValue placeholder={currentPage.toString()} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Page</SelectLabel>
                                {numPages && new Array(numPages).fill(0).map((_, index) => (
                                    <SelectItem key={index} value={(index + 1).toString()}>
                                        {index + 1}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <p className='text-zinc-700 text-sm space-x-1'>
                            <span>/</span>
                            <span>{numPages ?? "x"}</span>
                        </p>
                    </div>

                    <Button 
                        aria-label='next page' 
                        variant="ghost" 
                        onClick={nextPage}
                        disabled={!numPages || currentPage === numPages}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className='flex flex-row sm:gap-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className='gap-1.5' aria-label='zoom' variant="ghost">
                                <Search className="h-4 w-4" />
                                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>            
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setScale(1)}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(1.5)}>
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2)}>
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2.5)}>
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>     

                    <Button 
                        aria-label='rotate 90 degrees' 
                        variant="ghost"
                        onClick={() => rotate()}
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>        

                    <PdfFullscreen url={url}/>           
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <Simplebar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
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
                            {isLoading && renderedScale ? (
                                <Page 
                                    width={width ? width : 1} 
                                    pageNumber={currentPage} 
                                    scale={scale}
                                    rotate={rotation}
                                    key={"@" + renderedScale}
                                />
                            ) : null}
    
                            <Page 
                                className={cn(isLoading ? "hidden" : "")}
                                width={width ? width : 1} 
                                pageNumber={currentPage} 
                                scale={scale}
                                rotate={rotation}
                                key={"@" + scale}
                                loading={
                                    <div className='flex justify-center'>
                                        <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                                    </div>
                                }
                                onRenderSuccess={() => setRenderedScale(scale)}
                            />
                        </Document>
                    </div>
                </Simplebar>
            </div>
        </div>
    )
}

const Loading = () => (
    <div className='flex justify-center'>
        <Loader2 className='my-24 h-6 w-6 animate-spin'/>
    </div>
)