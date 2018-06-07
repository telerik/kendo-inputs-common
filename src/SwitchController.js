import Model from './SwitchModel';

const DEFAULT_THRESHOLD = 5;

const noop = () => { /*noop*/ };

class SwitchController {
    constructor(updateView = noop, onChange = noop) {
        this.handlePosition = 0;
        this.wrapperOffset = 0;
        this.handleOffset = 0;
        this.handleMargin = 4;

        this.updateView = updateView;
        this.onChange = onChange;

        this.change = (checked) => {
            this.checked = checked;

            this.updateView(this.updateModel(checked ? this.constrain : 0));

            this.onChange(checked);
        };

        this.limit = (value) => {
            if (value > this.constrain) {
                return this.constrain;
            }

            if (value < 0) {
                return 0;
            }

            return value;
        };

        this.addAnimation = (model) => {
            if (model.transition === true) {
                model.transition = 'all 200ms ease-out';
            } else {
                model.transition = 'none';
            }
            return model;
        };

        this.onPress = ({ pageX }) => {
            this.lastPressX = this.originalPressX = pageX;
        };

        this.onRelease = ({ pageX }) => {
            const delta = Math.abs(this.originalPressX - pageX);
            const snapPoint = this.constrain / 2;
            const checked = delta < DEFAULT_THRESHOLD ? !this.checked : this.handlePosition > snapPoint;

            this.change(checked);
        };

        this.onDrag = ({ pageX }) => {
            const { left, right } = this.coords;
            const overElement = pageX > left && pageX < right;

            if (overElement) {
                const delta = this.reverse ? this.lastPressX - pageX : pageX - this.lastPressX;
                const position = this.limit(this.handlePosition + delta);

                this.lastPressX = pageX;
                this.handlePosition = position;
                this.updateView(this.updateModel(this.handlePosition));
            }

            if (pageX > right) {
                this.updateView(this.updateModel(this.reverse ? 0 : this.constrain));
            }

            if (pageX < left) {
                this.updateView(this.updateModel(this.reverse ? this.constrain : 0));
            }
        };
    }

    get constrain() {
        return this.wrapperOffset - this.handleOffset - this.handleMargin;
    }

    updateState({ wrapperOffset, handleOffset, checked, animate = true, coords, handleMargin, reverse }) {
        this.wrapperOffset = wrapperOffset;
        this.handleOffset = handleOffset;
        this.coords = coords;
        this.handleMargin = handleMargin;

        this.checked = checked;
        this.reverse = reverse;

        this.updateView(this.updateModel(checked ? this.constrain : 0, animate));
    }

    updateModel(position, animate = true) {
        let pos = this.reverse ? this.wrapperOffset / 2 - position : position;
        return new Model(pos, animate);
    }
}

export default SwitchController;
