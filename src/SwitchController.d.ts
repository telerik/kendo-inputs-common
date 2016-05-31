declare class SwitchController {
    constructor(updateView: any, onChange: any);
    updateState(props: any);
    chnage(checked: boolean);
    updateModel(position: number, animate: boolean);
    constrain(): number;
    limit(value: number): number;
    onPress(pageX: any): void;
    onRelease(pageX: any) : void;
    onDrag(pageX: any) : void;
}
export default SwitchController;
