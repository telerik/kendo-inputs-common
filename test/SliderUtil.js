import SliderUtil from '../src/SliderUtil';

describe('SliderUtil', () => {
    it('calculate slider track width', () => {
        const width = SliderUtil.calculateTrackSize(130, 34);
        expect(width).toEqual(62);
    });

    it('calculate ticks count with default values', () => {
        const width = SliderUtil.calculateTicksCount();
        expect(width).toEqual(1);
    });

    it('calculate ticks count when small step is 0', () => {
        const fn = () => SliderUtil.calculateTicksCount(0, 0, 0);
        expect(fn).toThrowError(Error, "Invalid argument: smallStep must be a positive number");
    });

    it('calculate ticks count when small step is bigger than max', () => {
        const width = SliderUtil.calculateTicksCount(10, 1, 11);
        expect(width).toEqual(1);
    });

    it('calculate ticks count when small step is smaller than min and result is not an int', () => {
        const width = SliderUtil.calculateTicksCount(10, 5, 2);
        expect(width).toEqual(3);
    });

    it('calculate ticks count when min and max are negative numbers', () => {
        const width = SliderUtil.calculateTicksCount(-10, -20, 2);
        expect(width).toEqual(6);
    });

    it('middle ticks has average tick width as a value', () => {
        const widths = SliderUtil.calculateTickSizes(130, 0, 10, 2);

        expect(widths[1]).toEqual(26);
    });

    it('trim value when bigger than max', () => {
        const min = 0;
        const max = 10;
        const value = 11;
        expect(SliderUtil.trimValue(max, min, value)).toEqual(10);
    });

    it('trim value when smaller than min', () => {
        const min = 0;
        const max = 10;
        const value = -3;
        expect(SliderUtil.trimValue(max, min, value)).toEqual(0);
    });

    it('do not trim value when in range', () => {
        const min = 0;
        const max = 10;
        const value = 7;
        expect(SliderUtil.trimValue(max, min, value)).toEqual(7);
    });

    it('decrease value when int', () => {
        const value = SliderUtil.decreaseValueToStep({ value: 3, smallStep: 1, max: 10, min: 0 });
        expect(value).toEqual(2);
    });

    it('decrease value when float', () => {
        const value = SliderUtil.decreaseValueToStep({ value: 3, smallStep: 2, max: 10, min: 0 });
        expect(value).toEqual(2);
    });

    it('increase value when float', () => {
        const value = SliderUtil.increaseValueToStep({ value: 3, smallStep: 2, max: 10, min: 0 });
        expect(value).toEqual(4);
    });

    it('increase value should respect max', () => {
        const value = SliderUtil.increaseValueToStep({ value: 3, smallStep: 2, max: 4, min: 0 });
        expect(value).toEqual(4);
    });

    it('increase value when int', () => {
        const value = SliderUtil.increaseValueToStep({ value: 2, smallStep: 2, max: 10, min: 0 });
        expect(value).toEqual(4);
    });

    it('decrease value should respect min', () => {
        const value = SliderUtil.decreaseValueToStep({ value: 3, smallStep: 2, max: 10, min: 2 });
        expect(value).toEqual(2);
    });

    it('snap value to tick', () => {
        const value = SliderUtil.snapValue({ value: 2, smallStep: 1, max: 10, min: 0 });
        expect(value).toEqual(2);
    });

    it('snap value to the left', () => {
        const value = SliderUtil.snapValue({ value: 5, smallStep: 4, max: 10, min: 0 });
        expect(value).toEqual(4);
    });

    it('snap value to the right', () => {
        const value = SliderUtil.snapValue({ value: 7, smallStep: 4, max: 10, min: 0 });
        expect(value).toEqual(8);
    });

    it('snap value when step and value are floats', () => {
        const value = SliderUtil.snapValue({ value: 7.5, smallStep: 4.5, max: 10, min: 0 });
        expect(value).toEqual(9);
    });

    it('snap value to tick when no reminder', () => {
        const value = SliderUtil.snapValue({ value: 8, smallStep: 4, max: 10, min: 0 });
        expect(value).toEqual(8);
    });

    it('distribute pixels when unequal reminder is left', () => {
        const ticks = SliderUtil.calculateTickSizes(130, 0, 14, 2);
        expect(ticks[0]).toEqual(9);
        expect(ticks[1]).toEqual(19);
        expect(ticks[2]).toEqual(18);
        expect(ticks[5]).toEqual(18);
    });

    it('distribute pixels when no reminder is left', () => {
        const ticks = SliderUtil.calculateTickSizes(130, 0, 10, 2);
        expect(ticks[0]).toEqual(13);
        expect(ticks[1]).toEqual(26);
    });

    it('distribute pixels when last tick is floating', () => {
        const ticks = SliderUtil.calculateTickSizes(130, 0, 7, 3);
        expect(ticks[0]).toEqual(28);
        expect(ticks[1]).toEqual(56);
        expect(ticks[2]).toEqual(27);
    });

    it('distribute pixels when min max and step are floating numbers', () => {
        const ticks = SliderUtil.calculateTickSizes(130, 0, 5.2, 1.2);
        expect(ticks[0]).toEqual(15);
        expect(ticks[1]).toEqual(30);
    });

    it('distribute pixels when min max and step are floating numbers', () => {
        const ticks = SliderUtil.calculateTickSizes(130, 0, 5.2, 1.2);
        expect(ticks[0]).toEqual(15);
        expect(ticks[1]).toEqual(30);
    });

    describe('calculateValueFromTrack', () => {
        let length;
        let props;

        beforeEach(() => {
            length = 130;
            props = { max: 10, min: 0, smallStep: 2 };
        });

        it('should calulate min possible value', () => {
            const wrapperOffset = 0;
            const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
            expect(value).toEqual(0);
        });

        it('should calulate max possible value', () => {
            const wrapperOffset = 120;
            const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
            expect(value).toEqual(10);
        });

        it('should calculate step value', () => {
            const wrapperOffset = 100;
            const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
            expect(value).toEqual(8);
        });

        it('should snap the value to the closest tick on the left', () => {
            props = { max: 3, min: 0, smallStep: 1 };
            const wrapperOffset = 22;
            const length = 230;
            const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
            expect(value).toEqual(0);
        });

        it('should snap the value to the closest tick on the right', () => {
            props = { max: 3, min: 0, smallStep: 1 };
            const wrapperOffset = 56;
            const length = 230;
            const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
            expect(value).toEqual(1);
        });

        describe('with reversed direction', () => {
            beforeEach(() => {
                props.reverse = true;
            });

            it('should calulate min possible value', () => {
                const wrapperOffset = 120;
                const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
                expect(value).toEqual(0);
            });

            it('should calulate max possible value', () => {
                const wrapperOffset = 0;
                const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
                expect(value).toEqual(10);
            });

            it('should calculate step value', () => {
                const wrapperOffset = 100;
                const value = SliderUtil.valueFromTrack(props, wrapperOffset, length);
                expect(value).toEqual(2);
            });
        });
    });

    describe('calculateValueFromTick', () => {
        const calculateValueFromTick = SliderUtil.calculateValueFromTick;
        let props;

        beforeEach(() => {
            props = {
                min: 0,
                max: 10,
                smallStep: 1,
                reverse: false,
                vertical: false
            };
        });

        it('calculates value', () => {
            expect(calculateValueFromTick(4, props)).toBe(4);
        });

        it('calculates min value', () => {
            expect(calculateValueFromTick(0, props)).toBe(0);
        });

        it('calculates max value', () => {
            expect(calculateValueFromTick(10, props)).toBe(10);
        });

        describe('with reversed direction', () => {
            beforeEach(() => {
                props.reverse = true;
            });

            it('calculates value', () => {
                expect(calculateValueFromTick(4, props)).toBe(6);
            });

            it('calculates min value', () => {
                expect(calculateValueFromTick(0, props)).toBe(10);
            });

            it('calculates max value', () => {
                expect(calculateValueFromTick(10, props)).toBe(0);
            });

        });
    });
});
