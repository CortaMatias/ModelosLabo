"use strict";
var express = require('express');
var app = express();
app.set('puerto', 9876);
app.get('/', function (request, response) {
    response.send('GET - servidor NodeJS');
});
var fs = require('fs');
app.use(express.json());
var jwt = require("jsonwebtoken");
app.set("key", "cl@ve_secreta");
app.use(express.urlencoded({ extended: false }));
var multer = require('multer');
var mime = require('mime-types');
var storage = multer.diskStorage({
    destination: "public/fotos/",
});
var upload = multer({
    storage: storage
});
var cors = require("cors");
app.use(cors());
app.use(express.static("public"));
var mysql = require('mysql');
var myconn = require('express-myconnection');
var db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'concesionaria_bd'
};
app.use(myconn(mysql, db_options, 'single'));
var verificar_usuario = express.Router();
verificar_usuario.use(function (request, response, next) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("SELECT * FROM usuarios WHERE correo = ? AND clave = ?", [obj.correo, obj.clave], function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length > 0) {
                response.obj_usuario = rows[0];
                next();
            }
            else {
                response.status(401).json({
                    exito: false,
                    mensaje: "No se encontro un usuario con esa clave y contraseña",
                    jwt: null
                });
            }
        });
    });
});
app.post("/login", verificar_usuario, function (request, response) {
    var user = response.obj_usuario;
    var payload = {
        usuario: {
            id: user.id,
            apellido: user.apellido,
            nombre: user.nombre,
            perfil: user.perfil,
            foto: user.foto
        },
        api: "concesionaria_usuarios",
    };
    var token = jwt.sign(payload, app.get("key"), {
        expiresIn: "5m"
    });
    response.json({
        exito: true,
        mensaje: "JWT creado!!!",
        jwt: token
    });
});
var verificar_jwt = express.Router();
verificar_jwt.use(function (request, response, next) {
    var token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        return response.status(401).json({
            error: "El JWT es requerido!!!"
        });
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), function (error, decoded) {
            if (error) {
                return response.status(403).json({
                    exito: false,
                    mensaje: "El JWT NO es válido!!!"
                });
            }
            else {
                response.jwt = decoded;
                next();
            }
        });
    }
});
app.get('/verificar_token', verificar_jwt, function (request, response) {
    response.json({ exito: true, jwt: response.jwt });
});
app.get('/productos_bd', verificar_jwt, function (request, response) {
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from autos", function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
var verificar_auto = express.Router();
verificar_auto.use(verificar_jwt, function (request, response, next) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from autos where color = ? and modelo = ? and marca = ?", [obj.color, obj.modelo, obj.marca], function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos VERIFICAR AUTO.");
            if (rows.length == 0) {
                response.obj = obj;
                next();
            }
            else {
                response.status(401).json({
                    exito: false,
                    repetido: true,
                    mensaje: "El Auto ya se encuentra en la bd.",
                    jwt: null
                });
            }
        });
    });
});
app.post("/altaAuto", verificar_auto, function (request, response) {
    var obj = response.obj;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into autos set ?", [obj], function (err, result) {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos-ALTA AUTO.");
            }
            if (result.affectedRows === 1) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Auto agregado."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "Error alta de Auto."
                });
            }
        });
    });
});
var modificar = express.Router();
modificar.use(verificar_jwt, function (request, response, next) {
    console.log("middleware modificar");
    var obj = response.jwt;
    if (obj.usuario.perfil == "propietario" || obj.usuario.perfil == "supervisor") {
        next();
    }
    else {
        return response.status(418).json({
            mensaje: "NO tiene el rol necesario para realizar la acción." + JSON.stringify(obj.usuario)
        });
    }
});
app.put('/modificarAuto', modificar, function (request, response) {
    var obj = request.body;
    var obj_modif = {};
    obj_modif.color = obj.color;
    obj_modif.marca = obj.marca;
    obj_modif.precio = obj.precio;
    obj_modif.modelo = obj.modelo;
    request.getConnection(function (err, conn) {
        if (err)
            throw new Error("Error al conectarse a la base de datos.");
        conn.query("UPDATE autos SET ? WHERE id = ?", [obj_modif, obj.id], function (err, result) {
            if (err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }
            if (result.affectedRows > 0) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Auto modificado en la bd."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "No se encontró el Auto a modificar."
                });
            }
        });
    });
});
var baja = express.Router();
baja.use(verificar_jwt, function (request, response, next) {
    console.log("middleware baja");
    var obj = response.jwt;
    if (obj.usuario.perfil == "propietario") {
        next();
    }
    else {
        return response.status(418).json({
            mensaje: "NO tiene el rol necesario para realizar la acción." + JSON.stringify(obj.usuario)
        });
    }
});
app.delete('/eliminarAuto', baja, function (request, response) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw new Error("Error al conectarse a la base de datos.");
        conn.query("DELETE FROM autos WHERE id = ?", [obj.id], function (err, result) {
            if (err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }
            if (result.affectedRows > 0) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Auto eliminado de la bd."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "No se encontró el Auto a eliminar."
                });
            }
        });
    });
});
app.get('/listadoUsuarios', verificar_jwt, function (request, response) {
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios", function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
var verificar_correo_usuario = express.Router();
verificar_correo_usuario.use(upload.single("foto"), function (request, response, next) {
    var file = request.file;
    var extension = mime.extension(file.mimetype);
    var obj = JSON.parse(request.body.obj);
    var path = file.destination + obj.apellido + obj.nombre + "." + extension;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios where correo = ?", [obj.correo], function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length == 0) {
                response.exito = true;
                response.obj = obj;
                response.path = path;
                response.file = file;
                next();
            }
            else {
                response.status(401).json({
                    exito: false,
                    mensaje: "El usuario ya se encuentra registrado.",
                    jwt: null
                });
            }
        });
    });
});
app.post("/usuarios", verificar_correo_usuario, upload.single("foto"), function (request, response) {
    var path = response.path;
    var obj = response.obj;
    var file = response.file;
    fs.renameSync(file.path, path);
    obj.foto = path.split("public/")[1];
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into usuarios set ?", [obj], function (err, result) {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            if (result.affectedRows === 1) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Usuario agregado."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "Error alta de usuario."
                });
            }
        });
    });
});
var modificarUsuario = express.Router();
modificarUsuario.use(verificar_jwt, function (request, response, next) {
    console.log("middleware modificar");
    var obj = response.jwt;
    if (obj.usuario.perfil == "propietario" || obj.usuario.perfil == "supervisor") {
        next();
    }
    else {
        return response.status(401).json({
            mensaje: "NO tiene el rol necesario para realizar la acción."
        });
    }
});
app.post('/usuarios/modificar', modificarUsuario, upload.single("foto"), function (request, response) {
    var file = request.file;
    var extension = mime.extension(file.mimetype);
    var obj = JSON.parse(request.body.obj);
    var path = file.destination + obj.apellido + obj.nombre + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    var obj_modif = {};
    obj_modif.correo = obj.correo;
    obj_modif.clave = obj.clave;
    obj_modif.nombre = obj.nombre;
    obj_modif.apellido = obj.apellido;
    obj_modif.foto = obj.path;
    obj_modif.perfil = obj.perfil;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("update usuarios set ? where id = ?", [obj_modif, obj.id], function (err, rows) {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            if (rows.affectedRows > 0) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Usuario modificado en la bd."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "No se encontró el usuario a modificar."
                });
            }
        });
    });
});
var bajaUsuario = express.Router();
bajaUsuario.use(verificar_jwt, function (request, response, next) {
    console.log("middleware baja");
    var obj = response.jwt;
    if (obj.usuario.perfil == "propietario") {
        next();
    }
    else {
        return response.status(418).json({
            mensaje: "NO tiene el rol necesario para realizar la acción." + JSON.stringify(obj.usuario)
        });
    }
});
app.delete('/eliminarUsuario', bajaUsuario, function (request, response) {
    var obj = request.body;
    var path_foto = "public/";
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        console.log(obj.id);
        conn.query("select foto from usuarios where id = ?", [obj.id], function (err, result) {
            if (err)
                throw ("Error en consulta de base de datos.");
            console.log(result);
            console.log(result[0]);
            path_foto += result[0].foto;
        });
    });
    request.getConnection(function (err, conn) {
        if (err)
            throw new Error("Error al conectarse a la base de datos.");
        conn.query("DELETE FROM usuarios WHERE id = ?", [obj.id], function (err, result) {
            if (err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }
            if (result.affectedRows > 0) {
                fs.unlink(path_foto, function (err) {
                    if (err)
                        throw err;
                    console.log(path_foto + ' fue borrado.');
                });
                response.status(200).json({
                    exito: true,
                    mensaje: "Usuario eliminado de la bd."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "No se encontró el usuario a eliminar."
                });
            }
        });
    });
});
app.listen(app.get('puerto'), function () {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor_node.js.map