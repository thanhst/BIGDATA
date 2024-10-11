import { useEffect, useState } from "react";
import { useGlobalVar } from "../context/GlobalVarContext";
import bootstrapCss from "../css/bootstrap.module.css";

function Loader() {
    const { loading, setLoading,speed } = useGlobalVar();
    const [percent, setPercent] = useState(0);
    useEffect(() => {
        // Only set up the interval if percent is less than 100
        if (percent < 100 && speed !== 0) {
            const interval = setInterval(() => {
                setPercent(prevPercent => prevPercent + 1);
            }, 50 * speed / (percent / 2)); // Update every 50ms for smooth animation
            // Clean up the interval on component unmount or when percent changes
            return () => clearInterval(interval);
        }
        if (percent === 100) {
            const interval = setInterval(() => {
                setLoading(false);
            },1000);
            return ()=>{
                clearInterval(interval);
            }
        }
    }, [percent,speed]);

    return (
        <div className={`${bootstrapCss.background_transparent_loading}`}>
            <div className={bootstrapCss.loader}>
            </div>
            <div>{percent}%</div>
        </div>
    )
}
export default Loader;