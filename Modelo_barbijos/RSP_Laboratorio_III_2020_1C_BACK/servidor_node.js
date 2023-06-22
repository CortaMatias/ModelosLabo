"use strict";
var express = require('express');
var app = express();
app.set('puerto', 9876);
app.get('/', function (request, response) {
    response.redirect('/login');
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
    database: 'productos_usuarios_node'
};
app.use(myconn(mysql, db_options, 'single'));
var verificar_jwt = express.Router();
verificar_jwt.use(function (request, response, next) {
    var token = request.headers["x-access-token"] || request.headers["authorization"];
    if (!token) {
        response.status(401).send({
            error: "El JWT es requerido!!!"
        });
        return;
    }
    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    if (token) {
        jwt.verify(token, app.get("key"), function (error, decoded) {
            if (error) {
                return response.status(401).json({
                    exito: false,
                    mensaje: "Su sesión ha caducado por favor ingrese nuevamente"
                });
            }
            else {
                console.log("middleware verificar_jwt");
                response.jwt = decoded;
                next();
            }
        });
    }
});
var verificar_usuario = express.Router();
verificar_usuario.use(function (request, response, next) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from usuarios where correo = ? and clave = ? ", [obj.correo, obj.clave], function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            if (rows.length == 1) {
                response.obj_usuario = rows[0];
                next();
            }
            else {
                response.status(403).json({
                    exito: false,
                    mensaje: "Correo y/o Clave incorrectos.",
                    jwt: null
                });
            }
        });
    });
});
app.post("/login", verificar_usuario, function (request, response, obj) {
    var user = response.obj_usuario;
    var payload = {
        usuario: {
            id: user.id,
            apellido: user.apellido,
            nombre: user.nombre,
            perfil: user.perfil,
            correo: user.correo,
            foto: user.foto
        },
        api: "productos_usuarios",
    };
    var token = jwt.sign(payload, app.get("key"), {
        expiresIn: "5m"
    });
    response.status(200).json({
        exito: true,
        mensaje: "Ingresando...",
        jwt: token
    });
});
var verificar_usuario_alta = express.Router();
verificar_usuario_alta.use(upload.single("foto"), function (request, response, next) {
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
app.post("/usuarios", verificar_usuario_alta, upload.single("foto"), function (request, response) {
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
app.get('/listadoBarbijos', verificar_jwt, function (request, response) {
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from productos", function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
var verificar_barbijo_alta = express.Router();
verificar_barbijo_alta.use(verificar_jwt, function (request, response, next) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from productos where color = ? and tipo = ? and precio = ?", [obj.color, obj.tipo, obj.precio], function (err, rows) {
            if (err)
                throw ("Error en consulta de base de datos-VERIFICAR-BARBIJO.");
            if (rows.length == 0) {
                response.obj = obj;
                next();
            }
            else {
                response.status(401).json({
                    exito: false,
                    repetido: true,
                    mensaje: "El barbijo ya se encuentra en la bd.",
                    jwt: null
                });
            }
        });
    });
});
app.post("/altaBarbijo", verificar_barbijo_alta, function (request, response) {
    var obj = response.obj;
    request.getConnection(function (err, conn) {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into productos set ?", [obj], function (err, result) {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos-ALTABARBIJO.");
            }
            if (result.affectedRows === 1) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Barbijo agregado."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "Error alta de barbijo."
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
app.put('/modificarBarbijo', modificar, function (request, response) {
    var obj = request.body;
    var obj_modif = {};
    obj_modif.color = obj.color;
    obj_modif.tipo = obj.tipo;
    obj_modif.precio = obj.precio;
    request.getConnection(function (err, conn) {
        if (err)
            throw new Error("Error al conectarse a la base de datos.");
        conn.query("UPDATE productos SET ? WHERE id = ?", [obj_modif, obj.id], function (err, result) {
            if (err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }
            if (result.affectedRows > 0) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Barbijo modificado en la bd."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "No se encontró el barbijo a modificar."
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
app.delete('/eliminarBarbijo', baja, function (request, response) {
    var obj = request.body;
    request.getConnection(function (err, conn) {
        if (err)
            throw new Error("Error al conectarse a la base de datos.");
        conn.query("DELETE FROM productos WHERE id = ?", [obj.id], function (err, result) {
            if (err) {
                console.log(err);
                throw new Error("Error en consulta de base de datos.");
            }
            if (result.affectedRows > 0) {
                response.status(200).json({
                    exito: true,
                    mensaje: "Barbijo eliminado de la bd."
                });
            }
            else {
                response.status(418).json({
                    exito: false,
                    mensaje: "No se encontró el barbijo a eliminar."
                });
            }
        });
    });
});
app.listen(app.get('puerto'), function () {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor_node.js.map