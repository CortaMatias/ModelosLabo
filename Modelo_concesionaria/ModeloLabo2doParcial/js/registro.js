"use strict";
$(function () {
    $("#btnRegistrar").on("click", function (e) {
        e.preventDefault();
        var correo = $("#correo").val();
        var clave = $("#clave").val();
        var nombre = $("#nombre").val();
        var apellido = $("#apellido").val();
        var foto = document.getElementById("foto");
        var perfil = $("#perfil").val();
        var form = new FormData();
        form.append("obj", JSON.stringify({ "correo": correo, "apellido": apellido, "nombre": nombre, "perfil": perfil, "clave": clave, "foto": foto }));
        form.append("foto", foto.files[0]);
        $.ajax({
            type: 'POST',
            url: URL_API + "usuarios",
            dataType: "text",
            cache: false,
            contentType: false,
            processData: false,
            data: form,
            async: true
        })
            .done(function (obj_ret) {
            var retorno = JSON.parse(obj_ret);
            console.log(retorno);
            var alerta = "";
            if (retorno.exito) {
                alerta = ArmarAlert(retorno.mensaje + " redirigiendo al login");
                setTimeout(function () {
                    $(location).attr('href', URL_BASE + "index.html");
                }, 2000);
            }
            $("#div_mensaje").html(alerta);
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            var retorno = JSON.parse(jqXHR.responseText);
            var alerta = ArmarAlert(retorno.mensaje, "danger");
            $("#div_mensaje").html(alerta);
        });
    });
});
//# sourceMappingURL=registro.js.map