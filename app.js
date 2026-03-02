
let participantes=[];


//valida que el campo no esté vacio para poder continuar
const btnAgregarCreador=document.getElementById("btnAgregarCreador");
btnAgregarCreador.addEventListener("click", agregarCreador);


//inicia el llamado a la función de agregar participantes
const btnAgregarParticipante=document.getElementById("btnAgregarParticipante");
btnAgregarParticipante.addEventListener("click", agregarParticipante);


function agregarCreador(){
    const input=document.getElementById("inputCreador");
    const checkboxCreador=document.getElementById("creadorParticipa");

    const creador=input.value.trim();
    const checkbox=checkboxCreador.checked;

    if(!creador){
        alert("Indica quien está creando el sorteo");
        return;
    }

    if(checkbox){
        if(!participantes.includes(creador)){
            participantes.push(creador);  
        }
    }

    console.log(participantes)
    actualizarLista();

}





function agregarParticipante(){
    const input = document.getElementById("inputParticipante");
    const nombre= input.value.trim();
    if(nombre==="") return;
    
    if(participantes.includes(nombre)){
        alert("Este participante ya está registrado");
        return;
    }

    participantes.push(nombre);

    input.value="";
    actualizarLista();

}

function actualizarLista(){
    const lista= document.getElementById("listaParticipantes");
    lista.innerHTML="";

    participantes.forEach((p, index)=>{
        lista.innerHTML+=`
            <li class="list-group-item d-flex justify-content-between">
                ${p}
                <button class="btn btn-sm btn-danger" onclick="eliminarParticipante(${index})">
                    X
                </button>
            </li>
        `;
    });
}

function eliminarParticipante(index){
    participantes.splice(index,1);
    actualizarLista();
}