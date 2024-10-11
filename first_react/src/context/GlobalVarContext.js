import { createContext, useContext, useState } from "react";

const GlobalVarContext = createContext();

export const GlobalVarProvider = ({ children }) => {
    const [selected, setSelected] = useState("showAll");
    const [message, setMessage] = useState('');
    const [message2, setMessage2] = useState('');
    const [tables, setTables] = useState('');
    const [tableUse, setTableUse] = useState('');
    const [queryMongo, setQueryMongo] = useState();
    const [queryCassandra, setQueryCassandra] = useState();
    const [columns, setColumns] = useState();
    const [timeQuery, setTimeQuery] = useState();
    const [loading, setLoading] = useState(false);
    const [speed,setSpeed] = useState(8);
    const [showDialog,setShowDialog] = useState(false);
    const [showToast,setShowToast] = useState(false);
    const [toastVisible,setToastVisible] = useState(false);
    const [typeToast,setTypeToast] = useState("infor");
    const [contentToast,setContentToast] = useState();
    const [typeD, setTypeDialog] = useState();
    const [funcD , setFunctionDialog] = useState();
    const [selectedData, setSelectedData] = useState();
    const [formData,setFormData] = useState();
    const [primarykey,setPrimaryKey] = useState();
    const [reload,setReload] = useState(false);

    return (
        <GlobalVarContext.Provider value={{
            selected, setSelected,
            message, setMessage,
            message2, setMessage2,
            tables, setTables,
            tableUse, setTableUse,
            queryMongo, setQueryMongo,
            queryCassandra, setQueryCassandra,
            columns, setColumns,
            timeQuery, setTimeQuery,
            loading, setLoading,
            speed,setSpeed,
            showDialog,setShowDialog,
            showToast,setShowToast,
            toastVisible,setToastVisible,
            typeToast,setTypeToast,
            contentToast,setContentToast,
            typeD,setTypeDialog,
            funcD , setFunctionDialog,
            selectedData,setSelectedData,
            formData,setFormData,
            primarykey,setPrimaryKey,
            reload,setReload,
        }}>
            {children}
        </GlobalVarContext.Provider>
    );
}
export const useGlobalVar = () => useContext(GlobalVarContext);