"use strict";
$(function () {
    $("#registro").on("click", function (e) {
        var alerta = "";
        alerta = ArmarAlert("Redirigiendo a registro");
        $("#div_mensaje").html(alerta);
        setTimeout(function () {
            $(location).attr('href', URL_BASE + "registro.html");
        }, 2000);
    });
    $("#btnForm").on("click", function (e) {
        e.preventDefault();
        var correo = $("#correo").val();
        var clave = $("#clave").val();
        var dato = {};
        dato.correo = correo;
        dato.clave = clave;
        $.ajax({
            type: 'POST',
            url: URL_API + "login",
            dataType: "json",
            data: dato,
            async: true
        })
            .done(function (obj_ret) {
            console.log(obj_ret);
            var alerta = "";
            if (obj_ret.exito) {
                localStorage.setItem("jwt", obj_ret.jwt);
                alerta = ArmarAlert(obj_ret.mensaje + " redirigiendo al principal.php...");
                setTimeout(function () {
                    $(location).attr('href', URL_BASE + "principal.html");
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
//# sourceMappingURL=script.js.map