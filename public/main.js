// Sélectionnez les éléments HTML nécessaires
let errorMsg = document.querySelector(".errorMsg"); // Div pour afficher les messages d'erreur
let first_name = "";
let lastName = "";
let mail = "";
let phone = "";
let imagePath = "";
let campusLocation = "";

// Définissez les endpoints pour les requêtes
const endpoint = "https://zone01normandie.org/api/auth/signin"; // Point de terminaison pour l'authentification
const profile = `
    user {
        attrs
        campus
    }
`; // Requête GraphQL pour obtenir le profil de l'utilisateur

const skill_go = `user {
    transactions(where: {type: {_eq: "skill_go"}} order_by: {amount: asc}) {
        createdAt
        amount
        type
        path
    }
}`; // Requête GraphQL pour obtenir les compétences de l'utilisateur

const requêteXp = "user {xps {amount event{createdAt}} }"; // Requête GraphQL pour obtenir l'expérience de l'utilisateur
const auditRatio =
    "user { audits(order_by: {createdAt: asc}, where: {grade: {_is_null: false}}) { grade createdAt } }"; // Requête GraphQL pour obtenir le ratio d'audit de l'utilisateur

// Écoutez l'événement de soumission du formulaire
document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Empêchez la soumission du formulaire

    // Récupérez le nom d'utilisateur et le mot de passe saisis par l'utilisateur
    let username = document.querySelector(".name").value;
    let password = document.querySelector(".password").value;

    // Vérifiez si le nom d'utilisateur ou le mot de passe est vide
    if (username == "" || password == "") {
        errorMsg.style.display = "block";
        return;
    }

    // Encodez les informations d'identification en base64
    const base64 = btoa(`${username}:${password}`);

    // Effectuez une demande pour obtenir un token JWT
    const tokken = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Basic ${base64}`,
        },
    })
        .then((response) => response.json())
        .then((tokken) => {
            // Stockez le token JWT dans le stockage local (localStorage)
            localStorage.setItem("tokken", tokken);
            return tokken;
        });

    // Effectuez une demande pour récupérer les informations de profil
    await fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokken}`,
        },
        body: JSON.stringify({
            query: `query { ${profile} }`,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            // Récupérez les données du profil
            first_name = data.data.user[0].attrs.firstName;
            lastName = data.data.user[0].attrs.lastName;
            mail = data.data.user[0].attrs.email;
            phone = data.data.user[0].attrs.Phone;
            imagePath = data.data.user[0].attrs.image;
            campusLocation = data.data.user[0].campus;
        });

    // Effectuez d'autres demandes de données (auditRatio, xpsData, SkillData) ici...

    // Si une erreur survient lors de la connexion
    if (tokken.error) {
        errorMsg.innerHTML = "Identifiant ou mot de passe incorrect";
        errorMsg.style.display = "block";
        return;
    } else {
        // Affichez les informations du profil de l'utilisateur
        document.querySelector("body").style.height = "100%";
        document.querySelector(".loginFormDiv").style.display = "none";
        usernameTitle = document.querySelector(".usernameTitle");
        document.querySelector(".profileDiv").style.display = "flex";
        document.querySelector(".imagePathing").src = imagePath;
        document.querySelector(".userEmail").innerHTML =
            "<span class='Span'>" + "Adresse mail: " + "</span>" + mail;
        document.querySelector(".userPhoneNumber").innerHTML =
            "<span class='Span'>" + "Telephone: " + "</span>" + phone;
        document.querySelector(".userCampus").innerHTML =
            "<span class='Span'>" + "Campus: " + "</span>" + campusLocation;
        usernameTitle.innerHTML = first_name + " " + lastName;
    }
});
