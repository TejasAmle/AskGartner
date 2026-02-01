# AskGartner - Project Context for Claude

## Project Overview

AskGartner is a RAG-powered research assistant that answers questions based on Gartner research documents. It features a ChatGPT-style interface with real-time chat, source citations, and follow-up question suggestions.

**Live URL**: http://localhost:3000
**Repository**: https://github.com/TejasAmle/AskGartner
**Tech Stack**: Next.js 14, React, TypeScript, Tailwind CSS, OpenAI API

## Critical Technical Decisions

### 1. **No Native Dependencies** (IMPORTANT!)
- **Why**: Native modules (canvas, hnswlib, pdf-parse) fail in Next.js serverless environment
- **Solution**: Custom pure JavaScript RAG implementation with in-memory vector search
- **Files Affected**: `lib/rag.ts` uses custom cosine similarity instead of HNSWLib

### 2. **Hardcoded Sample Data** (Not Real PDF Ingestion)
- **Why**: PDF parsing libraries had native dependency issues, and project needed to be built in ~1 hour
- **Current State**: 4 sample documents hardcoded in `lib/rag.ts` (lines 18-88)
- **PDFs**: 16 PDFs exist in `public/ResearchPapers/` for clickable citations, but NOT used for RAG
- **Future Enhancement**: Replace with real PDF ingestion using `pdf-parse` or similar

### 3. **In-Memory Embeddings Cache**
- **Implementation**: `embeddingsCache` variable in `lib/rag.ts` (line 91)
- **Why**: Embeddings are expensive, cache prevents re-computation
- **Limitation**: Cache resets on server restart (Next.js dev mode)
- **Production**: Consider Redis or persistent storage

## Project Structure

```
askgartner/
├── app/
│   ├── page.tsx                    # Main chat interface (chat UI, messages, loading states)
│   ├── layout.tsx                  # Root layout with Gartner branding
│   ├── globals.css                 # Tailwind imports
│   ├── how-it-works/
│   │   └── page.tsx                # RAG architecture visualization
│   └── api/
│       └── search/
│           └── route.ts            # POST endpoint for questions (validation, error handling)
├── lib/
│   └── rag.ts                      # Core RAG logic (embeddings, vector search, GPT-4o-mini)
├── public/
│   └── ResearchPapers/             # 16 PDF files (~100MB total)
├── .env.local                      # OPENAI_API_KEY
└── INTERVIEW_PREP.md               # Technical interview guide for Gartner PM role
```

## Key Files Deep Dive

### `lib/rag.ts` - The Heart of RAG
**Lines 18-88**: Hardcoded `knowledge` array with 4 sample documents
**Lines 91-105**: `getEmbeddings()` - Embeddings cache management
**Lines 107-119**: `cosineSimilarity()` - Custom similarity calculation
**Lines 121-211**: `searchAndAnswer()` - Main RAG pipeline:
1. Embed question with OpenAI (text-embedding-3-small)
2. Calculate cosine similarity with all documents
3. Get top 3 most similar documents
4. Format context with metadata
5. Call GPT-4o-mini with augmented prompt
6. Generate 3 follow-up questions
7. Return answer + sources + follow-ups

**Important**: Temperature set to 0 for deterministic answers (line 151)

### `app/page.tsx` - Chat Interface
**Lines 60-120**: `handleSubmit()` - Question submission flow:
- Immediately adds pending message to UI (instant feedback)
- Fetches answer from `/api/search`
- Updates message with results when complete

**Lines 122-169**: `formatAnswer()` - Structured text parsing:
- Detects headings (lines ending with `:`)
- Parses numbered lists (`1. Item`)
- Parses bullet points (`- Item` or `* Item`)
- Returns formatted JSX

**Lines 172-186**: `hasRelevantAnswer()` - Filters sources:
- Hides sources when AI says "does not contain", "unable to provide", etc.
- Prevents showing sources for irrelevant queries (e.g., "weather in Delhi")

**UX Features**:
- Rotating thinking messages (lines 44-56)
- Bouncing dot animation during loading
- Disabled states to prevent double-submission
- Suggestion pills for quick questions
- Follow-up questions below each answer
- Collapsible sidebar with recent questions

### `app/api/search/route.ts` - API Endpoint
**Validation**: 3-500 character limit on questions
**Error Handling**: Returns 400 for validation, 500 for server errors
**Integration**: Calls `searchAndAnswer()` from `lib/rag.ts`

### `app/how-it-works/page.tsx` - Architecture Demo
**4-Phase RAG Pipeline Visualization**:
1. Ingestion: PDFs → Chunks → Embeddings → Vector Store
2. Retrieval: Query → Embedding → Search → Retrieve
3. Augmentation: Query + Context → Augmented Prompt
4. Generation: LLM → Response

