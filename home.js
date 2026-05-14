let cardParaRemover = null;
let modoOrdenacao = "original";
let cardsDB = {}
let jogoAtual = null; // variável global para rastrear o jogo atual
let scrollAnterior = 0;

function mostrar(categoria) {

    let todas = document.querySelectorAll(".categoria");

    todas.forEach(secao => {
        secao.style.display = "none";
    });

    document.getElementById(categoria).style.display = "block";

    localStorage.setItem("categoria", categoria);

    carregarFavoritos(categoria);
}

function abrirDetalhes(id) {

    scrollAnterior = window.scrollY;
    

    let jogo = cardsDB[id];
    atualizarOpcoesStatus(jogo.categoria);

    jogoAtual = id;

    document.getElementById("titulo").innerText = jogo.titulo;

    document.getElementById("descricao").innerText = jogo.descricao;

    document.getElementById("imagem").src = jogo.imagem;

    // BANNER
    let banner = document.getElementById("banner-fundo");

    if (banner) {
        banner.style.backgroundImage = `url('${jogo.imagem}')`;
    }

    document.getElementById("detalhes").style.display = "flex";

    atualizarBotaoFavorito();

    carregarStatus();

}

function favoritar() {

    carregarFavoritosDB(function(favoritos) {

        let existe =
            favoritos.find(f => f.id === jogoAtual);

        if (existe) {

            removerFavorito(jogoAtual, atualizarUIFavoritos);

            mostrarFeedback(
                "Removido dos favoritos ❌",
                "red"
            );

        } else {

            salvarFavorito(jogoAtual, atualizarUIFavoritos);

            mostrarFeedback(
                "Adicionado aos favoritos ⭐",
                "green"
            );
        }
    });
}

function carregarFavoritos(categoriaAtual) {

    if (!categoriaAtual) {
        categoriaAtual =
            localStorage.getItem("categoria") || "games";
    }

    let container =
        document.getElementById("lista-favoritos");

    container.innerHTML = "";

    carregarFavoritosDB(function(favoritos) {

        favoritos.forEach(favorito => {

            let jogo = cardsDB[favorito.id];

            if (!jogo) return;

            if (jogo.categoria !== categoriaAtual) return;

            let status =
                JSON.parse(localStorage.getItem("status")) || {};

            let statusAtual = status[jogo.id];

            let card = `
                <div class="card"
                    data-id="${jogo.id}"
                    onclick="abrirDetalhes('${jogo.id}')">

                    <img src="${jogo.imagem}">

                    ${statusAtual ? `
                        <span class="badge ${statusAtual}">
                            ${formatarStatus(statusAtual)}
                        </span>
                    ` : ""}

                    <div class="overlay">

                        <h3>${jogo.titulo}</h3>

                        <button onclick="event.stopPropagation();
                            abrirDetalhes('${jogo.id}')">
                            ▶ Abrir
                        </button>

                        <button onclick="event.stopPropagation(); favoritarDireto('${jogo.id}')">

                            ${favoritosDB.find(f => f.id === jogo.id)
                                ? "❌"
                                : "⭐"}

                        </button>
                    </div>
                </div>
            `;

            container.innerHTML += card;
        });
    });
}

function atualizarBotaoFavorito() {

    carregarFavoritosDB(function(favoritos) {

        let botao =
            document.getElementById("btnfavorito");

        let existe = favoritos.find(
            f => f.id === jogoAtual
        );

        if (existe) {

            botao.innerText =
                "❌ Remover dos favoritos";

        } else {

            botao.innerText =
                "⭐ Adicionar aos favoritos";
        }
    });
}

function mostrarFeedback(texto, cor) {
    let msg = document.getElementById("feedback");


    msg.innerText = texto;
    msg.style.color = cor;
    msg.style.opacity = "1";

    setTimeout(() => {
        msg.style.opacity = "0";
        msg.innerText = "";
    }, 3000);
}

function salvarStatus() {
    let status = JSON.parse(localStorage.getItem("status")) || {};

    let select = document.getElementById("status");

    status[jogoAtual] = select.value;

    localStorage.setItem("status", JSON.stringify(status));

    mostrarFeedback("Status salvo 🎯", "blue");

    atualizarStatusNosCards();
}

