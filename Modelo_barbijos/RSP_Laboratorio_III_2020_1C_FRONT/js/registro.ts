/// <reference path="../node_modules/@types/jquery/index.d.ts" />

$(()=>{

    $("#btnRegistrar").on("click", (e:any)=>{

        e.preventDefault();

        let correo = $("#correo").val();
        let clave = $("#clave").val();
        let nombre = $("#nombre").val();
        let apellido = $("#apellido").val();
        let foto: any = (<HTMLInputElement>document.getElementById("foto"));
        let perfil = $("#perfil").val();

        let form = new FormData();
        form.append("obj", JSON.stringify({"correo":correo, "apellido":apellido, "nombre":nombre, "perfil":perfil, "clave":clave, "foto":foto}));
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
        .done(function (obj_ret:any) {

            let retorno = JSON.parse(obj_ret);
            console.log(retorno);
            let alerta:string = "";

            if(retorno.exito){               

                alerta = ArmarAlert(retorno.mensaje + " redirigiendo al login.html...");
    
                setTimeout(() => {
                    $(location).attr('href', URL_BASE + "login.html");
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