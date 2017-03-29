import SliderUtil from './SliderUtil';

class SliderModel {
    constructor(props, wrapper, track) {
        this.props = props;
        this.wrapper = wrapper;
        this.track = track;
        this.tickSizes = this.getTickSizes();
    }

    getTickSizes() {
        const { max, min, smallStep } = this.props;
        const trackWidth = this.trackWidth();

        return SliderUtil.calculateTickSizes(trackWidth, min, max, smallStep);
    }

    trackWidth() {
        if (this.props.fixedTickWidth) {
            return SliderUtil.calculateFixedTrackSize(this.props);
        }

        return SliderUtil.calculateTrackSize(
            this.elementSize(this.wrapper),
            this.elementOffset(this.track),
            this.props.buttons
        );
    }

    resizeTrack() {
        const orientation = this.props.vertical ? 'height' : 'width';
        const trackWidth = this.trackWidth();

        this.track.style[orientation] = `${trackWidth}px`;
    }

    resizeTicks(ticksContainer, ticks) {
        const dimension = this.props.vertical ? "height" : "width";

        Array.prototype.slice.call(ticks).map((tick, index) => tick.style[dimension] = `${this.tickSizes[index]}px`);

        if (this.props.vertical) {
            this.adjustPadding(ticksContainer);
        }
    }

    resizeWrapper() {
        const dimension = this.props.vertical ? "height" : "width";
        const wrapperSize = this.elementSize(this.wrapper);
        const trackWidth = SliderUtil.calculateTrackSize(wrapperSize, this.elementOffset(this.track));
        const fixedTrackWidth = SliderUtil.calculateFixedTrackSize(this.props);

        if (trackWidth > fixedTrackWidth) {
            this.wrapper.parentElement.style[dimension] = `${ wrapperSize - (trackWidth - fixedTrackWidth)}px`;
        } else {
            this.wrapper.parentElement.style[dimension] = `${ wrapperSize + (fixedTrackWidth - trackWidth)}px`;
        }
    }

    positionHandle(dragHandle) {
        const { max, min, reverse, vertical } = this.props;
        const position = vertical ? 'bottom' : 'left';
        const trackWidth = this.trackWidth();
        const value = SliderUtil.trimValue(max, min, this.props.value);

        this.handlePosition = SliderUtil.calculateHandlePosition({
            min,
            max,
            reverse,
            value,
            trackWidth,
            handleWidth: dragHandle.offsetWidth
        });

        dragHandle.style[position] = `${this.handlePosition}px`;
    }

    positionSelection(dragHandle, selection) {
        const { reverse, vertical } = this.props;
        const dimension = vertical ? 'height' : 'width';
        const handleWidth = Math.floor(dragHandle.offsetWidth / 2);
        let size = this.handlePosition + handleWidth;

        if (reverse) {
            size = this.trackWidth() - size;
        }

        selection.style[dimension] = `${size}px`;
    }

    adjustPadding(ticksContainer) {
        const totalTickSize = this.tickSizes.reduce((prev, curr) => prev + curr, 0);
        const trackWidth = this.trackWidth();
        const reminder = trackWidth - totalTickSize;

        if (reminder !== 0) {
            const padding = reminder + this.elementOffset(this.track);
            ticksContainer.style.paddingTop = `${padding}px`;
        }
    }

    elementOffset(element) {
        const { vertical } = this.props;
        const style = getComputedStyle(element);

        return parseInt(vertical ? style.bottom : style.left, 10);
    }

    elementSize(element) {
        const { vertical } = this.props;

        return vertical ? element.clientHeight : element.clientWidth;
    }
}

export default SliderModel;
