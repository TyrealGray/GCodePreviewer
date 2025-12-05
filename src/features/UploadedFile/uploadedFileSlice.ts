import { createSlice } from "@reduxjs/toolkit";

export const uploadedFileSlice = createSlice({
    name: 'uploadedFile',
    initialState: {
        file: null
    },
    reducers: {
        setFile: (state, action) => {
            state.file = action.payload;
        }
    }
});

export const { setFile } = uploadedFileSlice.actions;
export default uploadedFileSlice.reducer;