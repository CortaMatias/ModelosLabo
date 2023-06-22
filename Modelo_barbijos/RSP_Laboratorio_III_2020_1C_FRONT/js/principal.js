"use strict";
$(function () {
    $("#btnAltaBarbijo").on("click", function (e) {
        var formulario = MostrarForm("alta");
        $("#cuerpo_modal_prod").html(formulario);
    });
    $("#btnUsuarios").on("click", function (e) {
        $("#cuerpo_modal_prod").html("");
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
            $("#cuerpo_modal_prod").html(tabla).show(1000);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            var retorno = JSON.parse(jqXHR.responseText);
            var alerta = ArmarAlert(retorno.mensaje + " ,redirigiendo al login", "danger");
            $("#divResultado").html(alerta).show(2000);
            setTimeout(function () {
                $(location).attr('href', URL_BASE + "login.html");
            }, 2000);
        });
    });
    $("#btnBarbijos").on("click", function (e) {
        ObtenerListadoBarbijos();
    });
    $("#btnMap").on("click", function (e) {
        $("#tablaBarbijos").html("");
        var jwt = localStorage.getItem("jwt");
        $.ajax({
            type: 'GET',
            url: URL_API + "listadoBarbijos",
            dataType: "json",
            data: {},
            headers: { 'Authorization': 'Bearer ' + jwt },
            async: true
        })
            .done(function (resultado) {
            console.log(resultado);
            var filtrados = resultado.filter(function (prod) { return prod.precio >= 500; });
            var tabla = ArmarTablaBarbijos(filtrados);
            $("#tablaBarbijos").html(tabla).show(1000);
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
            var alerta = ArmarAlert(retorno.mensaje + " redirigiendo al login", "danger");
            $("#divResultado").html(alerta).show(2000);
            setTimeout(function () {
                $(location).attr('href', URL_BASE + "login.html");
            }, 2000);
        });
    });
});
function ObtenerListadoBarbijos() {
    $("#tablaBarbijos").html("");
    var jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "listadoBarbijos",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado) {
        console.log(resultado);
        var tabla = ArmarTablaBarbijos(resultado);
        $("#tablaBarbijos").html(tabla).show(1000);
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
        var alerta = ArmarAlert(retorno.mensaje + " redirigiendo al login", "danger");
        $("#divResultado").html(alerta).show(2000);
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "login.html");
        }, 2000);
    });
}
function ArmarTablaBarbijos(productos) {
    var tabla = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>COLOR</th><th>TIPO</th><th>PRECIO</th><th style="width:110px">ACCIONES</th></tr>';
    if (productos.length == 0) {
        tabla += '<tr><th>---</th><th>---</th><th>---</th><th>---</th></tr>';
    }
    else {
        productos.forEach(function (prod) {
            tabla += "<tr><td>" + prod.color + "</td><td>" + prod.tipo + "</td><td>" + prod.precio + "</td><th>" +
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
function ArmarTablaUsuarios(productos) {
    var tabla = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>CORREO</th><th>NOMBRE</th><th>APELLIDO</th><th>PERFIL</th><th>FOTO</th></tr>';
    if (productos.length == 0) {
        tabla += '<tr><th>---</th><th>---</th><th>---</th><th>---</th><th>---</th></tr>';
    }
    else {
        productos.forEach(function (prod) {
            tabla += "<tr><td>" + prod.correo + "</td><td>" + prod.nombre + "</td><td>" + prod.apellido + "</td><td>" + prod.perfil + "</td>" +
                "<td><img src='" + URL_API + prod.foto + "' width='50px' height='50px'></td><th>" +
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
    var tipo = "";
    var precio = "";
    if (obj_prod !== null) {
        id = obj_prod.id;
        color = obj_prod.color;
        tipo = obj_prod.tipo;
        precio = obj_prod.precio;
    }
    var form = '<div class="row justify-content-center">\
                            <div class="col-md-8">\
                                <form id="myForm" >\
                                    <div class="form-group">\
                                        <div class="input-group">\
                                        <span class="input-group-addon"><i class="fas fa-id">ID</i>\
                                        </span>\
                                        <input type="text" class="form-control " name="id" id="id" value="' + id + '" readonly required>\
                                        </div>\
                                    </div>\
                                    <div class="form-group">\
                                        <div class="input-group">\
                                            <span class="input-group-addon"><i class="fas fa-palette"></i>\
                                            </span>\
                                            <input type="text" name="color" id="color" placeholder="Color" class="form-control" value="' + color + '" ' + solo_lectura_pk + ' required />\
                                        </div>\
                                    </div>\
                                    <div class="form-group">\
                                        <div class="input-group">\
                                            <span class="input-group-addon"><i class="fas fa-list"></i></span>\
                                            <select name="tipo" id="tipo" class="form-control" ' + solo_lectura_select + ' required>\
                                                <option value="" ' + (tipo === "" ? 'selected' : '') + '>Tipo</option>\
                                                <option value="liso" ' + (tipo === "liso" ? 'selected' : '') + '>Liso</option>\
                                                <option value="estampado" ' + (tipo === "estampado" ? 'selected' : '') + '>Estampado</option>\
                                                <option value="transparente" ' + (tipo === "transparente" ? 'selected' : '') + '>Transparente</option>\
                                            </select>\
                                        </div>\
                                    </div>\
                                    <div class="form-group">\
                                        <div class="input-group">\
                                            <span class="input-group-addon"><i class="fas fa-dollar-sign"></i>\
                                            </span>\
                                            <input type="number" name="precio" id="precio" placeholder="Precio" class="form-control" value="' + precio + '" ' + solo_lectura + ' required />\
                                        </div>\
                                    </div>\
                                    <div class="row">\
                                        <div class="col-md-6">\
                                            <div class="row">\
                                                <div class="col-md-2">\
                                                </div>\
                                                <div class="col-md-8">\
                                                    <button type="button" id="btnRegistrar" class="btn btn-success btn-block" onclick="' + funcion + '">\
                                                        ' + textoBoton + '\
                                                    </button>\
                                                </div>\
                                                <div class="col-md-2">\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="col-md-6">\
                                            <div class="row">\
                                                <div class="col-md-2">\
                                                </div>\
                                                <div class="col-md-8">\
                                                    <button type="button" class="btn btn-warning btn-block" onclick="limpiarFormulario()" ' + habilitarLimpiar + '>\
                                                        Limpiar\
                                                    </button>\
                                                </div>\
                                                <div class="col-md-2">\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <br>\
                                    <br>\
                                    <div id="div_mensaje" >\
                                </div>\
                                </form>\
                            </div>\
                    </div>';
    return form;
}
function limpiarFormulario() {
    $("#color").val("");
    $("#tipo").val("");
    $("#precio").val("");
}
function Agregar(e) {
    e.preventDefault();
    var color = $("#color").val();
    var tipo = $("#tipo").val();
    var precio = $("#precio").val();
    var jwt = localStorage.getItem("jwt");
    var barbijo = {};
    barbijo.color = color;
    barbijo.tipo = tipo;
    barbijo.precio = precio;
    $.ajax({
        type: 'POST',
        url: URL_API + "altaBarbijo",
        dataType: "json",
        data: barbijo,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_ret) {
        var retorno = obj_ret;
        var alerta = "";
        if (retorno.exito) {
            alerta = ArmarAlert(retorno.mensaje);
            $("#div_mensaje").html(alerta);
            ObtenerListadoBarbijos();
            setTimeout(function () {
                $("#cuerpo_modal_prod").html("");
            }, 2000);
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
    var id = $("#id").val();
    var color = $("#color").val();
    var tipo = $("#tipo").val();
    var precio = $("#precio").val();
    var jwt = localStorage.getItem("jwt");
    var barbijo = {};
    barbijo.id = id;
    barbijo.color = color;
    barbijo.tipo = tipo;
    barbijo.precio = precio;
    $.ajax({
        type: 'PUT',
        url: URL_API + "modificarBarbijo",
        dataType: "json",
        data: barbijo,
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado) {
        var retorno = resultado;
        var alerta = "";
        if (retorno.exito) {
            alerta = ArmarAlert(retorno.mensaje);
            $("#div_mensaje").html(alerta);
            ObtenerListadoBarbijos();
            setTimeout(function () {
                $("#cuerpo_modal_prod").html("");
            }, 2000);
        }
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
        var retorno = JSON.parse(jqXHR.responseText);
        var alerta = ArmarAlert(retorno.mensaje, "danger");
        $("#divResultado").html(alerta);
    });
}
function Eliminar(e) {
    e.preventDefault();
    var id = $("#id").val();
    var color = $("#color").val();
    var tipo = $("#tipo").val();
    var precio = $("#precio").val();
    var jwt = localStorage.getItem("jwt");
    var barbijo = {};
    barbijo.id = id;
    barbijo.color = color;
    barbijo.tipo = tipo;
    barbijo.precio = precio;
    if (confirm("¿Estás seguro de que deseas eliminar este barbijo?")) {
        $.ajax({
            type: 'DELETE',
            url: URL_API + "eliminarBarbijo",
            dataType: "json",
            data: barbijo,
            headers: { 'Authorization': 'Bearer ' + jwt },
            async: true
        })
            .done(function (resultado) {
            var retorno = resultado;
            var alerta = "";
            if (retorno.exito) {
                alerta = ArmarAlert(retorno.mensaje);
                $("#div_mensaje").html(alerta);
                ObtenerListadoBarbijos();
                setTimeout(function () {
                    $("#cuerpo_modal_prod").html("");
                }, 2000);
            }
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            var retorno = JSON.parse(jqXHR.responseText);
            var alerta = ArmarAlert(retorno.mensaje, "danger");
            $("#divResultado").html(alerta);
        });
    }
    else {
        $("#cuerpo_modal_prod").html("");
    }
}
//# sourceMappingURL=principal.js.map