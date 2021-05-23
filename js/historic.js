const historicModalContainer = document.querySelector('.historic-modal-container');
const historicModal = document.querySelector('.historic-modal');
const btnCloseHistoricModal = document.querySelector('.close-historic-modal');
const tbodyHistoric = document.querySelector('#tbody-historic');
const searchHistoric = document.getElementById('search-historic');

//abrir a caixa de diálogo com os registros antigos
btnOldRegisters.addEventListener('click', event => {
	event.preventDefault();

    try {
        //pegar o histórico atualizado
        const historic = getHistoric();
        if(historic.length == 0) throw new Error()

        //inserir histórico no modal
        insertHistoricInModal(historic);

        // tornar visível a caixa de 
        historicModalContainer.classList.add('active');

        searchHistoric.focus();
    } catch(e) {

        showDialogMessage(`ainda não existem registros a serem consultados`, '#9e0d0d');
    }
});

searchHistoric.addEventListener('input', event => {
    const historic = getHistoric();
    const historicFiltred = historic.filter( h => treatedName(h.name).includes(treatedName(event.target.value)));
    insertHistoricInModal(historicFiltred);
})

//fechar a caixa de diálogo com os registros antigos
btnCloseHistoricModal.addEventListener('click', event => {
	event.preventDefault();
	historicModalContainer.classList.remove('active');
})

function getHistoric() {
    const registers = getRegisters();
    const historic = registers.filter( reg => reg.devolutionDate !== '');
    return historic;
}

function insertHistoricInModal(historic) {

    tbodyHistoric.innerHTML = '';
    

    historic.forEach( data => {
        const tr = document.createElement("tr");
        const {numberAndClassification, name, requester, requestDate, devolutionDate} = data;
        tr.innerHTML = `
            <td>${numberAndClassification}</td>
            <td>${name}</td>
            <td>${requester}</td>
            <td>${requestDate}</td>
            <td>${devolutionDate}</td>
        `
   
        tbodyHistoric.appendChild(tr);
    })
	
}

