import { useRef } from "react";
import { useGlobalVar } from "../context/GlobalVarContext";
import bootstrapCss from '../css/bootstrap.module.css';
import Loader from "./Loader.js";
import DialogBox from "./support/DialogBox.js";
import Toast from "./support/Toast.js";
import TerminalComponent from "./TerminalComponent.js";
import Delete from "./ui/Delete.js";
import Post from "./ui/Post.js";
import ShowAll from "./ui/ShowAll.js";
import Update from "./ui/Update.js";

function Inforbody() {

  const { speed, loading, setLoading, selected, message, message2,
    queryMongo, queryCassandra, setQueryCassandra, setQueryMongo,
    tableUse, columns, timeQuery, setTimeQuery , showDialog,
    showToast} = useGlobalVar();

  let content;
  const contentAdd = useRef();

  if (selected === "showAll") {
    if (tableUse !== "" && tableUse != null) {
      setQueryCassandra(`Select * from ${tableUse};`)
      setQueryMongo(`db.${tableUse}.find({},{ _id: 0 });`)
    }
    content = (<ShowAll></ShowAll>);
  } else if (selected === "insert") {
    if (tableUse !== "" && tableUse != null) {
      setQueryCassandra(`Insert into ${tableUse} value();`)
      setQueryMongo(`db.${tableUse}.insertOne(value);`)
      content = <Post contentAdd={contentAdd}></Post>
    }
    else {
      content = <div>Không có thông tin gì để in ra</div>;
    }
  } else if (selected === "edit") {
    if (tableUse !== "" && tableUse != null) {
      setQueryCassandra(`Update ${tableUse} set {key:value} where {primarykey:value};`)
      setQueryMongo(`db.${tableUse}.findOneAndUpdate({key:value},{$set:{field:value}});`)
      content = (<Update />);
    } else {
      content = <div>Đây là trang sửa , vui lòng chọn bảng và tìm kiếm id cần sửa!!</div>;
    }
  }
  else if (selected === "delete") {
    if (tableUse !== "" && tableUse != null) {
      setQueryCassandra(`DELETE FROM ${tableUse} WHERE <condition>;`)
      setQueryMongo(`db.${tableUse}.deleteOne({ <filter> });`)
      content = (<Delete></Delete>)
    } else {
      content = <div>Đây là trang xóa , vui lòng chọn bảng và tìm kiếm id cần xóa!!</div>;
    }
  }
  else {
    content=(<TerminalComponent></TerminalComponent>);
  }

  return (
    <>
      {loading ? <Loader speed={speed.current}></Loader> : <></>}
      {showDialog ? <DialogBox></DialogBox>:<></>}
      {showToast ? <Toast></Toast>: <></>}
      {content}
      <div className={bootstrapCss.d_flex} style={{ gap: "400px" }}>
        <div style={{ textAlign: "left", padding: '50px' }}>
          <h3>Câu lệnh truy vấn là :</h3>
          <div className={`${bootstrapCss.mongoQuery} ${bootstrapCss.mongoDB}`}>
            + Mongo : {queryMongo}
          </div>
          <div className={`${bootstrapCss.cassandraQuery} ${bootstrapCss.cassandra}`}>
            + Cassandra : {queryCassandra}
          </div>
        </div >
        <div style={{ textAlign: "left", padding: '50px', marginTop: "10px" }}>
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