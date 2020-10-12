import { Result, ResultType } from '../../src/maskedtextbox/parsing/result';
import { Stream } from '../../src/maskedtextbox/parsing/stream';
import { sequence } from '../../src/maskedtextbox/parsing/combinators';
import {
    Parser,
    literal,
    mask,
    unliteral,
    unmask,
    rawLiteral,
    rawMask
} from '../../src/maskedtextbox/parsing/parsers';

describe('parsing tests', () => {
    const numberRule = /[\d]/;
    const prompt = '_';
    const promptPlaceholder = '';
    const maskChar = mask({ prompt, promptPlaceholder });
    const unmaskChar = unmask(prompt);

    describe('Result class', () => {
        it('map', () => {
            const value = 1;
            const rest = new Stream([2, 3]);

            const result = new Result(value, rest);
            const mapped = result.map(v => v * 2);

            expect(mapped).toEqual(new Result(2, rest));
        });

        it('chain', () => {
            const value = 1;
            const rest = new Stream([2, 3]);

            const result = new Result(value, rest);
            const chained = result.chain((v, r) => ({ value: v, rest: r }));

            expect(chained).toEqual({ value, rest });
        });

        it('fold', () => {
            const value = 1;
            const rest = new Stream([2, 3]);

            const result = new Result(value, rest);
            const folded = result.fold((v, r) => ({ value: v, rest: r }));

            expect(folded).toEqual({ value, rest });
        });
    });

    describe('Parser class', () => {
        it('run executes the parser with a stream', () => {
            let calledStream: Stream;

            new Parser(stream => {
                calledStream = stream;
            })
                .run('abc', '12');

            expect(calledStream).toEqual(new Stream(['a', 'b', 'c'], ['1', '2']));
        });

        it('map called with parse function result', () => {
            const stream = new Stream(['a']);
            const parse = s => new Result(stream.next().char, s);
            const parserResult = new Parser(parse)
                .map(value => value + 'b')
                .run(stream);

            expect(parserResult).toEqual(new Result('ab', stream));
        });

        it('chaining parser', () => {
            const stream = new Stream(['a', 'b']);
            const parse = s => new Result(stream.next().char, s);
            const parserResult = new Parser(parse)
                .chain(_ => new Parser(parse))
                .run(stream);

            expect(parserResult).toEqual(new Result('b', stream));
        });
    });

    describe('mask parser', () => {
        it('produces prompt for empty input', () => {
            const stream = new Stream([]);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result(prompt, stream, ResultType.Mask));
        });

        it('match in the begining of the stream', () => {
            const stream = new Stream(['1']);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result('1', stream, ResultType.Mask));
        });

        it('consumes the stream until match is found', () => {
            const stream = new Stream(['a', 'b', '1']);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result('1', stream, ResultType.Mask));
            expect(stream.eof()).toEqual(true);
        });

        it('stops when match to promptPlaceholder', () => {
            const stream = new Stream(['a', promptPlaceholder, '1']);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result(prompt, stream, ResultType.Mask));
        });

        it('stops when input and control stream match to prompt', () => {
            const stream = new Stream([prompt], [prompt]);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result(prompt, stream, ResultType.Mask));
        });

        it('stops when input and control stream match to prompt when input stream is bigger', () => {
            const stream = new Stream(['a', prompt], [prompt]);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result(prompt, stream, ResultType.Mask));
        });

        it('stops when input and control stream match to prompt with multiple invalid chars', () => {
            const stream = new Stream(['a', 'a', 'c', prompt], [prompt]);
            const result = maskChar(numberRule).run(stream);

            expect(result).toEqual(new Result(prompt, stream, ResultType.Mask));
        });
    });

    describe('literal parser', () => {
        it('produces result with the token for empty input', () => {
            const stream = new Stream([]);
            const result = literal('A').run(stream);

            expect(result).toEqual(new Result('A', stream, ResultType.Literal));
        });

        it('produces result with the token for non-empty input', () => {
            const stream = new Stream(['A']);
            const result = literal('A').run(stream);

            expect(result).toEqual(new Result('A', stream, ResultType.Literal));
        });

        it('moves the control stream', () => {
            const stream = new Stream(['A'], ['A']);
            const result = literal('A').run(stream);

            expect(result).toEqual(new Result('A', stream, ResultType.Literal));
            expect(stream.peek().control).toEqual(undefined);
        });

        it('moves the input stream to the end', () => {
            const stream = new Stream(['A'], ['A']);
            const result = literal('A').run(stream);

            expect(result).toEqual(new Result('A', stream, ResultType.Literal));
            expect(stream.eof()).toEqual(true);
        });
    });

    describe('unmask parser', () => {
        it('returns the empty string when input stream empty', () => {
            const stream = new Stream([]);
            const result = unmaskChar(numberRule).run(stream);

            expect(result).toEqual(new Result('', stream));
        });

        it('returns the character when valid', () => {
            const stream = new Stream(['1']);
            const result = unmaskChar(numberRule).run(stream);

            expect(result).toEqual(new Result('1', stream));
        });

        it('returns the prompt when control stream had prompt', () => {
            const stream = new Stream([prompt], [prompt]);
            const result = unmaskChar(numberRule).run(stream);

            expect(result).toEqual(new Result(prompt, stream));
        });

        it('returns the empty string when control stream does not have prompt', () => {
            const stream = new Stream([prompt], ['1']);
            const result = unmaskChar(numberRule).run(stream);

            expect(result).toEqual(new Result('', stream));
        });

        it('consumes the stream until match is found', () => {
            const stream = new Stream(['a', 'b', '1']);
            const result = unmaskChar(numberRule).run(stream);

            expect(result).toEqual(new Result('1', stream));
            expect(stream.eof()).toEqual(true);
        });
    });

    describe('unliteral parser', () => {
        it('returns literal token when input stream empty', () => {
            const stream = new Stream([]);
            const result = unliteral('A').run(stream);

            expect(result).toEqual(new Result('', stream));
        });

        it('returns the literal token on match', () => {
            const stream = new Stream(['A']);
            const result = unliteral('A').run(stream);

            expect(result).toEqual(new Result('A', stream));
        });

        it('moves the stream on match', () => {
            const stream = new Stream(['A', '1']);
            unliteral('A').run(stream);

            expect(stream.peek().char).toEqual('1');
        });

        it('returns the literal token when match is not found', () => {
            const stream = new Stream(['2', '1']);
            const result = unliteral('A').run(stream);

            expect(result).toEqual(new Result('A', stream));
        });

        it('does not moves the stream when match is not found', () => {
            const stream = new Stream(['2', '1']);
            unliteral('A').run(stream);

            expect(stream.peek().char).toEqual('2');
        });
    });

    describe('sequence', () => {
        it('list of rules', () => {
            const stream = new Stream(['1', '2']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', '2'], stream));
        });

        it('list of rules with shorter input stream', () => {
            const stream = new Stream(['1', '2']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', '2', '_'], stream));
        });

        it('list of rules with larger input stream', () => {
            const stream = new Stream(['1', '2', '3', '4']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', '2'], stream));
        });

        it('prompt for input and control chars', () => {
            const stream = new Stream(['1', prompt, '3', '4'], [prompt, prompt, '5']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', prompt, '3'], stream));
        });

        it('invalid chars in the begining the input', () => {
            const stream = new Stream(['a', '1', '3', '4']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', '3', '4'], stream));
        });

        it('invalid chars in the begining the input larger then the parsers list', () => {
            const stream = new Stream(['a', 'b', 'c', '1', '3', '4']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', '3'], stream));
        });

        it('invalid chars in the the input', () => {
            const stream = new Stream(['1', 'a', 'b', 'c', '3', '4']);
            const result = sequence([
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['1', '3'], stream));
        });

        it('literal and multiple mask rules', () => {
            const stream = new Stream(['A', '1', '2']);
            const result = sequence([
                literal('A'),
                maskChar(numberRule),
                maskChar(numberRule),
                maskChar(numberRule)
            ]).run(stream);

            expect(result).toEqual(new Result(['A', '1', '2', '_'], stream));
            expect(stream.eof()).toEqual(true);
        });
    });

    describe('raw mask', () => {
        it('returns char', () => {
            const stream = new Stream(['1']);
            const result = rawMask({ prompt, promptPlaceholder }).run(stream);

            expect(result).toEqual(new Result('1', stream));
        });

        it('returns the placeholder', () => {
            const stream = new Stream([prompt]);
            const result = rawMask({ prompt, promptPlaceholder }).run(stream);

            expect(result).toEqual(new Result(promptPlaceholder, stream));
        });
    });

    describe('raw literal', () => {
        it('returns char', () => {
            const stream = new Stream(['A']);
            const result = rawLiteral(true).run(stream);

            expect(result).toEqual(new Result('A', stream));
        });

        it('returns empty string', () => {
            const stream = new Stream(['A']);
            const result = rawLiteral(false).run(stream);

            expect(result).toEqual(new Result('', stream));
        });
    });
});

