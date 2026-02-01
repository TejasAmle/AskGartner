"use client";

import { useEffect, useState } from "react";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStepColor = (step: number) => {
    if (activeStep === step) return "border-blue-400 bg-blue-500/20";
    return "border-gray-600 bg-gray-800/50";
  };

  const getLineOpacity = (step: number) => {
    return activeStep === step ? "opacity-100" : "opacity-30";
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">RAG Architecture - AskGartner</h1>
            <p className="text-gray-400">Retrieval-Augmented Generation Pipeline</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => window.close()}
            className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="space-y-12">
            {/* PHASE 1: INGESTION */}
            <div className="border-2 border-purple-500/30 rounded-lg p-6 bg-purple-900/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📥</span> Phase 1: Ingestion (Offline)
              </h2>
              <div className="flex items-center gap-4 justify-between">
                {/* PDF Documents */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(0)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="font-semibold">PDF Documents</div>
                    <div className="text-xs text-gray-400 mt-1">16 Research Papers</div>
                    <div className="text-xs text-gray-400">~100MB Total</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className={`transition-opacity ${getLineOpacity(0)}`}>
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Text Chunks */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(1)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">✂️</div>
                    <div className="font-semibold">Text Chunking</div>
                    <div className="text-xs text-gray-400 mt-1">Chunk Size: 1000 chars</div>
                    <div className="text-xs text-gray-400">Overlap: 200 chars</div>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-8 h-8 border border-gray-500 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className={`transition-opacity ${getLineOpacity(1)}`}>
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Embedding Model */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(2)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔢</div>
                    <div className="font-semibold">Embedding Model</div>
                    <div className="text-xs text-gray-400 mt-1">OpenAI text-embedding</div>
                    <div className="text-xs text-gray-400">Dimensions: 1536</div>
                    <div className="text-xs text-blue-300 mt-2">Vector: [0.23, -0.45, ...]</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className={`transition-opacity ${getLineOpacity(2)}`}>
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Vector Store */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(2)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🗄️</div>
                    <div className="font-semibold">Vector Store</div>
                    <div className="text-xs text-gray-400 mt-1">In-Memory Cache</div>
                    <div className="text-xs text-gray-400">Cosine Similarity</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHASE 2: RETRIEVAL */}
            <div className="border-2 border-blue-500/30 rounded-lg p-6 bg-blue-900/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span> Phase 2: Retrieval (Real-time)
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {/* User Query */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(3)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">👤</div>
                    <div className="font-semibold mb-2">User Query</div>
                    <div className="text-xs text-left bg-gray-900 p-2 rounded">
                      "What are the top AI trends in 2025?"
                    </div>
                  </div>
                </div>

                {/* Query Embedding */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(4)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔢</div>
                    <div className="font-semibold">Query Embedding</div>
                    <div className="text-xs text-gray-400 mt-1">OpenAI Embedding</div>
                    <div className="text-xs text-blue-300 mt-2">1536D Vector</div>
                  </div>
                </div>

                {/* Vector Search */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(4)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-semibold">Vector Search</div>
                    <div className="text-xs text-gray-400 mt-1">Cosine Similarity</div>
                    <div className="text-xs text-green-300 mt-1">Score: 0.89</div>
                    <div className="text-xs text-gray-400">Top-3 Results</div>
                  </div>
                </div>

                {/* Retrieved Docs */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(5)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="font-semibold">Retrieved Docs</div>
                    <div className="text-xs text-gray-400 mt-1">3 Most Relevant</div>
                    <div className="space-y-1 mt-2">
                      <div className="text-xs bg-green-900/30 p-1 rounded">Doc 1: 0.89</div>
                      <div className="text-xs bg-green-900/20 p-1 rounded">Doc 2: 0.84</div>
                      <div className="text-xs bg-green-900/10 p-1 rounded">Doc 3: 0.78</div>
                    </div>
                  </div>
                </div>

                {/* Context Preparation */}
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(5)}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="font-semibold">Context Prep</div>
                    <div className="text-xs text-gray-400 mt-1">Format Sources</div>
                    <div className="text-xs text-gray-400">Add Metadata</div>
                    <div className="text-xs text-blue-300 mt-2">~2000 tokens</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHASE 3: AUGMENTATION */}
            <div className="border-2 border-green-500/30 rounded-lg p-6 bg-green-900/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> Phase 3: Augmentation
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(6)}`}>
                  <div className="font-semibold mb-2">Original Query</div>
                  <div className="text-xs bg-gray-900 p-3 rounded">
                    "What are the top AI trends in 2025?"
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-3xl">+</span>
                </div>

                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(6)}`}>
                  <div className="font-semibold mb-2">Retrieved Context</div>
                  <div className="text-xs bg-gray-900 p-3 rounded space-y-1">
                    <div className="text-blue-300">[Source 1: AI Trends 2025]</div>
                    <div className="text-gray-400">1. AI Agents autonomous...</div>
                    <div className="text-gray-400">2. GenAI adoption...</div>
                    <div className="text-gray-500">...</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className={`transition-opacity ${getLineOpacity(6)}`}>
                  <svg className="w-8 h-8 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              <div className={`border-2 rounded-lg p-4 mt-4 transition-all ${getStepColor(6)}`}>
                <div className="font-semibold mb-2">Augmented Prompt</div>
                <div className="text-xs bg-gray-900 p-3 rounded">
                  <div className="text-purple-300">System: You are AskGartner...</div>
                  <div className="text-blue-300 mt-2">Context: [3 relevant documents]</div>
                  <div className="text-green-300 mt-2">Question: What are the top AI trends in 2025?</div>
                  <div className="text-gray-400 mt-2">Total tokens: ~2500</div>
                </div>
              </div>
            </div>

            {/* PHASE 4: GENERATION */}
            <div className="border-2 border-orange-500/30 rounded-lg p-6 bg-orange-900/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🤖</span> Phase 4: Generation
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(7)}`}>
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🧠</div>
                    <div className="font-semibold">LLM Processing</div>
                    <div className="text-xs text-gray-400 mt-1">Model: GPT-4o-mini</div>
                    <div className="text-xs text-gray-400">Temperature: 0</div>
                    <div className="text-xs text-gray-400">Max Tokens: 1000</div>
                    <div className="text-xs text-green-300 mt-2">Latency: ~4-6s</div>
                  </div>
                  {activeStep === 7 && (
                    <div className="flex justify-center gap-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  )}
                </div>

                <div className={`border-2 rounded-lg p-4 transition-all ${getStepColor(7)}`}>
                  <div className="font-semibold mb-2">Generated Response</div>
                  <div className="text-xs bg-gray-900 p-3 rounded space-y-2">
                    <p className="text-gray-300">Based on Gartner research, the top AI trends in 2025 are:</p>
                    <ol className="text-gray-400 space-y-1 ml-4">
                      <li>1. AI Agents becoming autonomous</li>
                      <li>2. GenAI adoption accelerating</li>
                      <li>3. Multi-modal AI emerging</li>
                    </ol>
                    <div className="text-blue-400 text-xs mt-3">
                      Sources: [Source 1], [Source 2]...
                    </div>
                    <div className="text-green-400 text-xs">
                      + 3 Follow-up Questions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-2 border-gray-600 rounded-lg p-6 bg-gray-800/30">
              <h2 className="text-xl font-bold mb-4">⚡ Performance Metrics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">~50ms</div>
                  <div className="text-xs text-gray-400">Vector Search</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">4-6s</div>
                  <div className="text-xs text-gray-400">LLM Generation</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">1536D</div>
                  <div className="text-xs text-gray-400">Embedding Dimensions</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">Top-3</div>
                  <div className="text-xs text-gray-400">Retrieved Documents</div>
                </div>
              </div>
            </div>

            {/* Current Step Indicator */}
            <div className="text-center pb-8">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
                <div className="text-sm text-gray-400 mb-1">Current Step</div>
                <div className="text-lg font-semibold">
                  {activeStep === 0 && "Loading PDF Documents"}
                  {activeStep === 1 && "Chunking Text into Segments"}
                  {activeStep === 2 && "Creating Embeddings & Storing Vectors"}
                  {activeStep === 3 && "Receiving User Query"}
                  {activeStep === 4 && "Searching Vector Database"}
                  {activeStep === 5 && "Retrieving Top Documents"}
                  {activeStep === 6 && "Augmenting Query with Context"}
                  {activeStep === 7 && "Generating AI Response"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
