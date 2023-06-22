$(() => {

    VerificarJWT();

    AdministrarVerificarJWT();

    AdministrarLogout();

    AdministrarListarAuto();

    AdministrarAgregar();

    AdministrarListarUsuarios();
});

//#region Usuarios

function ObtenerListadoUsuarios(){    
    $("#divResultado").html("");
    let jwt = localStorage.getItem("jwt");
    $.ajax({
        type: 'GET',
        url: URL_API + "listadoUsuarios",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado: any) {

            console.log(resultado);

            let tabla: string = ArmarTablaUsuarios(resultado);
            $("#divResultado").html(tabla).show(1000);

            $('[data-action="modificarUsuario"]').on('click', function (e) {
                let obj_prod_string: any = $(this).attr("data-obj_prod");
                let obj_prod = JSON.parse(obj_prod_string);
                let formulario = MostrarFormUsuarios("modificacion", obj_prod);

                $("#cuerpo_modal_prod").html(formulario);
            });

            $('[data-action="eliminarUsuario"]').on('click', function (e) {

                let obj_prod_string: any = $(this).attr("data-obj_prod");
                let obj_prod = JSON.parse(obj_prod_string);

                let formulario = MostrarFormUsuarios("baja", obj_prod);

                $("#cuerpo_modal_prod").html(formulario);
            });


        })
        .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {

            let retorno = JSON.parse(jqXHR.responseText);

            let alerta: string = ArmarAlert(retorno.mensaje + " ,redirigiendo al login", "danger");

            $("#divResultado").html(alerta).show(2000);

            setTimeout(() => {
                $(location).attr('href', URL_BASE + "index.html");
            }, 2000);
        });
}

function AdministrarListarUsuarios() {
    $("#listar_usuarios").on("click", () => {
    ObtenerListadoUsuarios();
    });
}


function MostrarFormUsuarios(accion: string, obj_prod: any = null): string {
    let funcion = "";
    let textoBoton = "";
    let habilitarLimpiar = "";

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

    let correo = "";
    let clave = "";
    let nombre = "";
    let apellido = "";
    let perfil = "";
    let id = "";

    if (obj_prod !== null) {
        correo = obj_prod.correo;
        nombre = obj_prod.nombre;
        apellido = obj_prod.apellido;
        perfil = obj_prod.perfil;
        id = obj_prod.id;
    }

    let form: string = `
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-4"></div>
          <div class="col-md-4">
            <br><br><br><br><br><br><br><br>
          </div>
          <div class="col-md-4"></div>
        </div>
        <div class="row">
          <div class="col-md-4"></div>
          <div class="col-md-4">
            <div class="row">
              <div class="col-md-12">
                <h3 class="titulo">REGISTRO</h3>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <form role="form">
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-id"></i></span>
                      <input type="text" name="id" id="id" placeholder="ID" class="form-control" value="${id}" readonly/>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-envelope"></i></span>
                      <input type="email" name="correo" id="correo" placeholder="Correo" class="form-control" value="${correo}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-key"></i></span>
                      <input type="password" name="clave" id="clave" class="form-control" placeholder="Clave" />
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-user"></i></span>
                      <input type="text" name="nombre" id="nombre" placeholder="Nombre" class="form-control" value="${nombre}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-user"></i></span>
                      <input type="text" name="apellido" id="apellido" class="form-control" placeholder="Apellido" value="${apellido}" />
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-id-card"></i></span>
                      <select name="perfil" id="perfil" class="form-control">
                        <option value="">Seleccionar perfil</option>
                        <option value="propietario"${perfil === 'propietario' ? ' selected' : ''}>Propietario</option>
                        <option value="empleado"${perfil === 'empleado' ? ' selected' : ''}>Empleado</option>
                        <option value="supervisor"${perfil === 'supervisor' ? ' selected' : ''}>Supervisor</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fas fa-camera"></i></span>
                      <input type="file" id="foto" name="foto" class="form-control">
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="row">
                        <div class="col-md-2"></div>
                        <div class="col-md-8">
                          <button type="button" id="btnRegistrar" class="btn btn-success btn-block" onclick="${funcion}">
                            ${textoBoton}
                          </button>
                        </div>
                        <div class="col-md-2"></div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="row">
                        <div class="col-md-2"></div>
                        <div class="col-md-8">
                          <button type="reset" class="btn btn-warning btn-block" ${habilitarLimpiar}>
                            Limpiar
                          </button>
                        </div>
                        <div class="col-md-2"></div>
                      </div>
                    </div>
                  </div>
                  <br><br>
                  <div id="div_mensaje"></div>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-4"></div>
        </div>
        <div class="row">
          <div class="col-md-4"></div>
          <div class="col-md-4"></div>
          <div class="col-md-4"></div>
        </div>        
      </div>
      <div id="div_mensaje"></div>`;

    return form;
}


