import { useDispatch, useSelector } from 'react-redux';
import { setFile } from '../features/UploadedFile/uploadedFileSlice';
import Button from '../components/Button';
import { useState, useEffect } from 'react';

function MenuList({ isPending }: { isPending: boolean }) {

    const [inputText, setInputText] = useState('Select GCode File');
    const isGcodeFileSelected = useSelector((state: any) => !!state.gcodeFile.file);
    const dispatch = useDispatch();

    useEffect(() => {
        if(isPending) {
            setInputText('Loading...');
        } else if(isGcodeFileSelected) {
            setInputText('GCode file loaded');
        } else {
            setInputText('Select GCode File');
        }
    }, [isPending, isGcodeFileSelected]);

    const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const path = e.target?.result as string;
                setInputText('GCode file loaded');
                dispatch(setFile(path));
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="h-full max-h-100">
            <div className="h-10 m-3">
                <Button 
                disabled={isPending}
                onClick={() => {
                    if(isPending) {
                        return;
                    }
                    const input = document.getElementById('files');
                    if(input){
                        (input as HTMLInputElement).value = '';
                    }
                    setInputText('Select GCode File'); 
                    dispatch(setFile(null));
                    }}>Reset</Button>
            </div>
            <div className="h-10 m-3">
                <Button onClick={() => document.getElementById('files')?.click()}>{inputText}</Button>
                <input id="files" className="hidden" type="file" accept=".gcode" onChange={handleFileChosen} />
            </div>
        </div>
    );
}

export default MenuList;
