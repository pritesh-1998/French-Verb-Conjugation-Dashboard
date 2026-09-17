import React, { useState, useMemo, useEffect } from 'react';
import {
  Verb,
  TenseId,
  QuizType,
  VerbPoolType,
  VerbProgress,
  QuizQuestion,
  FullTableQuestion,
  MatchQuestion,
  MatchPair,
  QuizResult,
} from '../types';
import { TENSES, TENSE_MAP } from '../data/tenses';
import { QuizSetup } from './quiz/QuizSetup';
import { QuizTypingMode } from './quiz/QuizTypingMode';
import { QuizMultipleChoice } from './quiz/QuizMultipleChoice';
import { QuizFullTableMode } from './quiz/QuizFullTableMode';
import { QuizMatchMode } from './quiz/QuizMatchMode';
import { QuizResults } from './quiz/QuizResults';
import {
  getRandomVerbsFromLibrary,
  getAllFavoriteVerbs,
  getVerbByInfinitiveOrId,
} from '../utils/conjugator';
import {
  getIsolatedVerbForm,
  formatSpokenConjugation,
} from '../utils/frenchFormatting';
import { Flame, Trophy, X, Target, Zap } from 'lucide-react';

interface QuizModeProps {
  allVerbs: Verb[];
  progress?: Record<string, VerbProgress>;
  onRecordAttempt: (verbId: string, isCorrect: boolean) => void;
  onFinishQuiz: () => void;
  initialFilterVerbIds?: string[];
}

