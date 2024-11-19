// Importar as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCauUhZK1GtjB9tdJv2e8OVSGKALtH-j6s",
    authDomain: "natal-b3fab.firebaseapp.com",
    projectId: "natal-b3fab",
    storageBucket: "natal-b3fab.firebasestorage.app",
    messagingSenderId: "245590565426",
    appId: "1:245590565426:web:d6a87bf17c07b6048d122b",
    measurementId: "G-PK5K8MPHYT",
    databaseURL: "https://natal-b3fab-default-rtdb.firebaseio.com/"  // URL do seu Firebase Realtime Database
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Lista de participantes
const participantes = ["Maida", "Wesley", "Bryan", "Erick", "Emily", "Kauanny", "Alcione"];

// Função para realizar o sorteio
async function realizarSorteio() {
    const nomeUsuario = document.getElementById('nome').value.trim();

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

    const sorteioRef = ref(database, 'sorteios');
    const snapshot = await get(sorteioRef);

    if (snapshot.exists() && snapshot.val()[nomeUsuario]) {
        const sorteadoAnterior = snapshot.val()[nomeUsuario];
        const erroDiv = document.getElementById('erro');
        erroDiv.textContent = "Você já realizou o sorteio! Você tirou " + sorteadoAnterior + ".";
        erroDiv.style.display = 'block';
        return;
    }

    const erroDiv = document.getElementById('erro');
    erroDiv.style.display = 'none';

    let sorteados = snapshot.exists() ? new Set(Object.values(snapshot.val())) : new Set();
    let nomesDisponiveis = participantes.filter(
        nome => nome !== nomeUsuario && !sorteados.has(nome)
    );

    if (["Maida", "Emily"].includes(nomeUsuario)) {
        nomesDisponiveis = nomesDisponiveis.filter(
            nome => nome !== "Bryan" && nome !== "Erick"
        );
    }

    if (nomesDisponiveis.length === 0) {
        alert("Não há mais nomes disponíveis para sortear.");
        return;
    }

    const sorteado = nomesDisponiveis[Math.floor(Math.random() * nomesDisponiveis.length)];

    try {
        await update(ref(database, 'sorteios'), { [nomeUsuario]: sorteado });
        mostrarResultado(nomeUsuario, sorteado);
    } catch (error) {
        console.error("Erro ao salvar o sorteio: ", error);
    }
}

// Função para salvar o sorteio no Firebase
async function salvarSorteio(nomeUsuario, sorteado) {
    const sorteioRef = ref(database, 'sorteios/' + nomeUsuario);
    try {
        await set(sorteioRef, sorteado);
        console.log("Sorteio salvo com sucesso!");
        mostrarResultado(nomeUsuario, sorteado);
    } catch (error) {
        console.error("Erro ao salvar sorteio: ", error);
    }
}

// Função para mostrar o resultado do sorteio apenas para o usuário
function mostrarResultado(nomeUsuario, sorteado) {
    const resultadoDiv = document.getElementById('resultado');
    let resultadoHTML = '';

    if (sorteado) {
        resultadoHTML = `<p>${nomeUsuario} tirou ${sorteado}</p>`;
    } else {
        resultadoHTML = '<p>Algo deu errado ao tentar mostrar o seu sorteio.</p>';
    }

    resultadoDiv.innerHTML = resultadoHTML;
    resultadoDiv.style.display = 'block';
}

// Vincular o evento de clique ao botão
document.getElementById('sortearButton').addEventListener('click', realizarSorteio);
