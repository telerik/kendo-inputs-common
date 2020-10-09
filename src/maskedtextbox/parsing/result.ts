import { Stream } from './stream';

/**
 * @hidden
 */
export enum ResultType {
    Literal,
    Mask,
    Undefined
}

/**
 * @hidden
 */
export class Result {
    constructor(private value: any, private rest: Stream, public type: ResultType = ResultType.Undefined) { }

    // map :: Functor f => f a ~> (a -> b) -> f b
    public map(fn: Function): Result {
        return new Result(fn(this.value), this.rest);
    }

    // chain :: Chain m => m a ~> (a -> m b) -> m b
    public chain(fn: Function): Result {
        return fn(this.value, this.rest);
    }

    public fold(s: Function, _?: Function/*we don't need it*/): Result {
        return s(this.value, this.rest);
    }

    public concat(r: Result): Result {
        return this.map((vs, _) => r.chain((v, __) => vs.concat([v])));
    }

    public toString(): string {
        return `Result({ value: '${this.value}', rest: ${this.rest} })`;
    }
}