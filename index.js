const comparisonForm = document.querySelector(".comparisonForm");
const personSelect = comparisonForm.person;
const neightborsSize = comparisonForm.neightbors;
const resultSection = document.querySelector(".comparisonForm__results");
const resultGraphicSection = document.querySelector(".comparisonForm__graphic");

let url = './data/baseDeDatos3.csv';
let result = 0;
let data = [];
let nameList = [];
let neightborsList = [];

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
    const neightborNumber = Number.parseInt(neightborsSize.value);
    console.log(neightborNumber);
    neightborsList = [];
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
    sortedList = getSortNeightbors(similarityList);
    neightborsList = sortedList.splice(0, neightborNumber + 1);
    renderResult(neightborsList);
    console.log(neightborsList)
    renderGraphic(neightborsList)
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

function getSortNeightbors(list) {
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
        listItem.innerHTML = `${elem.Nombre}: ${elem.cosineSimilarity.toFixed(2)}`
        resultSection.appendChild(listItem)
    })
}

function renderGraphic(list) {
    resultGraphicSection.innerHTML = "";
    let copy = [...list];
    copy.forEach((elem, i) => {
        const iconItem = document.createElement("div");
        iconItem.classList.add("comparisonForm__icon");
        if(i === 0) {
            iconItem.classList.add("comparisonForm__icon--first")
        }
        let substract = 100 - getCosineSimilarityToPercent(elem.cosineSimilarity);
        iconItem.style.left = `${substract}%`;
        iconItem.innerHTML = 
        `
        <p>${elem.Nombre}</p>
        <p>${getCosineSimilarityToPercent(elem.cosineSimilarity)}%</p>
        `
        resultGraphicSection.appendChild(iconItem);
    })
}

function getCosineSimilarityToPercent(value) {
    return value.toFixed(2) * 100;
}