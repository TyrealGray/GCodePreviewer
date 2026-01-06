import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    steps: 0,
    limit: 0
};

const travelStepSlice = createSlice({
    name: 'travelStep',
    initialState,
    reducers: {
        setTravelSteps: (state, action) => {
            state.steps = action.payload;
        },
        setTravelLimit: (state, action) => {
            state.limit = action.payload;
        }
    }
});

export const { setTravelSteps, setTravelLimit } = travelStepSlice.actions;
export default travelStepSlice.reducer;