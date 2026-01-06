import { configureStore } from "@reduxjs/toolkit";
import uploadedFileSlice from "../features/UploadedFile/uploadedFileSlice";
import travelStepSlice from "../features/TravelStep/travelStepSlice";

export default configureStore({
    reducer: {
        gcodeFile: uploadedFileSlice,
        travelStep: travelStepSlice
    }
});