// console.log("test");
var catalyst = require('zcatalyst-sdk-node');
// const cat = catalyst.initialize();

// const LOCK_KEY = 'Test_Lock'; 
const LOCK_KEY = '35003000000082760';
const RETRY_DELAY = 500; // in ms
const MAX_WAIT_TIME = 60000; // max wait 60s (optional)
// 
async function acquireLockWithWait(lockKey, maxWait = MAX_WAIT_TIME, cat) {
  const datastore = cat.datastore();
  const locksTable = datastore.table('Locks');
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const now = Date.now();

    try {
      console.log("1");
      const row = await locksTable.getRow(lockKey);
      console.log("2");
      if (!row.locked) {
        // Lock is free or expired — acquire it
        row.locked = true;
        await locksTable.updateRow(row);
        return true;
      }
    } catch (err) {
      // Lock row doesn't exist — create it
      if (err.code === 'DATA_STORE_ROW_DOES_NOT_EXIST') {
        await locksTable.insertRow({
          lock_key: lockKey,
          locked: true,
        });
        return true;
      } else {
        console.error('Lock acquire error:', err);
      }
    }

    // Wait and try again
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  // Timed out
  return false;
}

// 
async function releaseLock(lockKey, cat) {
  try {
    const datastore = cat.datastore();
    const locksTable = datastore.table('Locks');
    const row = await locksTable.getRow(lockKey);
    row.locked = false;
    await locksTable.updateRow(row);
  } catch (err) {
    console.error('Error releasing lock:', err);
  }
}

exports.getAllEmployee = async (req, res, next) => {
  try {
    var dbApp = catalyst.initialize(req);
    let zcql = dbApp.zcql();
    //Construct the query to execute 
    let query = 'SELECT * FROM Table_1';
    let result = await zcql.executeZCQLQuery(query);
    // console.log("result:"+result.content);
    // console.log("result 2:" + JSON.stringify(result, null, 2));
    res.status(200).json({message:"Find all the employee list",result});
  } catch (err) {
    next(err); // Passes the error to error-handling middleware
  }
};

exports.getSingleEmployee = async (req, res, next) => {
  try {
    const ID = Number(req.params.id);
    var dbApp = catalyst.initialize(req);
    let zcql = dbApp.zcql();
    //Construct the query to execute 
    let query = 'SELECT * FROM Table_1 WHERE Employee_ID=' + ID;
    let result = await zcql.executeZCQLQuery(query);
    // console.log("result:"+result.content);
    console.log("result 2:" + JSON.stringify(result, null, 2));
    res.send("get single id executed!!")
  }
  catch (err) {
    next(err);
  }

};

