//Array y objeto para antes de guardar en local storage
//let participantes=[];
//let restricciones={};


//valida que el campo no esté vacio para poder continuar
const btnAgregarCreador=document.getElementById("btnAgregarCreador");
btnAgregarCreador.addEventListener("click", agregarCreador);


//inicia el llamado a la función de agregar participantes
const btnAgregarParticipante=document.getElementById("btnAgregarParticipante");
btnAgregarParticipante.addEventListener("click", agregarParticipante);


//traemos el modal de las restricciones y le pasamos las opciones a los selects
const modal3 = document.getElementById("exampleModal3");
modal3.addEventListener("show.bs.modal", () => {
    cargarSelects();
});

//cargar restricciones
const btnAgregarRestricciones=document.getElementById("btnAgregarRestriccion");
btnAgregarRestricciones.addEventListener("click", agregarRestricciones);


//iniciamos el sorteo
// const btnComenzarSorteo=document.getElementById("btnIniciarSorteo");
// btnComenzarSorteo.addEventListener("click", comenzarSorteo);


//función para agregar al creador del sorteo
function agregarCreador(){
    const input=document.getElementById("inputCreador");
    const checkboxCreador=document.getElementById("creadorParticipa");

    //traemos el valor del campo y le quitamos espacios en blanco
    const creador=input.value.trim();
    //validamos si el checkbox fue seleccionado
    const checkbox=checkboxCreador.checked;

    if(!creador){
        alert("Indica quien está creando el sorteo");
        return;
    }

    //traemos los participantes del local storage
    const participantes=obtenerParticipantes();
    console.log(participantes);
    //si el checkbox fue seleccionado incluimos al creador
    if(checkbox){
        if(!participantes.includes(creador)){
            participantes.push(creador);
            //pasamos al local storage el primer participante
            localStorage.setItem("participantes", JSON.stringify(participantes));  
        }
    }

    console.log(participantes)
    //imprimimos en pantalla el nombre del participante
    actualizarLista();
}



function agregarParticipante(){
    //traemos los datos del modal y quitamos espacios en blanco
    const input = document.getElementById("inputParticipante");
    const nombre= input.value.trim();
    //si el campo está vacio, retoramos
    if(nombre==="") return;

    //recuperamos la info del localStorage
    const participantes=obtenerParticipantes();
    
    //si el array de participante ya tiene el nombre que se ingresó
    //mandamos un alert y retornamos
    if(participantes.includes(nombre)){
        alert("Este participante ya está registrado");
        return;
    }

    //agregamos el nombre del participante al array
    participantes.push(nombre);
    //actualizamos el localStorage con el nuevo participante
    localStorage.setItem("participantes", JSON.stringify(participantes));
    //limpiamos el campo del modal
    input.value="";
    //actualizamos pantalla con el nuevo nombre
    actualizarLista();

}



function actualizarLista(){
    //traemos la lista del modal
    const lista= document.getElementById("listaParticipantes");
    lista.innerHTML="";
    
    //recuperamos participantes
    const participantes= obtenerParticipantes();

    //recorremos el array y agregamos a cada participante junto con un botón para eliminarlo
    //se le añade tambien el evento onclick para eliminarlo
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
    const participantes= JSON.parse(localStorage.getItem("participantes")) || [];

    participantes.splice(index,1);
    
    localStorage.setItem("participantes",JSON.stringify(participantes));
    actualizarLista();
}



function cargarSelects(){
    const selectBase= document.getElementById("personaBase");
    const selectRestringida= document.getElementById("personaRestringida");

    selectBase.innerHTML="";
    selectRestringida.innerHTML="";

    const participantes= JSON.parse(localStorage.getItem("participantes")) || [];

    participantes.forEach(nombre=>{
        selectBase.innerHTML+=`
            <option value="${nombre}">${nombre}</option>    
        `;
        selectRestringida.innerHTML+=`
            <option value="${nombre}">${nombre}</option>    
        `;
    })
}



function agregarRestricciones(){
    const base = document.getElementById("personaBase").value;
    const restringido = document.getElementById("personaRestringida").value;
    
    if(base===restringido){
        alert("No puede restringirse a si mismo");
        return;
    }

    const restricciones=obtenerRestricciones();
    console.log(restricciones);
    if(!restricciones[base]){
        restricciones[base]=[];
    }

    restricciones[base].push(restringido);

    localStorage.setItem("restricciones",JSON.stringify(restricciones));

    mostrarRestricciones();
}



function mostrarRestricciones(){
    const lista=document.getElementById("listaRestricciones");
    
    lista.innerHTML="";

    const restricciones=obtenerRestricciones();

    for(let persona in restricciones){
        restricciones[persona].forEach(r=>{
            lista.innerHTML+= `
                <li class="list-group-item">
                    ${persona} no puede sacar a ${r}
                </li>
            `;
        });
    }
}



