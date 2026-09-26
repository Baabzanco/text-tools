import React, { useState } from 'react';
import { Clock, BookOpen, FileText, Trash2 } from 'lucide-react';
import { readingTimeCalculatorProcessor } from '../../lib/text/processors/essentials';
import { countCharacters, countWords } from '../../lib/utils/unicode';

export const ReadingTimeTool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [wpm, setWpm] = useState(200);

  const res = readingTimeCalculatorProcessor(inputText, { wpm });
  const meta = res.metadata || {};

  const wordCount = countWords(inputText);
  const charCount = countCharacters(inputText);

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-6 p-6">
      {/* WPM Selector Cards */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Reading Speed (WPM)
          </span>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
            {wpm} Words Per Minute
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { rate: 100, label: '100 WPM', desc: 'Slow / Speech' },
            { rate: 150, label: '150 WPM', desc: 'Comfortable' },
            { rate: 200, label: '200 WPM', desc: 'Average Adult' },
            { rate: 250, label: '250 WPM', desc: 'Fast Reader' },
            { rate: 300, label: '300 WPM', desc: 'Speed Reading' }
          ].map((item) => {
            const isActive = wpm === item.rate;
            return (
              <button
                key={item.rate}
                onClick={() => setWpm(item.rate)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Result Display Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-300">
            Estimated Reading Duration
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {meta.readingTimeFormatted || '0 seconds'}
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono border-t sm:border-t-0 sm:border-l border-slate-700 pt-4 sm:pt-0 sm:pl-6">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-slate-400 block text-[10px]">TOTAL WORDS</span>
            <span className="text-base font-bold text-emerald-400">{wordCount.toLocaleString()}</span>
          </div>

          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-slate-400 block text-[10px]">CHARACTERS</span>
            <span className="text-base font-bold text-indigo-300">{charCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Article or Essay Text
          </span>
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste article, speech, or essay text here to calculate reading time..."
          className="w-full min-h-[220px] p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  );
};