exports.bulkCreateEmployees = async (req, res, next) => {
  try {
    const dbApp = catalyst.initialize(req);
    const zcql = dbApp.zcql();
    const employees = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }

    const results = [];

    for (const emp of employees) {
      const { Employee_ID, Name, Status } = emp;

      if (!Employee_ID || !Name || !Status) {
        continue; // Skip invalid entries
      }

      // Escape string values to prevent SQL issues
      const safeName = Name.replace(/'/g, "''");
      const safeStatus = Status.replace(/'/g, "''");

      const query = `INSERT INTO Table_1 (Employee_ID, Name, Status) VALUES (${Employee_ID}, '${safeName}', '${safeStatus}')`;

      console.log('Executing Query:', query);
      const result = await zcql.executeZCQLQuery(query);
      results.push(result);
    }

    res.status(201).json({ message: 'Employees inserted successfully', results });

  } catch (err) {
    next(err);
  }
};


exports.postSingleEmployee = async (req, res, next) => {
  // try {
  var dbApp = catalyst.initialize(req);
  const lockAcquired = await acquireLockWithWait(LOCK_KEY, MAX_WAIT_TIME, dbApp);
  if (!lockAcquired) {
    return res.status(503).send("Could not acquire lock in time."); // optional
  }
  try {
    let zcql = dbApp.zcql();

    const Name = req.body.Name;
    const Employee_ID = req.body.Employee_ID;
    const Status=req.body.Status;

    let query1 = `SELECT * FROM Table_1 ORDER BY Employee_ID DESC LIMIT 1`;
    var latestrecordOBJ = await zcql.executeZCQLQuery(query1);
    var latestrecord = JSON.stringify(latestrecordOBJ);
    if (!latestrecord.Employee_ID || !latestrecord) {

    }

    let query = `INSERT INTO Table_1 (Name, Employee_ID,Status) VALUES ('${Name}', '${Employee_ID}','${Status}')`;
    console.log("Executing Query: " + query);

    let result = await zcql.executeZCQLQuery(query);
    console.log("Result:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error('Critical task error:', err);
    res.status(500).send("Internal Server Error.");
  } finally {
    await releaseLock(LOCK_KEY, dbApp);
    console.log("Lock released at:", new Date().toISOString());
  }
  // });
  // var dbApp = catalyst.initialize(req);
  // let zcql = dbApp.zcql();

  // const Name = req.body.Name;
  // const Employee_ID = req.body.Employee_ID;

  // let query1 = `SELECT * FROM Table_1 ORDER BY Employee_ID DESC LIMIT 1`;
  // var latestrecordOBJ = await zcql.executeZCQLQuery(query1);
  // var latestrecord = JSON.stringify(latestrecordOBJ);
  // if (!latestrecord.Employee_ID || !latestrecord) {

  // }

  // let query = `INSERT INTO Table_1 (Name, Employee_ID) VALUES ('${Name}', '${Employee_ID}')`;
  // console.log("Executing Query: " + query);

  // let result = await zcql.executeZCQLQuery(query);
  // console.log("Result:", JSON.stringify(result, null, 2));
  // res.json(result);
  // res.send("POST request successful!");
  // }
  // catch (err) {
  //   next(err);
  // }
};

//put update an employee
exports.updateEmployee = async (req, res, next) => {
  try {
    var dbApp = catalyst.initialize(req);
    var zcql = dbApp.zcql();

    var body = req.body;
    const { Employee_ID, Name, Status } = body;
    if (!Employee_ID) {
      throw new Error("Employee ID is a mandatory to update an employee!!")
    }
    let query = `UPDATE Table_1 SET NAME='${Name}',Status='${Status}' WHERE Employee_ID='${Employee_ID}'`;
    let result = await zcql.executeZCQLQuery(query);

    res.status(200).json({ message: "Update successful", result });
  }
  catch (err) {
    next(err);
  }
};
//@bulk same fields update into multiple ids
// exports.bulkUpdate=async(req,res, next)=>{
//    const dbApp = catalyst.initialize(req);
//    const zcql = dbApp.zcql();

// }

// bulk partial update the employee
exports.bulkPatchEmployee = async (req, res, next) => {
  try {
    const dbApp = catalyst.initialize(req);
    const zcql = dbApp.zcql();
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Invalid or empty request body" });
    }

    let queries = [];

    updates.forEach(record => {
      const { Employee_ID, Status } = record;

      if (!Employee_ID || !Status) {
        throw new Error("Each record must have 'id' and 'Status'");
      }

      // Escape Name to avoid injection
      const safeStatus = Status.replace(/'/g, "''"); // simple SQL escape for single quote
      const query = `UPDATE Table_1 SET Status='${safeStatus}' WHERE Employee_ID=${Employee_ID}`;
      queries.push(query);
    });

    const results = [];

    for (let q of queries) {
      const result = await zcql.executeZCQLQuery(q);
      results.push(result);
    }

    res.status(200).json({ message: "Bulk update successful", results });

  } catch (err) {
    next(err);
  }
};

exports.patchSingleEmployee = async (req, res, next) => {
  try {
    const dbApp = catalyst.initialize(req);
    const zcql = dbApp.zcql();
    const ID = Number(req.params.id);
    const Name = req.body.Name;

    if (!Name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const query = `UPDATE Table_1 SET Name='${Name}' WHERE Employee_ID=${ID}`;
    console.log("Executing Query: " + query);

    const result = await zcql.executeZCQLQuery(query);

    console.log("Result:", JSON.stringify(result, null, 2));
    res.status(200).json({ message: "Update successful", result });

  } catch (err) {
    next(err);
  }
};

exports.deleteSingleEmployee = async (req, res, next) => {
  try {
    var dbApp = catalyst.initialize(req);
    let zcql = dbApp.zcql();
    const ID = Number(req.params.id);
    let query = `DELETE FROM Table_1 WHERE Employee_ID=${ID}`;
    console.log("Executing Query: " + query);

    let result = await zcql.executeZCQLQuery(query);
    res.json(`Result: Employee ID ${ID} has been deleted !!`);
  }
  catch (err) {
    next(err);
  }
};

// Post an Image data
// exports.UploadImage=async(req,res,next)=>{

// };