function ArmarTablaUsuarios(productos: any[]): string {
    let tabla: string = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>CORREO</th><th>NOMBRE</th><th>APELLIDO</th><th>PERFIL</th><th>FOTO</th><th>ACCIONES</th></tr>';

    if (productos.length === 0) {
        tabla += '<tr><td colspan="6">---</td></tr>';
    } else {
        productos.forEach((prod: any) => {
            const objProdString = JSON.stringify(prod);
            tabla += `<tr>
                    <td>${prod.id}</td>
                    <td>${prod.correo}</td>
                    <td>${prod.nombre}</td>
                    <td>${prod.apellido}</td>
                    <td>${prod.perfil}</td>
                    <td><img src="${URL_API}${prod.foto}" width="50px" height="50px"></td>
                    <td>
                      <button class="btn-modificar" data-action='modificarUsuario' data-obj_prod='${objProdString}' data-toggle='modal' data-target='#ventana_modal_prod'><i class="fas fa-edit"></i></button>
                      <button class="btn-eliminar" data-action='eliminarUsuario' data-obj_prod='${objProdString}' data-toggle='modal' data-target='#ventana_modal_prod'><i class="fas fa-times"></i></button>
                    </td>
                  </tr>`;
        });
    }

    tabla += '</table>';

    return tabla;
}


function ModificarUsuario(e: any): void {
    e.preventDefault();
    let correo = $("#correo").val();
    let clave = $("#clave").val();
    let nombre = $("#nombre").val();
    let apellido = $("#apellido").val();
    let id = $("#id").val();
    let foto: any = (<HTMLInputElement>document.getElementById("foto"));
    let perfil = $("#perfil").val();

    let form = new FormData();
    form.append("obj", JSON.stringify({ "correo": correo, "apellido": apellido, "nombre": nombre, "perfil": perfil, "clave": clave, "foto": foto , "id" : id}));
    form.append("foto", foto.files[0]);
    let jwt = localStorage.getItem("jwt");

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
        .done(function (obj_ret: any) {
            console.log(obj_ret);
            let retorno = JSON.parse(obj_ret);
            
            let alerta: string = "";
            alerta = ArmarAlert(retorno.mensaje);
            $("#div_mensaje").html(alerta);
            ObtenerListadoUsuarios();

            setTimeout(() => {
                $("#cuerpo_modal_prod").html("");
            }, 2000);
        })
        .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {
            console.log(jqXHR.responseText);
            let retorno = JSON.parse(jqXHR.responseText);

            let alerta: string = ArmarAlert(retorno.mensaje, "danger");

            $("#div_mensaje").html(alerta);

        });
}

