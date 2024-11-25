// Referências aos elementos do DOM
const formGastos = document.getElementById('form-gastos');
const tabelaGastos = document.getElementById('tabela-gastos').querySelector('tbody');
const formEntradas = document.getElementById('form-entradas');
const tabelaEntradas = document.getElementById('tabela-entradas').querySelector('tbody');
const btnGraficos = document.getElementById('btn-graficos');
const secaoGraficos = document.getElementById('graficos');
const graficoGastosCanvas = document.getElementById('grafico-gastos');
const graficoEntradasCanvas = document.getElementById('grafico-entradas');

// Dados
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let entradas = JSON.parse(localStorage.getItem('entradas')) || [];
let graficoGastos, graficoEntradas;

// Atualizar tabelas
const atualizarTabela = (array, tabela) => {
    tabela.innerHTML = ''; // Limpa a tabela antes de preencher os dados
    array.forEach((item, index) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${item.nome}</td>
            <td>R$ ${item.valor.toFixed(2)}</td>
            <td>${item.data}</td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="editarItem(${index}, '${tabela.parentElement.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="removerItem(${index}, '${tabela.parentElement.id}')">Excluir</button>
            </td>
        `;
        tabela.appendChild(linha);
    });
};

// Salvar no Local Storage
const salvarDados = () => {
    localStorage.setItem('gastos', JSON.stringify(gastos));
    localStorage.setItem('entradas', JSON.stringify(entradas));
};

// Adicionar item
const adicionarItem = (event, array, tabela) => {
    event.preventDefault(); // Evita recarregar a página
    const nome = event.target[0].value.trim();
    const valor = parseFloat(event.target[1].value);
    const data = event.target[2].value;

    if (!nome || isNaN(valor) || !data) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    array.push({ nome, valor, data }); // Adiciona o item ao array
    salvarDados(); // Salva no Local Storage
    atualizarTabela(array, tabela); // Atualiza a tabela
    atualizarGraficos(); // Atualiza os gráficos
    event.target.reset(); // Reseta o formulário
};

// Remover item
const removerItem = (index, tabelaId) => {
    const array = tabelaId === 'tabela-gastos' ? gastos : entradas;
    array.splice(index, 1);
    salvarDados(); // Atualiza Local Storage
    atualizarTabela(array, document.getElementById(tabelaId).querySelector('tbody'));
    atualizarGraficos(); // Atualiza gráficos
};

// Editar item
const editarItem = (index, tabelaId) => {
    const array = tabelaId === 'tabela-gastos' ? gastos : entradas;
    const item = array[index];
    const novoNome = prompt('Novo Nome:', item.nome) || item.nome;
    const novoValor = parseFloat(prompt('Novo Valor:', item.valor)) || item.valor;
    const novaData = prompt('Nova Data (aaaa-mm-dd):', item.data) || item.data;

    if (novoNome && !isNaN(novoValor) && novaData) {
        array[index] = { nome: novoNome, valor: novoValor, data: novaData };
        salvarDados(); // Atualiza Local Storage
        atualizarTabela(array, document.getElementById(tabelaId).querySelector('tbody'));
        atualizarGraficos(); // Atualiza gráficos
    }
};

// Atualizar gráficos
const atualizarGraficos = () => {
    if (graficoGastos) graficoGastos.destroy();
    if (graficoEntradas) graficoEntradas.destroy();

    if (gastos.length > 0) {
        graficoGastos = new Chart(graficoGastosCanvas, {
            type: 'doughnut',
            data: {
                labels: gastos.map(item => item.nome),
                datasets: [{
                    data: gastos.map(item => item.valor),
                    backgroundColor: gastos.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16)),
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    if (entradas.length > 0) {
        graficoEntradas = new Chart(graficoEntradasCanvas, {
            type: 'doughnut',
            data: {
                labels: entradas.map(item => item.nome),
                datasets: [{
                    data: entradas.map(item => item.valor),
                    backgroundColor: entradas.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16)),
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};

// Exibir ou esconder gráficos
btnGraficos.addEventListener('click', () => {
    if (secaoGraficos.style.display === 'none' || secaoGraficos.style.display === '') {
        secaoGraficos.style.display = 'block';
        atualizarGraficos(); // Atualiza gráficos quando a seção for aberta
    } else {
        secaoGraficos.style.display = 'none'; // Fecha os gráficos
    }
});

// Inicialização
const inicializar = () => {
    gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    entradas = JSON.parse(localStorage.getItem('entradas')) || [];

    // Atualiza as tabelas
    atualizarTabela(gastos, tabelaGastos);
    atualizarTabela(entradas, tabelaEntradas);

    // Inicializa a seção de gráficos como oculta
    secaoGraficos.style.display = 'none';
};

// Inicializa os dados e tabelas
inicializar();

// Adicionar listeners aos formulários
formGastos.addEventListener('submit', (e) => adicionarItem(e, gastos, tabelaGastos));
formEntradas.addEventListener('submit', (e) => adicionarItem(e, entradas, tabelaEntradas));


const exportarCSV = (gastos, entradas, nomeArquivo) => {
    // Cria o cabeçalho do CSV
    const cabecalho = "Tipo,Nome,Valor,Data";
    
    // Adiciona os dados de gastos e entradas, com a coluna "Tipo"
    const dadosGastos = gastos.map(item => `Gasto,${item.nome},${item.valor.toFixed(2)},${item.data}`);
    const dadosEntradas = entradas.map(item => `Entrada,${item.nome},${item.valor.toFixed(2)},${item.data}`);
    
    // Junta o cabeçalho e os dados
    const csv = [cabecalho, ...dadosGastos, ...dadosEntradas].join('\n');
    
    // Cria o arquivo e baixa
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeArquivo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};

document.getElementById('btn-planilha').addEventListener('click', () => {
    exportarCSV(gastos, entradas, 'controle_financeiro');
});