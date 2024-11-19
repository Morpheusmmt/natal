// Importar as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js";

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
const participantes = ["Maida", "Bryan", "Erick", "Emily", "Kauanny", "Alcione"];
let sorteios = {};

// Função para realizar o sorteio
function realizarSorteio() {
    const nomeUsuario = document.getElementById('nome').value.trim();

    // Verificar se o nome foi inserido
    if (!nomeUsuario) {
        alert("Por favor, insira seu nome.");
        return;
    }

    // Verificar se o nome está na lista de participantes
    if (!participantes.includes(nomeUsuario)) {
        const erroDiv = document.getElementById('erro');
        erroDiv.textContent = "Seu nome não está na lista de participantes.";
        erroDiv.style.display = 'block';  // Exibe a mensagem de erro
        return;
    }

    // Verificar se o usuário já realizou o sorteio
    const sorteioRef = ref(database, 'sorteios/' + nomeUsuario);  // Referência para o sorteio de um usuário específico
    get(sorteioRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                // Se o sorteio já foi realizado, mostrar o resultado
                const sorteadoAnterior = snapshot.val();
                const erroDiv = document.getElementById('erro');
                erroDiv.textContent = "Você já realizou o sorteio! Você tirou " + sorteadoAnterior + ".";
                erroDiv.style.display = 'block';  // Exibe a mensagem de erro
                return;  // Retorna, não realizando outro sorteio
            }

            // Limpa a mensagem de erro caso o nome seja válido e o usuário não tenha sorteado
            const erroDiv = document.getElementById('erro');
            erroDiv.style.display = 'none';

            // Realiza o sorteio
            let nomesDisponiveis = [...participantes];
            let sorteados = new Set(); // Usamos um Set para garantir que ninguém seja sorteado duas vezes

            participantes.forEach(participante => {
                let sorteado;
                do {
                    sorteado = nomesDisponiveis[Math.floor(Math.random() * nomesDisponiveis.length)];
                } while (
                    sorteado === participante || // Não pode sortear a si mesmo
                    sorteados.has(sorteado) || // Não pode repetir sorteio
                    (["Maida", "Emily"].includes(participante) && (sorteado === "Bryan" || sorteado === "Erick")) // Restrições de quem pode ser sorteado
                );
                sorteios[participante] = sorteado;
                sorteados.add(sorteado); // Adiciona o sorteado ao Set para não ser sorteado novamente
                nomesDisponiveis = nomesDisponiveis.filter(nome => nome !== sorteado);
            });

            // Salva o sorteio individualmente para cada usuário
            salvarSorteio(nomeUsuario, sorteios[nomeUsuario]);  // Salva o sorteio do usuário específico
        })
        .catch((error) => {
            console.log("Erro ao verificar sorteio do usuário: ", error);
        });
}

// Função para salvar o sorteio no Firebase
function salvarSorteio(nomeUsuario, sorteado) {
    const sorteioRef = ref(database, 'sorteios/' + nomeUsuario);  // Referência para o sorteio de um usuário específico
    set(sorteioRef, sorteado)  // Salvando o sorteio do usuário
        .then(() => {
            console.log("Sorteio salvo com sucesso!");
            mostrarResultado(nomeUsuario, sorteado);  // Passando o nome do usuário e o sorteio dele
        })
        .catch((error) => {
            console.log("Erro ao salvar sorteio: ", error);
        });
}

// Função para mostrar o resultado do sorteio apenas para o usuário
function mostrarResultado(nomeUsuario, sorteado) {
    const resultadoDiv = document.getElementById('resultado');
    let resultadoHTML = ''; // Inicializando uma string vazia

    // Mostrar apenas o resultado para o usuário que fez o sorteio
    if (sorteado) {
        resultadoHTML = `<p>${nomeUsuario} tirou ${sorteado}</p>`;
    } else {
        resultadoHTML = '<p>Algo deu errado ao tentar mostrar o seu sorteio.</p>';
    }

    // Definir o HTML formatado
    resultadoDiv.innerHTML = resultadoHTML;
    resultadoDiv.style.display = 'block';
}

// Vinculando o evento de clique ao botão
document.getElementById('sortearButton').addEventListener('click', realizarSorteio);