export const QuizMode: React.FC<QuizModeProps> = ({
  allVerbs,
  progress = {},
  onRecordAttempt,
  onFinishQuiz,
  initialFilterVerbIds,
}) => {
  // Setup configuration state
  const [inSession, setInSession] = useState(false);
  const [quizType, setQuizType] = useState<QuizType>('full-table');
  const [selectedPoolType, setSelectedPoolType] = useState<VerbPoolType>(
    initialFilterVerbIds && initialFilterVerbIds.length > 0 ? 'custom' : 'all'
  );
  const [customPoolGroups, setCustomPoolGroups] = useState<number[]>([1, 2, 3]);
  const [customPoolOnlyFavorites, setCustomPoolOnlyFavorites] = useState(false);
  const [selectedTenses, setSelectedTenses] = useState<TenseId[]>(['present']);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [specificVerb, setSpecificVerb] = useState<Verb | null>(null);

  // Active session questions
  const [questions, setQuestions] = useState<(QuizQuestion | FullTableQuestion | MatchQuestion)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);

  // Scoring and Streak
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);

  // Single-question answer state for typing & multiple-choice
  const [currentAnswered, setCurrentAnswered] = useState(false);
  const [currentUserAnswer, setCurrentUserAnswer] = useState('');
  const [currentSelectedOption, setCurrentSelectedOption] = useState<string | null>(null);
  const [currentIsCorrect, setCurrentIsCorrect] = useState(false);

  // All favorites from curated and stored bookmarks
  const allFavorites = useMemo(() => {
    return getAllFavoriteVerbs();
  }, [progress]);

  // Compute eligible pool of verbs
  const eligiblePool = useMemo(() => {
    if (initialFilterVerbIds && initialFilterVerbIds.length > 0) {
      const filtered = allVerbs.filter((v) => initialFilterVerbIds.includes(v.id));
      if (filtered.length > 0) return filtered;
    }

    if (selectedPoolType === 'specific' && specificVerb) {
      return [specificVerb];
    }

    if (selectedPoolType === 'library7000') {
      return getRandomVerbsFromLibrary(30, customPoolGroups.length < 3 ? customPoolGroups : undefined);
    }

    if (selectedPoolType === 'favorites') {
      return allFavorites.length > 0 ? allFavorites : allVerbs.filter((v) => progress[v.id]?.bookmarked);
    }
    if (selectedPoolType === 'group1') {
      return allVerbs.filter((v) => v.group === 1);
    }
    if (selectedPoolType === 'group2') {
      return allVerbs.filter((v) => v.group === 2);
    }
    if (selectedPoolType === 'group3') {
      return allVerbs.filter((v) => v.group === 3);
    }
    if (selectedPoolType === 'custom') {
      const sourceList = customPoolOnlyFavorites ? (allFavorites.length > 0 ? allFavorites : allVerbs) : allVerbs;
      return sourceList.filter((v) => {
        const matchesGroup = customPoolGroups.includes(v.group);
        const matchesFav = customPoolOnlyFavorites
          ? Boolean(progress[v.id]?.bookmarked || allFavorites.some((f) => f.id === v.id || f.infinitive === v.infinitive))
          : true;
        return matchesGroup && matchesFav;
      });
    }

    return allVerbs;
  }, [
    allVerbs,
    selectedPoolType,
    customPoolGroups,
    customPoolOnlyFavorites,
    progress,
    initialFilterVerbIds,
    specificVerb,
    allFavorites,
  ]);

  const handleToggleTense = (id: TenseId) => {
    if (selectedTenses.includes(id)) {
      if (selectedTenses.length > 1) {
        setSelectedTenses(selectedTenses.filter((t) => t !== id));
      }
    } else {
      setSelectedTenses([...selectedTenses, id]);
    }
  };

  // Generate question session
  const startQuizSession = (overrideVerbs?: Verb[]) => {
    let pool: Verb[] = [];

    if (overrideVerbs && overrideVerbs.length > 0) {
      pool = overrideVerbs;
    } else if (selectedPoolType === 'specific' && specificVerb) {
      pool = [specificVerb];
    } else if (selectedPoolType === 'library7000') {
      pool = getRandomVerbsFromLibrary(Math.max(questionCount * 2, 20), customPoolGroups.length < 3 ? customPoolGroups : undefined);
    } else if (selectedPoolType === 'favorites') {
      pool = allFavorites.length > 0 ? allFavorites : allVerbs.filter((v) => progress[v.id]?.bookmarked);
    } else if (eligiblePool.length > 0) {
      pool = eligiblePool;
    } else {
      pool = allVerbs;
    }

    if (pool.length === 0) {
      pool = allVerbs;
    }

    const count = overrideVerbs
      ? overrideVerbs.length
      : selectedPoolType === 'specific'
      ? Math.min(questionCount, selectedTenses.length * 6)
      : Math.min(questionCount, pool.length * 4);

    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    const generated: (QuizQuestion | FullTableQuestion | MatchQuestion)[] = [];

    for (let i = 0; i < count; i++) {
      const verb = shuffledPool[i % shuffledPool.length];
      const tenseId = selectedTenses[i % selectedTenses.length] || selectedTenses[0] || 'present';
      const tenseMeta = TENSE_MAP.get(tenseId) || TENSES[0];
      const forms = verb.conjugations[tenseId] || verb.conjugations.present || [];

      if (quizType === 'full-table') {
        generated.push({
          id: `full-table-${i}-${verb.id}-${Date.now()}`,
          verb,
          tenseId,
          tenseName: tenseMeta.nameEn,
          forms,
        } as FullTableQuestion);
      } else if (quizType === 'match') {
        const pairs: MatchPair[] = forms.map((f, pIdx) => ({
          id: `pair-${pIdx}-${f.pronoun}`,
          pronoun: f.pronoun,
          pronounDisplay: f.pronounDisplay,
          conjugatedForm: getIsolatedVerbForm(f.form, f.pronoun),
          audioText: formatSpokenConjugation(f.pronounDisplay, f.form),
        }));

        generated.push({
          id: `match-${i}-${verb.id}-${Date.now()}`,
          verb,
          tenseId,
          tenseName: tenseMeta.nameEn,
          pairs,
        } as MatchQuestion);
      } else {
        // Typing or Multiple Choice
        const formIndex = Math.floor(Math.random() * forms.length);
        const formItem = forms[formIndex] || forms[0];
        const answer = formItem.form;

        // Distractors for Multiple Choice
        const optionsSet = new Set<string>();
        optionsSet.add(answer);

        // Same verb other forms
        forms.forEach((f) => {
          if (optionsSet.size < 4 && f.form !== answer) {
            optionsSet.add(f.form);
          }
        });

        // Other verb form in same tense
        const otherVerb = allVerbs[Math.floor(Math.random() * allVerbs.length)];
        const otherForms = otherVerb.conjugations[tenseId] || otherVerb.conjugations.present || [];
        otherForms.forEach((f) => {
          if (optionsSet.size < 4 && f.form !== answer) {
            optionsSet.add(f.form);
          }
        });

        if (optionsSet.size < 4) {
          optionsSet.add(`${formItem.pronoun} ${verb.infinitive}`);
        }

        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        generated.push({
          id: `q-${i}-${verb.id}-${Date.now()}`,
          verb,
          tenseId,
          tenseName: tenseMeta.nameEn,
          pronoun: formItem.pronoun,
          pronounDisplay: formItem.pronounDisplay,
          correctAnswer: answer,
          options,
          contextSentence:
            verb.example && verb.example.fr.includes(verb.example.verbForm)
              ? {
                  before: verb.example.fr.split(verb.example.verbForm)[0] || '',
                  after: verb.example.fr.split(verb.example.verbForm)[1] || '',
                  translation: verb.example.en,
                }
              : undefined,
        } as QuizQuestion);
      }
    }

    setQuestions(generated);
    setCurrentIndex(0);
    setResults([]);
    setIsFinished(false);
    setScore(0);
    setCurrentStreak(0);
    setHighestStreak(0);
    setLastPointsEarned(0);
    setCurrentAnswered(false);
    setCurrentUserAnswer('');
    setCurrentSelectedOption(null);
    setCurrentIsCorrect(false);
    setInSession(true);
  };

  // Handling Single-Form Answers (Typing / Multiple Choice)
  const handleEvaluateSingleAnswer = (givenAnswer: string) => {
    const currentQ = questions[currentIndex] as QuizQuestion;
    if (!currentQ || currentAnswered) return;

    const cleanGiven = givenAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanCorrect = currentQ.correctAnswer.toLowerCase().replace(/\s+/g, ' ');

    const isExact = cleanGiven === cleanCorrect;
    const justVerbCorrect = cleanCorrect.replace(
      new RegExp(`^${currentQ.pronoun}\\s+`, 'i'),
      ''
    );
    const isVerbMatch = cleanGiven === justVerbCorrect;
    const isCorrect = isExact || isVerbMatch;

    setCurrentAnswered(true);
    setCurrentUserAnswer(givenAnswer);
    setCurrentSelectedOption(givenAnswer);
    setCurrentIsCorrect(isCorrect);

    onRecordAttempt(currentQ.verb.id, isCorrect);

    if (isCorrect) {
      const nextStreak = currentStreak + 1;
      const mult = nextStreak >= 5 ? 1.5 : nextStreak >= 3 ? 1.3 : nextStreak >= 2 ? 1.1 : 1.0;
      const pts = Math.round(100 * mult);
      setScore((s) => s + pts);
      setLastPointsEarned(pts);
      setCurrentStreak(nextStreak);
      if (nextStreak > highestStreak) setHighestStreak(nextStreak);
    } else {
      setCurrentStreak(0);
      setLastPointsEarned(0);
    }

    setResults((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: givenAnswer,
        isCorrect,
        verb: currentQ.verb,
        tenseName: currentQ.tenseName,
        details: currentQ.correctAnswer,
      },
    ]);
  };

  const handleNextSingleQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setCurrentAnswered(false);
      setCurrentUserAnswer('');
      setCurrentSelectedOption(null);
      setCurrentIsCorrect(false);
    } else {
      finishSession();
    }
  };

  // Handling Full-Table Mode answers
  const handleFullTableEvaluated = (
    verbId: string,
    allCorrect: boolean,
    correctSum: number,
    evaluations: any[]
  ) => {
    const currentQ = questions[currentIndex] as FullTableQuestion;
    onRecordAttempt(verbId, allCorrect);

    const pts = correctSum * 50 + (allCorrect ? 100 : 0);
    setScore((s) => s + pts);

    if (allCorrect) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > highestStreak) setHighestStreak(nextStreak);
    } else {
      setCurrentStreak(0);
    }

    // Add row evaluations to results
    evaluations.forEach((ev) => {
      setResults((prev) => [
        ...prev,
        {
          question: currentQ,
          userAnswer: ev.userForm,
          isCorrect: ev.isCorrect,
          verb: currentQ.verb,
          tenseName: currentQ.tenseName,
          details: ev.expectedForm,
        },
      ]);
    });
  };

  const handleNextFullTableVerb = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      finishSession();
    }
  };

  // Handling Match Mode answers
  const handleMatchCompleted = (verbId: string, mistakesCount: number) => {
    const currentQ = questions[currentIndex] as MatchQuestion;
    const isClean = mistakesCount === 0;
    onRecordAttempt(verbId, isClean);

    const pts = currentQ.pairs.length * 50;
    setScore((s) => s + pts);

    if (isClean) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);
      if (nextStreak > highestStreak) setHighestStreak(nextStreak);
    } else {
      setCurrentStreak(0);
    }

    setResults((prev) => [
      ...prev,
      {
        question: currentQ,
        userAnswer: `${currentQ.pairs.length - mistakesCount} / ${currentQ.pairs.length} direct pairs matched`,
        isCorrect: isClean,
        verb: currentQ.verb,
        tenseName: currentQ.tenseName,
        details: `${currentQ.pairs.length} associated forms`,
      },
    ]);
  };

  const handleNextMatchQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setIsFinished(true);
    onFinishQuiz();
  };

  const handleRetryMistakes = () => {
    const missedVerbIds: string[] = Array.from(new Set(results.filter((r) => !r.isCorrect).map((r) => String(r.verb.id))));
    const missedVerbs = missedVerbIds
      .map((id) => getVerbByInfinitiveOrId(id))
      .filter((v): v is Verb => v !== null);

    if (missedVerbs.length > 0) {
      startQuizSession(missedVerbs);
    }
  };

  const handleExitSession = () => {
    setInSession(false);
    setIsFinished(false);
    setQuestions([]);
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {!inSession ? (
        /* 1. Setup Configuration Screen */
        <QuizSetup
          allVerbs={allVerbs}
          progress={progress}
          selectedPoolType={selectedPoolType}
          setSelectedPoolType={setSelectedPoolType}
          customPoolGroups={customPoolGroups}
          setCustomPoolGroups={setCustomPoolGroups}
          customPoolOnlyFavorites={customPoolOnlyFavorites}
          setCustomPoolOnlyFavorites={setCustomPoolOnlyFavorites}
          quizType={quizType}
          setQuizType={setQuizType}
          selectedTenses={selectedTenses}
          onToggleTense={handleToggleTense}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          onStartQuiz={() => startQuizSession()}
          computedPoolCount={eligiblePool.length}
          specificVerb={specificVerb}
          onSelectSpecificVerb={setSpecificVerb}
          allFavoritesCount={allFavorites.length}
        />
      ) : isFinished ? (
        /* 2. Results and Review Screen */
        <QuizResults
          results={results}
          score={score}
          highestStreak={highestStreak}
          onRetryMistakes={results.some((r) => !r.isCorrect) ? handleRetryMistakes : undefined}
          onNewQuiz={handleExitSession}
        />
      ) : (
        /* 3. Active Quiz Question View */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Real-time Session HUD */}
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 px-2">
            {/* Progress counter & bar */}
            <div className="flex-1 max-w-xs sm:max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-1.5">
                <span>
                  {quizType === 'full-table' ? 'Verb' : 'Question'} {currentIndex + 1} of {questions.length}
                </span>
                <span className="font-mono">
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Score & Streak HUD */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{currentStreak}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold shadow-2xs">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span>{score} pts</span>
              </div>

              <button
                type="button"
                onClick={handleExitSession}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer"
                title="Exit session"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Question Rendered according to Quiz Type */}
          {quizType === 'full-table' && (
            <QuizFullTableMode
              key={questions[currentIndex]?.id}
              question={questions[currentIndex] as FullTableQuestion}
              onTableEvaluated={handleFullTableEvaluated}
              onNextVerb={handleNextFullTableVerb}
              isLastVerb={currentIndex === questions.length - 1}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          )}

          {quizType === 'typing' && (
            <QuizTypingMode
              key={questions[currentIndex]?.id}
              question={questions[currentIndex] as QuizQuestion}
              onSubmitAnswer={handleEvaluateSingleAnswer}
              onNextQuestion={handleNextSingleQuestion}
              isAnswered={currentAnswered}
              isCorrect={currentIsCorrect}
              userAnswer={currentUserAnswer}
              pointsEarned={lastPointsEarned}
              streak={currentStreak}
              isLastQuestion={currentIndex === questions.length - 1}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          )}

          {quizType === 'multiple-choice' && (
            <QuizMultipleChoice
              key={questions[currentIndex]?.id}
              question={questions[currentIndex] as QuizQuestion}
              onSelectOption={handleEvaluateSingleAnswer}
              onNextQuestion={handleNextSingleQuestion}
              isAnswered={currentAnswered}
              selectedOption={currentSelectedOption}
              isCorrect={currentIsCorrect}
              pointsEarned={lastPointsEarned}
              streak={currentStreak}
              isLastQuestion={currentIndex === questions.length - 1}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          )}

          {quizType === 'match' && (
            <QuizMatchMode
              key={questions[currentIndex]?.id}
              question={questions[currentIndex] as MatchQuestion}
              onMatchCompleted={handleMatchCompleted}
              onNextQuestion={handleNextMatchQuestion}
              isLastQuestion={currentIndex === questions.length - 1}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          )}
        </div>
      )}
    </div>
  );
};
