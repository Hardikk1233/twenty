// A small arithmetic evaluator for quiz `check` expressions, so every calculation answer is
// computed in code rather than by hand. Supports numbers, named figures, + - * / ^, parentheses,
// unary minus, and the functions min, max, abs, round(x, decimals). No eval, no globals.

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  min: (...a) => Math.min(...a),
  max: (...a) => Math.max(...a),
  abs: (x = NaN) => Math.abs(x),
  round: (x = NaN, d = 0) => roundTo(x, d),
};

export function roundTo(x: number, decimals: number): number {
  const f = 10 ** decimals;
  // The small nudge stops binary floating point from turning 54.75 into 54.7.
  return Math.round(x * f + Math.sign(x) * 1e-9) / f;
}

export function evaluate(source: string, vars: Record<string, number>): number {
  let i = 0;

  const fail = (msg: string): never => {
    throw new Error(`${msg} at position ${i} in "${source}"`);
  };
  const skip = () => {
    while (source[i] === ' ') i++;
  };
  const peek = () => {
    skip();
    return source[i];
  };

  function expression(): number {
    let value = term();
    for (;;) {
      const c = peek();
      if (c === '+') {
        i++;
        value += term();
      } else if (c === '-') {
        i++;
        value -= term();
      } else return value;
    }
  }

  function term(): number {
    let value = unary();
    for (;;) {
      const c = peek();
      if (c === '*') {
        i++;
        value *= unary();
      } else if (c === '/') {
        i++;
        const d = unary();
        if (d === 0) fail('Division by zero');
        value /= d;
      } else return value;
    }
  }

  function unary(): number {
    if (peek() === '-') {
      i++;
      return -unary();
    }
    return power();
  }

  function power(): number {
    const b = primary();
    if (peek() === '^') {
      i++;
      return b ** unary();
    }
    return b;
  }

  function primary(): number {
    const c = peek();
    if (c === '(') {
      i++;
      const v = expression();
      if (peek() !== ')') fail('Expected )');
      i++;
      return v;
    }
    const num = /^\d+(\.\d+)?/.exec(source.slice(i));
    if (num) {
      i += num[0].length;
      return Number(num[0]);
    }
    const id = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(i));
    if (id) {
      const name = id[0];
      i += name.length;
      if (peek() === '(') {
        const fn = FUNCTIONS[name];
        if (!fn) fail(`Unknown function ${name}`);
        i++;
        const args: number[] = [];
        if (peek() !== ')') {
          args.push(expression());
          while (peek() === ',') {
            i++;
            args.push(expression());
          }
        }
        if (peek() !== ')') fail('Expected )');
        i++;
        return fn!(...args);
      }
      const v = vars[name];
      if (v === undefined) fail(`Unknown figure "${name}"`);
      return v!;
    }
    return fail('Unexpected input');
  }

  const result = expression();
  if (peek() !== undefined) fail('Unexpected trailing input');
  if (!Number.isFinite(result)) fail('Result is not a finite number');
  return result;
}
