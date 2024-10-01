import { createContext, useContext, useState } from "react";

const GlobalVarContext = createContext();

export const GlobalVarProvider = ({children})=>{
    const [selected,setSelected] = useState("showAll");
    const [message, setMessage] = useState('');
    const [message2, setMessage2] = useState('');
    const [tables,setTables] = useState('');
    const [tableUse,setTableUse] = useState('');
    const [queryMongo,setQueryMongo] = useState();
    const [queryCassandra,setQueryCassandra] = useState();
    const [columns,setColumns] = useState();
    const [timeQuery,setTimeQuery] =  useState();
    return (
        <GlobalVarContext.Provider value={{ selected, setSelected,message,setMessage,
        message2,setMessage2 ,tables,setTables,tableUse,setTableUse,queryMongo,queryCassandra,
        setQueryCassandra,setQueryMongo,columns,setColumns
        ,timeQuery,setTimeQuery}}>
            {children}
        </GlobalVarContext.Provider>
    );
}
export const useGlobalVar = () => useContext(GlobalVarContext);