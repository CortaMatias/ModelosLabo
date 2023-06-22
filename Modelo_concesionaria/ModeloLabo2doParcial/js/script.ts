/// <reference path="../node_modules/@types/jquery/index.d.ts" />


$(()=>{

    $("#registro").on("click", (e:any)=>{
        let alerta:string = "";
        alerta = ArmarAlert("Redirigiendo a registro");
        $("#div_mensaje").html(alerta);
        setTimeout(() => {
            $(location).attr('href', URL_BASE + "registro.html");
        }, 2000);
    });

    $("#btnForm").on("click", (e:any)=>{

        e.preventDefault();

        let correo = $("#correo").val();
        let clave = $("#clave").val();

        let dato:any = {};
        dato.correo = correo;
        dato.clave = clave;

        $.ajax({
            type: 'POST',
            url: URL_API + "login",
            dataType: "json",
            data: dato,
            async: true
        })
        .done(function (obj_ret:any) {

            console.log(obj_ret);
            let alerta:string = "";

            if(obj_ret.exito){
                //GUARDO EN EL LOCALSTORAGE
                localStorage.setItem("jwt", obj_ret.jwt);                

                alerta = ArmarAlert(obj_ret.mensaje + " redirigiendo al principal.php...");
    
                setTimeout(() => {
                    $(location).attr('href', URL_BASE + "principal.html");
                }, 2000);

            }

            $("#div_mensaje").html(alerta);
            
        })
        .fail(function (jqXHR:any, textStatus:any, errorThrown:any) {

            let retorno = JSON.parse(jqXHR.responseText);

            let alerta:string = ArmarAlert(retorno.mensaje, "danger");

            $("#div_mensaje").html(alerta);

        });    

    });

});

