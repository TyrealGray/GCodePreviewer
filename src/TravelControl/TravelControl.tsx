import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setTravelSteps } from "../features";

function TravelControl({className}: {className?: string}) {

    const dispatch = useDispatch();
    const steps = useSelector((state: any) => state.travelStep.steps);
    const limit = useSelector((state: any) => state.travelStep.limit);

    return (
        <div className={`${className} absolute text-white right-0 top-0 bg-gray-800 p-2`}>
            <p>Travel Control</p>
            <div>
                <label htmlFor="travelStep">Step</label>
                <input type="range" id="travelStep" min={0} max={limit} value={steps} onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(setTravelSteps(e.target.value));
                }}/>
            </div>
        </div>
    );
}

export default TravelControl;