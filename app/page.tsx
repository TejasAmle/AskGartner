"use client";

import { useState, useEffect } from "react";

interface Source {
  content: string;
  metadata: {
    source: string;
    page?: number;
  };
}

interface Message {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  followUpQuestions?: string[];
  timestamp: Date;
}

// Helper function to format markdown-like text
function formatAnswer(text: string) {
  const lines = text.split('\n');
  const formatted: JSX.Element[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      formatted.push(
        <ul key={`list-${formatted.length}`} className="list-disc list-inside space-y-2 my-4 ml-4">
          {currentList.map((item, i) => (
            <li key={i} className="text-gray-800 leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    // Check for numbered list items
    if (line.match(/^\d+\.\s/)) {
      flushList();
      const content = line.replace(/^\d+\.\s/, '');
      if (!currentList.length) {
        currentList = [content];
      } else {
        currentList.push(content);
      }
    }
    // Check for bullet points
    else if (line.match(/^[-*]\s/)) {
      const content = line.replace(/^[-*]\s/, '');
      currentList.push(content);
    }
    // Check for headers (lines ending with :)
    else if (line.trim().endsWith(':') && line.trim().length > 5) {
      flushList();
      formatted.push(
        <h3 key={`h-${idx}`} className="font-semibold text-gray-900 mt-6 mb-3 text-base">
          {line.trim()}
        </h3>
      );
    }
    // Regular paragraph
    else if (line.trim()) {
      flushList();
      formatted.push(
        <p key={`p-${idx}`} className="text-gray-800 leading-relaxed my-3">
          {line}
        </p>
      );
    }
    // Empty line
    else {
      flushList();
    }
  });

  flushList();
  return formatted;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [thinkingMessage, setThinkingMessage] = useState("Searching knowledge base...");

  // Rotate thinking messages
  useEffect(() => {
    const thinkingMessages = [
      "Searching knowledge base...",
      "Analyzing Gartner insights...",
      "Finding relevant sources...",
      "Generating answer...",
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % thinkingMessages.length;
      setThinkingMessage(thinkingMessages[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const suggestedQuestions = [
    "What are the top 3 challenges CIOs face when implementing AI in their organizations?",
    "What are the best ways to communicate the value of data quality to the executive team?",
    "What is the difference between AI governance and data governance?",
  ];

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const questionToAsk = customQuestion || question;
    if (!questionToAsk.trim()) return;

    // Immediately add user's question to chat and show loading state
    const pendingMessageId = Date.now().toString();
    const pendingMessage: Message = {
      id: pendingMessageId,
      question: questionToAsk,
      answer: "", // Empty answer indicates pending
      sources: [],
      timestamp: new Date(),
    };

    setMessages([...messages, pendingMessage]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionToAsk }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();

      // Update the pending message with actual response
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === pendingMessageId
            ? {
                ...msg,
                answer: data.answer,
                sources: data.sources,
                followUpQuestions: data.followUpQuestions || [],
              }
            : msg
        )
      );
    } catch (err) {
      setError("Sorry, something went wrong. Please try again.");
      // Remove the pending message on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== pendingMessageId));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    handleSubmit(undefined, suggestion);
  };

  const handleNewChat = () => {
    setMessages([]);
    setQuestion("");
    setError("");
  };

  const openPDF = (filename: string, page?: number) => {
    // Construct PDF path - PDFs are in public/ResearchPapers folder
    const pdfPath = `/ResearchPapers/${filename}`;
    window.open(pdfPath, '_blank');
  };

  // Check if answer indicates no relevant information found
  const hasRelevantAnswer = (answer: string) => {
    const noInfoPhrases = [
      'does not contain',
      'unable to provide',
      'no information',
      'cannot answer',
      'not mentioned',
      'not provided',
      'not available in the context'
    ];
    return !noInfoPhrases.some(phrase => answer.toLowerCase().includes(phrase));
  };

  const hasConversation = messages.length > 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <button
              onClick={handleNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#003D99] transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium text-sm">New Chat</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Hide sidebar"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Questions</h2>
            {messages.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-400 mb-2">Today</h3>
                  <div className="space-y-1">
                    {messages.map((msg) => (
                      <button
                        key={msg.id}
                        className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200 truncate"
                      >
                        {msg.question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No recent questions yet</p>
            )}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                title="Show sidebar"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="w-9 h-9 bg-gradient-to-br from-[#0052CC] to-[#003D99] rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Ask Gartner</span>
          </div>
          <button
            onClick={() => window.open('/how-it-works', '_blank')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0052CC] to-[#003D99] rounded-lg hover:shadow-lg transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            See how it works!
          </button>
        </header>

        {/* Messages or Empty State */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          {!hasConversation ? (
            /* Centered Empty State */
            <div className="h-full flex flex-col items-center justify-center px-6 pb-32">
              <div className="mb-8 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0052CC] to-[#003D99] rounded-2xl flex items-center justify-center shadow-xl mb-6">
                  <span className="text-white font-bold text-3xl">G</span>
                </div>
              </div>
              <h1 className="text-6xl font-bold text-[#0052CC] mb-4">AskGartner</h1>
              <p className="text-lg text-gray-600 mb-2 font-medium">
                An AI-Powered Tool to Access Trusted Gartner Insights
              </p>
              <p className="text-sm text-gray-500 mb-12 max-w-2xl text-center">
                Ask factual, how-to or comparison questions based on Gartner insights. We don't endorse vendors or products.
              </p>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mb-8">
                {suggestedQuestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                    className="p-5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-left text-sm text-gray-700 transition-all shadow-sm hover:shadow-md hover:border-[#0052CC] group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0052CC] transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-6">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-[#0052CC] to-[#003D99] text-white rounded-2xl px-5 py-3 max-w-2xl shadow-md">
                      <p className="leading-relaxed">{msg.question}</p>
                    </div>
                  </div>

                  {/* AI Answer */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0052CC] to-[#003D99] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      {/* Show thinking state if answer is empty (pending) */}
                      {!msg.answer ? (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-2.5 h-2.5 bg-[#0052CC] rounded-full animate-bounce"></div>
                              <div className="w-2.5 h-2.5 bg-[#0052CC] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2.5 h-2.5 bg-[#0052CC] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {thinkingMessage}
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-400">
                            Reviewing Gartner research papers and insights...
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                          <div className="prose-sm max-w-none">
                            {formatAnswer(msg.answer)}
                          </div>
                        </div>
                      )}

                      {/* Sources - Only show if answer is relevant */}
                      {msg.sources.length > 0 && hasRelevantAnswer(msg.answer) && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Sources
                          </p>
                          {msg.sources.map((source, idx) => (
                            <button
                              key={idx}
                              onClick={() => openPDF(source.metadata.source, source.metadata.page)}
                              className="w-full text-left text-xs text-gray-600 bg-white hover:bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#0052CC] transition-all shadow-sm hover:shadow-md group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-[#0052CC] group-hover:text-[#003D99] mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    {source.metadata.source}
                                    {source.metadata.page && (
                                      <span className="text-gray-500 font-normal">• Page {source.metadata.page}</span>
                                    )}
                                  </p>
                                  <p className="mt-2 text-gray-600 line-clamp-2">{source.content}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#0052CC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                        <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Follow-up Questions:</h4>
                          <div className="space-y-2">
                            {msg.followUpQuestions.map((followUpQ, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(followUpQ)}
                                disabled={loading}
                                className="block w-full text-left text-sm text-[#0052CC] hover:text-[#003D99] hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {followUpQ}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0052CC] to-[#003D99] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#0052CC] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#0052CC] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-[#0052CC] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t border-gray-200 bg-white px-6 py-5 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Suggestion Pills - Show during conversation too */}
            {hasConversation && (
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestedQuestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-all border border-gray-200 hover:border-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion.length > 60 ? suggestion.substring(0, 60) + '...' : suggestion}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 shadow-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What are the steps required to lead a successful digital transformation for a large finance organization in the healthcare industry?"
                className="w-full px-5 py-4 pr-14 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0052CC] focus:border-transparent resize-none shadow-sm"
                rows={hasConversation ? 2 : 3}
                maxLength={500}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-[#0052CC] to-[#003D99] text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                {hasConversation ? "0/5 questions" : ""}
              </p>
              <p className="text-xs text-gray-500 font-medium">{question.length}/500</p>
            </div>
            {!hasConversation && (
              <p className="mt-3 text-xs text-gray-500 text-center leading-relaxed">
                AskGartner can make mistakes. Generative answers should be checked against their Gartner sources.
                AskGartner answers cannot be quoted. Gartner does not endorse any provider, product, or service.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
