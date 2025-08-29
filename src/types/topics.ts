type OxQuiz = {
  quiz_id: string;
  type: 'multiple';
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  result: string;
};

type MultipleQuiz = {
  quiz_id: string;
  type: 'ox';
  question: string;
  options: ['O', 'X'];
  correct_answer: number;
  explanation: string;
  result: string;
};

export type Question = MultipleQuiz | OxQuiz;

export type Topic = {
  topic_id: string;
  category: string;
  title: string;
  description: string;
  questions: Question[];
};