//funcion que nos ayudará a validar que se cumplan las condiciones del sorteo
function esValido(asignaciones){
    const restricciones=obtenerRestricciones();

    //para cada persona de asignaciones comparamos
    for (let persona in asignaciones){

        //destino será la persona que se le asignó al momento de hacer el shuffle
        let destino = asignaciones[persona];
        
        console.log("Validando:", persona, "->", destino);
        console.log("Restricción:", restricciones[persona]);

        //si la persona asignada es ella misma, retorna falso y no es valida la asignacion 
        if(destino===persona) return false;
        
        //si la persona asignada es la que se encuentra restringida retorna falso y no es valida la asignación
        if(restricciones[persona]?.includes(destino)){
            return false;
        }
    }
    
    
    //si ninguna de las dos condiciones previas se cumplen, quiere decir que la asignacion es correcta y retorna verdadero
    return true;
}



//función que contiene la logica del sorteo
function sorteo(){
    let intentos= 0;
    let maxIntentos=1000;

    const participantes=obtenerParticipantes();
    const restricciones=obtenerRestricciones();

    while (intentos<maxIntentos){

        //copia del array que no altera el array original
        let copia=[...participantes];

        //algoritmo para asignacion aleatoria (shuffle)
        for(let i=copia.length-1; i>0; i--){
            let j=Math.floor(Math.random()*(i+1));
            [copia[i], copia[j]]= [copia[j], copia[i]]
        }

        //array donde estarán las asignaciones 
        let asignaciones={};

        //para cada persona del array participantes se le asignará la persona que está en copia
        participantes.forEach((persona, index)=>{
            asignaciones[persona]=copia[index];
        })

        //se validan las asignacion con la funcion es valido
        if(esValido(asignaciones)){
            //depurar estos logs
            console.log("Restricciones actuales:", restricciones);
            console.log("ASIGNACIÓN FINAL:", asignaciones);
            return asignaciones;//si todo se cumpla retorna las asignaciones creadas
        }
        //si no entra en el if, aumenta el contador
        intentos++;
    }
    //si despues de hacer todos los intentos no nos arroja alguna combinación valida, regresamos un null
    alert("No se pudo generar un sorteo válido.");
    return null;

}



function comenzarSorteo(){
    const resultado=sorteo();

    if(resultado){
        mostrarResultado(resultado);
    }
}



function mostrarResultado(asignaciones){
    const lista=document.getElementById("listaResultado");

    lista.innerHTML="";

    for(let persona in asignaciones){
        lista.innerHTML+=`
            <li class="list-group-item">
                A ${persona} le toca: ${asignaciones[persona]}
            </li>     
        `;
    }
}



function obtenerParticipantes(){
    const arrayParticipantes=localStorage.getItem("participantes");
    if(!arrayParticipantes){
        return [];
    }

    const participantes=JSON.parse(arrayParticipantes);
    return participantes;
}



function obtenerRestricciones(){
    const arrayRestricciones=localStorage.getItem("restricciones");
    if(!arrayRestricciones){
        return {};
    }

    const restricciones=JSON.parse(arrayRestricciones);
    return restricciones;
}



// Lógica para el nuevo modal de configuración
let motivoSeleccionado = "";

function setMotivo(valor) {
    motivoSeleccionado = valor;
    // Ponemos el valor en el input oculto por si acaso
    document.getElementById('customMotivo').value = valor;
    
    // Feedback visual: quitamos la clase 'active' de todos y se la ponemos al clicado
    document.querySelectorAll('.btn-motivo').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    
    // El botón que llamamos (evento actual) le cambiamos el color
    event.target.classList.remove('btn-outline-secondary');
    event.target.classList.add('btn-primary');
}



function checkPresupuesto(valor) {
    const inputCustom = document.getElementById('customPresupuesto');
    if(valor === "otro") {
        inputCustom.classList.remove('d-none');
    } else {
        inputCustom.classList.add('d-none');
    }
}



document.getElementById('btnGuardarConfig').addEventListener('click', () => {
    const customMot = document.getElementById('customMotivo').value;
    const fecha = document.getElementById('fechaEvento').value;
    const presupuestoBase = document.getElementById('presupuestoSelect').value;
    const presupuestoFinal = presupuestoBase === "otro" ? document.getElementById('customPresupuesto').value : presupuestoBase;

    if(!fecha || (!motivoSeleccionado && !customMot)) {
        alert("Por favor rellena la fecha y el motivo.");
        return;
    }

    const config = {
        evento: customMot || motivoSeleccionado,
        fecha: fecha,
        presupuesto: presupuestoFinal
    };

    localStorage.setItem("configuracion", JSON.stringify(config));
    
    // Ahora sí, cerramos y disparamos el sorteo
    const modalElement = document.getElementById('modalConfiguracion');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    
    comenzarSorteo(); // Tu función que ya tienes
});



