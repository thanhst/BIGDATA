import axios from "axios";
import { useGlobalVar } from "../../context/GlobalVarContext";
import bootstrapCss from "../../css/bootstrap.module.css";

function Delete() {
    const {reload,setSpeed, setReload, setShowToast, setTypeToast, setContentToast,
        primarykey, loading, setLoading, selected, message, message2, queryMongo, queryCassandra,
        setFunctionDialog, setTypeDialog, setShowDialog,
        setQueryCassandra, setQueryMongo, tableUse, columns, timeQuery, setTimeQuery } = useGlobalVar();

    // const [deleteItem, setDeleteItem] = useState();

    const handleDeleteItem = (item) => {
        setShowDialog(true);
        setTypeDialog("delete")
        const data = { ...item };
        const key = {};
        primarykey.forEach(element => {
            if (data.hasOwnProperty(element)) {
                key[element] = data[element];
            }
        });

        setFunctionDialog(() => {
            return () => action_delete(key);
        });
    }

    const action_delete = async (item) => {
        try {
            const response = await axios.delete('http://localhost:3000/delete', {
                params: {
                    table: tableUse,
                    item:item
                }
            });
            setSpeed(1)
            setTimeQuery({ "mongo": response.data.itemMongo.time_finding, "cassandra": response.data.itemCassandra.time_finding });
            // console.log('Dữ liệu đã được gửi thành công:', response.data);
            // alert("Thêm dữ liệu thành công!")
            setShowDialog(false);
            setContentToast("Xóa thành công!");
            setTypeToast("infor");
            setShowToast(true);
            setLoading(true);
            setReload(!reload);
        }
        catch (error) {
            setSpeed(0)
            setTypeToast("delete");
            setShowToast(true);
            setContentToast("Xóa bản ghi thất bại!");
            setTimeout(()=>{
                setLoading(false)
            },5000)
            console.error('Có lỗi xảy ra:', error);
        }
    }


    const renderTableDelete = (data) => {
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
                                    <i className={`${bootstrapCss.trash} bi bi-trash3-fill`} onClick={() => handleDeleteItem(item)}></i>
                                </td>
                            </tr>
                        </>
                    ))}

                </tbody>
            </table>
        );
    }
    return (
        <div style={{ display: "flex", justifyContent: "start" }}>
            <div style={{ display: "flex",width:"80%" }}><div className={`${bootstrapCss.div_cassandra} ${bootstrapCss.border}`}>
                <div style={{ padding: '10px' }} >Data</div>
                {message2 !== "" && message2 != null ? renderTableDelete(message2.table) : <div>Chưa có thông tin gì về dữ liệu</div>}
            </div>
            </div>
            {/* <form encType="multipart/form-data" method="GET" style={{ width: "30%" }} onSubmit={handleSearch}>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '50px' }}>
                    <div className={`${bootstrapCss.d_flex} ${bootstrapCss.justify_between}`} style={{ padding: '10px' }}>
                        <span>Search</span>
                        <input type="text" name={"searchBox"} style={{ padding: "5px" }}></input>
                    </div>
                    <button type="submit" style={{ width: "100px", padding: '5px', marginTop: '20px', borderRadius: "10px", fontSize: "16px", color: "black", backgroundColor: "aqua" }} >Tìm kiếm</button>
                </div>
            </form> */}
        </div>
    )
}
export default Delete;