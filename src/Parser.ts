import { NFA, epsilon, char, concat, or, rep, repOneOrMore, repOneOrZero } from './NFA';

export default class Parser {
    data: string;
    index: number;

    constructor() {
        this.data = null as any;
        this.index = -1;
    }

    parse(input: string): NFA {
        this.data = input;
        this.index = 0;

        return this.regex();
    }

    regex(): NFA {
        return this.or(null as any);
    }

    or(delimiter: string): NFA {
        let left = this.and(delimiter);

        while (this.hasNextChar()) {
            if (this.peekChar() == '|') {
                left = or(left, this.and(delimiter));
            } else if (this.peekChar() == delimiter) {
                break;
            }
            else {
                throw new Error(`Wrong regular expression at index ${this.index}.`);
            }
        }

        return left;
    }

    and(delimiter: string): NFA {
        let left = this.factor();

        while (this.hasNextChar() && this.peekChar() != '|' && this.peekChar() != delimiter) {
            left = concat(left, this.factor());
        }

        return left;
    }

    factor(): NFA {
        let basic = epsilon();
        if (!this.hasNextChar()) {
            return basic;
        }

        if (this.peekChar() == '(') {
            this.matchNextChar('(');
            basic = this.or(')');
            this.matchNextChar(')');  
        } else {
            basic = char(this.nextChar());
        }

        if (this.peekChar() == '*' || this.peekChar() == '+' || this.peekChar() == '?') {
            let quantifier = this.nextChar();
            switch (quantifier) {
                case '*':
                    return rep(basic);
                case '+':
                    return repOneOrMore(basic);
                case '?':
                    return repOneOrZero(basic);
            }
        }

        return basic;
    }

    hasNextChar(): boolean {
        return this.index < this.data.length;
    }

    matchNextChar(ch: string) {
        if (this.peekChar() != ch) {
            throw new Error(`Wrong regular expression at index ${this.index}, should be ${ch}`);
        }
        this.nextChar();
    }

    peekChar(): string {
        if (this.index < this.data.length) {
            return this.data[this.index];
        }
        return null as any;
    }

    nextChar(): string {
        if (this.index < this.data.length) {
            const ret = this.data[this.index];
            this.index++;
            return ret;
        }
        return null as any;
    }
}