const express = require("express");
const res = require("express/lib/response"); // need a response from express
const app= express();
const { MongoClient } = require("mongodb");



var mongodb_uri = "mongodb://admin:password@localhost:32000/?authMechanism=DEFAULT"; // LOCAL TESTING
// var mongodb_uri = "mongodb://admin:password@mongo-svc:32000/?authMechanism=DEFAULT"; // KUBERNETES TESTING
// var mongodb_uri = "mongodb://admin:password@mongo/?authMechanism=DEFAULT"; // KUBERNETES TESTING
// var mongodb_uri = "mongodb://admin:password@mongo-svc/?authMechanism=DEFAULT"; // KUBERNETES TESTING



const add = function(n1,n2){
    return n1+n2;
}

const subtract = function(n1,n2){
    return n1-n2;
}

const divide = function(n1,n2){
    return n1/n2;
}

const multiply = function(n1,n2){
    return n1*n2;
}

const checkNumbers = function(n1,n2){

    if(isNaN(n1)) {
        throw new Error("n1 incorrectly defined");
    }
    
    if(isNaN(n2)) {
        throw new Error("n2 incorrectly defined");
    }
    
    if (n1 === NaN || n2 === NaN) {
        throw new Error("Parsing Error");
    }
}

const calculator = function(req,operation){
    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    checkNumbers(n1,n2);
    const result = operation(n1,n2);
    return result;
}


//http://localhost:3040/add?n1=2&n2=10
//Invoke-RestMethod -Uri http://localhost:3040/add?n1=2"&"n2=10 -Method Get -Headers @{"Content-Type"="application/json"}
app.get("/add", (req,res)=>{
    try{
        const result = calculator(req, add);
        res.status(200).json({statuscode:200, data: result }); 
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
      }
});

//http://localhost:3040/subtract?n1=2&n2=10
//Invoke-RestMethod -Uri http://localhost:3040/subtract?n1=2"&"n2=10 -Method Get -Headers @{"Content-Type"="application/json"}
app.get("/subtract", (req,res)=>{
    try{
        const result = calculator(req, subtract);
        res.status(200).json({statuscode:200, data: result }); 
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
      }
});

//http://localhost:3040/multiply?n1=2&n2=10
//Invoke-RestMethod -Uri http://localhost:3040/multiply?n1=2"&"n2=10 -Method Get -Headers @{"Content-Type"="application/json"}
app.get("/multiply", (req,res)=>{
    try{
        const result = calculator(req, multiply);
        res.status(200).json({statuscode:200, data: result }); 
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
      }
});

//http://localhost:3040/divide?n1=2&n2=10
//Invoke-RestMethod -Uri http://localhost:3040/divide?n1=2"&"n2=10 -Method Get -Headers @{"Content-Type"="application/json"}
app.get("/divide", (req,res)=>{
    try{
        const result = calculator(req, divide);
        res.status(200).json({statuscode:200, data: result }); 
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
      }
});

// http://localhost:3040/mongoadd?n1=2&n2=10
app.get("/mongoadd", (req,res)=>{
    try{
        const result = calculator(req, add);
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
    }

    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    const result = calculator(req, add);

    const client = new MongoClient(mongodb_uri);
    async function run() {
      try {
        const database = client.db("Task91P");
        const collection = database.collection("Calculations");
        const document = {
          n1: n1,
          n2: n2,
          operation : "add",
          result : result
        }
        const dbresult = await collection.insertOne(document);
    } finally {
        await client.close();
      }
    }
    run().catch(console.dir);
    res.status(500).json({statuscode:500, msg: "Added Addition" })
});

// http://localhost:3040/mongoaddupdatetodivide?n1=2&n2=10
app.get("/mongoaddupdatetodivide", (req,res)=>{
    try{
        const result = calculator(req, divide);
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
    }

    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    const result = calculator(req, divide);

    const client = new MongoClient(mongodb_uri);
    async function run() {
        try {
            const database = client.db("Task91P");
            const collection = database.collection("Calculations");
            const filter = { n1: n1, n2: n2, operation : "add" };
            const options = {};

            const updateDoc = {
                $set: {
                    operation : "divide",
                    result: result,
                },
            };
            const dbresult = await collection.updateOne(filter, updateDoc, options);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
    res.status(500).json({statuscode:500, msg: "Updated Addition to Division" })
});

// http://localhost:3040/mongoaddreplacewithsubtraction?n1=2&n2=10
app.get("/mongoaddreplacewithsubtraction", (req,res)=>{
    try{
        const result = calculator(req, divide);
    } catch(error) { 
        res.status(500).json({statuscode:500, msg: error.toString() })
    }

    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    const result = calculator(req, subtract);

    const client = new MongoClient(mongodb_uri);
    async function run() {
        try {
            const database = client.db("Task91P");
            const collection = database.collection("Calculations");
            const query = { operation: { $regex: "add" } };
            const document = {
                n1: n1,
                n2: n2,
                operation : "subtraction",
                result : result
              }
            const dbresult = await collection.replaceOne(query, document);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
    res.status(500).json({statuscode:500, msg: "Replaced Addition with New Subtraction" })
});

// http://localhost:3040/mongoadddelete
app.get("/mongoadddelete", (req,res)=>{
    const client = new MongoClient(mongodb_uri);
    async function run() {
        try {
            const database = client.db("Task91P");
            const collection = database.collection("Calculations");
            const query = { operation : "add", };
            const dbresult = await collection.deleteOne(query);
        } finally {
            await client.close();
        }

    }
      
    run().catch(console.dir);
    res.status(500).json({statuscode:500, msg: "Deleted Documents" })
});

// http://localhost:3040/mongopeek?operation=add
// works locally but not over kubernetes (the add variable returns NaN)
app.get("/mongopeek", (req,res)=>{
    const query_operation = req.query.operation;
    const client = new MongoClient(mongodb_uri);
    const peeked = "";
    async function run() {
        try {
            const database = client.db("Task91P");
            const collection = database.collection("Calculations");
            const fieldName = "result";
            const query = { operation: query_operation };
            const peeked = await collection.distinct(fieldName, query);
            console.log(peeked);
            await res.status(500).json({statuscode:500, msg: "Peeked " + query_operation + " Results:" + peeked})
        } catch(error) { 
            await res.status(500).json({statuscode:500, msg: "Error Peeking" })
        }  finally {
            await client.close();
        }
    }
          
    run().catch(console.dir);
});

const port=3040;
app.listen(port,()=> {
    console.log("Listening to port: " +port);
})
