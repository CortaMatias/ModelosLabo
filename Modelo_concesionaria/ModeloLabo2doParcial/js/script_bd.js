"use strict";
$(function () {
    VerificarJWT();
    AdministrarVerificarJWT();
    AdministrarLogout();
    AdministrarListarAuto();
    AdministrarAgregar();
    AdministrarListarUsuarios();
});
function ObtenerListadoUsuarios() {
    $("#divResultado").html("");
    var jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "listadoUsuarios",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado) {
        console.log(resultado);
        var tabla = ArmarTablaUsuarios(resultado);
        $("#divResultado").html(tabla).show(1000);
        $('[data-action="modificarUsuario"]').on('click', function (e) {
            var obj_prod_string = $(this).attr("data-obj_prod");
            var obj_prod = JSON.parse(obj_prod_string);
            var formulario = MostrarFormUsuarios("modificacion", obj_prod);
            $("#cuerpo_modal_prod").html(formulario);
        });
        $('[data-action="eliminarUsuario"]').on('click', function (e) {
            var obj_prod_string = $(this).attr("data-obj_prod");
            var obj_prod = JSON.parse(obj_prod_string);
            var formulario = MostrarFormUsuarios("baja", obj_prod);
            $("#cuerpo_modal_prod").html(formulario);
        });
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        var retorno = JSON.parse(jqXHR.responseText);
        var alerta = ArmarAlert(retorno.mensaje + " ,redirigiendo al login", "danger");
        $("#divResultado").html(alerta).show(2000);
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "index.html");
        }, 2000);
    });
}
function AdministrarListarUsuarios() {
    $("#listar_usuarios").on("click", function () {
        ObtenerListadoUsuarios();
    });
}
function MostrarFormUsuarios(accion, obj_prod) {
    if (obj_prod === void 0) { obj_prod = null; }
    var funcion = "";
    var textoBoton = "";
    var habilitarLimpiar = "";
    switch (accion) {
        case "alta":
            funcion = 'AgregarUsuario(event)';
            textoBoton = "Registrar";
            break;
        case "baja":
            funcion = 'EliminarUsuario(event)';
            textoBoton = "Baja";
            habilitarLimpiar = "disabled";
            break;
        case "modificacion":
            funcion = 'ModificarUsuario(event)';
            textoBoton = "Modificar";
            break;
    }
    var correo = "";
    var clave = "";
    var nombre = "";
    var apellido = "";
    var perfil = "";
    var id = "";
    if (obj_prod !== null) {
        correo = obj_prod.correo;
        nombre = obj_prod.nombre;
        apellido = obj_prod.apellido;
        perfil = obj_prod.perfil;
        id = obj_prod.id;
    }
    var form = "\n      <div class=\"container-fluid\">\n        <div class=\"row\">\n          <div class=\"col-md-4\"></div>\n          <div class=\"col-md-4\">\n            <br><br><br><br><br><br><br><br>\n          </div>\n          <div class=\"col-md-4\"></div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-md-4\"></div>\n          <div class=\"col-md-4\">\n            <div class=\"row\">\n              <div class=\"col-md-12\">\n                <h3 class=\"titulo\">REGISTRO</h3>\n              </div>\n            </div>\n            <div class=\"row\">\n              <div class=\"col-md-12\">\n                <form role=\"form\">\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-id\"></i></span>\n                      <input type=\"text\" name=\"id\" id=\"id\" placeholder=\"ID\" class=\"form-control\" value=\"".concat(id, "\" readonly/>\n                    </div>\n                  </div>\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-envelope\"></i></span>\n                      <input type=\"email\" name=\"correo\" id=\"correo\" placeholder=\"Correo\" class=\"form-control\" value=\"").concat(correo, "\" />\n                    </div>\n                  </div>\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-key\"></i></span>\n                      <input type=\"password\" name=\"clave\" id=\"clave\" class=\"form-control\" placeholder=\"Clave\" />\n                    </div>\n                  </div>\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-user\"></i></span>\n                      <input type=\"text\" name=\"nombre\" id=\"nombre\" placeholder=\"Nombre\" class=\"form-control\" value=\"").concat(nombre, "\" />\n                    </div>\n                  </div>\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-user\"></i></span>\n                      <input type=\"text\" name=\"apellido\" id=\"apellido\" class=\"form-control\" placeholder=\"Apellido\" value=\"").concat(apellido, "\" />\n                    </div>\n                  </div>\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-id-card\"></i></span>\n                      <select name=\"perfil\" id=\"perfil\" class=\"form-control\">\n                        <option value=\"\">Seleccionar perfil</option>\n                        <option value=\"propietario\"").concat(perfil === 'propietario' ? ' selected' : '', ">Propietario</option>\n                        <option value=\"empleado\"").concat(perfil === 'empleado' ? ' selected' : '', ">Empleado</option>\n                        <option value=\"supervisor\"").concat(perfil === 'supervisor' ? ' selected' : '', ">Supervisor</option>\n                      </select>\n                    </div>\n                  </div>\n                  <div class=\"form-group\">\n                    <div class=\"input-group\">\n                      <span class=\"input-group-addon\"><i class=\"fas fa-camera\"></i></span>\n                      <input type=\"file\" id=\"foto\" name=\"foto\" class=\"form-control\">\n                    </div>\n                  </div>\n                  <div class=\"row\">\n                    <div class=\"col-md-6\">\n                      <div class=\"row\">\n                        <div class=\"col-md-2\"></div>\n                        <div class=\"col-md-8\">\n                          <button type=\"button\" id=\"btnRegistrar\" class=\"btn btn-success btn-block\" onclick=\"").concat(funcion, "\">\n                            ").concat(textoBoton, "\n                          </button>\n                        </div>\n                        <div class=\"col-md-2\"></div>\n                      </div>\n                    </div>\n                    <div class=\"col-md-6\">\n                      <div class=\"row\">\n                        <div class=\"col-md-2\"></div>\n                        <div class=\"col-md-8\">\n                          <button type=\"reset\" class=\"btn btn-warning btn-block\" ").concat(habilitarLimpiar, ">\n                            Limpiar\n                          </button>\n                        </div>\n                        <div class=\"col-md-2\"></div>\n                      </div>\n                    </div>\n                  </div>\n                  <br><br>\n                  <div id=\"div_mensaje\"></div>\n                </form>\n              </div>\n            </div>\n          </div>\n          <div class=\"col-md-4\"></div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-md-4\"></div>\n          <div class=\"col-md-4\"></div>\n          <div class=\"col-md-4\"></div>\n        </div>        \n      </div>\n      <div id=\"div_mensaje\"></div>");
    return form;
}
function ArmarTablaUsuarios(productos) {
    var tabla = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>CORREO</th><th>NOMBRE</th><th>APELLIDO</th><th>PERFIL</th><th>FOTO</th><th>ACCIONES</th></tr>';
    if (productos.length === 0) {
        tabla += '<tr><td colspan="6">---</td></tr>';
    }
    else {
        productos.forEach(function (prod) {
            var objProdString = JSON.stringify(prod);
            tabla += "<tr>\n                    <td>".concat(prod.id, "</td>\n                    <td>").concat(prod.correo, "</td>\n                    <td>").concat(prod.nombre, "</td>\n                    <td>").concat(prod.apellido, "</td>\n                    <td>").concat(prod.perfil, "</td>\n                    <td><img src=\"").concat(URL_API).concat(prod.foto, "\" width=\"50px\" height=\"50px\"></td>\n                    <td>\n                      <button class=\"btn-modificar\" data-action='modificarUsuario' data-obj_prod='").concat(objProdString, "' data-toggle='modal' data-target='#ventana_modal_prod'><i class=\"fas fa-edit\"></i></button>\n                      <button class=\"btn-eliminar\" data-action='eliminarUsuario' data-obj_prod='").concat(objProdString, "' data-toggle='modal' data-target='#ventana_modal_prod'><i class=\"fas fa-times\"></i></button>\n                    </td>\n                  </tr>");
        });
    }
    tabla += '</table>';
    return tabla;
}
function ModificarUsuario(e) {
    e.preventDefault();
    var correo = $("#correo").val();
    var clave = $("#clave").val();
    var nombre = $("#nombre").val();
    var apellido = $("#apellido").val();
    var id = $("#id").val();
    var foto = document.getElementById("foto");
    var perfil = $("#perfil").val();
    var form = new FormData();
    form.append("obj", JSON.stringify({ "correo": correo, "apellido": apellido, "nombre": nombre, "perfil": perfil, "clave": clave, "foto": foto, "id": id }));
    form.append("foto", foto.files[0]);
    var jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'POST',
        url: URL_API + "usuarios/modificar",
        dataType: "text",
        cache: false,
        contentType: false,
        processData: false,
        data: form,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_ret) {
        console.log(obj_ret);
        var retorno = JSON.parse(obj_ret);
        var alerta = "";
        alerta = ArmarAlert(retorno.mensaje);
        $("#div_mensaje").html(alerta);
        ObtenerListadoUsuarios();
        setTimeout(function () {
            $("#cuerpo_modal_prod").html("");
        }, 2000);
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
        var retorno = JSON.parse(jqXHR.responseText);
        var alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#div_mensaje").html(alerta);
    });
}
function EliminarUsuario(e) {
    e.preventDefault();
    var correo = $("#correo").val();
    var clave = $("#clave").val();
    var nombre = $("#nombre").val();
    var apellido = $("#apellido").val();
    var id = $("#id").val();
    var foto = document.getElementById("foto");
    var perfil = $("#perfil").val();
    var jwt = localStorage.getItem("jwt");
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        $.ajax({
            type: 'DELETE',
            url: URL_API + "eliminarUsuario",
            dataType: "json",
            data: { "id": id },
            headers: { 'Authorization': 'Bearer ' + jwt },
            async: true
        })
            .done(function (resultado) {
            var retorno = resultado;
            var alerta = "";
            if (retorno.exito) {
                alerta = ArmarAlert(retorno.mensaje);
                $("#div_mensaje").html(alerta);
                ObtenerListadoUsuarios();
                setTimeout(function () {
                    $("#cuerpo_modal_prod").html("");
                }, 2000);
            }
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            var retorno = JSON.parse(jqXHR.responseText);
            var alerta = ArmarAlert(retorno.mensaje, "danger");
            $("#div_mensaje").html(alerta);
        });
    }
    else {
        $("#cuerpo_modal_prod").html("");
    }
}
function AdministrarAgregar() {
    $("#alta_producto").on("click", function () {
        ArmarFormularioAlta();
    });
}
function ArmarFormularioAlta() {
    $("#divResultado").html("");
    var formulario = MostrarForm("alta");
    $("#divResultado").html(formulario).show(1000);
}
function AdministrarListarAuto() {
    $("#listar_producto").on("click", function () {
        ObtenerListadoAutos();
    });
}
function ObtenerListadoAutos() {
    $("#divResultado").html("");
    var jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "productos_bd",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado) {
        console.log(resultado);
        var tabla = ArmarTablaProductos(resultado);
        $("#divResultado").html(tabla).show(1000);
        $('[data-action="modificar"]').on('click', function (e) {
            var obj_prod_string = $(this).attr("data-obj_prod");
            var obj_prod = JSON.parse(obj_prod_string);
            var formulario = MostrarForm("modificacion", obj_prod);
            $("#cuerpo_modal_prod").html(formulario);
        });
        $('[data-action="eliminar"]').on('click', function (e) {
            var obj_prod_string = $(this).attr("data-obj_prod");
            var obj_prod = JSON.parse(obj_prod_string);
            var formulario = MostrarForm("baja", obj_prod);
            $("#cuerpo_modal_prod").html(formulario);
        });
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        var retorno = JSON.parse(jqXHR.responseText);
        var alerta = ArmarAlert(retorno.mensaje + " ,redirigiendo al login", "danger");
        $("#divResultado").html(alerta).show(2000);
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "index.html");
        }, 2000);
    });
}
function ArmarTablaProductos(productos) {
    var tabla = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>Color</th><th>Marca</th><th>Precio</th><th>Modelo</th><th style="width:110px">ACCIONES</th></tr>';
    if (productos.length == 0) {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else {
        productos.forEach(function (prod) {
            tabla += "<tr><td>" + prod.id + "</td><td>" + prod.color + "</td><td>" + prod.marca + "</td><td>" + prod.precio + "</td><td>" + prod.modelo + "</td><th>" +
                "<button  class='btn-info boton' data-action='modificar' data-obj_prod='" + JSON.stringify(prod) + "' title='Modificar'" +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-edit boton'></span></button> " +
                "<button  class='btn-danger boton' data-action='eliminar' data-obj_prod='" + JSON.stringify(prod) + "' title='Eliminar'" +
                " data-toggle='modal' data-target='#ventana_modal_prod'><span class='fas fa-times boton'></span></button>" +
                "</td></tr>";
        });
    }
    tabla += "</table>";
    return tabla;
}
function MostrarForm(accion, obj_prod) {
    if (obj_prod === void 0) { obj_prod = null; }
    var funcion = "";
    var solo_lectura_select = "";
    var solo_lectura = "";
    var solo_lectura_pk = "";
    var textoBoton = "";
    var habilitarLimpiar = "";
    switch (accion) {
        case "alta":
            funcion = 'Agregar(event)';
            textoBoton = "Alta";
            break;
        case "baja":
            funcion = 'Eliminar(event)';
            solo_lectura = "readonly";
            solo_lectura_select = "disabled";
            solo_lectura_pk = "readonly";
            textoBoton = "Baja";
            habilitarLimpiar = "disabled";
            break;
        case "modificacion":
            funcion = 'Modificar(event)';
            textoBoton = "Modificar";
            break;
    }
    var id = "";
    var color = "";
    var marca = "";
    var precio = "";
    var modelo = "";
    if (obj_prod !== null) {
        id = obj_prod.id;
        color = obj_prod.color;
        marca = obj_prod.marca;
        precio = obj_prod.precio;
        modelo = obj_prod.modelo;
    }
    var form = "<div class=\"row justify-content-center\">\n    <div class=\"col-md-8\">\n        <form id=\"myForm\">\n            <div class=\"form-group\">\n                <div class=\"input-group\">\n                    <div class=\"input-group-prepend\">\n                        <span class=\"input-group-text\"><i class=\"fas fa-id\">ID</i></span>\n                    </div>\n                    <input type=\"text\" class=\"form-control\" name=\"id\" id=\"id\" value=\"".concat(id, "\" readonly required>\n                </div>\n            </div>\n            <div class=\"form-group\">\n                <div class=\"input-group\">\n                    <div class=\"input-group-prepend\">\n                        <span class=\"input-group-text\"><i class=\"fas fa-palette\"></i></span>\n                    </div>\n                    <input type=\"text\" name=\"color\" id=\"color\" placeholder=\"Color\" class=\"form-control\" value=\"").concat(color, "\" ").concat(solo_lectura_pk, " required />\n                </div>\n            </div>\n            <div class=\"form-group\">\n                <div class=\"input-group\">\n                    <div class=\"input-group-prepend\">\n                        <span class=\"input-group-text\"><i class=\"bi bi-tag\"></i></span>\n                    </div>\n                    <input type=\"text\" name=\"marca\" id=\"marca\" placeholder=\"Marca\" class=\"form-control\" value=\"").concat(marca, "\" ").concat(solo_lectura_pk, " required />\n                </div>\n            </div>\n            <div class=\"form-group\">\n                <div class=\"input-group\">\n                    <div class=\"input-group-prepend\">\n                        <span class=\"input-group-text\"><i class=\"fas fa-dollar-sign\"></i></span>\n                    </div>\n                    <input type=\"number\" name=\"precio\" id=\"precio\" placeholder=\"Precio\" class=\"form-control\" value=\"").concat(precio, "\" ").concat(solo_lectura, " required />\n                </div>\n            </div>\n            <div class=\"form-group\">\n                <div class=\"input-group\">\n                    <div class=\"input-group-prepend\">\n                        <span class=\"input-group-text\"><i class=\"bi bi-pen\"></i></span>\n                    </div>\n                    <input type=\"text\" name=\"modelo\" id=\"modelo\" placeholder=\"Modelo\" class=\"form-control\" value=\"").concat(modelo, "\" ").concat(solo_lectura_pk, " required />\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col-md-6\">\n                    <div class=\"row\">\n                        <div class=\"col-md-2\"></div>\n                        <div class=\"col-md-8\">\n                            <button type=\"button\" id=\"btnRegistrar\" class=\"btn btn-success btn-block\" onclick=\"").concat(funcion, "\">\n                                ").concat(textoBoton, "\n                            </button>\n                        </div>\n                        <div class=\"col-md-2\"></div>\n                    </div>\n                </div>\n                <div class=\"col-md-6\">\n                    <div class=\"row\">\n                        <div class=\"col-md-2\"></div>\n                        <div class=\"col-md-8\">\n                            <button type=\"button\" class=\"btn btn-warning btn-block\" onclick=\"limpiarFormulario()\" ").concat(habilitarLimpiar, ">\n                                Limpiar\n                            </button>\n                        </div>\n                        <div class=\"col-md-2\"></div>\n                    </div>\n                </div>\n            </div>\n            <br>\n            <br>\n            <div id=\"div_mensaje\"></div>\n        </form>\n    </div>\n</div>");
    return form;
}
function Agregar(e) {
    e.preventDefault();
    var color = $("#color").val();
    var modelo = $("#modelo").val();
    var marca = $("#marca").val();
    var precio = $("#precio").val();
    var jwt = localStorage.getItem("jwt");
    var auto = {};
    auto.color = color;
    auto.marca = marca;
    auto.modelo = modelo;
    auto.precio = precio;
    console.log(auto);
    $.ajax({
        type: 'POST',
        url: URL_API + "altaAuto",
        dataType: "json",
        data: auto,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_ret) {
        var retorno = obj_ret;
        var alerta = "";
        if (retorno.exito) {
            alerta = ArmarAlert(retorno.mensaje);
            $("#div_mensaje").html(alerta);
            ObtenerListadoAutos();
            setTimeout(function () {
                $("#cuerpo_modal_prod").html("");
            }, 3000);
        }
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        var retorno = JSON.parse(jqXHR.responseText);
        var alerta = ArmarAlert(retorno.mensaje, "danger");
        if (!retorno.repetido) {
            alerta = ArmarAlert(retorno.mensaje + " redirigiendo al login", "danger");
            setTimeout(function () {
                $(location).attr('href', URL_BASE + "login.html");
            }, 2000);
        }
        $("#div_mensaje").html(alerta);
    });
}
function Modificar(e) {
    e.preventDefault();
    var color = $("#color").val();
    var id = $("#id").val();
    var modelo = $("#modelo").val();
    var marca = $("#marca").val();
    var precio = $("#precio").val();
    var jwt = localStorage.getItem("jwt");
    var auto = {};
    auto.color = color;
    auto.marca = marca;
    auto.modelo = modelo;
    auto.id = id;
    auto.precio = precio;
    console.log(auto);
    $.ajax({
        type: 'PUT',
        url: URL_API + "modificarAuto",
        dataType: "json",
        data: auto,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado) {
        var retorno = resultado;
        var alerta = "";
        if (retorno.exito) {
            alerta = ArmarAlert(retorno.mensaje);
            $("#div_mensaje").html(alerta);
            ObtenerListadoAutos();
            setTimeout(function () {
                $("#cuerpo_modal_prod").html("");
            }, 2000);
        }
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        var retorno = JSON.parse(jqXHR.responseText);
        console.log(retorno);
        var alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#div_mensaje").html(alerta);
    });
}
function Eliminar(e) {
    e.preventDefault();
    var color = $("#color").val();
    var id = $("#id").val();
    var modelo = $("#modelo").val();
    var marca = $("#marca").val();
    var precio = $("#precio").val();
    var jwt = localStorage.getItem("jwt");
    var auto = {};
    auto.color = color;
    auto.marca = marca;
    auto.modelo = modelo;
    auto.id = id;
    auto.precio = precio;
    console.log(auto);
    if (confirm("¿Estás seguro de que deseas eliminar este barbijo?")) {
        $.ajax({
            type: 'DELETE',
            url: URL_API + "eliminarAuto",
            dataType: "json",
            data: auto,
            headers: { 'Authorization': 'Bearer ' + jwt },
            async: true
        })
            .done(function (resultado) {
            var retorno = resultado;
            var alerta = "";
            if (retorno.exito) {
                alerta = ArmarAlert(retorno.mensaje);
                $("#div_mensaje").html(alerta);
                ObtenerListadoAutos();
                setTimeout(function () {
                    $("#cuerpo_modal_prod").html("");
                }, 2000);
            }
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            var retorno = JSON.parse(jqXHR.responseText);
            var alerta = ArmarAlert(retorno.mensaje, "danger");
            $("#div_mensaje").html(alerta);
        });
    }
    else {
        $("#cuerpo_modal_prod").html("");
    }
}
function VerificarJWT() {
    var jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "verificar_token",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_rta) {
        console.log(obj_rta);
        if (obj_rta.exito) {
            var app = obj_rta.jwt.api;
            var usuario = obj_rta.jwt.usuario;
            var alerta = ArmarAlert(app + "<br>" + JSON.stringify(usuario));
            $("#divResultado").html(alerta).toggle(2000);
            $("#rol").html(usuario.perfil);
        }
        else {
            var alerta = ArmarAlert(obj_rta.mensaje, "danger");
            $("#divResultado").html(alerta).toggle(2000);
            setTimeout(function () {
                $(location).attr('href', URL_BASE + "index.html");
            }, 2000);
        }
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        var retorno = JSON.parse(jqXHR.responseText);
        var alerta = ArmarAlert(retorno.mensaje, "danger");
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "index.html");
        }, 2000);
        $("#divResultado").html(alerta).show(2000);
    });
}
function AdministrarVerificarJWT() {
    $("#verificarJWT").on("click", function () {
        VerificarJWT();
    });
}
function AdministrarLogout() {
    $("#logout").on("click", function () {
        localStorage.removeItem("jwt");
        var alerta = ArmarAlert('Usuario deslogueado!');
        $("#divResultado").html(alerta).show(2000);
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "index.html");
        }, 1500);
    });
}
//# sourceMappingURL=script_bd.js.map