
const express = require('express');

const app = express();

app.set('puerto', 9876);

app.get('/', (request: any, response: any) => {
    response.send('GET - servidor NodeJS');
});

//AGREGO FILE SYSTEMop
const fs = require('fs');

//AGREGO JSON
app.use(express.json());

//AGREGO JWT
const jwt = require("jsonwebtoken");

//SE ESTABLECE LA CLAVE SECRETA PARA EL TOKEN
app.set("key", "cl@ve_secreta");

app.use(express.urlencoded({ extended: false }));

//AGREGO MULTER
const multer = require('multer');

//AGREGO MIME-TYPES
const mime = require('mime-types');

//AGREGO STORAGE
const storage = multer.diskStorage({
    destination: "public/fotos/",
});

const upload = multer({
    storage: storage
});

//AGREGO CORS (por default aplica a http://localhost)
const cors = require("cors");

//AGREGO MW 
app.use(cors());

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));


//AGREGO MYSQL y EXPRESS-MYCONNECTION
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'concesionaria_bd'
};

app.use(myconn(mysql, db_options, 'single'));

// #region Login

const verificar_usuario = express.Router();

verificar_usuario.use((request: any, response: any, next: any) => {
    let obj = request.body;

    request.getConnection((err: any, conn: any) => {
        if (err) throw ("Error al conectarse a la base de datos.");

        conn.query("SELECT * FROM usuarios WHERE correo = ? AND clave = ?", [obj.correo, obj.clave], (err: any, rows: any) => {
            if (err) throw ("Error en consulta de base de datos.");

            if (rows.length > 0) {
                response.obj_usuario = rows[0];
                next(); // Se invoca al siguiente middleware o ruta
            } else {
                response.status(401).json({
                    exito: false,
                    mensaje: "No se encontro un usuario con esa clave y contraseña",
                    jwt: null
                });
            }
        });
    });
});

app.post("/login", verificar_usuario, (request: any, response: any) => {
    const user = response.obj_usuario;

    const payload = {
        usuario: {
            id: user.id,
            apellido: user.apellido,
            nombre: user.nombre,
            perfil: user.perfil,
            foto: user.foto
        },
        api: "concesionaria_usuarios",
    };

    const token = jwt.sign(payload, app.get("key"), {
        expiresIn: "5m"
    });

    response.json({
        exito : true,
        mensaje : "JWT creado!!!",
        jwt : token
    });

});

// #endregion Login

// #region VerificarToken
const verificar_jwt = express.Router();

verificar_jwt.use((request:any, response:any, next:any)=>{

    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        return response.status(401).json({
            error: "El JWT es requerido!!!"
        });
  
    }

    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);
    }

    if(token){
        //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
        jwt.verify(token, app.get("key"), (error:any, decoded:any)=>{

            if(error){
                return response.status(403).json({
                    exito: false,
                    mensaje:"El JWT NO es válido!!!"
                });
            }
            else{
                //SE AGREGA EL TOKEN AL OBJETO DE LA RESPUESTA
                response.jwt = decoded;
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
        });
    }
});

app.get('/verificar_token', verificar_jwt, (request:any, response:any)=>{    
    response.json({exito:true, jwt: response.jwt});
});

// #endregion VerificarToken

// #region Autos_bd

//LISTAR AUTOS
app.get('/productos_bd', verificar_jwt, (request:any, response:any)=>{   
    request.getConnection((err:any, conn:any)=>{     
        if(err) throw("Error al conectarse a la base de datos.");
        conn.query("select * from autos", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});


//MIDLEWARE ALTA AUTO
const verificar_auto = express.Router();

verificar_auto.use(verificar_jwt,(request:any, response:any, next:any)=>{
    let obj = request.body;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from autos where color = ? and modelo = ? and marca = ?", [obj.color,obj.modelo,obj.marca], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos VERIFICAR AUTO.");

            if(rows.length == 0){
                response.obj = obj;
                next();
            }
            else{
                response.status(401).json({
                    exito : false,
                    repetido: true,
                    mensaje : "El Auto ya se encuentra en la bd.",
                    jwt : null
                });
            }
           
        });
    });
});

