const comparisonForm = document.querySelector(".comparisonForm");
const personSelect = comparisonForm.person;
const neighborsSize = comparisonForm.neighbors;
const resultSection = document.querySelector(".comparisonForm__results");
const resultGraphicSection = document.querySelector(".comparisonForm__graphic");

let url = './data/baseDeDatos3.csv';
let result = 0;
let data = [];
let nameList = [];
let neighborsList = [];

Papa.parse(url, {
    header: true,
    download: true,
    dynamicTyping: true,
    complete: function (results) {
        console.log(results.data);
        data = results.data;
        data.forEach(elem => {
            nameList.push(elem.Nombre);
        });
        renderNameOptions();
    }
});

comparisonForm.addEventListener('submit', event => {
    event.preventDefault();
    const personA = getPersonFromList(personSelect.value);
    const neighborNumber = Number.parseInt(neighborsSize.value);
    neighborsList = [];
    let similarityList = [];
    let sortedList = [];

    for (let i = 0; i < data.length; i++) {
        const personB = data[i];

        let dotProduct = getDotProduct(personA, personB);
        let magnitudeA = getMagnitude(personA);
        let magnitudeB = getMagnitude(personB);
        let cosineSimilarity = getCosineSimilarity(dotProduct, magnitudeA, magnitudeB);

        similarityList.push({
            ...personB,
            cosineSimilarity: cosineSimilarity
        })
    }

    sortedList = getSortneighbors(similarityList);
    neighborsList = sortedList.splice(0, neighborNumber + 1);
    renderResult(neighborsList);
    renderGraphic(neighborsList);
    handleItemHover();
})

function renderNameOptions() {
    nameList.forEach(elem => {
        const optionsElem = document.createElement("option");
        optionsElem.innerText = elem;
        optionsElem.value = elem;
        personSelect.appendChild(optionsElem);
    });
}

function getPersonFromList(value) {
    let person = data.find(elem => {
        return elem.Nombre == value;
    });
    return person;
}

function getDotProduct(elemA, elemB) {
    let dotProduct = 0;
    let elemProps = Object.keys(elemA)
    for (let i = 1; i < elemProps.length; i++) {
        let prop = elemProps[i];
        dotProduct += (elemA[prop] * elemB[prop]);
    }
    return dotProduct;
}

function getMagnitude(elem) {
    let magnitude = 0;
    let elemProps = Object.keys(elem);
    for (let i = 1; i < elemProps.length; i++) {
        let prop = elemProps[i];
        magnitude += Math.pow(elem[prop], 2);
    }
    return Math.sqrt(magnitude);
}

function getCosineSimilarity(dotProduct, magnitudeA, magnitudeB) {
    let cosineSimilarity = dotProduct / (magnitudeA * magnitudeB);
    return cosineSimilarity;
}

function getSortneighbors(list) {
    let copy = list.sort((a, b) => {
        return b.cosineSimilarity - a.cosineSimilarity;
    })
    return copy;
}

function renderResult(list) {
    resultSection.innerHTML = "";
    let copy = [...list].splice(1, list.length);
    copy.forEach(elem => {
        const listItem = document.createElement("li");
        listItem.classList.add("comparisonForm__li");
        listItem.innerHTML = `${elem.Nombre}: ${getCosineSimilarityToPercent(elem.cosineSimilarity)}%`
        resultSection.appendChild(listItem)
    })
}

function renderGraphic(list) {
    resultGraphicSection.innerHTML = "";
    let copy = [...list];
    let multiplier = 1.75;

    copy.forEach((elem, i) => {
        const iconItem = document.createElement("div");
        iconItem.classList.add("comparisonForm__icon");
        let substract = (100 - (getCosineSimilarityToPercent(elem.cosineSimilarity))) * multiplier;
        iconItem.classList.add(`${i === 0 ? "comparisonForm__icon--first" : "comparisonForm__icon"}`)
        iconItem.innerHTML =
            `
            <div class="arrow-left"></div>
            <section>
            <p>${elem.Nombre}${i !== 0 ? `: ${getCosineSimilarityToPercent(elem.cosineSimilarity)}%` : ""}</p>
            </section>
            `
        iconItem.style.zIndex = `${copy.length - i}`
        iconItem.style.top = `${substract}%`;
        resultGraphicSection.appendChild(iconItem);
    })
}

function getCosineSimilarityToPercent(value) {
    return Math.round(value * 100);
}

function handleItemHover() {
    const listHandlers = resultSection.querySelectorAll(".comparisonForm__li");
    const listTargets = resultGraphicSection.querySelectorAll(".comparisonForm__icon");

    listHandlers.forEach((elem, i) => {
        let prevZIndex = listTargets.length - (i + 1);

        elem.addEventListener("mouseover", () => {
            listTargets[i + 1].style.zIndex = 99;
            listTargets[i + 1].classList.add("comparisonForm__icon--focus");
        })

        elem.addEventListener("mouseout", () => {
            listTargets[i + 1].style.zIndex = prevZIndex;
            listTargets[i + 1].classList.remove("comparisonForm__icon--focus");
        })
    })
}