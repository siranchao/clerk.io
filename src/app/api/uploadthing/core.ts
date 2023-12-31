import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";
import { db } from "@/db";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import pinecone from "@/lib/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
 
const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
        const { userId } = auth()

        //ensure user is logged in
        if(!userId) {
            throw new Error("Unauthorized")
        }

        const subscriptionPlan = await getUserSubscriptionPlan()
    
        return { userId: userId, subscriptionPlan };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        const fileFound = await db.file.findFirst({
            where: {
                key: file.key
            }
        })

        if(!fileFound) {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
                    uploadStatus: "PROCESSING"
                }
            })

            try {
                //retrieve blob file
                const res = await fetch(`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`)
                const blob = await res.blob()
    
                //load pdf into memory(langchain)
                const loader = new PDFLoader(blob)
                const docs = await loader.load()
                const pagesAmt = docs.length 
    
                //check if pages number exceeded pro plan
                const { subscriptionPlan } = metadata
                const { isSubscribed } = subscriptionPlan
                const isProExceeded = pagesAmt > PLANS.find(plan => plan.name === 'Pro')!.pageLimit
                const isFreeExceeded = pagesAmt > PLANS.find(plan => plan.name === 'Free')!.pageLimit
    
                if((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
                    await db.file.update({
                        data: {
                            uploadStatus: "FAILED"
                        },
                        where: {
                            id: createdFile.id
                        }
                    })
                }
    
                //vectorize and index entire document
                const pineconeIndex = pinecone.index("clerkio")
    
                const embeddings = new OpenAIEmbeddings({
                    openAIApiKey: process.env.OPENAI_API_KEY
                })
    
                //important!
                await PineconeStore.fromDocuments(docs, embeddings, {
                    pineconeIndex,
                    //namespace: createdFile.id  //TODO: NEW FEATURE namespace not supported for free plan
                })
                
                //update file status
                await db.file.update({
                    data: {
                        uploadStatus: "SUCCESS"
                    },
                    where: {
                        id: createdFile.id
                    }
                })
    
            } catch(error) {
                console.log(error)
                await db.file.update({
                    data: {
                        uploadStatus: "FAILED"
                    },
                    where: {
                        id: createdFile.id
                    }
                })
            }

        }
        
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;