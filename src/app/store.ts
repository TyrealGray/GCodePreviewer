import { configureStore } from "@reduxjs/toolkit";
import uploadedFileSlice from "../features/UploadedFile/uploadedFileSlice";

export default configureStore({
    reducer: {
        gcodeFile: uploadedFileSlice
    }
});