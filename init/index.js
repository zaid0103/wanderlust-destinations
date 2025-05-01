require('dotenv').config();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { connect, deleteMany, insertMany } = Listing;
const data = initData.data;

//now creating and connecting with the database
const MONGO_URL=process.env.MONGO_URI;
main().then(()=>
{
    console.log("connected to the DB");
}).catch(err=>
{
    console.log(err);
});
async function main()
{
    connect(MONGO_URL);
}

const initDB=async()=>
{
    await deleteMany({});
    data = data.map((obj)=>({...obj, owner:"668ab4cc4eede678b92d68e2"}));
    await insertMany(data);
    console.log("data was initialised");
};

initDB();