import { useTransition } from 'react';
import MenuList from './MenuList/MenuList';
import Viewer3D from './Viewer3D/Viewer3D';
import { useSelector } from 'react-redux';

function App() {

  const isGcodeFileSelected = useSelector((state: any) => !!state.gcodeFile.file);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-row basis-full">
      <div className="basis-1/3 text-white">
        <MenuList isPending={isPending} />
      </div>
      <div className="basis-2/3 text-white">
        {!isGcodeFileSelected && <h1>Choose a gcode file to preview.</h1>}
        <Viewer3D className={isGcodeFileSelected? 'block': 'hidden'} startTransition={startTransition}/>
      </div>
    </div>
  );
}

export default App;
