// const express = require('express');
// require('../Config/path.js')
// //require path để set lại giá trị cho app_root
// const app = express();
// const Router = express.Router();
// const mysql = require('mysql2');
// const dotenv = require('dotenv');
// dotenv.config();
// const handlebars = require('express-handlebars');
// const port = process.env.PORT || 5000;
// const path = require('path');
// const fs = require('fs');
// const asset = require('../Config/global_helper.js')
// const publicPath = path.join(process.env.APP_ROOT, 'Resources/public');
// const User = require('../AppData/Models/User.js')
// // Middleware để xử lý các yêu cầu JSON
// app.use(express.json());

// console.log(process.env.APP_ROOT)
// app.engine('B', handlebars.engine({
//   extname: '.hbs',
// }));
// app.set('view engine', 'hbs')
// app.set('views', path.join(process.env.APP_ROOT, 'Resources/views'))

// app.use(express.static(publicPath))
// // để mặc định là đường dẫn dẫn vào public

// // Thiết lập headers CORS thủ công
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Thay đổi thành origin của ứng dụng React
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// // Tuyến đường chính
// app.get('/', (req, res) => {
//   res.locals.asset = asset;
//   res.locals.title = "Thanh Siêu cấp pjmvpvai"
//   const menuFilePath = path.join(__dirname, '../Resources/views/menu.hbs');
//   const menuContent = fs.readFileSync(menuFilePath, 'utf-8');
//   res.locals.menu = menuContent
//   res.render('home');
// });
// app.get('/html',(req,res)=>{
//   const filePath = path.join(__dirname,'../Resources/views/mains.html');
//   console.log(filePath);
//   res.sendFile(filePath);
// });
// const userRouter = require('../Routes/userRouter.js');
// app.use('/users', userRouter);

// // Một tuyến đường khác để trả về JSON
// app.get('/api/data', (req, res) => {
//   res.json({ message: 'Data from Express API' });
// });

// app.get('/api/save', (req, res) => {
//   res.json({ message: 'Save data from Express API' });
//   console.log('Đang kêu gọi save')
// });
// // Bắt đầu lắng nghe trên cổng đã chọn
// app.listen(port, () => {
//   process.env.APP_BASE_URL = `http://localhost:${port}`
//   console.log(`Server is running on port ${port}`);
//   console.log(process.env.APP_ROOT)
//   console.log(path.join(process.env.APP_ROOT, 'Resources', 'public'))
//   console.log(asset('css/app.css'))
// });



// app.js hoặc index.js (hoặc tên file tương tự)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Client } = require('cassandra-driver');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;
// 13.215.45.194
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbname = process.env.DB_DATABASE
// Kết nối với MongoDB
mongoose.connect(`mongodb://localhost:27017/${dbname}`, {
  useNewUrlParser: true,
});
async function reconnectMongo() {
  while (true) {
    try {
      console.log('Reconnected to MongoDB');
      await mongoose.connect(`mongodb://localhost:27017/${dbname}`, { useNewUrlParser: true });
      break; // Thoát vòng lặp khi kết nối thành công
    } catch (err) {
      console.error('Retrying MongoDB connection:');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ 5 giây trước khi thử lại
    }
  }
}


// Kiểm tra kết nối
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error');
  reconnectMongo();
});


// Kết nối với cassandra

const client = new Client({
  contactPoints: ['localhost:9042'], // Địa chỉ IP của server Cassandra
  localDataCenter: 'datacenter1', // Tên datacenter của bạn
  keyspace: `${dbname}` // Tên keyspace mà bạn muốn làm việc
});
async function connect() {
  try {
    await client.connect();
    console.log('Connected to Cassandra');
  } catch (error) {
    console.error('Connection error', error);
    setTimeout(connect, 1000);
  }
}
connect();
const itemSchema = new mongoose.Schema({}, { strict: false, versionKey: false });

async function getCollections() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  return collections.map(collection => collection.name);
}

async function getTables() {
  const query = `SELECT table_name FROM system_schema.tables WHERE keyspace_name='bigdata'`;
  const result = await client.execute(query);
  return result.rows.map(row => row.table_name);
}