**Performance Metrics**:
- ~50ms vector search
- 4-6s LLM generation
- 1536D embedding dimensions
- Top-3 document retrieval

## Environment Setup

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
```

**Installation**:
```bash
npm install
npm run dev  # Runs on http://localhost:3000
```

## Known Issues & Gotchas

### 1. **PDF 404 Errors**
- **Symptom**: Clicking sources returns 404
- **Cause**: PDFs not in `public/` folder
- **Fix**: Ensure all PDFs are in `public/ResearchPapers/`
- **Important**: Must restart dev server after adding PDFs

### 2. **Module Path Resolution**
- **tsconfig**: `@/*` maps to root, NOT `src/`
- **Correct**: `lib/rag.ts` (root level)
- **Wrong**: `src/lib/rag.ts`

### 3. **Text Visibility**
- **Issue**: Gray text on white background
- **Fix**: All inputs use `text-gray-900 placeholder:text-gray-400`

### 4. **HNSWLib Binding Errors**
- **Never use**: `hnswlib-node` or similar native vector stores
- **Reason**: Next.js serverless doesn't support native modules
- **Solution**: Custom JavaScript implementation only

## Color Scheme (Gartner Branding)

```css
Primary Blue: #0052CC (Gartner brand)
Secondary Gray: #666666 (text)
Light Background: #F5F5F5 (sidebar)
White: #FFFFFF (content areas)
```

## API Response Format

```typescript
interface RAGResponse {
  answer: string;              // Generated answer from GPT-4o-mini
  sources: Source[];           // Top 3 relevant documents
  followUpQuestions?: string[]; // 3 AI-generated follow-up questions
}

interface Source {
  content: string;             // First 200 chars of document
  metadata: {
    source: string;            // PDF filename
    page?: number;             // Page number in PDF
  };
}
```

## Development Workflow

1. **Making Changes to RAG Logic**: Edit `lib/rag.ts`
2. **Adding New Documents**: Update `knowledge` array in `lib/rag.ts` (lines 18-88)
3. **UI Changes**: Edit `app/page.tsx`
4. **API Changes**: Edit `app/api/search/route.ts`
5. **Testing**: Always test with curl first before UI testing

**Test Command**:
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"question":"What are the key AI trends in 2025?"}'
```

## Future Enhancements (Roadmap)

### Phase 1: Real PDF Ingestion
- Replace hardcoded data with actual PDF parsing
- Use `pdf-parse` or alternative library
- Create ingestion script to process all 16 PDFs
- Store embeddings in persistent database (Supabase pgvector or Pinecone)

### Phase 2: Streaming Responses
- Implement streaming with OpenAI SDK
- Show answer tokens as they arrive (better UX)
- Use Server-Sent Events (SSE) for real-time updates

### Phase 3: Conversation Memory
- Store conversation history in state
- Pass previous Q&A to GPT for context-aware follow-ups
- Implement "Continue this conversation" feature

### Phase 4: Advanced Features
- Multi-document question answering
- Image/chart extraction from PDFs
- Export answers as PDF or Markdown
- User authentication with saved queries
- Admin dashboard for document management

## Deployment

**Vercel Deployment**:
1. Push to GitHub (already done)
2. Connect repo to Vercel
3. Add `OPENAI_API_KEY` to environment variables
4. Deploy

**Important**: Current implementation is deployment-ready (no native dependencies!)

## Performance Optimization Tips

1. **Embeddings**: Cache is critical - consider Redis in production
2. **Vector Search**: ~50ms is fast enough for MVP
3. **LLM Latency**: 4-6s is expected for GPT-4o-mini (consider streaming)
4. **PDF Size**: Keep total under 200MB for Vercel limits

## Debugging Checklist

- [ ] Is `OPENAI_API_KEY` set in `.env.local`?
- [ ] Did you restart dev server after changing env vars?
- [ ] Are PDFs in `public/ResearchPapers/`?
- [ ] Are you using correct module paths (`@/lib/rag` not `@/src/lib/rag`)?
- [ ] Is question 3-500 characters?
- [ ] Check browser console for frontend errors
- [ ] Check terminal for backend errors

## Contact & Context

**Built for**: Gartner Product Manager interview (AI Digital team)
**Timeline**: Built in ~4 hours (fast-track MVP)
**Purpose**: Demonstrate RAG understanding and AI product development skills
**User**: Tejas Amle (LinkedIn: https://www.linkedin.com/in/tejas-amle)

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Test API directly
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"question":"YOUR_QUESTION_HERE"}'

# View logs
# Terminal shows Next.js logs
# Browser console shows client errors
```

---

**Last Updated**: February 2026
**Status**: Production-ready MVP, deployment pending