// Modificacion de tu funcion mostrarResultado para activar esta seccion
function mostrarResultado(asignaciones) {
    const lista = document.getElementById("listaResultado");
    lista.innerHTML = "";

    for (let persona in asignaciones) {
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${persona} le regala a:</span>
                <span class="badge" style="background-color: var(--color-accent);">${asignaciones[persona]}</span>
            </li>`;
    }

    // Mostrar el contenedor de sugerencias
    const seccion = document.getElementById("seccionSugerencias");
    seccion.classList.remove("d-none");
    
    // Inicializar los eventos de arrastre
    prepararDragAndDrop();
}



function prepararDragAndDrop() {
    const items = document.querySelectorAll(".item-regalo");
    const destino = document.getElementById("cajaDestino");
    const placeholder = document.getElementById("placeholderTexto");

    items.forEach(item => {
        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", e.target.id);
            e.target.style.opacity = "0.5";
        });

        item.addEventListener("dragend", (e) => {
            e.target.style.opacity = "1";
        });
    });

    destino.addEventListener("dragover", (e) => {
        e.preventDefault();
        destino.style.boxShadow = "inset 0 0 10px var(--color-secundario)";
    });

    destino.addEventListener("dragleave", () => {
        destino.style.boxShadow = "none";
    });

    destino.addEventListener("drop", (e) => {
        e.preventDefault();
        destino.style.boxShadow = "none";
        
        const idRegalo = e.dataTransfer.getData("text");
        const elemento = document.getElementById(idRegalo);
        
        if (placeholder) {
            placeholder.style.display = "none";
        }

        // Mover el elemento y cambiar su color al del acento (naranja)
        destino.appendChild(elemento);
        elemento.style.backgroundColor = "var(--color-accent)";
    });
}



function guardarSugerencias() {
    const seleccionados = [];
    const itemsEnDestino = document.querySelectorAll("#cajaDestino .item-regalo");
    
    itemsEnDestino.forEach(item => {
        seleccionados.push(item.innerText);
    });
    
    if (seleccionados.length === 0) {
        alert("Selecciona al menos una sugerencia de regalo");
        return;
    }

    // Persistencia en LocalStorage segun requerimiento
    localStorage.setItem("sugerenciasRegalos", JSON.stringify(seleccionados));
    alert("Lista de sugerencias guardada correctamente");
}


document.addEventListener("DOMContentLoaded", () => {
    configurarBotonPrincipal();
});

function configurarBotonPrincipal() {
    const btn = document.getElementById("btnAccionPrincipal");
    const config = localStorage.getItem("configuracion");
    const imagenDefault = document.getElementById("imagenDefault");
    const cardResumen = document.getElementById("cardResumenEvento");

    if (config) {
        // --- ESCENARIO A: YA HAY DATOS (BOTÓN PARA REINICIAR) ---
        btn.innerText = "NUEVO SORTEO";
        btn.style.backgroundColor = "var(--color-accent)";
        btn.style.border = "none";
        
        // Desactivamos el modal de Bootstrap para que no se abra al querer borrar
        btn.removeAttribute("data-bs-toggle");
        btn.removeAttribute("data-bs-target");

        // Mostramos el resumen
        if(imagenDefault) imagenDefault.classList.add("d-none");
        if(cardResumen) {
            cardResumen.classList.remove("d-none");
            const datos = JSON.parse(config);
            llenarCardResumen(datos);
        }

        // Programar la limpieza física
        btn.onclick = function(e) {
            e.preventDefault(); // Evita cualquier comportamiento por defecto
            if (confirm("¿Quieres borrar todo y empezar de cero?")) {
                localStorage.clear();
                window.location.reload(); // Recarga total
            }
        };

    } else {
        // --- ESCENARIO B: NO HAY DATOS (EMPEZAR DE CERO) ---
        btn.innerText = "EMPEZAR AHORA";
        btn.style.backgroundColor = "var(--color-primario)";
        btn.style.border = "none";
        
        // IMPORTANTE: Limpiar el evento click manual para que Bootstrap tome el control
        btn.onclick = null; 

        // Activamos los atributos de Bootstrap para abrir el modal
        btn.setAttribute("data-bs-toggle", "modal");
        btn.setAttribute("data-bs-target", "#exampleModal");
        
        if(cardResumen) cardResumen.classList.add("d-none");
        if(imagenDefault) imagenDefault.classList.remove("d-none");
    }
}

function llenarCardResumen(datos) {
    // Usamos validacion opcional (?.) por si los elementos no existen en el DOM todavia
    const titulo = document.getElementById("resumenTitulo");
    const fecha = document.getElementById("resumenFecha");
    const presupuesto = document.getElementById("resumenPresupuesto");

    if(titulo) titulo.innerText = datos.evento || "Evento";
    if(fecha) fecha.innerText = datos.fecha || "Sin fecha";
    if(presupuesto) presupuesto.innerText = datos.presupuesto || "0";
}