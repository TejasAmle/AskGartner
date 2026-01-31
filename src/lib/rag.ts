import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";

const VECTOR_STORE_PATH = "./data/vectorstore";

export interface Source {
  content: string;
  metadata: {
    source: string;
    page?: number;
  };
}

export interface RAGResponse {
  answer: string;
  sources: Source[];
}

export async function searchAndAnswer(question: string): Promise<RAGResponse> {
  try {
    // Load vector store
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);

    // Search for relevant documents
    const relevantDocs = await vectorStore.similaritySearch(question, 5);

    // Format context for OpenAI
    const context = relevantDocs
      .map((doc, i) => {
        const source = doc.metadata.source || "Unknown";
        const page = doc.metadata.loc?.pageNumber || doc.metadata.page || "N/A";
        return `[Source ${i + 1}: ${source}, Page ${page}]\n${doc.pageContent}`;
      })
      .join("\n\n---\n\n");

    // Generate answer with OpenAI GPT-4
    const chat = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are AskGartner, an AI assistant that provides factual answers based on research documents.

Context from research papers:
${context}

Question: ${question}

Instructions:
- Answer based ONLY on the provided context
- Cite sources using [Source N] notation
- If the context doesn't contain enough information, say so
- Be concise and authoritative
- Use Gartner-style professional tone

Answer:`;

    const response = await chat.invoke(prompt);
    const answer = response.content.toString();

    // Format sources
    const sources: Source[] = relevantDocs.map((doc) => ({
      content: doc.pageContent.substring(0, 200) + "...",
      metadata: {
        source: doc.metadata.source || "Unknown",
        page: doc.metadata.loc?.pageNumber || doc.metadata.page,
      },
    }));

    return {
      answer,
      sources,
    };
  } catch (error) {
    console.error("RAG Error:", error);
    throw new Error("Failed to generate answer");
  }
}
