/**
 * @hidden
 */
export class Stream {
    private inputCursor: number = 0;
    private controlCursor: number = 0;

    constructor(private input: any[] = [], private control: any[] = []) { }

    public eof(): boolean {
        return this.inputCursor >= this.input.length;
    }

    // Get the first value from the input.
    public next(): { char: string, control: string } {
        return {
            char: this.input[this.inputCursor++],
            control: this.control[this.controlCursor++]
        };
    }

    public peek(): { char: string, control: string } {
        return {
            char: this.input[this.inputCursor],
            control: this.control[this.controlCursor]
        };
    }

    public eat_input(): void {
        this.inputCursor++;
    }

    public eat_control(): void {
        this.controlCursor++;
    }

    public eat(): void {
        this.inputCursor++;
        this.controlCursor++;
    }
}