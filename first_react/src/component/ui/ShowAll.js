import { useEffect } from "react";
import { useGlobalVar } from "../../context/GlobalVarContext";
import bootstrapCss from "../../css/bootstrap.module.css";

function ShowAll() {
    const { loading, setLoading, selected, message, message2, queryMongo, queryCassandra, setQueryCassandra, setQueryMongo, tableUse, columns, timeQuery, setTimeQuery } = useGlobalVar();
    useEffect(() => {
        if (message !== "") {
            renderTable(message.table);
            // console.log(message.table.length);
        }
    }, [message])
    useEffect(() => {
        if (message2 !== "") {
            renderDocument(message2.table);
        }
    }, [message2]);

    const renderTable = (data) => {
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
                        <tr key={index}>
                            {keys.map((key, subIndex) => (
                                <td key={subIndex}>{item[key]}</td> // Hiển thị giá trị trong từng cột
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderDocument = (message) => {
        if (message.length === 0) {
            return <p>No data available</p>; // Kiểm tra nếu không có dữ liệu
        }
        return (
            <table border="1">
                <tbody>
                    {message.map((item, index) => (
                        <tr>
                            <td>
                                {index + 1}
                            </td>
                            <td style={{ textAlign: 'left', padding: '30px' }}><pre>{JSON.stringify(item, null, 2)}</pre></td>
                        </tr>
                    ))}
                </tbody>
            </table>)
    }
    return (
        <div style={{ display: 'flex', justifyContent: "space-around", marginTop: '50px', width: '75%' }}>
            <div className={`${bootstrapCss.div_mongoDB} ${bootstrapCss.border}`}>
                <div style={{ padding: '10px' }}>MongoDB</div>
                {message !== "" && message != null ? renderDocument(message.table) : <div>Chưa có thông tin gì về dữ liệu</div>}
            </div>
            <div className={`${bootstrapCss.div_cassandra} ${bootstrapCss.border}`}>
                <div style={{ padding: '10px' }} >Cassandra</div>
                {message2 !== "" && message2 != null ? renderTable(message2.table) : <div>Chưa có thông tin gì về dữ liệu</div>}
            </div>
        </div>

    )
}
export default ShowAll;