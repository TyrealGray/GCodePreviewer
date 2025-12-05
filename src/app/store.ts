import { configureStore } from "@reduxjs/toolkit";
import previewModeReducer from "../features/PreviewMode/previewModeSlice";

export default configureStore({
    reducer: {
        previewMode: previewModeReducer
    }
});