require("dotenv").config();
const mongoose = require('mongoose');

const neo4j = require("neo4j-driver");

const uri = `neo4j://${process.env.NEO4J_HOST}:${process.env.NEO4J_PORT}`;
const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

async function addNeo4j(req, res) {
  const { Titulo, Texto } = req.body
  try {
    let query = `create(:Pessoa{nome: '${Titulo}', email: '${Texto}'})`;
    await session.run(query);
    return res.status(200).send("ok")
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  addNeo4j
}