async function getColumn(tableUse) {
  const query = 'SELECT column_name,type,kind FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?';
  try {
    // Thực thi truy vấn với tham số
    const result = await client.execute(query, ['bigdata', tableUse.toLowerCase()], { prepare: true });
    // Trả về danh sách tên các cột
    return result.rows
  } catch (error) {
    console.error('Lỗi khi lấy cột:', error);
    return [];
  }
}
// async function getField(tableUse) {
//   const itemModel = mongoose.model('Item', itemSchema, tableUse);
//   const schemaFields = Object.keys(itemModel.schema.paths);
//   console.log(schemaFields);
// }
// Định nghĩa một schema và model
// const flexibleSchema = new mongoose.Schema({}, { strict: false });

// const FlexibleModel = mongoose.model('helloThanh', flexibleSchema);
// getColumn("Class").then(column=>{
//   console.log(column)
// })

app.get('/getColumns', async (req, res) => {
  const columns = await getColumn(req.query.table);
  res.json(columns);
})
// Route để lấy dữ liệu và gửi đến giao diện web
app.get('/mongoDB/getAllData', async (req, res) => {
  try {
    const data = Date.now();
    // console.log(req.query.table)
    const itemModel = mongoose.model('Item', itemSchema, req.query.table);
    const table = await itemModel.find({}, { _id: 0 });
    const time_finding = Date.now() - data;
    res.send({ table, time_finding });
  } catch (error) {
    // res.status(500).send(error);
    console.log("Lỗi lấy dữ liệu!");
  }
});

