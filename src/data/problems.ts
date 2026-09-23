/**
 * Original practice problems, written for this site. Every answer was checked by brute force.
 * Text uses $…$ for inline TeX and $$…$$ for display math (see src/lib/tex.ts).
 */
export interface Problem {
  id: string;
  title: string;
  topic: 'Counting' | 'Number theory' | 'Algebra' | 'Geometry' | 'Probability';
  level: string;
  statement: string;
  hint: string;
  solution: string;
  answer: string;
}

export const problems: Problem[] = [
  {
    id: 'frog',
    title: 'The frog and the number line',
    topic: 'Counting',
    level: 'Warm-up',
    statement:
      'A frog starts at $0$ on the number line. Each jump moves it forward by either $1$ or $2$. In how many different ways can the frog land exactly on $10$?',
    hint: 'Don’t try to list the ways to reach $10$. Work out how many ways there are to reach $1$, $2$, $3$, … first. How is the count for $n$ related to the counts for $n-1$ and $n-2$?',
    solution:
      'Let $w_n$ be the number of ways to land on $n$. The frog’s last jump into $n$ was either a $1$ (from $n-1$) or a $2$ (from $n-2$), so $$w_n = w_{n-1} + w_{n-2}, \\qquad w_1 = 1,\; w_2 = 2.$$ The counts run $1, 2, 3, 5, 8, 13, 21, 34, 55, 89$: the Fibonacci numbers. So there are $89$ ways to land on $10$.',
    answer: '89',
  },
  {
    id: 'digit-sum',
    title: 'Digits that add up to five',
    topic: 'Counting',
    level: 'Warm-up',
    statement: 'How many positive integers less than $1000$ have digits that add up to $5$?',
    hint: 'Write every such number with exactly three digits, allowing leading zeros (so $23$ becomes $023$). Now you are splitting $5$ into three ordered pieces.',
    solution:
      'Write the number as $\\overline{abc}$ with leading zeros allowed. We need whole numbers $a + b + c = 5$. Picture five stars and two bars in a row, like $\\star\\star\\,|\\,\\star\\,|\\,\\star\\star$, where the bars split the stars into $a$, $b$ and $c$. Every arrangement of the $7$ symbols gives exactly one solution, so there are $$\\binom{7}{2} = 21$$ solutions. No digit can exceed $5$, and $000$ does not add to $5$, so all $21$ are valid. The answer is $21$.',
    answer: '21',
  },
  {
    id: 'last-digit',
    title: 'The last digit of a large power',
    topic: 'Number theory',
    level: 'Intermediate',
    statement: 'What is the last digit of $7^{2026}$?',
    hint: 'Look at the last digits of $7^1, 7^2, 7^3, 7^4, 7^5, \\dots$ Do you see a pattern?',
    solution:
      'Only the last digit matters when you multiply, so track it: $7, 9, 3, 1, 7, 9, 3, 1, \\dots$ The pattern repeats every $4$ powers because $7^4 = 2401$ ends in $1$. Since $2026 = 4 \\cdot 506 + 2$, $$7^{2026} = \\left(7^{4}\\right)^{506} \\cdot 7^{2} \\equiv 1 \\cdot 49 \\equiv 9 \\pmod{10}.$$ The last digit is $9$.',
    answer: '9',
  },
  {
    id: 'telescope',
    title: 'A sum that collapses',
    topic: 'Algebra',
    level: 'Intermediate',
    statement: 'Find the exact value of $$\\frac{1}{1\\cdot 2} + \\frac{1}{2\\cdot 3} + \\frac{1}{3\\cdot 4} + \\cdots + \\frac{1}{2025\\cdot 2026}.$$',
    hint: 'Check that $\\dfrac{1}{k(k+1)} = \\dfrac{1}{k} - \\dfrac{1}{k+1}$, then write out the first few terms.',
    solution:
      'Rewrite each term as a difference: $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$. Then $$\\left(1 - \\tfrac{1}{2}\\right) + \\left(\\tfrac{1}{2} - \\tfrac{1}{3}\\right) + \\cdots + \\left(\\tfrac{1}{2025} - \\tfrac{1}{2026}\\right).$$ Every middle term cancels with its neighbour (the sum *telescopes*), leaving $1 - \\frac{1}{2026} = \\frac{2025}{2026}$.',
    answer: '2025/2026',
  },
  {
    id: 'dice',
    title: 'An even product',
    topic: 'Probability',
    level: 'Warm-up',
    statement: 'Two fair six-sided dice are rolled. What is the probability that the product of the two numbers is even?',
    hint: 'When is a product *odd*? It is often easier to count the opposite event.',
    solution:
      'A product is odd exactly when both factors are odd. Each die is odd with probability $\\frac{1}{2}$, independently, so $P(\\text{odd}) = \\frac{1}{2}\\cdot\\frac{1}{2} = \\frac{1}{4}$. Therefore $$P(\\text{even}) = 1 - \\frac{1}{4} = \\frac{3}{4}.$$',
    answer: '3/4',
  },
  {
    id: 'pigeonhole',
    title: 'Five points in a square',
    topic: 'Geometry',
    level: 'Proof',
    statement:
      'Five points are placed anywhere inside or on the edge of a square of side length $1$. Prove that two of them are at distance at most $\\dfrac{\\sqrt{2}}{2}$ from each other.',
    hint: 'Cut the square into four equal pieces. Five points, four pieces…',
    solution:
      'Divide the unit square into four smaller squares of side $\\frac{1}{2}$. There are five points and only four small squares, so by the *pigeonhole principle* some small square contains at least two of the points (a point on a shared edge can be assigned to either square). Two points in a square of side $\\frac{1}{2}$ are at most a diagonal apart: $$\\sqrt{\\left(\\tfrac{1}{2}\\right)^2 + \\left(\\tfrac{1}{2}\\right)^2} = \\frac{\\sqrt{2}}{2}.$$ Those two points are the pair we wanted.',
    answer: 'Proof',
  },
];
