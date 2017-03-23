import SwitchController from '../src/SwitchController';
import SwitchModel from '../src/SwitchModel';

describe('SwitchController', () => {
    it('get the right model', () => {
        const model = new SwitchModel(1, true);
        expect(model.handle.transform).toBe('translateX(1px)');
        expect(model.handle.transition).toBe(true);
    });

    it('set internal on update state', () => {
        const controller = new SwitchController();
        controller.updateState({
            wrapperOffset: 10,
            handleOffset: 5,
            checked: false
        });

        expect(controller.wrapperOffset).toEqual(10);
        expect(controller.handleOffset).toEqual(5);
        expect(controller.checked).toBe(false);
    });

    it('calculate constrain', () => {
        const controller = new SwitchController();
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20,
            handleMargin: 4
        });
        expect(controller.constrain).toEqual(36);
    });

    it('updateModel returns a model', () => {
        const controller = new SwitchController();
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20
        });
        const model = controller.updateModel();
        expect(model instanceof SwitchModel).toBe(true);

    });

    it('limit value when higher than constrain', () => {
        const controller = new SwitchController();
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20,
            handleMargin: 4
        });
        expect(controller.limit(40)).toEqual(36);

    });

    it('limit value when less than 0', () => {
        const controller = new SwitchController();
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20
        });
        expect(controller.limit(-5)).toEqual(0);

    });

    it('limit value is in range', () => {
        const controller = new SwitchController();
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20
        });
        expect(controller.limit(20)).toEqual(20);

    });

    it('onPress sets lastPressX correctly', () => {
        const controller = new SwitchController();
        controller.onPress({
            pageX: 5
        });
        expect(controller.lastPressX).toEqual(5);
        expect(controller.originalPressX).toEqual(5);

    });

    it('onRelease calls change with correct value', () => {
        let called = false;
        let value = null;
        const updateView = () => { /*noop*/ };
        const change = (args) => {
            called = true;
            value = args;
        };
        const controller = new SwitchController(updateView, change);
        controller.onPress({ pageX: 5 });
        controller.onRelease({ pageX: 10 });
        expect(called).toBe(true);
        expect(value).toBe(true);
    });

    it('onDrag updates model correctly', () => {
        let model = null;
        const updateView = (args) => {
            model = args;
        };
        const change = () => { /*noop*/ };

        const controller = new SwitchController(updateView, change);
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20
        });
        controller.onPress({ pageX: 5 });
        controller.onRelease({ pageX: 10 });
        expect(model.handle.transition).toEqual(true);
        expect(model.handle.transform).toEqual('translateX(0px)');
    });

    it('should calculate transform', () => {
        let model = null;
        const updateView = (args) => { model = args; };

        const controller = new SwitchController(updateView);
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20,
            handleMargin: 0
        });

        expect(model.handle.transform).toBe('translateX(0px)');
    });

    it('should calculate transform when checked', () => {
        let model = null;
        const updateView = (args) => { model = args; };

        const controller = new SwitchController(updateView);
        controller.updateState({
            wrapperOffset: 60,
            handleOffset: 20,
            handleMargin: 10,
            checked: true
        });

        expect(model.handle.transform).toBe('translateX(30px)');
    });

    describe('in rtl mode', () => {
        it('should calculate transform', () => {
            let model = null;
            const updateView = (args) => { model = args; };

            const controller = new SwitchController(updateView);
            controller.updateState({
                wrapperOffset: 60,
                reverse: true
            });

            expect(model.handle.transform).toBe('translateX(30px)');
        });

        it('should calculate transform when checked', () => {
            let model = null;
            const updateView = (args) => { model = args; };

            const controller = new SwitchController(updateView);
            controller.updateState({
                wrapperOffset: 60,
                handleOffset: 20,
                handleMargin: 10,
                reverse: true,
                checked: true
            });

            expect(model.handle.transform).toBe('translateX(0px)');
        });

        it('should update model on drag', () => {
            let model = null;
            const updateView = (args) => {
                model = args;
            };
            const change = () => { /*noop*/ };

            const controller = new SwitchController(updateView, change);
            controller.updateState({
                wrapperOffset: 60,
                handleOffset: 20,
                handleMargin: 10,
                reverse: true
            });
            controller.onPress({ pageX: 5 });
            controller.onRelease({ pageX: 10 });
            expect(model.handle.transition).toEqual(true);
            expect(model.handle.transform).toEqual('translateX(30px)');
        });

    });
});

const transition = 'all 200ms ease-out';

describe('SwitchModel', () => {
    it('sets default value', () => {
        const model = new SwitchModel();
        expect(model.handle.transform).toBe('translateX(0px)');
    });

    it('adds animation', () => {
        const model = new SwitchModel(10, true);
        expect(model.handle.transition).toBe(true);
    });

    it('does not add animation', () => {
        const model = new SwitchModel(10, false);
        expect(model.handle.transition).not.toBe(transition);
    });

    it('sets correct transition value', () => {
        const model = new SwitchModel(10, true);
        expect(model.handle.transform).toBe('translateX(10px)');
    });
});
