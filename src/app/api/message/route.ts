import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { db } from "@/db";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import pinecone from "@/lib/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { openai } from "@/lib/openAI";
import { OpenAIStream, StreamingTextResponse } from "ai";

//API endpoint for asking a question to a pdf file
export const POST = async (req: NextRequest) => {
    const body = await req.json();

    //check user authorization
    const { userId } = auth()

    if(!userId) {
        return new Response("Unauthorized", { status: 401 })
    }
    
    //validate message and find file
    const {fileId, message} = SendMessageValidator.parse(body);
    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId
        }
    })

    if(!file) {
        return new Response("Not found", { status: 404 })
    }

    //save the message into db
    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })

    //handle answer according to the question
    //1. vectorize the question
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    })

    const pineconeIndex = pinecone.index("clerkio")
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex
    })

    const results = await vectorStore.similaritySearch(message, 4)

    //2. retrive previous messages
    const prevMessages = await db.message.findMany({
        where: {
            fileId
        },
        orderBy: {
            createdAt: "asc"
        },
        take: 6
    })

    //3. format messages and send to OpenAI API
    const formattedMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" as const : "assistant" as const,
        content: msg.text
    }))

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        stream: true,
        messages: [
            {
                role: 'system',
                content: 'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
            },
            {
                role: 'user',
                content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
                
                \n----------------\n
                
                PREVIOUS CONVERSATION:
                ${formattedMessages.map((message) => {
                    if (message.role === 'user')
                    return `User: ${message.content}\n`
                    return `Assistant: ${message.content}\n`
                })}
                
                \n----------------\n
                
                CONTEXT:
                ${results.map((r) => r.pageContent).join('\n\n')}
                
                USER INPUT: ${message}`,
            },
        ]
    })

    //4. stream AI response in realtime
    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            //save AI's message into db
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    fileId,
                    userId
                }
            })
        },
    })

    return new StreamingTextResponse(stream)
}