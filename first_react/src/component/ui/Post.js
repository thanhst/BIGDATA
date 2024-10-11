import axios from "axios";
import { useGlobalVar } from "../../context/GlobalVarContext.js";
import bootstrapCss from "../../css/bootstrap.module.css";

function Post({ contentAdd, children, speed }) {

    const { reload, setReload, setFunctionDialog, setTypeDialog, setShowDialog, setShowToast,
        setTypeToast, setContentToast, setSpeed, loading, setLoading, tableUse, columns, timeQuery, setTimeQuery } = useGlobalVar();
    const handlePostSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const dataObject = Object.fromEntries(formData.entries());
        const isEmpty = Object.values(dataObject).some(value => value.trim() === '');


        if (isEmpty) {
            setShowToast(true);
            setTypeToast("error");
            setContentToast("Vui lòng nhập đầy đủ các trường !");
            return; // Ngừng hàm nếu có trường rỗng
        }
        else {
            setShowDialog(true);
            setTypeDialog("insert");
            setFunctionDialog(() => {
                return () => action_submit(form);
            });
        }
    }

    const action_submit = async (form) => {
        setLoading(true)
        const formData = new FormData(form);
        const dataObject = Object.fromEntries(formData.entries());
        try {
            const response = await axios.post('http://localhost:3000/post', dataObject, {
                params: {
                    table: tableUse
                }
            });
            setSpeed(1)
            setTimeQuery({ "mongo": response.data.itemMongo.time_finding, "cassandra": response.data.itemCassandra.time_finding });
            // console.log('Dữ liệu đã được gửi thành công:', response.data);
            // alert("Thêm dữ liệu thành công!")
            setShowDialog(false);
            setShowToast(true);
            setTypeToast("infor");
            setContentToast("Thêm bản ghi thành công!");
            setReload(!reload);
            if (contentAdd.current) {
                contentAdd.current.innerHTML = JSON.stringify(dataObject, null, 2)
            }
            form.reset();
        } catch (error) {
            setSpeed(0)
            setTypeToast("delete");
            setShowToast(true);
            setContentToast("Thêm bản ghi thất bại!");
            setTimeout(() => {
                setLoading(false)
            }, 5000)
            console.error('Có lỗi xảy ra:', error);
        }
    }

    return (
        <>
            {tableUse !== "" && tableUse != null ? <form encType="multipart/form-data" onSubmit={handlePostSubmit} method="POST">
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '300px' }}>
                    {columns.map((value, index) => (
                        <div className={`${bootstrapCss.d_flex} ${bootstrapCss.justify_between}`} style={{ width: "40%", padding: '10px' }}>
                            <span>{index + 1}.{value.column_name} ({value.type}): </span>
                            <input key={index} type="text" name={value.column_name} style={{ padding: "5px" }}></input>
                        </div>
                    ))}
                    <button type="submit" style={{ width: "100px", padding: '5px', marginTop: '20px', borderRadius: "10px", fontSize: "18px", color: "white", backgroundColor: "#28a745" }}>Thêm</button>
                </div>
            </form> : null}
        </>
    );
};
export default Post;