app.get('/mongoDB/Class/getDataSelect/', async (req, res) => {
  try {
    // Lấy thuộc tính 'select' từ query params
    const selectFields = req.query.select; // Ví dụ: ?select=name age

    // Chuyển đổi chuỗi thành mảng nếu cần
    const selectArray = selectFields ? selectFields.split(' ') : [];

    // Tìm dữ liệu và sử dụng các trường được chỉ định
    const items = await classModel.find().select(selectArray.join(' '));
    res.json(items);
  } catch (error) {
    console.log("Lỗi lấy dữ liệu", error);
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

app.get('/cassandra/getAllData', async (req, res) => {
  const query = `SELECT * FROM ${req.query.table}`;
  // dữ liệu trả về không hề được trả về theo thứ tự thêm vào ,
  // lý do là vì các dữ liệu được lưu trên các cluster khác nhau , nên truy vấn sẽ trả ra dữ liệu khác nhau
  try {
    const data = Date.now();
    const result = await client.execute(query);
    const time_finding = Date.now() - data;
    const table = result.rows;
    res.json({ table, time_finding });
    // console.log('Data retrieved:', result.rows);
  } catch (error) {
    console.error('Fetch error', error);
  }
});
app.get('/cassandra/class/getDataSelect/');
app.get('/getAllTables', async (req, res) => {
  try {
    const table_mongo = await getCollections();
    const table_cassandra = await getTables();
    res.json({ table_mongo, table_cassandra });
  }
  catch (error) {
    console.error('Fetch error', error);
  }
});

const insertMongo = async (table, body) => {
  const itemModel = mongoose.model('Item', itemSchema, table);
  const newItem = new itemModel(body);
  const data = Date.now();
  const savedItem = await newItem.save(); // Lưu đối tượng vào MongoDB
  const time_finding = Date.now() - data;
  return { time_finding };
}

const insertCassandra = async (table, body) => {
  const keys = Object.keys(body).join(', ');
  const placeholders = Object.keys(body).map((_, index) => `?`).join(', ');
  const query = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;

  try {
    const data = Date.now();
    await client.execute(query, Object.values(body), { prepare: true });
    const time_finding = Date.now() - data;
    return { time_finding };
  } catch (error) {
    console.error('Có lỗi khi chèn vào Cassandra:', error);
    throw new Error('Chèn thất bại');
  }
}
const updateMongo = async (table, data, primarykey) => {
  // const itemModel1 = mongoose.model('Item', itemSchema, req.query.table);
  const itemModel = mongoose.model('Item', itemSchema, table);
  // const table1 = await itemModel.find({IDClass: 23}, { _id: 0 },{ collation: { locale: 'en', strength: 2 } });


  if (!primarykey) {
    throw new Error('Missing _id in request body for MongoDB update');
  }
  const query = {};
  const dataToUpdate = { ...data };

  primarykey.forEach((key) => {
    if (dataToUpdate.hasOwnProperty(key)) {
      query[key] = dataToUpdate[key];
      delete dataToUpdate[key];
    } else {
      throw new Error(`Missing primary key field: ${key} in data.`);
    }
  });
  try {
    const dataTime = Date.now();
    const updatedItem = await itemModel.findOneAndUpdate(
      query,
      dataToUpdate,
      { collation: { locale: 'en', strength: 2 } }
    );
    if (!updatedItem) {
      throw new Error('Item not found in MongoDB with the provided primary keys');
    }
    const time_finding = Date.now() - dataTime;
    return { time_finding };
  } catch (error) {
    throw new Error(`Error updating item: ${error.message}`);
  }
}


const updateCassandra = async (table, data, primarykey) => {
  const queryList = {};
  const dataToUpdate = { ...data };

  primarykey.forEach((key) => {
    if (dataToUpdate.hasOwnProperty(key)) {
      queryList[key] = dataToUpdate[key];
      delete dataToUpdate[key];
    } else {
      throw new Error(`Missing primary key field: ${key} in data.`);
    }
  });

  // console.log(primarykey)
  const setClause = Object.keys(dataToUpdate).map(key => `${key} = ?`).join(', ');
  const values = Object.values(dataToUpdate);

  const primaryKeysClause = primarykey.map(key => `${key} = ?`).join(' AND ');
  const primaryKeyValues = primarykey.map(key => queryList[key]);

  values.push(...primaryKeyValues);

  const query = `UPDATE ${table} SET ${setClause} WHERE ${primaryKeysClause}`;
  const dataTime = Date.now();
  await client.execute(query, values, { prepare: true });
  const time_finding = Date.now() - dataTime;
  return { time_finding };
};

const deleteMongo = async (table, primaryKeys) => {

  const itemModel = mongoose.model('Item', itemSchema, table);

  if (!primaryKeys || typeof primaryKeys !== 'object' || Array.isArray(primaryKeys) || Object.keys(primaryKeys).length === 0) {
    throw new Error('Primary keys not found!!!');
  }

  // console.log('Đối tượng Query:', query);

  try {
    // Sử dụng findOneAndDelete với đối tượng truy vấn và collation để không phân biệt chữ hoa chữ thường
    const dataTime = Date.now();
    const deletedItem = await itemModel.findOneAndDelete(primaryKeys, {
      collation: { locale: 'en', strength: 2 } // strength: 2 để không phân biệt chữ hoa chữ thường
    });

    if (!deletedItem) {
      throw new Error('Item không tìm thấy trong MongoDB với các khóa chính đã cung cấp.');
    }
    const time_finding = Date.now() - dataTime;

    // console.log('Tài liệu đã được xóa:', deletedItem);
    return { time_finding };
  } catch (error) {
    throw new Error(`Lỗi khi xóa tài liệu: ${error.message}`);
  }
};

const deleteCassandra = async (table, primaryKeys) => {
  if (!primaryKeys || typeof primaryKeys !== 'object' || Array.isArray(primaryKeys) || Object.keys(primaryKeys).length === 0) {
    throw new Error('Primary keys not found!!!');
  }
  try {
    // console.log(primaryKeys)
    const data = Object.values(primaryKeys)
    const pkey = Object.keys(primaryKeys)

    // const pkey = ["123",'456']
    // const data = ["123",'456']
    // const primaryKeyValues =pkey.map((key, index) => [key,data[index]])
    // console.log(primaryKeyValues)

    const primaryKeysClause = pkey.map(key => `${key} = ?`).join(' AND ');
    const query = `Delete from ${table} where ${primaryKeysClause}`
    const dataTime = Date.now();
    await client.execute(query, data, { prepare: true });
    const time_finding = Date.now() - dataTime;
    return { time_finding };
  }
  catch (error) {
    throw new Error(`Lỗi khi xóa tài liệu: ${error.message}`);
  }
}


app.post('/post', async (req, res) => {
  try {
    // console.log('req.body:', req.body);
    const itemMongo = await insertMongo(req.query.table, req.body);
    const itemCassandra = await insertCassandra(req.query.table, req.body);
    res.status(201).json({ itemMongo, itemCassandra }); // Trả về item đã lưu
  }
  catch (error) {
    console.error(error)
  }
})

app.put('/put', async (req, res) => {
  // console.log(req.body);
  // console.log(req.query.primarykey)
  try {
    const table = req.query.table;
    const data = req.body;
    const primarykey = req.query.primarykey;
    if (!table) {
      return res.status(400).json({ error: 'Table name is required in query parameters' });
    }
    if (!data) {
      return res.status(400).json({ error: 'Missing id in request body for update' });
    }
    const itemMongo = await updateMongo(table, data, primarykey);
    const itemCassandra = await updateCassandra(table, data, primarykey);
    res.status(200).json({ itemMongo, itemCassandra });
  } catch (error) {
    console.error('Error in PUT /put:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
})

app.delete('/delete', async (req, res) => {
  try {
    const table = req.query.table;
    const data = req.query.item;
    // console.log(primarykeys)

    if (!table) {
      return res.status(400).json({ error: 'Table name is required in query parameters' });
    }
    if (!data) {
      return res.status(400).json({ error: 'Missing data in request body for update' });
    }
    const itemMongo = await deleteMongo(table, data);
    const itemCassandra = await deleteCassandra(table, data);
    res.status(200).json({ itemMongo, itemCassandra });
  } catch (error) {
    console.error('Error in delete /delete:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
})
const parseMongoCommand = (command) => {
  // Bỏ qua 'db.' và tách các phần
  const regex = /^db\.(\w+)\.(\w+)\((.*)\)$/; // Regex để phân tách câu lệnh
  const matches = command.match(regex);

  if (matches) {
    const collection = matches[1];
    const action = matches[2];
    const args = matches[3].trim();
    console.log(args)
    // Tách các tham số nếu cần thiết
    let parsedArgs = [];

    if (action === 'find') {
      // Giả sử chỉ có 1 tham số cho find
      parsedArgs = args ? [JSON.parse(args)] : [{}]; // Điều kiện mặc định
    } else if (action === 'insertOne' || action === 'insertMany') {
      // Giả sử chỉ có 1 tham số cho insert
      parsedArgs = [JSON.parse(args)];
    } else if (action === 'update') {
      // Tách filter và update từ args
      const [filter, update] = args ? args.split(',').map(arg => JSON.parse(arg.trim())) : [{}, {}];
      parsedArgs = [filter, update];
    } else if (action === 'deleteOne' || action === 'deleteMany') {
      // Giả sử chỉ có 1 tham số cho delete
      parsedArgs = [JSON.parse(args)];
    } else {
      throw new Error('Unsupported action');
    }

    return { collection, action, args: parsedArgs };
  } else {
    throw new Error('Invalid command format');
  }
}
app.post('/api/mongodb/execute', async (req, res) => {
  const { query } = req.body; // Nhận lệnh từ người dùng

  try {
    // Phân tích lệnh
    const commandParts = parseMongoCommand(query);
    const collectionName = commandParts['collection']; // Lấy tên collection
    const action = commandParts['action']; // Hành động (find, insertOne, ...)

    // Truy cập vào collection
    const model = mongoose.model('Item', itemSchema, collectionName);

    let result;

    // Thực hiện hành động dựa trên lệnh
    if (action === 'find') {
      const filter = commandParts.args[0];
      result = await model.find(filter);
    } else if (action === 'insertOne') {
      const document = commandParts.args[0]
      result = await model.create(document);
    } else if (action === 'updateOne') {
      const filter = commandParts.args[0]
      const update = commandParts.args[1]
      result = await model.updateOne(filter, update);
    } else if (action === 'deleteOne') {
      const filter = commandParts.args[0]
      result = await model.deleteOne(filter);
    } else {
      throw new Error('Unsupported action');
    }
    res.json(result);
  } catch (error) {
    // console.error('Error executing query:', error);
    res.status(400).json({ error: error.message });
  }
});


app.post('/api/cassandra/execute', async (req, res) => {
  const { query } = req.body;
  // console.log(query)
  try {
    const result = await client.execute(query);
    if (result.rows) {
      res.json(result.rows);
    }
    else {
      res.json("Execute success!");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cấu hình để phục vụ các file tĩnh (như HTML, CSS, JS)
app.use(express.static('public'));

// Bắt đầu server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
