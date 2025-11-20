// AdaptiveExam.js
// Works with backend response: [{ question_id, difficulty_level }, ...]
// Manages only IDs + levels (Option B). Provides serialization for localStorage.

export default class AdaptiveExam {
  /**
   * examList: Array of { question_id, difficulty_level }
   * state (optional): object returned from serialize() to resume state
   */
  constructor(examList = [], state = null) {
    // Build levels info
    const levels = examList.map(q => q.difficulty_level);
    this.minLevel = levels.length ? Math.min(...levels) : 1;
    this.maxLevel = levels.length ? Math.max(...levels) : 5;

    // grouping questions by level as arrays of ids
    this.questionsByLevel = {};
    examList.forEach(it => {
      const lvl = it.difficulty_level;
      if (!this.questionsByLevel[lvl]) this.questionsByLevel[lvl] = [];
      // push the id
      this.questionsByLevel[lvl].push(it.question_id);
    });

    // answered list { question_id, isCorrect, level }
    this.answeredQuestions = [];

    // current level and currentQuestionId
    this.currentLevel = this.minLevel;
    this.currentQuestionId = null;

    // If resuming from saved state
    if (state) {
      this._loadState(state);
    }
  }

  // INTERNAL: remove a question id from its level bucket (first match)
  _removeFromLevel(level, qid) {
    if (!this.questionsByLevel[level]) return;
    const idx = this.questionsByLevel[level].indexOf(qid);
    if (idx !== -1) this.questionsByLevel[level].splice(idx, 1);
  }

  // Try to pick next question id from a level (removes it from bucket)
  pickQuestionFromLevel(level) {
    const arr = this.questionsByLevel[level];
    if (!arr || arr.length === 0) return null;
    // pick from start to preserve ordering from backend
    return arr.shift();
  }

  // Returns the next question object { question_id, difficulty_level } or null
  getNextQuestion(isPreviousCorrect = null) {
    // Decide desired level
    let desiredLevel = this.currentLevel;
    if (isPreviousCorrect === true) {
      desiredLevel = Math.min(this.currentLevel + 1, this.maxLevel);
    } else if (isPreviousCorrect === false) {
      desiredLevel = Math.max(this.currentLevel - 1, this.minLevel);
    }

    // Try desired level first
    let nextId = this.pickQuestionFromLevel(desiredLevel);

    // If none in desired level -> try staying at currentLevel
    if (!nextId) {
      nextId = this.pickQuestionFromLevel(this.currentLevel);
      desiredLevel = this.currentLevel;
    }

    // Final fallback: search all levels for any question left (nearest-first optional)
    if (!nextId) {
      // Search from min to max
      for (let lvl = this.minLevel; lvl <= this.maxLevel; lvl++) {
        if (lvl === this.currentLevel) continue;
        if (this.questionsByLevel[lvl] && this.questionsByLevel[lvl].length > 0) {
          nextId = this.pickQuestionFromLevel(lvl);
          desiredLevel = lvl;
          break;
        }
      }
    }

    if (!nextId) {
      // No questions left anywhere
      this.currentQuestionId = null;
      return null;
    }

    // Set current state
    this.currentLevel = desiredLevel;
    this.currentQuestionId = nextId;

    return { question_id: nextId, difficulty_level: desiredLevel };
  }

  // Call after backend returns isCorrect for the current question.
  // Records answered question and returns the next question object (or null).
  submitAnswer(isCorrect) {
    if (!this.currentQuestionId) return null;

    // record answered
    this.answeredQuestions.push({
      question_id: this.currentQuestionId,
      isCorrect,
      level: this.currentLevel
    });

    // get next
    return this.getNextQuestion(isCorrect);
  }

  // Return answeredQuestions array
  getAnsweredQuestions() {
    return this.answeredQuestions;
  }

  // Serialize minimal state for localStorage
  serialize() {
    return {
      minLevel: this.minLevel,
      maxLevel: this.maxLevel,
      currentLevel: this.currentLevel,
      currentQuestionId: this.currentQuestionId,
      questionsByLevel: this.questionsByLevel,
      answeredQuestions: this.answeredQuestions
    };
  }

  // Load state (used in constructor if state present)
  _loadState(state) {
    if (!state) return;
    this.minLevel = state.minLevel ?? this.minLevel;
    this.maxLevel = state.maxLevel ?? this.maxLevel;
    this.currentLevel = state.currentLevel ?? this.currentLevel;
    this.currentQuestionId = state.currentQuestionId ?? this.currentQuestionId;
    this.questionsByLevel = state.questionsByLevel ?? this.questionsByLevel;
    this.answeredQuestions = state.answeredQuestions ?? this.answeredQuestions;
  }

  // Static helper to create instance from server list + saved state
  static from(examList = [], savedState = null) {
    return new AdaptiveExam(examList, savedState);
  }
}

