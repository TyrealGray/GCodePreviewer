import MenuList from './MenuList/MenuList';
import Viewer2D from './Viewer2D/Viewer2D';
import Viewer3D from './Viewer3D/Viewer3D';
import { useSelector } from 'react-redux';

function App() {

  const mode = useSelector((state: any) => state.previewMode.mode);

  return (
    <div className="flex flex-row basis-full">
      <div className="basis-1/3 text-white">
        <MenuList />
      </div>
      <div className="basis-2/3 text-white">
        <div className={`${mode === '2d' ? 'block' : 'hidden'} h-max-100`}>
          <Viewer2D />
        </div>
        <Viewer3D className={`${mode === '3d' ? 'block' : 'hidden'}`}/>
      </div>
    </div>
  );
}

export default App;
