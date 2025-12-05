import { createSlice } from '@reduxjs/toolkit';

export enum PreviewModeType {
    '2d',
    '3d'
}

export const previewModeSlice = createSlice({
    name: 'previewMode',
    initialState: {
        mode: PreviewModeType[0]
    },
    reducers: {
        set2d: (state) => {
            state.mode = PreviewModeType[0];
        },
        set3d: (state) => {
            state.mode = PreviewModeType[1];
        }
    }
});

export const { set2d, set3d } = previewModeSlice.actions;
export default previewModeSlice.reducer;
