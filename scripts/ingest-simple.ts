import { config } from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { Document } from "@langchain/core/documents";

// Load .env.local
config({ path: ".env.local" });

const VECTOR_STORE_PATH = "./data/vectorstore";

// Sample documents to demonstrate the system
const sampleDocs = [
  {
    content: `
    The State of AI 2025: Agents and Innovation

    Key AI Trends in 2025:
    1. AI Agents are becoming more autonomous and capable
    2. Generative AI adoption is accelerating across enterprises
    3. Multi-modal AI systems are emerging as the new standard
    4. AI governance and ethics are top priorities
    5. Edge AI and on-device processing are gaining traction

    Challenges in AI Implementation:
    - Data quality and availability
    - Integration with existing systems
    - Skills gap and talent shortage
    - Regulatory compliance
    - Cost management

    Organizations are investing heavily in AI infrastructure and talent development.
    The focus is shifting from experimentation to production deployment.
    `,
    metadata: { source: "the-state-of-ai-2025-agents-innovation_cmyk-v1.pdf", page: 1 },
  },
  {
    content: `
    Executive Perspectives: CEO's Roadmap on Generative AI

    CEO Priorities for AI in 2025:
    1. Driving operational efficiency through automation
    2. Enhancing customer experience with AI-powered solutions
    3. Accelerating product innovation cycles
    4. Building competitive advantage through data insights
    5. Managing AI risks and ensuring responsible use

    Top Concerns:
    - Return on investment (ROI) measurement
    - Change management and workforce adaptation
    - Data privacy and security
    - Vendor lock-in and technology dependencies

    CEOs are looking for clear business value and measurable outcomes from AI investments.
    The focus is on pragmatic, incremental implementation rather than moonshot projects.
    `,
    metadata: { source: "executive-perspectives-ceos-roadmap-on-generative-ai.pdf", page: 3 },
  },
  {
    content: `
    Tech Trends 2025: Digital Transformation Imperatives

    Key Technology Trends:
    1. Cloud-native architectures becoming standard
    2. Zero-trust security frameworks
    3. Low-code/no-code platforms democratizing development
    4. Quantum computing moving from research to early adoption
    5. Sustainable technology practices gaining importance

    Digital Transformation Focus Areas:
    - Customer experience platforms
    - Data modernization and analytics
    - Process automation and optimization
    - Legacy system migration
    - Cybersecurity enhancement

    Organizations are prioritizing technologies that deliver quick wins
    while building foundation for long-term digital capabilities.
    `,
    metadata: { source: "DI_Tech-trends-2025.pdf", page: 5 },
  },
  {
    content: `
    AI Implementation Best Practices

    Success Factors:
    - Start with clear business objectives
    - Build cross-functional teams
    - Invest in data infrastructure
    - Establish governance frameworks
    - Measure and iterate continuously

    Common Pitfalls to Avoid:
    - Technology-first approach without business alignment
    - Underestimating change management needs
    - Insufficient data quality checks
    - Lack of executive sponsorship
    - Ignoring ethical considerations

    Leading organizations are taking a balanced approach to AI adoption,
    combining innovation with risk management and ethical considerations.
    `,
    metadata: { source: "the-state-of-ai-2025-agents-innovation_cmyk-v1.pdf", page: 15 },
  },
];

async function ingestSampleData() {
  console.log("🚀 Starting simple ingestion with sample data...");

  // Create documents
  const docs = sampleDocs.map(
    (doc) =>
      new Document({
        pageContent: doc.content,
        metadata: doc.metadata,
      })
  );

  console.log(`📝 Created ${docs.length} sample documents`);

  // Split into chunks
  console.log("\n✂️  Splitting documents into chunks...");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);
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
  console.log("\n💡 This is sample data. For full PDF ingestion, fix the pdf-parse issues.");
}

// Run ingestion
ingestSampleData().catch(console.error);
