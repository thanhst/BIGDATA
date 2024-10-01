import { useState } from 'react';
import { useGlobalVar } from '../context/GlobalVarContext';
import bootstrapCss from '../css/bootstrap.module.css';
function Menu() {
    const { selected, setSelected } = useGlobalVar();
    const handleSelect = (item) => {
        setSelected(item);
        if (item === 'query') {
            setTitle("Thực hiện câu truy vấn");
        }
        else if (item === 'showAll') {
            setTitle("Hiển thị tất cả danh sách");
        }
        else if (item === "insert") {
            setTitle("Thêm");
        }
        else if (item === "edit") {
            setTitle("Sửa");
        }
        else {
            setTitle("Xóa");
        }
    };
    const [title, setTitle] = useState('Hiển thị tất cả danh sách');
    const { tables, setTables,tableUse,setTableUse } = useGlobalVar();
    return (
        <div>
            <nav className={`${bootstrapCss.menu} ${bootstrapCss.d_flex} ${bootstrapCss.justify_between}`}>
                <ul>
                    <li className={`${bootstrapCss.query} ${selected === 'query' ? bootstrapCss.active : ""}`} onClick={() => handleSelect('query')}>Thực hiện truy vấn</li>
                    <li className={`${bootstrapCss.showAll} ${selected === 'showAll' ? bootstrapCss.active : ""}`} onClick={() => handleSelect('showAll')}>Hiển thị tất cả</li>
                    <li className={`${bootstrapCss.insert} ${selected === 'insert' ? bootstrapCss.active : ""}`} onClick={() => handleSelect('insert')}>Thêm</li>
                    <li className={`${bootstrapCss.edit} ${selected === 'edit' ? bootstrapCss.active : ""}`} onClick={() => handleSelect('edit')}>Sửa</li>
                    <li className={`${bootstrapCss.delete} ${selected === 'delete' ? bootstrapCss.active : ""}`} onClick={() => handleSelect('delete')}>Xóa</li>
                </ul>
                <div className={`${bootstrapCss.d_flex} ${bootstrapCss.align_center}`} style={{ gap: '10px' }}>
                    <span>Table:</span>
                    <select className={`${bootstrapCss.table_select}`}  onChange={(e)=>setTableUse(e.target.value)}>
                        {tables.table_mongo!=null && tables.table_mongo.map((key, index) => (
                            <option value={key} key={key}>{key}</option>
                        ))}
                        <option selected>Vui lòng chọn bảng để thực hiện truy vấn</option>
                    </select>
                </div>
            </nav >
            <div className={bootstrapCss.line}>
                <h3>{title}</h3>
            </div>
        </div >
    )
}
export default Menu;