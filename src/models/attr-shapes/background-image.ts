import {__} from "@wordpress/i18n";
import namespace from "../../namespace";

export const sizeOptions = [
    {label: __('Cover', namespace), value: 'cover'},
    {label: __('Contain', namespace), value: 'contain'},
    {label: __('Auto', namespace), value: 'auto'}
];

export const positionOptions = [
    {label: __('Center', namespace), value: 'center'},
    {label: __('Top Left Corner', namespace), value: 'top left'},
    {label: __('Top Right Corner', namespace), value: 'top right'},
    {label: __('Bottom Left Corner', namespace), value: 'bottom left'},
    {label: __('Bottom Right Corner', namespace), value: 'bottom right'}
];

export const repeatOptions = [
    {label: __('Do Not Repeat', namespace), value: 'no-repeat'},
    {label: __('Repeat On Both Axes', namespace), value: 'repeat'},
    {label: __('Repeat X Axis', namespace), value: 'repeat-x'},
    {label: __('Repeat Y Axis', namespace), value: 'repeat-y'}
];
