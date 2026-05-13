const STORAGE_KEY = 'kanban_data_v1';

// Dados iniciais de demonstração
const initialData = {
    "1": [
        {
            id: 'c1',
            title: 'Design do Produto',
            subCards: [
                { id: 'sc1', name: 'Criar Logo', desc: 'Precisa ser rosa neon com fundo transparente.', local: 'Figma', area: 'Design', tag: 'Urgente', done: false },
                { id: 'sc2', name: 'Aprovar Paleta', desc: 'Reunião de alinhamento sobre o Dark Mode.', local: 'Sala A', area: 'Direção', tag: 'Reunião', done: true }
            ]
        }
    ],
    "2": [
        {
            id: 'c2',
            title: 'Desenvolvimento',
            subCards: [
                { id: 'sc3', name: 'Setup Inicial', desc: 'Criar HTML, CSS e JS base.', local: 'VSCode', area: 'Front-end', tag: 'Dev', done: false }
            ]
        }
    ],
    "3": []
};

let boardData = {};
let currentEditContext = null;
let draggedItem = null;

function init() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            boardData = JSON.parse(savedData);
        } catch (e) {
            boardData = initialData;
        }
    } else {
        boardData = initialData;
        saveData();
    }

    renderBoard();

    // Listener de pesquisa em tempo real
    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderBoard(e.target.value.toLowerCase());
    });

    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModals();
        });
    });

    // Configurar Drag and Drop nas listas
    ['1', '2', '3'].forEach(colId => {
        const listEl = document.getElementById(`col-${colId}-list`);
        if (listEl) {
            listEl.addEventListener('dragover', (e) => dragOver(e, listEl));
            listEl.addEventListener('dragleave', (e) => dragLeave(e, listEl));
            listEl.addEventListener('drop', (e) => drop(e, colId, listEl));
        }
    });
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boardData));
}

