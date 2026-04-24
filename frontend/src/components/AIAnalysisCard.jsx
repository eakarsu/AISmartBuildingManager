import React from 'react'
import { Sparkles } from 'lucide-react'

function formatContent(text) {
  if (!text) return ''
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-blue-300">$1</em>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc text-dark-200">$1</li>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal text-dark-200">$2</li>')
    .replace(/\n\n/g, '</p><p class="mt-3 text-dark-200">')
    .replace(/\n/g, '<br />')

  html = '<p class="text-dark-200">' + html + '</p>'
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, (match) => `<ul class="my-2 space-y-1">${match}</ul>`)

  return html
}

export default function AIAnalysisCard({ analysis }) {
  if (!analysis) return null

  const content = analysis.content || analysis.analysis || analysis.response || ''
  const model = analysis.model || 'AI Model'
  const timestamp = analysis.timestamp || analysis.analyzedAt || new Date().toISOString()

  return (
    <div className="mt-4 animate-slide-up">
      <div className="gradient-border p-[1px] rounded-xl">
        <div className="bg-dark-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <Sparkles size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
              <p className="text-xs text-dark-400">{model}</p>
            </div>
            <div className="ml-auto text-xs text-dark-500">
              {new Date(timestamp).toLocaleString()}
            </div>
          </div>

          <div
            className="prose prose-sm prose-invert max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />

          <div className="mt-4 pt-3 border-t border-dark-700 flex items-center justify-between">
            <span className="text-xs text-dark-500 flex items-center gap-1">
              <Sparkles size={12} />
              Powered by {model}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
