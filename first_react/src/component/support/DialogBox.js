import { useGlobalVar } from "../../context/GlobalVarContext";
import bootstrapCss from "../../css/bootstrap.module.css";
function DialogBox() {
    let action;
    let icon;
    const { setShowDialog, typeD, funcD } = useGlobalVar();
    if (typeD === "edit") {
        action = "sửa"
        icon = "(0.0)"
    }
    else if (typeD === "delete") {
        action = "xóa"
        icon = "(T.T)"
    }
    else if (typeD === "insert") {
        action = "thêm"
        icon = "(^.^)"

    }
    else {
        action = typeD
    }

    const handleCloseDialog = () => {
        setShowDialog(false);
    }

    return (
        <div className={`${bootstrapCss.background_transparent_diaglog}`}>
            <div className={bootstrapCss.DialogBox}>
                <p style={{ fontSize:"26px",fontFamily:"cursive" }}>Bạn có muốn {action} bản ghi này không ? {icon}</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                    <button style={{ padding: "10px",width:"100px", borderRadius: "10px", border: '1px solid black', backgroundColor: "rgb(40, 167, 69)", color: 'white', cursor: "pointer", boxShadow: "1px 1px 1px black" }} onClick={funcD}>Có</button>
                    <button style={{ padding: "10px",width:"100px", borderRadius: "10px", border: '1px solid black', cursor: "pointer", boxShadow: "1px 1px 1px" }} onClick={handleCloseDialog}>Không</button>
                </div>
            </div>
        </div>
    )
}
export default DialogBox;