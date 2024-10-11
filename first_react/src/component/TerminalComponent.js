// src/components/TerminalComponent.js
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
    const terminalRef = useRef(null);
    const fitAddonRef = useRef(new FitAddon());
    const termRef = useRef(null);
    const [currentDb, setCurrentDb] = useState('mongodb'); // hoặc 'cassandra'
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    useEffect(() => {
        // Khởi tạo terminal
        termRef.current = new Terminal({
            cursorBlink: true,
            rows: 20,
            theme: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                cursor: '#ffffff',
            },
            convertEol: true // Enable EOL conversion
        });

        // Tải addon fit
        termRef.current.loadAddon(fitAddonRef.current);

        // Mở terminal trong DOM
        termRef.current.open(terminalRef.current);

        // termRef.current.onPaste = (data) => {
        //     termRef.current.write(data);
        // };

        // Điều chỉnh kích thước terminal
        fitAddonRef.current.fit();

        // Hiển thị dấu nhắc lệnh
        prompt();

        termRef.current.attachCustomKeyEventHandler((e) => {
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault(); // Ngăn chặn hành động mặc định của trình duyệt
                navigator.clipboard.readText().then(text=>{
                    termRef.current.write(text);
                });
            }
            return true;
        });

        // Lắng nghe sự kiện nhập liệu
        termRef.current.onKey(async ({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.key === 'Backspace') {
                if (termRef.current.buffer.active.cursorX > promptLength()) {
                    termRef.current.write('\b \b');
                }
            } else if (domEvent.key === 'Enter') {
                const input = currentInput();
                termRef.current.write('\r\n');
                if (input.trim()) {
                    await executeCommand(input.trim());
                }
                prompt();
            } else if (domEvent.key === 'ArrowUp') {
                if (history.length > 0) {
                    const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : history.length - 1;
                    setHistoryIndex(newIndex);
                    const cmd = history[history.length - 1 - newIndex];
                    replaceCurrentInput(cmd);
                }
            } else if (domEvent.key === 'ArrowDown') {
                if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    const cmd = history[history.length - 1 - newIndex];
                    replaceCurrentInput(cmd);
                } else {
                    setHistoryIndex(-1);
                    replaceCurrentInput('');
                }
            } else if (printable) {
                termRef.current.write(key);
            }
        });

        // Đảm bảo terminal được điều chỉnh khi kích thước thay đổi
        window.addEventListener('resize', () => {
            fitAddonRef.current.fit();
        });

        return () => {
            termRef.current.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDb, history, historyIndex]);

    const promptLength = () => {
        return currentDb.length + 2; // ví dụ: "mongo> " có độ dài là 6
    };

    const prompt = () => {
        termRef.current.write(`\r\n${currentDb === 'mongodb' ? 'mongodb> ' : 'cassandra> '}`);
    };

    const currentInput = () => {
        const lines = termRef.current.buffer.active.getLine(termRef.current.buffer.active.cursorY)?.translateToString(true);
        if (!lines) return '';
        return lines.substring(promptLength());
    };

    const formatTable = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return 'No data returned.';
        }

        const columns = Object.keys(data[0]);

        const colWidths = columns.map(col => {
            const maxContentWidth = data.reduce((max, row) => {
                const content = row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
                return Math.max(max, content.length);
            }, col.length);
            return maxContentWidth;
        });

        const pad = (str, length) => {
            return str + ' '.repeat(length - str.length);
        };

        const header = columns.map((col, idx) => pad(col, colWidths[idx])).join(' | ');

        const separator = colWidths.map(width => '-'.repeat(width)).join('-|-');

        const rows = data.map(row => {
            return columns.map((col, idx) => pad(row[col] !== null && row[col] !== undefined ? String(row[col]) : '', colWidths[idx])).join(' | ');
        });
        // console.log([header, separator, ...rows].join('\n'));

        return [header, separator, ...rows].join('\n');
    };

    const executeCommand = async (command) => {
        setHistory(prev => [...prev, command]);
        setHistoryIndex(-1); // Reset chỉ số khi nhập mới
        if (currentDb === 'mongodb') {
            await executeMongoDB(command);
        } else if (currentDb === 'cassandra') {
            await executeCassandra(command);
        }
    };

    
    const executeMongoDB = async (query) => {
        try {
            const response = await axios.post('http://localhost:3000/api/mongodb/execute', { query });
            const data = response.data;
            termRef.current.writeln(JSON.stringify(data, null, 2));
        } catch (error) {
            const message = error.response?.data?.error || error.message;
            termRef.current.writeln(`Error: ${message}`);
        }
    };

    const executeCassandra = async (query) => {
        try {
            const response = await axios.post('http://localhost:3000/api/cassandra/execute', { query });
            const data = response.data;
            const table = formatTable(data);
            termRef.current.writeln('');
            termRef.current.writeln(table);
            // termRef.current.writeln('Row 1');
            // termRef.current.writeln('Row 2');
            // termRef.current.writeln('Row 3');
        } catch (error) {
            const message = error.response?.data?.error || error.message;
            termRef.current.writeln(`Error: ${message}`);
        }
    };

    const replaceCurrentInput = (text) => {
        const line = currentInput();
        for (let i = 0; i < line.length; i++) {
            termRef.current.write('\b \b');
        }
        termRef.current.write(text);
    };

    const switchDb = () => {
        setCurrentDb(prev => (prev === 'mongodb' ? 'cassandra' : 'mongodb'));
        prompt();
    };

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={switchDb} style={{ padding:"10px",borderRadius:"10px",fontWeight:"bolder" }}>
                    Switch to {currentDb === 'mongodb' ? 'Cassandra' : 'MongoDB'}
                </button>
            </div>
            <div ref={terminalRef} style={{ height: '500px', width: '80%', backgroundColor: '#1e1e1e', textAlign: "left", paddingLeft: "10px" }}></div>
        </div>
    );
};

export default TerminalComponent;
