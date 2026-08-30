import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, ArrowRight, ArrowLeft, Trophy, BarChart, BookOpen } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

export const MockTestsPage: React.FC = () => {
  const [activeTest, setActiveTest] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Mock test catalog
  const tests = [
    {
      id: 't-1',
      title: 'Aptitude & Quantitative Analysis',
      category: 'Aptitude',
      questionsCount: 5,
      duration: 300, // 5 minutes in seconds
      difficulty: 'Medium',
      questions: [
        {
          id: 1,
          text: 'A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/hr.',
          options: ['60 km/hr', '72 km/hr', '80 km/hr', '84 km/hr'],
          correct: 1 // 72
        },
        {
          id: 2,
          text: 'If A and B can do a piece of work in 8 days and B alone can do it in 12 days, in how many days can A alone do it?',
          options: ['16 days', '20 days', '24 days', '30 days'],
          correct: 2 // 24
        },
        {
          id: 3,
          text: 'Find the average of first 40 natural numbers.',
          options: ['20', '20.5', '21', '21.5'],
          correct: 1 // 20.5
        },
        {
          id: 4,
          text: 'What is 15% of 34% of 12000?',
          options: ['612', '580', '654', '690'],
          correct: 0 // 612
        },
        {
          id: 5,
          text: 'A sum of money doubles itself in 8 years at simple interest. What is the rate of interest per annum?',
          options: ['10%', '12%', '12.5%', '15%'],
          correct: 2 // 12.5%
        }
      ]
    },
    {
      id: 't-2',
      title: 'Data Structures & Algorithms MCQ',
      category: 'Coding',
      questionsCount: 5,
      duration: 300,
      difficulty: 'Hard',
      questions: [
        {
          id: 1,
          text: 'What is the worst-case time complexity of searching in a Binary Search Tree (BST)?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
          correct: 2
        },
        {
          id: 2,
          text: 'Which data structure is mainy used to implement recursion?',
          options: ['Stack', 'Queue', 'Linked List', 'Tree'],
          correct: 0
        },
        {
          id: 3,
          text: 'What is the time complexity to insert an element at the beginning of a singly linked list?',
          options: ['O(1)', 'O(N)', 'O(log N)', 'O(N log N)'],
          correct: 0
        },
        {
          id: 4,
          text: 'Which sorting algorithm has the best average-case performance?',
          options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
          correct: 2
        },
        {
          id: 5,
          text: 'Which of the following traversal techniques visits BST nodes in sorted ascending order?',
          options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
          correct: 1
        }
      ]
    }
  ];

  // Timer interval hook
  useEffect(() => {
    if (!activeTest || testResult) return;
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTest, timeLeft, testResult]);

  const handleStartTest = (test: any) => {
    setActiveTest(test);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimeLeft(test.duration);
    setTestResult(null);
  };

  const handleOptionSelect = (optionIdx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optionIdx
    });
  };

  const handleSubmitTest = () => {
    let score = 0;
    activeTest.questions.forEach((q: Question, idx: number) => {
      if (selectedAnswers[idx] === q.correct) {
        score++;
      }
    });

    const percent = Math.round((score / activeTest.questionsCount) * 100);
    setTestResult({
      score,
      percent,
      timeTaken: activeTest.duration - timeLeft
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  if (activeTest && !testResult) {
    const q = activeTest.questions[currentQuestionIdx];
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Test Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-extrabold text-slate-800 text-lg leading-snug">{activeTest.title}</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Question {currentQuestionIdx + 1} of {activeTest.questionsCount}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 font-bold text-brand-orange text-sm shadow-sm ring-1 ring-orange-500/10">
            <Clock className="h-4.5 w-4.5" />
            <span>Time: {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <p className="font-bold text-slate-800 text-base leading-relaxed">{q.text}</p>

          {/* Options list */}
          <div className="space-y-3">
            {q.options.map((opt: string, idx: number) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-brand-orange bg-orange-50/30 text-brand-orange shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation bottom */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Previous
          </button>

          {currentQuestionIdx < activeTest.questionsCount - 1 ? (
            <button
              onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Next
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitTest}
              className="rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90"
            >
              Submit Test
            </button>
          )}
        </div>
      </div>
    );
  }

  if (testResult) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-brand-orange mx-auto shadow-md">
          <Trophy className="h-8 w-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Test Result Submitted</h2>
          <p className="text-sm text-slate-400 font-semibold">You completed {activeTest.title}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 border border-slate-100 rounded-3xl bg-slate-50 p-5 text-slate-600">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Correct Score</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{testResult.score} / {activeTest.questionsCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Percentage</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{testResult.percent}%</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Time Spent</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{formatTime(testResult.timeTaken)}</p>
          </div>
        </div>

        {/* Performance insights */}
        <div className="rounded-3xl border border-blue-50 bg-blue-50/20 p-5 text-left space-y-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            <BarChart className="h-4.5 w-4.5 text-brand-blue" />
            Performance Analysis
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            {testResult.percent >= 80 
              ? 'Excellent performance! You demonstrate a solid understanding of these core topics. Keep practicing and attempting technical interviews.' 
              : testResult.percent >= 50 
              ? 'Good effort, but there is scope to improve. Review the incorrect answers and strengthen your foundational formulas.' 
              : 'Requires improvement. We recommend exploring the study notes and syllabus document repositories.'}
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => handleStartTest(activeTest)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Retake Test
          </button>
          <button
            onClick={() => setActiveTest(null)}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-sans">Placement Preparation</h1>
        <p className="text-sm text-slate-500 font-medium">Practice multiple-choice questions on aptitude, logical reasoning, and coding to ace company rounds.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {tests.map((test) => (
          <div key={test.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {test.category}
                </span>
                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  test.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {test.difficulty}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{test.title}</h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2">
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4.5 w-4.5 text-slate-400" /> {test.questionsCount} MCQs</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4.5 w-4.5 text-slate-400" /> {test.duration / 60} minutes</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartTest(test)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink py-3 text-xs font-bold text-white shadow-md hover:opacity-90"
            >
              Start Practice Test
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
