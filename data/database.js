let db;


const request = indexedDB.open("HgSLibrary", 1);

request.onupgradeneeded = function (event) {

    db = event.target.result;

    // tabela dos cards
    if (!db.objectStoreNames.contains("cards")) {

        let store = db.createObjectStore("cards", {
            keyPath: "id"
        });

        store.createIndex("categoria", "categoria", { unique: false });
    }

    if (!db.objectStoreNames.contains("favoritos")) {

    db.createObjectStore("favoritos", {
        keyPath: "id"
    });
    }

    if (!db.objectStoreNames.contains("status")) {

        db.createObjectStore("status", {
            keyPath: "id"
        });
    }
};

request.onsuccess = function (event) {

    db = event.target.result;

    let categoriaSalva =
    localStorage.getItem("categoria") || "games";

    mostrar(categoriaSalva);

    bancoVazio(function(vazio) {

    if (vazio) {

        importarJogosIniciais();

    } else {

        carregarCards();
    }
});
};

request.onerror = function () {
    console.error("Erro no banco");
};

function adicionarCard(card) {

    let transaction = db.transaction(["cards"], "readwrite");

    let store = transaction.objectStore("cards");

    store.add(card);
}

function carregarCards() {

    let transaction = db.transaction(["cards"], "readonly");

    let store = transaction.objectStore("cards");

    let request = store.getAll();

    request.onsuccess = function () {

        document.querySelectorAll(".lista").forEach(lista => {

            lista.innerHTML = `
                <div class="card add-card" onclick="abrirFormulario()">
                    <div class="add-content">
                        <span>+</span>
                        <p>Adicionar</p>
                    </div>
                </div>
            `;
        });

        let cards = request.result;

        if (modoOrdenacao === "az") {

            cards.sort((a, b) =>
                a.titulo.localeCompare(b.titulo)
            );
        }

        else if (modoOrdenacao === "original") {

            cards.sort((a, b) => {

                return (a.criadoEm || 0) -
                    (b.criadoEm || 0);
            });
        }

        cards.forEach(card => {

            renderizarCard(card);

        });

        let categoriaAtual =
            localStorage.getItem("categoria") || "games";

        carregarFavoritos(categoriaAtual);

        atualizarStatusNosCards();
        setTimeout(() => {

            document.getElementById("loading-screen").style.opacity = "0";

            setTimeout(() => {

                document
                .getElementById("loading-screen")
                .style.display = "none";

            }, 400);

        },1000);
    }    
}

function bancoVazio(callback) {

    let transaction = db.transaction(["cards"], "readonly");

    let store = transaction.objectStore("cards");

    let count = store.count();

    count.onsuccess = function () {

        callback(count.result === 0);
    };
}

function importarJogosIniciais() {

    let ordem = 0;

    for (let id in jogos) {

        adicionarCard({

            ...jogos[id],

            id: id,

            criadoEm: ordem++
        });
    }

    carregarCards();
}

function salvarFavorito(id, callback) {

    let transaction =
        db.transaction(["favoritos"], "readwrite");

    let store =
        transaction.objectStore("favoritos");

    store.put({ id });

    transaction.oncomplete = function () {

        if (callback) callback();
    };
}

function removerFavorito(id, callback) {

    let transaction =
        db.transaction(["favoritos"], "readwrite");

    let store =
        transaction.objectStore("favoritos");

    store.delete(id);

    transaction.oncomplete = function () {

        if (callback) callback();
    };
}

let favoritosDB = [];
function carregarFavoritosDB(callback) {

    let transaction = db.transaction(["favoritos"], "readonly");

    let store = transaction.objectStore("favoritos");

    let request = store.getAll();

    request.onsuccess = function () {

        favoritosDB = request.result;

        callback(request.result);
    };
}

function iconeFavorito(id) {

    let existe = favoritosDB.find(
        f => f.id === id
    );

    return existe ? "❌" : "⭐";
}

function removerCard(id) {

    let transaction =
        db.transaction(["cards"], "readwrite");

    let store =
        transaction.objectStore("cards");

    store.delete(id);

    let favoritosTransaction =
        db.transaction(["favoritos"], "readwrite");

    let favoritosStore =
        favoritosTransaction.objectStore("favoritos");

    favoritosStore.delete(id);

    transaction.oncomplete = function() {
        mostrarFeedback(
            "Card removido 🗑️",
            "red"
        );
        carregarCards();
    };
}