function EliminarUsuario(e: any): void {
    e.preventDefault();

    let correo = $("#correo").val();
    let clave = $("#clave").val();
    let nombre = $("#nombre").val();
    let apellido = $("#apellido").val();
    let id = $("#id").val();
    let foto: any = (<HTMLInputElement>document.getElementById("foto"));
    let perfil = $("#perfil").val();

    //let form = new FormData();
    //form.append("obj", JSON.stringify({ "correo": correo, "apellido": apellido, "nombre": nombre, "perfil": perfil, "clave": clave, "foto": foto , "id" : id}));
    //form.append("foto", foto.files[0]);
    let jwt = localStorage.getItem("jwt");

    // Mostrar alerta de confirmación de borrado
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        $.ajax({
            type: 'DELETE',
            url: URL_API + "eliminarUsuario",
            dataType: "json",
            data: {"id" : id},
            headers: { 'Authorization': 'Bearer ' + jwt },
            async: true
        })
            .done(function (resultado: any) {
                let retorno = resultado;
                let alerta: string = "";

                if (retorno.exito) {
                    alerta = ArmarAlert(retorno.mensaje);
                    $("#div_mensaje").html(alerta);
                    ObtenerListadoUsuarios();

                    setTimeout(() => {
                        $("#cuerpo_modal_prod").html("");
                    }, 2000);
                }
            })
            .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {
                console.log(jqXHR.responseText);
                let retorno = JSON.parse(jqXHR.responseText);
                let alerta: string = ArmarAlert(retorno.mensaje, "danger");
                $("#div_mensaje").html(alerta);
            });
    } else {
        $("#cuerpo_modal_prod").html("");
    }
}


// #endregion Usuarios

// #region Autos
function AdministrarAgregar() {

    $("#alta_producto").on("click", () => {
        ArmarFormularioAlta();
    });
}

function ArmarFormularioAlta() {
    $("#divResultado").html("");

    let formulario = MostrarForm("alta");

    $("#divResultado").html(formulario).show(1000);
}

function AdministrarListarAuto() {
    $("#listar_producto").on("click", () => {
        ObtenerListadoAutos();
    });
}

function ObtenerListadoAutos() {
    $("#divResultado").html("");

    let jwt = localStorage.getItem("jwt");

    $.ajax({
        type: 'GET',
        url: URL_API + "productos_bd",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (resultado: any) {

            console.log(resultado);

            let tabla: string = ArmarTablaProductos(resultado);

            $("#divResultado").html(tabla).show(1000);

            $('[data-action="modificar"]').on('click', function (e) {

                let obj_prod_string: any = $(this).attr("data-obj_prod");
                let obj_prod = JSON.parse(obj_prod_string);

                let formulario = MostrarForm("modificacion", obj_prod);

                $("#cuerpo_modal_prod").html(formulario);
            });

            $('[data-action="eliminar"]').on('click', function (e) {

                let obj_prod_string: any = $(this).attr("data-obj_prod");
                let obj_prod = JSON.parse(obj_prod_string);

                let formulario = MostrarForm("baja", obj_prod);

                $("#cuerpo_modal_prod").html(formulario);
            });
        })
        .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {

            let retorno = JSON.parse(jqXHR.responseText);
            let alerta: string = ArmarAlert(retorno.mensaje + " ,redirigiendo al login", "danger");

            $("#divResultado").html(alerta).show(2000);

            setTimeout(() => {
                $(location).attr('href', URL_BASE + "index.html");
            }, 2000);
        });
}

