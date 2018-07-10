declare class SwitchController {
    constructor(updateView: any, onChange: any);
    updateState(props: any): void;
    change(checked: boolean): void;
    updateModel(position: number, animate?: boolean): any;
    constrain(): number;
    limit(value: number): number;
    onPress(pageX: any): void;
    onRelease(pageX: any): void;
    onDrag(pageX: any): void;
    addAnimation(model: Object): Object;
}
export default SwitchController;
