import { useEffect } from "react";
import { useGlobalVar } from "../../context/GlobalVarContext";
import bootstrapCss from "../../css/bootstrap.module.css";
function Toast() {
    const { showToast, setShowToast, toastVisible, setToastVisible, typeToast, contentToast } = useGlobalVar();

    useEffect(() => {
        if (showToast) {
            const addToast = setTimeout(() => {
                setToastVisible(true);
            }, 100)
            const removeToast = setTimeout(() => {
                setToastVisible(false)
            }, 5100)
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 6100);
            return () => {
                clearTimeout(timer);
                clearTimeout(removeToast);
                clearTimeout(addToast);
            };
        }
    }, [showToast, setShowToast, setToastVisible]);

    return (
        <div className={`${bootstrapCss.Toast} ${toastVisible ? bootstrapCss.Toast_show : ""} ${showToast ? bootstrapCss.d_flex : bootstrapCss.d_none}
        ${typeToast === "infor" ? bootstrapCss.Toast_success : typeToast === "warning" ? bootstrapCss.Toast_warning : bootstrapCss.Toast_danger}`} aria-live="polite">
            {typeToast === "infor" ? <i className="bi bi-info-circle-fill"></i>
                : typeToast === "warning" ? <i className="bi bi-exclamation-triangle-fill"></i>
                    : <i className="bi bi-x-octagon-fill"></i>}
            <div>{contentToast}</div>
        </div>
    )
}
export default Toast;