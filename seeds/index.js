if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Location = require("../models/location");
const locations = require("./locations");
const axios = require("axios");
const dbURL = process.env.DB_URL;

/* ----------------Conexion a la base de datos---------------------*/

mongoose.connect(dbURL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

/* ----------------------------------------------------------------*/

/* ------------Peticion a la API para obtener una url--------------*/

async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "JjLJp1ow2y3RB27qxgZMwV2P0h_1Blo6-DgkOjc-3EI",
        collections: 6762550,
      },
    });
    return resp.data.urls.small;
  } catch (err) {
    console.error(err);
  }
}

/* ----------------------------------------------------------------*/

/* ------------------------SEED DATABASE---------------------------*/

const seedDB = async() => {
    try {
        //Vaciado de la base de datos
        await Location.deleteMany({});
        //Asignacion de una imagen aleatoria para el lugar 
        //Se iteran los objetos contenidos en el archivo seeds
        for (const key in locations) {
            if (Object.hasOwnProperty.call(locations, key)) {
                const element = locations[key];
                /*Se itera el contenido de los elementos y se asigna una url
                al atributo imagen de cada uno de ellos */
                for (const insideKey in element) {
                  if (Object.hasOwnProperty.call(element, insideKey)) {
                    let insideElement = element[insideKey];
                    if(insideKey === "images"){
                      insideElementURL = await seedImg();
                      element.images = [{url: insideElementURL, filename: element.location}] ;
                    }
                  }
                }
            }
        }
        //Ingreso de las seeds a la base de datos
        await Location.insertMany(locations);
        console.log("Se inserto a la base de datos");
    } catch(err) {
        console.error(err);
    }
}

/* ----------------------------------------------------------------*/


seedDB();