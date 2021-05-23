const classificacaoEl = document.getElementById('classificacao');
const classificaoOptions = document.querySelectorAll('#classificacao option');
const tbodyRegistersEl = document.querySelector('#tbody-registers');

const numberEl = document.getElementById('numero');
const nameEl = document.getElementById('nome');
const requesterEl = document.getElementById('solicitante');

const formAddRegister = document.querySelector("#add-register");

const dialogMessage = document.querySelector('.dialog-message');

const btnOldRegisters = document.querySelector('.old-registers');


// Apenas para carregar a página
const registers = renderRegisters()


if(navigator.appVersion.includes('Chrome')) {
	
	classificacaoEl.addEventListener('click', e => {
		const { selectedIndex } = e.target;
	
		numberEl.removeAttribute('disabled');
		const option = classificaoOptions[selectedIndex];
		
		if(option.value === "Triagem" || option.value === "") {
			numberEl.value = '';
			numberEl.setAttribute('disabled', 'disabled');
		}
	});
} else {
	classificaoOptions.forEach(option => {
		option.addEventListener('click', e => {
			numberEl.removeAttribute('disabled');
			if(option.value === "Triagem" || option.value === "") {
				numberEl.value = '';
				numberEl.setAttribute('disabled', 'disabled');
			}
		})
	})
}



/* Adicionando um registro na tabela*/
formAddRegister.addEventListener('submit', e => {
	e.preventDefault();

	const numberAndClassification = getNumberAndClassification(numberEl.value, classificaoOptions[classificacaoEl.selectedIndex].value)
	const requestDate = formatDate(new Date());
	
	const dataElements = { 
		numberAndClassification, 
		name: nameEl.value, 
		requester: requesterEl.value,
		requestDate,
		devolutionDate: ''
	};

	const errorMessage = verifyIfExists(numberAndClassification, dataElements.name);
	if(errorMessage.length === 0) {
		
		saveInLS(dataElements);
		const index = getRegisters().length - 1;
		insertRegisterOnTable(dataElements, index);
	

		// limpar apenas alguns campos
		classificacaoEl.selectedIndex = 0;
		numberEl.setAttribute('disabled', 'disabled');
		numberEl.value = '';
		nameEl.value = '';
		showDialogMessage('Solicitação realizada com sucesso!', '#008b07');

	} else {

		showDialogMessage(errorMessage, '#9e0d0d');
	}	 
})

/* HELPERS FUNCIONS */
function formatDate(date) {
	return `${insertZero(date.getDate())}/${insertZero(Number(date.getMonth()) + 1)}/${date.getFullYear()} - ${insertZero(date.getHours())}:${insertZero(date.getMinutes())}`;
}

function insertZero(number) {
	return Number(number) < 10 ? `0${number}` : number
}

function getNumberAndClassification(number, classification) {
	return classification === "Triagem" ? classification : `${number} (${classification})`
}

function insertRegisterOnTable(dataElements, index) {
	const tr = document.createElement("tr");
	const {numberAndClassification, name, requestDate, requester} = dataElements;

	tr.innerHTML = `
		<td>${numberAndClassification}</td>
		<td>${name}</td>
		<td>${requester}</td>
		<td>${requestDate}</td>
		<td>
			<a href="#" class="action-btn save-item"> <i class="fa fa-folder"></i> </a>
			<a href="#" class="action-btn delete-item"> <i class="fa fa-trash"></i> </a>
		</td>
	`	

	tbodyRegistersEl.appendChild(tr);

	const actionButtons = tr.querySelectorAll('.action-btn');
	addEventListenerInActionButtons(actionButtons, index);
}

function saveInLS(data) {

	if(localStorage.getItem('registers') !== null ) {

		let registers = JSON.parse(localStorage.getItem('registers'));

		let items = [...registers, data];
		localStorage.setItem('registers', JSON.stringify(items));
		
	} else {
		data = [data];
		localStorage.setItem('registers', JSON.stringify(data));
	}	
}

function renderRegisters() {
	if(localStorage.getItem('registers')) {
		
		const registers = JSON.parse(localStorage.getItem('registers'));
		tbodyRegistersEl.innerHTML = ""

		registers.forEach( (register, index) => {

			//se não houver uma data de devolução, insira o registro na tabela
			if(!register.devolutionDate) {
				insertRegisterOnTable(register, index);
			}
		});

		return registers;
	}
	return;
}

function verifyIfExists(numberAndClassification, name) {

	let errorMessage = ''
	const defaultErrorMessage = (requester) => `Você não pode solicitar esta pasta, porque ${requester} ainda não a devolveu!`;

	const registersUpdated = JSON.parse(localStorage.getItem('registers'));

	if(registersUpdated) {
		registersUpdated.forEach( register => {
			
			if(register.numberAndClassification === numberAndClassification && !register.devolutionDate) {

				if(register.numberAndClassification === "Triagem" &&  numberAndClassification === "Triagem") {

					if(treatedName(name) === treatedName(register.name)) {
						
						errorMessage = defaultErrorMessage(register.requester);
					}

				} else {

					errorMessage = defaultErrorMessage(register.requester);
				}
			}
		})

	}

	return errorMessage;
}

function showDialogMessage(text, color) {
	dialogMessage.innerText = text;
	dialogMessage.style.background = color;
	dialogMessage.style.opacity = 1;
	setTimeout(() => {
		dialogMessage.style.opacity = 0;
	}, 4000);
}

function addEventListenerInActionButtons(actionButtons, index) {
	actionButtons.forEach( actionButton => {
		actionButton.addEventListener('click', e => {
			e.preventDefault();

			if(actionButton.classList.contains('delete-item')) {
				removeRegister(index);
				showDialogMessage('Registro removido! Este não será armazenado no histórico.', 'orange');
			} else {
				saveRegister(index);	
				showDialogMessage('Registro salvo com sucesso!.', '#008b07');
			}
		})
	})
}

function treatedName(name) {
	return removeAcento(name.trim().toLowerCase());
}

function removeAcento (text)
{       
    text = text.toLowerCase();                                                         
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replace(new RegExp('[Ç]','gi'), 'c');
    return text;                 
}

function removeRegister(index) {
	
	const registers = getRegisters();
	registers.splice(index, 1);
	updateRegisters(registers);
}

function saveRegister(index) {
	const registers = getRegisters();
	registers[index].devolutionDate = formatDate(new Date());
	updateRegisters(registers);

}

const getRegisters = () => JSON.parse(localStorage.getItem("registers"));

function updateRegisters(registers) {
	localStorage.setItem('registers', JSON.stringify(registers));
	renderRegisters();
}