function carregarStatus() {
    let status = JSON.parse(localStorage.getItem("status")) || {};

    let select = document.getElementById("status");

    select.value = status[jogoAtual] || "";
}

function formatarStatus(status) {
    if (status === "jogando") return "🎮 Jogando";
    if (status === "concluido") return "✅ Concluído";
    if (status === "dropado") return "❌ Dropado";
    if (status === "planejando") return "📅 Planejando";
    if (status === "platinado") return "🏆 Platinado";
    if (status === "assistindo") return "🍿 Assistindo";
    if (status === "assistido") return "✅ Assistido";

    if (status === "finalizada") return "✅ Finalizada";

    if (status === "lendo") return "📖 Lendo";
    if (status === "lido") return "✅ Lido";
    if (status === "abandonado") return "❌ Abandonado";
    return "";

}

function atualizarStatusNosCards() {


    let status = JSON.parse(localStorage.getItem("status")) || {};

    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        let id = card.dataset.id;
        if (!id) return;

        let statusAtual = status[id];

        // remove badge antiga
        let antiga = card.querySelector(".badge");
        if (antiga) antiga.remove();

        if (statusAtual) {
            let badge = document.createElement("span");
            badge.className = "badge " + statusAtual;
            badge.innerText = formatarStatus(statusAtual);

            card.appendChild(badge);
        }
    });

}

window.abrirDetalhes = abrirDetalhes;
window.favoritar = favoritar;
window.mostrar = mostrar;
window.fecharDetalhes = fecharDetalhes;

function favoritarDireto(id) {
    jogoAtual = id; // define qual jogo está sendo usado
    favoritar();
}

document.addEventListener("DOMContentLoaded", function () {

    document
    .getElementById("cancelar-remocao")
    .addEventListener("click", function () {

        document.getElementById(
            "modal-confirmacao"
        ).style.display = "none";
    });

    document
    .getElementById("confirmar-remocao")
    .addEventListener("click", function () {

        removerCard(cardParaRemover);

        document.getElementById(
            "modal-confirmacao"
        ).style.display = "none";
    });

    document.body.classList.add("loaded");

});

function fecharDetalhes() {
    document.getElementById("detalhes").style.display = "none";
    window.scrollTo({
        top: scrollAnterior,
        behavior: "auto"
    });
}

function atualizarOpcoesStatus(categoria) {

    let select = document.getElementById("status");

    select.innerHTML = "";

    let opcoes = [];

    if (categoria === "games") {
        opcoes = [
            ["", "Sem status"],
            ["jogando", "🎮 Jogando"],
            ["concluido", "✅ Concluido"],
            ["dropado", "❌ Dropado"],
            ["platinado", "🏆 Platinado"],
            ["planejando", "📅 Planejando"]
        ];
    }

    else if (categoria === "filmes") {
        opcoes = [
            ["", "Sem status"],
            ["assistindo", "🍿 Assistindo"],
            ["assistido", "✅ Assistido"],
            ["dropado", "❌ Dropado"],
            ["planejando", "📅 Planejando"]
        ];
    }

    else if (categoria === "series") {
        opcoes = [
            ["", "Sem status"],
            ["assistindo", "🍿 Assistindo"],
            ["finalizada", "✅ Finalizada"],
            ["dropado", "❌ Dropada"],
            ["planejando", "📅 Planejando"]
        ];
    }

    else if (categoria === "livros") {
        opcoes = [
            ["", "Sem status"],
            ["lendo", "📖 Lendo"],
            ["lido", "✅ Lido"],
            ["abandonado", "❌ Abandonado"],
            ["planejando", "📅 Planejando"]
        ];
    }

    opcoes.forEach(([valor, texto]) => {

        let option = document.createElement("option");

        option.value = valor;
        option.textContent = texto;

        select.appendChild(option);
    });
}

function toggleCategoria(id) {

    let categoria = document.querySelector(`#${id} .lista`);

    if (categoria.style.display === "none") {

        categoria.style.display = "grid";

    } else {

        categoria.style.display = "none";
    }
}

