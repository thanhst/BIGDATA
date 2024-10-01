import axios from "axios";
import { useEffect, useRef } from "react";
import { useGlobalVar } from "../context/GlobalVarContext";
import bootstrapCss from '../css/bootstrap.module.css';

function Inforbody() {

    const { selected, message, message2, queryMongo, queryCassandra, setQueryCassandra, setQueryMongo, tableUse, columns, timeQuery, setTimeQuery } = useGlobalVar();
    let content;

    const contentAdd = useRef();

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

    const handlePostSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const dataObject = Object.fromEntries(formData.entries());
        const isEmpty = Object.values(dataObject).some(value => value.trim() === '');

        if (isEmpty) {
            alert('Có trường rỗng. Vui lòng điền đầy đủ thông tin.');
            return; // Ngừng hàm nếu có trường rỗng
        }
        try {
            const response = await axios.post('http://localhost:3000/post', dataObject, {
                params: {
                    table: tableUse
                }
            });
            setTimeQuery({ "mongo": response.data.itemMongo.time_finding, "cassandra": response.data.itemCassandra.time_finding });
            console.log('Dữ liệu đã được gửi thành công:', response.data);
            alert("Thêm dữ liệu thành công!")
            if (contentAdd.current) {
                contentAdd.current.innerHTML = JSON.stringify(dataObject,null,2)
            }
            form.reset();
        } catch (error) {
            console.error('Có lỗi xảy ra:', error);
        }
    }

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

    if (selected === "showAll") {
        if (tableUse !== "" && tableUse != null) {
            setQueryCassandra(`Select * from ${tableUse};`)
            setQueryMongo(`db.${tableUse}.find({},{ _id: 0 });`)
        }
        content = (
            <>
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
            </>
        );
    } else if (selected === "insert") {
        if (tableUse !== "" && tableUse != null) {
            setQueryCassandra(`Insert into ${tableUse} value();`)
            setQueryMongo(`db.${tableUse}.insertOne(value);`)
            content = (
                <>
                    <form encType="multipart/form-data" onSubmit={handlePostSubmit} method="POST">
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '300px' }}>
                            {columns.map((value, index) => (
                                <div className={`${bootstrapCss.d_flex} ${bootstrapCss.justify_between}`} style={{ width: "40%", padding: '10px' }}>
                                    <span>{index + 1}.{value.column_name} ({value.type}): </span>
                                    <input key={index} type="text" name={value.column_name} style={{ padding: "5px" }}></input>
                                </div>
                            ))}
                            <button type="submit" style={{ width: "100px", padding: '5px', marginTop: '20px', borderRadius: "10px", fontSize: "18px", color: "white", backgroundColor: "#28a745" }} >Thêm</button>
                        </div>
                    </form>
                </>
            )
        }
        else {
            content = <div>Không có thông tin gì để in ra</div>;
        }
    } else {
        content = <div>Không có thông tin gì để in ra cả!!</div>;
    }

    return (
        <>
            {content}
            <div className={bootstrapCss.d_flex} style={{ gap:"400px" }}>
                <div style={{ textAlign: "left", padding: '50px' }}>
                    <h3>Câu lệnh truy vấn là :</h3>
                    <div className={`${bootstrapCss.mongoQuery} ${bootstrapCss.mongoDB}`}>
                        + Mongo : {queryMongo}
                    </div>
                    <div className={`${bootstrapCss.cassandraQuery} ${bootstrapCss.cassandra}`}>
                        + Cassandra : {queryCassandra}
                    </div>
                </div >
                <div style={{ textAlign: "left", padding: '50px',marginTop:"10px" }}>
                    Bản ghi được thêm là :
                    <pre ref={contentAdd}></pre>
                </div>
            </div>
            {/* <form action="" method="post">
                <label for="team_name">Enter name: </label>
                <input
                    id="team_name"
                    type="text"
                    name="name_field"/>
                <input type="submit" value="OK" />
            </form> */}
        </>
    );
}
export default Inforbody;