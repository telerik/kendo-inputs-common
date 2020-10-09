import {
    MaskingService
} from '../../src/maskedtextbox/masking.service';

describe('masking service', () => {
    const numberRule = /[\d]/;
    const numberOrSpaceRule = /[\d\s]/;

    describe('tokenizer', () => {
        let service: MaskingService;

        class TestMaskingService extends MaskingService {
            private tokenCreator: { [key: string]: Function } = {
                literal: rule => ({ value: rule }),
                mask: rule => ({ value: rule })
            };

            protected get maskTokenCreator(): { [key: string]: Function } {
                return this.tokenCreator;
            }

            protected get unmaskTokenCreator(): { [key: string]: Function } {
                return this.tokenCreator;
            }
        }

        beforeEach(() => {
            service = new TestMaskingService();
        });

        it('creates literal token', () => {
            service.update({
                mask: '0'
            });

            const maskTokens = service.maskTokens;
            const unmaskTokens = service.unmaskTokens;

            expect(maskTokens.length).toEqual(1);
            expect(maskTokens[0].value).toEqual('0');

            expect(unmaskTokens.length).toEqual(1);
            expect(unmaskTokens[0].value).toEqual('0');
        });

        it('creates rule token', () => {
            service.update({
                mask: '0',
                rules: {
                    '0': numberRule
                }
            });

            const maskTokens = service.maskTokens;
            const unmaskTokens = service.unmaskTokens;

            expect(maskTokens.length).toEqual(1);
            expect(maskTokens[0].value).toEqual(numberRule);

            expect(unmaskTokens.length).toEqual(1);
            expect(unmaskTokens[0].value).toEqual(numberRule);
        });

        it('creates literal token for escaped tokens', () => {
            service.update({
                mask: '\\0',
                rules: {
                    '0': numberRule
                }
            });

            const maskTokens = service.maskTokens;
            const unmaskTokens = service.unmaskTokens;

            expect(maskTokens.length).toEqual(1);
            expect(maskTokens[0].value).toEqual('0');

            expect(unmaskTokens.length).toEqual(1);
            expect(unmaskTokens[0].value).toEqual('0');
        });

        it('creates multiple tokens', () => {
            service.update({
                mask: '10\\02',
                rules: {
                    '0': numberRule
                }
            });

            const maskTokens = service.maskTokens;
            const unmaskTokens = service.unmaskTokens;

            expect(maskTokens.length).toEqual(4);
            expect(maskTokens[0].value).toEqual('1');
            expect(maskTokens[1].value).toEqual(numberRule);
            expect(maskTokens[2].value).toEqual('0');
            expect(maskTokens[3].value).toEqual('2');

            expect(unmaskTokens.length).toEqual(4);
            expect(unmaskTokens[0].value).toEqual('1');
            expect(unmaskTokens[1].value).toEqual(numberRule);
            expect(unmaskTokens[2].value).toEqual('0');
            expect(unmaskTokens[3].value).toEqual('2');
        });
    });

    describe('build masked value from raw', () => {
        let service: MaskingService;

        beforeEach(() => {
            service = new MaskingService();
        });

        it('produces value equal to the mask in size', () => {
            service.update({
                mask: '0',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('123');

            expect(value.length).toEqual(1);
        });

        it('outputs prompt for empty value', () => {
            service.update({
                mask: '0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const emptyValue = service.maskRaw('');
            const nullValue = service.maskRaw(null);
            const undefinedValue = service.maskRaw(undefined);

            expect(emptyValue).toEqual('_');
            expect(nullValue).toEqual('_');
            expect(undefinedValue).toEqual('_');
        });

        it('outputs the raw value when maks is empty', () => {
            service.update({
                mask: '',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('123');

            expect(value).toEqual('123');
        });

        it('replaces each match with a char from the raw value', () => {
            service.update({
                mask: '000',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('123');

            expect(value).toEqual('123');
        });

        it('replaces with prompt when pattern does not match (at the end of the mask)', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('12A');

            expect(value).toEqual('12_');
        });

        it('replaces with prompt when pattern does not match (before the mask end)', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('A12');

            expect(value).toEqual('12_');
        });

        it('value wiht literals only', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('AAA');

            expect(value).toEqual('___');
        });

        it('replaces the rest of the unmatched mask with prompt', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('1');

            expect(value).toEqual('1__');
        });

        it('literal token with larger value then mask', () => {
            service.update({
                mask: 'A000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('1234');

            expect(value).toEqual('A123');
        });

        it('literal token with shorter value than mask', () => {
            service.update({
                mask: 'A000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('12');

            expect(value).toEqual('A12_');
        });

        it('literal token with equal value and mask', () => {
            service.update({
                mask: 'A000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('123');

            expect(value).toEqual('A123');
        });

        it('literal token inside the mask', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('123');

            expect(value).toEqual('12A3');
        });

        it('literal token inside the mask with shorter value', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('12');

            expect(value).toEqual('12A_');
        });

        it('value with prompt placeholder at the begining', () => {
            service.update({
                mask: '000',
                prompt: '_',
                promptPlaceholder: ' ',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw(' 12');

            expect(value).toEqual('_12');
        });

        it('value with prompt placeholder at the end', () => {
            service.update({
                mask: '000',
                prompt: '_',
                promptPlaceholder: ' ',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('12 ');

            expect(value).toEqual('12_');
        });

        it('value with prompt placeholder in the middle', () => {
            service.update({
                mask: '000',
                prompt: '_',
                promptPlaceholder: ' ',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('1 2');

            expect(value).toEqual('1_2');
        });

        it('value with prompt placeholder filling the mask', () => {
            service.update({
                mask: '000',
                prompt: '_',
                promptPlaceholder: ' ',
                rules: {
                    '0': numberRule
                }
            });

            const value = service.maskRaw('1  2');

            expect(value).toEqual('1__');
        });

        it('value with prompt placeholder matching masking rule', () => {
            service.update({
                mask: '990',
                prompt: '_',
                promptPlaceholder: ' ',
                rules: {
                    '0': numberRule,
                    "9": numberOrSpaceRule
                }
            });

            const value = service.maskRaw('1 2');

            expect(value).toEqual('1 2');
        });

        it('value with prompt placeholder and literal', () => {
            service.update({
                mask: 'A90',
                prompt: '_',
                promptPlaceholder: ' ',
                rules: {
                    '0': numberRule,
                    "9": numberOrSpaceRule
                }
            });

            const value = service.maskRaw(' 1');

            expect(value).toEqual('A 1');
        });
    });

    describe('build masked value from input', () => {
        let service: MaskingService;

        beforeEach(() => {
            service = new MaskingService();
        });

        it('inserting single valid char in the begining', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '5123';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('523');
            expect(selection).toEqual(1);
        });

        it('inserting single invalid char in the begining', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = 'A123';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('123');
            expect(selection).toEqual(0);
        });

        it('inserting multiple valid chars in the begining, not exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '56123';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('563');
            expect(selection).toEqual(2);
        });

        it('inserting multiple valid chars in the begining, exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '56789123';
            const splitPoint = 5;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('567');
            expect(selection).toEqual(3);
        });

        it('inserting multiple invalid chars in the begining, not exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = 'AB123';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('123');
            expect(selection).toEqual(0);
        });

        it('inserting multiple invalid chars in the begining, exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = 'ABCD123';
            const splitPoint = 4;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('123');
            expect(selection).toEqual(0);
        });

        it('inserting valid and invalid chars in the begining, not exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '5A123';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('523');
            expect(selection).toEqual(1);
        });

        it('inserting invalid and valid chars in the begining, not exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = 'A5123';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('523');
            expect(selection).toEqual(1);
        });

        it('inserting valid and invalid chars in the begining, exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '5A6B123';
            const splitPoint = 4;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('563');
            expect(selection).toEqual(2);
        });

        it('inserting invalid chars followed with valid in the begining, exceeding mask length', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = 'ABCD5123';
            const splitPoint = 5;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('523');
            expect(selection).toEqual(1);
        });

        it('inserting valid chars before the unfilled mask', () => {
            service.update({
                mask: '0000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '___3';
            const newValue = '12___3';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12_3');
            expect(selection).toEqual(2);
        });

        it('inserting valid and invalid chars before the unfilled mask', () => {
            service.update({
                mask: '0000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '___3';
            const newValue = 'A2B___3';
            const splitPoint = 3;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('2__3');
            expect(selection).toEqual(1);
        });

        it('inserting valid chars at the end', () => {
            service.update({
                mask: '0000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '____';
            const newValue = '___3_';
            const splitPoint = 4;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('___3');
            expect(selection).toEqual(4);
        });

        it('inserting invalid chars at the end', () => {
            service.update({
                mask: '0000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123_';
            const newValue = '123A_';
            const splitPoint = 4;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('123_');
            expect(selection).toEqual(3);
        });

        it('inserting before literal', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12A_';
            const newValue = '123A_';
            const splitPoint = 3;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12A3');
            expect(selection).toEqual(4);
        });

        it('inserting before literal when mask is empty', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '__A_';
            const newValue = '123A_';
            const splitPoint = 3;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12A3');
            expect(selection).toEqual(4);
        });

        it('inserting before literal with multiple matching literals on the right position', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '__A_';
            const newValue = '12A3A_';
            const splitPoint = 4;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12A3');
            expect(selection).toEqual(4);
        });

        it('inserting with matching literals on position after the original position', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '__A_';
            const newValue = '123A4_';
            const splitPoint = 5;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12A3');
            expect(selection).toEqual(4);
        });

        it('inserting after literal', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12A_';
            const newValue = '12A34_';
            const splitPoint = 5;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12A3');
            expect(selection).toEqual(4);
        });

        it('inserting with prompt in the new value', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '__A_';
            const newValue = '1_3A4_';
            const splitPoint = 5;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('1_A3');
            expect(selection).toEqual(4);
        });

        it('overriding with invalid char', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '1A3';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('123');
            expect(selection).toEqual(1);
        });

        it('inserting prompt at the begining', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '123';
            const newValue = '_123';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('123');
            expect(selection).toEqual(0);
        });

        it('inserting prompt at the begining when prompt in the old value', () => {
            service.update({
                mask: '000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '_23';
            const newValue = '__23';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('_23');
            expect(selection).toEqual(1);
        });

        it('inserting invalid letter at the begining with literal in the mask', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = 'a12B34';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12B34');
            expect(selection).toEqual(0);
        });

        it('inserting multiple invalid literals', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '67CC912B34';
            const splitPoint = 5;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('67B94');
            expect(selection).toEqual(4);
        });

        it('removing after literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '12B4';
            const splitPoint = 3;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12B_4');
            expect(selection).toEqual(3);
        });

        it('removing before literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '1B34';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('1_B34');
            expect(selection).toEqual(1);
        });

        it('removing literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '1234';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12B34');
            expect(selection).toEqual(2);
        });

        it('removing multiple before literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = 'B34';
            const splitPoint = 0;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('__B34');
            expect(selection).toEqual(0);
        });

        it('removing multiple after literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '12B';
            const splitPoint = 3;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12B__');
            expect(selection).toEqual(3);
        });

        it('removing multiple chars with multiple literals', () => {
            service.update({
                mask: '00B0C0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B3C4';
            const newValue = '124';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12B_C4');
            expect(selection).toEqual(2);
        });

        it('removing multiple chars with multiple literals, without trailing chars', () => {
            service.update({
                mask: '00B0C0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B3C4';
            const newValue = '12';
            const splitPoint = 2;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('12B_C_');
            expect(selection).toEqual(2);
        });

        it('removing starting from literal', () => {
            service.update({
                mask: 'B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = 'B12';
            const newValue = '32';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('B32');
            expect(selection).toEqual(2);
        });

        it('removing starting including the literal', () => {
            service.update({
                mask: '0B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '1B23';
            const newValue = '43';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('4B_3');
            expect(selection).toEqual(1);
        });

        it('removing ending at the literal', () => {
            service.update({
                mask: '0B0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '1B2';
            const newValue = '42';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('4B2');
            expect(selection).toEqual(1);
        });

        it('removing prompt char', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '1_B34';
            const newValue = '1B34';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('1_B34');
            expect(selection).toEqual(1);
        });

        it('replacing all the content', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '6';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('6_B__');
            expect(selection).toEqual(1);
        });

        it('replacing the content with matching literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '67B8';
            const splitPoint = 4;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('67B8_');
            expect(selection).toEqual(4);
        });

        it('replacing with invalid chars, new text bigger than replaced', () => {
            service.update({
                mask: '00000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12345';
            const newValue = 'CC65';
            const splitPoint = 3;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('6___5');
            expect(selection).toEqual(3);
        });

        it('replacing multiple characters with literal in the begining', () => {
            service.update({
                mask: 'B000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = 'B123';
            const newValue = '6';
            const splitPoint = 1;
            const { value, selection } = service.maskInput(newValue, oldValue, splitPoint);

            expect(value).toEqual('B6__');
            expect(selection).toEqual(2);
        });

        it('pasting content without literal', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '67C8';
            const start = 0;
            const end = 5;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('67B8_');
            expect(selection).toEqual(5);
        });

        it('replacing the content with literal with range selection', () => {
            service.update({
                mask: '00B00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12B34';
            const newValue = '678';
            const start = 0;
            const end = 5;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('67B8_');
            expect(selection).toEqual(5);
        });

        it('replacing with invalid chars, new text equal to replaced and range selection', () => {
            service.update({
                mask: '00000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12345';
            const newValue = 'CC6';
            const start = 0;
            const end = 3;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('6__45');
            expect(selection).toEqual(3);
        });

        it('replacing single character should update only that character and range selection', () => {
            service.update({
                mask: '00000',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12345';
            const newValue = 'c6';
            const start = 1;
            const end = 2;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('16345');
            expect(selection).toEqual(2);
        });

        it('inserting with prompt in the new value and multiple selection', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '__A_';
            const newValue = '1_3';
            const start = 0;
            const end = 2;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('13A_');
            expect(selection).toEqual(2);
        });

        it('pasting less characters then selected', () => {
            service.update({
                mask: '00A0',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '12A3';
            const newValue = '9a';
            const start = 0;
            const end = 3;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('9_A3');
            expect(selection).toEqual(3);
        });

        it('pasting less characters across multiple literals', () => {
            service.update({
                mask: '(00)-00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '(12)-34';
            const newValue = '9a';
            const start = 3;
            const end = 6;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('(12)-94');
            expect(selection).toEqual(6);
        });

        it('pasting less characters across multiple literals with selection on boths sides of the literals', () => {
            service.update({
                mask: '(000)-00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '(123)-45';
            const newValue = '9a';
            const start = 3;
            const end = 7;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('(129)-_5');
            expect(selection).toEqual(7);
        });

        it('pasting content with mask applied equal to the mask length', () => {
            service.update({
                mask: '(000)-00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const oldValue = '(123)-45';
            const newValue = '(789)-12';
            const start = 0;
            const end = 8;
            const { value, selection } = service.maskInRange(newValue, oldValue, start, end);

            expect(value).toEqual('(789)-12');
            expect(selection).toEqual(8);
        });
    });

    describe('building raw value from masked', () => {
        let service: MaskingService;

        beforeEach(() => {
            service = new MaskingService();
        });

        it('returns raw value for rules', () => {
            service.update({
                mask: '(000)-00',
                prompt: '_',
                rules: {
                    '0': numberRule
                }
            });

            const maskedValue = '(123)-45';
            const rawValue = service.rawValue(maskedValue);

            expect(rawValue).toEqual('12345');
        });

        it('returns promptPlaceholder for prompt', () => {
            service.update({
                mask: '(000)-00',
                prompt: '_',
                promptPlaceholder: '!',
                rules: {
                    '0': numberRule
                }
            });

            const maskedValue = '(___)-45';
            const rawValue = service.rawValue(maskedValue);

            expect(rawValue).toEqual('!!!45');
        });

        it('returns literals', () => {
            service.update({
                includeLiterals: true,
                mask: '(000)-00',
                prompt: '_',
                promptPlaceholder: '!',
                rules: {
                    '0': numberRule
                }
            });

            const maskedValue = '(___)-45';
            const rawValue = service.rawValue(maskedValue);

            expect(rawValue).toEqual('(!!!)-45');
        });
    });
});