//ALTA AUTO
app.post("/altaAuto",verificar_auto,(request:any, response:any)=>{
    
    let obj = response.obj;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("insert into autos set ?", [obj], (err:any, result:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos-ALTA AUTO.");}

            if(result.affectedRows === 1){
                response.status(200).json({
                    exito : true,
                    mensaje : "Auto agregado."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "Error alta de Auto."
                });
            }
        });
    });

});


//MIDDLEWARE MODIFICAR AUTO
const modificar = express.Router();

modificar.use(verificar_jwt, (request:any, response:any, next:any)=>{
  
    console.log("middleware modificar");

    //SE RECUPERA EL TOKEN DEL OBJETO DE LA RESPUESTA
    let obj = response.jwt;

    if(obj.usuario.perfil == "propietario" || obj.usuario.perfil == "supervisor"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
        next();
    }
    else{
        return response.status(418).json({
            mensaje:"NO tiene el rol necesario para realizar la acción."+JSON.stringify(obj.usuario)
        });
    }   
});

// MODIFICAR AUTO
app.put('/modificarAuto',modificar, (request:any, response:any) => {
    let obj = request.body;
    let obj_modif: any = {};
    
    //obj.id tiene el id a modificar

    // Excluir la clave primaria (código)
    obj_modif.color = obj.color;
    obj_modif.marca = obj.marca;
    obj_modif.precio = obj.precio;
    obj_modif.modelo = obj.modelo;

    request.getConnection((err:any, conn:any) => {
        if(err) throw new Error("Error al conectarse a la base de datos.");

        conn.query("UPDATE autos SET ? WHERE id = ?", [obj_modif, obj.id], (err:any, result:any) => {
            if(err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }

            if(result.affectedRows > 0){

                response.status(200).json({
                    exito : true,
                    mensaje : "Auto modificado en la bd."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "No se encontró el Auto a modificar."
                });
            }
        });
    });
});

//MIDLE WARE BAJA
const baja = express.Router();

baja.use(verificar_jwt, (request:any, response:any, next:any)=>{

    console.log("middleware baja");

    //SE RECUPERA EL TOKEN DEL OBJETO DE LA RESPUESTA
    let obj = response.jwt;

    if(obj.usuario.perfil == "propietario"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
         next();
    }
    else{
        return response.status(418).json({
            mensaje:"NO tiene el rol necesario para realizar la acción."+JSON.stringify(obj.usuario)
        });
    }
});

// ELIMINAR
app.delete('/eliminarAuto',baja, (request:any, response:any) => {
    let obj = request.body;
    
    request.getConnection((err:any, conn:any) => {
        if(err) throw new Error("Error al conectarse a la base de datos.");

        conn.query("DELETE FROM autos WHERE id = ?", [obj.id], (err:any, result:any) => {
            if(err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }

            if(result.affectedRows > 0){
                response.status(200).json({
                    exito : true,
                    mensaje : "Auto eliminado de la bd."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "No se encontró el Auto a eliminar."
                });
            }
        });
    });
});




// #endregion Autos_bd

// #region Usuarios_bd

