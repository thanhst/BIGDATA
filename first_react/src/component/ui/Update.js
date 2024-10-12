import axios from "axios";
import { useEffect } from "react";
import { useGlobalVar } from "../../context/GlobalVarContext";
import bootstrapCss from "../../css/bootstrap.module.css";
function Update() {
    const { reload, setReload,setShowDialog, setShowToast, setTypeDialog, setFunctionDialog, setSpeed,
        setFormData, formData, selectedData, setSelectedData, setTypeToast, setContentToast,
        loading, primarykey, setPrimaryKey, setLoading, selected, message, message2, queryMongo, queryCassandra, setQueryCassandra, setQueryMongo, tableUse, columns, setColmuns, timeQuery, setTimeQuery } = useGlobalVar();
    useEffect(() => {
        setFormData({});
        if (selectedData) {
            setFormData(selectedData);
        }
    }, [selectedData, setFormData]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUpdate = (item) => {
        setSelectedData(item);
    }
    const handleUpdateSubmit =
        async (event) => {
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
                setTypeDialog("edit")
                setFunctionDialog(() => {
                    return () => action_update(form);
                });
            }
        }

    const action_update = async (form) => {
        setLoading(true)
        const formData = new FormData(form);
        const dataObject = Object.fromEntries(formData.entries());
        try {
            const response = await axios.put('http://localhost:3000/put', dataObject, {
                params: {
                    table: tableUse,
                    primarykey: primarykey,
                }
            });
            setSpeed(1)
            setTimeQuery({ "mongo": response.data.itemMongo.time_finding, "cassandra": response.data.itemCassandra.time_finding });
            // console.log('Dữ liệu đã được gửi thành công:', response.data);
            // alert("Thêm dữ liệu thành công!")
            setShowDialog(false);
            setShowToast(true);
            setTypeToast("infor");
            setContentToast("Sửa bản ghi thành công!");
            setReload(!reload);
            form.reset();
        } catch (error) {
            setSpeed(0)
            setTypeToast("delete");
            setShowToast(true);
            setContentToast("Sửa bản ghi thất bại!");
            setTimeout(()=>{
                setLoading(false)
            },5000)
            console.error('Có lỗi xảy ra:', error);
        }
    }

    const renderTableUpdate = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return <p>No data available</p>; // Kiểm tra nếu không có dữ liệu
        }
        const keys = Object.keys(data[0]); // Lấy các thuộc tính của đối tượng đầu tiên trong mảng

        return (
            <table border="1">
                <thead>
                    <tr>
                        {keys.map((key, index) => (
                            <th key={index}>{key}</th> // Hiển thị các keys làm tiêu đề cột
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <>
                            <tr key={index}>
                                {keys.map((key, subIndex) => (
                                    <td key={subIndex}>{item[key]}</td>
                                ))}
                                <td key={0} value={item[0]}>
                                    <i className={`${bootstrapCss.document} bi bi-file-earmark-diff-fill`}
                                        onClick={() => handleUpdate(item)}></i>
                                </td>
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
        );
    }


    return (
        <div style={{ display: "flex" }}>
            <div style={{ display: "flex",width:"40%" }}><div className={`${bootstrapCss.div_cassandra} ${bootstrapCss.border}`}>
                <div style={{ padding: '10px' }} >Data</div>
                {message2 !== "" && message2 != null ? renderTableUpdate(message2.table) : <div>Chưa có thông tin gì về dữ liệu</div>}
            </div></div>
            {tableUse !== "" && tableUse != null ? <form encType="multipart/form-data" method="PUT" onSubmit={handleUpdateSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '100px' }}>
                    {columns.map((value, index) => (
                        <div className={`${bootstrapCss.d_flex} ${bootstrapCss.justify_between}`} style={{ width: "100%", padding: '10px' }}>
                            <span>{index + 1}.{value.column_name} ({value.type}): </span>
                            <input key={index} readOnly={value.kind === "partition_key" || value.kind === "clustering_key" ? true : false} type="text"
                                name={value.column_name} value={formData !== undefined ? formData[value.column_name] ? formData[value.column_name] : "" : ""} style={{ padding: "5px" }} onChange={handleChange}></input>
                        </div>
                    ))}
                    <button type="submit"
                        style={{ width: "100px", padding: '5px', marginTop: '20px', borderRadius: "10px", fontSize: "18px", color: "white", backgroundColor: "#28a745" }}>Sửa</button>
                </div>
            </form> : null}
        </div>
    )
}
export default Update;