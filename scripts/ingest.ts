import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { Document } from "@langchain/core/documents";
import * as path from "path";
import * as fs from "fs";

// @ts-ignore
const pdfParse = require("pdf-parse").default || require("pdf-parse");

const VECTOR_STORE_PATH = "./data/vectorstore";

async function ingestPDFs() {
  console.log("🚀 Starting PDF ingestion...");

  // PDF files to process (3 for speed)
  const pdfFiles = [
    "../ResearchPapers /the-state-of-ai-2025-agents-innovation_cmyk-v1.pdf",
    "../ResearchPapers /executive-perspectives-ceos-roadmap-on-generative-ai.pdf",
    "../ResearchPapers /DI_Tech-trends-2025.pdf",
  ];

  const allDocs = [];

  // Load all PDFs
  for (const pdfPath of pdfFiles) {
    console.log(`📄 Loading ${path.basename(pdfPath)}...`);
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(dataBuffer);

      // Create a document for each page (approximate)
      const text = pdfData.text;
      const numPages = pdfData.numpages;
      const textPerPage = Math.ceil(text.length / numPages);

      for (let i = 0; i < numPages; i++) {
        const start = i * textPerPage;
        const end = Math.min((i + 1) * textPerPage, text.length);
        const pageText = text.substring(start, end);

        if (pageText.trim()) {
          allDocs.push(
            new Document({
              pageContent: pageText,
              metadata: {
                source: path.basename(pdfPath),
                page: i + 1,
              },
            })
          );
        }
      }

      console.log(`   ✓ Loaded ${numPages} pages`);
    } catch (error) {
      console.error(`   ✗ Error loading ${pdfPath}:`, error);
    }
  }

  console.log(`\n📝 Total pages loaded: ${allDocs.length}`);

  // Split into chunks
  console.log("\n✂️  Splitting documents into chunks...");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(allDocs);
  console.log(`   ✓ Created ${splitDocs.length} chunks`);

  // Create embeddings and vector store
  console.log("\n🧠 Generating embeddings...");
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  console.log("💾 Creating vector store...");
  const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);

  // Save to disk
  console.log(`📦 Saving vector store to ${VECTOR_STORE_PATH}...`);
  await vectorStore.save(VECTOR_STORE_PATH);

  console.log("\n✅ Ingestion complete!");
  console.log(`   - Total chunks: ${splitDocs.length}`);
  console.log(`   - Stored in: ${VECTOR_STORE_PATH}`);
}

// Run ingestion
ingestPDFs().catch(console.error);
