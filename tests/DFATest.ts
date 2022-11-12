import { NFA, char, epsilon, concat, or, rep, repOneOrMore, repOneOrZero } from "../src/NFA";
import { DFA } from "../src/DFA";
import { assert } from "chai";

describe('Basic DFA test', () => {
    it('Test char DFA', () => {
        const aNFA = char('a');
        const aDFA = new DFA(aNFA);

        assert.equal(aDFA.testUsingDFA('a'), true);
        assert.equal(aDFA.testUsingDFA(''), false);
    });

    it('Test concat DFA', () => {
        const reNFA = concat(
            char('a'),
            char('b'),
            char('c')
        );
        const reDFA = new DFA(reNFA);

        assert.equal(reDFA.testUsingDFA('abc'), true);
        assert.equal(reDFA.testUsingDFA('ab'), false);
        assert.equal(reDFA.testUsingDFA('abd'), false);
        assert.equal(reDFA.testUsingDFA(''), false);
    });

    it('Test or DFA', () => {
        const reNFA = or(
            char('a'),
            char('b'),
            char('c')
        );
        const reDFA = new DFA(reNFA);

        assert.equal(reDFA.testUsingDFA('a'), true);
        assert.equal(reDFA.testUsingDFA('b'), true);
        assert.equal(reDFA.testUsingDFA('c'), true);
        assert.equal(reDFA.testUsingDFA('d'), false);
    });

    it('Test cleene closure DFA', () => {
        const reSimple = rep(char('x'));
        const reSimpleDFA = new DFA(reSimple);

        assert.equal(reSimpleDFA.testUsingDFA(''), true);
        assert.equal(reSimpleDFA.testUsingDFA('x'), true);
        assert.equal(reSimpleDFA.testUsingDFA('xx'), true);
        assert.equal(reSimpleDFA.testUsingDFA('xxxxx'), true);
        assert.equal(reSimpleDFA.testUsingDFA('y'), false);
    });

    it('Test combined re DFA', () => {
        const reConcatCombined = rep(
            concat(
                char('a'),
                char('b')
            )
        );
        const reConcatCombinedDFA = new DFA(reConcatCombined);

        assert.equal(reConcatCombinedDFA.testUsingDFA(''), true);
        assert.equal(reConcatCombinedDFA.testUsingDFA('ab'), true);
        assert.equal(reConcatCombinedDFA.testUsingDFA('abab'), true);
        assert.equal(reConcatCombinedDFA.testUsingDFA('aba'), false);
        assert.equal(reConcatCombinedDFA.testUsingDFA('abba'), false);


        const reComplex = or(
            concat(
                char('x'),
                rep(char('y'))
            ),
            char('z')
        );
        const reComplexDFA = new DFA(reComplex);

        assert.equal(reComplexDFA.testUsingDFA(''), false);
        assert.equal(reComplexDFA.testUsingDFA('z'), true);
        assert.equal(reComplexDFA.testUsingDFA('x'), true);
        assert.equal(reComplexDFA.testUsingDFA('xz'), false);
        assert.equal(reComplexDFA.testUsingDFA('xy'), true);
        assert.equal(reComplexDFA.testUsingDFA('xyz'), false);
        assert.equal(reComplexDFA.testUsingDFA('xyy'), true);
        assert.equal(reComplexDFA.testUsingDFA('xyyz'), false);
        assert.equal(reComplexDFA.testUsingDFA('xyyyyyz'), false);
        assert.equal(reComplexDFA.testUsingDFA('yyyyyz'), false);
        assert.equal(reComplexDFA.testUsingDFA('a'), false);
    });

    it('Test minimized char DFA transitions', () => {
        const aNFA = char('a');
        const aDFA = new DFA(aNFA);

        assert.equal(aDFA.testUsingMinimizedDFA('a'), true);
        assert.equal(aDFA.testUsingMinimizedDFA(''), false);
    });

    it('Test minimized concat DFA', () => {
        const reNFA = concat(
            char('a'),
            char('b'),
            char('c')
        );
        const reDFA = new DFA(reNFA);

        assert.equal(reDFA.testUsingMinimizedDFA('abc'), true);
        assert.equal(reDFA.testUsingMinimizedDFA('ab'), false);
        assert.equal(reDFA.testUsingMinimizedDFA('abd'), false);
        assert.equal(reDFA.testUsingMinimizedDFA(''), false);
    });

    it('Test minimized or DFA', () => {
        const reNFA = or(
            char('a'),
            char('b'),
            char('c')
        );
        const reDFA = new DFA(reNFA);

        assert.equal(reDFA.testUsingMinimizedDFA('a'), true);
        assert.equal(reDFA.testUsingMinimizedDFA('b'), true);
        assert.equal(reDFA.testUsingMinimizedDFA('c'), true);
        assert.equal(reDFA.testUsingMinimizedDFA('d'), false);
    });

    it('Test minimized cleene closure DFA', () => {
        const reSimple = rep(char('x'));
        const reSimpleDFA = new DFA(reSimple);

        assert.equal(reSimpleDFA.testUsingMinimizedDFA(''), true);
        assert.equal(reSimpleDFA.testUsingMinimizedDFA('x'), true);
        assert.equal(reSimpleDFA.testUsingMinimizedDFA('xx'), true);
        assert.equal(reSimpleDFA.testUsingMinimizedDFA('xxxxx'), true);
        assert.equal(reSimpleDFA.testUsingMinimizedDFA('y'), false);
    });

    it('Test minimized combined re DFA', () => {
        const reConcatCombined = rep(
            concat(
                char('a'),
                char('b')
            )
        );
        const reConcatCombinedDFA = new DFA(reConcatCombined);

        assert.equal(reConcatCombinedDFA.testUsingMinimizedDFA(''), true);
        assert.equal(reConcatCombinedDFA.testUsingMinimizedDFA('ab'), true);
        assert.equal(reConcatCombinedDFA.testUsingMinimizedDFA('abab'), true);
        assert.equal(reConcatCombinedDFA.testUsingMinimizedDFA('aba'), false);
        assert.equal(reConcatCombinedDFA.testUsingMinimizedDFA('abba'), false);


        const reComplex = or(
            concat(
                char('x'),
                rep(char('y'))
            ),
            char('z')
        );
        const reComplexDFA = new DFA(reComplex);

        assert.equal(reComplexDFA.testUsingMinimizedDFA(''), false);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('z'), true);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('x'), true);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('xz'), false);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('xy'), true);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('xyz'), false);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('xyy'), true);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('xyyz'), false);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('xyyyyyz'), false);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('yyyyyz'), false);
        assert.equal(reComplexDFA.testUsingMinimizedDFA('a'), false);
    });
});
