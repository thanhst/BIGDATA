import axios from 'axios';
import React, { useEffect } from 'react';
import './App.css';
import Inforbody from './component/Inforbody';
import Menu from './component/Menu';
import Title from './component/Title';
import { useGlobalVar } from './context/GlobalVarContext';
import bootstrapCss from './css/bootstrap.module.css';

function App() {
  const { selected,message, message2, setMessage, setMessage2, tables, setTables, tableUse, setTableUse,setColumns,setTimeQuery,timeQuery} = useGlobalVar();


  useEffect(() => {
    fetchTableData();
  }, []);

  useEffect(() => {
    fetchData();
    // console.log(message)
    fetchColumnName();
  }, [tableUse]);

  useEffect(()=>{
    if(tableUse!=null){
      if(selected ==="showAll"){
        fetchData();
      }
    }
    setTimeQuery()
  },[selected])

  const fetchData = async () => {
    try {
      // console.log(tableUse)
      if (tableUse !== "" && tableUse != null) {
        const response = await axios(`http://localhost:3000/mongoDB/getAllData`, {
          params: {
            table: tableUse
          }
        });
        const response2 = await axios(`http://localhost:3000/cassandra/getAllData`, {
          params: {
            table: `${tableUse}`
          }
        });
        setMessage2(response2.data);
        setMessage(response.data);
        setTimeQuery({"mongo":response.data.time_finding,"cassandra":response2.data.time_finding})
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const fetchTableData = async () => {
    try {
      const response = await axios(`http://localhost:3000/getAllTables`);
      console.log(response.data);
      setTables(response.data);
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const fetchColumnName = async() =>{
    try{
      const response = await axios('http://localhost:3000/getColumns',
        {params:
          {
            table:tableUse
          }
        }
      );
      setColumns(response.data);
      console.log(response.data);

    }
    catch(error){
      console.log(error)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <Title></Title>
      </header>
      <Menu></Menu>
      <div className={`${bootstrapCss.main}`}>
        {/* {selected === "showAll" ?
          <div style={{ display: 'flex', justifyContent: "space-around", marginTop: '50px', width: '75%' }}>
            <div className={`${bootstrapCss.div_mongoDB} ${bootstrapCss.border}`}>
              {message!==""&&message!=null?renderDocument(message.table):<div>Chưa có thông tin gì về dữ liệu</div>}
            </div>
            <div className={`${bootstrapCss.div_cassandra} ${bootstrapCss.border}`}>
              {message2!==""&&message2!=null?renderTable(message2.table):<div>Chưa có thông tin gì về dữ liệu</div>}
            </div>
          </div> : <div>Không có thông tin gì để in ra cả!!</div>} */}
        {Inforbody()}
        <div style={{ position: 'absolute', top: '250px', right: '150px' }}>
          <h3>Tốc độ truy vấn</h3>
          <div className={`${bootstrapCss.border} ${bootstrapCss.speed_search_box}`}>
            <table border="1" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ color: "#00ed64" }}>mongoDB</th>
                  <th style={{ color: "#1183ab" }}>cassandra</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{timeQuery !== ""&&timeQuery!=null ? timeQuery.mongo + "ms" : <div>0ms</div>}</td>
                  <td>{timeQuery !== ""&&timeQuery!=null ? timeQuery.cassandra + "ms" : <div>0ms</div>}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
