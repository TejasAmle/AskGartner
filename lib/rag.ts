import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";

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
  followUpQuestions?: string[];
}

// Sample knowledge base
const knowledge = [
  {
    content: `The State of AI 2025: Key AI Trends
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
- Cost management`,
    metadata: { source: "the-state-of-ai-2025-agents-innovation_cmyk-v1.pdf", page: 1 },
  },
  {
    content: `Executive Perspectives: CEO's Roadmap on Generative AI

CEO Priorities for AI in 2025:
1. Driving operational efficiency through automation
2. Enhancing customer experience with AI-powered solutions
3. Accelerating product innovation cycles
4. Building competitive advantage through data insights
5. Managing AI risks and ensuring responsible use

Top CEO Concerns:
- Return on investment (ROI) measurement
- Change management and workforce adaptation
- Data privacy and security
- Vendor lock-in and technology dependencies`,
    metadata: { source: "executive-perspectives-ceos-roadmap-on-generative-ai.pdf", page: 3 },
  },
  {
    content: `Tech Trends 2025: Digital Transformation Imperatives

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
- Cybersecurity enhancement`,
    metadata: { source: "DI_Tech-trends-2025.pdf", page: 5 },
  },
  {
    content: `AI Implementation Best Practices

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
- Ignoring ethical considerations`,
    metadata: { source: "the-state-of-ai-2025-agents-innovation_cmyk-v1.pdf", page: 15 },
  },
];

// Simple cache for embeddings
let embeddingsCache: number[][] | null = null;

async function getEmbeddings() {
  if (embeddingsCache) {
    return embeddingsCache;
  }

  const embedder = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const texts = knowledge.map(k => k.content);
  embeddingsCache = await embedder.embedDocuments(texts);
  return embeddingsCache;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchAndAnswer(question: string): Promise<RAGResponse> {
  try {
    // Get embeddings
    const embedder = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const knowledgeEmbeddings = await getEmbeddings();
    const questionEmbedding = await embedder.embedQuery(question);

    // Find most similar documents
    const similarities = knowledgeEmbeddings.map((emb, idx) => ({
      index: idx,
      similarity: cosineSimilarity(questionEmbedding, emb),
    }));

    // Sort by similarity and take top 3
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topDocs = similarities.slice(0, 3).map(s => knowledge[s.index]);

    // Format context
    const context = topDocs
      .map((doc, i) => {
        return `[Source ${i + 1}: ${doc.metadata.source}, Page ${doc.metadata.page}]\n${doc.content}`;
      })
      .join("\n\n---\n\n");

    // Generate answer with GPT-4o-mini
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

    // Generate follow-up questions based on the question and answer
    let followUpQuestions: string[] = [];
    try {
      const followUpPrompt = `Based on this question and answer, generate 3 relevant follow-up questions that a user might want to ask next.

Question: ${question}

Answer: ${answer.substring(0, 500)}

Generate 3 specific, relevant follow-up questions (one per line, no numbering):`;

      const followUpResponse = await chat.invoke(followUpPrompt);
      followUpQuestions = followUpResponse.content
        .toString()
        .split('\n')
        .filter(q => q.trim().length > 0)
        .map(q => q.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3);
    } catch (e) {
      console.log("Failed to generate follow-up questions:", e);
    }

    // Format sources
    const sources: Source[] = topDocs.map((doc) => ({
      content: doc.content.substring(0, 200) + "...",
      metadata: doc.metadata,
    }));

    return {
      answer,
      sources,
      followUpQuestions,
    };
  } catch (error) {
    console.error("RAG Error:", error);
    throw new Error("Failed to generate answer");
  }
}
