import { useDispatch, useSelector } from 'react-redux';
import { set2d, set3d } from '../features/PreviewMode/previewModeSlice';
import Button from '../components/Button';

function MenuList() {

    const dispatch = useDispatch();
    const previewMode = useSelector((state: any) => state.previewMode.mode);

    return (
        <div className="h-full max-h-100">
            <div className="h-10 m-3">
                <Button onClick={() => dispatch(set2d())}>2D</Button>
            </div>
            <div className="h-10 m-3">
                <Button onClick={() => dispatch(set3d())}>3D</Button>
            </div>
        </div>
    );
}

export default MenuList;