function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function renderBoard(filter = '') {
    ['1', '2', '3'].forEach(colId => {
        const listEl = document.getElementById(`col-${colId}-list`);
        if (!listEl) return;
        listEl.innerHTML = '';

        if (!boardData[colId]) boardData[colId] = [];

        // Atualizar contadores
        const countEl = document.getElementById(`col-${colId}-count`);
        if (countEl) {
            const titles = { '1': 'B1', '2': 'P2', '3': 'P3' };
            countEl.innerText = `${titles[colId]} (${boardData[colId].length})`;
        }

        boardData[colId].forEach(card => {
            const cardMatches = card.title.toLowerCase().includes(filter);

            const filteredSubs = card.subCards.filter(sub => {
                return cardMatches ||
                    sub.name.toLowerCase().includes(filter) ||
                    (sub.desc && sub.desc.toLowerCase().includes(filter)) ||
                    (sub.tag && sub.tag.toLowerCase().includes(filter)) ||
                    (sub.area && sub.area.toLowerCase().includes(filter)) ||
                    (sub.local && sub.local.toLowerCase().includes(filter));
            });

            // Se tem filtro e o card não bate nem as subs batem, pula
            if (filter && !cardMatches && filteredSubs.length === 0) return;

            // Calcular progresso
            const totalSubs = card.subCards.length;
            const doneSubs = card.subCards.filter(s => s.done).length;
            const progressHTML = totalSubs > 0 ? `<div class="card-progress">${doneSubs}/${totalSubs} tarefas concluídas</div>` : '';

            // Criar Elemento Card
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.draggable = true;
            cardEl.ondragstart = (e) => dragStart(e, colId, card.id);
            cardEl.ondragend = dragEnd;

            let subsHTML = '';
            filteredSubs.forEach(sub => {
                subsHTML += `
                    <div class="sub-card">
                        <div class="sc-header">
                            <div class="sc-name-area">
                                <input type="checkbox" class="sc-checkbox" ${sub.done ? 'checked' : ''} onchange="toggleSubCardDone('${colId}', '${card.id}', '${sub.id}')">
                                <div class="sc-name ${sub.done ? 'done' : ''}">${sub.name}</div>
                            </div>
                            <div class="action-btns">
                                <button onclick="openSubCardModal('${colId}', '${card.id}', '${sub.id}')" title="Editar">✎</button>
                                <button onclick="deleteSubCard('${colId}', '${card.id}', '${sub.id}')" title="Excluir">×</button>
                            </div>
                        </div>
                        ${sub.desc ? `<div class="sc-desc">${sub.desc}</div>` : ''}
                        <div class="sc-meta">
                            ${sub.local ? `<span>📍 ${sub.local}</span>` : ''}
                            ${sub.area ? `<span>📂 ${sub.area}</span>` : ''}
                        </div>
                        <span class="sc-tag">${sub.tag}</span>
                    </div>
                `;
            });

            cardEl.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${card.title}</div>
                    <div class="action-btns">
                        <button onclick="openCardModal('${colId}', '${card.id}')" title="Editar Card">✎</button>
                        <button onclick="deleteCard('${colId}', '${card.id}')" title="Excluir Card e filhos">×</button>
                    </div>
                </div>
                ${progressHTML}
                <div class="sub-card-list">
                    ${subsHTML}
                </div>
                <button class="add-sub-btn" onclick="openSubCardModal('${colId}', '${card.id}')">+ Adicionar Sub-Card</button>
            `;

            listEl.appendChild(cardEl);
        });
    });
}

/* Modais e Controles */

function closeModals() {
    document.getElementById('cardModal').classList.add('hidden');
    document.getElementById('subCardModal').classList.add('hidden');
    currentEditContext = null;
}

// Card Logic
function openCardModal(colId, cardId = null) {
    currentEditContext = { colId, cardId };

    const titleEl = document.getElementById('cardModalTitle');
    const inputName = document.getElementById('cardName');

    if (cardId) {
        titleEl.innerText = 'Editar Card';
        const card = boardData[colId].find(c => c.id === cardId);
        inputName.value = card ? card.title : '';
    } else {
        titleEl.innerText = 'Novo Card';
        inputName.value = '';
    }

    document.getElementById('cardModal').classList.remove('hidden');
    inputName.focus();
}

function saveCard() {
    const title = document.getElementById('cardName').value.trim();
    if (!title) {
        showToast('O nome do card é obrigatório.', 'error');
        return;
    }

    const { colId, cardId } = currentEditContext;

    if (cardId) {
        const card = boardData[colId].find(c => c.id === cardId);
        if (card) card.title = title;
        showToast('Card atualizado com sucesso!');
    } else {
        boardData[colId].push({
            id: generateId(),
            title: title,
            subCards: []
        });
        showToast('Card criado com sucesso!');
    }

    saveData();
    renderBoard();
    closeModals();
}

function deleteCard(colId, cardId) {
    if (confirm('Atenção: Você tem certeza que deseja excluir este card e todas as suas tarefas internas?')) {
        boardData[colId] = boardData[colId].filter(c => c.id !== cardId);
        saveData();
        renderBoard();
        showToast('Card removido com sucesso!');
    }
}

// Sub-Card Logic
function openSubCardModal(colId, cardId, subCardId = null) {
    currentEditContext = { colId, cardId, subCardId };

    const titleEl = document.getElementById('subCardModalTitle');

    // Reset Form
    document.getElementById('scName').value = '';
    document.getElementById('scDesc').value = '';
    document.getElementById('scLocal').value = '';
    document.getElementById('scArea').value = '';
    document.getElementById('scTag').value = '';

    if (subCardId) {
        titleEl.innerText = 'Editar Sub-Card';
        const card = boardData[colId].find(c => c.id === cardId);
        const sub = card.subCards.find(s => s.id === subCardId);

        if (sub) {
            document.getElementById('scName').value = sub.name;
            document.getElementById('scDesc').value = sub.desc || '';
            document.getElementById('scLocal').value = sub.local || '';
            document.getElementById('scArea').value = sub.area || '';
            document.getElementById('scTag').value = sub.tag;
        }
    } else {
        titleEl.innerText = 'Novo Sub-Card';
    }

    document.getElementById('subCardModal').classList.remove('hidden');
    document.getElementById('scName').focus();
}

function saveSubCard() {
    const name = document.getElementById('scName').value.trim();
    const tag = document.getElementById('scTag').value.trim();

    if (!name || !tag) {
        showToast('Os campos Nome da Tarefa e Tag Visual são obrigatórios!', 'error');
        return;
    }

    const desc = document.getElementById('scDesc').value.trim();
    const local = document.getElementById('scLocal').value.trim();
    const area = document.getElementById('scArea').value.trim();

    const { colId, cardId, subCardId } = currentEditContext;
    const card = boardData[colId].find(c => c.id === cardId);

    if (!card) return;

    const newSubCardData = { name, desc, local, area, tag };

    if (subCardId) {
        const subIndex = card.subCards.findIndex(s => s.id === subCardId);
        if (subIndex > -1) {
            card.subCards[subIndex] = { ...card.subCards[subIndex], ...newSubCardData };
        }
        showToast('Tarefa atualizada com sucesso!');
    } else {
        card.subCards.push({ id: generateId(), done: false, ...newSubCardData });
        showToast('Tarefa adicionada com sucesso!');
    }

    saveData();
    renderBoard();
    closeModals();
}

function deleteSubCard(colId, cardId, subCardId) {
    if (confirm('Remover esta tarefa definitivamente?')) {
        const card = boardData[colId].find(c => c.id === cardId);
        if (card) {
            card.subCards = card.subCards.filter(s => s.id !== subCardId);
            saveData();
            renderBoard();
            showToast('Tarefa removida!');
        }
    }
}

function toggleSubCardDone(colId, cardId, subCardId) {
    const card = boardData[colId].find(c => c.id === cardId);
    if (card) {
        const sub = card.subCards.find(s => s.id === subCardId);
        if (sub) {
            sub.done = !sub.done;
            saveData();
            renderBoard();
        }
    }
}

// Drag and Drop Logic
function dragStart(e, colId, cardId) {
    draggedItem = { colId, cardId };
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
    draggedItem = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function dragOver(e, listEl) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!listEl.classList.contains('drag-over')) {
        listEl.classList.add('drag-over');
    }
}

function dragLeave(e, listEl) {
    listEl.classList.remove('drag-over');
}

function drop(e, targetColId, listEl) {
    e.preventDefault();
    listEl.classList.remove('drag-over');

    if (!draggedItem) return;
    const { colId: sourceColId, cardId } = draggedItem;

    if (sourceColId === targetColId) return;

    const sourceCardIndex = boardData[sourceColId].findIndex(c => c.id === cardId);
    if (sourceCardIndex > -1) {
        // Move card
        const card = boardData[sourceColId].splice(sourceCardIndex, 1)[0];
        boardData[targetColId].push(card);
        saveData();
        renderBoard();
    }
}

// Backup Logic
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boardData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "kanban_backup.json");
    dlAnchorElem.click();
    showToast('Backup exportado com sucesso!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData["1"] && Array.isArray(importedData["1"])) {
                boardData = importedData;
                saveData();
                renderBoard();
                showToast('Backup importado com sucesso!');
            } else {
                showToast('Arquivo JSON inválido para este Kanban.', 'error');
            }
        } catch (error) {
            showToast('Erro ao ler o arquivo JSON.', 'error');
        }
        // Limpar o input para permitir importar o mesmo arquivo novamente
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Toasts
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Inicializar ao carregar o DOM
document.addEventListener('DOMContentLoaded', init);
