import { NFA, char, epsilon, concat, or, rep, repOneOrMore, repOneOrZero } from "../src/NFA";
import { assert } from "chai";

describe('Basic NFA test', () => {
    it('Test epsilon', () => {
        const e = epsilon();

        assert.equal(e.test(''), true);
        assert.equal(e.test('a'), false);
    });

    it('Test char NFA', () => {
        const a = char('a');

        assert.equal(a.test('a'), true);
        assert.equal(a.test(''), false);
        assert.equal(a.test('b'), false);
    });

    it('Test concat NFA', () => {
        const re = concat(
            char('a'),
            char('b'),
            char('c')
        );
    
        assert.equal(re.test('abc'), true);
        assert.equal(re.test('ab'), false);
        assert.equal(re.test('abd'), false);
        assert.equal(re.test(''), false);
    });

    it('Test or NFA', () => {
        const re = or(
            char('a'),
            char('b'),
            char('c')
        );

        assert.equal(re.test('a'), true);
        assert.equal(re.test('b'), true);
        assert.equal(re.test('c'), true);
        assert.equal(re.test('d'), false);
    });

    it('Test cleene closure', () => {
        const reSimple = rep(char('x'));

        assert.equal(reSimple.test(''), true);
        assert.equal(reSimple.test('x'), true);
        assert.equal(reSimple.test('xx'), true);
        assert.equal(reSimple.test('xxxxx'), true);
        assert.equal(reSimple.test('y'), false);
    });

    it('Test combined re', () => {
        const reConcatCombined = rep(
            concat(
                char('a'),
                char('b')
            )
        );

        assert.equal(reConcatCombined.test(''), true);
        assert.equal(reConcatCombined.test('ab'), true);
        assert.equal(reConcatCombined.test('abab'), true);
        assert.equal(reConcatCombined.test('aba'), false);
        assert.equal(reConcatCombined.test('abba'), false);


        const reComplex = or(
            concat(
                char('x'),
                rep(char('y'))
            ),
            char('z')
        );

        assert.equal(reComplex.test(''), false);
        assert.equal(reComplex.test('z'), true);
        assert.equal(reComplex.test('x'), true);
        assert.equal(reComplex.test('xz'), false);
        assert.equal(reComplex.test('xy'), true);
        assert.equal(reComplex.test('xyz'), false);
        assert.equal(reComplex.test('xyy'), true);
        assert.equal(reComplex.test('xyyz'), false);
        assert.equal(reComplex.test('xyyyyyz'), false);
        assert.equal(reComplex.test('yyyyyz'), false);
        assert.equal(reComplex.test('a'), false);
    });

    it('Test derived regexp', () => {
        const rePlus = repOneOrMore(char('x'));

        assert.equal(rePlus.test(''), false);
        assert.equal(rePlus.test('x'), true);
        assert.equal(rePlus.test('xx'), true);
        assert.equal(rePlus.test('y'), false);
        assert.equal(rePlus.test('xy'), false);

        const reQuestionMark = repOneOrZero(char('y'));

        assert.equal(reQuestionMark.test(''), true);
        assert.equal(reQuestionMark.test('y'), true);
        assert.equal(reQuestionMark.test('yy'), false);
        assert.equal(reQuestionMark.test('x'), false);
    });
});
