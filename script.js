// Importar as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCauUhZK1GtjB9tdJv2e8OVSGKALtH-j6s",
    authDomain: "natal-b3fab.firebaseapp.com",
    projectId: "natal-b3fab",
    storageBucket: "natal-b3fab.firebasestorage.app",
    messagingSenderId: "245590565426",
    appId: "1:245590565426:web:d6a87bf17c07b6048d122b",
    measurementId: "G-PK5K8MPHYT",
    databaseURL: "https://natal-b3fab-default-rtdb.firebaseio.com/"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Lista de participantes
const participantes = ["Maida", "Mimi","Rita", "Francisco","Celivane","Wesley", "Bryan", "Erick", "Emily", "Solange", "Rogério", "Alcione", "Noah"];

// Função para realizar o sorteio
async function realizarSorteio() {
    const nomeUsuario = document.getElementById('nome').value.trim();

    // Validação inicial
    if (!nomeUsuario) {
        alert("Por favor, insira seu nome.");
        return;
    }

    if (!participantes.includes(nomeUsuario)) {
        const erroDiv = document.getElementById('erro');
        erroDiv.textContent = "Seu nome não está na lista de participantes.";
        erroDiv.style.display = 'block';
        return;
    }

    // Verificar se o sorteio já foi realizado
    const sorteioRef = ref(database, 'sorteios');
    const snapshot = await get(sorteioRef);

    if (snapshot.exists() && snapshot.val()[nomeUsuario]) {
        const sorteadoAnterior = snapshot.val()[nomeUsuario];
        const erroDiv = document.getElementById('erro');
        erroDiv.textContent = `Você já realizou o sorteio! Você tirou ${sorteadoAnterior}.`;
        erroDiv.style.display = 'block';
        return;
    }

    // Limpar mensagens de erro
    const erroDiv = document.getElementById('erro');
    erroDiv.style.display = 'none';

    // Nomes já sorteados e disponíveis
    let sorteados = snapshot.exists() ? new Set(Object.values(snapshot.val())) : new Set();
    let nomesDisponiveis = participantes.filter(
        nome => nome !== nomeUsuario && !sorteados.has(nome)
    );

    // Restrições específicas para "Maida" e "Emily"
    if (["Maida", "Emily"].includes(nomeUsuario)) {
        nomesDisponiveis = nomesDisponiveis.filter(
            nome => nome !== "Bryan" && nome !== "Erick"
        );
    }

    // Caso não existam nomes disponíveis
    if (nomesDisponiveis.length === 0) {
        alert("Não há mais nomes disponíveis para sortear.");
        return;
    }

    // Realizar o sorteio
    const sorteado = nomesDisponiveis[Math.floor(Math.random() * nomesDisponiveis.length)];

    // Salvar o sorteio no Firebase
    try {
        await update(ref(database, 'sorteios'), { [nomeUsuario]: sorteado });
        mostrarResultado(nomeUsuario, sorteado);
    } catch (error) {
        console.error("Erro ao salvar o sorteio: ", error);
    }
}

// Função para mostrar o resultado do sorteio
function mostrarResultado(nomeUsuario, sorteado) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `<p>${nomeUsuario} tirou ${sorteado}</p>`;
    resultadoDiv.style.display = 'block';
}

// Associar a função ao botão
document.getElementById('sortearButton').addEventListener('click', realizarSorteio);
