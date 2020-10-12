import { greedy, sequence } from './parsing/combinators';
import {
    literal,
    mask as maskParser,
    rawLiteral,
    rawMask,
    token,
    unliteral,
    unmask
} from './parsing/parsers';

/**
 * @hidden
 */
export class MaskingService {
    public rules: { [key: string]: RegExp } = {};
    public prompt: string = '_';
    public mask: string = '';
    public promptPlaceholder: string = ' ';
    public includeLiterals: boolean = false;
    public maskTokens: any[] = [];
    public unmaskTokens: any[] = [];
    public rawTokens: any[] = [];
    public validationTokens: any[] = [];

    public update({ mask = '', prompt = '', promptPlaceholder = ' ', rules = {}, includeLiterals = false }: any): void {
        this.mask = mask;
        this.prompt = prompt;
        this.promptPlaceholder = promptPlaceholder;
        this.rules = rules;
        this.includeLiterals = includeLiterals;

        this.tokenize();
    }

    public validationValue(maskedValue: string = ''): string {
        let value = maskedValue;

        sequence(this.validationTokens)
            .run(maskedValue)
            .fold(unmasked => {
                value = unmasked.join('');
            });

        return value;
    }

    public rawValue(maskedValue: string = ''): string {
        let value = maskedValue;

        if (!this.rawTokens.length) {
            return value;
        }

        sequence(this.rawTokens)
            .run(maskedValue)
            .fold(unmasked => {
                value = unmasked.join('');
            });

        return value;
    }

    /**
     * @hidden
     */
    public maskRaw(rawValue: string = ''): string {
        let value = rawValue;

        if (!this.maskTokens.length) {
            return value;
        }

        sequence(this.maskTokens)
            .run(rawValue)
            .fold(masked => {
                value = masked.join('');
            });

        return value;
    }

    public maskInput(input: string, control: string, splitPoint: number): any {
        if (input.length < control.length) {
            return this.maskRemoved(input, control, splitPoint);
        }

        return this.maskInserted(input, control, splitPoint);

    }

    public maskInRange(pasted: string, oldValue: string, start: number, end: number): any {
        let value = '';
        let selection = end;

        const beforeChange = oldValue.split('').slice(0, start);
        const afterChange = oldValue.split('').slice(end);

        sequence(this.maskTokens.slice(start, end))
            .run(pasted)
            .fold(masked => {
                value = beforeChange
                    .concat(masked)
                    .concat(afterChange)
                    .join('');
            });

        return {
            selection,
            value
        };
    }

    private maskRemoved(input: string, control: string, splitPoint: number): any {
        let value = '';
        let selection = splitPoint;

        const unchanged = input.split('').slice(splitPoint);
        const changed = input.split('').slice(0, splitPoint).join('');
        const take = this.maskTokens.length - (input.length - splitPoint);

        sequence(this.maskTokens.slice(0, take))
            .run(changed, control)
            .fold(masked => {
                selection = this.adjustPosition(masked, selection);
                value = masked.concat(unchanged).join('');
            });

        return {
            selection,
            value
        };
    }

    private adjustPosition(input: string[], selection: number): number {
        const caretChar = input[selection];
        const isLiteral = this.maskTokens[selection].isLiteral(caretChar);

        if (!isLiteral && caretChar !== this.prompt) {
            return selection + 1;
        }
        return selection;
    }

    private maskInserted(input: string, control: string, splitPoint: number): any {
        let value = '';
        let selection = splitPoint;

        const changed = input.slice(0, splitPoint);

        sequence(this.unmaskTokens)
            .run(changed, control)
            .chain(unmasked => {
                selection = unmasked.join('').length;

                const unchanged = control.slice(selection);

                return sequence(this.maskTokens)
                    .run(unmasked.join('') + unchanged, control);
            })
            .fold(masked => {
                value = masked.join('');
            });

        return {
            selection,
            value
        };
    }

    protected get maskTokenCreator(): { [key: string]: Function } {
        const { prompt, promptPlaceholder } = this;

        return {
            literal: rule => literal(rule),
            mask: rule => maskParser({ prompt, promptPlaceholder })(rule)
        };
    }

    protected get unmaskTokenCreator(): { [key: string]: Function } {
        return {
            literal: rule => unliteral(rule),
            mask: rule => unmask(this.prompt)(rule)
        };
    }

    protected get rawTokenCreator(): { [key: string]: Function } {
        const { prompt, promptPlaceholder, includeLiterals } = this;

        return {
            literal: _ => rawLiteral(includeLiterals),
            mask: _ => rawMask({ prompt, promptPlaceholder })
        };
    }

    protected get validationTokenCreator(): { [key: string]: Function } {
        const { prompt } = this;

        return {
            literal: _ => rawLiteral(false),
            mask: _ => rawMask({ prompt, promptPlaceholder: '' })
        };
    }

    private tokenize(): void {
        greedy(token(this.rules, this.maskTokenCreator))
            .run(this.mask)
            .fold((tokens, _) => {
                this.maskTokens = tokens;
            });

        greedy(token(this.rules, this.unmaskTokenCreator))
            .run(this.mask)
            .fold((tokens, _) => {
                this.unmaskTokens = tokens;
            });

        greedy(token(this.rules, this.rawTokenCreator))
            .run(this.mask)
            .fold((tokens, _) => {
                this.rawTokens = tokens;
            });

        greedy(token(this.rules, this.validationTokenCreator))
            .run(this.mask)
            .fold((tokens, _) => {
                this.validationTokens = tokens;
            });
    }
}
