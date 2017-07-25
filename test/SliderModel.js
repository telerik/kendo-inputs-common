import SliderModel from '../src/SliderModel';

describe('SliderModel', () => {
    let props;
    let wrapper;
    let track;
    let model;
    let dragHandle;

    beforeEach(() => {
        props = {
            disabled: false,
            fixedTickWidth: undefined,
            max: 10,
            min: 0,
            reverse: false,
            smallStep: 1,
            value: 4,
            vertical: false
        };

        wrapper = {
            clientWidth: 200,
            clientHeight: 30
        };

        track = {
            clientWidth: 122,
            clientHeight: 4
        };

        dragHandle = { offsetWidth: 16, offsetHeight: 16, style: {} };

        SliderModel.prototype.elementOffset = (element) => 38;
        model = new SliderModel(props, wrapper, track);
    });

    it('should position handle at value', () => {
        model.positionHandle(dragHandle);
        expect(dragHandle.style.left).toBe('41px');
    });

    it('should position handle at min value', () => {
        props.value = 0;

        model.positionHandle(dragHandle);
        expect(dragHandle.style.left).toBe('-8px');
    });

    it('should position handle at max value', () => {
        props.value = 10;

        model.positionHandle(dragHandle);
        expect(dragHandle.style.left).toBe('116px');
    });

    it('should size selection to value', () => {
        const selection = { style: {} };

        // positionSelection expects positionHandle to be called first.
        // Ouch!
        model.positionHandle(dragHandle);
        model.positionSelection(dragHandle, selection);

        expect(selection.style.width).toBe('49px');
    });

    describe('with reversed direction', () => {
        beforeEach(() => {
            props.reverse = true;
        });

        it('should position handle at value', () => {
            model.positionHandle(dragHandle);
            expect(dragHandle.style.left).toBe('66px');
        });

        it('should position handle at min value', () => {
            props.value = 0;

            model.positionHandle(dragHandle);
            expect(dragHandle.style.left).toBe('116px');
        });

        it('should position handle at max value', () => {
            props.value = 10;

            model.positionHandle(dragHandle);
            expect(dragHandle.style.left).toBe('-8px');
        });

        it('should size selection to value', () => {
            const selection = { style: {} };

            // positionSelection expects positionHandle to be called first.
            // Ouch!
            model.positionHandle(dragHandle);
            model.positionSelection(dragHandle, selection);

            expect(selection.style.width).toBe('50px');
        });
    });
});