function ordenarCategoria(categoria, tipo) {

    let lista =
        document.querySelector(`#${categoria} .lista`);

    let cards = Array.from(
        lista.querySelectorAll(".card")
    );

    cards = cards.filter(card =>
        !card.classList.contains("add-card")
    );

    if (tipo === "az") {

        cards.sort((a, b) => {

            let nomeA =
                a.querySelector("h3")?.innerText || "";

            let nomeB =
                b.querySelector("h3")?.innerText || "";

            return nomeA.localeCompare(nomeB);
        });
    }

    else if (tipo === "original") {

        cards.sort((a, b) => {

            return Number(a.dataset.ordem || 0) -
                   Number(b.dataset.ordem || 0);
        });
    }

    cards.forEach(card => {
        lista.appendChild(card);
    });
}

function abrirFormulario() {

    document.getElementById("overlay-form").style.display = "flex";
}

function fecharFormulario() {

    document.getElementById("novoTitulo").value = "";

    document.getElementById("novaImagem").value = "";

    document.getElementById("novaDescricao").value = "";

    document.getElementById("overlay-form").style.display = "none";
}

function renderizarCard(card) {

    cardsDB[card.id] = card;

    let lista = document.querySelector(`#${card.categoria} .lista`);

    if (!lista) return;

    let novoCard = document.createElement("div");

    novoCard.className = "card";

    novoCard.dataset.id = card.id;

    novoCard.onclick = () => abrirDetalhes(card.id);

    let status = JSON.parse(localStorage.getItem("status")) || {};

    let statusAtual = status[card.id];

    novoCard.innerHTML = `
    <div class="menu-card">

        <button class="menu-btn"
            onclick="event.stopPropagation();
            toggleMenu(this)">

            ⋮
        </button>

        <div class="menu-opcoes">

            <button onclick="
                event.stopPropagation();
                confirmarRemocao('${card.id}')
            ">
                🗑 Remover
            </button>

        </div>
    </div>
    <img src="${card.imagem}">

    ${statusAtual ? `
        <span class="badge ${statusAtual}">
            ${formatarStatus(statusAtual)}
        </span>
    ` : ""}

    <div class="overlay">

        <h3>${card.titulo}</h3>

        <button onclick="event.stopPropagation(); abrirDetalhes('${card.id}')">
            ▶ Abrir
        </button>

        <button onclick="event.stopPropagation(); favoritarDireto('${card.id}')">

            ${favoritosDB.find(f => f.id === card.id)
            ? "❌"
            : "⭐"}

        </button>
    </div>
`;

    lista.appendChild(novoCard);

}

function criarCard() {

    let titulo = document.getElementById("novoTitulo").value;

    let imagem = document.getElementById("novaImagem").value;

    let descricao = document.getElementById("novaDescricao").value;

    let categoria = document.getElementById("novaCategoria").value;

    let novoCard = {

        id: crypto.randomUUID(),

        titulo,
        imagem,
        descricao,
        categoria,
        criadoEm: Date.now()
    };

    adicionarCard(novoCard);

    renderizarCard(novoCard);

    fecharFormulario();
    mostrarFeedback("Card adicionado ✅","green");
}

function atualizarUIFavoritos() {

    carregarFavoritosDB(function() {

        let categoriaAtual =
            localStorage.getItem("categoria") || "games";

        carregarFavoritos(categoriaAtual);

        atualizarBotaoFavorito();

        atualizarIconesFavoritos();
    });
}

function atualizarIconesFavoritos() {

    document.querySelectorAll(".card").forEach(card => {

        let id = card.dataset.id;

        let botao =
            card.querySelector(".overlay button:last-child");

        if (!botao) return;

        let existe = favoritosDB.find(
            f => f.id === id
        );

        botao.innerText =
            existe ? "❌" : "⭐";
    });
}

function toggleMenu(botao) {

    let menu =
        botao.parentElement.querySelector(".menu-opcoes");

    let aberto =
        menu.style.display === "block";

    document.querySelectorAll(".menu-opcoes")
        .forEach(menu => {
            menu.style.display = "none";
        });

    menu.style.display =
        aberto ? "none" : "block";
}

function confirmarRemocao(id) {

    cardParaRemover = id;

    document.getElementById(
        "modal-confirmacao"
    ).style.display = "flex";

    
}