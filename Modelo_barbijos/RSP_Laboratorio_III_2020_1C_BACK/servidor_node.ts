
const express = require('express');

const app = express();

app.set('puerto', 9876);

app.get('/', (request:any, response:any)=>{
    response.redirect('/login');
});

//AGREGO FILE SYSTEM
const fs = require('fs');

//AGREGO JSON
app.use(express.json());

//AGREGO JWT
const jwt = require("jsonwebtoken");

//SE ESTABLECE LA CLAVE SECRETA PARA EL TOKEN
app.set("key", "cl@ve_secreta");

app.use(express.urlencoded({extended:false}));

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
    database: 'productos_usuarios_node'
};

app.use(myconn(mysql, db_options, 'single'));

//##############################################################################################//
//RUTAS PARA LOS MIDDLEWARES DEL JWT
//##############################################################################################//

const verificar_jwt = express.Router();

verificar_jwt.use((request:any, response:any, next:any)=>{

    //SE RECUPERA EL TOKEN DEL ENCABEZADO DE LA PETICIÓN
    let token = request.headers["x-access-token"] || request.headers["authorization"];
    
    if (! token) {
        response.status(401).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }

    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);
    }

    if(token){
        //SE VERIFICA EL TOKEN CON LA CLAVE SECRETA
        jwt.verify(token, app.get("key"), (error:any, decoded:any)=>{

            if(error){
                return response.status(401).json({
                    exito: false,
                    mensaje:"Su sesión ha caducado por favor ingrese nuevamente"//El JWT NO es válido!!!
                });
            }
            else{

                console.log("middleware verificar_jwt");

                //SE AGREGA EL TOKEN AL OBJETO DE LA RESPUESTA
                response.jwt = decoded;
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
        });
    }
});


const verificar_usuario = express.Router();

verificar_usuario.use((request:any, response:any, next:any)=>{

    let obj = request.body;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            if(rows.length == 1){

                response.obj_usuario = rows[0];
                //SE INVOCA AL PRÓXIMO CALLEABLE
                next();
            }
            else{
                response.status(403).json({
                    exito : false,
                    mensaje : "Correo y/o Clave incorrectos.",
                    jwt : null
                });
            }
           
        });
    });
});


//##############################################################################################//
//RUTAS PARA EL SERVIDOR DE AUTENTICACIÓN
//##############################################################################################//

app.post("/login", verificar_usuario, (request:any, response:any, obj:any)=>{

    //SE RECUPERA EL USUARIO DEL OBJETO DE LA RESPUESTA
    const user = response.obj_usuario;

    //SE CREA EL PAYLOAD CON LOS ATRIBUTOS QUE NECESITAMOS
    const payload = { 
        usuario: {
            id : user.id,
            apellido : user.apellido,
            nombre : user.nombre,
            perfil : user.perfil,
            correo : user.correo,
            foto : user.foto
        },
        api : "productos_usuarios",
    };

    //SE FIRMA EL TOKEN CON EL PAYLOAD Y LA CLAVE SECRETA
    const token = jwt.sign(payload, app.get("key"), {
        expiresIn : "5m"
    });

    response.status(200).json({
        exito : true,
        mensaje : "Ingresando...",//JWT creado!!!
        jwt : token
    });

});

//ALTA USUARIO
const verificar_usuario_alta = express.Router();

verificar_usuario_alta.use(upload.single("foto"),(request:any, response:any, next:any)=>{
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


app.post("/usuarios",verificar_usuario_alta ,upload.single("foto"),(request:any, response:any)=>{
    
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


//##############################################################################################//
//RUTAS PARA EL CRUD - CON BD -
//##############################################################################################//

//LISTAR
app.get('/listadoUsuarios', verificar_jwt, (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from usuarios", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

app.get('/listadoBarbijos', verificar_jwt, (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from productos", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            response.send(JSON.stringify(rows));
        });
    });

});

//AGREGAR
const verificar_barbijo_alta = express.Router();

verificar_barbijo_alta.use(verificar_jwt,(request:any, response:any, next:any)=>{
    let obj = request.body;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from productos where color = ? and tipo = ? and precio = ?", [obj.color,obj.tipo,obj.precio], (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos-VERIFICAR-BARBIJO.");

            if(rows.length == 0){
                response.obj = obj;
                next();
            }
            else{
                response.status(401).json({
                    exito : false,
                    repetido: true,
                    mensaje : "El barbijo ya se encuentra en la bd.",
                    jwt : null
                });
            }
           
        });
    });
});

app.post("/altaBarbijo",verificar_barbijo_alta,(request:any, response:any)=>{
    
    let obj = response.obj;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("insert into productos set ?", [obj], (err:any, result:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos-ALTABARBIJO.");}

            if(result.affectedRows === 1){

                response.status(200).json({
                    exito : true,
                    mensaje : "Barbijo agregado."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "Error alta de barbijo."
                });
            }
        });
    });

});


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

// MODIFICAR
app.put('/modificarBarbijo',modificar, (request:any, response:any) => {
    let obj = request.body;
    let obj_modif: any = {};
    
    // Excluir la clave primaria (código)
    obj_modif.color = obj.color;
    obj_modif.tipo = obj.tipo;
    obj_modif.precio = obj.precio;

    request.getConnection((err:any, conn:any) => {
        if(err) throw new Error("Error al conectarse a la base de datos.");

        conn.query("UPDATE productos SET ? WHERE id = ?", [obj_modif, obj.id], (err:any, result:any) => {
            if(err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }

            if(result.affectedRows > 0){

                response.status(200).json({
                    exito : true,
                    mensaje : "Barbijo modificado en la bd."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "No se encontró el barbijo a modificar."
                });
            }
        });
    });
});


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
app.delete('/eliminarBarbijo',baja, (request:any, response:any) => {
    let obj = request.body;
    
    request.getConnection((err:any, conn:any) => {
        if(err) throw new Error("Error al conectarse a la base de datos.");

        conn.query("DELETE FROM productos WHERE id = ?", [obj.id], (err:any, result:any) => {
            if(err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }

            if(result.affectedRows > 0){

                response.status(200).json({
                    exito : true,
                    mensaje : "Barbijo eliminado de la bd."
                });
            }
            else{
                response.status(418).json({
                    exito : false,
                    mensaje : "No se encontró el barbijo a eliminar."
                });
            }
        });
    });
});



app.listen(app.get('puerto'), ()=>{
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});