function ArmarTablaProductos(productos: []): string {
    let tabla: string = '<table class="table table-dark table-hover">';
    tabla += '<tr><th>ID</th><th>Color</th><th>Marca</th><th>Precio</th><th>Modelo</th><th style="width:110px">ACCIONES</th></tr>';

    if (productos.length == 0) {
        tabla += '<tr><td>---</td><td>---</td><td>---</td><td>---</td><th>---</td></tr>';
    }
    else {//
        productos.forEach((prod: any) => {

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


function MostrarForm(accion: string, obj_prod: any = null): string {
    let funcion = "";
    let solo_lectura_select = "";
    let solo_lectura = "";
    let solo_lectura_pk = "";
    let textoBoton = "";
    let habilitarLimpiar = "";
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


    let id = "";
    let color = "";
    let marca = "";
    let precio = "";
    let modelo = "";

    if (obj_prod !== null) {
        id = obj_prod.id;
        color = obj_prod.color;
        marca = obj_prod.marca;
        precio = obj_prod.precio;
        modelo = obj_prod.modelo;
    }

    let form: string = `<div class="row justify-content-center">
    <div class="col-md-8">
        <form id="myForm">
            <div class="form-group">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-id">ID</i></span>
                    </div>
                    <input type="text" class="form-control" name="id" id="id" value="${id}" readonly required>
                </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-palette"></i></span>
                    </div>
                    <input type="text" name="color" id="color" placeholder="Color" class="form-control" value="${color}" ${solo_lectura_pk} required />
                </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="bi bi-tag"></i></span>
                    </div>
                    <input type="text" name="marca" id="marca" placeholder="Marca" class="form-control" value="${marca}" ${solo_lectura_pk} required />
                </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>
                    </div>
                    <input type="number" name="precio" id="precio" placeholder="Precio" class="form-control" value="${precio}" ${solo_lectura} required />
                </div>
            </div>
            <div class="form-group">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="bi bi-pen"></i></span>
                    </div>
                    <input type="text" name="modelo" id="modelo" placeholder="Modelo" class="form-control" value="${modelo}" ${solo_lectura_pk} required />
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="row">
                        <div class="col-md-2"></div>
                        <div class="col-md-8">
                            <button type="button" id="btnRegistrar" class="btn btn-success btn-block" onclick="${funcion}">
                                ${textoBoton}
                            </button>
                        </div>
                        <div class="col-md-2"></div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="row">
                        <div class="col-md-2"></div>
                        <div class="col-md-8">
                            <button type="button" class="btn btn-warning btn-block" onclick="limpiarFormulario()" ${habilitarLimpiar}>
                                Limpiar
                            </button>
                        </div>
                        <div class="col-md-2"></div>
                    </div>
                </div>
            </div>
            <br>
            <br>
            <div id="div_mensaje"></div>
        </form>
    </div>
</div>`;

    return form;
}

function Agregar(e: any): void {
    e.preventDefault();

    let color = $("#color").val();
    let modelo = $("#modelo").val();
    let marca = $("#marca").val();
    let precio = $("#precio").val();
    let jwt = localStorage.getItem("jwt");
    let auto: any = {};
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
        .done(function (obj_ret: any) {
            let retorno = obj_ret;
            let alerta: string = "";

            if (retorno.exito) {
                alerta = ArmarAlert(retorno.mensaje);

                $("#div_mensaje").html(alerta);

                ObtenerListadoAutos();
                setTimeout(() => {
                    $("#cuerpo_modal_prod").html("");
                }, 3000);
            }
        })
        .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {

            let retorno = JSON.parse(jqXHR.responseText);

            let alerta: string = ArmarAlert(retorno.mensaje, "danger");

            //SI TE PIDE VALIDAR QUE EL PRODUCTO AGREGADO NO ESTE EN LA BASE DE DATOS
            if (!retorno.repetido) {
                alerta = ArmarAlert(retorno.mensaje + " redirigiendo al login", "danger");
                setTimeout(() => {
                    $(location).attr('href', URL_BASE + "login.html");
                }, 2000);
            }

            $("#div_mensaje").html(alerta);

        });
}


function Modificar(e: any): void {
    e.preventDefault();


    let color = $("#color").val();
    let id = $("#id").val();
    let modelo = $("#modelo").val();
    let marca = $("#marca").val();
    let precio = $("#precio").val();
    let jwt = localStorage.getItem("jwt");
    let auto: any = {};
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
        .done(function (resultado: any) {
            let retorno = resultado;
            let alerta: string = "";

            if (retorno.exito) {

                alerta = ArmarAlert(retorno.mensaje);

                $("#div_mensaje").html(alerta);
                ObtenerListadoAutos();

                setTimeout(() => {
                    $("#cuerpo_modal_prod").html("");
                }, 2000);
            }
        })
        .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {

            let retorno = JSON.parse(jqXHR.responseText);
            console.log(retorno);

            let alerta: string = ArmarAlert(retorno.mensaje, "danger");

            $("#div_mensaje").html(alerta);

        });
}

function Eliminar(e: any): void {
    e.preventDefault();


    let color = $("#color").val();
    let id = $("#id").val();
    let modelo = $("#modelo").val();
    let marca = $("#marca").val();
    let precio = $("#precio").val();
    let jwt = localStorage.getItem("jwt");
    let auto: any = {};
    auto.color = color;
    auto.marca = marca;
    auto.modelo = modelo;
    auto.id = id;
    auto.precio = precio;
    console.log(auto);

    // Mostrar alerta de confirmación de borrado
    if (confirm("¿Estás seguro de que deseas eliminar este barbijo?")) {
        $.ajax({
            type: 'DELETE',
            url: URL_API + "eliminarAuto",
            dataType: "json",
            data: auto,
            headers: { 'Authorization': 'Bearer ' + jwt },
            async: true
        })
            .done(function (resultado: any) {
                let retorno = resultado;
                let alerta: string = "";

                if (retorno.exito) {
                    alerta = ArmarAlert(retorno.mensaje);
                    $("#div_mensaje").html(alerta);
                    ObtenerListadoAutos();

                    setTimeout(() => {
                        $("#cuerpo_modal_prod").html("");
                    }, 2000);
                }
            })
            .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {
                let retorno = JSON.parse(jqXHR.responseText);
                let alerta: string = ArmarAlert(retorno.mensaje, "danger");
                $("#div_mensaje").html(alerta);
            });
    } else {
        $("#cuerpo_modal_prod").html("");
    }
}


//#endregion Autos

//#region JWT, logout



function VerificarJWT() {

    //RECUPERO DEL LOCALSTORAGE
    let jwt = localStorage.getItem("jwt");

    $.ajax({
        type: 'GET',
        url: URL_API + "verificar_token",
        dataType: "json",
        data: {},
        headers: { 'Authorization': 'Bearer ' + jwt },
        async: true
    })
        .done(function (obj_rta: any) {
            console.log(obj_rta);

            if (obj_rta.exito) {

                let app = obj_rta.jwt.api;
                let usuario = obj_rta.jwt.usuario;

                let alerta: string = ArmarAlert(app + "<br>" + JSON.stringify(usuario));

                $("#divResultado").html(alerta).toggle(2000);
                $("#rol").html(usuario.perfil);
            }
            else {
                let alerta: string = ArmarAlert(obj_rta.mensaje, "danger");

                $("#divResultado").html(alerta).toggle(2000);

                setTimeout(() => {
                    $(location).attr('href', URL_BASE + "index.html");
                }, 2000);
            }
        })
        .fail(function (jqXHR: any, textStatus: any, errorThrown: any) {

            let retorno = JSON.parse(jqXHR.responseText);

            let alerta: string = ArmarAlert(retorno.mensaje, "danger");
            
            setTimeout(() => {
                $(location).attr('href', URL_BASE + "index.html");
            }, 2000);
            $("#divResultado").html(alerta).show(2000);
        });
}

function AdministrarVerificarJWT() {

    $("#verificarJWT").on("click", () => {

        VerificarJWT();
    });
}

function AdministrarLogout() {

    $("#logout").on("click", () => {

        localStorage.removeItem("jwt");

        let alerta: string = ArmarAlert('Usuario deslogueado!');

        $("#divResultado").html(alerta).show(2000);

        setTimeout(() => {
            $(location).attr('href', URL_BASE + "index.html");
        }, 1500);
    });

}


//#endregion JWT,administrar, logout