app.get('/listadoUsuarios', verificar_jwt, (request:any, response:any)=>{   
    request.getConnection((err:any, conn:any)=>{     
        if(err) throw("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios", (err:any, rows:any)=>{
            if(err) throw("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});

const verificar_correo_usuario = express.Router();

verificar_correo_usuario.use(upload.single("foto"),(request:any, response:any, next:any)=>{
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.apellido+ obj.nombre + "." + extension;

    request.getConnection((err:any, conn:any)=>{
        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios where correo = ?", [obj.correo], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            if(rows.length == 0){
                response.exito = true;
                response.obj = obj;
                response.path = path;
                response.file = file;
                next();
            }
            else{
                response.status(401).json({
                    exito : false,
                    mensaje : "El usuario ya se encuentra registrado.",
                    jwt : null
                });
            }
           
        });
    });
});

app.post("/usuarios",verificar_correo_usuario ,upload.single("foto"),(request:any, response:any)=>{
    
    let path = response.path;
    let obj = response.obj;
    let file = response.file;

    fs.renameSync(file.path, path);
    obj.foto = path.split("public/")[1];

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("insert into usuarios set ?", [obj], (err:any, result:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            if(result.affectedRows === 1){

                response.status(200).json({
                    exito : true,
                    mensaje : "Usuario agregado."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "Error alta de usuario."
                });
            }
        });
    });

});
 


const modificarUsuario = express.Router();

modificarUsuario.use(verificar_jwt, (request:any, response:any, next:any)=>{
  
    console.log("middleware modificar");

    //SE RECUPERA EL TOKEN DEL OBJETO DE LA RESPUESTA
    let obj = response.jwt;
    if(obj.usuario.perfil == "propietario" || obj.usuario.perfil == "supervisor"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
        next();
    }
    else{
        return response.status(401).json({
            mensaje:"NO tiene el rol necesario para realizar la acción."
        });
    }   
});
//MODIFICAR
app.post('/usuarios/modificar', modificarUsuario, upload.single("foto"), (request:any, response:any)=>{
    
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.apellido+ obj.nombre + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    let obj_modif : any = {};
    //para excluir la pk (codigo)
    obj_modif.correo = obj.correo;
    obj_modif.clave = obj.clave;
    obj_modif.nombre = obj.nombre;
    obj_modif.apellido = obj.apellido;
    obj_modif.foto = obj.path; //obj.path
    obj_modif.perfil = obj.perfil;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");
        
        conn.query("update usuarios set ? where id = ?", [obj_modif, obj.id], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            if(rows.affectedRows > 0){

                response.status(200).json({
                    exito : true,
                    mensaje : "Usuario modificado en la bd."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "No se encontró el usuario a modificar."
                });
            }
        });
    });
});



//MIDLEWARE ELIMINAR
const bajaUsuario = express.Router();

bajaUsuario.use(verificar_jwt, (request:any, response:any, next:any)=>{

    console.log("middleware baja");

    //SE RECUPERA EL TOKEN DEL OBJETO DE LA RESPUESTA
    let obj = response.jwt;

    if(obj.usuario.perfil == "propietario"){
        //SE INVOCA AL PRÓXIMO CALLEABLE
         next();
    }
    else{
        return response.status(418).json({
            mensaje:"NO tiene el rol necesario para realizar la acción."+JSON.stringify(obj.usuario)
        });
    }
});

//VERBO ELIMINAR
app.delete('/eliminarUsuario',bajaUsuario, (request:any, response:any) => {
    let obj = request.body;

    let path_foto : string = "public/";

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        //obtengo el path de la foto del producto a ser eliminado
        console.log(obj.id);
        conn.query("select foto from usuarios where id = ?", [obj.id], (err:any, result:any)=>{

            if(err) throw("Error en consulta de base de datos.");
            console.log(result);
            console.log(result[0]);
            path_foto += result[0].foto;
        });
    });

    request.getConnection((err:any, conn:any) => {
        if(err) throw new Error("Error al conectarse a la base de datos.");

        conn.query("DELETE FROM usuarios WHERE id = ?", [obj.id], (err:any, result:any) => {
            if(err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }

            if(result.affectedRows > 0){
                fs.unlink(path_foto, (err:any) => {
                    if (err) throw err;
                    console.log(path_foto + ' fue borrado.');
                });
                response.status(200).json({
                    exito : true,
                    mensaje : "Usuario eliminado de la bd."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "No se encontró el usuario a eliminar."
                });
            }
        });
    });
});

// #endregion Usuarios_bd


app.listen(app.get('puerto'), () => {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});